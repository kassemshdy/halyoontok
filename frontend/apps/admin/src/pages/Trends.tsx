import { useState } from "react";
import { useLocale } from "@halyoontok/i18n";
import { useTrends, useCreateTrend } from "@/hooks/use-api";

export function TrendsPage() {
  const { t } = useLocale();
  const { data: signals = [] } = useTrends();
  const createTrend = useCreateTrend();
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState(""); const [topic, setTopic] = useState(""); const [country, setCountry] = useState("LB");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTrend.mutateAsync({ source, topic, country, relevance_score: 0.5 });
    setSource(""); setTopic(""); setShowForm(false);
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold">{t("trends.title")}</h1><p className="text-sm text-muted-foreground">{signals.length} {t("trends.signals_count")}</p></div>
        <button onClick={() => setShowForm(!showForm)} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">{showForm ? t("common.cancel") : t("trends.add")}</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 rounded-lg border border-border p-5 space-y-3">
          <input placeholder={t("trends.source_placeholder")} value={source} onChange={(e) => setSource(e.target.value)} className={inputClass} required />
          <input placeholder={t("trends.topic_placeholder")} value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} required />
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>
            <option value="LB">{t("country.LB")}</option><option value="IQ">{t("country.IQ")}</option><option value="SA">{t("country.SA")}</option><option value="AE">{t("country.AE")}</option>
          </select>
          <button type="submit" className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">{t("trends.save")}</button>
        </form>
      )}
      <div className="mt-6 space-y-2">
        {signals.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div><p className="text-sm font-medium">{s.topic}</p><p className="text-xs text-muted-foreground">{s.source} · {s.country || "—"}</p></div>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs">{(s.relevance_score * 100).toFixed(0)}%</span>
          </div>
        ))}
        {signals.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("trends.no_trends")}</p>}
      </div>
    </div>
  );
}
