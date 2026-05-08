from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CouponCreate(BaseModel):
    """Schema for creating a discount coupon (admin)."""

    code: str = Field(min_length=1, max_length=50)
    discount_percent: Decimal = Field(gt=0, le=100)
    max_uses: int | None = None
    expires_at: datetime | None = None


class CouponUpdate(BaseModel):
    """Schema for updating a coupon (admin)."""

    code: str | None = Field(default=None, min_length=1, max_length=50)
    discount_percent: Decimal | None = Field(default=None, gt=0, le=100)
    is_active: bool | None = None
    max_uses: int | None = None
    expires_at: datetime | None = None


class CouponResponse(BaseModel):
    """Schema for returning coupon data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    discount_percent: Decimal
    is_active: bool
    max_uses: int | None
    current_uses: int
    expires_at: datetime | None
    created_at: datetime


class CouponValidateRequest(BaseModel):
    """Schema for validating a coupon code."""

    code: str


class CouponValidateResponse(BaseModel):
    """Schema for coupon validation result."""

    valid: bool
    discount_percent: Decimal | None = None
    message: str
