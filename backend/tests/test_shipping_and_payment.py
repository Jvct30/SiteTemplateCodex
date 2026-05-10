from decimal import Decimal

import pytest

from src.models.order import Order
from src.services.payment_service import PaymentService
from src.services.shipping_service import ShippingService


@pytest.mark.asyncio
async def test_shipping_service_returns_mocked_rate() -> None:
    response = await ShippingService().calculate("mercado_envios")

    assert response.method == "mercado_envios"
    assert response.cost == Decimal("25.90")


@pytest.mark.asyncio
async def test_payment_service_returns_mock_link() -> None:
    order = Order(
        id=42,
        user_id=1,
        shipping_method="pickup",
        subtotal=Decimal("50.00"),
        discount=Decimal("0.00"),
        total=Decimal("50.00"),
    )

    payment_link = await PaymentService().create_payment_link(order)

    assert payment_link.endswith("?pref_id=mock_42")
