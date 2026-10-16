/** Proposed API contract. Adapt mapping in src/lib/api.ts to the real FastAPI response. */

export type BBox = [number, number, number, number]; // x1, y1, x2, y2 (pixels)

export interface Detection {
  id: number;
  className: string;
  confidence: number; // YOLO confidence 0..1
  bbox: BBox;
  samScore?: number | undefined; // SAM predicted mask quality (predicted IoU) 0..1
  maskAreaPixels?: number | undefined;
  maskAreaPercentage?: number | undefined;
  maskUrl?: string | undefined;
}

export interface AnalysisResult {
  id: string;
  filename: string;
  imageWidth?: number | undefined;
  imageHeight?: number | undefined;
  totalDetections: number;
  processingTimeSeconds?: number | undefined;
  detections: Detection[];
  annotatedImageUrl?: string | undefined;
  maskImageUrl?: string | undefined;
  maskUrls: string[];
  detectionModel?: string | undefined;
  segmentationModel?: string | undefined;
  device?: string | undefined;
  createdAt?: string | undefined;
  /** Local object URL of the uploaded original (client-side only). */
  originalImageUrl?: string | undefined;
}

export interface HealthStatus {
  ok: boolean;
  message?: string | undefined;
  device?: string | undefined;
}

export interface ModelMetrics {
  precision?: number | undefined;
  recall?: number | undefined;
  map50?: number | undefined;
  map50_95?: number | undefined;
}

/** Raw shapes the backend may return (loosely typed for flexible mapping). */
export interface RawDetection {
  class_name?: string | undefined;
  label?: string | undefined;
  confidence?: number | undefined;
  score?: number | undefined;
  bbox?: number[] | undefined;
  box?: number[] | undefined;
  sam_score?: number | undefined;
  predicted_iou?: number | undefined;
  mask_area_pixels?: number | undefined;
  mask_area?: number | undefined;
  mask_area_percentage?: number | undefined;
  mask_url?: string | undefined;
}

export interface RawPredictResponse {
  id?: string | undefined;
  filename?: string | undefined;
  image_width?: number | undefined;
  image_height?: number | undefined;
  total_detections?: number | undefined;
  processing_time_seconds?: number | undefined;
  processing_time?: number | undefined;
  detections?: RawDetection[] | undefined;
  annotated_image_url?: string | undefined;
  annotated_image?: string | undefined;
  annotated_image_base64?: string | undefined;
  mask_image_url?: string | undefined;
  mask_urls?: string[] | undefined;
  detection_model?: string | undefined;
  segmentation_model?: string | undefined;
  device?: string | undefined;
  created_at?: string | undefined;
}
