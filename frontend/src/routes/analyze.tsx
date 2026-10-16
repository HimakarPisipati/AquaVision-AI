import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/layout/AppShell";
import { AnalysisRunner } from "@/components/upload/AnalysisRunner";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Image — Plastic Waste Detection on Water Bodies" },
      { name: "description", content: "Upload a water-body image to detect and segment plastic bottles with YOLOv8m and SAM 2.1." },
      { property: "og:title", content: "Analyze Image — Plastic Waste Detection" },
      { property: "og:description", content: "Run YOLOv8m detection and SAM 2.1 segmentation on your own image." },
    ],
  }),
  component: () => (
    <AppShell title="Analyze Image">
      <SectionTitle eyebrow="Inference" title="Image analysis" desc="Select an image, run the pipeline and inspect detections, masks and per-object metrics." />
      <AnalysisRunner />
    </AppShell>
  ),
});
