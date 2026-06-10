"""
账户中心 API
包含：积分余额、积分流水、资源库管理
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.models import User, UserPoints, PointTransaction, ResourceItem

router = APIRouter()


# ===== 积分管理 =====
@router.get("/points")
def get_points(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """查询积分余额"""
    points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    if not points:
        raise HTTPException(status_code=404, detail="积分账户不存在")
    return {
        "user_id": current_user.id,
        "balance": points.balance,
        "total_earned": points.total_earned,
        "total_spent": points.total_spent,
        "plan": "企业版" if points.balance >= 500 else "基础版"
    }


class RechargeRequest(BaseModel):
    amount: int  # 充值点数


@router.post("/points/recharge")
def recharge_points(req: RechargeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """积分充值"""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="充值金额必须大于0")

    points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    if not points:
        points = UserPoints(user_id=current_user.id, balance=0, total_earned=0, total_spent=0)
        db.add(points)

    points.balance += req.amount
    points.total_earned += req.amount

    # 记录流水
    transaction = PointTransaction(
        user_id=current_user.id,
        amount=req.amount,
        trans_type="recharge",
        description=f"充值{req.amount}点"
    )
    db.add(transaction)
    db.commit()
    db.refresh(points)

    return {
        "balance": points.balance,
        "recharged": req.amount
    }


@router.get("/transactions")
def list_transactions_alias(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """积分流水列表 (别名路径)"""
    query = db.query(PointTransaction).filter(PointTransaction.user_id == current_user.id)
    total = query.count()
    items = query.order_by(PointTransaction.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "items": [
            {
                "id": t.id,
                "amount": t.amount,
                "trans_type": t.trans_type,
                "description": t.description,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in items
        ]
    }


@router.get("/points/transactions")
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """积分流水列表"""
    query = db.query(PointTransaction).filter(PointTransaction.user_id == current_user.id)
    total = query.count()
    items = query.order_by(PointTransaction.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "items": [
            {
                "id": t.id,
                "amount": t.amount,
                "trans_type": t.trans_type,
                "description": t.description,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in items
        ]
    }


# ===== 资源库 =====
@router.get("/resources")
def list_resources(
    res_type: Optional[str] = Query(None, description="image/video"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """资源库列表"""
    query = db.query(ResourceItem).filter(ResourceItem.user_id == current_user.id)

    if res_type:
        query = query.filter(ResourceItem.res_type == res_type)
    if search:
        query = query.filter(ResourceItem.title.ilike(f"%{search}%"))

    total = query.count()
    items = query.order_by(ResourceItem.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "items": [
            {
                "id": r.id,
                "res_type": r.res_type,
                "title": r.title,
                "url": r.url,
                "tags": r.tags,
                "source_task_id": r.source_task_id,
                "source_task_type": r.source_task_type,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in items
        ]
    }


@router.delete("/resources/{resource_id}")
def delete_resource(resource_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除资源"""
    resource = db.query(ResourceItem).filter(ResourceItem.id == resource_id, ResourceItem.user_id == current_user.id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="资源不存在")
    db.delete(resource)
    db.commit()
    return {"message": "资源已删除"}


# ===== 账户信息 =====
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取用户个人信息概览"""
    points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    image_tasks_count = db.query(ResourceItem).filter(
        ResourceItem.user_id == current_user.id, ResourceItem.res_type == "image"
    ).count()
    video_tasks_count = db.query(ResourceItem).filter(
        ResourceItem.user_id == current_user.id, ResourceItem.res_type == "video"
    ).count()

    return {
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "points_balance": points.balance if points else 0,
        "total_earned": points.total_earned if points else 0,
        "total_spent": points.total_spent if points else 0,
        "image_count": image_tasks_count,
        "video_count": video_tasks_count
    }
