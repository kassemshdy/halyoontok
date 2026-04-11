import { useLocale } from "@halyoontok/i18n";
import { useAnalyticsOverview } from "@/hooks/use-api";

export function AnalyticsPage() {
  const { t } = useLocale();
  const { data: stats, isLoading } = useAnalyticsOverview();

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" /></div>;

  const cards = stats ? [
    { label: t("analytics.total_videos"), value: stats.total_videos ?? 0 },
    { label: t("analytics.published_videos"), value: stats.published_videos ?? 0 },
    { label: t("analytics.total_watches"), value: stats.total_watches ?? 0 },
    { label: t("analytics.watch_time_min"), value: Math.round((stats.total_watch_time_seconds ?? 0) / 60) },
    { label: t("analytics.avg_duration"), value: stats.avg_watch_duration_seconds ?? 0 },
  ] : [];

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("analytics.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("analytics.subtitle")}</p>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border p-5">
            <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
