"use client";

import { useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

interface TrendPattern {
  category: string;
  video_count: number;
  avg_engagement: number;
  avg_virality: number;
  total_views: number;
}

export default function SearchPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SocialVideo[]>([]);
  const [patterns, setPatterns] = useState<TrendPattern[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "patterns">("search");

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !query.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/admin/search/videos?q=${encodeURIComponent(query)}`, {
      headers: authHeaders(token),
    });
    const data = await res.json();
    setResults(data);
    setSearching(false);
  };

  const fetchPatterns = async () => {
    if (!token) return;
    const res = await fetch("/api/admin/search/trending-patterns", {
      headers: authHeaders(token),
    });
    const data = await res.json();
    setPatterns(data);
  };

  return (
    <div>
      <h1 className="text-lg font-semibold">Search & Discover</h1>

      <div className="mt-4 flex gap-2">
        <Button
          variant={activeTab === "search" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("search")}
        >
          Search Videos
        </Button>
        <Button
          variant={activeTab === "patterns" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTab("patterns");
            fetchPatterns();
          }}
        >
          Trending Patterns
        </Button>
      </div>

      {activeTab === "search" && (
        <>
          <form onSubmit={search} className="mt-4 flex gap-2">
            <Input
              placeholder="Search videos by title, description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            {results.map((v) => (
              <Card key={v.id}>
                <CardContent className="flex items-center gap-4 py-3">
                  {v.thumbnail_url && (
                    <img src={v.thumbnail_url} alt="" className="h-14 w-24 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.platform} · {(v.view_count / 1000).toFixed(1)}K views · {v.engagement_rate.toFixed(1)}% eng
                    </p>
                  </div>
                  <Badge variant={v.virality_score > 50 ? "default" : "outline"}>
                    {v.virality_score.toFixed(0)} viral
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {results.length === 0 && query && !searching && (
              <p className="py-8 text-center text-sm text-muted-foreground">No results found.</p>
            )}
          </div>
        </>
      )}

      {activeTab === "patterns" && (
        <div className="mt-6 space-y-2">
          {patterns.map((p) => (
            <Card key={p.category}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium capitalize">{p.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.video_count} videos · {(p.total_views / 1000).toFixed(0)}K total views
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <p className="text-xs text-muted-foreground">Avg Engagement</p>
                    <p className="text-sm font-medium">{p.avg_engagement.toFixed(1)}%</p>
                  </div>
                  <Badge variant={p.avg_virality > 30 ? "default" : "outline"}>
                    {p.avg_virality.toFixed(0)} viral
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {patterns.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No trending patterns detected yet. Collect more video data first.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
