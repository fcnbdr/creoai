from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[datetime] = None


class UserBase(BaseModel):
    email: EmailStr
    role: Optional[str] = 'admin'

    class Config:
        orm_mode = True


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
