import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PROJECT_TITLE } from "@/components/layout/AppShell";

export const Route = createFileRoute("/project")({
  head: () => ({
    meta: [
      { title: "Project Information — Plastic Waste Detection" },
      { name: "description", content: "Problem statement, objectives, architecture, dataset, limitations and future work." },
      { property: "og:title", content: "Project Information — Plastic Waste Detection" },
      { property: "og:description", content: "Academic overview of the plastic waste detection project." },
    ],
  }),
  component: Project,
});

const SECTIONS: { t: string; body: string[] }[] = [
  { t: "Problem statement", body: ["Plastic waste in rivers, lakes and coastal waters harms ecosystems, and manual surveying of water bodies is slow and difficult to scale. Automated visual detection can support monitoring research."] },
  { t: "Objectives", body: ["Detect plastic bottles in water-body images using a trained YOLOv8m model.", "Generate object-level segmentation masks with SAM 2.1 using detections as prompts.", "Present results, confidence scores and mask statistics in an accessible interface."] },
  { t: "System architecture", body: ["React + TypeScript frontend sends images via multipart/form-data to a Python FastAPI backend.", "The backend runs YOLOv8m inference, passes boxes to SAM 2.1 Hiera Small, and returns detections, masks and annotated images."] },
  { t: "Technologies used", body: ["YOLOv8m (Ultralytics), SAM 2.1 Hiera Small, Python, FastAPI, React, TypeScript, Tailwind CSS, Framer Motion."] },
  { t: "Dataset overview", body: ["Roboflow dataset in YOLO object-detection format, 4,803 images observed, one class: bottle."] },
  { t: "Model workflow", body: ["Input image → YOLOv8m detection → bounding-box prompts → SAM 2.1 segmentation → annotated results and exported metadata."] },
  { t: "Current limitations", body: ["The model detects bottles only — not every category of plastic waste.", "Successful inference does not guarantee generalization to all water bodies, weather, lighting conditions or camera viewpoints.", "SAM is not fine-tuned on this dataset and its mask quality score is a model prediction, not a measured ground-truth IoU.", "Inference runs on CPU, so processing can be slow for large images."] },
  { t: "Future enhancements", body: ["Expand to multiple plastic waste categories.", "Evaluate segmentation against ground-truth masks.", "GPU inference and video / drone footage support.", "Geotagging and long-term monitoring dashboards."] },
];

function Project() {
  return (
    <AppShell title="Project Information">
      <div className="panel mb-8 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Final-year computer vision project</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{PROJECT_TITLE}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <section key={s.t} className="panel p-6">
            <p className="text-xs font-mono text-primary">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
            {s.body.length === 1 ? (
              <p className="mt-2 text-sm text-muted-foreground">{s.body[0]}</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">{s.body.map((b) => <li key={b}>{b}</li>)}</ul>
            )}
          </section>
        ))}
      </div>
    </AppShell>
  );
}
