"""
AI配置相关API
包括：供应商管理、模型映射、Prompt管理、测试台
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.db.session import get_db
from app.models import AIProvider, AIModel, AIPrompt
from app.schemas.ai import (
    AIProviderCreate,
    AIProviderRead,
    AIProviderUpdate,
    AIModelCreate,
    AIModelRead,
    AIPromptCreate,
    AIPromptRead,
    TextTestRequest,
    JSONTestRequest,
    ImageTestRequest,
    AudioTestRequest,
)
from app.services.ai_gateway import AIGateway

router = APIRouter()


# ==================== AI供应商管理 ====================

@router.get('/providers', response_model=List[AIProviderRead])
def list_ai_providers(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取AI供应商列表"""
    providers = db.query(AIProvider).order_by(AIProvider.priority.asc()).all()
    return providers


@router.post('/providers', response_model=AIProviderRead, status_code=status.HTTP_201_CREATED)
def create_ai_provider(
    provider_in: AIProviderCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """新增AI供应商"""
    existing = db.query(AIProvider).filter(AIProvider.name == provider_in.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Provider '{provider_in.name}' already exists")
    
    provider = AIProvider(**provider_in.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.put('/providers/{provider_id}', response_model=AIProviderRead)
def update_ai_provider(
    provider_id: int,
    provider_update: AIProviderUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新供应商配置"""
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Provider not found')
    
    for field, value in provider_update.dict(exclude_unset=True).items():
        setattr(provider, field, value)
    
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.delete('/providers/{provider_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_ai_provider(
    provider_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除供应商"""
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Provider not found')
    
    db.delete(provider)
    db.commit()
    return None


# ==================== 供应商测试接口 ====================

@router.post('/providers/{provider_id}/test/text')
def test_provider_text(
    provider_id: int,
    payload: TextTestRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """测试文本生成"""
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Provider not found')
    
    gateway = AIGateway(db)
    try:
        result = gateway.generate_text(payload.task_type or 'test', payload.prompt, payload.model_alias)
        return {'success': True, 'result': result}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post('/providers/{provider_id}/test/json')
def test_provider_json(
    provider_id: int,
    payload: JSONTestRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """测试JSON输出"""
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Provider not found')
    
    gateway = AIGateway(db)
    try:
        result = gateway.generate_json(payload.task_type or 'test', payload.prompt, payload.json_schema)
        return {'success': True, 'result': result}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post('/providers/{provider_id}/test/image')
def test_provider_image(
    provider_id: int,
    payload: ImageTestRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """测试图片分析"""
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Provider not found')
    
    gateway = AIGateway(db)
    try:
        result = gateway.analyze_images(payload.task_type or 'vision_test', payload.image_urls, payload.prompt)
        return {'success': True, 'result': result}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post('/providers/{provider_id}/test/audio')
def test_provider_audio(
    provider_id: int,
    payload: AudioTestRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """测试音频转写"""
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Provider not found')
    
    gateway = AIGateway(db)
    try:
        result = gateway.transcribe_audio(payload.audio_url)
        return {'success': True, 'result': result}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==================== 模型映射管理 ====================

@router.get('/models', response_model=List[AIModelRead])
def list_ai_models(
    task_type: Optional[str] = Query(None, description="Filter by task type"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取模型映射列表"""
    query = db.query(AIModel)
    if task_type:
        query = query.filter(AIModel.task_type == task_type)
    models = query.all()
    return models


@router.post('/models', response_model=AIModelRead, status_code=status.HTTP_201_CREATED)
def create_ai_model(
    model_in: AIModelCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """新增模型映射"""
    provider = db.query(AIProvider).filter(AIProvider.id == model_in.provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Provider not found')
    
    model = AIModel(**model_in.dict())
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


@router.delete('/models/{model_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_ai_model(
    model_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除模型映射"""
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Model not found')
    
    db.delete(model)
    db.commit()
    return None


# ==================== Prompt管理 ====================

@router.get('/prompts', response_model=List[AIPromptRead])
def list_ai_prompts(
    task_type: Optional[str] = Query(None, description="Filter by task type"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取Prompt列表"""
    query = db.query(AIPrompt)
    if task_type:
        query = query.filter(AIPrompt.task_type == task_type)
    prompts = query.order_by(AIPrompt.name, AIPrompt.version.desc()).all()
    return prompts


@router.post('/prompts', response_model=AIPromptRead, status_code=status.HTTP_201_CREATED)
def create_ai_prompt(
    prompt_in: AIPromptCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """新增Prompt版本"""
    prompt = AIPrompt(**prompt_in.dict())
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.delete('/prompts/{prompt_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_ai_prompt(
    prompt_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除Prompt"""
    prompt = db.query(AIPrompt).filter(AIPrompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Prompt not found')
    
    db.delete(prompt)
    db.commit()
    return None