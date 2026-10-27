Set-StrictMode -Version 2.0
$script:PlayerAppId = 'apple-ipod-web-player'
$script:PlayerVersion = '0.3.1'

function Get-PlayerConfig {
    param([string]$Root, [int]$Port = 8765)
    $full = [IO.Path]::GetFullPath($Root).TrimEnd('\','/')
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $tag = ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($full.ToLowerInvariant())))).Replace('-','').Substring(0,16).ToLowerInvariant() }
    finally { $sha.Dispose() }
    $runtime = Join-Path $full '.runtime'
    [pscustomobject]@{ Root=$full; Port=$Port; AppId=$script:PlayerAppId; Version=$script:PlayerVersion; RootTag=$tag; Runtime=$runtime; StatePath=(Join-Path $runtime "player-$Port.json"); Url="http://localhost:$Port/v0.3.1/"; StatusUrl="http://localhost:$Port/__ipod/status" }
}

function Read-PlayerState {
    param($Config)
    try {
        if (-not [IO.File]::Exists($Config.StatePath)) { return $null }
        if ((Get-Item -LiteralPath $Config.StatePath).Length -gt 16384) { return $null }
        $state = [IO.File]::ReadAllText($Config.StatePath) | ConvertFrom-Json
        if ($state.AppId -ne $Config.AppId -or [int]$state.Port -ne $Config.Port) { return $null }
        if (-not [string]::Equals([IO.Path]::GetFullPath([string]$state.Root),$Config.Root,[StringComparison]::OrdinalIgnoreCase)) { return $null }
        if ([string]$state.InstanceId -notmatch '^[a-f0-9]{32}$') { return $null }
        return $state
    } catch { return $null }
}

function Write-PlayerState {
    param($Config, $State)
    [IO.Directory]::CreateDirectory($Config.Runtime) | Out-Null
    $temporary = $Config.StatePath + '.' + $State.InstanceId + '.tmp'
    [IO.File]::WriteAllText($temporary,($State | ConvertTo-Json -Depth 4),(New-Object Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $temporary -Destination $Config.StatePath -Force
}

function Remove-PlayerState {
    param($Config, [string]$InstanceId)
    $state = Read-PlayerState $Config
    if ($null -ne $state -and $state.InstanceId -eq $InstanceId) { Remove-Item -LiteralPath $Config.StatePath -Force -ErrorAction SilentlyContinue }
}

function Get-PlayerStatus {
    param([int]$Port = 8765, [int]$TimeoutMilliseconds = 1000)
    $response=$null
    $client=$null
    $handler=$null
    try {
        Add-Type -AssemblyName System.Net.Http
        $handler=New-Object Net.Http.HttpClientHandler
        $handler.UseProxy=$false
        $client=New-Object Net.Http.HttpClient($handler)
        $client.Timeout=[TimeSpan]::FromMilliseconds($TimeoutMilliseconds)
        $client.MaxResponseContentBufferSize=16384
        $client.DefaultRequestHeaders.Host="localhost:$Port"
        $client.DefaultRequestHeaders.TryAddWithoutValidation('Cache-Control','no-cache, no-store')|Out-Null
        $response=$client.GetAsync("http://127.0.0.1:$Port/__ipod/status").GetAwaiter().GetResult()
        if (-not $response.IsSuccessStatusCode) { return $null }
        $text=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        $data = $text | ConvertFrom-Json
        if ($data.appId -ne $script:PlayerAppId) { return $null }
        return $data
    } catch { return $null }
    finally { if ($null -ne $response) { $response.Dispose() }; if ($null -ne $client) { $client.Dispose() } elseif ($null -ne $handler) { $handler.Dispose() } }
}

function Get-PlayerCommandInfo {
    param([string]$CommandLine)
    if ([string]::IsNullOrWhiteSpace($CommandLine)) { return $null }
    # Never mistake a script path quoted inside another command/eval body for its entry point.
    if ($CommandLine -match '(?i)(?:^|\s)-(?:Command|EncodedCommand|EncodedArguments|C|EC)(?=\s|$)' -or $CommandLine -match '(?i)(?:^|\s)(?:-e|--eval|-p|--print)(?=\s|=|$)') { return $null }
    $match = [regex]::Match($CommandLine,'(?i)(?:^|\s)-File\s+(?:"(?<file>[^"]+)"|(?<file>\S+))')
    $kind = 'powershell'
    if (-not $match.Success) {
        $match = [regex]::Match($CommandLine,'(?i)(?:^|\s)(?:"(?<file>[^"]*server\.cjs)"|(?<file>\S*server\.cjs))(?=\s|$)')
        $kind = 'node'
    }
    if (-not $match.Success) { return $null }
    try { $file = [IO.Path]::GetFullPath($match.Groups['file'].Value) } catch { return $null }
    $portMatch = [regex]::Match($CommandLine,'(?i)(?:^|\s)--?Port\s+(?<port>\d+)(?=\s|$)')
    $port = 8765
    if ($portMatch.Success) { $port = [int]$portMatch.Groups['port'].Value }
    [pscustomobject]@{ File=$file; Port=$port; Transport=$kind }
}

function Test-PlayerProcess {
    param($Config, $State)
    try {
        $targetId = [int]$State.ProcessId
        if ($targetId -le 4 -or $targetId -eq $PID) { return $false }
        $process = Get-Process -Id $targetId -ErrorAction Stop
        if ($process.ProcessName -notin @('powershell','pwsh','node')) { return $false }
        if ($process.StartTime.ToUniversalTime().Ticks -ne [long]$State.StartTimeTicks) { return $false }
        $details = Get-CimInstance Win32_Process -Filter "ProcessId=$targetId" -OperationTimeoutSec 3 -ErrorAction Stop
        $info = Get-PlayerCommandInfo ([string]$details.CommandLine)
        if ($null -eq $info -or $info.Port -ne $Config.Port) { return $false }
        $expected = if ($info.Transport -eq 'node') { Join-Path $Config.Root 'server.cjs' } else { Join-Path $Config.Root 'Start-Player.ps1' }
        return [string]::Equals($info.File,$expected,[StringComparison]::OrdinalIgnoreCase)
    } catch { return $false }
}

function Find-PlayerLegacyProcess {
    param($Config)
    $parent = Split-Path -Parent $Config.Root
    $allowedRoots = @($Config.Root)
    if ((Split-Path -Leaf $parent) -eq 'versions') {
        $allowedRoots += @(Get-ChildItem -LiteralPath $parent -Directory | Where-Object { $_.Name -match '^v\d+\.\d+\.\d+$' } | ForEach-Object { $_.FullName })
    }
    $candidates = Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe' OR Name='node.exe'" -OperationTimeoutSec 3 -ErrorAction Stop
    foreach ($candidate in $candidates) {
        if ([int]$candidate.ProcessId -eq $PID) { continue }
        $info = Get-PlayerCommandInfo ([string]$candidate.CommandLine)
        if ($null -eq $info -or $info.Port -ne $Config.Port) { continue }
        foreach ($allowed in $allowedRoots) {
            $expected = if ($info.Transport -eq 'node') { Join-Path $allowed 'server.cjs' } else { Join-Path $allowed 'Start-Player.ps1' }
            if (-not [string]::Equals($info.File,$expected,[StringComparison]::OrdinalIgnoreCase)) { continue }
            try {
                $process = Get-Process -Id ([int]$candidate.ProcessId) -ErrorAction Stop
                $legacyConfig = Get-PlayerConfig -Root $allowed -Port $Config.Port
                $state = [pscustomobject]@{ ProcessId=$process.Id; StartTimeTicks=$process.StartTime.ToUniversalTime().Ticks.ToString(); Root=$allowed; InstanceId=''; Transport=$info.Transport }
                if (Test-PlayerProcess $legacyConfig $state) { [pscustomobject]@{ Config=$legacyConfig; State=$state } }
            } catch { }
            break
        }
    }
}

function Wait-PlayerExit {
    param([int]$TargetProcessId, [int]$Milliseconds = 4000)
    try { $process = Get-Process -Id $TargetProcessId -ErrorAction Stop; return $process.WaitForExit($Milliseconds) }
    catch { return $true }
}

function Stop-PlayerOwnedInstance {
    param($Config, $State)
    if (-not (Test-PlayerProcess $Config $State)) { throw 'Runtime state does not identify this player process. No process was terminated.' }
    $signalled = $false
    if ($State.Transport -eq 'powershell') {
        $expectedPrefix = 'Local\AppleIpodPlayer.' + $Config.RootTag + '.' + $Config.Port + '.'
        if ([string]$State.EventName -eq ($expectedPrefix + $State.InstanceId)) {
            $eventHandle = $null
            try { $eventHandle = [Threading.EventWaitHandle]::OpenExisting([string]$State.EventName); $eventHandle.Set() | Out-Null; $signalled = $true }
            catch { }
            finally { if ($null -ne $eventHandle) { $eventHandle.Dispose() } }
        }
    } elseif ($State.Transport -eq 'node' -and [string]$State.InstanceId -match '^[a-f0-9]{32}$') {
        [IO.File]::WriteAllText((Join-Path $Config.Runtime ('stop-' + $State.InstanceId + '.signal')),$State.InstanceId)
        $signalled = $true
    }
    $forced = $false
    if (-not $signalled -or -not (Wait-PlayerExit -TargetProcessId ([int]$State.ProcessId) -Milliseconds 4000)) {
        if (Test-PlayerProcess $Config $State) {
            Stop-Process -Id ([int]$State.ProcessId) -Force -ErrorAction Stop
            $forced = $true
        }
    }
    if (-not (Wait-PlayerExit -TargetProcessId ([int]$State.ProcessId) -Milliseconds 2000)) { throw 'The verified player process did not exit within the stop timeout.' }
    Remove-PlayerState $Config ([string]$State.InstanceId)
    [pscustomobject]@{ ProcessId=[int]$State.ProcessId; Forced=$forced }
}

Export-ModuleMember -Function Get-PlayerConfig,Read-PlayerState,Write-PlayerState,Remove-PlayerState,Get-PlayerStatus,Get-PlayerCommandInfo,Test-PlayerProcess,Find-PlayerLegacyProcess,Wait-PlayerExit,Stop-PlayerOwnedInstance
