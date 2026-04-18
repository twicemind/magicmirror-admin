# Sudo Manager

## Übersicht

Der **Sudo Manager** ist ein zentrales System zur Verwaltung von Sudo-Berechtigungen für Admin-Plugins in der MagicMirror Admin Platform.

## Konzept

Plugins können Sudo-Befehle benötigen (z.B. `systemctl restart`, `apt-get update`). Der Sudo Manager:

1. **Sammelt** Berechtigungsanfragen von Plugins
2. **Erstellt** Sudoers-Einträge (nur auf Linux)
3. **Validiert** Syntax vor Aktivierung
4. **Entfernt** Berechtigungen bei Plugin-Deinstallation
5. **Mockt** Operationen auf macOS für sichere Entwicklung

## Platform Detection

### macOS (Development)
- `is_production = False`
- Alle Sudo-Operationen werden **nur geloggt**
- Keine Sudoers-Dateien erstellt
- Ideal für lokale Entwicklung

### Linux (Production / Raspberry Pi)
- `is_production = True`
- Sudoers-Dateien werden in `/etc/sudoers.d/` erstellt
- Syntax-Validierung mit `visudo -c`
- Automatische Aufräumung bei Plugin-Entfernung

## Verwendung in Plugins

### 1. Sudo-Befehle definieren

```python
from app.core.plugin_interface import AdminPlugin
from app.core.sudo_manager import SudoCommand

class MyPlugin(AdminPlugin):
    def get_sudo_commands(self) -> List[SudoCommand]:
        return [
            SudoCommand(
                command="/usr/bin/systemctl restart magicmirror",
                description="Restart MagicMirror service"
            ),
            SudoCommand(
                command="/usr/bin/apt-get update",
                description="Update package lists"
            ),
            SudoCommand(
                command="/usr/bin/systemctl restart *",
                description="Restart any systemd service"
            )
        ]
```

### 2. Automatische Registrierung

Der `PluginLoader` registriert Sudo-Befehle automatisch:

```python
# Bei Plugin-Load
await plugin_instance.on_load()
sudo_commands = plugin_instance.get_sudo_commands()
sudo_manager.register_plugin_permissions(plugin_id, sudo_commands)

# Bei Plugin-Unload
sudo_manager.unregister_plugin_permissions(plugin_id)
await plugin_instance.on_unload()
```

### 3. In Code verwenden

```python
# Im Plugin einfach sudo nutzen
result = subprocess.run(
    ["sudo", "systemctl", "restart", "magicmirror"],
    capture_output=True,
    check=True
)
```

**Wichtig:** Nur registrierte Befehle funktionieren ohne Passwort-Abfrage!

## Sudoers-Datei Format

**Dateiname:** `/etc/sudoers.d/magicmirror-admin-{plugin-id}`

**Beispiel:**
```
# MagicMirror Admin - Plugin: ap-systemupdater
# Generated automatically - DO NOT EDIT MANUALLY
# Total commands: 3

# Restart MagicMirror service
magicmirror ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart magicmirror

# Update package lists
magicmirror ALL=(ALL) NOPASSWD: /usr/bin/apt-get update

# Restart any systemd service
magicmirror ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart *
```

**User:** `magicmirror` (der System-User des Admin-Panels)

## API

### SudoCommand

```python
class SudoCommand:
    def __init__(self, command: str, description: str = ""):
        self.command = command        # Befehl oder Pattern
        self.description = description # Beschreibung (optional)
```

**Patterns erlaubt:**
- Wildcards: `/usr/bin/systemctl restart *`
- Absolute Pfade empfohlen: `/usr/bin/apt-get` statt `apt-get`

### SudoManager

```python
# Singleton-Instanz abrufen
from app.core.sudo_manager import get_sudo_manager
sudo_manager = get_sudo_manager()

# Berechtigungen registrieren
success = sudo_manager.register_plugin_permissions(
    plugin_id="my-plugin",
    commands=[
        SudoCommand("/usr/bin/systemctl restart *", "Restart services")
    ]
)

# Berechtigungen entfernen
success = sudo_manager.unregister_plugin_permissions("my-plugin")

# Alle Berechtigungen anzeigen
all_perms = sudo_manager.get_all_permissions()
# Returns: {"plugin-id": [SudoCommand, ...], ...}

# Validierung
results = sudo_manager.validate_permissions()
# Returns: {"plugin-id": True/False, ...}

# Orphaned Files aufräumen
removed_count = sudo_manager.cleanup_orphaned_files()
```

## Sicherheit

### ✅ Best Practices

1. **Absolute Pfade**: Immer `/usr/bin/command` statt `command`
2. **Minimale Berechtigungen**: Nur notwendige Befehle registrieren
3. **Spezifische Patterns**: `/usr/bin/systemctl restart magicmirror` statt `*`
4. **Validierung**: Syntax-Check vor Aktivierung
5. **Aufräumung**: Automatisches Entfernen bei Plugin-Removal

### ⚠️ Risiken

- **Wildcards**: `*` erlaubt beliebige Parameter - mit Vorsicht nutzen!
- **Root-Rechte**: Alle Befehle laufen mit Root - sorgfältig auswählen
- **Shell-Injection**: User-Input NIEMALS direkt in Befehle einsetzen

### 🔒 Schutzmaßnahmen

- **Platform-Detection**: Keine Sudoers auf macOS (Development)
- **Syntax-Validierung**: `visudo -c` prüft vor Aktivierung
- **Permissions (440)**: Sudoers-Dateien sind read-only
- **Owner (root:root)**: Nur root kann ändern
- **Logging**: Alle Operationen werden geloggt

## Logging-Beispiele

### macOS (Mock Mode)

```
INFO  - SudoManager initialized (platform=darwin, production=False)
WARNING - ⚠️  Running on Mac - sudo operations are MOCKED (not executed)
INFO  - Registered 9 sudo commands for plugin 'ap-systemupdater'
DEBUG - [MOCK] Would create sudoers file for 'ap-systemupdater' with commands:
DEBUG -   - /usr/bin/apt-get update  # Update package lists
DEBUG -   - /usr/bin/systemctl restart *  # Restart services
```

### Linux (Production)

```
INFO  - SudoManager initialized (platform=linux, production=True)
INFO  - Registered 9 sudo commands for plugin 'ap-systemupdater'
INFO  - ✓ Created sudoers file: /etc/sudoers.d/magicmirror-admin-ap-systemupdater
INFO  - ✓ Removed sudoers file: /etc/sudoers.d/magicmirror-admin-ap-systemupdater
```

## Troubleshooting

### Problem: Passwort wird trotzdem abgefragt

**Ursache:** Sudoers-Datei nicht korrekt oder Befehl nicht registriert

**Lösung:**
```bash
# Prüfen, ob Datei existiert
ls -la /etc/sudoers.d/magicmirror-admin-*

# Syntax prüfen
sudo visudo -c -f /etc/sudoers.d/magicmirror-admin-plugin-id

# Berechtigungen prüfen
ls -l /etc/sudoers.d/magicmirror-admin-plugin-id
# Sollte: -r--r----- 1 root root
```

### Problem: Plugin lädt, aber keine Sudoers-Datei

**Ursache:** Läuft auf macOS (Mock-Modus)

**Lösung:** Normal! Auf macOS werden keine Dateien erstellt.

### Problem: Orphaned sudoers files

**Ursache:** Plugin gelöscht, aber Datei bleibt

**Lösung:**
```python
sudo_manager.cleanup_orphaned_files()
```

## Testing

### Unit Tests (TODO)

```python
def test_sudo_manager_mock_mode():
    """Test that macOS mode doesn't create files"""
    manager = SudoManager()
    assert manager.platform == 'darwin'
    assert not manager.is_production
    
    success = manager.register_plugin_permissions('test', [
        SudoCommand('/bin/test')
    ])
    assert success
    assert not Path('/etc/sudoers.d/magicmirror-admin-test').exists()
```

### Manual Testing

```bash
# macOS
python -c "from app.core.sudo_manager import get_sudo_manager; \
  m = get_sudo_manager(); \
  print(f'Platform: {m.platform}, Production: {m.is_production}')"

# Erwartete Ausgabe: Platform: darwin, Production: False
```

## Migration Guide

### Von Legacy-System zu Sudo Manager

**Vorher (manuell in install.sh):**
```bash
cat > /etc/sudoers.d/magicmirror-plugin << EOF
magicmirror ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart magicmirror
EOF
```

**Nachher (automatisch via Plugin):**
```python
def get_sudo_commands(self):
    return [
        SudoCommand(
            "/usr/bin/systemctl restart magicmirror",
            "Restart MagicMirror"
        )
    ]
```

**Vorteile:**
- ✅ Automatische Registrierung bei Plugin-Load
- ✅ Automatische Aufräumung bei Plugin-Removal
- ✅ Entwicklungs-Mock für sichere Tests
- ✅ Zentrale Verwaltung und Validierung

## Roadmap

### Phase 2 (TODO)
- [ ] Admin-UI für Sudo-Permissions
- [ ] Audit-Log für Sudo-Nutzung
- [ ] Permission-Request-Flow
- [ ] Granulare Permissions (per-user)
- [ ] Approval-Workflow

## Lizenz

Siehe Haupt-Repository LICENSE
