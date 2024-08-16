# Stop script after first error
$ErrorActionPreference = "Stop"

# Create Virtual Environment
Write-Host -NoNewline "INFO | Creating Virtual Environment...  ";

if (!(Test-Path -Path "venv")) {
    python -m venv venv
    Write-Output "done";
}
else {
    Write-Output "already exists";
}