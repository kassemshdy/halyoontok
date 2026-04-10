"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface GenerationJob {
  id: number;
  prompt: string;
  model_name: string;
  status: string;
  reference_video_id: number | null;
  trend_signal_id: number | null;
  output_video_id: number | null;
  error_message: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  queued: "secondary",
  generating: "default",
  post_processing: "default",
  completed: "outline",
  failed: "destructive",
};

export default function GenerationPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [modelName, setModelName] = useState("nano_banana");
  const [referenceVideoId, setReferenceVideoId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchJobs = () => {
    if (!token) return;
    fetch("/api/admin/generation/jobs", { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setJobs)
      .catch(() => {});
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    const body: Record<string, unknown> = { prompt, model_name: modelName };
    if (referenceVideoId) body.reference_video_id = parseInt(referenceVideoId);
    await fetch("/api/admin/generation/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    });
    setPrompt("");
    setReferenceVideoId("");
    setShowForm(false);
    setLoading(false);
    fetchJobs();
  };

  const retryJob = async (jobId: number) => {
    if (!token) return;
    await fetch(`/api/admin/generation/jobs/${jobId}/retry`, {
      method: "POST",
      headers: authHeaders(token),
    });
    fetchJobs();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">AI Video Generation</h1>
          <p className="text-sm text-muted-foreground">{jobs.length} generation jobs</p>
        </div>
        <div className="flex gap-2">
          <Link href="/generation/templates">
            <Button variant="outline">Templates</Button>
          </Link>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "New Generation"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <form onSubmit={createJob} className="space-y-3">
              <textarea
                placeholder="Describe the video you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                required
              />
              <div className="flex gap-3">
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="nano_banana">Nano Banana</option>
                  <option value="custom_1">Custom Model 1</option>
                </select>
                <Input
                  placeholder="Reference video ID (optional)"
                  value={referenceVideoId}
                  onChange={(e) => setReferenceVideoId(e.target.value)}
                  className="flex-1"
                  type="number"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Start Generation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{job.prompt}</p>
                <p className="text-xs text-muted-foreground">
                  Model: {job.model_name} · Job #{job.id}
                  {job.reference_video_id && ` · Ref: #${job.reference_video_id}`}
                  {job.output_video_id && (
                    <Link href={`/content/${job.output_video_id}`} className="text-blue-600 hover:underline ms-1">
                      View Video
                    </Link>
                  )}
                </p>
                {job.error_message && (
                  <p className="text-xs text-red-600 mt-1">{job.error_message}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_COLORS[job.status] as "default" | "secondary" | "destructive" | "outline" || "outline"}>
                  {job.status}
                </Badge>
                {job.status === "failed" && (
                  <Button variant="ghost" size="sm" onClick={() => retryJob(job.id)}>
                    Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No generation jobs yet. Create your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
