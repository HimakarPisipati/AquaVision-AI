import { Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maxConfidence, pct } from "@/lib/session-history";
import type { AnalysisResult } from "@/types/api";

export function EmptyHistory() {
  return (
    <div className="panel flex flex-col items-center gap-3 p-10 text-center">
      <Inbox className="h-9 w-9 text-muted-foreground" />
      <p className="font-medium">No analyses yet</p>
      <p className="max-w-sm text-sm text-muted-foreground">Results appear here after you run an analysis. Session history is kept only in this browser tab.</p>
      <Button asChild size="sm"><Link to="/analyze">Start an analysis</Link></Button>
    </div>
  );
}

export function AnalysesTable({ items, onDelete }: { items: AnalysisResult[]; onDelete?: ((id: string) => void) | undefined }) {
  if (!items.length) return <EmptyHistory />;
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr className="border-b border-border">
            <th className="p-4 font-medium">Image</th><th className="p-4 font-medium">Bottles</th><th className="p-4 font-medium">Top confidence</th>
            <th className="p-4 font-medium">Duration</th><th className="p-4 font-medium">Date</th><th className="p-4" />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
              <td className="max-w-[220px] truncate p-4 font-medium">{r.filename}</td>
              <td className="p-4 tabular-nums">{r.totalDetections}</td>
              <td className="p-4 tabular-nums">{pct(maxConfidence(r))}</td>
              <td className="p-4 tabular-nums">{r.processingTimeSeconds !== undefined ? `${r.processingTimeSeconds.toFixed(2)} s` : "—"}</td>
              <td className="p-4 text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline"><Link to="/history/$id" params={{ id: r.id }}>View results</Link></Button>
                  {onDelete && <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>Delete</Button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
