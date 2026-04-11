"use client";

import { useState } from "react";
import { useLocale } from "@halyoontok/i18n";
import { useWebAuth } from "@/lib/auth";

interface VideoActionsProps {
  videoId: number;
}

export function VideoActions({ videoId }: VideoActionsProps) {
  const { t } = useLocale();
  const { token, isLoggedIn } = useWebAuth();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleAction = async (action: "like" | "favorite") => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    const res = await fetch(`/api/feed/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ video_id: videoId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (action === "like") setLiked(data.liked);
      if (action === "favorite") setFavorited(data.favorited);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: "HalyoonTok", url: `/video/${videoId}` });
    }
  };

  return (
    <>
      <div className="absolute bottom-24 z-10 flex flex-col items-center gap-5 ltr:right-3 rtl:left-3">
        {/* Like */}
        <button
          onClick={(e) => { e.stopPropagation(); handleAction("like"); }}
          className="flex flex-col items-center"
        >
          <div className={`rounded-full bg-black/40 p-3 ${liked ? "text-red-500" : "text-white"}`}>
            <svg className="h-7 w-7" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </button>

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); handleAction("favorite"); }}
          className="flex flex-col items-center"
        >
          <div className={`rounded-full bg-black/40 p-3 ${favorited ? "text-yellow-400" : "text-white"}`}>
            <svg className="h-7 w-7" fill={favorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center">
          <div className="rounded-full bg-black/40 p-3 text-white">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="mt-1 text-xs text-white">{t("feed.share")}</span>
        </button>
      </div>

      {/* Login prompt */}
      {showLogin && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60" onClick={(e) => { e.stopPropagation(); setShowLogin(false); }}>
          <div className="w-full rounded-t-2xl bg-gray-900 p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-700" />
            <h3 className="text-center text-xl font-bold text-white">{t("auth.login_prompt")}</h3>
            <p className="mt-2 text-center text-gray-400">{t("auth.login_prompt_desc")}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowLogin(false)} className="flex-1 rounded-full border border-gray-600 py-3 font-semibold text-white">
                {t("auth.later")}
              </button>
              <a href="/login" className="flex-1 rounded-full bg-white py-3 text-center font-semibold text-black">
                {t("auth.login")}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
