"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats { total_videos: number; published_videos: number; total_watches: number; total_watch_time_seconds: number; avg_watch_duration_seconds: number; }

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { if (!token) return; fetch("/api/admin/analytics/overview", { headers: authHeaders(token) }).then((r) => r.json()).then(setStats).catch(() => {}); }, [token]);

  if (!stats) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" /></div>;

  const cards = [
    { label: t("analytics.total_videos"), value: stats.total_videos ?? 0 },
    { label: t("analytics.published_videos"), value: stats.published_videos ?? 0 },
    { label: t("analytics.total_watches"), value: stats.total_watches ?? 0 },
    { label: t("analytics.watch_time_min"), value: Math.round((stats.total_watch_time_seconds ?? 0) / 60) },
    { label: t("analytics.avg_duration"), value: stats.avg_watch_duration_seconds ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("analytics.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("analytics.subtitle")}</p>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
