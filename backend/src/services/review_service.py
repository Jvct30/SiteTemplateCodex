from src.core.exceptions import BadRequestException, ConflictException
from src.repositories.interfaces.i_order_repo import IOrderRepository
from src.repositories.review_repo import ReviewRepository
from src.schemas.review import ReviewCreate


class ReviewService:
    """Business rules for order reviews."""

    def __init__(self, review_repo: ReviewRepository, order_repo: IOrderRepository):
        self.review_repo = review_repo
        self.order_repo = order_repo

    async def list_public_reviews(self):
        return await self.review_repo.list_public()

    async def create_review(self, order_id: int, user_id: int, data: ReviewCreate):
        order = await self.order_repo.get_by_id(order_id)
        if not order or order.user_id != user_id:
            raise BadRequestException("Pedido não encontrado")
        if order.status != "delivered":
            raise BadRequestException("Confirme o recebimento antes de avaliar")
        if await self.review_repo.get_by_order(order_id):
            raise ConflictException("Este pedido já foi avaliado")

        review = await self.review_repo.create(user_id, order_id, data)
        return await self.review_repo.get_by_order(review.order_id)
