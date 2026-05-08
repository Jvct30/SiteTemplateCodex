from src.core.exceptions import NotFoundException
from src.models.message import HomepageMessage
from src.repositories.interfaces.i_message_repo import IMessageRepository
from src.schemas.message import MessageCreate, MessageUpdate


class MessageService:
    """Service layer for Homepage Message business logic."""

    def __init__(self, message_repo: IMessageRepository):
        self.message_repo = message_repo

    async def list_active_messages(self) -> list[HomepageMessage]:
        return await self.message_repo.list_active()

    async def list_all_messages(self) -> list[HomepageMessage]:
        return await self.message_repo.list_all()

    async def create_message(self, data: MessageCreate) -> HomepageMessage:
        return await self.message_repo.create(data)

    async def update_message(self, message_id: int, data: MessageUpdate) -> HomepageMessage:
        message = await self.message_repo.update(message_id, data)
        if not message:
            raise NotFoundException("Mensagem não encontrada")
        return message

    async def deactivate_message(self, message_id: int) -> HomepageMessage:
        message = await self.message_repo.deactivate(message_id)
        if not message:
            raise NotFoundException("Mensagem não encontrada")
        return message
