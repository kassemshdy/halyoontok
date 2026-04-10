import type {
  AnalyticsOverview,
  ChildProfile,
  ContentIdea,
  FeedVideo,
  GenerationJob,
  GenerationTemplate,
  LoginRequest,
  ModerationDecision,
  ParentalRule,
  SocialChannel,
  SocialPlatform,
  SocialVideo,
  TokenResponse,
  TrendSignal,
  User,
  Video,
  WatchEvent,
} from "@halyoontok/shared-types";

export class HalyoonApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}/api${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new ApiError(res.status, error.error_code, error.detail);
    }

    return res.json();
  }

  // ── Auth ──

  async register(email: string, password: string, role = "parent"): Promise<User> {
    return this.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // ── Profiles ──

  async getProfiles(): Promise<ChildProfile[]> {
    return this.fetch("/profiles");
  }

  async createProfile(profile: Omit<ChildProfile, "id" | "parent_id">): Promise<ChildProfile> {
    return this.fetch("/profiles", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  }

  async getProfile(id: number): Promise<ChildProfile> {
    return this.fetch(`/profiles/${id}`);
  }

  // ── Feed ──

  async getFeed(childProfileId: number, limit = 20): Promise<FeedVideo[]> {
    return this.fetch(`/feed?child_profile_id=${childProfileId}&limit=${limit}`);
  }

  async recordWatchEvent(event: Omit<WatchEvent, "id">): Promise<{ id: number }> {
    return this.fetch("/feed/watch-event", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  // ── Content ──

  async getVideos(limit = 50, offset = 0): Promise<Video[]> {
    return this.fetch(`/content/videos?limit=${limit}&offset=${offset}`);
  }

  async createVideo(video: Partial<Video>): Promise<Video> {
    return this.fetch("/content/videos", {
      method: "POST",
      body: JSON.stringify(video),
    });
  }

  async getVideo(id: number): Promise<Video> {
    return this.fetch(`/content/videos/${id}`);
  }

  // ── Studio ──

  async getIdeas(limit = 50, offset = 0): Promise<ContentIdea[]> {
    return this.fetch(`/studio/ideas?limit=${limit}&offset=${offset}`);
  }

  async createIdea(idea: Partial<ContentIdea>): Promise<ContentIdea> {
    return this.fetch("/studio/ideas", {
      method: "POST",
      body: JSON.stringify(idea),
    });
  }

  // ── Moderation ──

  async getModerationQueue(limit = 50): Promise<Video[]> {
    return this.fetch(`/moderation/queue?limit=${limit}`);
  }

  async submitDecision(decision: Partial<ModerationDecision>): Promise<{ id: number }> {
    return this.fetch("/moderation/decisions", {
      method: "POST",
      body: JSON.stringify(decision),
    });
  }

  // ── Trends ──

  async getTrendSignals(limit = 50, offset = 0): Promise<TrendSignal[]> {
    return this.fetch(`/trends/signals?limit=${limit}&offset=${offset}`);
  }

  // ── Parent Controls ──

  async getParentalRules(childId: number): Promise<ParentalRule> {
    return this.fetch(`/parent-controls/${childId}`);
  }

  async updateParentalRules(childId: number, rules: Partial<ParentalRule>): Promise<ParentalRule> {
    return this.fetch(`/parent-controls/${childId}`, {
      method: "PUT",
      body: JSON.stringify(rules),
    });
  }

  // ── Channels ──

  async getChannels(params?: { platform?: SocialPlatform; country?: string; limit?: number }): Promise<SocialChannel[]> {
    const qs = new URLSearchParams();
    if (params?.platform) qs.set("platform", params.platform);
    if (params?.country) qs.set("country", params.country);
    if (params?.limit) qs.set("limit", String(params.limit));
    return this.fetch(`/channels?${qs}`);
  }

  async addChannel(channel: { platform: SocialPlatform; platform_channel_id: string; country?: string }): Promise<SocialChannel> {
    return this.fetch("/channels", { method: "POST", body: JSON.stringify(channel) });
  }

  async getChannel(id: number): Promise<SocialChannel> {
    return this.fetch(`/channels/${id}`);
  }

  async refreshChannel(id: number): Promise<{ status: string }> {
    return this.fetch(`/channels/${id}/refresh`, { method: "POST" });
  }

  // ── Social Videos ──

  async getSocialVideos(params?: { platform?: SocialPlatform; country?: string; sort_by?: string; limit?: number }): Promise<SocialVideo[]> {
    const qs = new URLSearchParams();
    if (params?.platform) qs.set("platform", params.platform);
    if (params?.country) qs.set("country", params.country);
    if (params?.sort_by) qs.set("sort_by", params.sort_by);
    if (params?.limit) qs.set("limit", String(params.limit));
    return this.fetch(`/social-videos?${qs}`);
  }

  async getTopSocialVideos(limit = 20): Promise<SocialVideo[]> {
    return this.fetch(`/social-videos/top?limit=${limit}`);
  }

  // ── Search ──

  async searchVideos(query: string, limit = 50): Promise<SocialVideo[]> {
    return this.fetch(`/search/videos?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getTrendingPatterns(params?: { country?: string; days?: number }): Promise<Record<string, unknown>[]> {
    const qs = new URLSearchParams();
    if (params?.country) qs.set("country", params.country);
    if (params?.days) qs.set("days", String(params.days));
    return this.fetch(`/search/trending-patterns?${qs}`);
  }

  // ── Generation ──

  async createGenerationJob(job: { prompt: string; model_name?: string; reference_video_id?: number }): Promise<GenerationJob> {
    return this.fetch("/generation/jobs", { method: "POST", body: JSON.stringify(job) });
  }

  async getGenerationJobs(limit = 50): Promise<GenerationJob[]> {
    return this.fetch(`/generation/jobs?limit=${limit}`);
  }

  async getGenerationJob(id: number): Promise<GenerationJob> {
    return this.fetch(`/generation/jobs/${id}`);
  }

  async retryGenerationJob(id: number): Promise<GenerationJob> {
    return this.fetch(`/generation/jobs/${id}/retry`, { method: "POST" });
  }

  async getGenerationTemplates(limit = 50): Promise<GenerationTemplate[]> {
    return this.fetch(`/generation/templates?limit=${limit}`);
  }

  async createGenerationTemplate(template: Partial<GenerationTemplate>): Promise<GenerationTemplate> {
    return this.fetch("/generation/templates", { method: "POST", body: JSON.stringify(template) });
  }

  // ── Analytics ──

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.fetch("/analytics/overview");
  }
}

export class ApiError extends Error {
  status: number;
  errorCode: string | undefined;

  constructor(status: number, errorCode?: string, detail?: string) {
    super(detail || `API error: ${status}`);
    this.status = status;
    this.errorCode = errorCode;
  }
}
