"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";

const STATUS_ACTIONS: Record<string, { label: string; next: string; color: string }[]> = {
  draft: [{ label: "إرسال للمراجعة", next: "awaiting_moderation", color: "bg-orange-600" }],
  awaiting_moderation: [
    { label: "موافقة", next: "approved", color: "bg-green-600" },
    { label: "طلب تعديلات", next: "changes_requested", color: "bg-yellow-600" },
  ],
  changes_requested: [{ label: "إعادة إرسال", next: "awaiting_moderation", color: "bg-orange-600" }],
  approved: [{ label: "نشر", next: "published", color: "bg-blue-600" }],
  published: [{ label: "أرشفة", next: "archived", color: "bg-gray-600" }],
};

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", awaiting_moderation: "بانتظار المراجعة",
  changes_requested: "تعديلات مطلوبة", approved: "موافق عليه",
  published: "منشور", archived: "أرشيف", scheduled: "مجدول",
  ai_generated: "AI", awaiting_editor: "بانتظار التحرير",
};

interface Video {
  id: number;
  title: string;
  description: string | null;
  status: string;
  category: string;
  language: string;
  dialect: string;
  duration_seconds: number | null;
}

export default function VideoDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/admin/content/videos/${id}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setVideo)
      .catch(() => {});
  }, [token, id]);

  const updateStatus = async (newStatus: string) => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content/videos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Failed");
        return;
      }
      const data = await res.json();
      setVideo((prev) => prev ? { ...prev, status: data.status } : null);
    } finally {
      setLoading(false);
    }
  };

  if (!video) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const actions = STATUS_ACTIONS[video.status] || [];

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
        ← العودة
      </button>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
            <p className="mt-1 text-gray-500">#{video.id}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {STATUS_LABELS[video.status] || video.status}
          </span>
        </div>

        {video.description && (
          <p className="mt-4 text-gray-600">{video.description}</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">القسم:</span>
            <span className="mr-2 font-medium text-gray-900">{video.category}</span>
          </div>
          <div>
            <span className="text-gray-500">اللغة:</span>
            <span className="mr-2 font-medium text-gray-900">{video.language} / {video.dialect}</span>
          </div>
          <div>
            <span className="text-gray-500">المدة:</span>
            <span className="mr-2 font-medium text-gray-900">{video.duration_seconds ? `${video.duration_seconds}s` : "—"}</span>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6">
            {actions.map((action) => (
              <button
                key={action.next}
                onClick={() => updateStatus(action.next)}
                disabled={loading}
                className={`rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${action.color} hover:opacity-90`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
