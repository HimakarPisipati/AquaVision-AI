import sys
import threading
from pathlib import Path
from typing import Tuple, Optional
from app.core.config import settings

class ModelService:
    def __init__(self):
        self._lock = threading.Lock()
        self._yolo_model = None
        self._sam_predictor = None
        self._initialized = False

    def is_yolo_checkpoint_available(self) -> bool:
        return Path(settings.YOLO_CHECKPOINT_PATH).is_file()

    def is_sam_checkpoint_available(self) -> bool:
        return Path(settings.SAM_CHECKPOINT_PATH).is_file()

    def is_sam_config_available(self) -> bool:
        repo_dir = Path(settings.SAM_REPO_PATH)
        config_file = repo_dir / "sam2" / settings.SAM_CONFIG_PATH
        return config_file.is_file()

    def is_initialized(self) -> bool:
        return self._initialized

    def load_models(self) -> Tuple[object, object]:
        if self._initialized and self._yolo_model is not None and self._sam_predictor is not None:
            return self._yolo_model, self._sam_predictor

        # 1. Validate files
        yolo_path = Path(settings.YOLO_CHECKPOINT_PATH)
        if not yolo_path.is_file():
            raise FileNotFoundError(f"YOLO checkpoint not found at: {yolo_path}")

        sam_path = Path(settings.SAM_CHECKPOINT_PATH)
        if not sam_path.is_file():
            raise FileNotFoundError(f"SAM checkpoint not found at: {sam_path}")

        sam_repo_dir = Path(settings.SAM_REPO_PATH)
        sam_config_path = sam_repo_dir / "sam2" / settings.SAM_CONFIG_PATH
        if not sam_config_path.is_file():
            raise FileNotFoundError(f"SAM config not found at: {sam_config_path}")

        # 2. Add SAM 2 repo to sys.path
        sam_repo_str = str(sam_repo_dir.resolve())
        if sam_repo_str not in sys.path:
            sys.path.insert(0, sam_repo_str)

        # 3. Load YOLO
        from ultralytics import YOLO
        yolo = YOLO(str(yolo_path))

        # 4. Load SAM 2.1 Small
        from sam2.build_sam import build_sam2
        from sam2.sam2_image_predictor import SAM2ImagePredictor

        # Note: build_sam2 resolves configs relative to sam2 package
        sam_model = build_sam2(
            settings.SAM_CONFIG_PATH,
            str(sam_path),
            device=settings.DEVICE,
        )
        sam_pred = SAM2ImagePredictor(sam_model)

        self._yolo_model = yolo
        self._sam_predictor = sam_pred
        self._initialized = True

        return self._yolo_model, self._sam_predictor

    @property
    def lock(self) -> threading.Lock:
        return self._lock

model_service = ModelService()
