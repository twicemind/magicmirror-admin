# 🪞 MagicMirror Admin Platform

**Modern, Modular Admin Platform for MagicMirror with Plugin System**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/twicemind/magicmirror-admin/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com)

## 🎯 Overview

MagicMirror Admin Platform is a **central, modular administration system** for MagicMirror installations on Raspberry Pi. It provides a modern Angular-based frontend with a plugin architecture that allows easy integration of administrative modules.

### Key Features

- 🔌 **Plugin System**: Modular architecture with defined interfaces
- 🌍 **Multilingual**: Easy language addition via JSON files
- 🎨 **Modern UI**: Angular Material + TailwindCSS
- 🚀 **FastAPI Backend**: Async, performant Python backend
- 🔒 **Secure**: Minimal sudo rights, input validation
-⏱️ **Real-time Updates**: System status monitoring
- 🐳 **Docker Support**: Container-ready deployment
- 📦 **Auto-Release**: GitHub Actions CI/CD

## 📋 Requirements

### Raspberry Pi (Production)
- **OS**: MagicMirrorOS (Debian-based)
- **MagicMirror**: Pre-installed at `/opt/mm`
- **Node.js**: 18.x or higher
- **Python**: 3.9 or higher
- **NGINX**: (installed by setup)

### Development (macOS/Linux)
- Node.js 18+
- Python 3.9+
- Docker (optional)

## 🚀 Quick Start

### Production Installation (Raspberry Pi)

```bash
# One-command installation
curl -fsSL https://raw.githubusercontent.com/twicemind/magicmirror-admin/main/install.sh | sudo bash
```

Installation includes:
- ✓ NGINX reverse proxy setup
- ✓ Backend service (FastAPI)
- ✓ Frontend build (Angular)
- ✓ Systemd service configuration
- ✓ Sudoers rules setup

**Access the admin panel:**
```
http://<raspberry-pi-ip>/admin
```

### Local Development

```bash
# Clone repository
git clone https://github.com/twicemind/magicmirror-admin.git
cd magicmirror-admin

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend setup (new terminal)
cd frontend
npm install
ng serve --port 3000

# Access at http://localhost:3000
```

### Docker Development

```bash
docker-compose -f docker/docker-compose.dev.yml up
# Access at http://localhost
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           User Browser                       │
└──────────────────┬──────────────────────────┘
                   │
            NGINX Reverse Proxy
                   │
       ┌───────────┼───────────┐
       │           │           │
  MagicMirror   Angular    FastAPI
   (:8080)      Frontend   Backend
                 (:3000)    (:8000)
                              │
                       ┌──────┴───────┐
                       │              │
                   Plugins      System API
                       │              │
                Raspberry Pi OS
```

### Plugin System

Plugins are self-contained modules that integrate via defined interfaces:

**Backend Interface (Python):**
```python
class AdminPlugin(ABC):
    @property
    @abstractmethod
    def plugin_id(self) -> str: pass
    
    @abstractmethod
    def get_router(self) -> APIRouter: pass
```

**Frontend Interface (TypeScript):**
```typescript
interface AdminPlugin {
  id: string;
  routes: PluginRoute[];
  menuItems: MenuItem[];
  translations: TranslationMap;
}
```

## 📂 Project Structure

```
magicmirror-admin/
├── frontend/           # Angular 17+ application
├── backend/            # FastAPI backend
├── nginx/              # NGINX configuration
├── plugins/            # External plugins
├── scripts/            # Installation scripts
├── services/           # Systemd services
├── docker/             # Docker configuration
└── docs/               # Documentation
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## 🔌 Built-in Plugins

### Setup Manager
Port of magicmirror-setup functionality - manage system updates, services, and configuration.

### WLAN Manager
Port of magicmirror-wlan functionality - WiFi management, HotSpot fallback, network monitoring.

### Module Manager (New)
Install, update, and configure MagicMirror modules directly from the admin panel.

## 🌍 Internationalization

**Supported Languages:**
- 🇬🇧 English (en)
- 🇩🇪 German (de)

**Adding a New Language:**

1. Create translation file:
```bash
cp frontend/src/assets/i18n/en.json frontend/src/assets/i18n/fr.json
```

2. Translate content in `fr.json`

3. Language automatically appears in selector

## 🔐 Security

- **Minimal Sudo Rights**: Only required scripts via sudoers
- **Input Validation**: Pydantic models for all API inputs
- **CORS Protection**: Same-origin only
- **CSP Headers**: Content Security Policy via NGINX
- **Rate Limiting**: API endpoint throttling

## 🧪 Testing

### Run Tests Locally

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
ng test

# E2E tests
ng e2e
```

### Docker Test Environment

```bash
docker-compose -f test/docker-compose.test.yml up
```

## 🔄 Update

### Automatic Updates
Updates run daily at 02:00 via systemd timer (like magicmirror-setup).

### Manual Update

**Via Web UI:**
Navigate to Settings → System Updates → Update Admin Platform

**Via CLI:**
```bash
cd /opt/magicmirror-admin
sudo bash scripts/update.sh
```

## 🛠️ Plugin Development

Create your own admin plugins! See [PLUGIN_DEVELOPMENT.md](docs/PLUGIN_DEVELOPMENT.md) for a complete guide.

**Quick Plugin Template:**

```bash
# Generate plugin scaffold
python scripts/create-plugin.py my-plugin-name
```

This creates:
- Backend plugin structure
- Frontend component template
- API endpoint examples
- Translation files
- Tests

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 1 GB | 2 GB |
| Storage | 500 MB | 1 GB |
| CPU | 1 core | 2 cores |
| Network | Required | Required |

## 🐛 Troubleshooting

### Admin panel not loading
```bash
# Check NGINX status
sudo systemctl status nginx

# Check backend service
sudo systemctl status magicmirror-admin

# View logs
sudo journalctl -u magicmirror-admin -f
```

### Plugin not appearing
```bash
# Reload plugins
sudo systemctl restart magicmirror-admin

# Check plugin logs
tail -f /var/log/magicmirror-admin.log
```

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more solutions.

## 📚 Documentation

- [Architecture](ARCHITECTURE.md) - System design and plugin interfaces
- [Installation](docs/INSTALLATION.md) - Detailed installation guide
- [Plugin Development](docs/PLUGIN_DEVELOPMENT.md) - Create custom plugins
- [API Reference](docs/API.md) - Backend API documentation
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [MagicMirror²](https://magicmirror.builders/) - The magic mirror platform
- [Angular](https://angular.io) - Frontend framework
- [FastAPI](https://fastapi.tiangolo.com) - Backend framework
- [MagicMirrorOS](https://github.com/guysoft/MagicMirrorOS) - Base OS

## 🔗 Related Projects

- [magicmirror-setup](https://github.com/twicemind/magicmirror-setup) - Setup automation (legacy)
- [magicmirror-wlan](https://github.com/twicemind/magicmirror-wlan) - WiFi management (legacy)

---

**Made with ❤️ for the MagicMirror Community**

**Repository:** https://github.com/twicemind/magicmirror-admin  
**Issues:** https://github.com/twicemind/magicmirror-admin/issues  
**Discussions:** https://github.com/twicemind/magicmirror-admin/discussions
