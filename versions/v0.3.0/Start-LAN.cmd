@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Player.ps1" -Background -Lan -Port 8766 %*
if errorlevel 1 pause
