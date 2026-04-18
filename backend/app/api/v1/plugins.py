"""
Plugins API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# This will be injected by main.py
_plugin_loader = None

def set_plugin_loader(loader):
    """Set plugin loader instance"""
    global _plugin_loader
    _plugin_loader = loader

@router.get("/plugins")
async def list_plugins() -> List[Dict[str, Any]]:
    """Get list of all loaded plugins with metadata"""
    if not _plugin_loader:
        raise HTTPException(status_code=500, detail="Plugin loader not initialized")
    
    try:
        return _plugin_loader.get_all_metadata()
    except Exception as e:
        logger.error(f"Error listing plugins: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plugins/{plugin_id}")
async def get_plugin(plugin_id: str) -> Dict[str, Any]:
    """Get plugin metadata by ID"""
    if not _plugin_loader:
        raise HTTPException(status_code=500, detail="Plugin loader not initialized")
    
    try:
        return _plugin_loader.get_plugin_metadata(plugin_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Plugin not found: {plugin_id}")
    except Exception as e:
        logger.error(f"Error getting plugin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plugins/{plugin_id}/translations")
async def get_plugin_translations(plugin_id: str) -> Dict[str, Dict[str, str]]:
    """Get plugin translations"""
    if not _plugin_loader:
        raise HTTPException(status_code=500, detail="Plugin loader not initialized")
    
    try:
        plugin = _plugin_loader.get_plugin(plugin_id)
        return plugin.get_translations()
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Plugin not found: {plugin_id}")
    except Exception as e:
        logger.error(f"Error getting translations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plugins/reload")
async def reload_plugins():
    """Reload all plugins (admin only)"""
    if not _plugin_loader:
        raise HTTPException(status_code=500, detail="Plugin loader not initialized")
    
    try:
        await _plugin_loader.unload_plugins()
        await _plugin_loader.load_plugins()
        return {
            "success": True,
            "plugins": len(_plugin_loader.plugins),
            "message": "Plugins reloaded successfully"
        }
    except Exception as e:
        logger.error(f"Error reloading plugins: {e}")
        raise HTTPException(status_code=500, detail=str(e))
