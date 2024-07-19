#!/bin/bash

# Stop script after first error
set -e

# Create Virtual Environment
echo -n "INFO | Creating Virtual Environment...  ";

if [ ! -d "venv" ];
then
  python3.8 -m venv venv
  echo "done";
else
  echo "already exists";
fi