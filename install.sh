#!/bin/bash
#
# MagicMirror Admin Platform Installation Script
# Version: 1.0.0
#
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/opt/magicmirror-admin"
SERVICE_USER="mm"
REPO_URL="https://github.com/twicemind/magicmirror-admin.git"

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

log_info "Starting MagicMirror Admin Platform installation..."

# 1. Install system dependencies
log_info "Installing system dependencies..."
apt-get update
apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    git \
    curl

# 2. Clone or update repository
if [ -d "$INSTALL_DIR" ]; then
    log_info "Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull
else
    log_info "Cloning repository..."
    git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# 3. Install Backend (FastAPI)
log_info "Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate venv and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Create .env if not exists
if [ ! -f ".env" ]; then
    log_info "Creating .env file..."
    SECRET_KEY=$(openssl rand -hex 32)
    cat > .env <<EOF
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000
SECRET_KEY=$SECRET_KEY
EOF
fi

cd ..

# 4. Build Frontend (Angular)
log_info "Building Angular frontend..."
cd frontend

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install dependencies and build
npm install
npm run build:prod

cd ..

# 5. Configure NGINX
log_info "Configuring NGINX..."
cp nginx/magicmirror-admin.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/magicmirror-admin.conf /etc/nginx/sites-enabled/

# Test NGINX configuration
nginx -t

# 6. Create systemd service for API
log_info "Creating systemd service..."
cat > /etc/systemd/system/magicmirror-admin-api.service <<EOF
[Unit]
Description=MagicMirror Admin Platform API
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR/backend
Environment="PATH=$INSTALL_DIR/backend/venv/bin"
ExecStart=$INSTALL_DIR/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 7. Set permissions
log_info "Setting permissions..."
chown -R $SERVICE_USER:$SERVICE_USER "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"

# 8. Configure sudoers for API
log_info "Configuring sudoers..."
SUDOERS_FILE="/etc/sudoers.d/magicmirror-admin"
cat > "$SUDOERS_FILE" <<EOF
# MagicMirror Admin Platform sudoers rules
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl start magicmirror
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl stop magicmirror
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart magicmirror
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl status magicmirror
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl start nginx
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl stop nginx
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl status nginx
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u magicmirror *
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u nginx *
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/bash $INSTALL_DIR/scripts/*
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/bash /opt/magicmirror-setup/scripts/*
$SERVICE_USER ALL=(ALL) NOPASSWD: /usr/bin/bash /opt/magicmirror-wlan/scripts/*
EOF

chmod 0440 "$SUDOERS_FILE"
visudo -c

# 9. Reload systemd and start services
log_info "Starting services..."
systemctl daemon-reload
systemctl enable magicmirror-admin-api
systemctl restart magicmirror-admin-api
systemctl restart nginx

# 10. Verify installation
log_info "Verifying installation..."
sleep 3

if systemctl is-active --quiet magicmirror-admin-api; then
    log_info "✓ API service is running"
else
    log_error "✗ API service failed to start"
    systemctl status magicmirror-admin-api
    exit 1
fi

if systemctl is-active --quiet nginx; then
    log_info "✓ NGINX is running"
else
    log_error "✗ NGINX failed to start"
    exit 1
fi

# Get IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

log_info ""
log_info "============================================"
log_info "  MagicMirror Admin Platform Installed!"
log_info "============================================"
log_info ""
log_info "Access the admin panel at:"
log_info "  http://$IP_ADDRESS/admin"
log_info ""
log_info "API documentation:"
log_info "  http://$IP_ADDRESS/api/admin/docs"
log_info ""
log_info "Service management:"
log_info "  sudo systemctl status magicmirror-admin-api"
log_info "  sudo systemctl restart magicmirror-admin-api"
log_info ""
log_info "Logs:"
log_info "  sudo journalctl -u magicmirror-admin-api -f"
log_info ""
log_info "============================================"
