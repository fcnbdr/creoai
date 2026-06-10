"""
视频管理API
包括：上传、导入、列表、详情、处理、分析、复刻、删除、批量操作
"""
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import Video, VideoAsset, Category
from app.schemas.video import (
    VideoCreateResponse,
    VideoDetailResponse,
    VideoImportRequest,
    VideoListResponse,
    VideoAnalyzeResponse,
    VideoReplicateRequest,
    VideoReplicateResponse,
)
from app.services.video_ai import analyze_video_content, generate_replication_script
from app.services.video_processing import build_public_url, process_video_file, save_upload_file
from app.tasks.video_tasks import process_video_task

router = APIRouter()


# ==================== 视频上传与导入 ====================

@router.post('/upload', response_model=VideoCreateResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = None,
    author: Optional[str] = None,
    platform: Optional[str] = None,
    category_id: Optional[int] = None,
    cover_url: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """上传视频文件（限制200MB）"""
    # 验证文件大小
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset
    
    if file_size > 200 * 1024 * 1024:  # 200MB
        raise HTTPException(status_code=400, detail="File size exceeds 200MB limit")
    
    # 保存文件
    local_path = save_upload_file(file)
    
    # 创建视频记录
    video = Video(
        platform=platform,
        category_id=category_id,
        source_url=None,
        file_path=local_path,
        title=title or file.filename,
        author=author,
        cover_url=cover_url,
        status='uploaded',
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    
    # 异步处理视频
    background_tasks.add_task(process_video_task, video.id)
    
    return {'id': video.id}


@router.post('/import', response_model=VideoCreateResponse)
def import_video(
    payload: VideoImportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """手动导入视频链接"""
    video = Video(
        platform=payload.platform,
        category_id=payload.category_id,
        source_url=payload.source_url,
        file_path=None,
        title=payload.title,
        author=payload.author,
        cover_url=payload.cover_url,
        duration=payload.duration,
        status='imported',
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return {'id': video.id}


# ==================== 视频查询 ====================

@router.get('/', response_model=List[VideoListResponse])
def list_videos(
    platform: Optional[str] = Query(None, description="平台筛选"),
    category_id: Optional[int] = Query(None, description="品类筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    search: Optional[str] = Query(None, description="关键词搜索"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """获取视频列表，支持筛选和分页"""
    query = db.query(Video)
    
    if platform:
        query = query.filter(Video.platform == platform)
    if category_id:
        query = query.filter(Video.category_id == category_id)
    if status:
        query = query.filter(Video.status == status)
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            Video.title.ilike(search_term) | 
            Video.author.ilike(search_term)
        )
    
    videos = query.order_by(Video.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return videos


@router.get('/stats')
def video_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total = db.query(Video).count()
    processed = db.query(Video).filter(Video.status == 'processed').count()
    processing = db.query(Video).filter(Video.status == 'processing').count()
    return {
        'total': total,
        'processed': processed,
        'processing': processing,
    }


@router.get('/{video_id}', response_model=VideoDetailResponse)
def get_video_detail(
    video_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """获取视频详情"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    return video


# ==================== 视频处理与分析 ====================

@router.post('/{video_id}/process')
def process_video(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """触发视频处理（抽音频+抽关键帧）"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    if not video.file_path or not os.path.exists(video.file_path):
        raise HTTPException(status_code=400, detail='Video file not available for processing')
    
    # 更新状态为处理中
    video.status = 'processing'
    db.commit()
    
    # 异步处理
    background_tasks.add_task(process_video_task, video.id)
    
    return {'video_id': video.id, 'status': 'processing'}


@router.post('/{video_id}/analyze', response_model=VideoAnalyzeResponse)
def analyze_video(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """触发AI分析"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    asset = db.query(VideoAsset).filter(VideoAsset.video_id == video.id).first()
    if not asset:
        raise HTTPException(status_code=400, detail='Video asset not found. Please process the video first.')
    
    # TODO: 异步调用AI分析任务
    analysis = analyze_video_content(db, video)
    return analysis


@router.post('/{video_id}/replicate', response_model=VideoReplicateResponse)
def replicate_video(
    video_id: int,
    payload: VideoReplicateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """生成复刻脚本"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    replication = generate_replication_script(db, video, product_id=payload.product_id, duration=payload.duration)
    return replication


# ==================== 批量操作 ====================

@router.post('/batch/analyze')
def batch_analyze_videos(
    video_ids: List[int],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """批量分析视频"""
    results = []
    for video_id in video_ids:
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            # TODO: 异步批量分析
            results.append({'video_id': video_id, 'status': 'queued'})
        else:
            results.append({'video_id': video_id, 'status': 'not_found'})
    
    return {'results': results}


# ==================== 删除操作 ====================

@router.delete('/{video_id}', status_code=204)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """删除视频"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    # 删除关联的资源
    asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
    if asset:
        db.delete(asset)
    
    # 删除文件
    if video.file_path and os.path.exists(video.file_path):
        try:
            os.remove(video.file_path)
        except Exception as e:
            print(f"Failed to delete file: {e}")
    
    db.delete(video)
    db.commit()
    return None
