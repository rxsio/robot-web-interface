#!/bin/bash

SRC_ROOT="$(dirname "${BASH_SOURCE}")"

# Stop script after first error
set -e

# Call scripts
source "$SRC_ROOT/internal/createVirtualEnvironment.sh"

SRC_ROOT="$(dirname "${BASH_SOURCE}")"
source "$SRC_ROOT/internal/installRequirements.sh"