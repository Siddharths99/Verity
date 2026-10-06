import os
import uuid
import logging
from typing import Set, Optional
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("verity.security")

# Allowed file extensions by media category
ALLOWED_AUDIO_EXTENSIONS: Set[str] = {".wav", ".mp3", ".m4a", ".ogg", ".flac", ".aac"}
ALLOWED_IMAGE_EXTENSIONS: Set[str] = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"}
ALLOWED_VIDEO_EXTENSIONS: Set[str] = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
ALLOWED_DOCUMENT_EXTENSIONS: Set[str] = {".pdf"}

ALLOWED_MULTIMODAL_EXTENSIONS: Set[str] = (
    ALLOWED_AUDIO_EXTENSIONS
    | ALLOWED_IMAGE_EXTENSIONS
    | ALLOWED_VIDEO_EXTENSIONS
    | ALLOWED_DOCUMENT_EXTENSIONS
)

# 25 MB max upload ceiling to prevent storage and memory exhaustion (DoS)
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024


async def save_upload_file_securely(
    upload_file: UploadFile,
    allowed_extensions: Set[str],
    destination_dir: str,
    prefix: str = "upload",
    max_size_bytes: int = MAX_FILE_SIZE_BYTES
) -> str:
    """
    Securely validates and streams an incoming UploadFile to disk:
    1. Validates file extension against an allowed whitelist.
    2. Generates an unguessable UUID-based filename.
    3. Streams content in 1MB chunks to enforce a hard maximum file size.
    4. Automatically purges partial files if size is exceeded or an exception occurs.
    """
    original_name = upload_file.filename or ""
    file_ext = os.path.splitext(original_name)[1].lower()

    if file_ext not in allowed_extensions:
        allowed_list = ", ".join(sorted(allowed_extensions))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{file_ext}'. Allowed extensions: {allowed_list}"
        )

    os.makedirs(destination_dir, exist_ok=True)
    secure_filename = f"{prefix}_{uuid.uuid4().hex}{file_ext}"
    target_path = os.path.join(destination_dir, secure_filename)

    total_bytes = 0
    try:
        with open(target_path, "wb") as buffer:
            while chunk := await upload_file.read(1024 * 1024):
                total_bytes += len(chunk)
                if total_bytes > max_size_bytes:
                    max_mb = max_size_bytes // (1024 * 1024)
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum allowed upload size of {max_mb} MB."
                    )
                buffer.write(chunk)
    except Exception as e:
        # Guarantee partial file removal on abort or failure
        if os.path.exists(target_path):
            try:
                os.remove(target_path)
            except Exception:
                pass
        raise e

    return target_path


def cleanup_temp_file(file_path: Optional[str]) -> None:
    """
    Safely removes a temporary file from disk.
    """
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to remove temporary file {file_path}: {e}")
