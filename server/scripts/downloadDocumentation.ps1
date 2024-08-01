# Stop script after first error
$ErrorActionPreference = "Stop"

# Variables
$technicalDocumentation = "https://github.com/rxsio/firo-docs/archive/refs/heads/gh-pages.zip";
$interfaceDocumentation = "https://github.com/rxsio/firo-user-manual/archive/refs/heads/gh-pages.zip";

$outTechnicalDocumentation = (Join-Path -Path $PSScriptRoot -ChildPath "../technicalDocumentation.zip");
$outInterfaceDocumentation = (Join-Path -Path $PSScriptRoot -ChildPath "../interfaceDocumentation.zip")

# Download documentation
Write-Host "Downloading documentation...";
$client = New-Object System.Net.WebClient;
$client.DownloadFile($technicalDocumentation, $outTechnicalDocumentation);
$client.DownloadFile($interfaceDocumentation, $outInterfaceDocumentation);

# Create output folder
Remove-Item -r mounts/docs;
mkdir -p mounts/docs;

# Unpack
Write-Host "Unzipping documentation..."
Expand-Archive "technicalDocumentation.zip" -DestinationPath mounts/docs
Expand-Archive "interfaceDocumentation.zip" -DestinationPath mounts/docs

# Rename
Write-Host "Renaming directories"
Move-Item mounts/docs/firo-docs-gh-pages mounts/docs/technical
Move-Item mounts/docs/firo-user-manual-gh-pages mounts/docs/interface

# Remove archives
Remove-Item $outTechnicalDocumentation
Remove-Item $outInterfaceDocumentation