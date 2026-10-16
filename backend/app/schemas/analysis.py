from typing import List, Optional
from pydantic import BaseModel, Field

class DetectionItem(BaseModel):
    id: int
    class_id: int
    class_name: str
    confidence: float = Field(..., description="YOLO confidence score between 0 and 1")
    bbox: List[float] = Field(..., description="Bounding box in [x1, y1, x2, y2] format")
    sam_score: Optional[float] = Field(None, description="SAM predicted mask quality (predicted IoU)")
    mask_area_pixels: Optional[int] = Field(None, description="Number of masked pixels")
    mask_area_percentage: Optional[float] = Field(None, description="Percentage of total image area covered by mask")
    mask_url: Optional[str] = Field(None, description="URL path to download this mask image")

class ModelsInfo(BaseModel):
    detector: str = "YOLOv8m"
    segmenter: str = "SAM 2.1 Hiera Small"

class PredictResponse(BaseModel):
    id: str
    filename: str
    image_width: int
    image_height: int
    total_detections: int
    processing_time_seconds: float
    device: str
    models: ModelsInfo
    detections: List[DetectionItem]
    annotated_image_url: Optional[str] = None
    mask_image_url: Optional[str] = None
    mask_urls: List[str] = []
    detection_model: str = "YOLOv8m"
    segmentation_model: str = "SAM 2.1 Hiera Small"
    created_at: str

class HealthStatusResponse(BaseModel):
    ok: bool
    status: str
    device: str
    message: Optional[str] = None
    yolo_checkpoint_found: bool
    sam_checkpoint_found: bool
    sam_config_found: bool
    models_initialized: bool

class MetricsResponse(BaseModel):
    precision: Optional[float] = None
    recall: Optional[float] = None
    map50: Optional[float] = None
    map50_95: Optional[float] = None
    test_image_count: Optional[int] = None
    detector: Optional[str] = None
    project: Optional[str] = None
