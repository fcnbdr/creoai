from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # 数据库配置
    database_url: str
    redis_url: str
    
    # JWT认证配置
    secret_key: str
    access_token_expire_minutes: int = 1440  # 24小时
    jwt_algorithm: str = "HS256"
    
    # AI网关配置
    aig_gateway_default_provider: str = 'deepseek'
    
    # 前端配置
    frontend_url: str = 'http://localhost:3000'
    
    # 管理员初始账号
    admin_email: str = 'admin@example.com'
    admin_password: str = 'admin123'
    
    # 对象存储配置（阿里云OSS）
    oss_access_key_id: Optional[str] = None
    oss_access_key_secret: Optional[str] = None
    oss_bucket: Optional[str] = None
    oss_endpoint: Optional[str] = None
    oss_region: Optional[str] = "cn-hangzhou"
    
    # DeepSeek API配置
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_api_key: Optional[str] = None
    deepseek_model: str = "deepseek-chat"
    
    # ECPro API配置
    ecpro_api_base_url: str = "https://aigc-next.ecpro.com/api"
    ecpro_api_key: Optional[str] = None
    
    # iClip MCP API配置
    iclip_api_base_url: str = "https://aigc-next.iclip.cn/api"
    iclip_api_key: Optional[str] = None
    
    # Stable Diffusion API配置（自研模式）
    sd_api_url: str = "http://localhost:7860"
    sd_api_key: Optional[str] = None
    
    # SkyReels-V3 API配置（自研模式）
    skyreels_api_url: str = "http://localhost:8080"
    
    # TapNow AI API配置
    tapnow_api_key: Optional[str] = None
    
    # 系统配置
    max_video_size_mb: int = 200
    daily_video_limit: int = 10
    daily_token_limit: int = 1000000
    daily_iclip_point_limit: int = 100

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'
        case_sensitive = False


settings = Settings()
