from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.coupon import Coupon
from src.repositories.interfaces.i_coupon_repo import ICouponRepository
from src.schemas.coupon import CouponCreate, CouponUpdate


class CouponRepository(ICouponRepository):
    """Data access implementation for Coupons."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, coupon_id: int) -> Coupon | None:
        return await self.session.get(Coupon, coupon_id)

    async def get_by_code(self, code: str) -> Coupon | None:
        stmt = select(Coupon).where(Coupon.code == code)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: CouponCreate) -> Coupon:
        coupon = Coupon(
            code=data.code,
            discount_percent=data.discount_percent,
            max_uses=data.max_uses,
            expires_at=data.expires_at,
            is_active=True,
        )
        self.session.add(coupon)
        await self.session.flush()
        return coupon

    async def update(self, coupon_id: int, data: CouponUpdate) -> Coupon | None:
        coupon = await self.get_by_id(coupon_id)
        if not coupon:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(coupon, key, value)

        await self.session.flush()
        return coupon

    async def deactivate(self, coupon_id: int) -> Coupon | None:
        coupon = await self.get_by_id(coupon_id)
        if not coupon:
            return None

        coupon.is_active = False
        await self.session.flush()
        return coupon

    async def increment_uses(self, coupon_id: int) -> None:
        coupon = await self.get_by_id(coupon_id)
        if coupon:
            coupon.current_uses += 1
            await self.session.flush()

    async def list_all(self) -> list[Coupon]:
        stmt = select(Coupon).order_by(Coupon.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
