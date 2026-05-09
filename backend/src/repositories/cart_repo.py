from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.cart import Cart, CartItem
from src.repositories.interfaces.i_cart_repo import ICartRepository


class CartRepository(ICartRepository):
    """Data access implementation for Cart and CartItems."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_user_id(self, user_id: int) -> Cart | None:
        stmt = (
            select(Cart)
            .where(Cart.user_id == user_id)
            .options(
                joinedload(Cart.user),
                joinedload(Cart.items).joinedload(CartItem.product),
            )
        )
        result = await self.session.execute(stmt)
        return result.unique().scalar_one_or_none()

    async def create(self, user_id: int) -> Cart:
        cart = Cart(user_id=user_id)
        self.session.add(cart)
        await self.session.flush()
        return cart

    async def get_item(self, cart_id: int, product_id: int, variation: str | None = None) -> CartItem | None:
        stmt = select(CartItem).where(
            CartItem.cart_id == cart_id, 
            CartItem.product_id == product_id,
            CartItem.variation == variation
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_item_by_id(self, item_id: int) -> CartItem | None:
        return await self.session.get(CartItem, item_id)

    async def add_item(self, cart_id: int, product_id: int, quantity: int, variation: str | None = None) -> CartItem:
        item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity, variation=variation)
        self.session.add(item)
        await self.session.flush()
        return item

    async def update_item_quantity(
        self, item_id: int, quantity: int
    ) -> CartItem | None:
        item = await self.get_item_by_id(item_id)
        if not item:
            return None

        item.quantity = quantity
        await self.session.flush()
        return item

    async def remove_item(self, item_id: int) -> None:
        item = await self.get_item_by_id(item_id)
        if item:
            await self.session.delete(item)
            await self.session.flush()

    async def clear(self, cart_id: int) -> None:
        # Since we use cascade="all, delete-orphan", fetching the cart and clearing items
        # list works, or we can just run a DELETE statement
        stmt = select(Cart).where(Cart.id == cart_id).options(joinedload(Cart.items))
        cart = (await self.session.execute(stmt)).unique().scalar_one_or_none()
        if cart:
            cart.items.clear()
            await self.session.flush()
