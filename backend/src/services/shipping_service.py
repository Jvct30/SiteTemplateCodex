from decimal import Decimal

from src.core.exceptions import BadRequestException
from src.schemas.shipping import ShippingCalculateResponse


class ShippingService:
    """Service layer for Shipping business logic (Mocked)."""

    SHIPPING_RATES = {
        "mercado_envios": Decimal("25.90"),
        "pickup": Decimal("0.00"),
    }

    LABELS = {
        "mercado_envios": "Mercado Pago (Envio)",
        "pickup": "Retirada no Local",
    }

    async def calculate(self, method: str) -> ShippingCalculateResponse:
        method = method.lower()
        if method not in self.SHIPPING_RATES:
            raise BadRequestException("Método de envio inválido")

        return ShippingCalculateResponse(
            method=method,
            label=self.LABELS[method],
            cost=self.SHIPPING_RATES[method],
        )

    def get_cost_sync(self, method: str) -> Decimal:
        """Sync version for internal use during checkout."""
        method = method.lower()
        if method not in self.SHIPPING_RATES:
            raise BadRequestException("Método de envio inválido")
        return self.SHIPPING_RATES[method]
