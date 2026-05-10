from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, require_admin
from src.models.notice import Notice
from src.models.store_link import StoreLink
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
    CustomRequestQuoteCreate,
    CustomRequestResponse,
)
from src.schemas.message import MessageCreate, MessageResponse, MessageUpdate
from src.schemas.notice import NoticeCreate, NoticeResponse
from src.schemas.order import OrderResponse
from src.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from src.schemas.store_link import StoreLinksResponse, StoreLinksUpdate
from src.services.coupon_service import CouponService
from src.services.custom_request_service import CustomRequestService
from src.services.message_service import MessageService
from src.services.order_service import OrderService
from src.services.product_service import ProductService
from src.services.upload_service import UploadService

# Require admin globally for all routes in this router
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))

def get_message_service(db: AsyncSession = Depends(get_db)) -> MessageService:
    return MessageService(MessageRepository(db))

def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(
        OrderRepository(db),
        CartRepository(db),
        ProductRepository(db),
        CouponRepository(db),
        CustomRequestRepository(db),
    )

def get_coupon_service(db: AsyncSession = Depends(get_db)) -> CouponService:
    return CouponService(CouponRepository(db))

def get_custom_request_service(db: AsyncSession = Depends(get_db)) -> CustomRequestService:
    return CustomRequestService(CustomRequestRepository(db), ProductRepository(db))

# -----------------
# UPLOAD
# -----------------
@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    url = await UploadService().upload_image(file, "products")
    return {"url": url}

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
# STORE LINKS
# -----------------
@router.put("/links", response_model=StoreLinksResponse)
async def update_store_links(
    data: StoreLinksUpdate,
    db: AsyncSession = Depends(get_db),
):
    values = {
        "instagram": data.instagram_url.strip(),
        "shopee": data.shopee_url.strip(),
        "whatsapp": data.whatsapp_url.strip(),
    }

    for platform, url in values.items():
        result = await db.execute(
            select(StoreLink).where(StoreLink.platform == platform)
        )
        link = result.scalars().first()
        if link:
            link.url = url
        else:
            db.add(StoreLink(platform=platform, url=url))

    await db.commit()
    return StoreLinksResponse(
        instagram_url=values["instagram"],
        shopee_url=values["shopee"],
        whatsapp_url=values["whatsapp"],
    )

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


@router.post(
    "/custom-requests/{request_id}/quote",
    response_model=ProductResponse,
    status_code=201,
)
async def create_custom_request_quote(
    request_id: int,
    data: CustomRequestQuoteCreate,
    service: CustomRequestService = Depends(get_custom_request_service),
):
    return await service.create_quote_product(request_id, data)
