@echo off
setlocal EnableDelayedExpansion

rem Get the directory where this script is located
set "INSTALL_DIR=%~dp0"
set "VIVIFY_SERVER=%INSTALL_DIR%vivify-server.exe"

rem Handle help flag
if "%~1"=="" goto :usage
if /i "%~1"=="-h" goto :usage
if /i "%~1"=="--help" goto :usage

rem Handle version flag
if /i "%~1"=="-v" goto :version
if /i "%~1"=="--version" goto :version

rem Check if vivify-server exists
if not exist "%VIVIFY_SERVER%" (
    echo Fatal: "%VIVIFY_SERVER%" not found.
    echo.
    echo Please make sure that the "vivify-server.exe" binary is located in the same
    echo directory as the "viv.cmd" script.
    exit /b 1
)

rem Create a temporary file for output
set "TEMP_OUTPUT=%TEMP%\vivify_output_%RANDOM%.txt"

rem Start vivify-server and wait for startup
start /b "" "%VIVIFY_SERVER%" %* > "%TEMP_OUTPUT%" 2>&1

rem Wait for STARTUP COMPLETE or timeout
set TIMEOUT_COUNTER=0
set MAX_TIMEOUT=300

:wait_loop
if !TIMEOUT_COUNTER! geq !MAX_TIMEOUT! goto :timeout

rem Check if output file contains STARTUP COMPLETE
findstr /c:"STARTUP COMPLETE" "%TEMP_OUTPUT%" >nul 2>&1
if !errorlevel! equ 0 goto :success

rem Small delay
ping -n 1 -w 100 127.0.0.1 >nul 2>&1
set /a TIMEOUT_COUNTER+=1
goto :wait_loop

:success
rem Print any output before STARTUP COMPLETE
for /f "delims=" %%a in ('findstr /v /c:"STARTUP COMPLETE" "%TEMP_OUTPUT%"') do (
    echo %%a
)
del "%TEMP_OUTPUT%" 2>nul
exit /b 0

:timeout
echo Warning: Startup took longer than expected, but server may still be running.
del "%TEMP_OUTPUT%" 2>nul
exit /b 0

:usage
echo usage: viv target [target ...]
echo.
echo View file/directory in your browser with Vivify.
echo.
echo arguments:
echo   target              Path to file or directory to view. For Markdown, you can
echo                       suffix with :n to scroll to the content at line n in the
echo                       source file
echo options:
echo   --help, -h          show this help message and exit
echo   --version, -v       show version information and exit
exit /b 1

:version
if exist "%VIVIFY_SERVER%" (
    "%VIVIFY_SERVER%" --version
) else (
    echo vivify-server not found
)
exit /b 0
