from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class StoreLink(Base):
    __tablename__ = "store_links"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    platform: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    url: Mapped[str] = mapped_column(String(500), default="", nullable=False)
