from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ProductProfileBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    target_audience: Optional[str] = None
    selling_points: Optional[List[str]] = None
    pain_points: Optional[List[str]] = None
    usage_scenes: Optional[List[str]] = None
    forbidden_claims: Optional[List[str]] = None
    tone_style: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        orm_mode = True


class ProductProfileCreate(ProductProfileBase):
    pass


class ProductProfileUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    target_audience: Optional[str] = None
    selling_points: Optional[List[str]] = None
    pain_points: Optional[List[str]] = None
    usage_scenes: Optional[List[str]] = None
    forbidden_claims: Optional[List[str]] = None
    tone_style: Optional[str] = None
    image_url: Optional[str] = None


class ProductProfileRead(ProductProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ProductProfileDetail(ProductProfileRead):
    pass
