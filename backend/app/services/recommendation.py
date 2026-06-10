import random
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import Category, ProductProfile, TopicRecommendation, Video


def _normalize_score(value: int) -> int:
    return max(0, min(100, value))


def _build_title(product_name: str, category_name: Optional[str], source_title: Optional[str]) -> str:
    hooks = [
        f'{product_name} 直击核心痛点',
        f'{product_name} 秒懂用法',
        f'{product_name} 带你快速变美/更健康',
        f'{product_name} 必买理由',
    ]
    if source_title:
        hooks.append(f'从“{source_title}”中提炼的爆款词')
    return random.choice(hooks)


def _build_recommend_reason(product_name: str, category_name: Optional[str], source_title: Optional[str]) -> str:
    parts = []
    if category_name:
        parts.append(f'针对{category_name}用户痛点精炼')
    if source_title:
        parts.append('结合热门视频结构提升转化')
    parts.append(f'围绕产品{product_name}的卖点展开')
    return '，'.join(parts)


def _generate_score(product: ProductProfile, video: Optional[Video]) -> Dict[str, int]:
    heat = random.randint(60, 90)
    match = random.randint(60, 95)
    conv = random.randint(55, 90)
    if video and video.metrics and isinstance(video.metrics, dict):
        view_factor = min(20, int(video.metrics.get('views', 0) // 500))
        heat = _normalize_score(heat + view_factor)
    return {
        'heat': heat,
        'match': match,
        'conversion': conv,
    }


def generate_topic_recommendations(
    db: Session,
    category_id: Optional[int] = None,
    product_id: Optional[int] = None,
    source_video_id: Optional[int] = None,
    count: int = 5,
) -> List[TopicRecommendation]:
    if product_id:
        product = db.get(ProductProfile, product_id)
    else:
        product = db.query(ProductProfile).filter(ProductProfile.category_id == category_id).first()
        if not product:
            product = db.query(ProductProfile).first()
    if not product:
        raise ValueError('Product not found for recommendation generation')

    category = db.get(Category, product.category_id) if product.category_id else None
    source_video = db.get(Video, source_video_id) if source_video_id else None

    recommendations: List[TopicRecommendation] = []
    for idx in range(count):
        title = _build_title(product.name, category.name if category else None, source_video.title if source_video else None)
        reason = _build_recommend_reason(product.name, category.name if category else None, source_video.title if source_video else None)
        score = _generate_score(product, source_video)
        difficulty = random.randint(1, 5)

        recommendation = TopicRecommendation(
            category_id=product.category_id,
            product_id=product.id,
            source_video_id=source_video.id if source_video else None,
            title=f'{title} #{idx + 1}',
            recommend_reason=reason,
            score=score,
            difficulty=difficulty,
        )
        db.add(recommendation)
        recommendations.append(recommendation)

    db.commit()
    for recommendation in recommendations:
        db.refresh(recommendation)
    return recommendations


def export_recommendation_markdown(recommendation: TopicRecommendation) -> str:
    score = recommendation.score or {}
    return (
        f'# {recommendation.title}\n\n'
        f'**推荐理由**：{recommendation.recommend_reason or "无"}\n\n'
        f'**热度**：{score.get("heat", 0)}  |  **匹配度**：{score.get("match", 0)}  |  **转化预估**：{score.get("conversion", 0)}\n\n'
        f'**难度评分**：{recommendation.difficulty or 0}\n\n'
        '## 生成说明\n'
        '本选题基于商品特征、类目定位与视频结构生成，适合快速联动 ECPro 图文与 iClip 视频内容生产。\n'
    )
