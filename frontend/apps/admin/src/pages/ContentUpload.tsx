import { useState } from "react";
import { useLocation } from "wouter";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useCreateVideo, useUploadVideo } from "@/hooks/use-api";

const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: "humor", labelKey: "category.humor" }, { value: "sports", labelKey: "category.sports" },
  { value: "science", labelKey: "category.science" }, { value: "english_learning", labelKey: "category.english_learning" },
  { value: "arabic_literacy", labelKey: "category.arabic_literacy" }, { value: "culture", labelKey: "category.culture" },
  { value: "safe_trends", labelKey: "category.safe_trends" }, { value: "character_stories", labelKey: "category.character_stories" },
];
const DIALECTS: { value: string; labelKey: TranslationKey }[] = [
  { value: "msa", labelKey: "dialect.msa" }, { value: "lebanese", labelKey: "dialect.lebanese" },
  { value: "iraqi", labelKey: "dialect.iraqi" }, { value: "none", labelKey: "dialect.none" },
];

export function ContentUploadPage() {
  const { t } = useLocale();
  const [, navigate] = useLocation();
  const createVideo = useCreateVideo();
  const uploadVideo = useUploadVideo();

  const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
  const [category, setCategory] = useState("humor"); const [language, setLanguage] = useState("ar");
  const [dialect, setDialect] = useState("msa"); const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const loading = createVideo.isPending || uploadVideo.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const video = await createVideo.mutateAsync({ title, description: description || null, category, language, dialect, source_type: "studio_produced" });
      if (file) await uploadVideo.mutateAsync({ videoId: video.id, file });
      navigate(`/content/${video.id}`);
    } catch (err: any) { setError(err.message); }
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring";

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-lg border border-border p-6">
        <h1 className="text-lg font-semibold">{t("content.upload_title")}</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-1.5"><label className="text-sm font-medium">{t("content.video_title")}</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">{t("content.description")}</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-20 py-2`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{t("content.category")}</label><select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}</select></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">{t("content.dialect")}</label><select value={dialect} onChange={(e) => setDialect(e.target.value)} className={inputClass}>{DIALECTS.map((d) => <option key={d.value} value={d.value}>{t(d.labelKey)}</option>)}</select></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">{t("content.language")}</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}><option value="ar">{t("language.ar")}</option><option value="en">{t("language.en")}</option></select></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">{t("content.video_file")}</label><input type="file" accept="video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="h-9 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{loading ? t("content.uploading") : t("content.upload_button")}</button>
            <button type="button" onClick={() => history.back()} className="h-9 rounded-md border border-input px-5 text-sm font-medium hover:bg-accent">{t("content.cancel")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
