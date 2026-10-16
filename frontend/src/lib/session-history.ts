import { useSyncExternalStore } from "react";
import type { AnalysisResult } from "@/types/api";

/** In-memory history for the current browser tab only (lost on reload). */
let items: AnalysisResult[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const sessionHistory = {
  add(r: AnalysisResult) {
    items = [r, ...items.filter((i) => i.id !== r.id)];
    emit();
  },
  remove(id: string) {
    items = items.filter((i) => i.id !== id);
    emit();
  },
  get(id: string) {
    return items.find((i) => i.id === id);
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  snapshot: () => items,
};

const EMPTY: AnalysisResult[] = [];
export function useSessionHistory() {
  return useSyncExternalStore(sessionHistory.subscribe, sessionHistory.snapshot, () => EMPTY);
}

export function maxConfidence(r: AnalysisResult) {
  return r.detections.length ? Math.max(...r.detections.map((d) => d.confidence)) : undefined;
}
export function avgConfidence(r: AnalysisResult) {
  return r.detections.length ? r.detections.reduce((s, d) => s + d.confidence, 0) / r.detections.length : undefined;
}
export const pct = (v?: number) => (v === undefined ? "—" : `${(v * 100).toFixed(1)}%`);
