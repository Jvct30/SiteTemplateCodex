from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.cart import CartItem
    from src.models.order import OrderItem


class Product(Base):
    """Product entity for artisanal goods."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(default=0, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    owner_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    custom_request_id: Mapped[int | None] = mapped_column(
        ForeignKey("custom_requests.id"), nullable=True
    )
    variations: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    # Relationships
    cart_items: Mapped[list["CartItem"]] = relationship(
        "CartItem", back_populates="product"
    )
    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", back_populates="product"
    )
