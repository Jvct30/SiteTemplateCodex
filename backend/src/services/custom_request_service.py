from src.core.exceptions import NotFoundException
from src.models.custom_request import CustomRequest, CustomRequestMessage
from src.repositories.interfaces.i_custom_request_repo import ICustomRequestRepository
from src.schemas.custom_request import CustomRequestCreate, CustomRequestMessageCreate


class CustomRequestService:
    """Service layer for Custom Request business logic."""

    def __init__(self, custom_request_repo: ICustomRequestRepository):
        self.request_repo = custom_request_repo

    async def get_request(self, request_id: int, user_id: int | None = None, is_admin: bool = False) -> CustomRequest:
        req = await self.request_repo.get_by_id(request_id)
        if not req:
            raise NotFoundException("Pedido não encontrado")
            
        if not is_admin and req.user_id != user_id:
            raise NotFoundException("Pedido não encontrado")
            
        return req

    async def list_user_requests(self, user_id: int) -> list[CustomRequest]:
        return await self.request_repo.list_by_user(user_id)

    async def list_all_requests(self) -> list[CustomRequest]:
        return await self.request_repo.list_all()

    async def create_request(self, user_id: int, data: CustomRequestCreate) -> CustomRequest:
        req = await self.request_repo.create(user_id, data.subject)
        # Automatically add the first message from the user
        await self.request_repo.add_message(req.id, sender_role="customer", content=data.message)
        # Reload to include the message
        return await self.get_request(req.id, is_admin=True)

    async def add_message(
        self, request_id: int, user_id: int, sender_role: str, data: CustomRequestMessageCreate
    ) -> CustomRequestMessage:
        is_admin = sender_role == "admin"
        req = await self.get_request(request_id, user_id, is_admin)
        
        # If admin replies and it was open, maybe change status to answered (Optional business logic)
        if is_admin and req.status == "open":
            await self.request_repo.update_status(request_id, "answered")
            
        # If customer replies and it was answered, change back to open
        if not is_admin and req.status == "answered":
            await self.request_repo.update_status(request_id, "open")

        return await self.request_repo.add_message(request_id, sender_role, data.content)

    async def update_status(self, request_id: int, status: str) -> CustomRequest:
        req = await self.request_repo.update_status(request_id, status)
        if not req:
            raise NotFoundException("Pedido não encontrado")
        return req
