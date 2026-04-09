"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: "", labelKey: "category.no_category" }, { value: "humor", labelKey: "category.humor" },
  { value: "sports", labelKey: "category.sports" }, { value: "science", labelKey: "category.science" },
  { value: "english_learning", labelKey: "category.english_learning" }, { value: "arabic_literacy", labelKey: "category.arabic_literacy" },
  { value: "culture", labelKey: "category.culture" }, { value: "safe_trends", labelKey: "category.safe_trends" },
  { value: "character_stories", labelKey: "category.character_stories" },
];

interface Idea { id: number; title: string; description: string | null; status: string; category: string | null; }

export default function StudioPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [category, setCategory] = useState("");

  const fetchIdeas = () => { if (!token) return; fetch("/api/admin/studio/ideas", { headers: authHeaders(token) }).then((r) => r.json()).then(setIdeas).catch(() => {}); };
  useEffect(() => { fetchIdeas(); }, [token]);

  const createIdea = async (e: React.FormEvent) => {
    e.preventDefault(); if (!token) return;
    await fetch("/api/admin/studio/ideas", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ title, description: description || null, category: category || null }) });
    setTitle(""); setDescription(""); setCategory(""); setShowForm(false); fetchIdeas();
  };

  const convertToVideo = async (ideaId: number) => {
    if (!token) return;
    const res = await fetch(`/api/admin/studio/ideas/${ideaId}/to-video`, { method: "POST", headers: authHeaders(token) });
    if (res.ok) { const data = await res.json(); alert(t("video.created_from_idea") + ` #${data.video_id}`); fetchIdeas(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("studio.title")}</h1>
          <p className="text-sm text-muted-foreground">{ideas.length} {t("studio.ideas_count")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? t("common.cancel") : t("studio.new_idea")}</Button>
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <form onSubmit={createIdea} className="space-y-3">
              <Input placeholder={t("studio.idea_title")} value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea placeholder={t("studio.idea_description")} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{t(c.labelKey)}</option>))}
              </select>
              <Button type="submit">{t("studio.save_idea")}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        {ideas.map((idea) => (
          <Card key={idea.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium">{idea.title}</p>
                <p className="text-xs text-muted-foreground">{idea.category || "—"} · <Badge variant="outline" className="text-[10px]">{idea.status}</Badge></p>
              </div>
              {idea.status === "draft" && (
                <Button size="sm" variant="outline" onClick={() => convertToVideo(idea.id)}>{t("studio.convert_to_video")}</Button>
              )}
            </CardContent>
          </Card>
        ))}
        {ideas.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("studio.no_ideas")}</p>}
      </div>
    </div>
  );
}
