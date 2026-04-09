// ── User Domain ──

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export type UserRole = "parent" | "admin" | "moderator" | "editor";

export interface ChildProfile {
  id: number;
  parent_id: number;
  display_name: string;
  age: number;
  age_band: AgeBand;
  language: Language;
  dialect: Dialect;
  country: string;
}

export interface ParentalRule {
  id: number;
  child_profile_id: number;
  daily_limit_minutes: number;
  bedtime_start: string | null;
  bedtime_end: string | null;
  education_priority: number;
  allowed_categories: Record<string, boolean> | null;
  language_preferences: Record<string, boolean> | null;
}

// ── Content Domain ──

export interface Video {
  id: number;
  title: string;
  description: string | null;
  status: ContentStatus;
  category: ContentCategory;
  language: Language;
  dialect: Dialect;
  age_suitability: AgeBand;
  source_type: SourceType;
  educational_score: number;
  entertainment_score: number;
  duration_seconds: number | null;
  published_at: string | null;
}

export interface VideoAsset {
  id: number;
  video_id: number;
  asset_type: AssetType;
  storage_path: string;
  mime_type: string;
}

// ── Studio Domain ──

export interface TrendSignal {
  id: number;
  source: string;
  topic: string;
  format_type: string | null;
  relevance_score: number;
  country: string | null;
}

export interface ContentIdea {
  id: number;
  title: string;
  description: string | null;
  trend_signal_id: number | null;
  status: ContentStatus;
  category: ContentCategory | null;
  script: string | null;
}

// ── Safety Domain ──

export interface ModerationDecision {
  id: number;
  video_id: number;
  status: ModerationStatus;
  reason: string | null;
  confidence: number | null;
  reviewer_id: number | null;
  model_version: string | null;
}

// ── Recommendation Domain ──

export interface WatchEvent {
  id: number;
  child_profile_id: number;
  video_id: number;
  watch_duration_seconds: number;
  completed: boolean;
  skipped: boolean;
}

// ── Feed ──

export interface FeedVideo {
  id: number;
  title: string;
  category: ContentCategory;
  language: Language;
  dialect: Dialect;
  duration_seconds: number | null;
  thumbnail_url?: string;
  video_url?: string;
}

// ── Auth ──

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Enums ──

export type ContentStatus =
  | "draft"
  | "ai_generated"
  | "awaiting_editor"
  | "awaiting_moderation"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";

export type ModerationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export type ContentCategory =
  | "humor"
  | "sports"
  | "science"
  | "english_learning"
  | "arabic_literacy"
  | "culture"
  | "safe_trends"
  | "character_stories";

export type Language = "ar" | "en";

export type Dialect = "msa" | "lebanese" | "iraqi" | "none";

export type AgeBand = "under_8" | "8_12" | "13_15";

export type SourceType = "ai_generated" | "studio_produced" | "operator_created";

export type AssetType =
  | "video_raw"
  | "video_hls"
  | "thumbnail"
  | "subtitle"
  | "audio";

// ── Analytics ──

export interface AnalyticsOverview {
  total_videos: number;
  total_watches: number;
  total_watch_time_seconds: number;
}
