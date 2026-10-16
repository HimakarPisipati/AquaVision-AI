import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Maximize, Minus, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { avgConfidence, maxConfidence, pct } from "@/lib/session-history";
import type { AnalysisResult } from "@/types/api";

type View = "original" | "detection" | "segmentation" | "compare";

function Overlay({ r, boxes, masks }: { r: AnalysisResult; boxes: boolean; masks: boolean }) {
  const w = r.imageWidth;
  const h = r.imageHeight;
  return (
    <>
      {masks && r.maskImageUrl && <img src={r.maskImageUrl} alt="Segmentation mask overlay" className="absolute inset-0 h-full w-full object-contain opacity-60 mix-blend-screen" />}
      {masks && r.detections.map((d) => d.maskUrl && <img key={d.id} src={d.maskUrl} alt={`Mask for bottle ${d.id}`} className="absolute inset-0 h-full w-full object-contain opacity-60 mix-blend-screen" />)}
      {boxes && w && h && (
        <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {r.detections.map((d) => {
            const [x1, y1, x2, y2] = d.bbox;
            return (
              <g key={d.id}>
                <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke="var(--primary-glow)" strokeWidth={Math.max(2, w / 400)} />
                <text x={x1} y={Math.max(y1 - 6, 14)} fill="var(--primary-glow)" fontSize={Math.max(12, w / 60)} fontFamily="monospace">
                  #{d.id} {(d.confidence * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </>
  );
}

function Frame({ src, alt, zoom, children }: { src?: string | undefined; alt: string; zoom: number; children?: React.ReactNode }) {
  if (!src) return <div className="grid h-72 place-items-center text-sm text-muted-foreground">Image not returned by the backend.</div>;
  return (
    <div className="grid-lines max-h-[560px] overflow-auto rounded-lg bg-background/70">
      <div className="relative mx-auto origin-top transition-transform" style={{ width: `${zoom * 100}%` }}>
        <img src={src} alt={alt} className="block h-auto w-full" />
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ResultsWorkspace({ r }: { r: AnalysisResult }) {
  const [view, setView] = useState<View>("detection");
  const [zoom, setZoom] = useState(1);
  const [boxes, setBoxes] = useState(true);
  const [masks, setMasks] = useState(true);
  const canDrawBoxes = !!(r.imageWidth && r.imageHeight);
  const base = r.originalImageUrl;
  const annotated = r.annotatedImageUrl;

  const download = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  };

  const renderView = () => {
    if (view === "original") return <Frame src={base} alt="Original uploaded image" zoom={zoom} />;
    if (view === "detection")
      return canDrawBoxes && base ? (
        <Frame src={base} alt="Detection results" zoom={zoom}><Overlay r={r} boxes={boxes} masks={false} /></Frame>
      ) : (
        <Frame src={annotated} alt="Annotated detection image" zoom={zoom} />
      );
    if (view === "segmentation")
      return annotated ? (
        <Frame src={annotated} alt="Annotated segmentation image" zoom={zoom}>{canDrawBoxes && <Overlay r={r} boxes={boxes} masks={false} />}</Frame>
      ) : (
        <Frame src={base} alt="Segmentation results" zoom={zoom}><Overlay r={r} boxes={boxes && canDrawBoxes} masks={masks} /></Frame>
      );
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <div><p className="mb-1 text-xs text-muted-foreground">Original</p><Frame src={base} alt="Original" zoom={zoom} /></div>
        <div><p className="mb-1 text-xs text-muted-foreground">Annotated</p><Frame src={annotated ?? base} alt="Annotated" zoom={zoom}>{!annotated && <Overlay r={r} boxes={boxes && canDrawBoxes} masks={masks} />}</Frame></div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="panel p-4 sm:p-5" aria-label="Image viewer">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as View)}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="original">Original</TabsTrigger>
              <TabsTrigger value="detection">Detection</TabsTrigger>
              <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
              <TabsTrigger value="compare">Side-by-side</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}><Minus className="h-4 w-4" /></Button>
            <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}><Plus className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Fit to screen" onClick={() => setZoom(1)}><Maximize className="h-4 w-4" /></Button>
          </div>
        </div>
        {renderView()}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <Switch id="boxes" checked={boxes} onCheckedChange={setBoxes} disabled={!canDrawBoxes} />
              <Label htmlFor="boxes">Detection boxes</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="masks" checked={masks} onCheckedChange={setMasks} disabled={!r.maskImageUrl && !r.detections.some((d) => d.maskUrl)} />
              <Label htmlFor="masks">Segmentation masks</Label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={!annotated} onClick={() => annotated && download(annotated, `annotated_${r.filename}`)}>
              <Download className="h-4 w-4" />Annotated image
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!r.maskImageUrl && r.maskUrls.length === 0}
              onClick={() => [r.maskImageUrl, ...r.maskUrls].filter(Boolean).forEach((u, i) => download(u as string, `mask_${i + 1}.png`))}
            >
              <Download className="h-4 w-4" />Masks
            </Button>
          </div>
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="panel p-5" aria-label="Detection summary">
          <h3 className="mb-3 text-sm font-semibold">Detection summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Bottles detected" value={String(r.totalDetections)} />
            <Stat label="Highest confidence" value={pct(maxConfidence(r))} hint="YOLO" />
            <Stat label="Average confidence" value={pct(avgConfidence(r))} hint="computed from detections" />
            <Stat label="Processing time" value={r.processingTimeSeconds !== undefined ? `${r.processingTimeSeconds.toFixed(2)} s` : "—"} />
          </div>
          <dl className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Detection model</dt><dd>{r.detectionModel ?? "YOLOv8m"}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Segmentation model</dt><dd>{r.segmentationModel ?? "SAM 2.1 Hiera Small"}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Device</dt><dd>{r.device ?? "Not reported"}</dd></div>
          </dl>
        </section>

        <section aria-label="Detected objects" className="flex max-h-[520px] flex-col gap-3 overflow-auto pr-1">
          {r.detections.length === 0 ? (
            <div className="panel flex flex-col items-center gap-2 p-8 text-center">
              <SearchX className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No bottles detected</p>
              <p className="text-sm text-muted-foreground">The model found no objects above its confidence threshold in this image.</p>
            </div>
          ) : (
            r.detections.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="panel p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold">Bottle #{d.id}</p>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{d.className}</span>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div><dt className="text-muted-foreground">YOLO confidence</dt><dd className="text-sm font-semibold tabular-nums">{pct(d.confidence)}</dd></div>
                  <div><dt className="text-muted-foreground">SAM predicted mask quality</dt><dd className="text-sm font-semibold tabular-nums">{d.samScore !== undefined ? d.samScore.toFixed(3) : "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Mask area</dt><dd className="tabular-nums">{d.maskAreaPixels !== undefined ? `${d.maskAreaPixels.toLocaleString()} px` : "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Mask area %</dt><dd className="tabular-nums">{d.maskAreaPercentage !== undefined ? `${d.maskAreaPercentage.toFixed(2)}%` : "—"}</dd></div>
                  <div className="col-span-2"><dt className="text-muted-foreground">Bounding box (x1, y1, x2, y2)</dt><dd className="font-mono">{d.bbox.map((v) => Math.round(v)).join(", ")}</dd></div>
                </dl>
              </motion.div>
            ))
          )}
          {r.detections.length > 0 && (
            <p className="px-1 text-[11px] text-muted-foreground">SAM mask quality is the model's own predicted IoU, not a measured ground-truth IoU.</p>
          )}
        </section>
      </aside>
    </motion.div>
  );
}
