#!/bin/bash

# Stop script after first error
set -e

# Call scripts
source internal/createVirtualEnvironment
source internal/installRequirements