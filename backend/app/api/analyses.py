"""
AI分析结果API
包括：分析列表、详情、重新分析
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import Analysis, Video, VideoAsset, AIPrompt
from app.schemas.analysis import (
    AnalysisRead,
    AnalysisCreate,
    AnalysisUpdate,
)
from app.tasks.ai_tasks import transcribe_audio_task, analyze_keyframes_task, analyze_structure_task

router = APIRouter()


# ==================== 分析结果查询 ====================

@router.get('/videos/{video_id}', response_model=AnalysisRead)
def get_analysis(
    video_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """获取视频的分析结果"""
    analysis = db.query(Analysis).filter(Analysis.video_id == video_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail='Analysis not found')
    return analysis


@router.get('/', response_model=List[AnalysisRead])
def list_analyses(
    video_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """获取分析结果列表"""
    query = db.query(Analysis)
    if video_id:
        query = query.filter(Analysis.video_id == video_id)
    
    analyses = query.order_by(Analysis.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return analyses


# ==================== 触发分析任务 ====================

@router.post('/videos/{video_id}/transcribe')
def trigger_transcription(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """触发音频转写任务"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
    if not asset or not asset.audio_url:
        raise HTTPException(status_code=400, detail='No audio asset available')
    
    # 异步执行转写任务
    background_tasks.add_task(transcribe_audio_task, video_id)
    
    return {'status': 'queued', 'video_id': video_id, 'task': 'transcribe_audio'}


@router.post('/videos/{video_id}/analyze-keyframes')
def trigger_keyframe_analysis(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """触发关键帧视觉分析任务"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
    if not asset or not asset.keyframe_urls:
        raise HTTPException(status_code=400, detail='No keyframe assets available')
    
    # 异步执行关键帧分析任务
    background_tasks.add_task(analyze_keyframes_task, video_id)
    
    return {'status': 'queued', 'video_id': video_id, 'task': 'analyze_keyframes'}


@router.post('/videos/{video_id}/analyze-structure')
def trigger_structure_analysis(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """触发爆款结构分析任务"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
    if not asset or not asset.transcript_text:
        raise HTTPException(status_code=400, detail='No transcript available. Please transcribe audio first.')
    
    # 异步执行结构分析任务
    background_tasks.add_task(analyze_structure_task, video_id)
    
    return {'status': 'queued', 'video_id': video_id, 'task': 'analyze_structure'}


@router.post('/videos/{video_id}/full-analysis')
def trigger_full_analysis(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """触发完整分析流程（转写+关键帧+结构）"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
    if not asset:
        raise HTTPException(status_code=400, detail='No video assets available')
    
    # 按顺序执行分析任务
    if asset.audio_url:
        background_tasks.add_task(transcribe_audio_task, video_id)
    
    if asset.keyframe_urls:
        background_tasks.add_task(analyze_keyframes_task, video_id)
    
    # 结构分析需要等转写完成，这里先标记
    return {
        'status': 'queued',
        'video_id': video_id,
        'tasks': ['transcribe_audio', 'analyze_keyframes', 'analyze_structure']
    }
