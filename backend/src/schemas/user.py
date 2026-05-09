from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserCreate(BaseModel):
    """Schema for user registration."""

    full_name: str = Field(min_length=3, max_length=255)
    username: str = Field(min_length=3, max_length=100)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=6)
    cpf: str = Field(min_length=11, max_length=14)
    birth_date: date

    @field_validator("cpf")
    @classmethod
    def normalize_cpf(cls, value: str) -> str:
        digits = "".join(char for char in value if char.isdigit())
        if len(digits) != 11:
            raise ValueError("CPF deve ter 11 números")
        return digits


class UserUpdate(BaseModel):
    """Schema for updating user profile (all fields optional)."""

    full_name: str | None = Field(default=None, min_length=3, max_length=255)
    password: str | None = Field(default=None, min_length=6)


class UserResponse(BaseModel):
    """Schema for returning user data (excludes password)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: str | None = None
    cpf: str
    birth_date: date
    address_street: str = ""
    address_number: str = ""
    address_complement: str | None = None
    address_neighborhood: str = ""
    address_city: str = ""
    address_state: str = ""
    address_zip: str = ""
    role: str
    is_active: bool
    created_at: datetime
