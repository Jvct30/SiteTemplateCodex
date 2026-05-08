from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.order import Order, OrderItem
from src.repositories.interfaces.i_order_repo import IOrderRepository


class OrderRepository(IOrderRepository):
    """Data access implementation for Orders."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

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
        order = Order(
            user_id=user_id,
            status="pending",
            shipping_method=shipping_method,
            shipping_cost=shipping_cost,
            subtotal=subtotal,
            discount=discount,
            total=total,
            coupon_id=coupon_id,
        )
        self.session.add(order)
        await self.session.flush()
        return order

    async def add_item(
        self, order_id: int, product_id: int, quantity: int, unit_price: Decimal
    ) -> OrderItem:
        item = OrderItem(
            order_id=order_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price,
        )
        self.session.add(item)
        await self.session.flush()
        return item

    async def get_by_id(self, order_id: int) -> Order | None:
        stmt = (
            select(Order)
            .where(Order.id == order_id)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
        )
        result = await self.session.execute(stmt)
        return result.unique().scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> list[Order]:
        stmt = (
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .options(joinedload(Order.items))
        )
        result = await self.session.execute(stmt)
        return list(result.unique().scalars().all())

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[Order]:
        stmt = (
            select(Order)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_status(self, order_id: int, status: str) -> Order | None:
        order = await self.get_by_id(order_id)
        if not order:
            return None

        order.status = status
        await self.session.flush()
        return order
