"use client";

import { useEffect, useState } from "react";
import { VideoFeed } from "@/components/VideoFeed";

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

export default function FeedPage() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed?limit=20")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return <VideoFeed videos={videos} />;
}
