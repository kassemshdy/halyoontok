"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";

interface QueueVideo {
  id: number;
  title: string;
  status: string;
  category: string;
  created_at: string;
}

export default function ModerationPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [queue, setQueue] = useState<QueueVideo[]>([]);
  const [loading, setLoading] = useState<number | null>(null);

  const fetchQueue = () => {
    if (!token) return;
    fetch("/api/admin/moderation/queue", { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setQueue)
      .catch(() => {});
  };

  useEffect(() => { fetchQueue(); }, [token]);

  const decide = async (videoId: number, status: string) => {
    if (!token) return;
    setLoading(videoId);
    try {
      await fetch("/api/admin/moderation/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ video_id: videoId, status }),
      });
      fetchQueue();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("moderation.title")}</h1>
      <p className="mt-1 text-gray-500">{queue.length} {t("moderation.waiting")}</p>

      {queue.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-4xl">✅</p>
          <p className="mt-2 text-gray-500">{t("moderation.empty")}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {queue.map((v) => (
            <div key={v.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{v.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">#{v.id} · {v.category}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decide(v.id, "approved")} disabled={loading === v.id} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                    {t("action.approve")}
                  </button>
                  <button onClick={() => decide(v.id, "changes_requested")} disabled={loading === v.id} className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50">
                    {t("action.request_changes")}
                  </button>
                  <button onClick={() => decide(v.id, "rejected")} disabled={loading === v.id} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                    {t("action.reject")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
