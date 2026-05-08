from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)

async_session = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


class DBConnectionHandler:
    """Async context manager for database sessions.

    Automatically commits on successful exit and rolls back on exception.
    """

    def __init__(self) -> None:
        self.session: AsyncSession | None = None

    async def __aenter__(self) -> "DBConnectionHandler":
        self.session = async_session()
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object,
    ) -> None:
        if self.session:
            if exc_type is not None:
                await self.session.rollback()
            else:
                await self.session.commit()
            await self.session.close()
