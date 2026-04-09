"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";

const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: "", labelKey: "category.no_category" },
  { value: "humor", labelKey: "category.humor" },
  { value: "sports", labelKey: "category.sports" },
  { value: "science", labelKey: "category.science" },
  { value: "english_learning", labelKey: "category.english_learning" },
  { value: "arabic_literacy", labelKey: "category.arabic_literacy" },
  { value: "culture", labelKey: "category.culture" },
  { value: "safe_trends", labelKey: "category.safe_trends" },
  { value: "character_stories", labelKey: "category.character_stories" },
];

interface Idea {
  id: number;
  title: string;
  description: string | null;
  status: string;
  category: string | null;
  script: string | null;
}

export default function StudioPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const fetchIdeas = () => {
    if (!token) return;
    fetch("/api/admin/studio/ideas", { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setIdeas)
      .catch(() => {});
  };

  useEffect(() => { fetchIdeas(); }, [token]);

  const createIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await fetch("/api/admin/studio/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ title, description: description || null, category: category || null }),
    });
    setTitle(""); setDescription(""); setCategory(""); setShowForm(false);
    fetchIdeas();
  };

  const convertToVideo = async (ideaId: number) => {
    if (!token) return;
    const res = await fetch(`/api/admin/studio/ideas/${ideaId}/to-video`, {
      method: "POST",
      headers: authHeaders(token),
    });
    if (res.ok) {
      const data = await res.json();
      alert(t("video.created_from_idea") + ` #${data.video_id}`);
      fetchIdeas();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("studio.title")}</h1>
          <p className="mt-1 text-gray-500">{ideas.length} {t("studio.ideas_count")}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {showForm ? t("common.cancel") : t("studio.new_idea")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createIdea} className="mt-4 rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <input type="text" placeholder={t("studio.idea_title")} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" required />
          <textarea placeholder={t("studio.idea_description")} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" rows={2} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
            {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{t(c.labelKey)}</option>))}
          </select>
          <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">{t("studio.save_idea")}</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {ideas.map((idea) => (
          <div key={idea.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <h3 className="font-semibold text-gray-900">{idea.title}</h3>
              <p className="text-sm text-gray-500">{idea.category || "—"} · {idea.status}</p>
              {idea.description && <p className="mt-1 text-sm text-gray-600">{idea.description}</p>}
            </div>
            {idea.status === "draft" && (
              <button onClick={() => convertToVideo(idea.id)} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                {t("studio.convert_to_video")}
              </button>
            )}
          </div>
        ))}
        {ideas.length === 0 && <p className="py-8 text-center text-gray-400">{t("studio.no_ideas")}</p>}
      </div>
    </div>
  );
}
