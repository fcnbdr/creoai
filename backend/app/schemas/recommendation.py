from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class RecommendationBase(BaseModel):
    category_id: Optional[int] = None
    product_id: Optional[int] = None
    source_video_id: Optional[int] = None
    title: str
    recommend_reason: Optional[str] = None
    score: Optional[int] = None
    difficulty: Optional[int] = None
    product_name: Optional[str] = None

    class Config:
        orm_mode = True


class RecommendationCreateRequest(BaseModel):
    category_id: Optional[int] = None
    product_id: Optional[int] = None
    source_video_id: Optional[int] = None
    count: int = 5


class RecommendationRead(RecommendationBase):
    id: int
    created_at: datetime
    updated_at: datetime


class RecommendationExportResponse(BaseModel):
    content: str
