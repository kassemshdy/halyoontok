"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track which video is currently in view
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollTop / window.innerHeight);
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen snap-y snap-mandatory overflow-y-scroll bg-black scrollbar-hide"
    >
      {videos.map((video, index) => {
        // Distance from current video
        const distance = Math.abs(index - currentIndex);

        // Only render video element for current ± 2 (preload next 2)
        // Beyond that, show thumbnail only (saves memory)
        const shouldLoadVideo = distance <= 2;

        // Preload: current + next 2 get preload="auto", others get "none"
        const preloadStrategy: "auto" | "metadata" | "none" =
          distance === 0 ? "auto" :
          distance <= 2 ? "metadata" :
          "none";

        return (
          <VideoCard
            key={video.id}
            video={video}
            shouldLoadVideo={shouldLoadVideo}
            preloadStrategy={preloadStrategy}
          />
        );
      })}
    </div>
  );
}
