from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from src.core.config import settings


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict[str, str | int]) -> str:
    """Create a JWT access token with an expiration claim."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode["exp"] = int(expire.timestamp())
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, str | int]:
    """Decode and validate a JWT access token."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
