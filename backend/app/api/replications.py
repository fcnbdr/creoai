from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_current_user, get_db
from app.models import Replication, Video, ProductProfile, Analysis

router = APIRouter()


class ReplicationCreate(BaseModel):
    video_id: int
    product_id: Optional[int] = None


class ReplicationUpdate(BaseModel):
    script_15s: Optional[dict] = None
    script_30s: Optional[dict] = None
    shot_list: Optional[List[dict]] = None
    spoken_copy: Optional[str] = None
    shooting_notes: Optional[str] = None


class ReplicationRead(BaseModel):
    id: int
    video_id: int
    product_id: Optional[int]
    script_15s: Optional[dict]
    script_30s: Optional[dict]
    shot_list: Optional[List[dict]]
    spoken_copy: Optional[str]
    shooting_notes: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# 模拟AI脚本生成服务
def mock_generate_script(video_id: int, analysis_data: dict, duration: str) -> dict:
    """
    模拟AI脚本生成服务
    基于视频分析结果生成15秒或30秒脚本
    
    实际项目中应调用真实的AI服务（如DeepSeek、GPT等）
    """
    import time
    time.sleep(2)  # 模拟处理延迟
    
    if duration == "15s":
        script = {
            "duration": 15,
            "structure": {
                "hook": "前3秒钩子：抓住注意力",
                "pain_point": "痛点引入：提出问题",
                "solution": "解决方案：产品展示",
                "cta": "行动号召：引导购买"
            },
            "content": f"【15秒脚本】\n0-3s: 你是否也有这个烦恼？\n3-8s: 试试这款产品！\n8-12s: 效果立竿见影！\n12-15s: 立即下单享受优惠！",
            "word_count": 45
        }
    else:  # 30s
        script = {
            "duration": 30,
            "structure": {
                "hook": "前3秒钩子：震撼开场",
                "problem": "问题描述：详细阐述痛点",
                "demo": "产品演示：展示使用过程",
                "benefit": "核心优势：突出卖点",
                "testimonial": "用户见证：增加信任",
                "cta": "行动号召：限时优惠"
            },
            "content": f"【30秒脚本】\n0-3s: 震惊！这个方法太有效了！\n3-10s: 很多人都有这个困扰...\n10-18s: 看我是如何解决的...\n18-25s: 效果真的太好了！\n25-30s: 点击链接立即购买！",
            "word_count": 90
        }
    
    return script


# 模拟分镜列表生成
def mock_generate_shot_list(script: dict, duration: str) -> List[dict]:
    """
    模拟分镜列表生成
    根据脚本内容生成分镜描述
    
    返回格式:
    [
        {
            "shot_number": 1,
            "time_range": "0-3s",
            "visual_description": "画面描述",
            "camera_movement": "运镜方式",
            "audio": "音频内容",
            "text_overlay": "字幕文案"
        }
    ]
    """
    if duration == "15s":
        shots = [
            {
                "shot_number": 1,
                "time_range": "0-3s",
                "visual_description": "特写镜头：人物困惑表情",
                "camera_movement": "固定镜头",
                "audio": "你是否也有这个烦恼？",
                "text_overlay": "你有这个烦恼吗？"
            },
            {
                "shot_number": 2,
                "time_range": "3-8s",
                "visual_description": "产品展示：产品正面特写",
                "camera_movement": "缓慢推进",
                "audio": "试试这款产品！",
                "text_overlay": "推荐好物"
            },
            {
                "shot_number": 3,
                "time_range": "8-12s",
                "visual_description": "使用效果对比：前后对比",
                "camera_movement": "左右平移",
                "audio": "效果立竿见影！",
                "text_overlay": "使用前 vs 使用后"
            },
            {
                "shot_number": 4,
                "time_range": "12-15s",
                "visual_description": "购买按钮特写+优惠信息",
                "camera_movement": "快速缩放",
                "audio": "立即下单享受优惠！",
                "text_overlay": "限时优惠 立即购买"
            }
        ]
    else:  # 30s
        shots = [
            {
                "shot_number": 1,
                "time_range": "0-3s",
                "visual_description": "震撼开场：夸张表情+特效",
                "camera_movement": "快速推进",
                "audio": "震惊！这个方法太有效了！",
                "text_overlay": "震惊！"
            },
            {
                "shot_number": 2,
                "time_range": "3-10s",
                "visual_description": "问题场景：多人困扰画面",
                "camera_movement": "环绕拍摄",
                "audio": "很多人都有这个困扰...",
                "text_overlay": "你也这样吗？"
            },
            {
                "shot_number": 3,
                "time_range": "10-18s",
                "visual_description": "解决过程：详细演示步骤",
                "camera_movement": "跟随镜头",
                "audio": "看我是如何解决的...",
                "text_overlay": "解决方案"
            },
            {
                "shot_number": 4,
                "time_range": "18-25s",
                "visual_description": "效果展示：满意表情+成果",
                "camera_movement": "拉远镜头",
                "audio": "效果真的太好了！",
                "text_overlay": "完美解决"
            },
            {
                "shot_number": 5,
                "time_range": "25-30s",
                "visual_description": "购买引导：二维码+优惠信息",
                "camera_movement": "定格动画",
                "audio": "点击链接立即购买！",
                "text_overlay": "扫码购买 限时优惠"
            }
        ]
    
    return shots


@router.get('/', response_model=List[ReplicationRead])
def list_replications(
    video_id: Optional[int] = Query(None),
    product_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Replication)
    if video_id:
        query = query.filter(Replication.video_id == video_id)
    if product_id:
        query = query.filter(Replication.product_id == product_id)
    replications = query.order_by(Replication.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return replications


@router.get('/{replication_id}', response_model=ReplicationRead)
def get_replication(replication_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    replication = db.get(Replication, replication_id)
    if not replication:
        raise HTTPException(status_code=404, detail='Replication not found')
    return replication


@router.post('/', response_model=ReplicationRead)
def create_replication(
    payload: ReplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 验证视频是否存在
    video = db.get(Video, payload.video_id)
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    # 验证商品是否存在（如果提供）
    if payload.product_id:
        product = db.get(ProductProfile, payload.product_id)
        if not product:
            raise HTTPException(status_code=404, detail='Product not found')
    
    # 创建复刻记录
    replication = Replication(
        video_id=payload.video_id,
        product_id=payload.product_id
    )
    db.add(replication)
    db.commit()
    db.refresh(replication)
    
    return replication


@router.put('/{replication_id}', response_model=ReplicationRead)
def update_replication(
    replication_id: int,
    payload: ReplicationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    replication = db.get(Replication, replication_id)
    if not replication:
        raise HTTPException(status_code=404, detail='Replication not found')
    
    # 更新字段
    if payload.script_15s is not None:
        replication.script_15s = payload.script_15s
    if payload.script_30s is not None:
        replication.script_30s = payload.script_30s
    if payload.shot_list is not None:
        replication.shot_list = payload.shot_list
    if payload.spoken_copy is not None:
        replication.spoken_copy = payload.spoken_copy
    if payload.shooting_notes is not None:
        replication.shooting_notes = payload.shooting_notes
    
    db.add(replication)
    db.commit()
    db.refresh(replication)
    
    return replication


@router.delete('/{replication_id}')
def delete_replication(replication_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    replication = db.get(Replication, replication_id)
    if not replication:
        raise HTTPException(status_code=404, detail='Replication not found')
    db.delete(replication)
    db.commit()
    return {'detail': 'Replication deleted'}


@router.post('/{replication_id}/generate-script')
def generate_script(
    replication_id: int,
    background_tasks: BackgroundTasks,
    duration: str = Query("15s", regex="^(15s|30s)$"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    生成脚本（15秒或30秒）
    基于视频分析结果AI生成脚本内容
    """
    replication = db.get(Replication, replication_id)
    if not replication:
        raise HTTPException(status_code=404, detail='Replication not found')
    
    # 获取视频关联的分析数据
    video = db.get(Video, replication.video_id)
    if not video:
        raise HTTPException(status_code=404, detail='Video not found')
    
    # TODO: 从analyses表获取完整的分析数据
    # 这里简化处理，使用模拟数据
    analysis_data = {
        "transcription": "示例转写文本",
        "keyframes_analysis": {"hook": "前3秒吸引力强"},
        "structure": {"type": "爆款结构A"}
    }
    
    def _generate_task():
        try:
            # 生成脚本
            script = mock_generate_script(replication.id, analysis_data, duration)
            
            # 生成分镜列表
            shot_list = mock_generate_shot_list(script, duration)
            
            # 更新数据库
            if duration == "15s":
                replication.script_15s = script
            else:
                replication.script_30s = script
            
            replication.shot_list = shot_list
            replication.spoken_copy = script["content"]
            replication.shooting_notes = f"基于视频#{video.id}的{duration}复刻脚本"
            
            db.add(replication)
            db.commit()
            
            print(f"✅ 脚本生成完成：replication_id={replication_id}, duration={duration}")
            
        except Exception as e:
            db.rollback()
            print(f"❌ 脚本生成失败：{str(e)}")
    
    background_tasks.add_task(_generate_task)
    
    return {
        "message": "脚本生成任务已启动",
        "replication_id": replication_id,
        "duration": duration
    }


@router.post('/{replication_id}/export')
def export_replication(replication_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    导出复刻脚本为Markdown格式
    """
    replication = db.get(Replication, replication_id)
    if not replication:
        raise HTTPException(status_code=404, detail='Replication not found')
    
    # 构建Markdown内容
    md_content = f"""# 复刻脚本 #{replication.id}

## 基本信息
- 视频ID: {replication.video_id}
- 商品ID: {replication.product_id or '无'}
- 创建时间: {replication.created_at}

## 15秒脚本
```json
{replication.script_15s}
```

## 30秒脚本
```json
{replication.script_30s}
```

## 分镜列表
```json
{replication.shot_list}
```

## 口播文案
{replication.spoken_copy or '暂无'}

## 拍摄备注
{replication.shooting_notes or '暂无'}
"""
    
    return {
        "replication_id": replication_id,
        "format": "markdown",
        "content": md_content
    }
