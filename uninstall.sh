#!/bin/bash
#
# MagicMirror Admin Platform Uninstall Script
# Version: 1.0.0
#
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

INSTALL_DIR="/opt/magicmirror-admin"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}[ERROR]${NC} This script must be run as root (use sudo)"
   exit 1
fi

log_warn "This will remove MagicMirror Admin Platform"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Uninstall cancelled"
    exit 0
fi

log_info "Stopping services..."
systemctl stop magicmirror-admin-api || true
systemctl disable magicmirror-admin-api || true

log_info "Removing systemd service..."
rm -f /etc/systemd/system/magicmirror-admin-api.service
systemctl daemon-reload

log_info "Removing NGINX configuration..."
rm -f /etc/nginx/sites-enabled/magicmirror-admin.conf
rm -f /etc/nginx/sites-available/magicmirror-admin.conf
systemctl restart nginx

log_info "Removing sudoers file..."
rm -f /etc/sudoers.d/magicmirror-admin

log_info "Removing installation directory..."
rm -rf "$INSTALL_DIR"

log_info "✓ MagicMirror Admin Platform uninstalled"
