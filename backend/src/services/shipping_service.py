from decimal import Decimal

from src.core.exceptions import BadRequestException
from src.schemas.shipping import ShippingCalculateResponse


class ShippingService:
    """Service layer for Shipping business logic (Mocked)."""

    SHIPPING_RATES = {
        "sedex": Decimal("25.90"),
        "pickup": Decimal("0.00"),
        "uber_flash": Decimal("18.50"),
    }

    LABELS = {
        "sedex": "Sedex",
        "pickup": "Retirada na Loja",
        "uber_flash": "Uber Flash (Você solicita o envio)",
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
