import shutil
import uuid

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, require_admin
from src.models.notice import Notice
from src.models.user import User
from src.repositories.cart_repo import CartRepository
from src.repositories.coupon_repo import CouponRepository
from src.repositories.custom_request_repo import CustomRequestRepository
from src.repositories.message_repo import MessageRepository
from src.repositories.order_repo import OrderRepository
from src.repositories.product_repo import ProductRepository
from src.schemas.coupon import CouponCreate, CouponResponse, CouponUpdate
from src.schemas.custom_request import (
    CustomRequestDetailResponse,
    CustomRequestMessageCreate,
    CustomRequestMessageResponse,
    CustomRequestResponse,
)
from src.schemas.message import MessageCreate, MessageResponse, MessageUpdate
from src.schemas.notice import NoticeCreate, NoticeResponse
from src.schemas.order import OrderResponse
from src.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from src.services.coupon_service import CouponService
from src.services.custom_request_service import CustomRequestService
from src.services.message_service import MessageService
from src.services.order_service import OrderService
from src.services.product_service import ProductService

# Require admin globally for all routes in this router
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))

def get_message_service(db: AsyncSession = Depends(get_db)) -> MessageService:
    return MessageService(MessageRepository(db))

def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(OrderRepository(db), CartRepository(db), ProductRepository(db), CouponRepository(db))

def get_coupon_service(db: AsyncSession = Depends(get_db)) -> CouponService:
    return CouponService(CouponRepository(db))

def get_custom_request_service(db: AsyncSession = Depends(get_db)) -> CustomRequestService:
    return CustomRequestService(CustomRequestRepository(db))

# -----------------
# UPLOAD
# -----------------
@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"uploads/{filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"http://localhost:8000/static/{filename}"}

# -----------------
# STORE NOTICE
# -----------------
@router.post("/notice", response_model=NoticeResponse)
async def create_notice(data: NoticeCreate, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import update
    # Inactive previous notices to ensure only one active
    stmt = update(Notice).values(is_active=False)
    await db.execute(stmt)
    
    notice = Notice(message=data.message, is_active=data.is_active)
    db.add(notice)
    await db.commit()
    await db.refresh(notice)
    return notice

@router.delete("/notice")
async def clear_notices(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import update
    stmt = update(Notice).values(is_active=False)
    await db.execute(stmt)
    await db.commit()
    return {"message": "Avisos desativados"}

# -----------------
# PRODUCTS
# -----------------
@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    service: ProductService = Depends(get_product_service)
):
    return await service.create_product(data)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    service: ProductService = Depends(get_product_service)
):
    return await service.update_product(product_id, data)

@router.delete("/products/{product_id}", response_model=ProductResponse)
async def deactivate_product(
    product_id: int,
    service: ProductService = Depends(get_product_service)
):
    return await service.deactivate_product(product_id)

# -----------------
# MESSAGES
# -----------------
@router.post("/messages", response_model=MessageResponse, status_code=201)
async def create_message(
    data: MessageCreate,
    service: MessageService = Depends(get_message_service)
):
    return await service.create_message(data)

@router.put("/messages/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: int,
    data: MessageUpdate,
    service: MessageService = Depends(get_message_service)
):
    return await service.update_message(message_id, data)

@router.delete("/messages/{message_id}", response_model=MessageResponse)
async def deactivate_message(
    message_id: int,
    service: MessageService = Depends(get_message_service)
):
    return await service.deactivate_message(message_id)

# -----------------
# ORDERS
# -----------------
@router.get("/orders", response_model=list[OrderResponse])
async def list_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    service: OrderService = Depends(get_order_service)
):
    return await service.list_all_orders(skip, limit)

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status: str = Query(...),
    service: OrderService = Depends(get_order_service)
):
    return await service.update_status(order_id, status)

# -----------------
# COUPONS
# -----------------
@router.post("/coupons", response_model=CouponResponse, status_code=201)
async def create_coupon(
    data: CouponCreate,
    service: CouponService = Depends(get_coupon_service)
):
    return await service.create_coupon(data)

@router.put("/coupons/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: int,
    data: CouponUpdate,
    service: CouponService = Depends(get_coupon_service)
):
    return await service.update_coupon(coupon_id, data)

@router.delete("/coupons/{coupon_id}", response_model=CouponResponse)
async def deactivate_coupon(
    coupon_id: int,
    service: CouponService = Depends(get_coupon_service)
):
    return await service.deactivate_coupon(coupon_id)

# -----------------
# CUSTOM REQUESTS
# -----------------
@router.get("/custom-requests", response_model=list[CustomRequestResponse])
async def list_all_requests(
    service: CustomRequestService = Depends(get_custom_request_service)
):
    return await service.list_all_requests()

@router.get("/custom-requests/{request_id}", response_model=CustomRequestDetailResponse)
async def get_request_admin(
    request_id: int,
    service: CustomRequestService = Depends(get_custom_request_service)
):
    # Admins bypass user_id check
    return await service.get_request(request_id, is_admin=True)

@router.post("/custom-requests/{request_id}/messages", response_model=CustomRequestMessageResponse)
async def reply_request(
    request_id: int,
    data: CustomRequestMessageCreate,
    current_user: User = Depends(require_admin), # explicitly require admin to get user obj
    service: CustomRequestService = Depends(get_custom_request_service)
):
    return await service.add_message(request_id, current_user.id, "admin", data)
