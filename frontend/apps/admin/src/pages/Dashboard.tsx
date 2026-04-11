import { Link } from "wouter";
import { useLocale } from "@halyoontok/i18n";
import { useAnalyticsOverview } from "@/hooks/use-api";

export function DashboardPage() {
  const { t } = useLocale();
  const { data: stats } = useAnalyticsOverview();

  const cards = stats ? [
    { label: t("analytics.total_videos"), value: stats.total_videos ?? 0 },
    { label: t("analytics.published_videos"), value: stats.published_videos ?? 0 },
    { label: t("analytics.total_watches"), value: stats.total_watches ?? 0 },
    { label: t("analytics.watch_time_min"), value: Math.round((stats.total_watch_time_seconds ?? 0) / 60) },
  ] : [];

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("dashboard.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("dashboard.welcome")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border p-5">
            <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-medium">{t("dashboard.quick_actions")}</h2>
      <div className="mt-3 flex gap-3">
        {[{ href: "/content/upload", label: t("content.upload") }, { href: "/moderation", label: t("nav.moderation") }, { href: "/studio", label: t("studio.new_idea") }].map((l) => (
          <Link key={l.href} href={l.href} className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
