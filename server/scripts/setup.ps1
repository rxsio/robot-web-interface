# Stop script after first error
$ErrorActionPreference = "Stop"

# Call scripts
& "$PSScriptRoot\createVirtualEnvironment.ps1"
& "$PSScriptRoot\installRequirements.ps1"