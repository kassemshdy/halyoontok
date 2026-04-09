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

interface VideoCardProps {
  video: FeedVideo;
  shouldLoadVideo: boolean;
  preloadStrategy: "auto" | "metadata" | "none";
}

export function VideoCard({ video, shouldLoadVideo, preloadStrategy }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Auto-play/pause based on visibility
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
  }, [shouldLoadVideo]);

  // Cleanup: remove video src when unloaded to free memory
  useEffect(() => {
    if (!shouldLoadVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
      setVideoReady(false);
      setIsPlaying(false);
    }
  }, [shouldLoadVideo]);

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
      {/* Thumbnail background — always visible until video is ready */}
      {video.thumbnail_url && (
        <img
          src={video.thumbnail_url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            videoReady && isPlaying ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Blurred placeholder behind thumbnail for fast perceived load */}
      {!video.thumbnail_url && (
        <div className="absolute inset-0 bg-gray-900" />
      )}

      {/* Video element — only mounted when within preload range */}
      {shouldLoadVideo && video.video_url && (
        <video
          ref={videoRef}
          src={video.video_url}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          loop
          muted={isMuted}
          playsInline
          preload={preloadStrategy}
          onCanPlay={() => setVideoReady(true)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />
      )}

      {/* Buffering spinner */}
      {isBuffering && isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-white border-t-transparent" />
        </div>
      )}

      {/* Play/Pause indicator */}
      {!isPlaying && !isBuffering && (
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
        className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2"
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
      <div className="absolute bottom-0 left-0 right-16 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 pb-8">
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
