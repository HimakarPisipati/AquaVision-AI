from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List

# Root project directory: d:\work\college work\others\projects\identification of plastic waste
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_DIR = BACKEND_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Plastic Waste Detection on Water Bodies Using Deep Learning"
    API_V1_STR: str = ""
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Inference device
    DEVICE: str = "cpu"
    
    # Model checkpoints and configurations
    YOLO_CHECKPOINT_PATH: str = str(PROJECT_DIR / "models" / "yolov8m_best.pt")
    SAM_CHECKPOINT_PATH: str = str(PROJECT_DIR / "models" / "sam2" / "sam2.1_hiera_small.pt")
    SAM_CONFIG_PATH: str = "configs/sam2.1/sam2.1_hiera_s.yaml"
    SAM_REPO_PATH: str = str(BACKEND_DIR / "sam2_repo")
    
    # Evaluation metrics file
    METRICS_PATH: str = str(PROJECT_DIR / "results" / "metrics" / "yolov8m_test_report.json")
    
    # Artifact directory
    ARTIFACTS_DIR: str = str(BACKEND_DIR / "artifacts")
    
    # Upload constraints
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]
    ALLOWED_MIME_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
    ]
    
    # Confidence threshold
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.25
    YOLO_IMAGE_SIZE: int = 640
    MAX_DETECTIONS: int = 20
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
