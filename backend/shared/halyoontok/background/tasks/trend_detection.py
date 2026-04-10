import logging
from collections import Counter
from datetime import datetime, timedelta, timezone

from celery import shared_task

from halyoontok.db.engine.sql_engine import get_session

logger = logging.getLogger(__name__)


@shared_task(expires=7200)
def detect_trends() -> dict:
    """Analyze collected videos for emerging trend patterns.

    Groups videos by topic keywords, detects engagement spikes,
    and creates auto-detected TrendSignal records.
    """
    logger.info("Running automated trend detection")
    with get_session() as session:
        from halyoontok.db.models import SocialVideo, TrendSignal
        from halyoontok.services.virality_service import classify_video_style

        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        recent_videos = (
            session.query(SocialVideo)
            .filter(SocialVideo.created_at >= cutoff)
            .order_by(SocialVideo.virality_score.desc())
            .limit(500)
            .all()
        )

        if not recent_videos:
            return {"trends_created": 0}

        # Cluster by style tags
        style_clusters: dict[str, list[SocialVideo]] = {}
        for video in recent_videos:
            tags = classify_video_style(video)
            for tag in tags:
                style_clusters.setdefault(tag, []).append(video)

        # Find clusters with high engagement
        trends_created = 0
        for topic, videos in style_clusters.items():
            if len(videos) < 3:
                continue

            avg_engagement = sum(v.engagement_rate for v in videos) / len(videos)
            avg_virality = sum(v.virality_score for v in videos) / len(videos)

            if avg_virality < 10:
                continue

            # Check if trend already exists
            existing = (
                session.query(TrendSignal)
                .filter(
                    TrendSignal.topic == topic,
                    TrendSignal.auto_detected == True,
                    TrendSignal.created_at >= cutoff,
                )
                .first()
            )
            if existing:
                existing.video_count = len(videos)
                existing.avg_engagement = avg_engagement
                existing.relevance_score = avg_virality
                existing.related_video_ids = [v.id for v in videos[:20]]
                continue

            # Determine dominant country
            countries = Counter(v.country for v in videos if v.country)
            top_country = countries.most_common(1)[0][0] if countries else None

            trend = TrendSignal(
                source="auto_detection",
                topic=topic,
                format_type=topic,
                relevance_score=avg_virality,
                country=top_country,
                auto_detected=True,
                confidence=min(avg_virality / 100, 1.0),
                video_count=len(videos),
                avg_engagement=avg_engagement,
                growth_rate=0.0,
                related_video_ids=[v.id for v in videos[:20]],
            )
            session.add(trend)
            trends_created += 1

        session.flush()

    return {"trends_created": trends_created, "clusters_analyzed": len(style_clusters)}


@shared_task(expires=3600)
def update_trend_relevance() -> dict:
    """Refresh trend signal scores based on latest data."""
    logger.info("Updating trend relevance scores")
    with get_session() as session:
        from halyoontok.db.models import SocialVideo, TrendSignal

        auto_trends = (
            session.query(TrendSignal)
            .filter(TrendSignal.auto_detected == True)
            .all()
        )

        updated = 0
        for trend in auto_trends:
            if not trend.related_video_ids:
                continue

            video_ids = trend.related_video_ids
            videos = (
                session.query(SocialVideo)
                .filter(SocialVideo.id.in_(video_ids))
                .all()
            )
            if videos:
                trend.avg_engagement = sum(v.engagement_rate for v in videos) / len(videos)
                trend.relevance_score = sum(v.virality_score for v in videos) / len(videos)
                trend.video_count = len(videos)
                updated += 1

        session.flush()

    return {"updated": updated}
