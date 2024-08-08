#!/bin/bash
SRC_ROOT="$(dirname "${BASH_SOURCE}")"

# Stop script after first error
set -e

# Detect Venv
if [ ! -d "venv" ];
then
  echo "ERROR | Virtual Environment not detected";
  exit 1
fi

# Activate
source "$SRC_ROOT/../env.sh"
SRC_ROOT="$(dirname "${BASH_SOURCE}")"

# Install requirements
echo -n "INFO | Installing requirements...  ";
python3 -m pip install -r "$SRC_ROOT/../../requirements.txt"
echo "done";

# Deactivate
deactivate