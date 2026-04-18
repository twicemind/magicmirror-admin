"""
Core package initialization
"""
from app.core.config import settings
from app.core.plugin_interface import AdminPlugin
from app.core.plugin_loader import PluginLoader

__all__ = ['settings', 'AdminPlugin', 'PluginLoader']
