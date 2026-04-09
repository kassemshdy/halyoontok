"""Seed 10 demo videos into the database."""
from __future__ import annotations

import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from halyoontok.configs.constants import (
    AssetType,
    ContentCategory,
    ContentStatus,
    Dialect,
    Language,
    SourceType,
    AgeBand,
)
from halyoontok.db.engine.sql_engine import get_session
from halyoontok.db.models import Video, VideoAsset

# Public domain vertical video samples (free to use)
DEMO_VIDEOS = [
    {
        "title": "تحدي كرة القدم الممتع",
        "description": "تحدي رياضي ممتع للأطفال",
        "category": ContentCategory.SPORTS,
        "language": Language.ARABIC,
        "dialect": Dialect.LEBANESE,
        "educational_score": 0.2,
        "entertainment_score": 0.9,
        "duration_seconds": 15,
        "video_url": "https://videos.pexels.com/video-files/4536530/4536530-uhd_1440_2560_30fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/4536530/free-video-4536530.jpeg",
    },
    {
        "title": "هل تعلم؟ حقائق علمية مذهلة",
        "description": "حقائق علمية للأطفال",
        "category": ContentCategory.SCIENCE,
        "language": Language.ARABIC,
        "dialect": Dialect.MSA,
        "educational_score": 0.9,
        "entertainment_score": 0.6,
        "duration_seconds": 20,
        "video_url": "https://videos.pexels.com/video-files/3196053/3196053-uhd_1440_2560_25fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/3196053/free-video-3196053.jpeg",
    },
    {
        "title": "نكتة اليوم - ضحك مضمون",
        "description": "نكت مضحكة للأطفال",
        "category": ContentCategory.HUMOR,
        "language": Language.ARABIC,
        "dialect": Dialect.IRAQI,
        "educational_score": 0.1,
        "entertainment_score": 0.95,
        "duration_seconds": 12,
        "video_url": "https://videos.pexels.com/video-files/5532767/5532767-uhd_1440_2560_25fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/5532767/free-video-5532767.jpeg",
    },
    {
        "title": "Learn Colors in English!",
        "description": "Fun English lesson for kids",
        "category": ContentCategory.ENGLISH_LEARNING,
        "language": Language.ENGLISH,
        "dialect": Dialect.NONE,
        "educational_score": 0.85,
        "entertainment_score": 0.7,
        "duration_seconds": 18,
        "video_url": "https://videos.pexels.com/video-files/3209211/3209211-uhd_1440_2560_25fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/3209211/free-video-3209211.jpeg",
    },
    {
        "title": "قصة الأرنب والسلحفاة",
        "description": "قصص شخصيات للأطفال",
        "category": ContentCategory.CHARACTER_STORIES,
        "language": Language.ARABIC,
        "dialect": Dialect.MSA,
        "educational_score": 0.7,
        "entertainment_score": 0.8,
        "duration_seconds": 25,
        "video_url": "https://videos.pexels.com/video-files/4625518/4625518-uhd_1440_2560_30fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/4625518/free-video-4625518.jpeg",
    },
    {
        "title": "تعلم الحروف العربية بسهولة",
        "description": "درس ممتع في اللغة العربية",
        "category": ContentCategory.ARABIC_LITERACY,
        "language": Language.ARABIC,
        "dialect": Dialect.MSA,
        "educational_score": 0.95,
        "entertainment_score": 0.5,
        "duration_seconds": 22,
        "video_url": "https://videos.pexels.com/video-files/6981411/6981411-uhd_1440_2560_25fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/6981411/free-video-6981411.jpeg",
    },
    {
        "title": "رقصة التحدي - ترند آمن",
        "description": "ترند رقص آمن للأطفال",
        "category": ContentCategory.SAFE_TRENDS,
        "language": Language.ARABIC,
        "dialect": Dialect.LEBANESE,
        "educational_score": 0.1,
        "entertainment_score": 0.9,
        "duration_seconds": 15,
        "video_url": "https://videos.pexels.com/video-files/4536429/4536429-uhd_1440_2560_30fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/4536429/free-video-4536429.jpeg",
    },
    {
        "title": "عادات وتقاليد لبنانية",
        "description": "اكتشف ثقافة لبنان",
        "category": ContentCategory.CULTURE,
        "language": Language.ARABIC,
        "dialect": Dialect.LEBANESE,
        "educational_score": 0.8,
        "entertainment_score": 0.6,
        "duration_seconds": 20,
        "video_url": "https://videos.pexels.com/video-files/4434242/4434242-uhd_1440_2560_24fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/4434242/free-video-4434242.jpeg",
    },
    {
        "title": "تمارين رياضية صباحية",
        "description": "حركات رياضية للأطفال",
        "category": ContentCategory.SPORTS,
        "language": Language.ARABIC,
        "dialect": Dialect.MSA,
        "educational_score": 0.3,
        "entertainment_score": 0.85,
        "duration_seconds": 18,
        "video_url": "https://videos.pexels.com/video-files/4536526/4536526-uhd_1440_2560_30fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/4536526/free-video-4536526.jpeg",
    },
    {
        "title": "Count to 10 in Arabic & English",
        "description": "Bilingual counting lesson",
        "category": ContentCategory.ENGLISH_LEARNING,
        "language": Language.ARABIC,
        "dialect": Dialect.MSA,
        "educational_score": 0.9,
        "entertainment_score": 0.65,
        "duration_seconds": 16,
        "video_url": "https://videos.pexels.com/video-files/5532771/5532771-uhd_1440_2560_25fps.mp4",
        "thumbnail": "https://images.pexels.com/videos/5532771/free-video-5532771.jpeg",
    },
]


def seed():
    with get_session() as session:
        # Check if demo videos already exist
        existing = session.query(Video).filter(Video.title == DEMO_VIDEOS[0]["title"]).first()
        if existing:
            print("Demo videos already seeded. Skipping.")
            return

        now = datetime.now(timezone.utc)

        for i, v in enumerate(DEMO_VIDEOS):
            video = Video(
                title=v["title"],
                description=v["description"],
                status=ContentStatus.PUBLISHED,
                category=v["category"],
                language=v["language"],
                dialect=v["dialect"],
                age_suitability=AgeBand.AGE_8_12,
                source_type=SourceType.STUDIO_PRODUCED,
                educational_score=v["educational_score"],
                entertainment_score=v["entertainment_score"],
                duration_seconds=v["duration_seconds"],
                published_at=now,
            )
            session.add(video)
            session.flush()

            # Video asset
            session.add(VideoAsset(
                video_id=video.id,
                asset_type=AssetType.VIDEO_RAW,
                storage_path=v["video_url"],
                mime_type="video/mp4",
            ))

            # Thumbnail asset
            session.add(VideoAsset(
                video_id=video.id,
                asset_type=AssetType.THUMBNAIL,
                storage_path=v["thumbnail"],
                mime_type="image/jpeg",
            ))

            print(f"  [{i+1}/10] {v['title']}")

        print("Seeded 10 demo videos.")


if __name__ == "__main__":
    seed()
