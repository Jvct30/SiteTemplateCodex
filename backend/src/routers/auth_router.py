from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db
from src.repositories.cart_repo import CartRepository
from src.repositories.user_repo import UserRepository
from src.schemas.auth import LoginRequest, TokenResponse
from src.schemas.user import UserCreate, UserResponse
from src.services.auth_service import AuthService
from src.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(db), CartRepository(db))

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.create_user(data)

@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.login(data)
