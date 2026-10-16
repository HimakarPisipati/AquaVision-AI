import time
import uuid
import numpy as np
import cv2
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageDraw
from typing import List, Tuple

from app.core.config import settings
from app.schemas.analysis import PredictResponse, DetectionItem, ModelsInfo
from app.services.model_service import model_service
from app.services.artifact_service import artifact_service

class InferenceService:
    def process_image(self, image_bytes: bytes, filename: str) -> PredictResponse:
        start_time = time.time()
        analysis_id = str(uuid.uuid4())
        
        # 1. Decode image safely using OpenCV & NumPy
        nparr = np.frombuffer(image_bytes, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image_bgr is None:
            raise ValueError("Failed to decode uploaded image. File is corrupt or in an unsupported format.")
        
        # Convert to RGB
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        height, width = image_rgb.shape[:2]
        
        # 2. Acquire lock to safely access models & SAM predictor
        with model_service.lock:
            yolo_model, sam_predictor = model_service.load_models()
            
            # Run YOLOv8m detection
            yolo_results = yolo_model.predict(
                source=image_rgb,
                imgsz=settings.YOLO_IMAGE_SIZE,
                conf=settings.DEFAULT_CONFIDENCE_THRESHOLD,
                device=settings.DEVICE,
                max_det=settings.MAX_DETECTIONS,
                verbose=False,
            )
            
            result = yolo_results[0]
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy().astype(int)
            
            masks: List[np.ndarray] = []
            sam_scores: List[float] = []
            
            # Run SAM 2.1 segmentation if detections exist
            if len(boxes) > 0:
                sam_predictor.set_image(image_rgb)
                for box in boxes:
                    try:
                        predicted_masks, quality_scores, _ = sam_predictor.predict(
                            box=box.astype(np.float32),
                            multimask_output=False,
                        )
                        masks.append(predicted_masks[0].astype(bool))
                        sam_scores.append(float(quality_scores[0]))
                    except Exception:
                        # Log and handle individual SAM object failure gracefully
                        masks.append(np.zeros((height, width), dtype=bool))
                        sam_scores.append(0.0)

        # 3. Create Artifacts
        analysis_dir = artifact_service.get_analysis_dir(analysis_id)
        masks_dir = analysis_dir / "masks"
        masks_dir.mkdir(parents=True, exist_ok=True)
        
        # Prepare overlay for annotated image
        overlay = image_rgb.copy()
        mask_color = np.array([0, 255, 100], dtype=np.float32)
        
        combined_mask = np.zeros((height, width), dtype=np.uint8)
        
        for mask in masks:
            if mask.any():
                overlay[mask] = (
                    0.55 * overlay[mask].astype(np.float32)
                    + 0.45 * mask_color
                ).astype(np.uint8)
                combined_mask[mask] = 255
                
        annotated_image = Image.fromarray(overlay)
        draw = ImageDraw.Draw(annotated_image)
        
        detections: List[DetectionItem] = []
        mask_urls: List[str] = []
        
        for index, (box, conf, cid, mask, s_score) in enumerate(
            zip(boxes, confidences, class_ids, masks, sam_scores),
            start=1,
        ):
            x1, y1, x2, y2 = map(int, box)
            class_name = yolo_model.names.get(int(cid), "bottle")
            
            # Draw box & label
            draw.rectangle([x1, y1, x2, y2], outline=(255, 50, 50), width=3)
            label = f"{class_name} {float(conf):.2f}"
            draw.text((max(0, x1), max(0, y1 - 18)), label, fill=(255, 255, 0))
            
            mask_pixels = int(mask.sum())
            mask_pct = (100.0 * mask_pixels / (height * width)) if (height * width) > 0 else 0.0
            
            # Save individual mask image
            mask_filename = f"object_{index}.png"
            mask_file_path = masks_dir / mask_filename
            Image.fromarray((mask.astype(np.uint8) * 255)).save(mask_file_path)
            
            mask_rel_url = f"/artifacts/{analysis_id}/masks/{mask_filename}"
            mask_urls.append(mask_rel_url)
            
            detections.append(DetectionItem(
                id=index,
                class_id=int(cid),
                class_name=class_name,
                confidence=round(float(conf), 4),
                bbox=[float(x1), float(y1), float(x2), float(y2)],
                sam_score=round(float(s_score), 4) if s_score > 0 else None,
                mask_area_pixels=mask_pixels,
                mask_area_percentage=round(mask_pct, 2),
                mask_url=mask_rel_url,
            ))
            
        # Save annotated image
        annotated_path = analysis_dir / "annotated.png"
        annotated_image.save(annotated_path)
        annotated_url = f"/artifacts/{analysis_id}/annotated.png"
        
        # Save combined mask image if masks exist
        combined_mask_url = None
        if len(masks) > 0:
            combined_path = analysis_dir / "combined_mask.png"
            Image.fromarray(combined_mask).save(combined_path)
            combined_mask_url = f"/artifacts/{analysis_id}/combined_mask.png"
            
        elapsed = round(time.time() - start_time, 3)
        
        response = PredictResponse(
            id=analysis_id,
            filename=filename,
            image_width=width,
            image_height=height,
            total_detections=len(detections),
            processing_time_seconds=elapsed,
            device=settings.DEVICE,
            models=ModelsInfo(detector="YOLOv8m", segmenter="SAM 2.1 Hiera Small"),
            detections=detections,
            annotated_image_url=annotated_url,
            mask_image_url=combined_mask_url,
            mask_urls=mask_urls,
            detection_model="YOLOv8m",
            segmentation_model="SAM 2.1 Hiera Small",
            created_at=datetime.utcnow().isoformat() + "Z",
        )
        
        # Persist metadata and index
        artifact_service.save_metadata(response)
        
        return response

inference_service = InferenceService()
