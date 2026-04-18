# Quick Start Guide

## For Developers (Local Mac/Linux)

### 1. Prerequisites

```bash
# Install Python 3.11+
python3 --version

# Install Node.js 20+
node --version
npm --version
```

### 2. Clone & Setup

```bash
git clone https://github.com/twicemind/magicmirror-admin.git
cd magicmirror-admin
```

### 3. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

### 5. Start Development Servers

**Option A: Manual**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Option B: Helper Script**

```bash
bash scripts/dev-start.sh
```

### 6. Access

- **Frontend**: http://localhost:3000/admin
- **API Docs**: http://localhost:8000/api/admin/docs
- **API Health**: http://localhost:8000/api/admin/health

## For Production (Raspberry Pi)

### One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/twicemind/magicmirror-admin/main/install.sh | sudo bash
```

### Manual Install

```bash
sudo su
cd /opt
git clone https://github.com/twicemind/magicmirror-admin.git
cd magicmirror-admin
bash install.sh
```

### Access

- **Admin Panel**: http://YOUR_PI_IP/admin
- **API**: http://YOUR_PI_IP/api/admin/docs

## Docker (Any Platform)

### Quick Test

```bash
cd docker
docker-compose up
```

Access at: http://localhost/admin

### Production Build

```bash
docker build -t magicmirror-admin-backend -f docker/Dockerfile.backend .
docker build -t magicmirror-admin-frontend -f docker/Dockerfile.frontend .
```

## Plugin Development

### Create New Plugin

1. Create plugin directory:
   ```bash
   mkdir -p backend/app/plugins/my-plugin
   ```

2. Create `plugin.py`:
   ```python
   from app.core.plugin_interface import AdminPlugin
   from fastapi import APIRouter
   
   class MyPlugin(AdminPlugin):
       @property
       def plugin_id(self) -> str:
           return "my-plugin"
       
       @property
       def plugin_name(self) -> str:
           return "My Plugin"
       
       @property
       def plugin_version(self) -> str:
           return "1.0.0"
       
       def get_router(self) -> APIRouter:
           router = APIRouter()
           
           @router.get("/status")
           async def status():
               return {"status": "ok"}
           
           return router
   ```

3. Restart backend → Plugin auto-loaded!

## Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test

# Lint
cd backend && flake8 app
cd frontend && npm run lint
```

## Troubleshooting

### Backend won't start

```bash
cd backend
source venv/bin/activate
python -c "from app.main import app; print('OK')"
```

### Frontend build fails

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port 8000 already in use

```bash
lsof -ti:8000 | xargs kill -9
```

### API returns 404

Check NGINX config:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for design details
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- See [README.md](README.md) for full documentation
