import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone, type SelectedImage } from "./UploadZone";
import { ResultsWorkspace } from "@/components/results/ResultsWorkspace";
import { useAnalysis } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";

const STEPS = ["Image uploaded", "Detecting objects with YOLOv8m", "Generating segmentation masks with SAM 2.1", "Preparing results"];

export function Workflow({ hasImage, stage }: { hasImage: boolean; stage: string }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {STEPS.map((s, i) => {
        const done = (i === 0 && hasImage) || stage === "done";
        const running = stage === "uploading" && i > 0;
        return (
          <li key={s} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs", done ? "border-primary/40 bg-primary/10" : "border-border bg-surface/40")}>
            {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : running ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" /> : <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border text-[10px]">{i + 1}</span>}
            <span className={done ? "text-foreground" : "text-muted-foreground"}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function AnalysisRunner({ compact }: { compact?: boolean }) {
  const [img, setImg] = useState<SelectedImage | null>(null);
  const { stage, result, error, elapsed, run, reset } = useAnalysis();
  const busy = stage === "uploading";

  return (
    <div className="flex flex-col gap-6">
      <div className={cn("panel p-5 sm:p-6", compact && "p-5")}>
        <UploadZone value={img} onChange={(v) => { setImg(v); reset(); }} disabled={busy} />
        <div className="mt-5"><Workflow hasImage={!!img} stage={stage} /></div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="lg" className="bg-gradient-primary shadow-glow" disabled={!img || busy} onClick={() => img && run(img.file, img.url)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {busy ? "Analyzing…" : "Run Analysis"}
          </Button>
          {busy && <span className="text-sm text-muted-foreground" aria-live="polite">Waiting for the backend · {elapsed.toFixed(1)} s elapsed</span>}
          {stage === "done" && (
            <Button variant="outline" onClick={() => { setImg(null); reset(); }}><RotateCcw className="h-4 w-4" />Analyze another image</Button>
          )}
        </div>
        <AnimatePresence>
          {stage === "error" && error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="flex-1"><p className="font-medium">Analysis failed</p><p className="text-muted-foreground">{error}</p></div>
              <Button size="sm" variant="outline" onClick={() => img && run(img.file, img.url)}>Retry</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {result && <ResultsWorkspace r={result} />}
    </div>
  );
}
