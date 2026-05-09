from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.cart import Cart
    from src.models.custom_request import CustomRequest
    from src.models.order import Order


class User(Base):
    """User entity representing a customer or admin."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    cpf: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    address_street: Mapped[str] = mapped_column(String(255), nullable=False)
    address_number: Mapped[str] = mapped_column(String(20), nullable=False)
    address_complement: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address_neighborhood: Mapped[str] = mapped_column(String(100), nullable=False)
    address_city: Mapped[str] = mapped_column(String(100), nullable=False)
    address_state: Mapped[str] = mapped_column(String(2), nullable=False)
    address_zip: Mapped[str] = mapped_column(String(9), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="customer", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    # Relationships
    cart: Mapped["Cart | None"] = relationship(
        "Cart", back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    orders: Mapped[list["Order"]] = relationship(
        "Order", back_populates="user", cascade="all, delete-orphan"
    )
    custom_requests: Mapped[list["CustomRequest"]] = relationship(
        "CustomRequest", back_populates="user", cascade="all, delete-orphan"
    )
