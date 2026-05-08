from datetime import datetime

from sqlalchemy import Boolean, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class HomepageMessage(Base):
    """Announcement messages displayed on the homepage by admin."""

    __tablename__ = "homepage_messages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
