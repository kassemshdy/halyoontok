"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";

interface Stats {
  total_videos: number;
  published_videos: number;
  total_watches: number;
  total_watch_time_seconds: number;
  avg_watch_duration_seconds: number;
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/analytics/overview", { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [token]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: t("analytics.total_videos"), value: stats.total_videos, icon: "🎬", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: t("analytics.published_videos"), value: stats.published_videos, icon: "✅", color: "bg-green-50 text-green-700 border-green-200" },
    { label: t("analytics.total_watches"), value: stats.total_watches, icon: "👁️", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { label: t("analytics.watch_time_min"), value: Math.round(stats.total_watch_time_seconds / 60), icon: "⏱️", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { label: t("analytics.avg_duration"), value: stats.avg_watch_duration_seconds, icon: "📊", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("analytics.title")}</h1>
      <p className="mt-1 text-gray-500">{t("analytics.subtitle")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{card.icon}</span>
              <p className="text-sm font-medium opacity-75">{card.label}</p>
            </div>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
