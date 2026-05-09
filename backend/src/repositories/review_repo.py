from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.order import Order, OrderItem
from src.models.review import Review
from src.schemas.review import ReviewCreate


class ReviewRepository:
    """Data access for order reviews."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_order(self, order_id: int) -> Review | None:
        stmt = (
            select(Review)
            .where(Review.order_id == order_id)
            .options(
                joinedload(Review.user),
                joinedload(Review.order)
                .joinedload(Order.items)
                .joinedload(OrderItem.product),
            )
        )
        result = await self.session.execute(stmt)
        return result.unique().scalar_one_or_none()

    async def list_public(self, limit: int = 12) -> list[Review]:
        stmt = (
            select(Review)
            .order_by(Review.created_at.desc())
            .limit(limit)
            .options(
                joinedload(Review.user),
                joinedload(Review.order)
                .joinedload(Order.items)
                .joinedload(OrderItem.product),
            )
        )
        result = await self.session.execute(stmt)
        return list(result.unique().scalars().all())

    async def create(
        self, user_id: int, order_id: int, data: ReviewCreate
    ) -> Review:
        review = Review(
            user_id=user_id,
            order_id=order_id,
            rating=data.rating,
            comment=data.comment,
            image_url=data.image_url,
        )
        self.session.add(review)
        await self.session.flush()
        return review
