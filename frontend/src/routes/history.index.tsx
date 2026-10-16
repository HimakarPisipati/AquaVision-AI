import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Info, LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AnalysesTable, EmptyHistory } from "@/components/dashboard/RecentAnalyses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { maxConfidence, pct, sessionHistory, useSessionHistory } from "@/lib/session-history";
import { useBackendHistory } from "@/hooks/useAnalysis";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "Analysis History — Plastic Waste Detection" },
      { name: "description", content: "Review previous plastic bottle detection and segmentation analyses." },
      { property: "og:title", content: "Analysis History — Plastic Waste Detection" },
      { property: "og:description", content: "Search, sort and reopen previous analyses." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const session = useSessionHistory();
  const backend = useBackendHistory();
  const fromBackend = backend.isSuccess;
  const all = fromBackend ? backend.data : session;
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("table");

  const items = useMemo(() => {
    let l = all.filter((r) => r.filename.toLowerCase().includes(q.toLowerCase()));
    if (filter === "with") l = l.filter((r) => r.totalDetections > 0);
    if (filter === "none") l = l.filter((r) => r.totalDetections === 0);
    return [...l].sort((a, b) => (sort === "date" ? (b.createdAt ?? "").localeCompare(a.createdAt ?? "") : b.totalDetections - a.totalDetections));
  }, [all, q, sort, filter]);

  const del = fromBackend
    ? undefined
    : (id: string) => {
        if (window.confirm("Delete this analysis from session history?")) {
          sessionHistory.remove(id);
          toast.success("Entry removed");
        }
      };

  return (
    <AppShell title="Analysis History">
      <div className="mb-5 flex items-start gap-2 rounded-lg border border-border bg-surface/60 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {fromBackend ? "Showing history persisted by the backend." : "Backend history endpoint unavailable — showing analyses from this browser tab only. They are lost on reload and do not sync across devices."}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by filename" className="pl-9" aria-label="Search by filename" />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44" aria-label="Sort"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="date">Newest first</SelectItem><SelectItem value="count">Most detections</SelectItem></SelectContent>
        </Select>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44" aria-label="Filter"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All outcomes</SelectItem><SelectItem value="with">With detections</SelectItem><SelectItem value="none">No detections</SelectItem></SelectContent>
        </Select>
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="View mode">
          <ToggleGroupItem value="table" aria-label="Table view"><List className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      {view === "table" ? (
        <AnalysesTable items={items} onDelete={del} />
      ) : items.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <div key={r.id} className="panel overflow-hidden">
              <div className="grid-lines aspect-video bg-background/60">
                {(r.annotatedImageUrl ?? r.originalImageUrl) && <img src={r.annotatedImageUrl ?? r.originalImageUrl} alt={r.filename} loading="lazy" className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="truncate font-medium">{r.filename}</p>
                <p className="text-xs text-muted-foreground">{r.totalDetections} bottles · top {pct(maxConfidence(r))}</p>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline"><Link to="/history/$id" params={{ id: r.id }}>View results</Link></Button>
                  {del && <Button size="sm" variant="ghost" onClick={() => del(r.id)}>Delete</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
