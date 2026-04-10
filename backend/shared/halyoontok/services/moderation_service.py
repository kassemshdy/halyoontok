from __future__ import annotations

from sqlalchemy.orm import Session, selectinload

from halyoontok.configs.constants import AssetType, ContentStatus, ModerationStatus
from halyoontok.db.models import ModerationDecision, Video


def get_moderation_queue(session: Session, limit: int = 50) -> list[dict]:
    videos = (
        session.query(Video)
        .filter(Video.status == ContentStatus.AWAITING_MODERATION)
        .options(selectinload(Video.assets))
        .order_by(Video.created_at.asc())
        .limit(limit)
        .all()
    )
    result = []
    for v in videos:
        video_url = None
        thumbnail_url = None
        for asset in v.assets:
            if asset.asset_type in (AssetType.VIDEO_RAW, AssetType.VIDEO_HLS):
                video_url = asset.storage_path
            elif asset.asset_type == AssetType.THUMBNAIL:
                thumbnail_url = asset.storage_path
        result.append({
            "id": v.id,
            "title": v.title,
            "status": v.status.value if hasattr(v.status, "value") else v.status,
            "category": v.category.value if hasattr(v.category, "value") else v.category,
            "video_url": video_url,
            "thumbnail_url": thumbnail_url,
        })
    return result


def submit_moderation_decision(
    session: Session,
    video_id: int,
    status: ModerationStatus,
    reviewer_id: int,
    reason: str | None = None,
    confidence: float | None = None,
) -> ModerationDecision:
    decision = ModerationDecision(
        video_id=video_id,
        status=status,
        reason=reason,
        confidence=confidence,
        reviewer_id=reviewer_id,
    )
    session.add(decision)

    video = session.get(Video, video_id)
    if video:
        if status == ModerationStatus.APPROVED:
            video.status = ContentStatus.APPROVED
        elif status == ModerationStatus.REJECTED:
            video.status = ContentStatus.ARCHIVED
        elif status == ModerationStatus.CHANGES_REQUESTED:
            video.status = ContentStatus.CHANGES_REQUESTED

    session.flush()
    return decision
