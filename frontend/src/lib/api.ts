import type {
  AnalysisResult,
  Detection,
  HealthStatus,
  ModelMetrics,
  RawDetection,
  RawPredictResponse,
} from "@/types/api";

const DEFAULT_BASE = "http://localhost:8000";
const STORAGE_KEY = "pwd.apiBaseUrl";

export const ENDPOINTS = {
  health: "/health",
  predict: "/predict",
  history: "/history",
  metrics: "/metrics",
} as const;

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return saved.replace(/\/+$/, "");
  }
  return (import.meta.env["VITE_API_BASE_URL"] || DEFAULT_BASE).replace(/\/+$/, "");
}

export function setApiBaseUrl(url: string | null) {
  if (url) window.localStorage.setItem(STORAGE_KEY, url.trim());
  else window.localStorage.removeItem(STORAGE_KEY);
}

export class ApiError extends Error {
  constructor(message: string, public status?: number, public kind: "network" | "http" | "timeout" | "parse" = "http") {
    super(message);
  }
}

/** Resolves absolute URLs, data URIs, raw base64, and relative paths. */
export function resolveImage(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (/^[A-Za-z0-9+/=\s]{200,}$/.test(value)) return `data:image/png;base64,${value.replace(/\s/g, "")}`;
  const base = getApiBaseUrl();
  try {
    return new URL(value.replace(/^\/?/, "/"), base + "/").toString();
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = 120_000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(getApiBaseUrl() + path, { ...init, signal: ctrl.signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw new ApiError("The request timed out.", undefined, "timeout");
    throw new ApiError("Could not reach the backend. Is the FastAPI server running and CORS enabled?", undefined, "network");
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (body.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch { /* ignore */ }
    throw new ApiError(`Backend error ${res.status}: ${detail}`, res.status, "http");
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("Backend returned an invalid response.", res.status, "parse");
  }
}

function mapDetection(d: RawDetection, i: number): Detection {
  const box = (d.bbox ?? d.box ?? [0, 0, 0, 0]).slice(0, 4) as Detection["bbox"];
  return {
    id: i + 1,
    className: d.class_name ?? d.label ?? "bottle",
    confidence: d.confidence ?? d.score ?? 0,
    bbox: box,
    samScore: d.sam_score ?? d.predicted_iou,
    maskAreaPixels: d.mask_area_pixels ?? d.mask_area,
    maskAreaPercentage: d.mask_area_percentage,
    maskUrl: resolveImage(d.mask_url),
  };
}

export function mapPredictResponse(raw: RawPredictResponse, fallbackName: string): AnalysisResult {
  const detections = (raw.detections ?? []).map(mapDetection);
  return {
    id: raw.id ?? crypto.randomUUID(),
    filename: raw.filename ?? fallbackName,
    imageWidth: raw.image_width,
    imageHeight: raw.image_height,
    totalDetections: raw.total_detections ?? detections.length,
    processingTimeSeconds: raw.processing_time_seconds ?? raw.processing_time,
    detections,
    annotatedImageUrl: resolveImage(raw.annotated_image_url ?? raw.annotated_image ?? raw.annotated_image_base64),
    maskImageUrl: resolveImage(raw.mask_image_url),
    maskUrls: (raw.mask_urls ?? []).map((u) => resolveImage(u)).filter((u): u is string => !!u),
    detectionModel: raw.detection_model,
    segmentationModel: raw.segmentation_model,
    device: raw.device,
    createdAt: raw.created_at ?? new Date().toISOString(),
  };
}

export const api = {
  async health(): Promise<HealthStatus> {
    const r = await request<{ status?: string; device?: string; message?: string }>(ENDPOINTS.health, {}, 5000);
    return { ok: !r.status || ["ok", "healthy", "up"].includes(r.status.toLowerCase()), device: r.device, message: r.message };
  },
  async predict(file: File): Promise<AnalysisResult> {
    const fd = new FormData();
    fd.append("file", file); // browser sets multipart boundary
    const raw = await request<RawPredictResponse>(ENDPOINTS.predict, { method: "POST", body: fd });
    return mapPredictResponse(raw, file.name);
  },
  async history(): Promise<AnalysisResult[]> {
    const raw = await request<RawPredictResponse[] | { items: RawPredictResponse[] }>(ENDPOINTS.history, {}, 10000);
    const list = Array.isArray(raw) ? raw : raw.items ?? [];
    return list.map((r) => mapPredictResponse(r, r.filename ?? "image"));
  },
  async metrics(): Promise<ModelMetrics> {
    return request<ModelMetrics>(ENDPOINTS.metrics, {}, 10000);
  },
};
