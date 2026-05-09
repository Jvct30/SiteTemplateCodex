from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class OrderItemResponse(BaseModel):
    """Schema for an individual order item."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    product_image_url: str | None = None
    quantity: int
    unit_price: Decimal
    variation: str | None = None


class CheckoutRequest(BaseModel):
    """Schema for checkout — specify shipping and optional coupon."""

    shipping_method: str  # "sedex" | "pickup" | "uber_flash"
    coupon_code: str | None = None


class OrderResponse(BaseModel):
    """Schema for returning order data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    shipping_method: str
    shipping_cost: Decimal
    subtotal: Decimal
    discount: Decimal
    total: Decimal
    support_request_id: int | None = None
    payment_link: str | None
    created_at: datetime
    items: list[OrderItemResponse]
