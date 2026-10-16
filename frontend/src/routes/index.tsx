import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Box, Cpu, Layers, ScanSearch, Tag } from "lucide-react";
import heroImg from "@/assets/hero-ocean.jpg";
import { AppShell, SectionTitle } from "@/components/layout/AppShell";
import { AnalysisRunner } from "@/components/upload/AnalysisRunner";
import { AnalysesTable } from "@/components/dashboard/RecentAnalyses";
import { Button } from "@/components/ui/button";
import { useSessionHistory } from "@/lib/session-history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Plastic Waste Detection on Water Bodies Using Deep Learning" },
      { name: "description", content: "Detect plastic bottles in water-body images with YOLOv8m and segment them with SAM 2.1." },
      { property: "og:title", content: "Plastic Waste Detection on Water Bodies Using Deep Learning" },
      { property: "og:description", content: "YOLOv8m detection + SAM 2.1 segmentation for environmental monitoring research." },
    ],
  }),
  component: Dashboard,
});

const CARDS = [
  { label: "Detection Model", value: "YOLOv8m", icon: ScanSearch },
  { label: "Segmentation Model", value: "SAM 2.1 Small", icon: Layers },
  { label: "Target Class", value: "Bottle", icon: Tag },
  { label: "Inference Device", value: "CPU", icon: Cpu },
];

function Dashboard() {
  const history = useSessionHistory();
  return (
    <AppShell title="Dashboard">
      <section className="panel relative overflow-hidden">
        <img src={heroImg} alt="Aerial view of dark ocean water with floating plastic bottles" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
        <div className="relative max-w-2xl px-6 py-14 sm:px-10 sm:py-20">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-accent-foreground">
            <Box className="h-3.5 w-3.5" /> Computer vision for ocean conservation
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            See Plastic Pollution. <span className="text-gradient">Understand Its Impact.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 text-base text-muted-foreground sm:text-lg">
            An AI-powered computer vision system that detects plastic bottles in water-body images and generates object-level segmentation masks to support environmental monitoring research.
          </motion.p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow"><Link to="/analyze">Analyze an Image <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/about">Explore the Technology</Link></Button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CARDS.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="panel p-5">
            <c.icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-lg font-semibold">{c.value}</p>
          </motion.div>
        ))}
      </section>

      <section className="mt-12">
        <SectionTitle eyebrow="Quick analysis" title="Upload a water-body image" desc="The image is sent to your FastAPI backend, which runs YOLOv8m and SAM 2.1 and returns the results." />
        <AnalysisRunner compact />
      </section>

      <section className="mt-12">
        <SectionTitle eyebrow="Session" title="Recent analyses" />
        <AnalysesTable items={history.slice(0, 5)} />
      </section>
    </AppShell>
  );
}
