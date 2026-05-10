import shutil
import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from starlette.concurrency import run_in_threadpool

from src.core.config import settings
from src.core.exceptions import BadRequestException


class UploadService:
    """Store uploaded images locally in dev or on Cloudinary when configured."""

    def __init__(self) -> None:
        self.storage = settings.UPLOAD_STORAGE.lower()

    async def upload_image(self, file: UploadFile, folder: str) -> str:
        if not file.filename:
            raise BadRequestException("Arquivo inválido")

        if self.storage == "cloudinary":
            return await self._upload_cloudinary(file, folder)
        if self.storage == "local":
            return await self._upload_local(file, folder)

        raise BadRequestException("Serviço de upload inválido")

    async def _upload_cloudinary(self, file: UploadFile, folder: str) -> str:
        if not all(
            [
                settings.CLOUDINARY_CLOUD_NAME,
                settings.CLOUDINARY_API_KEY,
                settings.CLOUDINARY_API_SECRET,
            ]
        ):
            raise BadRequestException("Cloudinary não configurado")

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )

        result = await run_in_threadpool(
            cloudinary.uploader.upload,
            file.file,
            folder=f"{settings.CLOUDINARY_FOLDER}/{folder}",
            resource_type="image",
        )
        secure_url = result.get("secure_url")
        if not secure_url:
            raise BadRequestException("Não foi possível salvar a imagem")
        return str(secure_url)

    async def _upload_local(self, file: UploadFile, folder: str) -> str:
        suffix = Path(file.filename).suffix or ".jpg"
        filename = f"{folder}-{uuid.uuid4()}{suffix}"
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        path = upload_dir / filename

        def copy_file() -> None:
            with path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        await run_in_threadpool(copy_file)
        return f"{settings.PUBLIC_API_URL.rstrip('/')}/static/{filename}"
