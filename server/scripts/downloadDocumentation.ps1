# Stop script after first error
$ErrorActionPreference = "Stop"

# Variables
$technicalDocumentation = "https://github.com/rxsio/firo-docs/archive/refs/heads/gh-pages.zip";
#$interfaceDocumentation = "";

$outTechnicalDocumentation = (Join-Path -Path $PSScriptRoot -ChildPath "../technicalDocumentation.zip");
#$outInterfaceDocumentation = (Join-Path -Path $PSScriptRoot -ChildPath "../interfaceDocumentation.zip")

# Download documentation
Write-Host -NoNewline "Downloading documentation...";
$client = New-Object System.Net.WebClient;
$client.DownloadFile($technicalDocumentation, $outTechnicalDocumentation);
#$client.DownloadFile($interfaceDocumentation, $outInterfaceDocumentation));

# Create output folder
rm -r docs;
mkdir -p docs;

# Unpack
Write-Host -NoNewline "Unzipping documentation..."
Expand-Archive "technicalDocumentation.zip" -DestinationPath docs
#Expand-Archive "interfaceDocumentation.zip" -DestinationPath docs

# Rename
Write-Host -NoNewline "Renaming directories"
mv docs/firo-docs-gh-pages docs/technical
# nv docs/... docs/interface

# Remove archives
rm $outTechnicalDocumentation
#rm $outInterfaceDocumentation