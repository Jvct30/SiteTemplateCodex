import os
import sys
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_lunart.db"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["PUBLIC_API_URL"] = "http://testserver"
os.environ["UPLOAD_STORAGE"] = "local"

from src.main import app  # noqa: E402
from src.models.base import Base  # noqa: E402
from src.models.db import engine  # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def reset_database() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client
