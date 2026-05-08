from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base


class CustomRequest(Base):
    """Customer request for a custom/artisanal product."""

    __tablename__ = "custom_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="open", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="custom_requests")
    messages: Mapped[list["CustomRequestMessage"]] = relationship(
        "CustomRequestMessage", back_populates="request", cascade="all, delete-orphan"
    )


class CustomRequestMessage(Base):
    """Individual message in a custom request chat thread."""

    __tablename__ = "custom_request_messages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(
        ForeignKey("custom_requests.id", ondelete="CASCADE"), nullable=False
    )
    sender_role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    # Relationships
    request: Mapped["CustomRequest"] = relationship(
        "CustomRequest", back_populates="messages"
    )
