"""
Configuration management for MagicMirror Admin Platform
"""
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # App Info
    APP_NAME: str = "MagicMirror Admin Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",  # Angular dev server
        "http://localhost",       # NGINX
        "http://127.0.0.1:3000",
        "http://127.0.0.1"
    ]
    
    # Paths
    PLUGINS_DIR: str = "/opt/magicmirror-admin/backend/app/plugins"
    SCRIPTS_DIR: str = "/opt/magicmirror-admin/scripts"
    LOG_FILE: str = "/var/log/magicmirror-admin.log"
    
    # MagicMirror
    MM_DIR: str = "/opt/mm"
    MM_CONFIG_DIR: str = "/opt/mm/mounts/config"
    MM_MODULES_DIR: str = "/opt/mm/mounts/modules"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    API_KEY_ENABLED: bool = False  # For future use
    
    # Sudo Commands (for security audit)
    ALLOWED_SUDO_COMMANDS: List[str] = [
        "/opt/magicmirror-admin/scripts/",
        "/opt/magicmirror-setup/scripts/",
        "/opt/magicmirror-wlan/scripts/",
        "/usr/bin/systemctl",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()

# Development mode adjustments
if settings.ENVIRONMENT == "development":
    settings.PLUGINS_DIR = os.path.join(os.getcwd(), "app", "plugins")
    settings.SCRIPTS_DIR = os.path.join(os.getcwd(), "..", "..", "scripts")
    settings.LOG_FILE = "magicmirror-admin-dev.log"
    settings.ALLOWED_ORIGINS.extend([
        "*"  # Allow all in development
    ])
