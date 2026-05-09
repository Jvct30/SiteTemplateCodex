from datetime import UTC, datetime

from src.core.exceptions import BadRequestException, NotFoundException
from src.models.coupon import Coupon
from src.repositories.interfaces.i_coupon_repo import ICouponRepository
from src.schemas.coupon import CouponCreate, CouponUpdate, CouponValidateResponse


class CouponService:
    """Service layer for Coupon business logic."""

    def __init__(self, coupon_repo: ICouponRepository):
        self.coupon_repo = coupon_repo

    async def get_all_coupons(self) -> list[Coupon]:
        return await self.coupon_repo.list_all()

    async def get_coupon(self, coupon_id: int) -> Coupon:
        coupon = await self.coupon_repo.get_by_id(coupon_id)
        if not coupon:
            raise NotFoundException("Cupom não encontrado")
        return coupon

    async def create_coupon(self, data: CouponCreate) -> Coupon:
        existing = await self.coupon_repo.get_by_code(data.code)
        if existing:
            raise BadRequestException("Já existe um cupom com este código")
        return await self.coupon_repo.create(data)

    async def update_coupon(self, coupon_id: int, data: CouponUpdate) -> Coupon:
        # Check if updating code to one that already exists
        if data.code:
            existing = await self.coupon_repo.get_by_code(data.code)
            if existing and existing.id != coupon_id:
                raise BadRequestException("Já existe um cupom com este código")
                
        coupon = await self.coupon_repo.update(coupon_id, data)
        if not coupon:
            raise NotFoundException("Cupom não encontrado")
        return coupon

    async def deactivate_coupon(self, coupon_id: int) -> Coupon:
        coupon = await self.coupon_repo.deactivate(coupon_id)
        if not coupon:
            raise NotFoundException("Cupom não encontrado")
        return coupon

    async def validate_coupon(self, code: str) -> CouponValidateResponse:
        coupon = await self.coupon_repo.get_by_code(code)
        
        if not coupon:
            return CouponValidateResponse(valid=False, message="Cupom inválido")
            
        if not coupon.is_active:
            return CouponValidateResponse(valid=False, message="Cupom inativo")
            
        if coupon.max_uses and coupon.current_uses >= coupon.max_uses:
            return CouponValidateResponse(valid=False, message="Cupom atingiu o limite de usos")
            
        if coupon.expires_at and coupon.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
            return CouponValidateResponse(valid=False, message="Cupom expirado")
            
        return CouponValidateResponse(
            valid=True,
            discount_percent=coupon.discount_percent,
            message="Cupom aplicado com sucesso!"
        )

    async def apply_coupon(self, code: str) -> Coupon:
        """Called during checkout to fully validate and return the coupon."""
        validation = await self.validate_coupon(code)
        if not validation.valid:
            raise BadRequestException(validation.message)
            
        coupon = await self.coupon_repo.get_by_code(code)
        return coupon  # type: ignore
