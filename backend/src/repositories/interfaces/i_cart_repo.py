from abc import ABC, abstractmethod

from src.models.cart import Cart, CartItem


class ICartRepository(ABC):
    """Abstract interface for Cart data access."""

    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> Cart | None:
        pass

    @abstractmethod
    async def create(self, user_id: int) -> Cart:
        pass

    @abstractmethod
    async def get_item(self, cart_id: int, product_id: int) -> CartItem | None:
        pass

    @abstractmethod
    async def get_item_by_id(self, item_id: int) -> CartItem | None:
        pass

    @abstractmethod
    async def add_item(self, cart_id: int, product_id: int, quantity: int) -> CartItem:
        pass

    @abstractmethod
    async def update_item_quantity(self, item_id: int, quantity: int) -> CartItem | None:
        pass

    @abstractmethod
    async def remove_item(self, item_id: int) -> None:
        pass

    @abstractmethod
    async def clear(self, cart_id: int) -> None:
        pass
