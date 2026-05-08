from decimal import Decimal

from pydantic import BaseModel


class ShippingCalculateRequest(BaseModel):
    """Schema for calculating shipping cost."""

    method: str  # "sedex" | "pickup" | "uber_flash"


class ShippingCalculateResponse(BaseModel):
    """Schema for shipping calculation result."""

    method: str
    label: str
    cost: Decimal
