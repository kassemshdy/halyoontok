from fastapi import APIRouter
from fastapi import Depends
from fastapi import UploadFile

from halyoontok.auth.permissions import require_editor
from halyoontok.db.models import User

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/upload")
def upload_media(
    file: UploadFile,
    video_id: int,
    user: User = Depends(require_editor),
) -> dict:
    # TODO: save to S3, create VideoAsset record, trigger transcode task
    return {
        "filename": file.filename,
        "video_id": video_id,
        "status": "uploaded",
    }
