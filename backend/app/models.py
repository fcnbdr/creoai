from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class User(Base, TimestampMixin):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)  # 手机号字段
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default='admin')

    iclip_quota = relationship('IClipTokenQuota', back_populates='user')

class Category(Base, TimestampMixin):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False)
    keywords = Column(JSON, nullable=True)
    daily_limit = Column(Integer, nullable=True, default=0)

    products = relationship('ProductProfile', back_populates='category')
    videos = relationship('Video', back_populates='category')
    topic_recommendations = relationship('TopicRecommendation', back_populates='category')

class ProductProfile(Base, TimestampMixin):
    __tablename__ = 'product_profiles'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    target_audience = Column(String(255), nullable=True)
    selling_points = Column(JSON, nullable=True)
    pain_points = Column(JSON, nullable=True)
    usage_scenes = Column(JSON, nullable=True)
    forbidden_claims = Column(JSON, nullable=True)
    tone_style = Column(String(128), nullable=True)
    image_url = Column(String(1024), nullable=True)

    category = relationship('Category', back_populates='products')
    replications = relationship('Replication', back_populates='product')
    ecpro_jobs = relationship('ECProContentJob', back_populates='product')
    iclip_jobs = relationship('IClipVideoJob', back_populates='product')
    topic_recommendations = relationship('TopicRecommendation', back_populates='product')

class Video(Base, TimestampMixin):
    __tablename__ = 'videos'

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(64), nullable=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    source_url = Column(String(1024), nullable=True)
    file_path = Column(String(1024), nullable=True)
    title = Column(String(512), nullable=True)
    author = Column(String(255), nullable=True)
    cover_url = Column(String(1024), nullable=True)
    duration = Column(Integer, nullable=True)
    metrics = Column(JSON, nullable=True)
    status = Column(String(64), nullable=False, default='pending')

    category = relationship('Category', back_populates='videos')
    asset = relationship('VideoAsset', back_populates='video', uselist=False)
    analyses = relationship('Analysis', back_populates='video')
    replications = relationship('Replication', back_populates='video')
    topic_recommendations = relationship('TopicRecommendation', back_populates='source_video')

class VideoAsset(Base, TimestampMixin):
    __tablename__ = 'video_assets'

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey('videos.id'), nullable=False)
    audio_url = Column(String(1024), nullable=True)
    keyframe_urls = Column(JSON, nullable=True)
    transcript_text = Column(Text, nullable=True)

    video = relationship('Video', back_populates='asset')

class Analysis(Base, TimestampMixin):
    __tablename__ = 'analyses'

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey('videos.id'), nullable=False)
    hook_analysis = Column(JSON, nullable=True)
    script_structure = Column(JSON, nullable=True)
    spoken_copy = Column(Text, nullable=True)
    camera_analysis = Column(JSON, nullable=True)
    viral_reason = Column(Text, nullable=True)
    replication_score = Column(Integer, nullable=True)

    video = relationship('Video', back_populates='analyses')

class Replication(Base, TimestampMixin):
    __tablename__ = 'replications'

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey('videos.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('product_profiles.id'), nullable=True)
    script_15s = Column(JSON, nullable=True)
    script_30s = Column(JSON, nullable=True)
    shot_list = Column(JSON, nullable=True)
    spoken_copy = Column(Text, nullable=True)
    shooting_notes = Column(Text, nullable=True)

    video = relationship('Video', back_populates='replications')
    product = relationship('ProductProfile', back_populates='replications')
    iclip_jobs = relationship('IClipVideoJob', back_populates='replication')

class TopicRecommendation(Base, TimestampMixin):
    __tablename__ = 'topic_recommendations'

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    product_id = Column(Integer, ForeignKey('product_profiles.id'), nullable=True)
    source_video_id = Column(Integer, ForeignKey('videos.id'), nullable=True)
    title = Column(String(512), nullable=False)
    recommend_reason = Column(Text, nullable=True)
    score = Column(JSON, nullable=True)
    difficulty = Column(Integer, nullable=True)

    category = relationship('Category', back_populates='topic_recommendations')
    product = relationship('ProductProfile', back_populates='topic_recommendations')
    source_video = relationship('Video', back_populates='topic_recommendations')

class AIProvider(Base, TimestampMixin):
    __tablename__ = 'ai_providers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False, unique=True)
    base_url = Column(String(1024), nullable=True)
    api_key_encrypted = Column(String(1024), nullable=True)
    supports_text = Column(Boolean, nullable=False, default=False)
    supports_vision = Column(Boolean, nullable=False, default=False)
    supports_audio = Column(Boolean, nullable=False, default=False)
    supports_image_to_video = Column(Boolean, nullable=False, default=False)
    supports_detail_page = Column(Boolean, nullable=False, default=False)
    priority = Column(Integer, nullable=False, default=10)

    ai_calls = relationship('AICall', back_populates='provider')

class AICall(Base, TimestampMixin):
    __tablename__ = 'ai_calls'

    id = Column(Integer, primary_key=True, index=True)
    task_type = Column(String(128), nullable=False)
    provider_id = Column(Integer, ForeignKey('ai_providers.id'), nullable=True)
    model = Column(String(128), nullable=True)
    tokens = Column(Integer, nullable=True)
    cost_estimate = Column(String(64), nullable=True)
    status = Column(String(64), nullable=False, default='pending')
    error_message = Column(Text, nullable=True)
    latency_ms = Column(Integer, nullable=True)

    provider = relationship('AIProvider', back_populates='ai_calls')

class IClipTokenQuota(Base, TimestampMixin):
    __tablename__ = 'iclip_token_quota'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    total_quota = Column(Integer, nullable=False, default=0)
    used_quota = Column(Integer, nullable=False, default=0)
    plan_type = Column(String(64), nullable=True)
    expire_date = Column(DateTime(timezone=True), nullable=True)

    user = relationship('User', back_populates='iclip_quota')

class ECProContentJob(Base, TimestampMixin):
    __tablename__ = 'ecpro_content_jobs'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('product_profiles.id'), nullable=False)
    job_type = Column(String(64), nullable=False)
    platform_targets = Column(JSON, nullable=True)
    status = Column(String(64), nullable=False, default='pending')
    content_urls = Column(JSON, nullable=True)

    product = relationship('ProductProfile', back_populates='ecpro_jobs')

class IClipVideoJob(Base, TimestampMixin):
    __tablename__ = 'iclip_video_jobs'

    id = Column(Integer, primary_key=True, index=True)
    script_id = Column(Integer, ForeignKey('replications.id'), nullable=True)
    product_id = Column(Integer, ForeignKey('product_profiles.id'), nullable=True)
    video_type = Column(String(64), nullable=True)
    assets = Column(JSON, nullable=True)
    status = Column(String(64), nullable=False, default='pending')
    video_url = Column(String(1024), nullable=True)
    token_cost = Column(Integer, nullable=True)

    replication = relationship('Replication', back_populates='iclip_jobs')
    product = relationship('ProductProfile', back_populates='iclip_jobs')

class ContentDistribution(Base, TimestampMixin):
    __tablename__ = 'content_distributions'

    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(64), nullable=False)
    content_id = Column(Integer, nullable=False)
    platform = Column(String(64), nullable=False)
    target_shop_id = Column(String(128), nullable=True)
    publish_status = Column(String(64), nullable=False, default='pending')
    publish_result = Column(JSON, nullable=True)

class PlatformCredential(Base, TimestampMixin):
    __tablename__ = 'platform_credentials'

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(64), nullable=False)
    app_key_encrypted = Column(String(1024), nullable=True)
    app_secret_encrypted = Column(String(1024), nullable=True)
    access_token_encrypted = Column(String(1024), nullable=True)
    shop_id = Column(String(128), nullable=True)

class AIModel(Base, TimestampMixin):
    """AI模型映射表"""
    __tablename__ = 'ai_models'

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey('ai_providers.id'), nullable=False)
    task_type = Column(String(64), nullable=False)  # text/json/vision/audio/embedding/image_to_video/detail_page
    model_alias = Column(String(128), nullable=False)  # 用户友好的别名
    actual_model_name = Column(String(128), nullable=False)  # 实际调用的模型名
    max_tokens = Column(Integer, nullable=True)
    enabled = Column(Boolean, nullable=False, default=True)

    provider = relationship('AIProvider', backref='models')

class AIPrompt(Base, TimestampMixin):
    """Prompt版本管理表"""
    __tablename__ = 'ai_prompts'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    version = Column(String(32), nullable=False)
    task_type = Column(String(64), nullable=False)
    system_prompt = Column(Text, nullable=True)
    user_prompt_template = Column(Text, nullable=True)
    json_schema = Column(JSON, nullable=True)
    enabled = Column(Boolean, nullable=False, default=True)

class CostLimit(Base, TimestampMixin):
    """成本上限控制表"""
    __tablename__ = 'cost_limits'

    id = Column(Integer, primary_key=True, index=True)
    scope_type = Column(String(64), nullable=False)  # global/category/user
    scope_id = Column(Integer, nullable=True)
    daily_limit = Column(Integer, nullable=True)
    monthly_limit = Column(Integer, nullable=True)
    enabled = Column(Boolean, nullable=False, default=True)

class ECProTemplate(Base, TimestampMixin):
    """ECPro详情页模板表"""
    __tablename__ = 'ecpro_templates'

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    name = Column(String(255), nullable=False)
    template_html = Column(Text, nullable=True)
    platform = Column(JSON, nullable=True)  # 支持的平台列表
    thumbnail = Column(String(1024), nullable=True)
    is_default = Column(Boolean, nullable=False, default=False)

    category = relationship('Category', backref='ecpro_templates')

class VideoTemplate(Base, TimestampMixin):
    """视频模板管理表"""
    __tablename__ = 'video_templates'

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    name = Column(String(255), nullable=False)
    template_config = Column(JSON, nullable=True)
    duration = Column(String(16), nullable=True)  # 15s/30s
    scene_type = Column(String(64), nullable=True)
    thumbnail = Column(String(1024), nullable=True)

    category = relationship('Category', backref='video_templates')

class CrawlJob(Base, TimestampMixin):
    """每日自动采集任务表"""
    __tablename__ = 'crawl_jobs'

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(64), nullable=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    run_date = Column(DateTime(timezone=True), nullable=False)
    target_count = Column(Integer, nullable=False, default=0)
    success_count = Column(Integer, nullable=False, default=0)
    failed_count = Column(Integer, nullable=False, default=0)
    status = Column(String(64), nullable=False, default='pending')
    logs = Column(Text, nullable=True)

    category = relationship('Category', backref='crawl_jobs')

class JobLog(Base, TimestampMixin):
    """任务执行日志表"""
    __tablename__ = 'job_logs'

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, nullable=True)
    task_type = Column(String(128), nullable=False)
    status = Column(String(64), nullable=False, default='pending')
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)


# ===== ECPro + Video AI 新增模型 =====

class ImageTask(Base, TimestampMixin):
    """图片处理任务（精修/扩充/换色/文字替换/扩图/视觉迁移/种草）"""
    __tablename__ = 'image_tasks'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    product_id = Column(Integer, ForeignKey('product_profiles.id'), nullable=True)
    task_type = Column(String(64), nullable=False)  # retouch/expand/color_swap/text_replace/outpainting/style_transfer/koc
    title = Column(String(255), nullable=True)
    input_images = Column(JSON, nullable=True)  # ["url1", "url2"]
    prompt = Column(Text, nullable=True)
    params = Column(JSON, nullable=True)  # {ratio, model, resolution, quality, quantity, ...}
    output_images = Column(JSON, nullable=True)  # ["url1", "url2"]
    status = Column(String(64), nullable=False, default='pending')  # pending/processing/completed/failed
    error_message = Column(Text, nullable=True)
    points_cost = Column(Integer, nullable=True, default=0)

    user = relationship('User', backref='image_tasks')
    product = relationship('ProductProfile', backref='image_tasks')


class VideoAITask(Base, TimestampMixin):
    """AI视频生成任务"""
    __tablename__ = 'video_ai_tasks'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    product_id = Column(Integer, ForeignKey('product_profiles.id'), nullable=True)
    description = Column(Text, nullable=True)  # 用户输入的视频描述
    prompt_preset = Column(JSON, nullable=True)  # AI生成的Prompt指令
    generated_url = Column(String(1024), nullable=True)
    status = Column(String(64), nullable=False, default='pending')  # pending/processing/completed/failed/safety_failed
    safety_check = Column(Boolean, nullable=True)  # 安全检查结果
    safety_message = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)  # 视频时长(秒)
    points_cost = Column(Integer, nullable=True, default=0)

    user = relationship('User', backref='video_ai_tasks')
    product = relationship('ProductProfile', backref='video_ai_tasks')


class VideoPrompt(Base, TimestampMixin):
    """AI生成的Prompt指令记录"""
    __tablename__ = 'video_prompts'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    category = Column(String(255), nullable=True)  # 商品类别
    selling_points = Column(Text, nullable=True)  # 商品卖点
    scenario = Column(Text, nullable=True)  # 使用场景
    prompts = Column(JSON, nullable=True)  # 生成的21条Prompt
    style_count = Column(Integer, nullable=True, default=6)  # 风格数量

    user = relationship('User', backref='video_prompts')


class UserPoints(Base, TimestampMixin):
    """用户积分"""
    __tablename__ = 'user_points'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    balance = Column(Integer, nullable=False, default=1000)  # 当前余额
    total_earned = Column(Integer, nullable=False, default=1000)
    total_spent = Column(Integer, nullable=False, default=0)

    user = relationship('User', backref='points')


class PointTransaction(Base, TimestampMixin):
    """积分流水"""
    __tablename__ = 'point_transactions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    amount = Column(Integer, nullable=False)  # 正数为收入,负数为支出
    trans_type = Column(String(64), nullable=False)  # earn/spend/recharge/invite
    description = Column(String(255), nullable=True)
    related_task_id = Column(Integer, nullable=True)
    related_task_type = Column(String(64), nullable=True)

    user = relationship('User', backref='point_transactions')


class APIToken(Base, TimestampMixin):
    """API令牌"""
    __tablename__ = 'api_tokens'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token_name = Column(String(128), nullable=False)
    token_key = Column(String(255), nullable=False, unique=True, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship('User', backref='api_tokens')


class ResourceItem(Base, TimestampMixin):
    """资源库（统一管理图片/视频）"""
    __tablename__ = 'resource_items'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    res_type = Column(String(16), nullable=False)  # image/video
    title = Column(String(255), nullable=True)
    url = Column(String(1024), nullable=False)
    thumbnail = Column(String(1024), nullable=True)
    tags = Column(JSON, nullable=True)
    source_task_id = Column(Integer, nullable=True)
    source_task_type = Column(String(64), nullable=True)
    file_size = Column(Integer, nullable=True)

    user = relationship('User', backref='resource_items')
