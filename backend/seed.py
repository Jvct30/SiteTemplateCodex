import asyncio
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from src.core.security import hash_password
from src.models.cart import Cart
from src.models.coupon import Coupon
from src.models.db import async_session, engine
from src.models.message import HomepageMessage
from src.models.product import Product
from src.models.user import User


async def seed_data():
    async with async_session() as session:
        # Check if admin already exists
        stmt = select(User).where(User.username == "admin")
        result = await session.execute(stmt)
        admin = result.scalar_one_or_none()

        if not admin:
            print("Creating default admin user...")
            admin = User(
                full_name="Administrador Supremo",
                username="admin",
                password=hash_password("admin123"),
                cpf="00000000000",
                birth_date=datetime.strptime("2000-01-01", "%Y-%m-%d").date(),
                address_street="Rua das Estrelas",
                address_number="123",
                address_complement=None,
                address_neighborhood="Via Láctea",
                address_city="Cosmos",
                address_state="SP",
                address_zip="00000-000",
                role="admin",
                is_active=True,
            )
            session.add(admin)
            await session.flush()
            
            # Create an empty cart for admin
            cart = Cart(user_id=admin.id)
            session.add(cart)

            print("Creating mock products...")
            products = [
                Product(
                    name="Colar Poeira Estelar",
                    description="Colar feito à mão contendo brilhos que imitam poeira estelar.",
                    price=45.90,
                    stock=10,
                    image_url="https://res.cloudinary.com/demo/image/upload/sample.jpg",
                    is_active=True,
                ),
                Product(
                    name="Anel Constelação",
                    description="Anel de prata ajustável com zircônias formando a constelação de Órion.",
                    price=89.90,
                    stock=5,
                    image_url="https://res.cloudinary.com/demo/image/upload/sample.jpg",
                    is_active=True,
                ),
                Product(
                    name="Luminária Fases da Lua",
                    description="Luminária de mesa em MDF esculpido mostrando as fases lunares.",
                    price=120.00,
                    stock=2,
                    image_url="https://res.cloudinary.com/demo/image/upload/sample.jpg",
                    is_active=True,
                ),
                Product(
                    name="Brinco Estrela Cadente",
                    description="Brinco longo de aço cirúrgico.",
                    price=35.00,
                    stock=15,
                    image_url="https://res.cloudinary.com/demo/image/upload/sample.jpg",
                    is_active=True,
                ),
                Product(
                    name="Quadro Via Láctea",
                    description="Pintura artesanal em tela.",
                    price=250.00,
                    stock=1,
                    image_url="https://res.cloudinary.com/demo/image/upload/sample.jpg",
                    is_active=True,
                ),
            ]
            session.add_all(products)

            print("Creating mock coupons...")
            coupon = Coupon(
                code="LUNART10",
                discount_percent=10,
                max_uses=100,
                is_active=True,
                expires_at=datetime.now(UTC) + timedelta(days=30)
            )
            session.add(coupon)

            print("Creating mock homepage message...")
            msg = HomepageMessage(
                content="🌟 Bem-vindo à nova Lunart! Use o cupom LUNART10 para 10% de desconto.",
                is_active=True
            )
            session.add(msg)

            await session.commit()
            print("Database seeded successfully! Admin credentials: admin / admin123")
        else:
            print("Database already seeded. Skipping.")

async def main():
    await seed_data()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
