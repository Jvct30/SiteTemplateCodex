from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user, get_db
from src.models.user import User
from src.repositories.custom_request_repo import CustomRequestRepository
from src.schemas.custom_request import (
    CustomRequestCreate,
    CustomRequestDetailResponse,
    CustomRequestMessageCreate,
    CustomRequestMessageResponse,
    CustomRequestResponse,
)
from src.services.custom_request_service import CustomRequestService

router = APIRouter(prefix="/custom-requests", tags=["custom_requests"])

def get_custom_request_service(db: AsyncSession = Depends(get_db)) -> CustomRequestService:
    return CustomRequestService(CustomRequestRepository(db))

@router.post("", response_model=CustomRequestDetailResponse, status_code=201)
async def create_request(
    data: CustomRequestCreate,
    current_user: User = Depends(get_current_user),
    service: CustomRequestService = Depends(get_custom_request_service)
):
    return await service.create_request(current_user.id, data)

@router.get("", response_model=list[CustomRequestResponse])
async def list_my_requests(
    current_user: User = Depends(get_current_user),
    service: CustomRequestService = Depends(get_custom_request_service)
):
    return await service.list_user_requests(current_user.id)

@router.get("/{request_id}", response_model=CustomRequestDetailResponse)
async def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    service: CustomRequestService = Depends(get_custom_request_service)
):
    return await service.get_request(request_id, current_user.id)

@router.post("/{request_id}/messages", response_model=CustomRequestMessageResponse)
async def send_message(
    request_id: int,
    data: CustomRequestMessageCreate,
    current_user: User = Depends(get_current_user),
    service: CustomRequestService = Depends(get_custom_request_service)
):
    return await service.add_message(request_id, current_user.id, "customer", data)
