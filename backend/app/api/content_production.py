"""
内容生产相关API - ECPro + iClip融合
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.db.session import get_db
from app.services.ai_gateway import AIGateway
from pydantic import BaseModel

router = APIRouter()


class GenerateDetailPageRequest(BaseModel):
    product_id: int
    template_id: int
    platforms: List[str]


class GenerateVideoRequest(BaseModel):
    images: List[str]
    script: str
    duration: int = 15


@router.post('/generate-detail-page')
def generate_detail_page(
    request: GenerateDetailPageRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """生成ECPro详情页"""
    try:
        gateway = AIGateway(db)
        result = gateway.ecpro_generate_detail_page(
            product_id=request.product_id,
            template_id=request.template_id,
            platforms=request.platforms
        )
        return {
            'code': 200,
            'data': result,
            'message': '详情页生成成功'
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'生成失败: {str(e)}'
        )


@router.post('/generate-video')
def generate_video(
    request: GenerateVideoRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """生成iClip视频"""
    try:
        gateway = AIGateway(db)
        result = gateway.iclip_generate_video(
            images=request.images,
            script=request.script,
            duration=request.duration
        )
        return {
            'code': 200,
            'data': result,
            'message': '视频生成成功'
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'生成失败: {str(e)}'
        )


@router.get('/iclip-quota')
def get_iclip_quota(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """查询iClip积分余额"""
    from app.models import IClipTokenQuota
    
    quota = db.query(IClipTokenQuota).filter(
        IClipTokenQuota.user_id == current_user.id
    ).first()
    
    if not quota:
        # 如果没有配额记录,返回默认值
        return {
            'code': 200,
            'data': {
                'total_quota': 0,
                'used_quota': 0,
                'remaining': 0
            },
            'message': 'success'
        }
    
    return {
        'code': 200,
        'data': {
            'total_quota': quota.total_quota,
            'used_quota': quota.used_quota,
            'remaining': quota.total_quota - quota.used_quota
        },
        'message': 'success'
    }


@router.post('/cross-platform-publish')
def cross_platform_publish(
    content_id: int,
    shops: List[dict],
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """跨平台发布(预留接口)"""
    try:
        gateway = AIGateway(db)
        result = gateway.cross_platform_publish(content_id, shops)
        return {
            'code': 200,
            'data': result,
            'message': '发布任务已提交'
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'发布失败: {str(e)}'
        )
