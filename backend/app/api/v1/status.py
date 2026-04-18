"""
Status API endpoints
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

class StatusResponse(BaseModel):
    """API status response"""
    status: str
    version: str
    environment: str
    timestamp: str
    uptime: float

_start_time = datetime.now()

@router.get("/status")
async def get_status() -> StatusResponse:
    """Get API status"""
    uptime = (datetime.now() - _start_time).total_seconds()
    
    return StatusResponse(
        status="running",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now().isoformat(),
        uptime=uptime
    )

@router.get("/version")
async def get_version() -> dict:
    """Get API version"""
    return {
        "version": settings.VERSION,
        "app_name": settings.APP_NAME
    }

@router.get("/ping")
async def ping() -> dict:
    """Simple ping endpoint"""
    return {"pong": True}
