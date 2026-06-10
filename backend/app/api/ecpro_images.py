"""
ECPro 图片精修/生成 API
包含：智能精修、图片扩充、换色、文字替换、扩图、视觉迁移、种草、任务列表
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.models import User, ImageTask, ResourceItem, UserPoints

router = APIRouter()


# ===== Pydantic Schemas =====
class ImageTaskCreate(BaseModel):
    task_type: str  # retouch/expand/color_swap/text_replace/outpainting/style_transfer/koc
    title: Optional[str] = None
    input_images: Optional[List[str]] = None
    prompt: Optional[str] = None
    params: Optional[dict] = None
    product_id: Optional[int] = None


class ImageTaskResponse(BaseModel):
    id: int
    task_type: str
    title: Optional[str]
    input_images: Optional[list]
    prompt: Optional[str]
    params: Optional[dict]
    output_images: Optional[list]
    status: str
    error_message: Optional[str]
    points_cost: Optional[int]
    created_at: str

    class Config:
        from_attributes = True


# ===== ECPro 核心功能 =====

@router.post("/detail-page")
def generate_detail_page(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI详情页生成：根据商品信息生成适配16+电商平台详情页"""
    return _create_image_task_with_platforms(db, current_user, task, "detail_page", cost=12)


@router.post("/smart-retouch")
def smart_retouch(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """智能精修：上传图片+Prompt指令，AI生成精修图"""
    return _create_image_task(db, current_user, task, "retouch", cost=5)


@router.post("/image-expand")
def image_expand(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """图片扩充：上传图片，AI生成多张补充图片（最多10张）"""
    return _create_image_task(db, current_user, task, "expand", cost=8)


@router.post("/color-swap")
def color_swap(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI换色：对商品进行AI换色生成"""
    return _create_image_task(db, current_user, task, "color_swap", cost=3)


@router.post("/text-replace")
def text_replace(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """文字替换：将图片中文字进行AI替换"""
    return _create_image_task(db, current_user, task, "text_replace", cost=3)


@router.post("/outpainting")
def outpainting(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI扩图：扩展图片边界"""
    return _create_image_task(db, current_user, task, "outpainting", cost=5)


@router.post("/style-transfer")
def style_transfer(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """视觉迁移：将一种视觉风格迁移到另一张图"""
    return _create_image_task(db, current_user, task, "style_transfer", cost=10)


@router.post("/koc-content")
def koc_content(task: ImageTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """生成种草内容"""
    return _create_image_task(db, current_user, task, "koc", cost=6)


def _create_image_task(db: Session, user: User, task: ImageTaskCreate, task_type: str, cost: int):
    """通用图片任务创建函数"""
    # 检查积分
    points = db.query(UserPoints).filter(UserPoints.user_id == user.id).first()
    if not points or points.balance < cost:
        raise HTTPException(status_code=402, detail=f"积分不足，需要{cost}点，当前余额{points.balance if points else 0}点")

    # 扣除积分
    points.balance -= cost
    points.total_spent += cost

    # 创建任务
    db_task = ImageTask(
        user_id=user.id,
        product_id=task.product_id,
        task_type=task_type,
        title=task.title,
        input_images=task.input_images,
        prompt=task.prompt,
        params=task.params,
        status="processing",
        points_cost=cost
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # 模拟生成结果（实际项目中调用AI服务）
    mock_outputs = [
        f"/mock/{task_type}_{uuid.uuid4().hex[:8]}.png"
        for _ in range(task.params.get("quantity", 2) if task.params else 2)
    ]
    db_task.output_images = mock_outputs
    db_task.status = "completed"
    db.commit()
    db.refresh(db_task)

    # 添加到资源库
    for url in mock_outputs:
        resource = ResourceItem(
            user_id=user.id,
            res_type="image",
            title=task.title or f"{task_type}生成图",
            url=url,
            source_task_id=db_task.id,
            source_task_type=task_type
        )
        db.add(resource)
    db.commit()

    return {
        "id": db_task.id,
        "status": db_task.status,
        "output_images": db_task.output_images,
        "points_used": cost,
        "balance": points.balance
    }


def _create_image_task_with_platforms(db: Session, user: User, task: ImageTaskCreate, task_type: str, cost: int):
    """详情页生成任务 - 含多平台信息"""
    points = db.query(UserPoints).filter(UserPoints.user_id == user.id).first()
    if not points or points.balance < cost:
        raise HTTPException(status_code=402, detail=f"积分不足，需要{cost}点，当前余额{points.balance if points else 0}点")

    points.balance -= cost
    points.total_spent += cost

    platforms = ["淘宝", "天猫", "京东", "拼多多", "抖音", "快手", "小红书", "1688", "shopee", "lazada"]
    mock_outputs = {}
    for platform in platforms:
        mock_outputs[platform] = f"/mock/detail_page_{platform}_{uuid.uuid4().hex[:8]}.png"

    db_task = ImageTask(
        user_id=user.id,
        product_id=task.product_id,
        task_type=task_type,
        title=task.title,
        input_images=task.input_images,
        prompt=task.prompt,
        params={**((task.params or {})) , "platforms": platforms},
        output_images=list(mock_outputs.values()),
        status="completed",
        points_cost=cost
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    for url in mock_outputs.values():
        resource = ResourceItem(user_id=user.id, res_type="image", title=f"详情页生成", url=url, source_task_id=db_task.id, source_task_type=task_type)
        db.add(resource)
    db.commit()

    return {"id": db_task.id, "status": db_task.status, "platforms": platforms, "output_images": list(mock_outputs.values()), "points_used": cost, "balance": points.balance}


# ===== 任务列表 =====
@router.get("/tasks")
def list_tasks(
    status: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取图片任务列表，支持筛选"""
    query = db.query(ImageTask).filter(ImageTask.user_id == current_user.id)

    if status:
        query = query.filter(ImageTask.status == status)
    if task_type:
        query = query.filter(ImageTask.task_type == task_type)

    total = query.count()
    tasks = query.order_by(ImageTask.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": t.id,
                "task_type": t.task_type,
                "title": t.title,
                "status": t.status,
                "input_images": t.input_images,
                "output_images": t.output_images,
                "error_message": t.error_message,
                "points_cost": t.points_cost,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in tasks
        ]
    }


@router.post("/tasks/{task_id}/retry")
def retry_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """重试失败任务"""
    task = db.query(ImageTask).filter(ImageTask.id == task_id, ImageTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task.status != "failed":
        raise HTTPException(status_code=400, detail="只能重试失败的任务")

    task.status = "processing"
    task.error_message = None
    db.commit()

    # 模拟重试成功
    task.status = "completed"
    task.output_images = task.output_images or [f"/mock/retry_{uuid.uuid4().hex[:8]}.png"]
    db.commit()

    return {"id": task.id, "status": task.status}


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除任务"""
    task = db.query(ImageTask).filter(ImageTask.id == task_id, ImageTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    db.delete(task)
    db.commit()
    return {"message": "任务已删除"}
