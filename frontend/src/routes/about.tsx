import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FileOutput, Image as ImageIcon, Layers, ScanSearch, SquareDashed } from "lucide-react";
import { AppShell, SectionTitle } from "@/components/layout/AppShell";
import { useMetrics } from "@/hooks/useAnalysis";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Model — YOLOv8m + SAM 2.1 Pipeline" },
      { name: "description", content: "How YOLOv8m detection and SAM 2.1 Hiera Small segmentation work together to find plastic bottles." },
      { property: "og:title", content: "About the Model — YOLOv8m + SAM 2.1" },
      { property: "og:description", content: "The computer-vision pipeline behind plastic bottle detection on water bodies." },
    ],
  }),
  component: About,
});

const PIPE = [
  { t: "Input Image", i: ImageIcon },
  { t: "YOLOv8m Detection", i: ScanSearch },
  { t: "Bounding-Box Prompts", i: SquareDashed },
  { t: "SAM 2.1 Segmentation", i: Layers },
  { t: "Annotated Results & Metadata", i: FileOutput },
];

const FACTS = [
  ["Dataset", "Roboflow, YOLO object-detection format"],
  ["Total images observed", "4,803"],
  ["Classes", "1"],
  ["Class name", "bottle"],
  ["Training image size", "640 × 640 configuration"],
  ["SAM integration device", "CPU"],
];

function About() {
  const m = useMetrics();
  const fmt = (v?: number) => (m.isSuccess && v !== undefined ? v.toFixed(3) : "Not available");
  return (
    <AppShell title="About the Model">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="panel p-6">
          <ScanSearch className="h-6 w-6 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Model 1 · YOLOv8m</h3>
          <p className="mt-2 text-sm text-muted-foreground">Performs single-class object detection for the <code className="text-accent-foreground">bottle</code> class. For every detected object it returns a bounding box and a confidence score.</p>
        </div>
        <div className="panel p-6">
          <Layers className="h-6 w-6 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Model 2 · SAM 2.1 Hiera Small</h3>
          <p className="mt-2 text-sm text-muted-foreground">Receives the YOLO-predicted bounding boxes as prompts and generates a segmentation mask per object. SAM is used as a pretrained segmentation component and has <strong className="text-foreground">not been fine-tuned</strong> on this dataset.</p>
        </div>
      </div>

      <section className="mt-12">
        <SectionTitle eyebrow="Pipeline" title="From image to annotated result" />
        <div className="panel flex flex-col items-stretch gap-3 p-5 lg:flex-row lg:items-center">
          {PIPE.map((p, i) => (
            <div key={p.t} className="flex flex-1 items-center gap-3 lg:flex-col lg:text-center">
              <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface/60 p-4 lg:flex-col">
                <p.i className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium">{p.t}</span>
              </motion.div>
              {i < PIPE.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Technical" title="Dataset & configuration" />
          <dl className="panel divide-y divide-border">
            {FACTS.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
            ))}
          </dl>
        </div>
        <div>
          <SectionTitle eyebrow="Evaluation" title="YOLO detection metrics" />
          <div className="grid grid-cols-2 gap-3">
            {([["Precision", m.data?.precision], ["Recall", m.data?.recall], ["mAP@0.5", m.data?.map50], ["mAP@0.5:0.95", m.data?.map50_95]] as const).map(([k, v]) => (
              <div key={k} className="panel p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-lg font-semibold tabular-nums">{fmt(v)}</p></div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Values load from the backend's verified evaluation results. These are object-detection metrics only and do not measure SAM segmentation quality.</p>
        </div>
      </section>
    </AppShell>
  );
}
