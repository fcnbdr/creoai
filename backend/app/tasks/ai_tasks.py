"""
AI分析相关Celery任务
"""
from celery import shared_task
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import Video, VideoAsset, Analysis
from app.services.ai_gateway import AIGateway


@shared_task(bind=True, max_retries=3)
def transcribe_audio_task(self, video_id: int):
    """
    音频转写任务
    """
    db = SessionLocal()
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise ValueError(f"Video {video_id} not found")
        
        asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
        if not asset or not asset.audio_url:
            raise ValueError(f"No audio asset for video {video_id}")
        
        # 调用AI网关进行音频转写
        audio_url = f"{settings.frontend_url}{asset.audio_url}" if asset.audio_url.startswith('/') else asset.audio_url
        gateway = AIGateway(db)
        transcript = gateway.transcribe_audio(audio_url)
        
        # 保存转写结果
        asset.transcript_text = transcript
        db.commit()
        
        return {'status': 'success', 'video_id': video_id, 'transcript_length': len(transcript)}
    
    except Exception as e:
        db.rollback()
        raise self.retry(exc=e, countdown=60)
    
    finally:
        db.close()


@shared_task(bind=True, max_retries=3)
def analyze_keyframes_task(self, video_id: int):
    """
    关键帧视觉分析任务
    """
    db = SessionLocal()
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise ValueError(f"Video {video_id} not found")
        
        asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
        if not asset or not asset.keyframe_urls:
            raise ValueError(f"No keyframe assets for video {video_id}")
        
        # 构建完整的图片URL
        image_urls = []
        for url in asset.keyframe_urls:
            full_url = f"{settings.frontend_url}{url}" if url.startswith('/') else url
            image_urls.append(full_url)
        
        # 调用AI网关分析关键帧
        prompt = "分析这些视频关键帧的内容，包括场景、人物、动作、产品展示等"
        gateway = AIGateway(db)
        analysis_result = gateway.analyze_images('keyframe_analysis', image_urls, prompt)
        
        # 保存分析结果（这里先保存到Analysis表，后续可以细化）
        analysis = db.query(Analysis).filter(Analysis.video_id == video_id).first()
        if not analysis:
            analysis = Analysis(video_id=video_id)
            db.add(analysis)
        
        analysis.camera_analysis = {'keyframe_analysis': analysis_result}
        db.commit()
        
        return {'status': 'success', 'video_id': video_id}
    
    except Exception as e:
        db.rollback()
        raise self.retry(exc=e, countdown=60)
    
    finally:
        db.close()


@shared_task(bind=True, max_retries=3)
def analyze_structure_task(self, video_id: int):
    """
    爆款结构分析任务
    """
    db = SessionLocal()
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise ValueError(f"Video {video_id} not found")
        
        asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
        if not asset or not asset.transcript_text:
            raise ValueError(f"No transcript for video {video_id}")
        
        # 调用AI网关生成JSON结构分析
        prompt = f"""
        分析以下视频口播文案的爆款结构：
        
        文案内容：
        {asset.transcript_text}
        
        请输出JSON格式，包含：
        - hook_analysis: 钩子画面分析（前3秒如何吸引注意力）
        - script_structure: 脚本结构拆解（开头、中间、结尾）
        - viral_reason: 爆款原因分析
        - replication_score: 复刻难度评分（1-10）
        """
        
        # TODO: 需要实现generate_json方法并定义schema
        gateway = AIGateway(db)
        structure_result = gateway.generate_text('structure_analysis', prompt)
        
        # 保存分析结果
        analysis = db.query(Analysis).filter(Analysis.video_id == video_id).first()
        if not analysis:
            analysis = Analysis(video_id=video_id)
            db.add(analysis)
        
        analysis.script_structure = {'raw_analysis': structure_result}
        db.commit()
        
        return {'status': 'success', 'video_id': video_id}
    
    except Exception as e:
        db.rollback()
        raise self.retry(exc=e, countdown=60)
    
    finally:
        db.close()
