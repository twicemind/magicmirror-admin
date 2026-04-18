# 🏗️ MagicMirror Admin Platform - Architecture

## 📋 Project Overview

**Name:** MagicMirror Admin Platform  
**Version:** 1.0.0 (first release)  
**Purpose:** Zentrale, modulare Admin-Plattform für MagicMirror mit Plugin-System

## 🎯 Core Requirements

### 1. Frontend (Angular)
- **Framework:** Angular 17+ (Standalone Components)
- **UI Library:** Angular Material / PrimeNG
- **Styling:** TailwindCSS für moderne, responsive UI
- **i18n:** @angular/localize mit JSON-basierten Übersetzungen
- **State Management:** NgRx Signals (moderne Alternative zu NgRx Store)

### 2. Backend (Python FastAPI)
- **Framework:** FastAPI (async, moderne Alternative zu Flask)
- **API Spec:** OpenAPI 3.0 (automatische Dokumentation)
- **Authentication:** JWT-basiert (optional für Zukunft)
- **Plugin System:** Dynamisches Plugin-Loading

### 3. Reverse Proxy (NGINX)
- MagicMirror: `/` → `localhost:8080`
- Admin Platform: `/admin` → `localhost:3000` (Angular)
- Admin API: `/api/admin` → `localhost:8000` (FastAPI)
- WLAN Manager: `/wlan` → `localhost:8765`

## 🔌 Plugin Architecture

### Plugin Interface Definition

```typescript
// plugin-interface.ts
export interface AdminPlugin {
  // Metadata
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon: string;
  
  // UI Components
  routes: PluginRoute[];
  menuItems: MenuItem[];
  
  // Lifecycle Hooks
  onInit(): Promise<void>;
  onDestroy(): Promise<void>;
  
  // API Integration
  apiEndpoints: ApiEndpoint[];
  
  // i18n Support
  translations: TranslationMap;
}

export interface PluginRoute {
  path: string;
  component: Type<any>;
  title: string;
  permissions?: string[];
}

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  order: number;
  category: 'system' | 'modules' | 'settings';
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: string; // Python handler path
}
```

### Backend Plugin Interface

```python
# plugin_interface.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from fastapi import APIRouter

class AdminPlugin(ABC):
    """Base class for all admin plugins"""
    
    @property
    @abstractmethod
    def plugin_id(self) -> str:
        """Unique plugin identifier"""
        pass
    
    @property
    @abstractmethod
    def plugin_name(self) -> str:
        """Display name"""
        pass
    
    @property
    @abstractmethod
    def plugin_version(self) -> str:
        """Semantic version"""
        pass
    
    @abstractmethod
    def get_router(self) -> APIRouter:
        """Return FastAPI router with plugin endpoints"""
        pass
    
    @abstractmethod
    def get_metadata(self) -> Dict[str, Any]:
        """Return plugin metadata for frontend"""
        pass
    
    async def on_load(self) -> None:
        """Called when plugin is loaded"""
        pass
    
    async def on_unload(self) -> None:
        """Called when plugin is unloaded"""
        pass
```

## 📁 Project Structure

```
magicmirror-admin/
├── frontend/                    # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Core services, guards, interceptors
│   │   │   │   ├── services/
│   │   │   │   │   ├── plugin-loader.service.ts
│   │   │   │   │   ├── api.service.ts
│   │   │   │   │   └── i18n.service.ts
│   │   │   │   └── interfaces/
│   │   │   │       ├── plugin.interface.ts
│   │   │   │       └── api.interface.ts
│   │   │   ├── shared/         # Shared components, pipes, directives
│   │   │   │   ├── components/
│   │   │   │   │   ├── layout/
│   │   │   │   │   ├── navigation/
│   │   │   │   │   └── ui/
│   │   │   │   └── styles/
│   │   │   │       ├── theme.scss
│   │   │   │       └── variables.scss
│   │   │   ├── features/       # Feature modules (lazy loaded)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── system/
│   │   │   │   └── settings/
│   │   │   └── plugins/        # Dynamic plugin loading area
│   │   ├── assets/
│   │   │   ├── i18n/           # Translation files
│   │   │   │   ├── en.json
│   │   │   │   ├── de.json
│   │   │   │   └── ...
│   │   │   └── icons/
│   │   └── environments/
│   ├── angular.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── main.py             # FastAPI app entry
│   │   ├── config.py           # Configuration
│   │   ├── core/
│   │   │   ├── plugin_loader.py
│   │   │   ├── plugin_interface.py
│   │   │   └── system_api.py
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── system.py
│   │   │   │   ├── plugins.py
│   │   │   │   └── status.py
│   │   │   └── dependencies.py
│   │   └── plugins/            # Plugin implementations
│   │       ├── __init__.py
│   │       ├── setup_manager/  # Port from magicmirror-setup
│   │       ├── wlan_manager/   # Port from magicmirror-wlan
│   │       └── module_manager/ # New: MM module management
│   ├── requirements.txt
│   └── Dockerfile
│
├── nginx/                       # NGINX configuration
│   ├── nginx.conf
│   ├── sites-available/
│   │   └── magicmirror-admin.conf
│   └── ssl/                    # Optional: SSL certificates
│
├── plugins/                     # External plugin packages
│   └── README.md               # Plugin development guide
│
├── scripts/                     # Installation & management
│   ├── install.sh              # Main installation
│   ├── update.sh               # Update script
│   ├── install-nginx.sh        # NGINX setup
│   ├── build-frontend.sh       # Build Angular app
│   └── plugin-install.sh       # Plugin installer
│
├── services/                    # Systemd services
│   ├── magicmirror-admin.service
│   └── nginx.service           # NGINX config
│
├── docker/                      # Docker setup
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Tests & Linting
│       ├── build.yml           # Build artifacts
│       └── release.yml         # Auto-release
│
├── docs/                        # Documentation
│   ├── PLUGIN_DEVELOPMENT.md
│   ├── INSTALLATION.md
│   ├── API.md
│   └── CONTRIBUTING.md
│
├── test/                        # Local testing
│   ├── docker-compose.test.yml
│   └── mock-data/
│
├── ARCHITECTURE.md             # This file
├── README.md
├── CHANGELOG.md
├── VERSION
└── LICENSE

```

## 🔄 Data Flow

```
User Browser
    ↓
NGINX Reverse Proxy (:80/443)
    ├── / → MagicMirror (:8080)
    ├── /admin → Angular Frontend (:3000)
    └── /api/admin → FastAPI Backend (:8000)
            ↓
        Plugin System
            ↓
        System Commands (subprocess)
            ↓
        Raspberry Pi OS
```

## 🔐 Security Considerations

1. **CORS:** FastAPI configured for same-origin only
2. **CSP:** Content Security Policy headers via NGINX
3. **Sudo Rights:** Minimal sudoers rules (like magicmirror-setup)
4. **Input Validation:** Pydantic models for all API inputs
5. **Rate Limiting:** NGINX rate limiting for API endpoints
6. **Optional JWT:** For future multi-user support

## 🌍 i18n Strategy

### Translation File Structure
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome to MagicMirror Admin"
  },
  "plugins": {
    "setup_manager": {
      "title": "Setup Manager",
      "description": "Manage MagicMirror setup"
    }
  }
}
```

### Adding New Languages
1. Create `assets/i18n/{lang-code}.json`
2. Add to `SUPPORTED_LANGUAGES` in config
3. Language selector automatically updates

## 📦 Plugin System Details

### Plugin Registration Flow

1. **Backend Plugin Discovery:**
   - Scan `backend/app/plugins/` directory
   - Load plugins implementing `AdminPlugin` interface
   - Register API routes dynamically
   - Build plugin metadata

2. **Frontend Plugin Loading:**
   - Fetch plugin list from `/api/admin/plugins`
   - Dynamically load plugin modules
   - Register routes in Angular Router
   - Add menu items to navigation

3. **Plugin Communication:**
   - Frontend ←→ Backend: REST API
   - Backend ←→ System: subprocess with sudo
   - Plugin ←→ Plugin: Event bus (optional)

### Example Plugin: Setup Manager

**Backend (Python):**
```python
# backend/app/plugins/setup_manager/plugin.py
from app.core.plugin_interface import AdminPlugin
from fastapi import APIRouter
import subprocess

class SetupManagerPlugin(AdminPlugin):
    @property
    def plugin_id(self) -> str:
        return "setup_manager"
    
    @property
    def plugin_name(self) -> str:
        return "Setup Manager"
    
    @property
    def plugin_version(self) -> str:
        return "1.0.0"
    
    def get_router(self) -> APIRouter:
        router = APIRouter(prefix="/setup", tags=["setup"])
        
        @router.get("/status")
        async def get_status():
            # Call existing scripts
            result = subprocess.run([
                "bash", "/opt/magicmirror-setup/scripts/get-status.sh"
            ], capture_output=True, text=True)
            return {"output": result.stdout}
        
        @router.post("/update")
        async def trigger_update():
            subprocess.Popen([
                "sudo", "bash", "/opt/magicmirror-setup/scripts/update-setup.sh"
            ])
            return {"status": "started"}
        
        return router
    
    def get_metadata(self):
        return {
            "id": self.plugin_id,
            "name": self.plugin_name,
            "version": self.plugin_version,
            "icon": "settings",
            "routes": [
                {"path": "setup", "title": "Setup Manager"}
            ],
            "menu": [
                {
                    "label": "Setup",
                    "icon": "settings",
                    "route": "/admin/setup",
                    "order": 10,
                    "category": "system"
                }
            ]
        }
```

**Frontend (Angular):**
```typescript
// Generated dynamically based on metadata
// Or pre-built plugin module:

// frontend/src/app/plugins/setup-manager/setup-manager.component.ts
@Component({
  selector: 'app-setup-manager',
  template: `
    <div class="plugin-container">
      <h1>{{ 'plugins.setup_manager.title' | translate }}</h1>
      <button (click)="checkUpdate()">Check for Updates</button>
      <button (click)="triggerUpdate()">Update Setup</button>
    </div>
  `
})
export class SetupManagerComponent {
  constructor(private api: ApiService) {}
  
  checkUpdate() {
    this.api.get('/api/admin/setup/status').subscribe(...)
  }
  
  triggerUpdate() {
    this.api.post('/api/admin/setup/update').subscribe(...)
  }
}
```

## 🚀 Installation Flow

```bash
# On Raspberry Pi
curl -fsSL https://raw.githubusercontent.com/twicemind/magicmirror-admin/main/install.sh | sudo bash
```

**Installation Steps:**
1. Check requirements (MagicMirror, Node.js, Python 3.9+)
2. Install NGINX
3. Clone repository to `/opt/magicmirror-admin`
4. Install backend dependencies (pip)
5. Build frontend (ng build)
6. Configure NGINX reverse proxy
7. Setup systemd service
8. Configure sudoers
9. Start services

## 🔄 Update Strategy

- **Backend:** Git pull + pip install (like magicmirror-setup)
- **Frontend:** Rebuild Angular app
- **Database:** Migration scripts (if needed in future)
- **Plugins:** Individual update mechanism

## 🧪 Testing Strategy

### Local Development
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
ng serve

# NGINX (mock)
docker-compose -f docker-compose.dev.yml up nginx
```

### Docker Testing
```bash
docker-compose -f docker-compose.test.yml up
# Access at http://localhost
```

### CI/CD
- **GitHub Actions:** 
  - Lint Python & TypeScript
  - Run unit tests
  - Build Docker images
  - Create release artifacts
  - Auto-tag versions

## 📊 Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Angular 17+ | Modern SPA framework |
| Backend | FastAPI | Async Python API |
| Reverse Proxy | NGINX | Route management |
| UI Framework | Angular Material | Component library |
| Styling | TailwindCSS | Utility-first CSS |
| State Mgmt | NgRx Signals | Reactive state |
| i18n | @angular/localize | Internationalization |
| Build | Angular CLI | Frontend build |
| Package Mgmt | npm/pip | Dependencies |
| Container | Docker | Isolation & deployment |
| CI/CD | GitHub Actions | Automation |

## 🎨 UI Design Principles

1. **Consistent Layout:** Sidebar navigation (collapsible on mobile)
2. **Dark/Light Theme:** User preference saved
3. **Responsive:** Mobile-first approach
4. **Accessibility:** WCAG 2.1 AA compliant
5. **Performance:** Lazy loading, virtual scrolling
6. **Feedback:** Loading states, error messages, success toasts

## 🔮 Future Enhancements

- WebSocket support for real-time updates
- Multi-user authentication
- Plugin marketplace
- Backup/Restore functionality
- Remote management (VPN/Tailscale)
- Database for configuration persistence
- GraphQL API alternative
- PWA capabilities

## 📝 Migration Path from Current Setup

1. **Phase 1:** Setup new admin platform alongside existing
2. **Phase 2:** Port setup-manager plugin (wrap existing scripts)
3. **Phase 3:** Port wlan-manager plugin
4. **Phase 4:** Deprecate old Flask WebUI
5. **Phase 5:** Add new module-manager plugin

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-18  
**Status:** Architecture Design Phase
