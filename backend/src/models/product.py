from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, Numeric, String, Text, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base


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
