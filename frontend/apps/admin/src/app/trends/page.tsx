"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";

interface TrendSignal {
  id: number;
  source: string;
  topic: string;
  format_type: string | null;
  relevance_score: number;
  country: string | null;
}

export default function TrendsPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [signals, setSignals] = useState<TrendSignal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState("");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("LB");

  const fetchSignals = () => {
    if (!token) return;
    fetch("/api/admin/trends/signals", { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setSignals)
      .catch(() => {});
  };

  useEffect(() => { fetchSignals(); }, [token]);

  const createSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await fetch("/api/admin/trends/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ source, topic, country, relevance_score: 0.5 }),
    });
    setSource(""); setTopic(""); setShowForm(false);
    fetchSignals();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("trends.title")}</h1>
          <p className="mt-1 text-gray-500">{signals.length} {t("trends.signals_count")}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {showForm ? t("common.cancel") : t("trends.add")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createSignal} className="mt-4 rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <input type="text" placeholder={t("trends.source_placeholder")} value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" required />
          <input type="text" placeholder={t("trends.topic_placeholder")} value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" required />
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
            <option value="LB">{t("country.LB")}</option>
            <option value="IQ">{t("country.IQ")}</option>
            <option value="SA">{t("country.SA")}</option>
            <option value="AE">{t("country.AE")}</option>
          </select>
          <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">{t("trends.save")}</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {signals.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <h3 className="font-semibold text-gray-900">{s.topic}</h3>
              <p className="text-sm text-gray-500">{s.source} · {s.country || "—"}</p>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-700">
              {(s.relevance_score * 100).toFixed(0)}%
            </span>
          </div>
        ))}
        {signals.length === 0 && <p className="py-8 text-center text-gray-400">{t("trends.no_trends")}</p>}
      </div>
    </div>
  );
}
