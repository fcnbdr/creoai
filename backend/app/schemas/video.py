from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class VideoAssetRead(BaseModel):
    id: int
    audio_url: Optional[str]
    keyframe_urls: Optional[List[str]]
    transcript_text: Optional[str]

    class Config:
        orm_mode = True


class AnalysisRead(BaseModel):
    id: int
    hook_analysis: Optional[Dict[str, Any]]
    script_structure: Optional[Dict[str, Any]]
    spoken_copy: Optional[str]
    camera_analysis: Optional[Dict[str, Any]]
    viral_reason: Optional[str]
    replication_score: Optional[int]

    class Config:
        orm_mode = True


class VideoBase(BaseModel):
    platform: Optional[str] = None
    category_id: Optional[int] = None
    source_url: Optional[str] = None
    file_path: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    cover_url: Optional[str] = None
    duration: Optional[int] = None
    metrics: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

    class Config:
        orm_mode = True


class VideoCreateResponse(BaseModel):
    id: int


class VideoImportRequest(BaseModel):
    source_url: str
    title: Optional[str] = None
    author: Optional[str] = None
    platform: Optional[str] = None
    category_id: Optional[int] = None
    cover_url: Optional[str] = None
    duration: Optional[int] = None


class VideoListResponse(VideoBase):
    id: int
    created_at: datetime
    updated_at: datetime


class VideoDetailResponse(VideoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    asset: Optional[VideoAssetRead]
    analyses: Optional[List[AnalysisRead]]


class VideoAnalyzeResponse(BaseModel):
    id: int
    hook_analysis: Optional[Dict[str, Any]]
    script_structure: Optional[Dict[str, Any]]
    spoken_copy: Optional[str]
    camera_analysis: Optional[Dict[str, Any]]
    viral_reason: Optional[str]
    replication_score: Optional[int]

    class Config:
        orm_mode = True


class VideoReplicateRequest(BaseModel):
    product_id: Optional[int] = None
    duration: int = 15


class VideoReplicateResponse(BaseModel):
    id: int
    script_15s: Optional[Dict[str, Any]]
    script_30s: Optional[Dict[str, Any]]
    shot_list: Optional[Dict[str, Any]]
    spoken_copy: Optional[str]
    shooting_notes: Optional[str]

    class Config:
        orm_mode = True
