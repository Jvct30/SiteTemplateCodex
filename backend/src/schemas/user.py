from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic_br import CPFDigits


class UserCreate(BaseModel):
    """Schema for user registration."""

    full_name: str = Field(min_length=3, max_length=255)
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6)
    cpf: CPFDigits
    birth_date: date
    address_street: str = Field(max_length=255)
    address_number: str = Field(max_length=20)
    address_complement: str | None = None
    address_neighborhood: str = Field(max_length=100)
    address_city: str = Field(max_length=100)
    address_state: str = Field(max_length=2, min_length=2)
    address_zip: str = Field(max_length=9)


class UserUpdate(BaseModel):
    """Schema for updating user profile (all fields optional)."""

    full_name: str | None = Field(default=None, min_length=3, max_length=255)
    password: str | None = Field(default=None, min_length=6)
    address_street: str | None = Field(default=None, max_length=255)
    address_number: str | None = Field(default=None, max_length=20)
    address_complement: str | None = None
    address_neighborhood: str | None = Field(default=None, max_length=100)
    address_city: str | None = Field(default=None, max_length=100)
    address_state: str | None = Field(default=None, max_length=2, min_length=2)
    address_zip: str | None = Field(default=None, max_length=9)


class UserResponse(BaseModel):
    """Schema for returning user data (excludes password)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    cpf: str
    birth_date: date
    address_street: str
    address_number: str
    address_complement: str | None
    address_neighborhood: str
    address_city: str
    address_state: str
    address_zip: str
    role: str
    is_active: bool
    created_at: datetime
