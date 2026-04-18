"""
FastAPI Backend for MagicMirror Admin Platform
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.plugin_loader import PluginLoader
from app.api.v1 import system, plugins, status

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="REST API for MagicMirror Admin Platform",
    version=settings.VERSION,
    docs_url="/api/admin/docs",
    redoc_url="/api/admin/redoc",
    openapi_url="/api/admin/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize plugin loader
plugin_loader = PluginLoader()

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting MagicMirror Admin Platform API")
    logger.info(f"Version: {settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Load plugins
    try:
        await plugin_loader.load_plugins()
        logger.info(f"Loaded {len(plugin_loader.plugins)} plugins")
        
        # Inject plugin loader into plugins router
        from app.api.v1 import plugins as plugins_module
        plugins_module.set_plugin_loader(plugin_loader)
        
        # Register plugin routes
        for plugin_id, plugin in plugin_loader.plugins.items():
            router = plugin.get_router()
            app.include_router(
                router,
                prefix=f"/api/admin/plugins/{plugin_id}",
                tags=[f"plugin:{plugin_id}"]
            )
            logger.info(f"Registered plugin: {plugin_id}")
            
    except Exception as e:
        logger.error(f"Error loading plugins: {e}", exc_info=True)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down MagicMirror Admin Platform API")
    await plugin_loader.unload_plugins()

# Include core API routers
app.include_router(system.router, prefix="/api/admin", tags=["system"])
app.include_router(plugins.router, prefix="/api/admin", tags=["plugins"])
app.include_router(status.router, prefix="/api/admin", tags=["status"])

@app.get("/api/admin/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "plugins": len(plugin_loader.plugins)
    }

@app.get("/")
async def root():
    """Root endpoint - redirect to docs"""
    return JSONResponse({
        "message": "MagicMirror Admin Platform API",
        "version": settings.VERSION,
        "docs": "/api/admin/docs"
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
