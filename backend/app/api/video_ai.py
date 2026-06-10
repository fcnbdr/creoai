"""
Video AI 视频生成 API
包含：视频生成、AI Prompt指令生成器、视频增强、安全检查、API令牌管理
"""
import uuid
import secrets
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.models import User, VideoAITask, VideoPrompt, UserPoints, APIToken, ResourceItem

router = APIRouter()


# ===== Pydantic Schemas =====
class VideoGenerateRequest(BaseModel):
    description: str
    product_id: Optional[int] = None
    duration: Optional[int] = 5
    style_prompt: Optional[str] = None


class PromptGenerateRequest(BaseModel):
    category: str  # 商品类别
    selling_points: str  # 商品卖点
    scenario: str  # 使用场景


class TokenCreateRequest(BaseModel):
    token_name: str


# ===== 视频生成 =====
@router.post("/generate")
def generate_video(req: VideoGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """根据描述生成视频内容"""
    cost = 15

    # 安全检查（模拟）
    banned_keywords = ["真人面孔", "版权角色", "成人内容"]
    for keyword in banned_keywords:
        if keyword in req.description:
            task = VideoAITask(
                user_id=current_user.id,
                description=req.description,
                status="safety_failed",
                safety_check=False,
                safety_message=f"内容未通过安全检查，请调整描述后重新生成。不支持：真人面孔、版权角色、版权音乐、成人内容、上传真人照片"
            )
            db.add(task)
            db.commit()
            return {
                "id": task.id,
                "status": "safety_failed",
                "message": "内容未通过安全检查"
            }

    # 检查积分
    points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    if not points or points.balance < cost:
        raise HTTPException(status_code=402, detail=f"积分不足，需要{cost}点，当前余额{points.balance if points else 0}点")

    points.balance -= cost
    points.total_spent += cost

    # 创建任务
    task = VideoAITask(
        user_id=current_user.id,
        product_id=req.product_id,
        description=req.description,
        status="processing",
        points_cost=cost
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # 模拟生成
    mock_url = f"/mock/video_{uuid.uuid4().hex[:8]}.mp4"
    task.generated_url = mock_url
    task.status = "completed"
    task.safety_check = True
    task.duration = req.duration
    db.commit()

    # 添加到资源库
    resource = ResourceItem(
        user_id=current_user.id,
        res_type="video",
        title=f"AI视频-{req.description[:30]}",
        url=mock_url,
        source_task_id=task.id,
        source_task_type="video_generate"
    )
    db.add(resource)
    db.commit()

    return {
        "id": task.id,
        "status": task.status,
        "generated_url": task.generated_url,
        "points_used": cost,
        "balance": points.balance
    }


# ===== AI生成Prompt指令 =====
@router.post("/prompts/generate")
def generate_prompts(req: PromptGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """输入商品类目/卖点/场景，AI自动生成6种风格共21条视频Prompt"""
    # 模拟6种风格各生成Prompt
    styles = ["时尚大片", "产品特写", "使用场景", "对比测评", "开箱分享", "剧情植入"]
    prompts = {}

    for style in styles:
        prompts[style] = [
            f"{style}风格 - {req.category} - {req.selling_points} - 第{i+1}条 - {req.scenario}"
            for i in range(3 if style != "剧情植入" else 6)
        ]

    # 保存记录
    record = VideoPrompt(
        user_id=current_user.id,
        category=req.category,
        selling_points=req.selling_points,
        scenario=req.scenario,
        prompts=prompts,
        style_count=6
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "category": req.category,
        "style_count": 6,
        "total_prompts": sum(len(v) for v in prompts.values()),
        "prompts": prompts
    }


# ===== 视频增强 =====
class EnhanceRequest(BaseModel):
    video_url: Optional[str] = None
    video_task_id: Optional[int] = None


@router.post("/enhance")
def enhance_video(req: EnhanceRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """对生成视频进行画质增强"""
    # 支持通过 task_id 或 url 查找任务
    task = None
    if req.video_task_id:
        task = db.query(VideoAITask).filter(VideoAITask.id == req.video_task_id, VideoAITask.user_id == current_user.id).first()
    elif req.video_url:
        task = db.query(VideoAITask).filter(VideoAITask.generated_url == req.video_url, VideoAITask.user_id == current_user.id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task.status != "completed":
        raise HTTPException(status_code=400, detail="只能增强已完成的视频")

    cost = 5
    points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    if points and points.balance >= cost:
        points.balance -= cost

    enhanced_url = f"/mock/enhanced_{uuid.uuid4().hex[:8]}.mp4"
    task.generated_url = enhanced_url
    db.commit()

    return {"id": task.id, "generated_url": enhanced_url, "points_used": cost}


# ===== 任务列表 =====
@router.get("/tasks")
def list_tasks(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取视频任务列表（最近20个）"""
    query = db.query(VideoAITask).filter(VideoAITask.user_id == current_user.id)
    if status:
        query = query.filter(VideoAITask.status == status)

    total = query.count()
    tasks = query.order_by(VideoAITask.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "items": [
            {
                "id": t.id,
                "description": t.description,
                "status": t.status,
                "generated_url": t.generated_url,
                "safety_check": t.safety_check,
                "safety_message": t.safety_message,
                "error_message": t.error_message,
                "duration": t.duration,
                "points_cost": t.points_cost,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in tasks
        ]
    }


# ===== API令牌管理 =====
@router.get("/tokens")
def list_tokens(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取API令牌列表"""
    tokens = db.query(APIToken).filter(APIToken.user_id == current_user.id).all()
    return {
        "tokens": [
            {
                "id": t.id,
                "token_name": t.token_name,
                "token_key": t.token_key[:8] + "****" + t.token_key[-4:] if len(t.token_key) > 12 else t.token_key,
                "is_active": t.is_active,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "expires_at": t.expires_at.isoformat() if t.expires_at else None,
                "last_used_at": t.last_used_at.isoformat() if t.last_used_at else None
            }
            for t in tokens
        ]
    }


@router.post("/tokens")
def create_token(req: TokenCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建API令牌"""
    token_key = f"creoai_{secrets.token_hex(24)}"
    expires_at = datetime.utcnow() + timedelta(days=365)

    token = APIToken(
        user_id=current_user.id,
        token_name=req.token_name,
        token_key=token_key,
        expires_at=expires_at
    )
    db.add(token)
    db.commit()
    db.refresh(token)

    return {
        "id": token.id,
        "token_name": token.token_name,
        "token_key": token_key,  # 完整key仅在创建时返回
        "expires_at": token.expires_at.isoformat()
    }


@router.delete("/tokens/{token_id}")
def delete_token(token_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除API令牌"""
    token = db.query(APIToken).filter(APIToken.id == token_id, APIToken.user_id == current_user.id).first()
    if not token:
        raise HTTPException(status_code=404, detail="令牌不存在")
    db.delete(token)
    db.commit()
    return {"message": "令牌已删除"}


# ===== 任务重试 =====
@router.post("/tasks/{task_id}/retry")
def retry_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """重试失败的视频任务"""
    task = db.query(VideoAITask).filter(VideoAITask.id == task_id, VideoAITask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task.status != "failed":
        raise HTTPException(status_code=400, detail="只能重试失败的任务")

    task.status = "processing"
    task.error_message = None
    db.commit()

    # 模拟重试成功
    task.status = "completed"
    task.generated_url = task.generated_url or f"/mock/retry_video_{uuid.uuid4().hex[:8]}.mp4"
    db.commit()

    return {"id": task.id, "status": task.status}


# ===== 微详情短视频 =====
class MicroVideoRequest(BaseModel):
    product_ids: List[int]


class SafeCheckRequest(BaseModel):
    description: str


@router.post("/check-safe")
def check_safe(req: SafeCheckRequest):
    """检查视频内容是否合规"""
    banned_keywords = ["真人面孔", "版权角色", "成人内容", "版权音乐"]
    for keyword in banned_keywords:
        if keyword in req.description:
            return {
                "safe": False,
                "message": f"内容包含禁止词汇：{keyword}。请调整描述后重新生成。"
            }
    return {"safe": True, "message": "内容安全检查通过，可以生成"}


@router.post("/micro")
def generate_micro_videos(req: MicroVideoRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """微详情短视频批量生成：选择商品，自动生成短视频"""
    cost = len(req.product_ids) * 8
    points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    if not points or points.balance < cost:
        raise HTTPException(status_code=402, detail=f"积分不足，需要{cost}点")

    points.balance -= cost
    points.total_spent += cost

    tasks = []
    for pid in req.product_ids:
        task = VideoAITask(user_id=current_user.id, product_id=pid, description=f"微详情短视频-商品#{pid}", status="processing", points_cost=8)
        db.add(task)
        db.flush()
        task.status = "completed"
        task.generated_url = f"/mock/micro_video_{uuid.uuid4().hex[:8]}.mp4"
        tasks.append({"id": task.id, "product_id": pid, "url": task.generated_url})
    db.commit()

    return {"message": f"已生成{len(tasks)}个微详情短视频", "tasks": tasks, "points_used": cost, "balance": points.balance}


# ===== 直播切片 =====
class LiveClipRequest(BaseModel):
    live_url: str
    duration: int = 15  # 15秒或30秒
    clip_count: int = 5  # 切片数量


@router.post("/live-clips")
def generate_live_clips(req: LiveClipRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """直播切片：输入直播回放链接，AI自动检测高光片段并生成切片"""
    cost = req.clip_count * 5
    points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    if not points or points.balance < cost:
        raise HTTPException(status_code=402, detail=f"积分不足，需要{cost}点")

    points.balance -= cost
    points.total_spent += cost

    clips = []
    for i in range(req.clip_count):
        task = VideoAITask(user_id=current_user.id, description=f"直播切片#{i+1} ({req.duration}s)", status="completed",
                           generated_url=f"/mock/live_clip_{uuid.uuid4().hex[:8]}.mp4", points_cost=5, duration=req.duration)
        db.add(task)
        db.flush()
        clips.append({"id": task.id, "url": task.generated_url, "duration": req.duration})
    db.commit()

    return {"message": f"已生成{len(clips)}个直播切片", "clips": clips, "points_used": cost, "balance": points.balance}
