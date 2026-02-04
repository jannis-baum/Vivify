#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build Vivify for Windows.

.DESCRIPTION
    This script builds the vivify-server executable for Windows using Node.js
    Single Executable Applications (SEA) feature.

.PARAMETER Clean
    Clean the build directory before building.

.EXAMPLE
    .\scripts\build-windows.ps1
    Builds Vivify for Windows.

.EXAMPLE
    .\scripts\build-windows.ps1 -Clean
    Cleans and rebuilds Vivify for Windows.
#>

[CmdletBinding()]
param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# Configuration
$BuildDir = "build"
$WindowsBuildDir = "$BuildDir\windows"
$ServerName = "vivify-server.exe"
$BundlePath = "$BuildDir\bundle.js"
$StaticPath = "$BuildDir\static.zip"
$SeaConfigPath = "sea-config.json"
$SeaBlobPath = "$BuildDir\sea-prep.blob"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$([DateTime]::Now.ToString('HH:mm:ss'))] $Message" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Step "Checking prerequisites..."

if (-not (Test-Command "node")) {
    Write-Error "Node.js is not installed or not in PATH"
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Error "npm is not installed or not in PATH"
    exit 1
}

$nodeVersion = node --version
Write-Host "  Node.js version: $nodeVersion"

# Check if Node.js version supports SEA (>= 20.0.0)
$versionMatch = $nodeVersion -match 'v(\d+)'
if ($matches[1] -lt 20) {
    Write-Warning "Node.js 20+ is recommended for SEA support. Current: $nodeVersion"
}

# Clean if requested
if ($Clean) {
    Write-Step "Cleaning build directory..."
    if (Test-Path $BuildDir) {
        Remove-Item -Recurse -Force $BuildDir
    }
}

# Create build directories
Write-Step "Creating build directories..."
New-Item -ItemType Directory -Force -Path $WindowsBuildDir | Out-Null

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Step "Installing dependencies..."
    npm install
}

# Build TypeScript
Write-Step "Compiling TypeScript..."
npx tsc

# Create static.zip
Write-Step "Creating static.zip..."
if (Test-Path $StaticPath) {
    Remove-Item $StaticPath
}
Compress-Archive -Path "static\*" -DestinationPath $StaticPath

# Build with webpack
Write-Step "Building with webpack..."
$env:VIV_VERSION = git describe --tags --always --dirty 2>$null
if (-not $env:VIV_VERSION) {
    $env:VIV_VERSION = "dev"
}
npx webpack

# Generate SEA blob
Write-Step "Generating SEA blob..."
node --experimental-sea-config $SeaConfigPath

# Copy node.exe
Write-Step "Creating executable..."
$nodeExe = (Get-Command node).Source
$serverPath = "$WindowsBuildDir\$ServerName"
Copy-Item $nodeExe $serverPath -Force

# Inject SEA blob
Write-Step "Injecting SEA blob..."
npx postject $serverPath NODE_SEA_BLOB $SeaBlobPath `
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# Copy scripts
Write-Step "Copying launcher scripts..."
Copy-Item "viv.ps1" "$WindowsBuildDir\viv.ps1" -Force
Copy-Item "viv.cmd" "$WindowsBuildDir\viv.cmd" -Force

Write-Host "`n" -NoNewline
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "Output directory: $WindowsBuildDir"
Write-Host "Files:"
Get-ChildItem $WindowsBuildDir | ForEach-Object {
    $size = if ($_.Length -gt 1MB) { "{0:N2} MB" -f ($_.Length / 1MB) } else { "{0:N2} KB" -f ($_.Length / 1KB) }
    Write-Host "  $($_.Name) ($size)"
}
