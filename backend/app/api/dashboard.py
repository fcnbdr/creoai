from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import AICall, Analysis, IClipTokenQuota, IClipVideoJob, TopicRecommendation

router = APIRouter()


class DashboardStats(BaseModel):
    today_analyzed_videos: int
    today_recommendations: int
    today_ai_cost: float
    iclip_remaining_quota: int


@router.get('/stats', response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    today_analyzed_videos = db.query(Analysis).filter(Analysis.created_at >= today_start).count()
    today_recommendations = db.query(TopicRecommendation).filter(TopicRecommendation.created_at >= today_start).count()

    today_calls = db.query(AICall).filter(AICall.created_at >= today_start).all()
    today_ai_cost = 0.0
    for call in today_calls:
        try:
            if call.cost_estimate:
                today_ai_cost += float(call.cost_estimate)
        except (ValueError, TypeError):
            continue

    quota = db.query(IClipTokenQuota).order_by(IClipTokenQuota.id.desc()).first()
    if quota:
        remaining_quota = max(0, quota.total_quota - quota.used_quota)
    else:
        total_used = db.query(func.coalesce(func.sum(IClipVideoJob.token_cost), 0)).scalar() or 0
        remaining_quota = max(0, 1000 - int(total_used))

    return {
        'today_analyzed_videos': today_analyzed_videos,
        'today_recommendations': today_recommendations,
        'today_ai_cost': round(today_ai_cost, 2),
        'iclip_remaining_quota': remaining_quota,
    }
