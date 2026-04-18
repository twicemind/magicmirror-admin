#!/bin/bash
#
# Check for magicmirror-admin updates
#
set -e

INSTALL_DIR="/opt/magicmirror-admin"
REPO_URL="https://github.com/twicemind/magicmirror-admin.git"

cd "$INSTALL_DIR"

# Fetch latest
git fetch origin main --quiet

# Get versions
CURRENT_VERSION=$(cat VERSION)
LATEST_VERSION=$(git show origin/main:VERSION)

if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "true|$CURRENT_VERSION|$LATEST_VERSION"
else
    echo "false|$CURRENT_VERSION|$CURRENT_VERSION"
fi
