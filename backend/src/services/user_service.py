from src.core.exceptions import ConflictException, NotFoundException
from src.core.security import hash_password
from src.models.user import User
from src.repositories.interfaces.i_cart_repo import ICartRepository
from src.repositories.interfaces.i_user_repo import IUserRepository
from src.schemas.user import UserCreate, UserUpdate


class UserService:
    """Service layer for User business logic."""

    def __init__(self, user_repo: IUserRepository, cart_repo: ICartRepository):
        self.user_repo = user_repo
        self.cart_repo = cart_repo

    async def create_user(self, data: UserCreate) -> User:
        if await self.user_repo.get_by_username(data.username):
            raise ConflictException("Username já está em uso")
        if await self.user_repo.get_by_cpf(data.cpf):
            raise ConflictException("CPF já cadastrado")

        hashed_password = hash_password(data.password)
        user = await self.user_repo.create(data, hashed_password)
        
        # Create an empty cart for the new user
        await self.cart_repo.create(user.id)
        
        return user

    async def get_user_by_id(self, user_id: int) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("Usuário não encontrado")
        return user

    async def update_user(self, user_id: int, data: UserUpdate) -> User:
        hashed_password = hash_password(data.password) if data.password else None
        user = await self.user_repo.update(user_id, data, hashed_password)
        if not user:
            raise NotFoundException("Usuário não encontrado")
        return user

    async def deactivate_user(self, user_id: int) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("Usuário não encontrado")
        if user.role == "admin":
            raise ConflictException("Não é possível desativar a própria conta de administrador")
            
        user = await self.user_repo.deactivate(user_id)
        return user  # type: ignore
