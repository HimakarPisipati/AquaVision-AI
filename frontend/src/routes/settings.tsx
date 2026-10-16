import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, SectionTitle } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ENDPOINTS, getApiBaseUrl, setApiBaseUrl } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Plastic Waste Detection" },
      { name: "description", content: "Configure the FastAPI backend URL and test the connection." },
      { property: "og:title", content: "Settings — Plastic Waste Detection" },
      { property: "og:description", content: "Backend connection settings." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);
  useEffect(() => setUrl(getApiBaseUrl()), []);

  const save = () => {
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL, e.g. http://localhost:8000");
      return;
    }
    setApiBaseUrl(url);
    qc.invalidateQueries();
    toast.success("Backend URL saved");
  };
  const test = async () => {
    setTesting(true);
    try {
      await api.health();
      toast.success("Backend reachable");
    } catch (e) {
      toast.error("Connection failed", { description: (e as Error).message });
    } finally {
      setTesting(false);
      qc.invalidateQueries({ queryKey: ["health"] });
    }
  };

  return (
    <AppShell title="Settings">
      <SectionTitle eyebrow="Backend" title="FastAPI connection" desc="Overrides VITE_API_BASE_URL for this browser. The backend must allow this site's origin via CORS." />
      <div className="panel max-w-2xl p-6">
        <Label htmlFor="api">Backend base URL</Label>
        <Input id="api" className="mt-2 font-mono" value={url} onChange={(e) => setUrl(e.target.value)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={save}>Save</Button>
          <Button variant="outline" onClick={test} disabled={testing}>{testing ? "Testing…" : "Test connection"}</Button>
          <Button variant="ghost" onClick={() => { setApiBaseUrl(null); setUrl(getApiBaseUrl()); qc.invalidateQueries(); toast.success("Reset to default"); }}>Reset</Button>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-surface/60 p-4 text-xs">
          <p className="mb-2 font-semibold">Expected endpoints</p>
          <ul className="space-y-1 font-mono text-muted-foreground">
            <li>GET  {ENDPOINTS.health}</li><li>POST {ENDPOINTS.predict}  (multipart field "file")</li>
            <li>GET  {ENDPOINTS.history}  (optional)</li><li>GET  {ENDPOINTS.metrics}  (optional)</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
