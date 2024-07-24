# Stop script after first error
$ErrorActionPreference = "Stop"

# Call scripts
& "$PSScriptRoot\internal\createVirtualEnvironment.ps1"
& "$PSScriptRoot\internal\installRequirements.ps1"