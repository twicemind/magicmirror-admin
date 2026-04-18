"""
Setup Manager Plugin
Port of existing magicmirror-setup functionality
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
import logging
import os

from app.core.plugin_interface import AdminPlugin

logger = logging.getLogger(__name__)

class UpdateCheckResult(BaseModel):
    """Update check result"""
    has_update: bool
    current_version: str
    latest_version: str
    changelog: str = ""

class SetupManagerPlugin(AdminPlugin):
    """Setup Manager Plugin - Manages MagicMirror setup and updates"""
    
    @property
    def plugin_id(self) -> str:
        return "setup-manager"
    
    @property
    def plugin_name(self) -> str:
        return "Setup Manager"
    
    @property
    def plugin_version(self) -> str:
        return "1.0.0"
    
    @property
    def plugin_description(self) -> str:
        return "Manage MagicMirror installation, updates, and system configuration"
    
    @property
    def plugin_author(self) -> str:
        return "TwiceMind"
    
    @property
    def plugin_icon(self) -> str:
        return "settings"
    
    def get_router(self) -> APIRouter:
        router = APIRouter()
        
        @router.get("/status")
        async def get_setup_status():
            """Get setup status and versions"""
            try:
                # Check if setup is installed
                setup_dir = "/opt/magicmirror-setup"
                if not os.path.exists(setup_dir):
                    return {
                        "installed": False,
                        "message": "MagicMirror Setup not installed"
                    }
                
                # Get version
                version_file = os.path.join(setup_dir, "VERSION")
                version = "unknown"
                if os.path.exists(version_file):
                    with open(version_file, 'r') as f:
                        version = f.read().strip()
                
                # Check services
                services_status = {}
                for service in ["magicmirror", "magicmirror-webui"]:
                    result = subprocess.run(
                        ["systemctl", "is-active", service],
                        capture_output=True,
                        text=True
                    )
                    services_status[service] = result.stdout.strip()
                
                return {
                    "installed": True,
                    "version": version,
                    "services": services_status
                }
            except Exception as e:
                logger.error(f"Error getting setup status: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @router.get("/check-update")
        async def check_update() -> UpdateCheckResult:
            """Check for setup updates"""
            try:
                script = "/opt/magicmirror-setup/scripts/check-setup-update.sh"
                if not os.path.exists(script):
                    raise HTTPException(status_code=404, detail="Update script not found")
                
                result = subprocess.run(
                    ["sudo", "bash", script],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                # Parse output (format: has_update|current_version|latest_version)
                output = result.stdout.strip()
                parts = output.split('|')
                
                if len(parts) >= 3:
                    return UpdateCheckResult(
                        has_update=parts[0] == "true",
                        current_version=parts[1],
                        latest_version=parts[2],
                        changelog=parts[3] if len(parts) > 3 else ""
                    )
                else:
                    raise HTTPException(status_code=500, detail="Invalid update check response")
                    
            except subprocess.TimeoutExpired:
                raise HTTPException(status_code=504, detail="Update check timed out")
            except Exception as e:
                logger.error(f"Error checking updates: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @router.post("/update")
        async def perform_update():
            """Perform setup update"""
            try:
                script = "/opt/magicmirror-setup/scripts/update-setup.sh"
                if not os.path.exists(script):
                    raise HTTPException(status_code=404, detail="Update script not found")
                
                # Start update in background
                process = subprocess.Popen(
                    ["sudo", "bash", script],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                return {
                    "success": True,
                    "message": "Update started",
                    "pid": process.pid
                }
            except Exception as e:
                logger.error(f"Error starting update: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @router.get("/services")
        async def get_services_status():
            """Get status of all managed services"""
            try:
                script = "/opt/magicmirror-setup/scripts/get-services-status.sh"
                if os.path.exists(script):
                    result = subprocess.run(
                        ["sudo", "bash", script],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    return {"output": result.stdout}
                else:
                    return {"error": "Script not found"}
            except Exception as e:
                logger.error(f"Error getting services: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        return router
    
    def get_routes(self) -> list:
        return [
            {
                "path": "setup",
                "title": "Setup Manager",
                "icon": "settings"
            }
        ]
    
    def get_menu_items(self) -> list:
        return [
            {
                "label": "Setup",
                "icon": "settings",
                "route": "/admin/setup",
                "order": 10,
                "category": "system"
            }
        ]
    
    def get_translations(self) -> dict:
        return {
            "en": {
                "plugin.setup.title": "Setup Manager",
                "plugin.setup.description": "Manage MagicMirror installation and updates",
                "plugin.setup.check_update": "Check for Updates",
                "plugin.setup.perform_update": "Update Now",
                "plugin.setup.services": "Services",
                "plugin.setup.version": "Version",
                "plugin.setup.status": "Status"
            },
            "de": {
                "plugin.setup.title": "Setup-Manager",
                "plugin.setup.description": "MagicMirror-Installation und Updates verwalten",
                "plugin.setup.check_update": "Auf Updates prüfen",
                "plugin.setup.perform_update": "Jetzt aktualisieren",
                "plugin.setup.services": "Dienste",
                "plugin.setup.version": "Version",
                "plugin.setup.status": "Status"
            }
        }
    
    async def on_load(self) -> None:
        """Initialize plugin"""
        await super().on_load()
        self.logger.info("Setup Manager plugin initialized")
    
    async def on_unload(self) -> None:
        """Cleanup plugin"""
        await super().on_unload()
        self.logger.info("Setup Manager plugin unloaded")
