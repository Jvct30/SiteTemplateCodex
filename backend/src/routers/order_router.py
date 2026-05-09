from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user, get_db
from src.models.user import User
from src.repositories.cart_repo import CartRepository
from src.repositories.coupon_repo import CouponRepository
from src.repositories.custom_request_repo import CustomRequestRepository
from src.repositories.order_repo import OrderRepository
from src.repositories.product_repo import ProductRepository
from src.schemas.order import CheckoutRequest, OrderResponse
from src.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])

def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(
        OrderRepository(db),
        CartRepository(db),
        ProductRepository(db),
        CouponRepository(db),
        CustomRequestRepository(db)
    )

@router.post("/checkout", response_model=OrderResponse, status_code=201)
async def checkout(
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service)
):
    return await order_service.checkout(current_user.id, data)

@router.get("", response_model=list[OrderResponse])
async def list_orders(
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service)
):
    return await order_service.list_user_orders(current_user.id)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service)
):
    return await order_service.get_order(order_id, current_user.id)


@router.post("/{order_id}/confirm-received", response_model=OrderResponse)
async def confirm_received(
    order_id: int,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    return await order_service.confirm_received(order_id, current_user.id)
