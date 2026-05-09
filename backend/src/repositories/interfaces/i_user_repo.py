from abc import ABC, abstractmethod

from src.models.user import User
from src.schemas.user import UserCreate, UserUpdate


class IUserRepository(ABC):
    """Abstract interface for User data access."""

    @abstractmethod
    async def get_by_id(self, user_id: int) -> User | None:
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> User | None:
        pass

    @abstractmethod
    async def get_by_cpf(self, cpf: str) -> User | None:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None:
        pass

    @abstractmethod
    async def create(self, data: UserCreate, hashed_password: str) -> User:
        pass

    @abstractmethod
    async def update(
        self, user_id: int, data: UserUpdate, hashed_password: str | None = None
    ) -> User | None:
        pass

    @abstractmethod
    async def deactivate(self, user_id: int) -> User | None:
        pass
