from __future__ import annotations

import math
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from halyoontok.db.models import SocialVideo


def compute_virality_score(video: SocialVideo) -> float:
    """Compute a virality score for a social video.

    Formula weights:
    - View count (log-scaled): 30%
    - Engagement rate: 30%
    - Recency bonus: 20%
    - Share/comment ratio: 20%
    """
    view_score = math.log10(max(video.view_count, 1)) / 8.0  # normalize to ~0-1 (10^8 = 100M)
    view_score = min(view_score, 1.0)

    engagement_score = min(video.engagement_rate / 10.0, 1.0)  # 10% engagement = max

    recency_score = 0.0
    if video.published_at:
        days_old = (datetime.now(timezone.utc) - video.published_at).days
        recency_score = max(0.0, 1.0 - (days_old / 30.0))  # full score within 30 days

    total_interactions = video.like_count + video.comment_count + video.share_count
    share_ratio = (video.share_count + video.comment_count) / max(total_interactions, 1)

    score = (
        view_score * 0.30
        + engagement_score * 0.30
        + recency_score * 0.20
        + share_ratio * 0.20
    ) * 100  # scale to 0-100

    return round(min(score, 100.0), 2)


def batch_compute_virality_scores(session: Session, limit: int = 1000) -> int:
    """Recompute virality scores for recent social videos. Returns count updated."""
    videos = (
        session.query(SocialVideo)
        .order_by(SocialVideo.updated_at.desc())
        .limit(limit)
        .all()
    )
    count = 0
    for video in videos:
        new_score = compute_virality_score(video)
        if video.virality_score != new_score:
            video.virality_score = new_score
            count += 1
    session.flush()
    return count


def classify_video_style(video: SocialVideo) -> list[str]:
    """Extract style tags from video metadata, title, and description."""
    tags: list[str] = []
    text = f"{video.title} {video.description or ''}".lower()

    style_keywords = {
        "challenge": ["challenge", "تحدي"],
        "reaction": ["reaction", "react", "ردة فعل"],
        "tutorial": ["tutorial", "how to", "طريقة", "كيف"],
        "comedy": ["funny", "comedy", "مضحك", "كوميديا"],
        "vlog": ["vlog", "يوميات"],
        "educational": ["learn", "facts", "تعلم", "حقائق"],
        "sports": ["sports", "football", "رياضة", "كرة"],
        "music": ["music", "song", "موسيقى", "أغنية"],
        "cooking": ["recipe", "cooking", "وصفة", "طبخ"],
        "storytime": ["story", "storytime", "قصة"],
    }

    for style, keywords in style_keywords.items():
        if any(kw in text for kw in keywords):
            tags.append(style)

    if video.style_tags and isinstance(video.style_tags, list):
        tags.extend(video.style_tags)

    return list(set(tags))
