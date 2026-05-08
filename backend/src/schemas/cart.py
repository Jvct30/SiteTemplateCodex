from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CartItemAdd(BaseModel):
    """Schema for adding an item to the cart."""

    product_id: int
    quantity: int = Field(gt=0, default=1)


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity."""

    quantity: int = Field(gt=0)


class CartItemResponse(BaseModel):
    """Schema for returning a cart item with product details."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    product_price: Decimal
    product_image_url: str | None
    quantity: int
    subtotal: Decimal
    variation: str | None = None


class CartResponse(BaseModel):
    """Schema for returning the full cart."""

    id: int
    items: list[CartItemResponse]
    total: Decimal
