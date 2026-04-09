"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VideoFeed } from "@/components/VideoFeed";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";

interface FeedVideo {
  id: number;
  title: string;
  description: string | null;
  category: string;
  language: string;
  dialect: string;
  duration_seconds: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
}

const CATEGORY_LABEL_KEYS: Record<string, TranslationKey> = {
  humor: "category.humor",
  sports: "category.sports",
  science: "category.science",
  english_learning: "category.english_learning",
  arabic_literacy: "category.arabic_literacy",
  culture: "category.culture",
  safe_trends: "category.safe_trends",
  character_stories: "category.character_stories",
};

export default function CategoryFeedPage() {
  const { category } = useParams<{ category: string }>();
  const { t } = useLocale();
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/feed?limit=20&category=${category}`)
      .then((r) => r.json())
      .then((data) => { setVideos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black">
        <p className="text-xl text-gray-400">
          {CATEGORY_LABEL_KEYS[category] ? t(CATEGORY_LABEL_KEYS[category]) : category}
        </p>
        <p className="mt-2 text-gray-600">{t("content.no_videos")}</p>
      </div>
    );
  }

  return <VideoFeed videos={videos} />;
}
