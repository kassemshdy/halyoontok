from __future__ import annotations

import io
from PIL import Image

THUMBNAIL_WIDTH = 360


def generate_image_thumbnail(image_bytes: bytes) -> bytes:
    """Resize image to thumbnail width, maintaining aspect ratio."""
    img = Image.open(io.BytesIO(image_bytes))
    ratio = THUMBNAIL_WIDTH / img.width
    new_height = int(img.height * ratio)
    img = img.resize((THUMBNAIL_WIDTH, new_height), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()
