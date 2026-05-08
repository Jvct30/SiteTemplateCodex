from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base


class Order(Base):
    """Completed purchase order."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False
    )
    shipping_method: Mapped[str] = mapped_column(String(30), nullable=False)
    shipping_cost: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=0, nullable=False
    )
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=0, nullable=False
    )
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    coupon_id: Mapped[int | None] = mapped_column(
        ForeignKey("coupons.id"), nullable=True
    )
    payment_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="orders")
    coupon: Mapped["Coupon | None"] = relationship("Coupon")
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    """Snapshot of a product at purchase time."""

    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")
