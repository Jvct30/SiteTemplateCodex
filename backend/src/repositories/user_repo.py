from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User
from src.repositories.interfaces.i_user_repo import IUserRepository
from src.schemas.user import UserCreate, UserUpdate


class UserRepository(IUserRepository):
    """Data access implementation for Users."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: int) -> User | None:
        return await self.session.get(User, user_id)

    async def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_cpf(self, cpf: str) -> User | None:
        stmt = select(User).where(User.cpf == cpf)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate, hashed_password: str) -> User:
        user = User(
            full_name=data.full_name,
            username=data.username,
            email=data.email.strip().lower(),
            password=hashed_password,
            cpf=data.cpf,
            birth_date=data.birth_date,
            address_street="",
            address_number="",
            address_complement=None,
            address_neighborhood="",
            address_city="",
            address_state="",
            address_zip="",
            role="customer",
            is_active=True,
        )
        self.session.add(user)
        await self.session.flush()
        return user

    async def update(
        self, user_id: int, data: UserUpdate, hashed_password: str | None = None
    ) -> User | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        update_data = data.model_dump(exclude_unset=True)
        if hashed_password:
            update_data["password"] = hashed_password
            
        # password doesn't exist in data, but was handled above
        if "password" in update_data and not hashed_password:
            del update_data["password"]

        for key, value in update_data.items():
            setattr(user, key, value)

        await self.session.flush()
        return user

    async def deactivate(self, user_id: int) -> User | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        user.is_active = False
        await self.session.flush()
        return user
