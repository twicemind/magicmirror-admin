"""
Plugin Interface for MagicMirror Admin Platform
All plugins must implement this interface
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)

class AdminPlugin(ABC):
    """
    Base class for all admin plugins
    
    Plugins must implement all abstract methods to be loaded by the system.
    """
    
    def __init__(self):
        """Initialize plugin"""
        self.logger = logging.getLogger(f"plugin.{self.plugin_id}")
        self._initialized = False
    
    @property
    @abstractmethod
    def plugin_id(self) -> str:
        """
        Unique plugin identifier (lowercase, alphanumeric with hyphens)
        Example: "setup-manager"
        """
        pass
    
    @property
    @abstractmethod
    def plugin_name(self) -> str:
        """
        Human-readable plugin name
        Example: "Setup Manager"
        """
        pass
    
    @property
    @abstractmethod
    def plugin_version(self) -> str:
        """
        Plugin version (semantic versioning)
        Example: "1.0.0"
        """
        pass
    
    @property
    def plugin_description(self) -> str:
        """
        Plugin description
        Example: "Manage MagicMirror setup and updates"
        """
        return ""
    
    @property
    def plugin_author(self) -> str:
        """Plugin author name"""
        return "Unknown"
    
    @property
    def plugin_icon(self) -> str:
        """
        Material icon name for UI
        See: https://fonts.google.com/icons
        Example: "settings"
        """
        return "extension"
    
    @abstractmethod
    def get_router(self) -> APIRouter:
        """
        Return FastAPI router with plugin endpoints
        
        Example:
            router = APIRouter()
            
            @router.get("/status")
            async def get_status():
                return {"status": "ok"}
            
            return router
        """
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Return plugin metadata for frontend
        
        Returns:
            dict: Plugin metadata including routes, menu items, etc.
        """
        return {
            "id": self.plugin_id,
            "name": self.plugin_name,
            "version": self.plugin_version,
            "description": self.plugin_description,
            "author": self.plugin_author,
            "icon": self.plugin_icon,
            "enabled": self._initialized,
            "routes": self.get_routes(),
            "menu": self.get_menu_items(),
            "permissions": self.get_permissions()
        }
    
    def get_routes(self) -> list:
        """
        Define plugin routes for frontend routing
        
        Returns:
            list: Route definitions
            
        Example:
            [
                {
                    "path": "setup",
                    "title": "Setup Manager",
                    "icon": "settings"
                }
            ]
        """
        return []
    
    def get_menu_items(self) -> list:
        """
        Define menu items for plugin
        
        Returns:
            list: Menu item definitions
            
        Example:
            [
                {
                    "label": "Setup",
                    "icon": "settings",
                    "route": "/admin/setup",
                    "order": 10,
                    "category": "system"
                }
            ]
        """
        return []
    
    def get_permissions(self) -> list:
        """
        Define required permissions (for future use)
        
        Returns:
            list: Permission strings
        """
        return []
    
    def get_sudo_commands(self) -> List:
        """
        Define sudo commands required by this plugin
        
        Returns:
            list: List of SudoCommand objects
            
        Example:
            from app.core.sudo_manager import SudoCommand
            return [
                SudoCommand(
                    command="/usr/bin/systemctl restart magicmirror",
                    description="Restart MagicMirror service"
                ),
                SudoCommand(
                    command="/usr/bin/apt-get update",
                    description="Update package list"
                )
            ]
        
        Note: Commands are registered automatically on plugin load
              and removed on plugin unload. Only on Linux production systems.
        """
        return []
    
    async def on_load(self) -> None:
        """
        Called when plugin is loaded
        Override to perform initialization tasks
        """
        self.logger.info(f"Loading plugin: {self.plugin_name} v{self.plugin_version}")
        self._initialized = True
    
    async def on_unload(self) -> None:
        """
        Called when plugin is unloaded
        Override to perform cleanup tasks
        """
        self.logger.info(f"Unloading plugin: {self.plugin_name}")
        self._initialized = False
    
    def get_translations(self) -> Dict[str, Dict[str, str]]:
        """
        Return plugin translations
        
        Returns:
            dict: Translations by language code
            
        Example:
            {
                "en": {
                    "plugin.setup.title": "Setup Manager",
                    "plugin.setup.description": "Manage system setup"
                },
                "de": {
                    "plugin.setup.title": "Setup-Manager",
                    "plugin.setup.description": "System-Setup verwalten"
                }
            }
        """
        return {}
    
    def get_config_schema(self) -> Optional[Dict[str, Any]]:
        """
        Return JSON schema for plugin configuration (for future use)
        
        Returns:
            dict: JSON schema or None
        """
        return None
    
    def __str__(self) -> str:
        return f"{self.plugin_name} v{self.plugin_version} ({self.plugin_id})"
    
    def __repr__(self) -> str:
        return f"<AdminPlugin: {self.plugin_id}>"
