"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface Video { id: number; title: string; status: string; category: string; language: string; dialect: string; duration_seconds: number | null; }

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
      .then((r) => r.json()).then((data) => { if (Array.isArray(data)) setVideos(data); }).catch(() => {});
  }, [token, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("content.title")}</h1>
          <p className="text-sm text-muted-foreground">{videos.length} videos</p>
        </div>
        <Link href="/content/upload" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {t("content.upload")}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Button size="sm" variant={!statusFilter ? "default" : "outline"} onClick={() => setStatusFilter("")}>{t("content.all")}</Button>
        {Object.entries(STATUS_KEYS).map(([key, labelKey]) => (
          <Button key={key} size="sm" variant={statusFilter === key ? "default" : "outline"} onClick={() => setStatusFilter(key)}>{t(labelKey)}</Button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t("content.video_title")}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>{t("content.category")}</TableHead>
              <TableHead>{t("content.duration")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="text-muted-foreground">{v.id}</TableCell>
                <TableCell>
                  <Link href={`/content/${v.id}`} className="font-medium hover:underline">{v.title}</Link>
                </TableCell>
                <TableCell><Badge variant="outline">{STATUS_KEYS[v.status] ? t(STATUS_KEYS[v.status]) : v.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{CATEGORY_KEYS[v.category] ? t(CATEGORY_KEYS[v.category]) : v.category}</TableCell>
                <TableCell className="text-muted-foreground">{v.duration_seconds ? `${v.duration_seconds}s` : "—"}</TableCell>
              </TableRow>
            ))}
            {videos.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("content.no_videos")}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
