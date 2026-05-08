from abc import ABC, abstractmethod

from src.models.custom_request import CustomRequest, CustomRequestMessage


class ICustomRequestRepository(ABC):
    """Abstract interface for CustomRequest data access."""

    @abstractmethod
    async def create(self, user_id: int, subject: str) -> CustomRequest:
        pass

    @abstractmethod
    async def get_by_id(self, request_id: int) -> CustomRequest | None:
        pass

    @abstractmethod
    async def list_by_user(self, user_id: int) -> list[CustomRequest]:
        pass

    @abstractmethod
    async def list_all(self) -> list[CustomRequest]:
        pass

    @abstractmethod
    async def add_message(
        self, request_id: int, sender_role: str, content: str
    ) -> CustomRequestMessage:
        pass

    @abstractmethod
    async def update_status(self, request_id: int, status: str) -> CustomRequest | None:
        pass
