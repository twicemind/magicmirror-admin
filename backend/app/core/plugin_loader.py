"""
Plugin Loader for MagicMirror Admin Platform
Discovers and loads plugins dynamically
"""
import os
import importlib
import inspect
from typing import Dict, List
import logging

from app.core.plugin_interface import AdminPlugin
from app.core.config import settings

logger = logging.getLogger(__name__)

class PluginLoader:
    """Loads and manages admin plugins"""
    
    def __init__(self):
        self.plugins: Dict[str, AdminPlugin] = {}
        self.plugins_dir = settings.PLUGINS_DIR
    
    async def load_plugins(self) -> None:
        """
        Discover and load all plugins from plugins directory
        """
        if not os.path.exists(self.plugins_dir):
            logger.warning(f"Plugins directory not found: {self.plugins_dir}")
            return
        
        logger.info(f"Scanning for plugins in: {self.plugins_dir}")
        
        # Scan plugins directory
        for item in os.listdir(self.plugins_dir):
            plugin_path = os.path.join(self.plugins_dir, item)
            
            # Skip if not a directory
            if not os.path.isdir(plugin_path):
                continue
            
            # Skip __pycache__ and hidden directories
            if item.startswith('__') or item.startswith('.'):
                continue
            
            # Try to load plugin
            try:
                await self._load_plugin(item)
            except Exception as e:
                logger.error(f"Failed to load plugin '{item}': {e}", exc_info=True)
    
    async def _load_plugin(self, plugin_name: str) -> None:
        """
        Load a single plugin by name
        
        Args:
            plugin_name: Name of the plugin directory
        """
        try:
            # Import plugin module
            module_path = f"app.plugins.{plugin_name}.plugin"
            logger.debug(f"Importing plugin module: {module_path}")
            
            module = importlib.import_module(module_path)
            
            # Find plugin class
            plugin_class = None
            for name, obj in inspect.getmembers(module, inspect.isclass):
                # Check if it's a subclass of AdminPlugin (but not AdminPlugin itself)
                if (issubclass(obj, AdminPlugin) and 
                    obj is not AdminPlugin and 
                    obj.__module__ == module.__name__):
                    plugin_class = obj
                    break
            
            if not plugin_class:
                logger.warning(f"No plugin class found in {module_path}")
                return
            
            # Instantiate plugin
            plugin_instance = plugin_class()
            
            # Validate plugin ID
            if not plugin_instance.plugin_id:
                logger.error(f"Plugin {plugin_name} has empty plugin_id")
                return
            
            # Check for duplicate IDs
            if plugin_instance.plugin_id in self.plugins:
                logger.error(f"Duplicate plugin ID: {plugin_instance.plugin_id}")
                return
            
            # Call on_load hook
            await plugin_instance.on_load()
            
            # Store plugin
            self.plugins[plugin_instance.plugin_id] = plugin_instance
            
            logger.info(f"✓ Loaded plugin: {plugin_instance}")
            
        except ImportError as e:
            logger.error(f"Import error for plugin '{plugin_name}': {e}")
        except Exception as e:
            logger.error(f"Error loading plugin '{plugin_name}': {e}", exc_info=True)
    
    async def unload_plugins(self) -> None:
        """Unload all plugins"""
        logger.info("Unloading all plugins")
        
        for plugin_id, plugin in self.plugins.items():
            try:
                await plugin.on_unload()
                logger.info(f"✓ Unloaded plugin: {plugin_id}")
            except Exception as e:
                logger.error(f"Error unloading plugin '{plugin_id}': {e}")
        
        self.plugins.clear()
    
    def get_plugin(self, plugin_id: str) -> AdminPlugin:
        """
        Get plugin by ID
        
        Args:
            plugin_id: Plugin identifier
            
        Returns:
            AdminPlugin instance
            
        Raises:
            KeyError: If plugin not found
        """
        return self.plugins[plugin_id]
    
    def get_all_plugins(self) -> Dict[str, AdminPlugin]:
        """Get all loaded plugins"""
        return self.plugins.copy()
    
    def get_plugin_metadata(self, plugin_id: str) -> dict:
        """Get metadata for a specific plugin"""
        plugin = self.get_plugin(plugin_id)
        return plugin.get_metadata()
    
    def get_all_metadata(self) -> List[dict]:
        """Get metadata for all plugins"""
        return [plugin.get_metadata() for plugin in self.plugins.values()]
