#!/usr/bin/env pwsh
<#
.SYNOPSIS
    View file/directory in your browser with Vivify.

.DESCRIPTION
    Vivify brings your files to life in the browser! View Markdown, Jupyter Notebooks,
    directories, and code files with syntax highlighting.

.PARAMETER Target
    Path to file or directory to view. For Markdown, you can suffix with :n to scroll
    to the content at line n in the source file.

.PARAMETER Help
    Show help message and exit.

.PARAMETER Version
    Show version information and exit.

.EXAMPLE
    viv README.md
    Opens README.md in the browser with Vivify rendering.

.EXAMPLE
    viv ./docs
    Opens the docs directory listing in the browser.

.EXAMPLE
    viv README.md:42
    Opens README.md and scrolls to line 42.
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Target,

    [Alias('h')]
    [switch]$Help,

    [Alias('v')]
    [switch]$Version
)

# Get the directory where this script is located
$installDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vivifyServer = Join-Path $installDir "vivify-server.exe"

function Print-Usage {
    @"
usage: viv target [target ...]

View file/directory in your browser with Vivify.

arguments:
  target              Path to file or directory to view. For Markdown, you can
                      suffix with :n to scroll to the content at line n in the
                      source file
options:
  --help, -h          show this help message and exit
  --version, -v       show version information and exit
"@
}

function Print-BugReport {
    @"
Fatal: "$vivifyServer" crashed.
Please use the link below to submit a bug report.

The bug report template will help you provide the necessary information and
maybe even find a solution yourself.

https://github.com/jannis-baum/Vivify/issues/new?labels=type%3Abug&template=bug-report.md

"@
}

function Print-ServerFileError {
    param([string]$ErrorType)
    @"
Fatal: "$vivifyServer" $ErrorType.

Please make sure that the "vivify-server.exe" binary is located in the same
directory as the "viv.ps1" script.

"@
}

# Handle help flag
if ($Help -or $Target.Count -eq 0) {
    Print-Usage
    exit 1
}

# Handle version flag
if ($Version) {
    # Try to get version from server
    if (Test-Path $vivifyServer) {
        & $vivifyServer --version
    } else {
        Write-Host "vivify-server not found"
    }
    exit 0
}

# Check if vivify-server exists
if (-not (Test-Path $vivifyServer)) {
    Print-ServerFileError "not found"
    exit 1
}

# Create a temporary file for output
$outputFile = [System.IO.Path]::GetTempFileName()

try {
    # Start the vivify-server process
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $vivifyServer
    $processInfo.Arguments = ($Target | ForEach-Object { "`"$_`"" }) -join ' '
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo

    # Set up output handling
    $outputBuilder = New-Object System.Text.StringBuilder
    $startupComplete = $false

    $outputHandler = {
        if ($EventArgs.Data) {
            # Check for startup complete signal
            if ($EventArgs.Data -match "STARTUP COMPLETE") {
                $script:startupComplete = $true
            } else {
                # Print other output to console
                Write-Host $EventArgs.Data
            }
            $outputBuilder.AppendLine($EventArgs.Data) | Out-Null
        }
    }

    $process.add_OutputDataReceived($outputHandler)
    $process.add_ErrorDataReceived($outputHandler)

    # Start the process
    $process.Start() | Out-Null
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()

    # Wait for startup completion or process exit
    $timeout = 30000  # 30 seconds timeout
    $elapsed = 0
    $checkInterval = 100  # Check every 100ms

    while (-not $startupComplete -and -not $process.HasExited -and $elapsed -lt $timeout) {
        Start-Sleep -Milliseconds $checkInterval
        $elapsed += $checkInterval
    }

    # Check if process crashed during startup
    if ($process.HasExited -and -not $startupComplete) {
        Print-BugReport
        exit 1
    }

    # If we reached timeout, still exit cleanly as server might be running in background
    if ($elapsed -ge $timeout -and -not $startupComplete) {
        Write-Host "Warning: Startup took longer than expected, but server may still be running."
    }

} catch {
    Write-Host "Error starting vivify-server: $_"
    Print-BugReport
    exit 1
} finally {
    # Clean up temp file
    if (Test-Path $outputFile) {
        Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
    }
}

exit 0
