import shutil
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user, get_db
from src.models.user import User
from src.repositories.order_repo import OrderRepository
from src.repositories.review_repo import ReviewRepository
from src.schemas.review import ReviewCreate, ReviewResponse
from src.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["reviews"])


def get_review_service(db: AsyncSession = Depends(get_db)) -> ReviewService:
    return ReviewService(ReviewRepository(db), OrderRepository(db))


@router.get("", response_model=list[ReviewResponse])
async def list_reviews(service: ReviewService = Depends(get_review_service)):
    return await service.list_public_reviews()


@router.post("/orders/{order_id}", response_model=ReviewResponse, status_code=201)
async def create_review(
    order_id: int,
    rating: int = Form(...),
    comment: str = Form(...),
    file: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    service: ReviewService = Depends(get_review_service),
):
    image_url = None
    if file and file.filename:
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"uploads/{filename}"
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_url = f"http://localhost:8000/static/{filename}"

    return await service.create_review(
        order_id,
        current_user.id,
        ReviewCreate(rating=rating, comment=comment, image_url=image_url),
    )
