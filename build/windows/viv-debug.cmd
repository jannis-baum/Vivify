@echo off
setlocal EnableDelayedExpansion

rem Debug launcher for Vivify using ts-node (runs src directly)
rem Logs WebSocket events to %TEMP%\vivify-server.log

set "INSTALL_DIR=%~dp0..\..\"
set "LOG_PATH=%TEMP%\vivify-server.log"
set "OUT_LOG=%TEMP%\vivify-server.out.log"
set "ERR_LOG=%TEMP%\vivify-server.err.log"
set "TS_NODE_BIN=%INSTALL_DIR%node_modules\ts-node\dist\bin-esm.js"

echo [%DATE% %TIME%] viv-debug starting > "%LOG_PATH%"

where node >nul 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: node.exe not found in PATH >> "%LOG_PATH%"
    exit /b 1
)

if not exist "%INSTALL_DIR%src\app.ts" (
    echo [%DATE% %TIME%] ERROR: src\app.ts not found in %INSTALL_DIR% >> "%LOG_PATH%"
    exit /b 1
)

if not exist "%TS_NODE_BIN%" (
    echo [%DATE% %TIME%] ERROR: ts-node bin not found at %TS_NODE_BIN% >> "%LOG_PATH%"
    echo [%DATE% %TIME%] Run: yarn install (or npm install) in %INSTALL_DIR% >> "%LOG_PATH%"
    exit /b 1
)

set "VIV_LOG_PATH=%LOG_PATH%"
set "VIV_TIMEOUT=0"
set "NODE_ENV=development"

pushd "%INSTALL_DIR%"

rem Run server from source (ts-node CLI) and capture stdout/stderr
start /b "" node "%TS_NODE_BIN%" "%INSTALL_DIR%src\app.ts" %* > "%OUT_LOG%" 2> "%ERR_LOG%"

echo [%DATE% %TIME%] viv-debug launched ts-node server >> "%LOG_PATH%"

popd
endlocal
