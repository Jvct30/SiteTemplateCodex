from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class Coupon(Base):
    """Discount coupon with usage limits and expiration."""

    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    discount_percent: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    max_uses: Mapped[int | None] = mapped_column(nullable=True)
    current_uses: Mapped[int] = mapped_column(default=0, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
