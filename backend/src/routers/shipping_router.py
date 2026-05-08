from fastapi import APIRouter

from src.schemas.shipping import ShippingCalculateRequest, ShippingCalculateResponse
from src.services.shipping_service import ShippingService

router = APIRouter(prefix="/shipping", tags=["shipping"])

@router.post("/calculate", response_model=ShippingCalculateResponse)
async def calculate_shipping(data: ShippingCalculateRequest):
    service = ShippingService()
    return await service.calculate(data.method)
