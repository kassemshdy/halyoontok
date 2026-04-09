"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendSignal { id: number; source: string; topic: string; relevance_score: number; country: string | null; }

export default function TrendsPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [signals, setSignals] = useState<TrendSignal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState(""); const [topic, setTopic] = useState(""); const [country, setCountry] = useState("LB");

  const fetchSignals = () => { if (!token) return; fetch("/api/admin/trends/signals", { headers: authHeaders(token) }).then((r) => r.json()).then(setSignals).catch(() => {}); };
  useEffect(() => { fetchSignals(); }, [token]);

  const createSignal = async (e: React.FormEvent) => {
    e.preventDefault(); if (!token) return;
    await fetch("/api/admin/trends/signals", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ source, topic, country, relevance_score: 0.5 }) });
    setSource(""); setTopic(""); setShowForm(false); fetchSignals();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("trends.title")}</h1>
          <p className="text-sm text-muted-foreground">{signals.length} {t("trends.signals_count")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? t("common.cancel") : t("trends.add")}</Button>
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <form onSubmit={createSignal} className="space-y-3">
              <Input placeholder={t("trends.source_placeholder")} value={source} onChange={(e) => setSource(e.target.value)} required />
              <Input placeholder={t("trends.topic_placeholder")} value={topic} onChange={(e) => setTopic(e.target.value)} required />
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                <option value="LB">{t("country.LB")}</option><option value="IQ">{t("country.IQ")}</option>
                <option value="SA">{t("country.SA")}</option><option value="AE">{t("country.AE")}</option>
              </select>
              <Button type="submit">{t("trends.save")}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        {signals.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium">{s.topic}</p>
                <p className="text-xs text-muted-foreground">{s.source} · {s.country || "—"}</p>
              </div>
              <Badge variant="outline">{(s.relevance_score * 100).toFixed(0)}%</Badge>
            </CardContent>
          </Card>
        ))}
        {signals.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("trends.no_trends")}</p>}
      </div>
    </div>
  );
}
