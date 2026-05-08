from abc import ABC, abstractmethod

from src.models.message import HomepageMessage
from src.schemas.message import MessageCreate, MessageUpdate


class IMessageRepository(ABC):
    """Abstract interface for HomepageMessage data access."""

    @abstractmethod
    async def get_by_id(self, message_id: int) -> HomepageMessage | None:
        pass

    @abstractmethod
    async def list_active(self) -> list[HomepageMessage]:
        pass

    @abstractmethod
    async def list_all(self) -> list[HomepageMessage]:
        pass

    @abstractmethod
    async def create(self, data: MessageCreate) -> HomepageMessage:
        pass

    @abstractmethod
    async def update(self, message_id: int, data: MessageUpdate) -> HomepageMessage | None:
        pass

    @abstractmethod
    async def deactivate(self, message_id: int) -> HomepageMessage | None:
        pass
