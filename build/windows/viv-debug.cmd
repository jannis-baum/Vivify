@echo off
setlocal EnableDelayedExpansion

rem Debug launcher for Vivify using Node.js (build/bundle.js)
rem Logs WebSocket events to %TEMP%\vivify-server.log

set "INSTALL_DIR=%~dp0..\..\"
set "VIVIFY_BUNDLE=%INSTALL_DIR%build\bundle.js"

if not exist "%VIVIFY_BUNDLE%" (
    echo Fatal: "%VIVIFY_BUNDLE%" not found.
    exit /b 1
)

set "VIV_LOG_PATH=%TEMP%\vivify-server.log"

rem Run Node.js server and pass through arguments
node "%VIVIFY_BUNDLE%" %*

endlocal
