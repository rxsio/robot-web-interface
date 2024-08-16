# Stop script after first error
$ErrorActionPreference = "Stop"

# Call scripts
& "$PSScriptRoot\env.ps1"

# Run server
python main.py