"use client";

import { VideoCard } from "./VideoCard";

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

interface VideoFeedProps {
  videos: FeedVideo[];
}

export function VideoFeed({ videos }: VideoFeedProps) {
  return (
    <div className="h-screen w-screen snap-y snap-mandatory overflow-y-scroll bg-black scrollbar-hide">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
