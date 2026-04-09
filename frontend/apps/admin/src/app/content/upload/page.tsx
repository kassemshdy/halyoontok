"use client";

import { useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useRouter } from "next/navigation";

const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: "humor", labelKey: "category.humor" },
  { value: "sports", labelKey: "category.sports" },
  { value: "science", labelKey: "category.science" },
  { value: "english_learning", labelKey: "category.english_learning" },
  { value: "arabic_literacy", labelKey: "category.arabic_literacy" },
  { value: "culture", labelKey: "category.culture" },
  { value: "safe_trends", labelKey: "category.safe_trends" },
  { value: "character_stories", labelKey: "category.character_stories" },
];

const DIALECTS: { value: string; labelKey: TranslationKey }[] = [
  { value: "msa", labelKey: "dialect.msa" },
  { value: "lebanese", labelKey: "dialect.lebanese" },
  { value: "iraqi", labelKey: "dialect.iraqi" },
  { value: "none", labelKey: "dialect.none" },
];

export default function UploadPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("humor");
  const [language, setLanguage] = useState("ar");
  const [dialect, setDialect] = useState("msa");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const videoRes = await fetch("/api/admin/content/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ title, description: description || null, category, language, dialect, source_type: "studio_produced" }),
      });
      if (!videoRes.ok) throw new Error("Failed to create video");
      const video = await videoRes.json();
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`/api/upload/upload/video?video_id=${video.id}`, { method: "POST", headers: authHeaders(token), body: formData });
      }
      router.push(`/content/${video.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t("content.upload_title")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("content.video_title")} *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("content.description")}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("content.category")} *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
              {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{t(c.labelKey)}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("content.dialect")}</label>
            <select value={dialect} onChange={(e) => setDialect(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
              {DIALECTS.map((d) => (<option key={d.value} value={d.value}>{t(d.labelKey)}</option>))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("content.language")}</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
            <option value="ar">{t("language.ar")}</option>
            <option value="en">{t("language.en")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("content.video_file")}</label>
          <input type="file" accept="video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? t("content.uploading") : t("content.upload_button")}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
            {t("content.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
