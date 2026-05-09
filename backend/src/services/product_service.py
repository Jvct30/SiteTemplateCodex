from src.core.exceptions import ForbiddenException, NotFoundException
from src.models.product import Product
from src.models.user import User
from src.repositories.interfaces.i_product_repo import IProductRepository
from src.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """Service layer for Product business logic."""

    def __init__(self, product_repo: IProductRepository):
        self.product_repo = product_repo

    async def list_active_products(self, skip: int = 0, limit: int = 50) -> list[Product]:
        return await self.product_repo.list_active(skip, limit)

    async def list_all_products(self, skip: int = 0, limit: int = 50) -> list[Product]:
        return await self.product_repo.list_all(skip, limit)

    async def get_product(self, product_id: int, current_user: User | None = None) -> Product:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException("Produto não encontrado")
        if product.is_private:
            if not current_user:
                raise NotFoundException("Produto não encontrado")
            if current_user.role != "admin" and product.owner_user_id != current_user.id:
                raise ForbiddenException("Produto disponível apenas para o cliente do chat")
        return product

    async def create_product(self, data: ProductCreate) -> Product:
        return await self.product_repo.create(data)

    async def update_product(self, product_id: int, data: ProductUpdate) -> Product:
        product = await self.product_repo.update(product_id, data)
        if not product:
            raise NotFoundException("Produto não encontrado")
        return product

    async def deactivate_product(self, product_id: int) -> Product:
        product = await self.product_repo.deactivate(product_id)
        if not product:
            raise NotFoundException("Produto não encontrado")
        return product
