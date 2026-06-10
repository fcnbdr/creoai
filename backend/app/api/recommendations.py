from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import TopicRecommendation
from app.schemas.recommendation import (
    RecommendationCreateRequest,
    RecommendationExportResponse,
    RecommendationRead,
)
from app.services.recommendation import export_recommendation_markdown, generate_topic_recommendations

router = APIRouter()


def _serialize_recommendation(recommendation: TopicRecommendation) -> dict:
    score = recommendation.score or {}
    score_value = None
    if isinstance(score, dict):
        score_value = score.get('heat') or score.get('match') or score.get('conversion')
    elif isinstance(score, (int, float)):
        score_value = int(score)

    return {
        'id': recommendation.id,
        'category_id': recommendation.category_id,
        'product_id': recommendation.product_id,
        'source_video_id': recommendation.source_video_id,
        'title': recommendation.title,
        'recommend_reason': recommendation.recommend_reason,
        'score': int(score_value) if score_value is not None else None,
        'difficulty': recommendation.difficulty,
        'product_name': recommendation.product.name if recommendation.product else None,
        'created_at': recommendation.created_at,
        'updated_at': recommendation.updated_at,
    }

@router.get('/', response_model=List[RecommendationRead])
def list_recommendations(
    product_id: Optional[int] = None,
    category_id: Optional[int] = None,
    video_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(TopicRecommendation)
    if product_id:
        query = query.filter(TopicRecommendation.product_id == product_id)
    if category_id:
        query = query.filter(TopicRecommendation.category_id == category_id)
    if video_id:
        query = query.filter(TopicRecommendation.source_video_id == video_id)
    recommendations = query.order_by(TopicRecommendation.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return [_serialize_recommendation(rec) for rec in recommendations]

@router.get('/{recommendation_id}', response_model=RecommendationRead)
def get_recommendation(recommendation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    recommendation = db.get(TopicRecommendation, recommendation_id)
    if not recommendation:
        raise HTTPException(status_code=404, detail='Recommendation not found')
    return _serialize_recommendation(recommendation)

@router.post('/generate', response_model=List[RecommendationRead])
def create_recommendations(payload: RecommendationCreateRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        recommendations = generate_topic_recommendations(
            db=db,
            category_id=payload.category_id,
            product_id=payload.product_id,
            source_video_id=payload.source_video_id,
            count=payload.count,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return [_serialize_recommendation(rec) for rec in recommendations]

@router.get('/{recommendation_id}/export', response_model=RecommendationExportResponse)
def export_recommendation(recommendation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    recommendation = db.get(TopicRecommendation, recommendation_id)
    if not recommendation:
        raise HTTPException(status_code=404, detail='Recommendation not found')
    markdown = export_recommendation_markdown(recommendation)
    return {'content': markdown}

@router.post('/batch-generate')
def batch_generate_recommendations(
    background_tasks: BackgroundTasks,
    product_ids: List[int],
    count_per_product: int = 5,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    批量为多个商品生成选题推荐
    异步执行，立即返回
    """
    def _batch_task():
        try:
            total_generated = 0
            for product_id in product_ids:
                # 检查商品是否存在
                from app.models import ProductProfile
                product = db.get(ProductProfile, product_id)
                if not product:
                    continue
                
                # 为该商品生成推荐
                recommendations = generate_topic_recommendations(
                    db=db,
                    product_id=product_id,
                    count=count_per_product,
                )
                total_generated += len(recommendations)
            
            print(f"✅ 批量生成完成：共生成{total_generated}个选题推荐")
            
        except Exception as e:
            db.rollback()
            print(f"❌ 批量生成失败：{str(e)}")
    
    background_tasks.add_task(_batch_task)
    
    return {
        "message": "批量生成任务已启动",
        "product_count": len(product_ids),
        "count_per_product": count_per_product
    }


@router.get('/stats')
def recommendation_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total = db.query(TopicRecommendation).count()
    high_score = 0
    avg_difficulty = 0

    recommendations = db.query(TopicRecommendation).all()
    if recommendations:
        high_score = sum(1 for rec in recommendations if isinstance(rec.score, dict) and rec.score.get('heat', 0) >= 80)
        difficulties = [rec.difficulty for rec in recommendations if rec.difficulty is not None]
        if difficulties:
            avg_difficulty = sum(difficulties) / len(difficulties)

    return {
        'total': total,
        'highScore': high_score,
        'avgDifficulty': round(avg_difficulty, 1),
    }


@router.delete('/{recommendation_id}')
def delete_recommendation(recommendation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    recommendation = db.get(TopicRecommendation, recommendation_id)
    if not recommendation:
        raise HTTPException(status_code=404, detail='Recommendation not found')
    db.delete(recommendation)
    db.commit()
    return {'detail': 'Recommendation deleted'}
