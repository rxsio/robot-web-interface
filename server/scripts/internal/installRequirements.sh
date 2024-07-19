#!/bin/bash

# Stop script after first error
set -e

# Detect Venv
if [ ! -d "venv" ];
then
  echo "ERROR | Virtual Environment not detected";
  exit 1
fi

# Activate
source ./venv/bin/activate

# Install requirements
echo -n "INFO | Installing requirements...  ";
python3.8 -m pip install -r requirements.txt
echo "done";

# Deactivate
deactivate