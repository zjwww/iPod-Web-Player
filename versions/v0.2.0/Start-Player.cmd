@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Player.ps1" -Background %*
if errorlevel 1 pause
