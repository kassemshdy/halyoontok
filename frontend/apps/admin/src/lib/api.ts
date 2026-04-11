/**
 * Typed API client for admin dashboard.
 * All calls go through Vite proxy → backend services.
 */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

function authHeader(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function createApi(token: string | null) {
  const h = authHeader(token);

  return {
    // Content
    listVideos: (params?: { status?: string }) => {
      const qs = new URLSearchParams({ limit: "100", ...(params?.status ? { status: params.status } : {}) });
      return request<any[]>(`/api/admin/content/videos?${qs}`, { headers: h });
    },
    getVideo: (id: number) => request<any>(`/api/admin/content/videos/${id}`, { headers: h }),
    createVideo: (data: any) => request<any>("/api/admin/content/videos", { method: "POST", headers: h, body: JSON.stringify(data) }),
    updateVideoStatus: (id: number, status: string) => request<any>(`/api/admin/content/videos/${id}/status`, { method: "PATCH", headers: h, body: JSON.stringify({ status }) }),

    // Moderation
    getModerationQueue: () => request<any[]>("/api/admin/moderation/queue", { headers: h }),
    submitDecision: (data: any) => request<any>("/api/admin/moderation/decisions", { method: "POST", headers: h, body: JSON.stringify(data) }),

    // Studio
    listIdeas: () => request<any[]>("/api/admin/studio/ideas", { headers: h }),
    createIdea: (data: any) => request<any>("/api/admin/studio/ideas", { method: "POST", headers: h, body: JSON.stringify(data) }),
    convertIdeaToVideo: (id: number) => request<any>(`/api/admin/studio/ideas/${id}/to-video`, { method: "POST", headers: h }),

    // Trends
    listTrends: () => request<any[]>("/api/admin/trends/signals", { headers: h }),
    createTrend: (data: any) => request<any>("/api/admin/trends/signals", { method: "POST", headers: h, body: JSON.stringify(data) }),

    // Analytics
    getOverview: () => request<any>("/api/admin/analytics/overview", { headers: h }),

    // Users
    listUsers: () => request<any[]>("/api/admin/users", { headers: h }),

    // Upload
    uploadVideo: (videoId: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(`/api/upload/upload/video?video_id=${videoId}`, {
        method: "POST",
        headers: authHeader(token),
        body: formData,
      }).then((r) => r.json());
    },
  };
}
