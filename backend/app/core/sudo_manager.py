"""
Sudo Manager for MagicMirror Admin Platform
Centralized sudo permissions management for plugins
"""
import os
import platform
import logging
import subprocess
from typing import List, Dict, Set, Optional
from pathlib import Path
import re

logger = logging.getLogger(__name__)

class SudoCommand:
    """Represents a sudo command permission"""
    
    def __init__(self, command: str, description: str = ""):
        """
        Initialize sudo command
        
        Args:
            command: Full command path or pattern (e.g., "/usr/bin/systemctl restart *")
            description: Human-readable description
        """
        self.command = command
        self.description = description
    
    def __str__(self):
        return self.command
    
    def __repr__(self):
        return f"SudoCommand('{self.command}')"
    
    def __eq__(self, other):
        if isinstance(other, SudoCommand):
            return self.command == other.command
        return False
    
    def __hash__(self):
        return hash(self.command)


class SudoManager:
    """
    Manages sudo permissions for admin plugins
    
    - Plugins can register required sudo commands
    - Admin creates sudoers entries only on Linux (Raspberry Pi)
    - Mac development uses mock mode (logs commands without execution)
    - Automatic cleanup when plugins are removed
    """
    
    def __init__(self):
        self.platform = platform.system().lower()  # 'darwin' or 'linux'
        self.is_production = self.platform == 'linux'
        self.sudoers_dir = Path("/etc/sudoers.d")
        self.sudoers_prefix = "magicmirror-admin"
        
        # Plugin permissions registry: {plugin_id: Set[SudoCommand]}
        self.permissions: Dict[str, Set[SudoCommand]] = {}
        
        logger.info(f"SudoManager initialized (platform={self.platform}, production={self.is_production})")
        
        if not self.is_production:
            logger.warning("⚠️  Running on Mac - sudo operations are MOCKED (not executed)")
    
    def register_plugin_permissions(self, plugin_id: str, commands: List[SudoCommand]) -> bool:
        """
        Register sudo commands for a plugin
        
        Args:
            plugin_id: Unique plugin identifier
            commands: List of SudoCommand objects
            
        Returns:
            bool: True if successful
        """
        try:
            # Store permissions in registry
            self.permissions[plugin_id] = set(commands)
            
            logger.info(f"Registered {len(commands)} sudo commands for plugin '{plugin_id}'")
            
            # Create sudoers file (only on Linux)
            if self.is_production:
                return self._create_sudoers_file(plugin_id, commands)
            else:
                logger.debug(f"[MOCK] Would create sudoers file for '{plugin_id}' with commands:")
                for cmd in commands:
                    logger.debug(f"  - {cmd.command}  # {cmd.description}")
                return True
                
        except Exception as e:
            logger.error(f"Error registering permissions for '{plugin_id}': {e}")
            return False
    
    def unregister_plugin_permissions(self, plugin_id: str) -> bool:
        """
        Remove sudo permissions for a plugin
        
        Args:
            plugin_id: Plugin identifier
            
        Returns:
            bool: True if successful
        """
        try:
            if plugin_id not in self.permissions:
                logger.warning(f"Plugin '{plugin_id}' has no registered permissions")
                return True
            
            # Remove from registry
            commands_count = len(self.permissions[plugin_id])
            del self.permissions[plugin_id]
            
            logger.info(f"Unregistered {commands_count} sudo commands for plugin '{plugin_id}'")
            
            # Remove sudoers file (only on Linux)
            if self.is_production:
                return self._remove_sudoers_file(plugin_id)
            else:
                logger.debug(f"[MOCK] Would remove sudoers file for '{plugin_id}'")
                return True
                
        except Exception as e:
            logger.error(f"Error unregistering permissions for '{plugin_id}': {e}")
            return False
    
    def get_plugin_permissions(self, plugin_id: str) -> List[SudoCommand]:
        """Get registered permissions for a plugin"""
        return list(self.permissions.get(plugin_id, set()))
    
    def get_all_permissions(self) -> Dict[str, List[SudoCommand]]:
        """Get all registered permissions"""
        return {pid: list(cmds) for pid, cmds in self.permissions.items()}
    
    def _create_sudoers_file(self, plugin_id: str, commands: List[SudoCommand]) -> bool:
        """
        Create sudoers file for plugin (Linux only)
        
        File format:
        # MagicMirror Admin - Plugin: plugin-id
        # Description: Command description
        magicmirror ALL=(ALL) NOPASSWD: /path/to/command arg1 arg2
        """
        try:
            # Sanitize plugin_id for filename
            safe_id = re.sub(r'[^a-z0-9\-]', '', plugin_id.lower())
            filename = f"{self.sudoers_prefix}-{safe_id}"
            filepath = self.sudoers_dir / filename
            
            # Build sudoers content
            lines = [
                f"# MagicMirror Admin - Plugin: {plugin_id}",
                f"# Generated automatically - DO NOT EDIT MANUALLY",
                f"# Total commands: {len(commands)}",
                ""
            ]
            
            for cmd in commands:
                if cmd.description:
                    lines.append(f"# {cmd.description}")
                lines.append(f"magicmirror ALL=(ALL) NOPASSWD: {cmd.command}")
                lines.append("")
            
            content = "\n".join(lines)
            
            # Write to temp file first
            temp_file = f"/tmp/{filename}.tmp"
            with open(temp_file, 'w') as f:
                f.write(content)
            
            # Validate syntax
            result = subprocess.run(
                ["visudo", "-c", "-f", temp_file],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Sudoers syntax validation failed: {result.stderr}")
                os.remove(temp_file)
                return False
            
            # Move to sudoers.d with correct permissions
            subprocess.run(
                ["sudo", "mv", temp_file, str(filepath)],
                check=True
            )
            subprocess.run(
                ["sudo", "chmod", "0440", str(filepath)],
                check=True
            )
            subprocess.run(
                ["sudo", "chown", "root:root", str(filepath)],
                check=True
            )
            
            logger.info(f"✓ Created sudoers file: {filepath}")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Subprocess error creating sudoers file: {e}")
            return False
        except Exception as e:
            logger.error(f"Error creating sudoers file: {e}")
            return False
    
    def _remove_sudoers_file(self, plugin_id: str) -> bool:
        """Remove sudoers file for plugin (Linux only)"""
        try:
            safe_id = re.sub(r'[^a-z0-9\-]', '', plugin_id.lower())
            filename = f"{self.sudoers_prefix}-{safe_id}"
            filepath = self.sudoers_dir / filename
            
            if not filepath.exists():
                logger.warning(f"Sudoers file not found: {filepath}")
                return True
            
            subprocess.run(
                ["sudo", "rm", str(filepath)],
                check=True
            )
            
            logger.info(f"✓ Removed sudoers file: {filepath}")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Subprocess error removing sudoers file: {e}")
            return False
        except Exception as e:
            logger.error(f"Error removing sudoers file: {e}")
            return False
    
    def validate_permissions(self) -> Dict[str, bool]:
        """
        Validate all registered permissions
        
        Returns:
            dict: {plugin_id: valid}
        """
        results = {}
        
        if not self.is_production:
            logger.debug("[MOCK] Skipping validation on Mac")
            return {pid: True for pid in self.permissions.keys()}
        
        for plugin_id in self.permissions.keys():
            safe_id = re.sub(r'[^a-z0-9\-]', '', plugin_id.lower())
            filename = f"{self.sudoers_prefix}-{safe_id}"
            filepath = self.sudoers_dir / filename
            
            results[plugin_id] = filepath.exists()
        
        return results
    
    def cleanup_orphaned_files(self) -> int:
        """
        Remove sudoers files for unregistered plugins
        
        Returns:
            int: Number of files removed
        """
        if not self.is_production:
            logger.debug("[MOCK] Skipping cleanup on Mac")
            return 0
        
        if not self.sudoers_dir.exists():
            return 0
        
        removed = 0
        prefix = f"{self.sudoers_prefix}-"
        
        for filepath in self.sudoers_dir.glob(f"{prefix}*"):
            # Extract plugin_id from filename
            filename = filepath.name
            plugin_id = filename.replace(prefix, "")
            
            # Check if plugin is registered
            if plugin_id not in self.permissions:
                try:
                    subprocess.run(["sudo", "rm", str(filepath)], check=True)
                    logger.info(f"Removed orphaned sudoers file: {filepath}")
                    removed += 1
                except Exception as e:
                    logger.error(f"Error removing {filepath}: {e}")
        
        return removed


# Global singleton instance
_sudo_manager: Optional[SudoManager] = None

def get_sudo_manager() -> SudoManager:
    """Get global SudoManager instance"""
    global _sudo_manager
    if _sudo_manager is None:
        _sudo_manager = SudoManager()
    return _sudo_manager
