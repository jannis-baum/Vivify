@echo off
setlocal EnableDelayedExpansion

rem Debug launcher for Vivify using Node.js (build/bundle.js)
rem Logs WebSocket events to %TEMP%\vivify-server.log

set "INSTALL_DIR=%~dp0..\..\"
set "VIVIFY_BUNDLE=%INSTALL_DIR%build\bundle.js"

set "LOG_PATH=%TEMP%\vivify-server.log"
set "OUT_LOG=%TEMP%\vivify-server.out.log"
set "ERR_LOG=%TEMP%\vivify-server.err.log"

echo [%DATE% %TIME%] viv-debug starting > "%LOG_PATH%"

where node >nul 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: node.exe not found in PATH >> "%LOG_PATH%"
    exit /b 1
)

if not exist "%VIVIFY_BUNDLE%" (
    echo [%DATE% %TIME%] ERROR: "%VIVIFY_BUNDLE%" not found >> "%LOG_PATH%"
    exit /b 1
)

set "VIV_LOG_PATH=%LOG_PATH%"

rem Run Node.js server in background and capture stdout/stderr
start /b "" node "%VIVIFY_BUNDLE%" %* > "%OUT_LOG%" 2> "%ERR_LOG%"

echo [%DATE% %TIME%] viv-debug launched node bundle >> "%LOG_PATH%"

endlocal
