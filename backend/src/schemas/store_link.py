from pydantic import BaseModel


class StoreLinksResponse(BaseModel):
    instagram_url: str = ""
    shopee_url: str = ""
    whatsapp_url: str = ""


class StoreLinksUpdate(StoreLinksResponse):
    pass
