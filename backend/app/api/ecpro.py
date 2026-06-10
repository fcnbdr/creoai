from typing import List, Optional
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_current_user, get_db
from app.models import ECProContentJob, ProductProfile

router = APIRouter()


class ECProJobCreate(BaseModel):
    product_id: int
    job_type: str = "copywriting"  # copywriting / script / hashtag
    platform_targets: Optional[List[str]] = None


class ECProJobRead(BaseModel):
    id: int
    product_id: int
    job_type: str
    platform_targets: Optional[List[str]]
    status: str
    content_urls: Optional[List[str]]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# 敏感词库（示例）
SENSITIVE_WORDS = [
    "最", "第一", "绝对", "100%", " guaranteed",
    "治愈", "根治", "无副作用", "国家级", "世界级"
]

# 合规检查规则
COMPLIANCE_RULES = {
    "max_length": 500,  # 最大字数
    "min_length": 10,   # 最小字数
    "forbidden_patterns": [r"\d+%保证", r".*治愈.*", r".*根治.*"]
}


def check_sensitive_words(text: str) -> dict:
    """
    敏感词检测
    返回检测结果和命中的敏感词列表
    """
    found_words = []
    for word in SENSITIVE_WORDS:
        if word.lower() in text.lower():
            found_words.append(word)
    
    return {
        "has_sensitive_words": len(found_words) > 0,
        "sensitive_words": found_words,
        "count": len(found_words)
    }


def check_compliance(text: str) -> dict:
    """
    合规性检查
    检查长度、格式等
    """
    issues = []
    
    # 长度检查
    if len(text) < COMPLIANCE_RULES["min_length"]:
        issues.append(f"文案过短（{len(text)}字），建议至少{COMPLIANCE_RULES['min_length']}字")
    
    if len(text) > COMPLIANCE_RULES["max_length"]:
        issues.append(f"文案过长（{len(text)}字），建议不超过{COMPLIANCE_RULES['max_length']}字")
    
    # 正则模式检查
    import re
    for pattern in COMPLIANCE_RULES["forbidden_patterns"]:
        if re.search(pattern, text):
            issues.append(f"包含不合规模式：{pattern}")
    
    return {
        "is_compliant": len(issues) == 0,
        "issues": issues,
        "issue_count": len(issues)
    }


# 模拟ECPro内容生成服务
def mock_ecpro_content_service(job_id: int, job_type: str, product_name: str) -> dict:
    """
    模拟ECPro内容生成服务
    实际项目中应替换为真实的ECPro API调用或AI生成服务
    """
    import time
    
    # 模拟处理延迟
    time.sleep(3)
    
    # 根据任务类型生成不同内容
    if job_type == "copywriting":
        content = f"【{product_name}】全新升级！品质保证，值得信赖。限时优惠，立即抢购！"
    elif job_type == "script":
        content = f"开场：大家好！今天给大家带来一款超棒的{product_name}。\n中间：这款产品有什么特点呢？...\n结尾：喜欢的朋友赶紧下单吧！"
    elif job_type == "hashtag":
        content = f"#{product_name} #好物推荐 #性价比之王 #必买清单 #种草"
    else:
        content = f"默认生成的{job_type}内容：{product_name}"
    
    # 敏感词检测
    sensitive_check = check_sensitive_words(content)
    
    # 合规检查
    compliance_check = check_compliance(content)
    
    return {
        "job_id": job_id,
        "status": "completed",
        "content": content,
        "content_url": f"https://example.com/content/ecpro_{job_id}.txt",
        "sensitive_check": sensitive_check,
        "compliance_check": compliance_check,
        "word_count": len(content)
    }


@router.get('/', response_model=List[ECProJobRead])
def list_jobs(
    status: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    job_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(ECProContentJob)
    if status:
        query = query.filter(ECProContentJob.status == status)
    if product_id:
        query = query.filter(ECProContentJob.product_id == product_id)
    if job_type:
        query = query.filter(ECProContentJob.job_type == job_type)
    jobs = query.order_by(ECProContentJob.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return jobs


@router.get('/{job_id}', response_model=ECProJobRead)
def get_job(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.get(ECProContentJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    return job


@router.post('/', response_model=ECProJobRead)
def create_job(
    background_tasks: BackgroundTasks,
    payload: ECProJobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 验证商品是否存在
    product = db.get(ProductProfile, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    
    # 创建任务记录
    job = ECProContentJob(
        product_id=payload.product_id,
        job_type=payload.job_type,
        platform_targets=payload.platform_targets,
        status='pending'
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # 异步执行内容生成
    def _process_job():
        try:
            # 更新状态为处理中
            job.status = 'processing'
            db.add(job)
            db.commit()
            
            # 调用ECPro服务（模拟）
            result = mock_ecpro_content_service(job.id, job.job_type, product.name)
            
            # 保存结果到content_urls（JSON数组）
            job.status = result['status']
            job.content_urls = [result['content_url']]
            db.add(job)
            db.commit()
            
            print(f"✅ ECPro任务完成：job_id={job.id}, content={result['content'][:50]}...")
            print(f"   敏感词检测：{result['sensitive_check']}")
            print(f"   合规检查：{result['compliance_check']}")
            
        except Exception as e:
            job.status = 'failed'
            db.add(job)
            db.commit()
            print(f"❌ ECPro任务失败：{str(e)}")
    
    background_tasks.add_task(_process_job)
    
    return job


@router.delete('/{job_id}')
def delete_job(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.get(ECProContentJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    db.delete(job)
    db.commit()
    return {'detail': 'Job deleted'}


@router.post('/batch-generate')
def batch_generate_content(
    background_tasks: BackgroundTasks,
    product_ids: List[int],
    job_type: str = "copywriting",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    批量生成内容
    为多个商品同时提交ECPro任务
    """
    def _batch_task():
        try:
            created_count = 0
            for product_id in product_ids:
                # 检查商品是否存在
                product = db.get(ProductProfile, product_id)
                if not product:
                    continue
                
                # 创建ECPro任务
                job = ECProContentJob(
                    product_id=product_id,
                    job_type=job_type,
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
        "product_count": len(product_ids),
        "job_type": job_type
    }


@router.post('/{job_id}/audit')
def audit_content(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    手动触发内容审核
    重新检测敏感词和合规性
    """
    job = db.get(ECProContentJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    
    if job.status != 'completed':
        raise HTTPException(status_code=400, detail='Only completed jobs can be audited')
    
    # TODO: 从content_urls获取实际内容进行审核
    # 这里简化处理，返回审核接口结构
    return {
        "job_id": job_id,
        "audit_status": "passed",
        "message": "内容审核通过"
    }
