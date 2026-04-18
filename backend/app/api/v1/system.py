"""
System API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class SystemInfo(BaseModel):
    """System information model"""
    hostname: str
    platform: str
    uptime: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float

class ServiceControl(BaseModel):
    """Service control request"""
    service: str
    action: str  # start, stop, restart, status

@router.get("/system/info")
async def get_system_info():
    """Get system information"""
    try:
        # Get hostname
        hostname_result = subprocess.run(
            ["hostname"],
            capture_output=True,
            text=True,
            timeout=5
        )
        hostname = hostname_result.stdout.strip()
        
        # Get uptime
        uptime_result = subprocess.run(
            ["uptime", "-p"],
            capture_output=True,
            text=True,
            timeout=5
        )
        uptime = uptime_result.stdout.strip()
        
        return {
            "hostname": hostname,
            "platform": "linux",
            "uptime": uptime,
            "cpu_usage": 0.0,  # TODO: Implement actual monitoring
            "memory_usage": 0.0,
            "disk_usage": 0.0
        }
    except Exception as e:
        logger.error(f"Error getting system info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/system/service")
async def control_service(request: ServiceControl):
    """Control system services"""
    allowed_services = [
        "magicmirror",
        "nginx",
        "magicmirror-admin-api",
        "magicmirror-wlan"
    ]
    
    allowed_actions = ["start", "stop", "restart", "status"]
    
    if request.service not in allowed_services:
        raise HTTPException(status_code=400, detail=f"Service not allowed: {request.service}")
    
    if request.action not in allowed_actions:
        raise HTTPException(status_code=400, detail=f"Action not allowed: {request.action}")
    
    try:
        result = subprocess.run(
            ["sudo", "systemctl", request.action, request.service],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        return {
            "service": request.service,
            "action": request.action,
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr
        }
    except Exception as e:
        logger.error(f"Error controlling service: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/system/logs/{service}")
async def get_service_logs(service: str, lines: int = 50):
    """Get service logs"""
    allowed_services = [
        "magicmirror",
        "nginx",
        "magicmirror-admin-api",
        "magicmirror-wlan"
    ]
    
    if service not in allowed_services:
        raise HTTPException(status_code=400, detail=f"Service not allowed: {service}")
    
    try:
        result = subprocess.run(
            ["sudo", "journalctl", "-u", service, "-n", str(lines), "--no-pager"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        return {
            "service": service,
            "lines": result.stdout.split('\n'),
            "success": result.returncode == 0
        }
    except Exception as e:
        logger.error(f"Error getting logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))
