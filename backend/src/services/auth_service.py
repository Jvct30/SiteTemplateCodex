from src.core.exceptions import CredentialsException
from src.core.security import create_access_token, verify_password
from src.repositories.interfaces.i_user_repo import IUserRepository
from src.schemas.auth import LoginRequest, TokenResponse


class AuthService:
    """Service layer for authentication."""

    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_username(data.username)
        if not user or not user.is_active:
            raise CredentialsException()

        if not verify_password(data.password, user.password):
            raise CredentialsException()

        access_token = create_access_token(data={"sub": str(user.id)})
        return TokenResponse(access_token=access_token, token_type="bearer")
