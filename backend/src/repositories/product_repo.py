from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.product import Product
from src.repositories.interfaces.i_product_repo import IProductRepository
from src.schemas.product import ProductCreate, ProductUpdate


class ProductRepository(IProductRepository):
    """Data access implementation for Products."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, product_id: int) -> Product | None:
        return await self.session.get(Product, product_id)

    async def list_active(self, skip: int = 0, limit: int = 50) -> list[Product]:
        stmt = (
            select(Product)
            .where(
                Product.is_active.is_(True),
                Product.is_private.is_(False),
                Product.stock > 0,
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[Product]:
        stmt = select(Product).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: ProductCreate) -> Product:
        product = Product(
            name=data.name,
            description=data.description,
            price=data.price,
            stock=data.stock,
            image_url=data.image_url,
            variations=data.variations,
            is_private=data.is_private,
            owner_user_id=data.owner_user_id,
            custom_request_id=data.custom_request_id,
            is_active=True,
        )
        self.session.add(product)
        await self.session.flush()
        return product

    async def update(self, product_id: int, data: ProductUpdate) -> Product | None:
        product = await self.get_by_id(product_id)
        if not product:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)

        await self.session.flush()
        return product

    async def deactivate(self, product_id: int) -> Product | None:
        product = await self.get_by_id(product_id)
        if not product:
            return None

        product.is_active = False
        await self.session.flush()
        return product

    async def decrement_stock(self, product_id: int, quantity: int) -> bool:
        """Atomically decrement stock using serialized transaction isolation (SQLite workaround)
        or SELECT FOR UPDATE (if PostgreSQL). Since SQLite doesn't support row-level locks,
        we do a standard get and update. For better concurrency in PostgreSQL, use with_for_update().
        """
        # Note: If migrating to PostgreSQL, change this to:
        # stmt = select(Product).where(Product.id == product_id).with_for_update()
        # product = (await self.session.execute(stmt)).scalar_one_or_none()
        
        product = await self.get_by_id(product_id)
        if not product or product.stock < quantity:
            return False

        product.stock -= quantity
        await self.session.flush()
        return True
