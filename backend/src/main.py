import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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
    user_router,
)

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lunart")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # In a real app we rely on Alembic for migrations, 
    # but we can also ensure tables are created here if desired.
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
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
app.include_router(coupon_router.router)
app.include_router(order_router.router)
app.include_router(message_router.router)
app.include_router(custom_request_router.router)
app.include_router(admin_router.router)

@app.get("/", tags=["health"])
async def root():
    return {"message": "Bem-vindo à API Lunart 🌙✨"}
