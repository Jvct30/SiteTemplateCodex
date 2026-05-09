from abc import ABC, abstractmethod
from decimal import Decimal

from src.models.order import Order, OrderItem


class IOrderRepository(ABC):
    """Abstract interface for Order data access."""

    @abstractmethod
    async def create(
        self,
        user_id: int,
        shipping_method: str,
        shipping_cost: Decimal,
        subtotal: Decimal,
        discount: Decimal,
        total: Decimal,
        coupon_id: int | None,
    ) -> Order:
        pass

    @abstractmethod
    async def add_item(
        self, order_id: int, product_id: int, quantity: int, unit_price: Decimal
    ) -> OrderItem:
        pass

    @abstractmethod
    async def get_by_id(self, order_id: int) -> Order | None:
        pass

    @abstractmethod
    async def list_by_user(self, user_id: int) -> list[Order]:
        pass

    @abstractmethod
    async def list_all(self, skip: int = 0, limit: int = 50) -> list[Order]:
        pass

    @abstractmethod
    async def set_support_request(self, order_id: int, request_id: int) -> Order | None:
        pass

    @abstractmethod
    async def update_status(self, order_id: int, status: str) -> Order | None:
        pass
