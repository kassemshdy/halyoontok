"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import Link from "next/link";

interface Stats {
  total_videos: number;
  published_videos: number;
  total_watches: number;
  total_watch_time_seconds: number;
  avg_watch_duration_seconds: number;
}

export default function DashboardPage() {
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

  const cards = stats
    ? [
        { label: t("analytics.total_videos"), value: stats.total_videos, color: "bg-blue-50 text-blue-700" },
        { label: t("analytics.published_videos"), value: stats.published_videos, color: "bg-green-50 text-green-700" },
        { label: t("analytics.total_watches"), value: stats.total_watches, color: "bg-purple-50 text-purple-700" },
        { label: t("analytics.watch_time_min"), value: Math.round(stats.total_watch_time_seconds / 60), color: "bg-orange-50 text-orange-700" },
      ]
    : [];

  const quickLinks = [
    { href: "/content/upload", label: t("content.upload"), icon: "🎬" },
    { href: "/moderation", label: t("nav.moderation"), icon: "🛡️" },
    { href: "/studio", label: t("studio.new_idea"), icon: "💡" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
      <p className="mt-1 text-gray-500">{t("dashboard.welcome")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <p className="text-sm font-medium opacity-75">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">{t("dashboard.quick_actions")}</h2>
      <div className="mt-3 grid grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="font-medium text-gray-700">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
