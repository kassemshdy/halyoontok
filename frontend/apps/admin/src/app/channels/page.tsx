"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SocialChannel {
  id: number;
  platform: string;
  platform_channel_id: string;
  name: string;
  handle: string | null;
  country: string | null;
  category: string | null;
  subscriber_count: number | null;
  status: string;
  last_scraped_at: string | null;
}

const PLATFORMS = ["youtube", "tiktok", "instagram"] as const;

export default function ChannelsPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [activePlatform, setActivePlatform] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState<string>("youtube");
  const [channelId, setChannelId] = useState("");
  const [country, setCountry] = useState("LB");
  const [loading, setLoading] = useState(false);

  const fetchChannels = () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (activePlatform) params.set("platform", activePlatform);
    fetch(`/api/admin/channels?${params}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setChannels)
      .catch(() => {});
  };

  useEffect(() => {
    fetchChannels();
  }, [token, activePlatform]);

  const addChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    await fetch("/api/admin/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ platform, platform_channel_id: channelId, country }),
    });
    setChannelId("");
    setShowForm(false);
    setLoading(false);
    fetchChannels();
  };

  const refreshChannel = async (id: number) => {
    if (!token) return;
    await fetch(`/api/admin/channels/${id}/refresh`, {
      method: "POST",
      headers: authHeaders(token),
    });
  };

  const platformColor = (p: string) => {
    if (p === "youtube") return "destructive";
    if (p === "tiktok") return "default";
    return "secondary";
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Social Channels</h1>
          <p className="text-sm text-muted-foreground">{channels.length} channels tracked</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Channel"}
        </Button>
      </div>

      {/* Platform Tabs */}
      <div className="mt-4 flex gap-2">
        <Button
          variant={activePlatform === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setActivePlatform("")}
        >
          All
        </Button>
        {PLATFORMS.map((p) => (
          <Button
            key={p}
            variant={activePlatform === p ? "default" : "outline"}
            size="sm"
            onClick={() => setActivePlatform(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <form onSubmit={addChannel} className="space-y-3">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <Input
                placeholder="Channel ID (e.g. UCxxxxxxx for YouTube)"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                required
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="LB">Lebanon</option>
                <option value="IQ">Iraq</option>
                <option value="SA">Saudi Arabia</option>
                <option value="AE">UAE</option>
                <option value="JO">Jordan</option>
                <option value="EG">Egypt</option>
              </select>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Channel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        {channels.map((ch) => (
          <Link key={ch.id} href={`/channels/${ch.id}`}>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{ch.name}</p>
                    <Badge variant={platformColor(ch.platform)}>{ch.platform}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ch.handle || ch.platform_channel_id} · {ch.country || "—"} ·{" "}
                    {ch.subscriber_count ? `${(ch.subscriber_count / 1000).toFixed(1)}K subs` : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{ch.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      refreshChannel(ch.id);
                    }}
                  >
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {channels.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No channels tracked yet. Add your first channel above.
          </p>
        )}
      </div>
    </div>
  );
}
