"""
Celery配置和任务定义
"""
import os
from celery import Celery
from app.core.config import settings

# 创建Celery应用
celery_app = Celery(
    'tasks',
    broker=settings.redis_url,
    backend=settings.redis_url,
)

# 配置Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1小时超时
    worker_prefetch_multiplier=1,
)

# 自动发现任务
celery_app.autodiscover_tasks(['app.tasks'])


@celery_app.task(bind=True)
def debug_task(self):
    """调试任务"""
    return f"Task ID: {self.request.id}"
