from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user, get_db
from src.models.user import User
from src.repositories.cart_repo import CartRepository
from src.repositories.user_repo import UserRepository
from src.schemas.user import UserResponse, UserUpdate
from src.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(db), CartRepository(db))

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.update_user(current_user.id, data)

@router.delete("/me", response_model=UserResponse)
async def deactivate_me(
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.deactivate_user(current_user.id)
