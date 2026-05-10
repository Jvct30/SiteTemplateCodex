import pytest
from httpx import AsyncClient

from src.models.db import async_session
from src.models.user import User


async def register_and_login(
    client: AsyncClient,
    username: str,
    cpf: str,
    email: str,
) -> str:
    await client.post(
        "/auth/register",
        json={
            "full_name": f"{username.title()} Lunart",
            "username": username,
            "email": email,
            "password": "secret123",
            "cpf": cpf,
            "birth_date": "2000-01-01",
        },
    )
    response = await client.post(
        "/auth/login",
        json={"username": username, "password": "secret123"},
    )
    return str(response.json()["access_token"])


@pytest.mark.asyncio
async def test_checkout_creates_pending_order_with_mock_payment_link(
    client: AsyncClient,
) -> None:
    admin_token = await register_and_login(
        client,
        "admin",
        "11111111111",
        "admin@example.com",
    )
    async with async_session() as session:
        admin = await session.get(User, 1)
        assert admin is not None
        admin.role = "admin"
        await session.commit()

    product_response = await client.post(
        "/admin/products",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Lua de Crochê",
            "description": "Peça artesanal",
            "price": "30.00",
            "stock": 2,
            "image_url": None,
            "image_urls": None,
        },
    )
    assert product_response.status_code == 201
    product_id = product_response.json()["id"]

    customer_token = await register_and_login(
        client,
        "cliente",
        "22222222222",
        "cliente@example.com",
    )
    auth_header = {"Authorization": f"Bearer {customer_token}"}

    cart_response = await client.post(
        "/cart/items",
        headers=auth_header,
        json={"product_id": product_id, "quantity": 1},
    )
    assert cart_response.status_code == 200

    checkout_response = await client.post(
        "/orders/checkout",
        headers=auth_header,
        json={"shipping_method": "pickup"},
    )

    assert checkout_response.status_code == 201
    body = checkout_response.json()
    assert body["status"] == "pending"
    assert body["shipping_method"] == "pickup"
    assert body["payment_link"].endswith(f"?pref_id=mock_{body['id']}")
    assert body["items"][0]["product_id"] == product_id
