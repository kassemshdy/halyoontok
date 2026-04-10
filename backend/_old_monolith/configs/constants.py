from enum import Enum


class UserRole(str, Enum):
    PARENT = "parent"
    ADMIN = "admin"
    MODERATOR = "moderator"
    EDITOR = "editor"


class ContentStatus(str, Enum):
    DRAFT = "draft"
    AI_GENERATED = "ai_generated"
    AWAITING_EDITOR = "awaiting_editor"
    AWAITING_MODERATION = "awaiting_moderation"
    CHANGES_REQUESTED = "changes_requested"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ModerationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CHANGES_REQUESTED = "changes_requested"


class ContentCategory(str, Enum):
    HUMOR = "humor"
    SPORTS = "sports"
    SCIENCE = "science"
    ENGLISH_LEARNING = "english_learning"
    ARABIC_LITERACY = "arabic_literacy"
    CULTURE = "culture"
    SAFE_TRENDS = "safe_trends"
    CHARACTER_STORIES = "character_stories"


class Language(str, Enum):
    ARABIC = "ar"
    ENGLISH = "en"


class Dialect(str, Enum):
    MSA = "msa"
    LEBANESE = "lebanese"
    IRAQI = "iraqi"
    NONE = "none"


class AgeBand(str, Enum):
    UNDER_8 = "under_8"
    AGE_8_12 = "8_12"
    AGE_13_15 = "13_15"


class SourceType(str, Enum):
    AI_GENERATED = "ai_generated"
    STUDIO_PRODUCED = "studio_produced"
    OPERATOR_CREATED = "operator_created"


class AssetType(str, Enum):
    VIDEO_RAW = "video_raw"
    VIDEO_HLS = "video_hls"
    THUMBNAIL = "thumbnail"
    SUBTITLE = "subtitle"
    AUDIO = "audio"
