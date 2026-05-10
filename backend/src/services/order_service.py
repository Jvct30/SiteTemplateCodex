from decimal import Decimal

from src.core.exceptions import (
    BadRequestException,
    ConflictException,
    NotFoundException,
)
from src.models.address import UserAddress
from src.models.order import Order
from src.repositories.interfaces.i_cart_repo import ICartRepository
from src.repositories.interfaces.i_coupon_repo import ICouponRepository
from src.repositories.interfaces.i_custom_request_repo import ICustomRequestRepository
from src.repositories.interfaces.i_order_repo import IOrderRepository
from src.repositories.interfaces.i_product_repo import IProductRepository
from src.schemas.custom_request import CustomRequestCreate
from src.schemas.order import CheckoutRequest
from src.services.coupon_service import CouponService
from src.services.custom_request_service import CustomRequestService
from src.services.payment_service import PaymentService
from src.services.shipping_service import ShippingService


class OrderService:
    """Service layer for Order business logic."""

    def __init__(
        self,
        order_repo: IOrderRepository,
        cart_repo: ICartRepository,
        product_repo: IProductRepository,
        coupon_repo: ICouponRepository,
        custom_request_repo: ICustomRequestRepository,
    ):
        self.order_repo = order_repo
        self.cart_repo = cart_repo
        self.product_repo = product_repo
        self.coupon_service = CouponService(coupon_repo)
        self.shipping_service = ShippingService()
        self.payment_service = PaymentService()
        self.custom_request_service = CustomRequestService(custom_request_repo)

    async def get_order(self, order_id: int, user_id: int | None = None, is_admin: bool = False) -> Order:
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Pedido não encontrado")
            
        if not is_admin and order.user_id != user_id:
            raise NotFoundException("Pedido não encontrado")
            
        return order

    async def confirm_received(self, order_id: int, user_id: int) -> Order:
        order = await self.get_order(order_id, user_id)
        if order.status not in {"paid", "shipped", "delivered"}:
            raise BadRequestException("O pedido ainda não pode ser confirmado como recebido")
        if order.status == "delivered":
            return order

        updated = await self.order_repo.update_status(order.id, "delivered")
        if not updated:
            raise NotFoundException("Pedido não encontrado")
        return updated

    async def list_user_orders(self, user_id: int) -> list[Order]:
        return await self.order_repo.list_by_user(user_id)

    async def list_all_orders(self, skip: int = 0, limit: int = 50) -> list[Order]:
        return await self.order_repo.list_all(skip, limit)

    async def update_status(self, order_id: int, status: str) -> Order:
        valid_statuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
        if status not in valid_statuses:
            raise BadRequestException("Status inválido")

        current_order = await self.get_order(order_id, is_admin=True)
        if status == "shipped" and current_order.status not in {"paid", "shipped"}:
            raise BadRequestException("Apenas pedidos pagos podem ser marcados como enviados")

        should_confirm_payment = (
            status == "paid"
            and current_order.status not in {"paid", "shipped", "delivered"}
        )
        should_notify_shipment = status == "shipped" and current_order.status != "shipped"

        if should_confirm_payment:
            await self._confirm_payment(current_order)

        order = await self.order_repo.update_status(order_id, status)
        if not order:
            raise NotFoundException("Pedido não encontrado")
        if should_notify_shipment:
            await self._notify_shipped(order)
        return order

    async def _notify_shipped(self, order: Order) -> None:
        if not order.support_request_id:
            return

        await self.custom_request_service.request_repo.add_message(
            order.support_request_id,
            "system",
            f"Seu pedido #{order.id} foi marcado como enviado. Em breve ele chegará no endereço combinado.",
        )

    async def _confirm_payment(self, order: Order) -> None:
        """Apply effects that must happen only after payment is confirmed."""
        custom_request_ids: set[int] = set()

        for item in order.items:
            product = await self.product_repo.get_by_id(item.product_id)
            if not product or not product.is_active:
                raise ConflictException(f"Produto indisponível: Produto #{item.product_id}")

            success = await self.product_repo.decrement_stock(product.id, item.quantity)
            if not success:
                raise ConflictException(f"Estoque insuficiente para: {product.name}")

            if product.custom_request_id:
                custom_request_ids.add(product.custom_request_id)

        for request_id in custom_request_ids:
            await self.custom_request_service.update_status(request_id, "closed")
            await self.custom_request_service.request_repo.add_message(
                request_id,
                "system",
                f"Pagamento confirmado no pedido #{order.id}. Este chat foi fechado.",
            )

        if order.support_request_id:
            await self.custom_request_service.request_repo.add_message(
                order.support_request_id,
                "system",
                f"Pagamento confirmado no pedido #{order.id}. A preparação do pedido pode começar.",
            )

    async def checkout(self, user_id: int, data: CheckoutRequest) -> Order:
        """
        Executes checkout process atomically.
        """
        cart = await self.cart_repo.get_by_user_id(user_id)
        if not cart or not cart.items:
            raise BadRequestException("O carrinho está vazio")

        shipping_address: UserAddress | None = None
        if data.shipping_method != "pickup":
            if not data.address_id:
                raise BadRequestException("Cadastre e selecione um endereço para entrega")
            for address in cart.user.addresses:
                if address.id == data.address_id:
                    shipping_address = address
                    break
            if not shipping_address:
                raise BadRequestException("Endereço de entrega inválido")

        # 1. Check stock without decrementing. Stock leaves the store only after payment.
        subtotal = Decimal("0.00")
        items_to_buy = []
        for item in cart.items:
            product = await self.product_repo.get_by_id(item.product_id)
            if not product or not product.is_active:
                raise ConflictException(f"Produto indisponível: {item.product.name}")
            if product.is_private and product.owner_user_id != user_id:
                raise ConflictException(f"Produto indisponível: {product.name}")

            if product.stock < item.quantity:
                raise ConflictException(f"Estoque insuficiente para: {product.name}")
                
            item_subtotal = product.price * item.quantity
            subtotal += item_subtotal
            items_to_buy.append({
                "product_id": product.id,
                "product_name": product.name,
                "quantity": item.quantity,
                "unit_price": product.price,
                "variation": item.variation,
            })

        # 2. Calculate Shipping
        shipping_cost = self.shipping_service.get_cost_sync(data.shipping_method)

        # 3. Apply Coupon
        discount = Decimal("0.00")
        coupon_id = None
        if data.coupon_code:
            coupon = await self.coupon_service.apply_coupon(data.coupon_code)
            discount = (subtotal * coupon.discount_percent) / Decimal("100")
            coupon_id = coupon.id
            await self.coupon_repo.increment_uses(coupon.id)

        # 4. Calculate Total
        total = subtotal + shipping_cost - discount
        if total < 0:
            total = Decimal("0.00")

        # 5. Create Order
        order = await self.order_repo.create(
            user_id=user_id,
            shipping_method=data.shipping_method,
            shipping_cost=shipping_cost,
            subtotal=subtotal,
            discount=discount,
            total=total,
            coupon_id=coupon_id,
            shipping_address_id=shipping_address.id if shipping_address else None,
        )

        # 6. Add Order Items
        for item_data in items_to_buy:
            await self.order_repo.add_item(
                order_id=order.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                variation=item_data["variation"],
            )

        # 7. Clear Cart
        await self.cart_repo.clear(cart.id)

        # 8. Open order support chat without showing it in the custom-order list
        item_lines = [
            f"- {item['product_name']}: {item['quantity']} unidade(s)"
            for item in items_to_buy
        ]
        address = shipping_address.full_address if shipping_address else "Retirada na loja"
        subject = f"Acompanhamento do Pedido #{order.id}"
        msg = (
            f"Olá! Seu pedido #{order.id} foi criado com sucesso.\n\n"
            f"Carrinho: #{cart.id}\n"
            f"Itens:\n{chr(10).join(item_lines)}\n\n"
            f"Subtotal: R$ {subtotal:.2f}\n"
            f"Frete: R$ {shipping_cost:.2f}\n"
            f"Desconto: R$ {discount:.2f}\n"
            f"Total: R$ {total:.2f}\n\n"
            f"Endereço de entrega/retirada cadastrado:\n{address}\n\n"
            "Confirme por aqui se essas informações estão corretas."
        )
        create_schema = CustomRequestCreate(subject=subject, message=msg)
        followup = await self.custom_request_service.create_request(
            user_id, create_schema, request_type="order_support"
        )
        await self.custom_request_service.update_status(followup.id, "answered")
        await self.order_repo.set_support_request(order.id, followup.id)

        # 9. Payment link. In development this is a mock provider.
        order.payment_link = await self.payment_service.create_payment_link(order)

        # Reload fully populated
        return await self.get_order(order.id, is_admin=True)
