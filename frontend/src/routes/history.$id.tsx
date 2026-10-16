import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ResultsWorkspace } from "@/components/results/ResultsWorkspace";
import { EmptyHistory } from "@/components/dashboard/RecentAnalyses";
import { Button } from "@/components/ui/button";
import { useSessionHistory } from "@/lib/session-history";
import { useBackendHistory } from "@/hooks/useAnalysis";

export const Route = createFileRoute("/history/$id")({
  head: () => ({
    meta: [
      { title: "Analysis Result — Plastic Waste Detection" },
      { name: "description", content: "Detailed detection and segmentation result for a previous analysis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const session = useSessionHistory();
  const backend = useBackendHistory();
  const r = session.find((x) => x.id === id) ?? backend.data?.find((x) => x.id === id);
  return (
    <AppShell title="Analysis Result" crumb="Analysis History / Result">
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/history"><ArrowLeft className="h-4 w-4" />Back to history</Link></Button>
      {r ? (
        <>
          <h2 className="mb-4 truncate text-xl font-semibold">{r.filename}</h2>
          <ResultsWorkspace r={r} />
        </>
      ) : (
        <EmptyHistory />
      )}
    </AppShell>
  );
}
