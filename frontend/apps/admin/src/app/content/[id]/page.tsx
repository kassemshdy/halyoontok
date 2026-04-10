"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATUS_ACTIONS: Record<string, { labelKey: TranslationKey; next: string }[]> = {
  draft: [{ labelKey: "action.submit_moderation", next: "awaiting_moderation" }],
  awaiting_moderation: [{ labelKey: "action.approve", next: "approved" }, { labelKey: "action.request_changes", next: "changes_requested" }],
  changes_requested: [{ labelKey: "action.resubmit", next: "awaiting_moderation" }],
  approved: [{ labelKey: "action.publish", next: "published" }],
  published: [{ labelKey: "action.archive", next: "archived" }],
};
const STATUS_KEYS: Record<string, TranslationKey> = {
  draft: "status.draft", awaiting_moderation: "status.awaiting_moderation", changes_requested: "status.changes_requested",
  approved: "status.approved", published: "status.published", archived: "status.archived",
  scheduled: "status.scheduled", ai_generated: "status.ai_generated", awaiting_editor: "status.awaiting_editor",
};

interface Video {
  id: number;
  title: string;
  description: string | null;
  status: string;
  category: string;
  language: string;
  dialect: string;
  duration_seconds: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
}

export default function VideoDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/admin/content/videos/${id}`, { headers: authHeaders(token) }).then((r) => r.json()).then(setVideo).catch(() => {});
  }, [token, id]);

  const updateStatus = async (newStatus: string) => {
    if (!token || !id) return; setLoading(true);
    try {
      const res = await fetch(`/api/admin/content/videos/${id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.detail || "Failed"); return; }
      const data = await res.json();
      setVideo((prev) => prev ? { ...prev, status: data.status } : null);
    } finally { setLoading(false); }
  };

  if (!video) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" /></div>;

  const actions = STATUS_ACTIONS[video.status] || [];

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>← {t("content.back")}</Button>

      {/* Video Preview */}
      {video.video_url && (
        <Card className="mt-4">
          <CardContent className="p-0">
            <video
              src={video.video_url}
              poster={video.thumbnail_url || undefined}
              controls
              playsInline
              className="w-full rounded-t-lg bg-black"
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
          </CardContent>
        </Card>
      )}

      {/* Thumbnail only (no video) */}
      {!video.video_url && video.thumbnail_url && (
        <Card className="mt-4">
          <CardContent className="p-0">
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full rounded-t-lg bg-black object-contain"
              style={{ maxHeight: "400px" }}
            />
          </CardContent>
        </Card>
      )}

      {/* No media */}
      {!video.video_url && !video.thumbnail_url && (
        <Card className="mt-4">
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">No video uploaded yet</p>
          </CardContent>
        </Card>
      )}

      {/* Video Details */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{video.title}</CardTitle>
              <p className="text-xs text-muted-foreground">#{video.id}</p>
            </div>
            <Badge variant="outline">{STATUS_KEYS[video.status] ? t(STATUS_KEYS[video.status]) : video.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {video.description && <p className="text-sm text-muted-foreground">{video.description}</p>}

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">{t("content.category")}:</span> <span className="font-medium">{video.category}</span></div>
            <div><span className="text-muted-foreground">{t("content.language")}:</span> <span className="font-medium">{video.language} / {video.dialect}</span></div>
            <div><span className="text-muted-foreground">{t("content.duration")}:</span> <span className="font-medium">{video.duration_seconds ? `${video.duration_seconds}s` : "—"}</span></div>
          </div>

          {actions.length > 0 && (
            <>
              <Separator className="my-5" />
              <div className="flex gap-2">
                {actions.map((action, i) => (
                  <Button key={action.next} variant={i === 0 ? "default" : "outline"} size="sm" disabled={loading} onClick={() => updateStatus(action.next)}>
                    {t(action.labelKey)}
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
