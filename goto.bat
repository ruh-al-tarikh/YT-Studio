@echo off
if "%1"=="main" (
    cd /d C:\Projects\MyRepo\YT-Studio
    echo Switched to main directory
    cmd /k
)
if "%1"=="worker" (
    cd /d C:\Projects\MyRepo\YT-Studio\yt-proxy
    echo Switched to worker directory
    cmd /k
)
if "%1"=="dev" (
    cd /d C:\Projects\MyRepo\YT-Studio
    pnpm dev
)
if "%1"=="deploy" (
    cd /d C:\Projects\MyRepo\YT-Studio\yt-proxy
    npx wrangler deploy
)