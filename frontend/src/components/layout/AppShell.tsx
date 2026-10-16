import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Cpu, History, LayoutDashboard, Menu, Plus, ScanSearch, Settings } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useHealth } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";

export const PROJECT_TITLE = "Plastic Waste Detection on Water Bodies Using Deep Learning";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze Image", icon: ScanSearch },
  { to: "/history", label: "Analysis History", icon: History },
  { to: "/about", label: "About the Model", icon: Cpu },
  { to: "/project", label: "Project Information", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map((n) => {
        const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
            <n.icon className="h-4 w-4 shrink-0" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-start gap-3">
      <Logo className="h-10 w-10 shrink-0" />
      <p className="text-[13px] font-semibold leading-snug text-foreground">{PROJECT_TITLE}</p>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <Brand />
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto rounded-lg border border-border bg-surface/60 p-3 text-xs text-muted-foreground">
        YOLOv8m detection + SAM 2.1 Hiera Small segmentation
      </div>
    </div>
  );
}

export function StatusPill() {
  const { data, isLoading, isError } = useHealth();
  const state = isLoading ? "checking" : isError || !data?.ok ? "offline" : "online";
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs" role="status">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          state === "online" && "bg-success shadow-glow",
          state === "offline" && "bg-destructive",
          state === "checking" && "animate-pulse bg-warning",
        )}
      />
      <span className="hidden text-muted-foreground sm:inline">Backend</span>
      <span className="font-medium">{state === "online" ? "Connected" : state === "offline" ? "Not connected" : "Checking…"}</span>
    </div>
  );
}

export function AppShell({ title, crumb, children }: { title: string; crumb?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-ocean">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarBody />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">Workspace / {crumb ?? title}</p>
              <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <StatusPill />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/analyze"><Plus className="h-4 w-4" />New analysis</Link>
            </Button>
            <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface" title={PROJECT_TITLE}>
              <Logo className="h-6 w-6" />
            </div>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      {desc && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}
