"""
AI分析结果Schema定义
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class AnalysisBase(BaseModel):
    """分析基础Schema"""
    hook_analysis: Optional[Dict[str, Any]] = None
    script_structure: Optional[Dict[str, Any]] = None
    spoken_copy: Optional[str] = None
    camera_analysis: Optional[Dict[str, Any]] = None
    viral_reason: Optional[str] = None
    replication_score: Optional[int] = None


class AnalysisCreate(AnalysisBase):
    """创建分析请求"""
    video_id: int


class AnalysisUpdate(AnalysisBase):
    """更新分析请求"""
    pass


class AnalysisRead(AnalysisBase):
    """分析响应"""
    id: int
    video_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
