import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError, getApiBaseUrl } from "@/lib/api";
import { sessionHistory } from "@/lib/session-history";
import type { AnalysisResult } from "@/types/api";

export type AnalysisStage = "idle" | "uploading" | "done" | "error";

export function useAnalysis() {
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (stage !== "uploading") return;
    const start = Date.now();
    const t = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(t);
  }, [stage]);

  const run = useCallback(async (file: File, previewUrl: string) => {
    setStage("uploading");
    setError(null);
    setResult(null);
    setElapsed(0);
    try {
      const r = await api.predict(file);
      const withOriginal = { ...r, originalImageUrl: previewUrl };
      sessionHistory.add(withOriginal);
      setResult(withOriginal);
      setStage("done");
      toast.success(`Analysis complete — ${r.totalDetections} bottle${r.totalDetections === 1 ? "" : "s"} detected`);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Unexpected error during analysis.";
      setError(msg);
      setStage("error");
      toast.error("Analysis failed", { description: msg });
    }
  }, []);

  const reset = useCallback(() => {
    setStage("idle");
    setResult(null);
    setError(null);
  }, []);

  return { stage, result, error, elapsed, run, reset, setResult };
}

export function useHealth() {
  return useQuery({
    queryKey: ["health", getApiBaseUrl()],
    queryFn: api.health,
    retry: false,
    refetchInterval: 30_000,
    enabled: typeof window !== "undefined",
  });
}

export function useMetrics() {
  return useQuery({ queryKey: ["metrics", getApiBaseUrl()], queryFn: api.metrics, retry: false, enabled: typeof window !== "undefined" });
}

export function useBackendHistory() {
  return useQuery({ queryKey: ["history", getApiBaseUrl()], queryFn: api.history, retry: false, enabled: typeof window !== "undefined" });
}
