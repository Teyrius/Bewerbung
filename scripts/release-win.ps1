$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$package = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $package.version

$sourceDir = Join-Path $projectRoot "dist\Bewerbungsapp-win32-x64"
$zipPath = Join-Path $projectRoot "dist\Bewerbungsapp-v$version-win64.zip"

if (-not (Test-Path $sourceDir)) {
  throw "Build-Ordner nicht gefunden: $sourceDir"
}

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

Compress-Archive -Path "$sourceDir\*" -DestinationPath $zipPath -Force
Write-Host "Release ZIP erstellt: $zipPath"
