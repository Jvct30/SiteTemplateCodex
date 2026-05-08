from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.custom_request import CustomRequest, CustomRequestMessage
from src.repositories.interfaces.i_custom_request_repo import ICustomRequestRepository


class CustomRequestRepository(ICustomRequestRepository):
    """Data access implementation for CustomRequests and Messages."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user_id: int, subject: str) -> CustomRequest:
        req = CustomRequest(user_id=user_id, subject=subject, status="open")
        self.session.add(req)
        await self.session.flush()
        return req

    async def get_by_id(self, request_id: int) -> CustomRequest | None:
        stmt = (
            select(CustomRequest)
            .where(CustomRequest.id == request_id)
            .options(joinedload(CustomRequest.messages))
        )
        result = await self.session.execute(stmt)
        return result.unique().scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> list[CustomRequest]:
        stmt = (
            select(CustomRequest)
            .where(CustomRequest.user_id == user_id)
            .order_by(CustomRequest.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_all(self) -> list[CustomRequest]:
        stmt = select(CustomRequest).order_by(CustomRequest.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_message(
        self, request_id: int, sender_role: str, content: str
    ) -> CustomRequestMessage:
        msg = CustomRequestMessage(
            request_id=request_id, sender_role=sender_role, content=content
        )
        self.session.add(msg)
        await self.session.flush()
        return msg

    async def update_status(self, request_id: int, status: str) -> CustomRequest | None:
        req = await self.get_by_id(request_id)
        if not req:
            return None

        req.status = status
        await self.session.flush()
        return req
