import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient) -> None:
    user_payload = {
        "full_name": "Cliente Lunart",
        "username": "cliente",
        "email": "cliente@example.com",
        "password": "secret123",
        "cpf": "12345678901",
        "birth_date": "2000-01-01",
    }

    register_response = await client.post("/auth/register", json=user_payload)
    assert register_response.status_code == 201
    assert register_response.json()["username"] == "cliente"
    assert "password" not in register_response.json()

    login_response = await client.post(
        "/auth/login",
        json={"username": "cliente", "password": "secret123"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["token_type"] == "bearer"
    assert login_response.json()["access_token"]
