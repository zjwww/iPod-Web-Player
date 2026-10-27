param([ValidateRange(1024,65535)][int]$Port=8765)
$ErrorActionPreference='Stop'
Import-Module (Join-Path $PSScriptRoot 'Player-Control.psm1') -Force
$config=Get-PlayerConfig -Root $PSScriptRoot -Port $Port
try {
    $state=Read-PlayerState $config
    if ($null -ne $state -and (Test-PlayerProcess $config $state)) {
        $result=Stop-PlayerOwnedInstance $config $state
        Write-Host "Stopped this player on port $Port (PID $($result.ProcessId))."
        if ($result.Forced) { Write-Host 'Graceful stop timed out; only the verified player process was terminated.' }
    } else {
        $legacy=@(Find-PlayerLegacyProcess $config)
        if ($legacy.Count -gt 1) { throw 'Multiple matching player processes were found. No process was terminated; inspect Status-Player.cmd first.' }
        if ($legacy.Count -eq 1) {
            $candidate=$legacy[0]
            if (-not (Test-PlayerProcess $candidate.Config $candidate.State)) { throw 'The legacy player process changed during verification. Nothing was terminated.' }
            Stop-Process -Id ([int]$candidate.State.ProcessId) -Force -ErrorAction Stop
            if (-not (Wait-PlayerExit -TargetProcessId ([int]$candidate.State.ProcessId) -Milliseconds 3000)) { throw 'The verified legacy player did not exit.' }
            Write-Host "Stopped the verified legacy player on port $Port (PID $($candidate.State.ProcessId))."
        } else {
            $live=Get-PlayerStatus -Port $Port
            if ($null -ne $live) { throw 'A player from another folder is online. Use its own stop script. Nothing was terminated.' }
            Write-Host "No matching player service is running on port $Port."
        }
    }
    Write-Host 'The browser may continue offline from its cache; this does not mean the service is running.'
} catch { Write-Error $_; exit 1 }
