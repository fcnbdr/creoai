"""
AI相关Pydantic Schema定义
"""
from typing import List, Optional, Any
from datetime import datetime

from pydantic import BaseModel, Field


# ==================== AI供应商Schema ====================

class AIProviderBase(BaseModel):
    name: str = Field(..., description="供应商名称")
    base_url: Optional[str] = Field(None, description="API基础URL")
    api_key_encrypted: Optional[str] = Field(None, description="加密的API密钥")
    supports_text: bool = Field(False, description="支持文本生成")
    supports_vision: bool = Field(False, description="支持视觉分析")
    supports_audio: bool = Field(False, description="支持音频处理")
    supports_image_to_video: bool = Field(False, description="支持图片转视频")
    supports_detail_page: bool = Field(False, description="支持详情页生成")
    priority: int = Field(10, description="优先级（数字越小优先级越高）")


class AIProviderCreate(AIProviderBase):
    """创建AI供应商"""
    pass


class AIProviderUpdate(BaseModel):
    """更新AI供应商"""
    name: Optional[str] = None
    base_url: Optional[str] = None
    api_key_encrypted: Optional[str] = None
    supports_text: Optional[bool] = None
    supports_vision: Optional[bool] = None
    supports_audio: Optional[bool] = None
    supports_image_to_video: Optional[bool] = None
    supports_detail_page: Optional[bool] = None
    priority: Optional[int] = None


class AIProviderRead(AIProviderBase):
    """AI供应商响应"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# ==================== 模型映射Schema ====================

class AIModelBase(BaseModel):
    provider_id: int = Field(..., description="供应商ID")
    task_type: str = Field(..., description="任务类型")
    model_alias: str = Field(..., description="模型别名")
    actual_model_name: str = Field(..., description="实际模型名称")
    max_tokens: Optional[int] = Field(None, description="最大Token数")
    enabled: bool = Field(True, description="是否启用")


class AIModelCreate(AIModelBase):
    """创建模型映射"""
    pass


class AIModelUpdate(BaseModel):
    """更新模型映射"""
    task_type: Optional[str] = None
    model_alias: Optional[str] = None
    actual_model_name: Optional[str] = None
    max_tokens: Optional[int] = None
    enabled: Optional[bool] = None


class AIModelRead(AIModelBase):
    """模型映射响应"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# ==================== Prompt管理Schema ====================

class AIPromptBase(BaseModel):
    name: str = Field(..., description="Prompt名称")
    version: str = Field(..., description="版本号")
    task_type: str = Field(..., description="任务类型")
    system_prompt: Optional[str] = Field(None, description="系统提示词")
    user_prompt_template: Optional[str] = Field(None, description="用户提示词模板")
    json_schema: Optional[dict] = Field(None, description="JSON Schema")
    enabled: bool = Field(True, description="是否启用")


class AIPromptCreate(AIPromptBase):
    """创建Prompt"""
    pass


class AIPromptUpdate(BaseModel):
    """更新Prompt"""
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    json_schema: Optional[dict] = None
    enabled: Optional[bool] = None


class AIPromptRead(AIPromptBase):
    """Prompt响应"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# ==================== 测试请求Schema ====================

class TextTestRequest(BaseModel):
    """文本生成测试请求"""
    prompt: str = Field(..., example='请分析当前视频脚本', description="提示词")
    model_alias: Optional[str] = Field(None, description="模型别名")
    task_type: Optional[str] = Field("test", description="任务类型")


class JSONTestRequest(BaseModel):
    """JSON输出测试请求"""
    prompt: str = Field(..., example='请生成电商图文详情页JSON结构', description="提示词")
    json_schema: dict = Field(..., example={'title': 'string', 'body': 'string'}, description="JSON Schema")
    model_alias: Optional[str] = Field(None, description="模型别名")
    task_type: Optional[str] = Field("test", description="任务类型")


class ImageTestRequest(BaseModel):
    """图片分析测试请求"""
    image_urls: List[str] = Field(..., example=['http://localhost:8000/static/demo.jpg'], description="图片URL列表")
    prompt: str = Field(..., example='请描述图片中的商品场景', description="分析提示词")
    model_alias: Optional[str] = Field(None, description="模型别名")
    task_type: Optional[str] = Field("vision_test", description="任务类型")


class AudioTestRequest(BaseModel):
    """音频转写测试请求"""
    audio_url: str = Field(..., example='http://localhost:8000/static/demo_audio.mp3', description="音频URL")
    model_alias: Optional[str] = Field(None, description="模型别名")


# ==================== AI调用日志Schema ====================

class AICallRead(BaseModel):
    """AI调用日志响应"""
    id: int
    task_type: str
    provider_id: Optional[int]
    model: Optional[str]
    tokens: Optional[int]
    cost_estimate: Optional[str]
    status: str
    error_message: Optional[str]
    latency_ms: Optional[int]
    created_at: datetime

    class Config:
        orm_mode = True
