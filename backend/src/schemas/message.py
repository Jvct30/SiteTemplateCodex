from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    """Schema for creating a homepage message (admin)."""

    content: str


class MessageUpdate(BaseModel):
    """Schema for updating a homepage message (admin)."""

    content: str | None = None
    is_active: bool | None = None


class MessageResponse(BaseModel):
    """Schema for returning a homepage message."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    is_active: bool
    created_at: datetime
