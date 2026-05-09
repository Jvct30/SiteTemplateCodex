from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AddressBase(BaseModel):
    label: str = Field(default="Principal", min_length=1, max_length=80)
    street: str = Field(min_length=1, max_length=255)
    number: str = Field(min_length=1, max_length=20)
    complement: str | None = Field(default=None, max_length=100)
    neighborhood: str = Field(min_length=1, max_length=100)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=2, max_length=2)
    zip_code: str = Field(min_length=8, max_length=9)
    is_default: bool = False

    @field_validator("zip_code")
    @classmethod
    def normalize_zip(cls, value: str) -> str:
        digits = "".join(char for char in value if char.isdigit())
        if len(digits) != 8:
            raise ValueError("CEP deve ter 8 números")
        return digits

    @field_validator("state")
    @classmethod
    def normalize_state(cls, value: str) -> str:
        return value.upper()


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_address: str
    created_at: datetime
