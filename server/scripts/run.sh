#!/bin/bash
SRC_ROOT="$(dirname "${BASH_SOURCE}")"

# Stop script after first error
set -e

# Call scripts
ls

source "$SRC_ROOT/env.sh"

# Run server
python main.py