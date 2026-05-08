import asyncio
from sqlalchemy import update
from src.models.product import Product
from src.models.cart import CartItem
from src.models.order import OrderItem

async def rename_products():
    async with async_session() as session:
        # Pega todos os produtos
        result = await session.execute(Product.__table__.select())
        products = result.all()
        for idx, prod in enumerate(products):
            # Update nome
            stmt = update(Product).where(Product.id == prod.id).values(name=f"Template {idx+1}", image_url=None)
            await session.execute(stmt)
        await session.commit()
        print("Produtos atualizados para Template1, Template2, etc e imagens removidas para testar o fallback.")

if __name__ == "__main__":
    asyncio.run(rename_products())
