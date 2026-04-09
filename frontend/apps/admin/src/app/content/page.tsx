"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import Link from "next/link";

const STATUS_KEYS: Record<string, { labelKey: TranslationKey; color: string }> = {
  draft: { labelKey: "status.draft", color: "bg-gray-100 text-gray-700" },
  ai_generated: { labelKey: "status.ai_generated", color: "bg-purple-100 text-purple-700" },
  awaiting_editor: { labelKey: "status.awaiting_editor", color: "bg-yellow-100 text-yellow-700" },
  awaiting_moderation: { labelKey: "status.awaiting_moderation", color: "bg-orange-100 text-orange-700" },
  changes_requested: { labelKey: "status.changes_requested", color: "bg-red-100 text-red-700" },
  approved: { labelKey: "status.approved", color: "bg-blue-100 text-blue-700" },
  scheduled: { labelKey: "status.scheduled", color: "bg-indigo-100 text-indigo-700" },
  published: { labelKey: "status.published", color: "bg-green-100 text-green-700" },
  archived: { labelKey: "status.archived", color: "bg-gray-100 text-gray-500" },
};

const CATEGORY_KEYS: Record<string, TranslationKey> = {
  humor: "category.humor", sports: "category.sports", science: "category.science",
  english_learning: "category.english_learning", arabic_literacy: "category.arabic_literacy",
  culture: "category.culture", safe_trends: "category.safe_trends", character_stories: "category.character_stories",
};

interface Video {
  id: number;
  title: string;
  status: string;
  category: string;
  language: string;
  dialect: string;
  duration_seconds: number | null;
}

export default function ContentPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [videos, setVideos] = useState<Video[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams({ limit: "100" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/content/videos?${params}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setVideos)
      .catch(() => {});
  }, [token, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("content.title")}</h1>
          <p className="mt-1 text-gray-500">{videos.length} video</p>
        </div>
        <Link href="/content/upload" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {t("content.upload")}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter("")} className={`rounded-full px-3 py-1 text-sm ${!statusFilter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
          {t("content.all")}
        </button>
        {Object.entries(STATUS_KEYS).map(([key, { labelKey }]) => (
          <button key={key} onClick={() => setStatusFilter(key)} className={`rounded-full px-3 py-1 text-sm ${statusFilter === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-start font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("content.video_title")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("content.category")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("content.language")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("content.duration")}</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => {
              const st = STATUS_KEYS[v.status] || { labelKey: v.status as TranslationKey, color: "bg-gray-100" };
              return (
                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{v.id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/content/${v.id}`} className="font-medium text-blue-600 hover:underline">{v.title}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{t(st.labelKey)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{CATEGORY_KEYS[v.category] ? t(CATEGORY_KEYS[v.category]) : v.category}</td>
                  <td className="px-4 py-3 text-gray-600">{v.language} / {v.dialect}</td>
                  <td className="px-4 py-3 text-gray-600">{v.duration_seconds ? `${v.duration_seconds}s` : "—"}</td>
                </tr>
              );
            })}
            {videos.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t("content.no_videos")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
