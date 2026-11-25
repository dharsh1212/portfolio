@echo off
title DHARSHAN S - Portfolio Server
cd /d "%~dp0"
echo Starting DHARSHAN S Portfolio Server on http://localhost:4000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4000"
call npm start
pause
