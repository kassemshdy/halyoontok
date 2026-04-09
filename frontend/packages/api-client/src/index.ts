import type {
  AnalyticsOverview,
  ChildProfile,
  ContentIdea,
  FeedVideo,
  LoginRequest,
  ModerationDecision,
  ParentalRule,
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
