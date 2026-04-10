"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stats {
  total_videos: number; published_videos: number;
  total_watches: number; total_watch_time_seconds: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/analytics/overview", { headers: authHeaders(token) })
      .then((r) => r.json()).then(setStats).catch(() => {});
  }, [token]);

  const cards = stats ? [
    { label: t("analytics.total_videos"), value: stats.total_videos },
    { label: t("analytics.published_videos"), value: stats.published_videos },
    { label: t("analytics.total_watches"), value: stats.total_watches },
    { label: t("analytics.watch_time_min"), value: Math.round(stats.total_watch_time_seconds / 60) },
  ] : [];

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("dashboard.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("dashboard.welcome")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      <h2 className="mt-8 text-sm font-medium">{t("dashboard.quick_actions")}</h2>
      <div className="mt-3 flex gap-3">
        <Button variant="outline" asChild><Link href="/content/upload">{t("content.upload")}</Link></Button>
        <Button variant="outline" asChild><Link href="/moderation">{t("nav.moderation")}</Link></Button>
        <Button variant="outline" asChild><Link href="/studio">{t("studio.new_idea")}</Link></Button>
      </div>
    </div>
  );
}
