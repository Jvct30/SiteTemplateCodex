from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user, get_db
from src.models.user import User
from src.repositories.cart_repo import CartRepository
from src.repositories.product_repo import ProductRepository
from src.schemas.cart import CartItemAdd, CartItemResponse, CartItemUpdate, CartResponse
from src.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["cart"])

def get_cart_service(db: AsyncSession = Depends(get_db)) -> CartService:
    return CartService(CartRepository(db), ProductRepository(db))

@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service)
):
    cart = await cart_service.get_cart(current_user.id)
    
    # Map to response schema
    items = []
    total = 0
    for item in cart.items:
        subtotal = item.product.price * item.quantity
        total += subtotal
        items.append(CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name,
            product_price=item.product.price,
            product_image_url=item.product.image_url,
            quantity=item.quantity,
            subtotal=subtotal,
            variation=item.variation
        ))
        
    return CartResponse(id=cart.id, items=items, total=total)

@router.post("/items", response_model=CartItemResponse)
async def add_item(
    data: CartItemAdd,
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service)
):
    item = await cart_service.add_item(current_user.id, data.product_id, data.quantity, data.variation)
    product = await cart_service.product_repo.get_by_id(data.product_id)
    subtotal = product.price * item.quantity
    return CartItemResponse(
        id=item.id,
        product_id=item.product_id,
        product_name=product.name,
        product_price=product.price,
        product_image_url=product.image_url,
        quantity=item.quantity,
        subtotal=subtotal,
        variation=item.variation
    )

@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service)
):
    item = await cart_service.update_item_quantity(current_user.id, item_id, data.quantity)
    product = await cart_service.product_repo.get_by_id(item.product_id)
    subtotal = product.price * item.quantity
    return CartItemResponse(
        id=item.id,
        product_id=item.product_id,
        product_name=product.name,
        product_price=product.price,
        product_image_url=product.image_url,
        quantity=item.quantity,
        subtotal=subtotal,
        variation=item.variation
    )

@router.delete("/items/{item_id}", status_code=204)
async def remove_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service)
):
    await cart_service.remove_item(current_user.id, item_id)
