import { useState } from "react";
import { Link } from "wouter";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useVideos } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const STATUS_KEYS: Record<string, TranslationKey> = {
  draft: "status.draft", ai_generated: "status.ai_generated", awaiting_editor: "status.awaiting_editor",
  awaiting_moderation: "status.awaiting_moderation", changes_requested: "status.changes_requested",
  approved: "status.approved", scheduled: "status.scheduled", published: "status.published", archived: "status.archived",
};
const CATEGORY_KEYS: Record<string, TranslationKey> = {
  humor: "category.humor", sports: "category.sports", science: "category.science",
  english_learning: "category.english_learning", arabic_literacy: "category.arabic_literacy",
  culture: "category.culture", safe_trends: "category.safe_trends", character_stories: "category.character_stories",
};

export function ContentPage() {
  const { t } = useLocale();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: videos = [], isLoading } = useVideos(statusFilter || undefined);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("content.title")}</h1>
          <p className="text-sm text-muted-foreground">{videos.length} videos</p>
        </div>
        <Link href="/content/upload" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {t("content.upload")}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button onClick={() => setStatusFilter("")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", !statusFilter ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent")}>
          {t("content.all")}
        </button>
        {Object.entries(STATUS_KEYS).map(([key, labelKey]) => (
          <button key={key} onClick={() => setStatusFilter(key)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", statusFilter === key ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent")}>
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">#</th>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{t("content.video_title")}</th>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{t("content.category")}</th>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{t("content.duration")}</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v: any) => (
              <tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{v.id}</td>
                <td className="px-4 py-2.5"><Link href={`/content/${v.id}`} className="font-medium hover:underline">{v.title}</Link></td>
                <td className="px-4 py-2.5"><span className="rounded-full border border-border px-2 py-0.5 text-xs">{STATUS_KEYS[v.status] ? t(STATUS_KEYS[v.status]) : v.status}</span></td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{CATEGORY_KEYS[v.category] ? t(CATEGORY_KEYS[v.category]) : v.category}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{v.duration_seconds ? `${v.duration_seconds}s` : "—"}</td>
              </tr>
            ))}
            {!isLoading && videos.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t("content.no_videos")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
