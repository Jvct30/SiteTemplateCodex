from pydantic import BaseModel


class NoticeCreate(BaseModel):
    message: str
    is_active: bool = True

class NoticeResponse(NoticeCreate):
    id: int

    class Config:
        from_attributes = True
