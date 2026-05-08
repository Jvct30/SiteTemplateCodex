from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    """Schema for creating a new product (admin)."""

    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: Decimal = Field(gt=0)
    stock: int = Field(ge=0)
    image_url: str | None = None


class ProductUpdate(BaseModel):
    """Schema for updating a product (admin, all fields optional)."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    image_url: str | None = None
    is_active: bool | None = None


class ProductResponse(BaseModel):
    """Schema for returning product data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    price: Decimal
    stock: int
    image_url: str | None
    is_active: bool
    created_at: datetime
