"use client";

import { useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

export default function UploadPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
  const [category, setCategory] = useState("humor"); const [language, setLanguage] = useState("ar");
  const [dialect, setDialect] = useState("msa"); const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const videoRes = await fetch("/api/admin/content/videos", {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ title, description: description || null, category, language, dialect, source_type: "studio_produced" }),
      });
      if (!videoRes.ok) throw new Error("Failed to create video");
      const video = await videoRes.json();
      if (file) {
        const formData = new FormData(); formData.append("file", file);
        await fetch(`/api/upload/upload/video?video_id=${video.id}`, { method: "POST", headers: authHeaders(token), body: formData });
      }
      router.push(`/content/${video.id}`);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{t("content.upload_title")}</CardTitle>
          <CardDescription>{t("content.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <Label>{t("content.video_title")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t("content.description")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("content.category")}</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                  {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{t(c.labelKey)}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("content.dialect")}</Label>
                <select value={dialect} onChange={(e) => setDialect(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                  {DIALECTS.map((d) => (<option key={d.value} value={d.value}>{t(d.labelKey)}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("content.language")}</Label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                <option value="ar">{t("language.ar")}</option>
                <option value="en">{t("language.en")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("content.video_file")}</Label>
              <Input type="file" accept="video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? t("content.uploading") : t("content.upload_button")}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>{t("content.cancel")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
