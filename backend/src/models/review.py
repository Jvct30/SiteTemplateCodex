from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.order import Order
    from src.models.user import User


class Review(Base):
    """Customer review for a delivered order."""

    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("order_id", name="uq_reviews_order_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User")
    order: Mapped["Order"] = relationship("Order")

    @property
    def username(self) -> str:
        return self.user.username if self.user else "cliente"

    @property
    def user_icon(self) -> str:
        username = self.username.strip()
        return username[:1].upper() if username else "C"

    @property
    def ordered_items(self) -> str:
        if not self.order or not self.order.items:
            return f"Pedido #{self.order_id}"

        return ", ".join(
            f"{item.quantity}x {item.product_name}" for item in self.order.items
        )
