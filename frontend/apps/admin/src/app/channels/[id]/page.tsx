"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth, authHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Channel {
  id: number;
  platform: string;
  name: string;
  handle: string | null;
  description: string | null;
  country: string | null;
  category: string | null;
  subscriber_count: number | null;
  status: string;
}

interface SocialVideo {
  id: number;
  title: string;
  platform: string;
  view_count: number;
  like_count: number;
  engagement_rate: number;
  virality_score: number;
  thumbnail_url: string | null;
  url: string | null;
}

export default function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<SocialVideo[]>([]);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/admin/channels/${id}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setChannel)
      .catch(() => {});
    fetch(`/api/admin/social-videos?channel_id=${id}&sort_by=virality_score&limit=50`, {
      headers: authHeaders(token),
    })
      .then((r) => r.json())
      .then(setVideos)
      .catch(() => {});
  }, [token, id]);

  const refresh = async () => {
    if (!token) return;
    await fetch(`/api/admin/channels/${id}/refresh`, {
      method: "POST",
      headers: authHeaders(token),
    });
  };

  if (!channel) return <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">
            <Badge variant="outline">{channel.platform}</Badge> · {channel.handle || "—"} ·{" "}
            {channel.country || "—"} ·{" "}
            {channel.subscriber_count ? `${(channel.subscriber_count / 1000).toFixed(1)}K subs` : "—"}
          </p>
          {channel.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{channel.description}</p>
          )}
        </div>
        <Button onClick={refresh}>Refresh Videos</Button>
      </div>

      <h2 className="mt-8 text-base font-semibold">Videos ({videos.length})</h2>
      <div className="mt-4 space-y-2">
        {videos.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex items-center gap-4 py-3">
              {v.thumbnail_url && (
                <img src={v.thumbnail_url} alt="" className="h-16 w-28 rounded object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{v.title}</p>
                <p className="text-xs text-muted-foreground">
                  {(v.view_count / 1000).toFixed(1)}K views · {v.like_count} likes · {v.engagement_rate.toFixed(1)}% engagement
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={v.virality_score > 50 ? "default" : "outline"}>
                  {v.virality_score.toFixed(0)} viral
                </Badge>
                {v.url && (
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {videos.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No videos collected yet. Click Refresh to fetch videos.
          </p>
        )}
      </div>
    </div>
  );
}
