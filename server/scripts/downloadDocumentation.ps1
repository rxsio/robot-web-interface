# Stop script after first error
$ErrorActionPreference = "Stop"

# Variables
$technicalDocumentation = "https://github.com/rxsio/firo-docs/archive/refs/heads/gh-pages.zip";
$interfaceDocumentation = "https://github.com/rxsio/interface-docs/archive/refs/heads/gh-pages.zip";

$outTechnicalDocumentation = (Join-Path -Path $PSScriptRoot -ChildPath "../technicalDocumentation.zip");
$outInterfaceDocumentation = (Join-Path -Path $PSScriptRoot -ChildPath "../interfaceDocumentation.zip")

# Download documentation
Write-Host "Downloading documentation...";
$client = New-Object System.Net.WebClient;
$client.DownloadFile($technicalDocumentation, $outTechnicalDocumentation);
$client.DownloadFile($interfaceDocumentation, $outInterfaceDocumentation);

# Create output folder
Remove-Item -r docs;
mkdir -p docs;

# Unpack
Write-Host "Unzipping documentation..."
Expand-Archive "technicalDocumentation.zip" -DestinationPath docs
Expand-Archive "interfaceDocumentation.zip" -DestinationPath docs

# Rename
Write-Host "Renaming directories"
Move-Item docs/firo-docs-gh-pages docs/technical
Move-Item docs/interface-docs-gh-pages docs/interface

# Remove archives
Remove-Item $outTechnicalDocumentation
Remove-Item $outInterfaceDocumentation