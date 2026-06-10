from typing import List, Optional
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import IClipVideoJob, Replication, ProductProfile
from pydantic import BaseModel

router = APIRouter()


class IClipJobCreate(BaseModel):
    script_id: Optional[int] = None
    product_id: Optional[int] = None
    video_type: str = "short"
    assets: Optional[dict] = None


class IClipJobRead(BaseModel):
    id: int
    script_id: Optional[int]
    product_id: Optional[int]
    video_type: str
    assets: Optional[dict]
    status: str
    video_url: Optional[str]
    token_cost: Optional[int]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# 模拟IClip服务
def mock_iclip_service(job_id: int, video_type: str) -> dict:
    """
    模拟IClip视频生成服务
    实际项目中应替换为真实的IClip API调用
    """
    import time
    
    # 模拟处理延迟
    time.sleep(5)
    
    # 模拟生成结果
    return {
        "job_id": job_id,
        "status": "completed",
        "video_url": f"https://example.com/videos/iclip_{job_id}.mp4",
        "thumbnail_url": f"https://example.com/thumbnails/iclip_{job_id}.jpg",
        "duration": 15 if video_type == "short" else 30,
        "token_cost": 50 if video_type == "short" else 80
    }


@router.get('/', response_model=List[IClipJobRead])
def list_jobs(
    status: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(IClipVideoJob)
    if status:
        query = query.filter(IClipVideoJob.status == status)
    if product_id:
        query = query.filter(IClipVideoJob.product_id == product_id)
    jobs = query.order_by(IClipVideoJob.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return jobs


@router.get('/stats')
def iclip_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total = db.query(IClipVideoJob).count()
    completed = db.query(IClipVideoJob).filter(IClipVideoJob.status == 'completed').count()
    processing = db.query(IClipVideoJob).filter(IClipVideoJob.status == 'processing').count()
    return {
        'total': total,
        'completed': completed,
        'processing': processing,
    }


@router.get('/{job_id}', response_model=IClipJobRead)
def get_job(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.get(IClipVideoJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    return job


@router.post('/', response_model=IClipJobRead)
def create_job(
    background_tasks: BackgroundTasks,
    payload: IClipJobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 验证脚本或商品至少有一个
    if not payload.script_id and not payload.product_id:
        raise HTTPException(status_code=400, detail='Either script_id or product_id is required')
    
    # 创建任务记录
    job = IClipVideoJob(
        script_id=payload.script_id,
        product_id=payload.product_id,
        video_type=payload.video_type,
        assets=payload.assets,
        status='pending'
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # 异步执行视频生成
    def _process_job():
        try:
            # 更新状态为处理中
            job.status = 'processing'
            db.add(job)
            db.commit()
            
            # 调用IClip服务（模拟）
            result = mock_iclip_service(job.id, job.video_type)
            
            # 更新结果
            job.status = result['status']
            job.video_url = result['video_url']
            job.token_cost = result['token_cost']
            db.add(job)
            db.commit()
            
            print(f"✅ IClip任务完成：job_id={job.id}, video_url={result['video_url']}")
            
        except Exception as e:
            job.status = 'failed'
            db.add(job)
            db.commit()
            print(f"❌ IClip任务失败：{str(e)}")
    
    background_tasks.add_task(_process_job)
    
    return job


@router.delete('/{job_id}')
def delete_job(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.get(IClipVideoJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    db.delete(job)
    db.commit()
    return {'detail': 'Job deleted'}


@router.post('/batch-generate')
def batch_generate_videos(
    background_tasks: BackgroundTasks,
    replication_ids: List[int],
    video_type: str = "short",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    批量生成视频
    为多个复刻脚本同时提交IClip任务
    """
    def _batch_task():
        try:
            created_count = 0
            for script_id in replication_ids:
                # 检查脚本是否存在
                replication = db.get(Replication, script_id)
                if not replication:
                    continue
                
                # 创建IClip任务
                job = IClipVideoJob(
                    script_id=script_id,
                    product_id=replication.product_id,
                    video_type=video_type,
                    status='pending'
                )
                db.add(job)
                created_count += 1
            
            db.commit()
            print(f"✅ 批量生成任务已创建：{created_count}个任务")
            
        except Exception as e:
            db.rollback()
            print(f"❌ 批量生成失败：{str(e)}")
    
    background_tasks.add_task(_batch_task)
    
    return {
        "message": "批量生成任务已启动",
        "script_count": len(replication_ids),
        "video_type": video_type
    }
