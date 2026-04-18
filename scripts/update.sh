#!/bin/bash
#
# Update magicmirror-admin to latest version
#
set -e

INSTALL_DIR="/opt/magicmirror-admin"
SERVICE_USER="mm"

cd "$INSTALL_DIR"

echo "Pulling latest version..."
git pull origin main

echo "Updating backend dependencies..."
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
deactivate
cd ..

echo "Rebuilding frontend..."
cd frontend
npm install
npm run build:prod
cd ..

echo "Restarting services..."
systemctl restart magicmirror-admin-api
systemctl reload nginx

echo "✓ Update complete"
