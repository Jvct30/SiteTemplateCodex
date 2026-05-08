from src.core.exceptions import ConflictException, NotFoundException
from src.models.cart import Cart, CartItem
from src.repositories.interfaces.i_cart_repo import ICartRepository
from src.repositories.interfaces.i_product_repo import IProductRepository


class CartService:
    """Service layer for Shopping Cart business logic."""

    def __init__(self, cart_repo: ICartRepository, product_repo: IProductRepository):
        self.cart_repo = cart_repo
        self.product_repo = product_repo

    async def get_cart(self, user_id: int) -> Cart:
        cart = await self.cart_repo.get_by_user_id(user_id)
        if not cart:
            cart = await self.cart_repo.create(user_id)
            cart = await self.cart_repo.get_by_user_id(user_id) # reload with rels
        return cart  # type: ignore

    async def add_item(self, user_id: int, product_id: int, quantity: int) -> CartItem:
        cart = await self.get_cart(user_id)
        
        product = await self.product_repo.get_by_id(product_id)
        if not product or not product.is_active:
            raise NotFoundException("Produto indisponível")
            
        existing_item = await self.cart_repo.get_item(cart.id, product_id)
        
        total_qty = existing_item.quantity + quantity if existing_item else quantity
        if product.stock < total_qty:
            raise ConflictException(f"Estoque insuficiente. Disponível: {product.stock}")

        if existing_item:
            item = await self.cart_repo.update_item_quantity(existing_item.id, total_qty)
            return item  # type: ignore
        else:
            return await self.cart_repo.add_item(cart.id, product_id, quantity)

    async def update_item_quantity(self, user_id: int, item_id: int, quantity: int) -> CartItem:
        cart = await self.get_cart(user_id)
        item = await self.cart_repo.get_item_by_id(item_id)
        
        if not item or item.cart_id != cart.id:
            raise NotFoundException("Item não encontrado no carrinho")
            
        product = await self.product_repo.get_by_id(item.product_id)
        if not product or product.stock < quantity:
            raise ConflictException("Estoque insuficiente")

        updated_item = await self.cart_repo.update_item_quantity(item_id, quantity)
        return updated_item  # type: ignore

    async def remove_item(self, user_id: int, item_id: int) -> None:
        cart = await self.get_cart(user_id)
        item = await self.cart_repo.get_item_by_id(item_id)
        
        if not item or item.cart_id != cart.id:
            raise NotFoundException("Item não encontrado no carrinho")
            
        await self.cart_repo.remove_item(item_id)
