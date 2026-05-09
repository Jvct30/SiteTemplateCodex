from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user, get_db
from src.models.user import User
from src.repositories.address_repo import AddressRepository
from src.repositories.cart_repo import CartRepository
from src.repositories.user_repo import UserRepository
from src.schemas.address import AddressCreate, AddressResponse
from src.schemas.user import UserResponse, UserUpdate
from src.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(db), CartRepository(db))

def get_address_repo(db: AsyncSession = Depends(get_db)) -> AddressRepository:
    return AddressRepository(db)

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


@router.get("/me/addresses", response_model=list[AddressResponse])
async def list_my_addresses(
    current_user: User = Depends(get_current_user),
    address_repo: AddressRepository = Depends(get_address_repo),
):
    return await address_repo.list_by_user(current_user.id)


@router.post("/me/addresses", response_model=AddressResponse, status_code=201)
async def create_my_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user),
    address_repo: AddressRepository = Depends(get_address_repo),
):
    return await address_repo.create(current_user.id, data)


@router.put("/me/addresses/{address_id}/default", response_model=AddressResponse)
async def set_default_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    address_repo: AddressRepository = Depends(get_address_repo),
):
    from src.core.exceptions import NotFoundException

    address = await address_repo.set_default(address_id, current_user.id)
    if not address:
        raise NotFoundException("Endereço não encontrado")
    return address


@router.delete("/me/addresses/{address_id}", status_code=204)
async def delete_my_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    address_repo: AddressRepository = Depends(get_address_repo),
):
    await address_repo.delete(address_id, current_user.id)
