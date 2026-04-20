"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  country: string | null;
  category: string | null;
}

const SORT_OPTIONS = [
  { value: "virality_score", label: "Virality" },
  { value: "view_count", label: "Views" },
  { value: "engagement_rate", label: "Engagement" },
  { value: "created_at", label: "Newest" },
];

export default function LibraryPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<SocialVideo[]>([]);
  const [sortBy, setSortBy] = useState("virality_score");
  const [platform, setPlatform] = useState("");
  const [country, setCountry] = useState("");

  const fetchVideos = () => {
    if (!token) return;
    const params = new URLSearchParams({ sort_by: sortBy, limit: "100" });
    if (platform) params.set("platform", platform);
    if (country) params.set("country", country);
    fetch(`/api/admin/social-videos?${params}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setVideos)
      .catch(() => {});
  };

  useEffect(() => {
    fetchVideos();
  }, [token, sortBy, platform, country]);

  return (
    <div>
      <h1 className="text-lg font-semibold">Video Library</h1>
      <p className="text-sm text-muted-foreground">{videos.length} videos collected across platforms</p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={sortBy === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          <option value="">All Platforms</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          <option value="">All Countries</option>
          <option value="LB">Lebanon</option>
          <option value="IQ">Iraq</option>
          <option value="SA">Saudi Arabia</option>
          <option value="AE">UAE</option>
        </select>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <Card key={v.id} className="overflow-hidden">
            {v.thumbnail_url && (
              <img src={v.thumbnail_url} alt="" className="h-36 w-full object-cover" />
            )}
            <CardContent className="pt-3">
              <p className="text-sm font-medium line-clamp-2">{v.title}</p>
              <div className="mt-2 flex items-center gap-1 flex-wrap">
                <Badge variant="outline">{v.platform}</Badge>
                {v.country && <Badge variant="secondary">{v.country}</Badge>}
                {v.category && <Badge variant="secondary">{v.category}</Badge>}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{(v.view_count / 1000).toFixed(1)}K views</span>
                <span>{v.engagement_rate.toFixed(1)}% eng</span>
                <Badge variant={v.virality_score > 50 ? "default" : "outline"} className="text-xs">
                  {v.virality_score.toFixed(0)} viral
                </Badge>
              </div>
              {v.url && (
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-xs text-blue-600 hover:underline"
                >
                  View on {v.platform}
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {videos.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No videos in the library yet. Add channels and refresh to collect videos.
        </p>
      )}
    </div>
  );
}
