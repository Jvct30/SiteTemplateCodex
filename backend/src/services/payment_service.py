from src.core.config import settings
from src.core.exceptions import BadRequestException
from src.models.order import Order


class PaymentService:
    """Create payment links using the configured provider."""

    async def create_payment_link(self, order: Order) -> str:
        provider = settings.PAYMENT_PROVIDER.lower()
        if provider == "mock":
            return self._create_mock_link(order)

        raise BadRequestException("Provedor de pagamento não configurado")

    def _create_mock_link(self, order: Order) -> str:
        base_url = settings.MOCK_PAYMENT_BASE_URL.rstrip("/")
        return f"{base_url}?pref_id=mock_{order.id}"
