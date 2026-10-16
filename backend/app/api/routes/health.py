from fastapi import APIRouter
from app.schemas.analysis import HealthStatusResponse
from app.services.model_service import model_service
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthStatusResponse)
def get_health():
    yolo_found = model_service.is_yolo_checkpoint_available()
    sam_found = model_service.is_sam_checkpoint_available()
    sam_config_found = model_service.is_sam_config_available()
    initialized = model_service.is_initialized()
    
    all_ready = yolo_found and sam_found and sam_config_found
    
    if all_ready:
        status = "healthy"
        message = "Models ready for inference (CPU execution)"
    else:
        status = "degraded"
        missing = []
        if not yolo_found:
            missing.append("YOLO checkpoint")
        if not sam_found:
            missing.append("SAM checkpoint")
        if not sam_config_found:
            missing.append("SAM configuration")
        message = f"Missing components: {', '.join(missing)}"
        
    return HealthStatusResponse(
        ok=all_ready,
        status=status,
        device=settings.DEVICE,
        message=message,
        yolo_checkpoint_found=yolo_found,
        sam_checkpoint_found=sam_found,
        sam_config_found=sam_config_found,
        models_initialized=initialized,
    )
