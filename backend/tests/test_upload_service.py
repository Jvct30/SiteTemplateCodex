from io import BytesIO

import pytest
from fastapi import UploadFile

from src.core.config import settings
from src.services.upload_service import UploadService


@pytest.mark.asyncio
async def test_local_upload_uses_public_api_url(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(settings, "UPLOAD_STORAGE", "local")
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(settings, "PUBLIC_API_URL", "https://api.lunart.test")

    file = UploadFile(filename="produto.png", file=BytesIO(b"fake image"))

    url = await UploadService().upload_image(file, "products")

    assert url.startswith("https://api.lunart.test/static/products-")
    assert url.endswith(".png")
    assert len(list(tmp_path.iterdir())) == 1
