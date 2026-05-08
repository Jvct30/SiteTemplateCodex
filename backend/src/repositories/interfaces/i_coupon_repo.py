from abc import ABC, abstractmethod

from src.models.coupon import Coupon
from src.schemas.coupon import CouponCreate, CouponUpdate


class ICouponRepository(ABC):
    """Abstract interface for Coupon data access."""

    @abstractmethod
    async def get_by_id(self, coupon_id: int) -> Coupon | None:
        pass

    @abstractmethod
    async def get_by_code(self, code: str) -> Coupon | None:
        pass

    @abstractmethod
    async def create(self, data: CouponCreate) -> Coupon:
        pass

    @abstractmethod
    async def update(self, coupon_id: int, data: CouponUpdate) -> Coupon | None:
        pass

    @abstractmethod
    async def deactivate(self, coupon_id: int) -> Coupon | None:
        pass

    @abstractmethod
    async def increment_uses(self, coupon_id: int) -> None:
        pass

    @abstractmethod
    async def list_all(self) -> list[Coupon]:
        pass
