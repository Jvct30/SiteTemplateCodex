from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db
from src.models.notice import Notice
from src.schemas.notice import NoticeResponse

router = APIRouter(prefix="/store", tags=["store"])

@router.get("/notice", response_model=NoticeResponse)
async def get_active_notice(db: AsyncSession = Depends(get_db)):
    stmt = select(Notice).where(Notice.is_active == True).order_by(Notice.id.desc()).limit(1)
    result = await db.execute(stmt)
    notice = result.scalars().first()
    if not notice:
        return {"id": 0, "message": "", "is_active": False}
    return notice
