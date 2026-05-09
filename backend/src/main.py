import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from src.core.config import settings
from src.core.exceptions import (
    BadRequestException,
    ConflictException,
    CredentialsException,
    ForbiddenException,
    NotFoundException,
)
from src.models.base import Base
from src.models.db import engine
from src.routers import (
    admin_router,
    auth_router,
    cart_router,
    coupon_router,
    custom_request_router,
    message_router,
    order_router,
    product_router,
    shipping_router,
    store_router,
    user_router,
)

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lunart")


async def ensure_sqlite_columns(conn) -> None:
    """Add lightweight SQLite columns that create_all cannot add to existing DBs."""
    columns = {
        "products": {
            "is_private": "BOOLEAN NOT NULL DEFAULT 0",
            "owner_user_id": "INTEGER",
            "custom_request_id": "INTEGER",
        },
        "custom_requests": {
            "quoted_product_id": "INTEGER",
            "request_type": "VARCHAR(30) NOT NULL DEFAULT 'custom_order'",
        },
        "orders": {
            "support_request_id": "INTEGER",
        },
        "order_items": {
            "variation": "VARCHAR(100)",
        },
    }

    for table_name, expected_columns in columns.items():
        existing = await conn.execute(text(f"PRAGMA table_info({table_name})"))
        existing_names = {row[1] for row in existing.fetchall()}
        for column_name, column_sql in expected_columns.items():
            if column_name not in existing_names:
                await conn.execute(
                    text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_sql}")
                )

    await conn.execute(
        text(
            """
            UPDATE custom_requests
            SET request_type = 'order_support'
            WHERE subject LIKE 'Acompanhamento do Pedido #%'
            """
        )
    )
    await conn.execute(
        text(
            """
            UPDATE orders
            SET support_request_id = (
                SELECT cr.id
                FROM custom_requests cr
                WHERE cr.subject = 'Acompanhamento do Pedido #' || orders.id
                LIMIT 1
            )
            WHERE support_request_id IS NULL
            """
        )
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables for simplicity (Notices, etc)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if settings.DATABASE_URL.startswith("sqlite"):
            await ensure_sqlite_columns(conn)
        
    logger.info("Lunart Backend Started 🚀")
    yield
    await engine.dispose()
    logger.info("Lunart Backend Shutting Down 🌙")

app = FastAPI(
    title="Lunart API",
    description="API para o e-commerce celestial de artesanatos Lunart.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files for Image Uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Nossa equipe estelar já foi notificada."},
    )

@app.exception_handler(CredentialsException)
async def credentials_exception_handler(request: Request, exc: CredentialsException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)

@app.exception_handler(ForbiddenException)
async def forbidden_exception_handler(request: Request, exc: ForbiddenException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(ConflictException)
async def conflict_exception_handler(request: Request, exc: ConflictException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(BadRequestException)
async def bad_request_exception_handler(request: Request, exc: BadRequestException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

# Include all Routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(product_router.router)
app.include_router(cart_router.router)
app.include_router(shipping_router.router)
app.include_router(store_router.router)
app.include_router(coupon_router.router)
app.include_router(order_router.router)
app.include_router(message_router.router)
app.include_router(custom_request_router.router)
app.include_router(admin_router.router)

@app.get("/", tags=["health"])
async def root():
    return {"message": "Bem-vindo à API Lunart 🌙✨"}
