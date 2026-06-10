from typing import List, Optional
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import ProductProfile
from app.schemas.product import ProductProfileCreate, ProductProfileRead, ProductProfileUpdate

router = APIRouter()

# 模拟ECPro爬虫数据
def mock_ecpro_crawl(category: str = "all", limit: int = 50) -> List[dict]:
    """
    模拟ECPro爬虫服务
    实际项目中应替换为真实的ECPro API调用
    """
    import random
    
    categories = ["美妆", "家居", "数码", "服饰", "食品"]
    products = []
    
    for i in range(limit):
        cat = category if category != "all" else random.choice(categories)
        products.append({
            "name": f"{cat}爆款商品{i+1}",
            "category_name": cat,
            "target_audience": "25-35岁女性",
            "selling_points": [f"卖点{i+1}", f"特色{i+1}"],
            "pain_points": [f"痛点{i+1}"],
            "usage_scenes": [f"场景{i+1}"],
            "forbidden_claims": [],
            "tone_style": "专业",
            "image_url": f"https://picsum.photos/seed/{i}/400/400"
        })
    
    return products


@router.get('/', response_model=List[ProductProfileRead])
def list_products(
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(ProductProfile)
    if category_id:
        query = query.filter(ProductProfile.category_id == category_id)
    if search:
        search_term = f'%{search}%'
        query = query.filter(ProductProfile.name.ilike(search_term))
    products = query.order_by(ProductProfile.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return products

@router.get('/{product_id}', response_model=ProductProfileRead)
def get_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.get(ProductProfile, product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return product

@router.post('/', response_model=ProductProfileRead)
def create_product(payload: ProductProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = ProductProfile(**payload.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put('/{product_id}', response_model=ProductProfileRead)
def update_product(product_id: int, payload: ProductProfileUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.get(ProductProfile, product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(product, field, value)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.delete('/{product_id}')
def delete_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.get(ProductProfile, product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    db.delete(product)
    db.commit()
    return {'detail': 'Product deleted'}

@router.get('/stats')
def product_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total = db.query(ProductProfile).count()
    with_selling_points = db.query(ProductProfile).filter(ProductProfile.selling_points.isnot(None)).count()
    with_pain_points = db.query(ProductProfile).filter(ProductProfile.pain_points.isnot(None)).count()
    return {
        'total': total,
        'withSellingPoints': with_selling_points,
        'withPainPoints': with_pain_points,
    }

@router.post('/sync-from-ecpro')
def sync_from_ecpro(
    background_tasks: BackgroundTasks,
    category: str = Query("all"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    从ECPro同步商品数据
    异步执行，立即返回任务ID
    """
    def _sync_task():
        try:
            # 模拟爬虫延迟
            import time
            time.sleep(2)
            
            # 获取ECPro数据
            ecpro_data = mock_ecpro_crawl(category=category, limit=limit)
            
            # 导入到数据库
            imported_count = 0
            for item in ecpro_data:
                # 检查是否已存在
                existing = db.query(ProductProfile).filter(
                    ProductProfile.name == item["name"]
                ).first()
                
                if not existing:
                    product = ProductProfile(
                        name=item["name"],
                        target_audience=item["target_audience"],
                        selling_points=item["selling_points"],
                        pain_points=item["pain_points"],
                        usage_scenes=item["usage_scenes"],
                        forbidden_claims=item["forbidden_claims"],
                        tone_style=item["tone_style"],
                        image_url=item["image_url"]
                    )
                    db.add(product)
                    imported_count += 1
            
            db.commit()
            print(f"✅ ECPro同步完成：导入{imported_count}个商品")
            
        except Exception as e:
            db.rollback()
            print(f"❌ ECPro同步失败：{str(e)}")
    
    # 后台执行
    background_tasks.add_task(_sync_task)
    
    return {
        "message": "ECPro同步任务已启动",
        "category": category,
        "limit": limit
    }

@router.get('/export/csv')
def export_products_csv(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """导出商品CSV"""
    import csv
    import io
    from fastapi.responses import StreamingResponse
    
    products = db.query(ProductProfile).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "名称", "目标人群", "卖点", "痛点", "使用场景"])
    
    for p in products:
        writer.writerow([
            p.id,
            p.name,
            p.target_audience or "",
            "; ".join(p.selling_points or []),
            "; ".join(p.pain_points or []),
            "; ".join(p.usage_scenes or [])
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"}
    )
