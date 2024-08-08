#!/bin/bash
SRC_ROOT="$(dirname "${BASH_SOURCE}")"

# Stop script after first error
set -e

# Create Virtual Environment
echo -n "INFO | Creating Virtual Environment...  ";

if [ ! -d "venv" ];
then
  python3 -m venv "$SRC_ROOT/../../venv"
  echo "done";
else
  echo "already exists";
fi