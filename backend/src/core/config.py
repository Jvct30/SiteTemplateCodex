from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = f"sqlite+aiosqlite:///{(BACKEND_DIR / 'lunart.db').as_posix()}"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DOMAIN: str = "localhost"
    DATABASE_URL: str = DEFAULT_DATABASE_URL
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    PUBLIC_API_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    UPLOAD_STORAGE: str = "local"
    UPLOAD_DIR: str = "uploads"
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_FOLDER: str = "lunart"
    PAYMENT_PROVIDER: str = "mock"
    MOCK_PAYMENT_BASE_URL: str = "https://sandbox.mercadopago.com.br/checkout/v1/redirect"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
