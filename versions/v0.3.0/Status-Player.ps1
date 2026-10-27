param([ValidateRange(1024,65535)][int]$Port=8765)
$ErrorActionPreference='Stop'
Import-Module (Join-Path $PSScriptRoot 'Player-Control.psm1') -Force
$config=Get-PlayerConfig -Root $PSScriptRoot -Port $Port
$live=Get-PlayerStatus -Port $Port
$state=Read-PlayerState $config
if ($null -ne $live) {
    Write-Host "Service ONLINE: v$($live.version), port $Port, PID $($live.processId), $($live.transport)."
    if ($null -eq $state -or $state.InstanceId -ne $live.instanceId) { Write-Host 'This instance belongs to another folder; use its own stop script.' }
} else {
    $legacy=@(Find-PlayerLegacyProcess $config)
    if ($legacy.Count) { foreach ($item in $legacy) { Write-Host "Matching player process: PID $($item.State.ProcessId), $($item.Config.Root). Use Stop-Player.cmd to stop it." } }
    else { Write-Host "Service OFFLINE / not responding on port $Port. No matching player process was found." }
}
Write-Host 'This direct HTTP/process check is independent of browser and Service Worker caches.'
