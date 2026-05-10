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


async def create_admin_token(client: AsyncClient) -> str:
    token = await register_and_login(
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
    return token


@pytest.mark.asyncio
async def test_admin_links_are_saved_and_publicly_available(client: AsyncClient) -> None:
    admin_token = await create_admin_token(client)

    payload = {
        "instagram_url": "https://instagram.com/lunart",
        "shopee_url": "https://shopee.com.br/lunart",
        "whatsapp_url": "https://wa.me/5511999999999",
    }
    update_response = await client.put(
        "/admin/links",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload,
    )
    assert update_response.status_code == 200

    public_response = await client.get("/store/links")

    assert public_response.status_code == 200
    assert public_response.json() == payload


@pytest.mark.asyncio
async def test_paid_order_can_be_marked_shipped_and_notifies_support_chat(
    client: AsyncClient,
) -> None:
    admin_token = await create_admin_token(client)
    admin_header = {"Authorization": f"Bearer {admin_token}"}

    product_response = await client.post(
        "/admin/products",
        headers=admin_header,
        json={
            "name": "Produto de Teste",
            "description": "Peça artesanal",
            "price": "40.00",
            "stock": 3,
            "image_url": None,
            "image_urls": None,
        },
    )
    product_id = product_response.json()["id"]

    customer_token = await register_and_login(
        client,
        "cliente",
        "22222222222",
        "cliente@example.com",
    )
    customer_header = {"Authorization": f"Bearer {customer_token}"}
    await client.post(
        "/cart/items",
        headers=customer_header,
        json={"product_id": product_id, "quantity": 1},
    )
    checkout_response = await client.post(
        "/orders/checkout",
        headers=customer_header,
        json={"shipping_method": "pickup"},
    )
    order = checkout_response.json()
    order_id = order["id"]
    support_request_id = order["support_request_id"]

    paid_response = await client.put(
        f"/admin/orders/{order_id}/status",
        headers=admin_header,
        params={"status": "paid"},
    )
    assert paid_response.status_code == 200
    assert paid_response.json()["status"] == "paid"

    paid_orders = await client.get("/admin/orders", headers=admin_header)
    assert paid_orders.status_code == 200
    assert any(
        item["id"] == order_id and item["status"] == "paid"
        for item in paid_orders.json()
    )

    shipped_response = await client.put(
        f"/admin/orders/{order_id}/status",
        headers=admin_header,
        params={"status": "shipped"},
    )
    assert shipped_response.status_code == 200
    assert shipped_response.json()["status"] == "shipped"

    shipped_orders = await client.get("/admin/orders", headers=admin_header)
    assert any(
        item["id"] == order_id and item["status"] == "shipped"
        for item in shipped_orders.json()
    )

    chat_response = await client.get(
        f"/admin/custom-requests/{support_request_id}",
        headers=admin_header,
    )
    assert chat_response.status_code == 200
    messages = chat_response.json()["messages"]
    assert any("marcado como enviado" in message["content"] for message in messages)
