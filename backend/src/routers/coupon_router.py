from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user, get_db
from src.models.user import User
from src.repositories.coupon_repo import CouponRepository
from src.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from src.services.coupon_service import CouponService

router = APIRouter(prefix="/coupons", tags=["coupons"])

def get_coupon_service(db: AsyncSession = Depends(get_db)) -> CouponService:
    return CouponService(CouponRepository(db))

@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    data: CouponValidateRequest,
    current_user: User = Depends(get_current_user),
    coupon_service: CouponService = Depends(get_coupon_service)
):
    return await coupon_service.validate_coupon(data.code)
