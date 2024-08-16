# Stop script after first error
$ErrorActionPreference = "Stop"

if (!(Test-Path -Path "venv")) {
    Write-Output "ERROR | Virtual Environment not detected";
    exit 1;
}

# Activate
.\venv\Scripts\Activate.ps1

# Install requirements
Write-Host -NoNewline "INFO | Installing requirements...  ";
python -m pip install -r requirements.txt
Write-Output "done";

# Deactivate
deactivate