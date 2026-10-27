@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Stop-Player.ps1" -Port 8766
if errorlevel 1 pause
