"""
视频处理相关Celery任务
"""
import os
from pathlib import Path
from celery import shared_task
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Video, VideoAsset
from app.services.video_processing import process_video_file, get_video_metadata
from app.core.config import settings


@shared_task(bind=True, max_retries=3)
def process_video_task(self, video_id: int):
    """
    处理视频文件：抽音频、抽关键帧、生成缩略图
    """
    db = SessionLocal()
    try:
        # 获取视频记录
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video or not video.file_path:
            raise ValueError(f"Video {video_id} not found or has no file path")
        
        # 更新状态为processing
        video.status = 'processing'
        db.commit()
        
        # 处理视频文件
        result = process_video_file(video.file_path)
        
        # 获取视频元数据
        metadata = get_video_metadata(video.file_path)
        video.duration = int(metadata.get('duration', 0))
        
        # 创建或更新VideoAsset
        asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
        if not asset:
            asset = VideoAsset(video_id=video_id)
            db.add(asset)
        
        asset.audio_url = result['audio_url']
        asset.keyframe_urls = result['keyframe_urls']
        
        # 更新视频封面
        if result.get('thumbnail_url'):
            video.cover_url = result['thumbnail_url']
        
        # 更新状态为processed
        video.status = 'processed'
        db.commit()
        
        return {
            'status': 'success',
            'video_id': video_id,
            'asset_id': asset.id,
        }
    
    except Exception as e:
        db.rollback()
        video.status = 'failed'
        db.commit()
        
        # 重试
        raise self.retry(exc=e, countdown=60)
    
    finally:
        db.close()
