import json
from pathlib import Path
from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.artifact_service import artifact_service
from app.schemas.analysis import MetricsResponse
from app.core.config import settings

history_router = APIRouter()
metrics_router = APIRouter()

@history_router.get("/history", response_model=List[Dict[str, Any]])
def get_history():
    return artifact_service.get_history()

@metrics_router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    metrics_path = Path(settings.METRICS_PATH)
    if not metrics_path.is_file():
        return MetricsResponse()
        
    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        m = data.get("metrics", {})
        return MetricsResponse(
            precision=m.get("precision"),
            recall=m.get("recall"),
            map50=m.get("mAP50"),
            map50_95=m.get("mAP50_95"),
            test_image_count=data.get("test_image_count"),
            detector=data.get("detector"),
            project=data.get("project"),
        )
    except Exception:
        return MetricsResponse()
