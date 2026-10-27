param(
    [ValidateRange(1024,65535)][int]$Port=8765,
    [switch]$NoBrowser,
    [switch]$Background,
    [switch]$Lan,
    [switch]$Worker
)
$ErrorActionPreference='Stop'
Import-Module (Join-Path $PSScriptRoot 'Player-Control.psm1') -Force
$config=Get-PlayerConfig -Root $PSScriptRoot -Port $Port

if ($Background) {
    $mutex=New-Object Threading.Mutex($false,('Local\AppleIpodPlayer.Start.'+$config.RootTag+'.'+$Port))
    $ownsMutex=$false
    $child=$null
    $ready=$false
    try {
        try { $ownsMutex=$mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $ownsMutex=$true }
        if (-not $ownsMutex) { throw 'Another launcher for this player is starting. Please wait.' }
        $live=Get-PlayerStatus -Port $Port -TimeoutMilliseconds 600
        if ($null -ne $live) {
            $oldState=Read-PlayerState $config
            if ($null -eq $oldState -or $oldState.InstanceId -ne $live.instanceId) { throw "A player from another folder is already using port $Port. Stop it from its own folder or choose another port." }
            Write-Host "Already running: $($config.Url) (PID $($oldState.ProcessId))"
            if (-not $NoBrowser) { Start-Process $config.Url }
            exit 0
        }
        [IO.Directory]::CreateDirectory($config.Runtime)|Out-Null
        $stdout=Join-Path $config.Runtime "server-$Port.out.log"
        $stderr=Join-Path $config.Runtime "server-$Port.error.log"
        if ($Lan) {
            $node=Get-Command node.exe -ErrorAction SilentlyContinue
            if ($null -eq $node) { throw 'LAN mode requires Node.js on PATH. For this PC only, use Start-Player.cmd (no Node.js needed). If Node.js was just installed, reopen this terminal.' }
            $arguments=@(('"'+(Join-Path $PSScriptRoot 'server.cjs')+'"'),'--lan','--port',[string]$Port)
            $child=Start-Process -FilePath $node.Source -ArgumentList $arguments -WindowStyle Hidden -PassThru
        } else {
            $engine=(Get-Process -Id $PID).Path
            $arguments=@('-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+$PSCommandPath+'"'),'-Port',[string]$Port,'-Worker','-NoBrowser')
            $child=Start-Process -FilePath $engine -ArgumentList $arguments -WindowStyle Hidden -PassThru
        }
        $deadline=[DateTime]::UtcNow.AddSeconds(10)
        $ready=$false
        while ([DateTime]::UtcNow -lt $deadline) {
            $child.Refresh()
            if ($child.HasExited) { break }
            $state=Read-PlayerState $config
            $health=Get-PlayerStatus -Port $Port -TimeoutMilliseconds 400
            if ($null -ne $state -and $null -ne $health -and [int]$state.ProcessId -eq $child.Id -and $state.InstanceId -eq $health.instanceId) { $ready=$true; break }
            Start-Sleep -Milliseconds 100
        }
        if (-not $ready) {
            $detail=''
            if (Test-Path -LiteralPath $stderr) { $detail=(Get-Content -LiteralPath $stderr -Tail 5) -join ' ' }
            throw "The player did not become ready. Port $Port may already be in use. $detail"
        }
        Write-Host 'Apple iPod Web Player v0.3.0 is running in the background.'
        Write-Host $config.Url
        Write-Host "Stop: Stop-Player.cmd -Port $Port    Check: Status-Player.cmd -Port $Port"
        if ($Lan) { Write-Host "Phone on the same Wi-Fi: http://YOUR-PC-LAN-IP:$Port/v0.3.0/" }
        Write-Host 'Closing this launcher does not stop the background player.'
        if (-not $NoBrowser) { Start-Process $config.Url }
    } catch { Write-Error $_; exit 1 }
    finally {
        if ($null -ne $child -and -not $ready) { try { if (-not $child.HasExited) { $child.Kill(); $child.WaitForExit(2000)|Out-Null } } catch { } }
        if ($ownsMutex) { $mutex.ReleaseMutex() }; $mutex.Dispose()
    }
    exit 0
}

if ($Lan) { throw 'LAN mode is launched with Start-LAN.cmd or -Background -Lan.' }
$listener=New-Object Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$cancel=New-Object Threading.CancellationTokenSource
$stopEvent=$null
$state=$null
$instanceId=[guid]::NewGuid().ToString('N')
$keyboardModeChanged=$false
$previousCtrlCMode=$false
$stopping=$false
$transcriptStarted=$false
$mime=@{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.json'='application/json; charset=utf-8';'.webmanifest'='application/manifest+json; charset=utf-8';'.svg'='image/svg+xml';'.png'='image/png';'.woff2'='font/woff2';'.txt'='text/plain; charset=utf-8';'.wav'='audio/wav';'.mp3'='audio/mpeg';'.m4a'='audio/mp4';'.flac'='audio/flac';'.ogg'='audio/ogg';'.opus'='audio/ogg';'.webm'='audio/webm';'.aac'='audio/aac'}
$distRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'dist'))

function Test-PlayerExitRequested {
    if ($null -ne $stopEvent -and $stopEvent.WaitOne(0)) { return $true }
    if (-not $Worker) {
        try {
            if (-not [Console]::IsInputRedirected -and [Console]::KeyAvailable) {
                $key=[Console]::ReadKey($true)
                if ($key.Key -eq [ConsoleKey]::Q -or $key.Key -eq [ConsoleKey]::Enter -or [int]$key.KeyChar -eq 3) { return $true }
            }
        } catch { }
    }
    return $false
}

try {
    if ($Worker) {
        [IO.Directory]::CreateDirectory($config.Runtime)|Out-Null
        try { Start-Transcript -Path (Join-Path $config.Runtime "server-$Port.out.log") -Append -ErrorAction Stop|Out-Null; $transcriptStarted=$true } catch { }
    }
    $listener.Start()
    $eventName='Local\AppleIpodPlayer.'+$config.RootTag+'.'+$Port+'.'+$instanceId
    $stopEvent=New-Object Threading.EventWaitHandle($false,[Threading.EventResetMode]::ManualReset,$eventName)
    $state=[pscustomobject]@{AppId=$config.AppId;Version=$config.Version;Root=$config.Root;Port=$Port;ProcessId=$PID;StartTimeTicks=(Get-Process -Id $PID).StartTime.ToUniversalTime().Ticks.ToString();InstanceId=$instanceId;EventName=$eventName;Transport='powershell';StartedUtc=[DateTime]::UtcNow.ToString('o')}
    Write-PlayerState $config $state
    if (-not $Worker) {
        try {
            if (-not [Console]::IsInputRedirected) {
                $previousCtrlCMode=[Console]::TreatControlCAsInput
                [Console]::TreatControlCAsInput=$true
                $keyboardModeChanged=$true
            }
        } catch { }
    }
    Write-Host 'Apple iPod Web Player v0.3.0'
    Write-Host $config.Url
    if (-not $Worker) { Write-Host 'Press Q, Enter, or Ctrl+C to stop; Stop-Player.cmd also works.' }
    if (-not $NoBrowser -and -not $Worker) { Start-Process $config.Url }
    $pending=$listener.GetContextAsync()
    while ($listener.IsListening) {
        if (Test-PlayerExitRequested) { $stopping=$true; break }
        if (-not $pending.IsCompleted) { Start-Sleep -Milliseconds 75; continue }
        $context=$pending.GetAwaiter().GetResult()
        $pending=$listener.GetContextAsync()
        $response=$context.Response
        $stream=$null
        try {
            $response.Headers['Cache-Control']='no-store, max-age=0'
            $response.Headers['X-Content-Type-Options']='nosniff'
            $response.Headers['Referrer-Policy']='no-referrer'
            if ($context.Request.HttpMethod -notin @('GET','HEAD')) { $response.StatusCode=405; continue }
            $path=$context.Request.Url.AbsolutePath
            if ($path -eq '/__ipod/status') {
                $health=@{appId=$config.AppId;version=$config.Version;instanceId=$instanceId;processId=$PID;transport='powershell';startedUtc=$state.StartedUtc;status='running'}|ConvertTo-Json -Compress
                $bytes=[Text.Encoding]::UTF8.GetBytes($health)
                $response.ContentType='application/json; charset=utf-8'
                $response.ContentLength64=$bytes.Length
                if ($context.Request.HttpMethod -eq 'GET') { $response.OutputStream.Write($bytes,0,$bytes.Length) }
                continue
            }
            $relative=[Uri]::UnescapeDataString($path).TrimStart('/')
            if ($relative -eq 'v0.3.0') { $response.StatusCode=302; $response.RedirectLocation='/v0.3.0/'; continue }
            if ($relative.StartsWith('v0.3.0/',[StringComparison]::Ordinal)) { $relative=$relative.Substring(('v0.3.0/').Length) }
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative='index.html' }
            $target=[IO.Path]::GetFullPath((Join-Path $distRoot $relative))
            if (-not $target.StartsWith($distRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { $response.StatusCode=403; continue }
            if (-not [IO.File]::Exists($target)) { $response.StatusCode=404; continue }
            $extension=[IO.Path]::GetExtension($target).ToLowerInvariant()
            $response.ContentType=if ($mime.ContainsKey($extension)) { $mime[$extension] } else { 'application/octet-stream' }
            $stream=[IO.File]::OpenRead($target)
            $response.ContentLength64=$stream.Length
            if ($context.Request.HttpMethod -eq 'GET') {
                $copy=$stream.CopyToAsync($response.OutputStream,65536,$cancel.Token)
                while (-not $copy.IsCompleted) {
                    if (Test-PlayerExitRequested) { $stopping=$true; $cancel.Cancel(); $response.Abort(); break }
                    Start-Sleep -Milliseconds 75
                }
                if (-not $stopping) { $copy.GetAwaiter().GetResult() }
            }
        } catch {
            if (-not $stopping) { try { $response.StatusCode=500 } catch { } }
        } finally {
            if ($null -ne $stream) { $stream.Dispose() }
            try { $response.Close() } catch { }
        }
        if ($stopping) { break }
    }
} catch {
    if (-not $stopping) {
        if ($Worker) { try { [IO.File]::AppendAllText((Join-Path $config.Runtime "server-$Port.error.log"),($_|Out-String)) } catch { } }
        Write-Error $_; exit 1
    }
} finally {
    $cancel.Cancel()
    try { $listener.Abort() } catch { }
    $listener.Close()
    if ($keyboardModeChanged) { try { [Console]::TreatControlCAsInput=$previousCtrlCMode } catch { } }
    if ($null -ne $state) { Remove-PlayerState $config $instanceId }
    if ($null -ne $stopEvent) { $stopEvent.Dispose() }
    $cancel.Dispose()
    Write-Host 'Player server stopped. The cached browser app may continue offline.'
    if ($transcriptStarted) { try { Stop-Transcript|Out-Null } catch { } }
}
