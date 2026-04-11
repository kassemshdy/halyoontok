import { useState } from "react";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useIdeas, useCreateIdea, useConvertIdeaToVideo } from "@/hooks/use-api";

const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: "", labelKey: "category.no_category" }, { value: "humor", labelKey: "category.humor" },
  { value: "sports", labelKey: "category.sports" }, { value: "science", labelKey: "category.science" },
  { value: "english_learning", labelKey: "category.english_learning" }, { value: "arabic_literacy", labelKey: "category.arabic_literacy" },
  { value: "culture", labelKey: "category.culture" }, { value: "safe_trends", labelKey: "category.safe_trends" },
  { value: "character_stories", labelKey: "category.character_stories" },
];

export function StudioPage() {
  const { t } = useLocale();
  const { data: ideas = [] } = useIdeas();
  const createIdea = useCreateIdea();
  const convertToVideo = useConvertIdeaToVideo();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [category, setCategory] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createIdea.mutateAsync({ title, description: description || null, category: category || null });
    setTitle(""); setDescription(""); setCategory(""); setShowForm(false);
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold">{t("studio.title")}</h1><p className="text-sm text-muted-foreground">{ideas.length} {t("studio.ideas_count")}</p></div>
        <button onClick={() => setShowForm(!showForm)} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">{showForm ? t("common.cancel") : t("studio.new_idea")}</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 rounded-lg border border-border p-5 space-y-3">
          <input placeholder={t("studio.idea_title")} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
          <textarea placeholder={t("studio.idea_description")} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-16 py-2`} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}</select>
          <button type="submit" className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">{t("studio.save_idea")}</button>
        </form>
      )}
      <div className="mt-6 space-y-2">
        {ideas.map((idea: any) => (
          <div key={idea.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div><p className="text-sm font-medium">{idea.title}</p><p className="text-xs text-muted-foreground">{idea.category || "—"} · {idea.status}</p></div>
            {idea.status === "draft" && <button onClick={() => convertToVideo.mutate(idea.id)} className="h-8 rounded-md border border-input px-3 text-xs font-medium">{t("studio.convert_to_video")}</button>}
          </div>
        ))}
        {ideas.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("studio.no_ideas")}</p>}
      </div>
    </div>
  );
}
