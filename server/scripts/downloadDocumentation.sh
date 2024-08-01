#!/bin/bash

# Stop script after first error
set -e

# Variables
TechnicalDocumentation="https://github.com/rxsio/firo-docs/archive/refs/heads/gh-pages.zip"
InterfaceDocumentation="https://github.com/rxsio/firo-user-manual/archive/refs/heads/gh-pages.zip"

# Download documentation
echo -n "Downloading documentation..."
wget -O "technicalDocumentation.zip" $TechnicalDocumentation
wget -O "interfaceDocumentation.zip" $InterfaceDocumentation

# Create output folder
rm -rf mounts/docs
mkdir -p mounts/docs

# Unpack
echo -n "Unzipping documentation..."
unzip "technicalDocumentation.zip" -d mounts/docs
unzip "interfaceDocumentation.zip" -d mounts/docs

# Rename
echo -n "Renaming directories"
mv mounts/docs/firo-docs-gh-pages mounts/docs/technical
mv mounts/docs/firo-user-manual-gh-pages mounts/docs/interface

# Remove archives
rm "technicalDocumentation.zip"
rm "interfaceDocumentation.zip"