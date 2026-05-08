from abc import ABC, abstractmethod

from src.models.product import Product
from src.schemas.product import ProductCreate, ProductUpdate


class IProductRepository(ABC):
    """Abstract interface for Product data access."""

    @abstractmethod
    async def get_by_id(self, product_id: int) -> Product | None:
        pass

    @abstractmethod
    async def list_active(self, skip: int = 0, limit: int = 50) -> list[Product]:
        pass

    @abstractmethod
    async def list_all(self, skip: int = 0, limit: int = 50) -> list[Product]:
        pass

    @abstractmethod
    async def create(self, data: ProductCreate) -> Product:
        pass

    @abstractmethod
    async def update(self, product_id: int, data: ProductUpdate) -> Product | None:
        pass

    @abstractmethod
    async def deactivate(self, product_id: int) -> Product | None:
        pass

    @abstractmethod
    async def decrement_stock(self, product_id: int, quantity: int) -> bool:
        """Atomically decrement stock. Returns False if insufficient stock."""
        pass
