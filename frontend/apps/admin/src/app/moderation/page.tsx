"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QueueVideo {
  id: number;
  title: string;
  status: string;
  category: string;
  video_url: string | null;
  thumbnail_url: string | null;
}

export default function ModerationPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [queue, setQueue] = useState<QueueVideo[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchQueue = () => {
    if (!token) return;
    fetch("/api/admin/moderation/queue", { headers: authHeaders(token) })
      .then((r) => r.json()).then((data) => { if (Array.isArray(data)) setQueue(data); }).catch(() => {});
  };
  useEffect(() => { fetchQueue(); }, [token]);

  const decide = async (videoId: number, status: string) => {
    if (!token) return;
    setLoading(videoId);
    try {
      await fetch("/api/admin/moderation/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ video_id: videoId, status }),
      });
      fetchQueue();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("moderation.title")}</h1>
      <p className="text-sm text-muted-foreground">{queue.length} {t("moderation.waiting")}</p>

      {queue.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">{t("moderation.empty")}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {queue.map((v) => (
            <Card key={v.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    {v.thumbnail_url && (
                      <button
                        onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                        className="h-16 w-24 flex-shrink-0 overflow-hidden rounded border border-border bg-muted"
                      >
                        <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      </button>
                    )}
                    <div>
                      <p className="text-sm font-medium">{v.title}</p>
                      <p className="text-xs text-muted-foreground">#{v.id} · {v.category}</p>
                      {v.video_url && (
                        <button
                          onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                          className="mt-1 text-xs text-foreground underline underline-offset-2"
                        >
                          {expandedId === v.id ? "Hide preview" : "Preview video"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={loading === v.id} onClick={() => decide(v.id, "approved")}>
                      {t("action.approve")}
                    </Button>
                    <Button size="sm" variant="outline" disabled={loading === v.id} onClick={() => decide(v.id, "changes_requested")}>
                      {t("action.request_changes")}
                    </Button>
                    <Button size="sm" variant="outline" disabled={loading === v.id} onClick={() => decide(v.id, "rejected")}>
                      {t("action.reject")}
                    </Button>
                  </div>
                </div>

                {/* Expanded video preview */}
                {expandedId === v.id && v.video_url && (
                  <div className="mt-4">
                    <video
                      src={v.video_url}
                      poster={v.thumbnail_url || undefined}
                      controls
                      playsInline
                      className="w-full rounded bg-black"
                      style={{ maxHeight: "300px", objectFit: "contain" }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
