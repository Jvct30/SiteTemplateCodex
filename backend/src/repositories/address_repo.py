from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.address import UserAddress
from src.schemas.address import AddressCreate


class AddressRepository:
    """Data access for user delivery addresses."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_by_user(self, user_id: int) -> list[UserAddress]:
        stmt = (
            select(UserAddress)
            .where(UserAddress.user_id == user_id)
            .order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_for_user(self, address_id: int, user_id: int) -> UserAddress | None:
        stmt = select(UserAddress).where(
            UserAddress.id == address_id,
            UserAddress.user_id == user_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: int, data: AddressCreate) -> UserAddress:
        existing = await self.list_by_user(user_id)
        is_default = data.is_default or not existing
        if is_default:
            await self.session.execute(
                update(UserAddress)
                .where(UserAddress.user_id == user_id)
                .values(is_default=False)
            )

        address = UserAddress(
            user_id=user_id,
            label=data.label,
            street=data.street,
            number=data.number,
            complement=data.complement,
            neighborhood=data.neighborhood,
            city=data.city,
            state=data.state,
            zip_code=data.zip_code,
            is_default=is_default,
        )
        self.session.add(address)
        await self.session.flush()
        return address

    async def set_default(self, address_id: int, user_id: int) -> UserAddress | None:
        address = await self.get_for_user(address_id, user_id)
        if not address:
            return None

        await self.session.execute(
            update(UserAddress)
            .where(UserAddress.user_id == user_id)
            .values(is_default=False)
        )
        address.is_default = True
        await self.session.flush()
        return address

    async def delete(self, address_id: int, user_id: int) -> None:
        address = await self.get_for_user(address_id, user_id)
        if address:
            await self.session.delete(address)
            await self.session.flush()
