from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db
from src.repositories.product_repo import ProductRepository
from src.schemas.product import ProductResponse
from src.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))

@router.get("", response_model=list[ProductResponse])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    product_service: ProductService = Depends(get_product_service)
):
    return await product_service.list_active_products(skip, limit)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    return await product_service.get_product(product_id)
