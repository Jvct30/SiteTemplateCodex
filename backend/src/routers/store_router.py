from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db
from src.models.notice import Notice
from src.models.store_link import StoreLink
from src.schemas.notice import NoticeResponse
from src.schemas.store_link import StoreLinksResponse

router = APIRouter(prefix="/store", tags=["store"])


@router.get("/notice", response_model=NoticeResponse)
async def get_active_notice(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Notice)
        .where(Notice.is_active.is_(True))
        .order_by(Notice.id.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    notice = result.scalars().first()
    if not notice:
        return {"id": 0, "message": "", "is_active": False}
    return notice


@router.get("/links", response_model=StoreLinksResponse)
async def get_store_links(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StoreLink))
    links = {link.platform: link.url for link in result.scalars().all()}
    return StoreLinksResponse(
        instagram_url=links.get("instagram", ""),
        shopee_url=links.get("shopee", ""),
        whatsapp_url=links.get("whatsapp", ""),
    )
