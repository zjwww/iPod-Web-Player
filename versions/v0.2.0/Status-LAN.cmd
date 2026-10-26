@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Status-Player.ps1" -Port 8766
if not defined IPOD_NO_PAUSE pause
