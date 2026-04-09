"use client";

import { useEffect, useRef, useState } from "react";
import { VideoActions } from "./VideoActions";

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

const CATEGORY_LABELS: Record<string, string> = {
  humor: "مرح",
  sports: "رياضة",
  science: "علوم",
  english_learning: "إنجليزي",
  arabic_literacy: "عربي",
  culture: "ثقافة",
  safe_trends: "ترند",
  character_stories: "قصص",
};

export function VideoCard({ video }: { video: FeedVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-screen snap-start items-center justify-center bg-black"
      onClick={togglePlay}
    >
      {video.video_url ? (
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.thumbnail_url || undefined}
          className="h-full w-full object-cover"
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-900">
          <p className="text-gray-500">No video available</p>
        </div>
      )}

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-5">
            <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="absolute right-4 top-4 rounded-full bg-black/40 p-2"
      >
        {isMuted ? (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Bottom overlay: title + category */}
      <div className="absolute bottom-0 left-0 right-16 bg-gradient-to-t from-black/80 to-transparent p-4 pb-8">
        <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs text-white">
          {CATEGORY_LABELS[video.category] || video.category}
        </span>
        <h2 className="text-lg font-bold text-white">{video.title}</h2>
        {video.description && (
          <p className="mt-1 text-sm text-gray-300">{video.description}</p>
        )}
      </div>

      {/* Right side: actions */}
      <VideoActions videoId={video.id} />
    </div>
  );
}
