from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CustomRequestCreate(BaseModel):
    """Schema for creating a custom request."""

    subject: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)


class CustomRequestMessageCreate(BaseModel):
    """Schema for sending a message in a custom request chat."""

    content: str = Field(min_length=1)


class CustomRequestQuoteCreate(BaseModel):
    """Schema for creating a private quoted product from a custom request."""

    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: float = Field(gt=0)


class CustomRequestMessageResponse(BaseModel):
    """Schema for returning a chat message."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    sender_role: str
    content: str
    created_at: datetime


class CustomRequestResponse(BaseModel):
    """Schema for returning a custom request."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject: str
    status: str
    quoted_product_id: int | None = None
    created_at: datetime


class CustomRequestDetailResponse(BaseModel):
    """Schema for returning a custom request with its messages."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject: str
    status: str
    quoted_product_id: int | None = None
    created_at: datetime
    messages: list[CustomRequestMessageResponse]
