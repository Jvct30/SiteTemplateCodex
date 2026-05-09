from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Notice(Base):
    __tablename__ = "notices"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    message: Mapped[str] = mapped_column()
    is_active: Mapped[bool] = mapped_column(default=True)
