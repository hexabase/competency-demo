"""User schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Shared properties."""

    email: EmailStr
    name: str
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    """Properties to receive on user creation."""

    password: str


class UserUpdate(UserBase):
    """Properties to receive on user update."""

    password: Optional[str] = None


class UserInDBBase(UserBase):
    """Properties shared by models stored in DB."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class User(UserInDBBase):
    """Properties to return to client."""

    pass


class UserInDB(UserInDBBase):
    """Properties stored in DB."""

    hashed_password: str