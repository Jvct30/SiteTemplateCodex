from collections.abc import AsyncGenerator

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import CredentialsException, ForbiddenException
from src.core.security import decode_access_token
from src.models.db import DBConnectionHandler

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session, committing or rolling back on exit."""
    async with DBConnectionHandler() as db_handler:
        if db_handler.session is not None:
            yield db_handler.session


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Decode JWT and return the authenticated User, or raise 401."""
    from src.models.user import User

    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise CredentialsException()
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise CredentialsException()

    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise CredentialsException()
    return user


async def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated User if a valid token is present, else None."""
    if token is None:
        return None

    from src.models.user import User

    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        return None

    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        return None
    return user


async def require_admin(
    current_user=Depends(get_current_user),
):
    """Ensure the current user has admin role, or raise 403."""
    if current_user.role != "admin":
        raise ForbiddenException()
    return current_user
