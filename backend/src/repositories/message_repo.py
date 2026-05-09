from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.message import HomepageMessage
from src.repositories.interfaces.i_message_repo import IMessageRepository
from src.schemas.message import MessageCreate, MessageUpdate


class MessageRepository(IMessageRepository):
    """Data access implementation for HomepageMessages."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, message_id: int) -> HomepageMessage | None:
        return await self.session.get(HomepageMessage, message_id)

    async def list_active(self) -> list[HomepageMessage]:
        stmt = select(HomepageMessage).where(HomepageMessage.is_active.is_(True))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_all(self) -> list[HomepageMessage]:
        stmt = select(HomepageMessage).order_by(HomepageMessage.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: MessageCreate) -> HomepageMessage:
        message = HomepageMessage(content=data.content, is_active=True)
        self.session.add(message)
        await self.session.flush()
        return message

    async def update(
        self, message_id: int, data: MessageUpdate
    ) -> HomepageMessage | None:
        message = await self.get_by_id(message_id)
        if not message:
            return None

        if data.content is not None:
            message.content = data.content
        if data.is_active is not None:
            message.is_active = data.is_active

        await self.session.flush()
        return message

    async def deactivate(self, message_id: int) -> HomepageMessage | None:
        message = await self.get_by_id(message_id)
        if not message:
            return None

        message.is_active = False
        await self.session.flush()
        return message
