from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db
from src.repositories.message_repo import MessageRepository
from src.schemas.message import MessageResponse
from src.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])

def get_message_service(db: AsyncSession = Depends(get_db)) -> MessageService:
    return MessageService(MessageRepository(db))

@router.get("", response_model=list[MessageResponse])
async def list_active_messages(
    message_service: MessageService = Depends(get_message_service)
):
    return await message_service.list_active_messages()
