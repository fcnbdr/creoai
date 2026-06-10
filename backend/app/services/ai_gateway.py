"""
AI网关 - 统一管理所有AI服务调用
支持多Provider切换、失败重试、成本统计
"""
import time
import json
from typing import Any, Dict, List, Optional
from datetime import datetime

from sqlalchemy.orm import Session

from app.models import AIProvider, AICall
from app.services.providers import BaseProvider, MockDeepSeekProvider, MockECProProvider, MockIClipProvider
from app.core.config import settings


class AIGateway:
    def __init__(self, db: Session):
        self.db = db
        self.providers = self.load_providers()

    def load_providers(self) -> List[BaseProvider]:
        """从数据库加载启用的Provider"""
        records = self.db.query(AIProvider).filter(
            # 这里可以根据需要添加enabled字段过滤
        ).order_by(AIProvider.priority.asc()).all()
        
        providers = []
        for record in records:
            provider = self._build_provider(record)
            if provider:
                providers.append(provider)
        
        # 如果没有配置的Provider，使用Mock
        if not providers:
            providers = [
                MockDeepSeekProvider(name='DeepSeek Mock', priority=1),
                MockECProProvider(name='ECPro Mock', priority=2),
                MockIClipProvider(name='iClip Mock', priority=3),
            ]
        
        return providers

    def _build_provider(self, record: AIProvider) -> Optional[BaseProvider]:
        """根据配置构建Provider实例"""
        from app.services.providers import DeepSeekProvider, RealECProProvider, RealIClipProvider
        
        name_lower = (record.name or '').lower()
        
        # 根据名称选择Provider类型
        if 'deepseek' in name_lower:
            return DeepSeekProvider(
                name=record.name,
                base_url=record.base_url,
                api_key=record.api_key_encrypted,
                priority=record.priority
            )
        elif 'ecpro' in name_lower:
            # 如果有API Key则使用Real Provider，否则使用Mock
            if record.api_key_encrypted:
                return RealECProProvider(
                    name=record.name,
                    base_url=record.base_url,
                    api_key=record.api_key_encrypted,
                    priority=record.priority
                )
            else:
                return MockECProProvider(
                    name=record.name,
                    base_url=record.base_url,
                    api_key=record.api_key_encrypted,
                    priority=record.priority
                )
        elif 'iclip' in name_lower:
            # 如果有API Key则使用Real Provider，否则使用Mock
            if record.api_key_encrypted:
                return RealIClipProvider(
                    name=record.name,
                    base_url=record.base_url,
                    api_key=record.api_key_encrypted,
                    priority=record.priority
                )
            else:
                return MockIClipProvider(
                    name=record.name,
                    base_url=record.base_url,
                    api_key=record.api_key_encrypted,
                    priority=record.priority
                )
        else:
            # 默认使用DeepSeek
            return DeepSeekProvider(
                name=record.name,
                base_url=record.base_url,
                api_key=record.api_key_encrypted,
                priority=record.priority
            )

    def _select_provider(self, task_type: str, model_alias: Optional[str] = None) -> BaseProvider:
        """选择合适的Provider"""
        # 如果指定了model_alias，优先匹配
        if model_alias:
            alias_lower = model_alias.lower()
            matches = [p for p in self.providers if alias_lower in p.name.lower()]
            if matches:
                return sorted(matches, key=lambda p: p.priority)[0]

        # 根据任务类型选择支持的Provider
        supported = [
            p for p in sorted(self.providers, key=lambda p: p.priority)
            if self._supports_task(p, task_type)
        ]
        
        return supported[0] if supported else self.providers[0]

    def _supports_task(self, provider: BaseProvider, task_type: str) -> bool:
        """判断Provider是否支持该任务类型"""
        task = task_type.lower()
        
        if 'ecpro' in task or 'detail' in task:
            return provider.supports_detail_page
        elif 'iclip' in task or 'video' in task or 'micro' in task:
            return provider.supports_image_to_video
        elif 'audio' in task or 'transcribe' in task:
            return provider.supports_audio
        elif 'image' in task or 'vision' in task:
            return provider.supports_vision
        else:
            return provider.supports_text

    def _log_call(self, task_type: str, provider: BaseProvider, model: str, 
                  tokens: Optional[int], cost: Optional[float], 
                  status: str, error_message: Optional[str], latency_ms: int):
        """记录AI调用日志"""
        try:
            ai_call = AICall(
                task_type=task_type,
                provider_id=None,  # TODO: 从provider获取ID
                model=model,
                tokens=tokens,
                cost_estimate=f"{cost:.4f}" if cost else None,
                status=status,
                error_message=error_message,
                latency_ms=latency_ms,
            )
            self.db.add(ai_call)
            self.db.commit()
        except Exception as e:
            print(f"Failed to log AI call: {e}")
            self.db.rollback()

    def _estimate_cost(self, provider_name: str, model: str, tokens: int) -> float:
        """估算调用成本（简化版）"""
        # DeepSeek pricing (示例)
        if 'deepseek' in provider_name.lower():
            return tokens * 0.000002  # $0.002 per 1K tokens
        
        # ECPro/iClip按次计费
        elif 'ecpro' in provider_name.lower():
            return 0.1  # 每次调用0.1元
        
        elif 'iclip' in provider_name.lower():
            return 0.5  # 每次调用0.5元
        
        return 0.0

    def _retry_with_fallback(self, func, task_type: str, *args, **kwargs):
        """带重试和降级的调用 - 支持指数退避和Provider自动切换"""
        import time as time_module
        
        max_retries = 3
        last_error = None
        attempted_providers = set()
        
        for attempt in range(max_retries):
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                last_error = e
                print(f"Attempt {attempt + 1} failed for task '{task_type}': {e}")
                
                # 记录当前provider为已尝试
                current_provider = self._select_provider(task_type, kwargs.get('model_alias'))
                attempted_providers.add(current_provider.name)
                
                # 如果不是最后一次尝试，切换到备用Provider
                if attempt < max_retries - 1:
                    # 指数退避等待 (1s, 2s, 4s)
                    wait_time = (2 ** attempt) * 1
                    print(f"Waiting {wait_time}s before retry...")
                    time_module.sleep(wait_time)
                    
                    # 尝试切换到未使用过的Provider
                    backup_provider = self._get_backup_provider(task_type, attempted_providers)
                    if backup_provider:
                        print(f"Switching to backup provider: {backup_provider.name}")
                        # 临时替换providers列表
                        original_providers = self.providers.copy()
                        self.providers = [backup_provider] + [p for p in original_providers if p != backup_provider]
        
        # 所有重试失败，抛出最后错误
        raise last_error
    
    def _get_backup_provider(self, task_type: str, excluded_names: set) -> Optional['BaseProvider']:
        """获取备用Provider（排除已尝试的）"""
        supported = [
            p for p in sorted(self.providers, key=lambda p: p.priority)
            if self._supports_task(p, task_type) and p.name not in excluded_names
        ]
        return supported[0] if supported else None

    # ==================== 文本能力 ====================
    
    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        """生成文本 - 带重试机制"""
        start_time = time.time()
        
        def _call():
            provider = self._select_provider(task_type, model_alias)
            return provider.generate_text(task_type, prompt, model_alias), provider
        
        try:
            result, provider = self._retry_with_fallback(_call, task_type)
            latency = int((time.time() - start_time) * 1000)
            
            # 估算token数（简化）
            tokens = len(prompt.split()) + len(result.split())
            cost = self._estimate_cost(provider.name, model_alias or 'default', tokens)
            
            self._log_call(
                task_type=task_type,
                provider=provider,
                model=model_alias or 'default',
                tokens=tokens,
                cost=cost,
                status='success',
                error_message=None,
                latency_ms=latency
            )
            
            return result
            
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            provider = self._select_provider(task_type, model_alias)
            self._log_call(
                task_type=task_type,
                provider=provider,
                model=model_alias or 'default',
                tokens=None,
                cost=None,
                status='failed',
                error_message=str(e),
                latency_ms=latency
            )
            raise

    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        """生成JSON格式数据 - 带重试机制"""
        start_time = time.time()
        
        def _call():
            provider = self._select_provider(task_type, None)
            return provider.generate_json(task_type, prompt, json_schema), provider
        
        try:
            result, provider = self._retry_with_fallback(_call, task_type)
            latency = int((time.time() - start_time) * 1000)
            
            tokens = len(prompt.split()) + len(json.dumps(result).split())
            cost = self._estimate_cost(provider.name, 'json', tokens)
            
            self._log_call(
                task_type=task_type,
                provider=provider,
                model='json',
                tokens=tokens,
                cost=cost,
                status='success',
                error_message=None,
                latency_ms=latency
            )
            
            return result
            
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            provider = self._select_provider(task_type, None)
            self._log_call(
                task_type=task_type,
                provider=provider,
                model='json',
                tokens=None,
                cost=None,
                status='failed',
                error_message=str(e),
                latency_ms=latency
            )
            raise

    # ==================== 多模态能力 ====================
    
    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        """分析图片 - 带重试机制"""
        start_time = time.time()
        
        def _call():
            provider = self._select_provider(task_type, None)
            return provider.analyze_images(task_type, image_urls, prompt), provider
        
        try:
            result, provider = self._retry_with_fallback(_call, task_type)
            latency = int((time.time() - start_time) * 1000)
            
            cost = self._estimate_cost(provider.name, 'vision', len(image_urls))
            
            self._log_call(
                task_type=task_type,
                provider=provider,
                model='vision',
                tokens=len(image_urls),
                cost=cost,
                status='success',
                error_message=None,
                latency_ms=latency
            )
            
            return result
            
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            provider = self._select_provider(task_type, None)
            self._log_call(
                task_type=task_type,
                provider=provider,
                model='vision',
                tokens=None,
                cost=None,
                status='failed',
                error_message=str(e),
                latency_ms=latency
            )
            raise

    def transcribe_audio(self, audio_url: str) -> str:
        """音频转写 - 带重试机制"""
        start_time = time.time()
        
        def _call():
            provider = self._select_provider('audio_transcription', None)
            return provider.transcribe_audio(audio_url), provider
        
        try:
            result, provider = self._retry_with_fallback(_call, 'audio_transcription')
            latency = int((time.time() - start_time) * 1000)
            
            cost = self._estimate_cost(provider.name, 'audio', 1)
            
            self._log_call(
                task_type='audio_transcription',
                provider=provider,
                model='audio',
                tokens=None,
                cost=cost,
                status='success',
                error_message=None,
                latency_ms=latency
            )
            
            return result
            
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            provider = self._select_provider('audio_transcription', None)
            self._log_call(
                task_type='audio_transcription',
                provider=provider,
                model='audio',
                tokens=None,
                cost=None,
                status='failed',
                error_message=str(e),
                latency_ms=latency
            )
            raise

    def create_embedding(self, text: str) -> List[float]:
        """生成向量嵌入（预留接口）"""
        # TODO: 实现embedding功能
        raise NotImplementedError("Embedding not implemented yet")

    # ==================== ECPro能力 ====================
    
    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        """生成ECPro详情页 - 带重试机制"""
        start_time = time.time()
        
        def _call():
            provider = self._select_provider('ecpro_detail_page', None)
            return provider.ecpro_generate_detail_page(product_id, template_id, platforms), provider
        
        try:
            result, provider = self._retry_with_fallback(_call, 'ecpro_detail_page')
            latency = int((time.time() - start_time) * 1000)
            
            cost = self._estimate_cost(provider.name, 'detail_page', 1)
            
            self._log_call(
                task_type='ecpro_detail_page',
                provider=provider,
                model='detail_page',
                tokens=None,
                cost=cost,
                status='success',
                error_message=None,
                latency_ms=latency
            )
            
            return result
            
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            provider = self._select_provider('ecpro_detail_page', None)
            self._log_call(
                task_type='ecpro_detail_page',
                provider=provider,
                model='detail_page',
                tokens=None,
                cost=None,
                status='failed',
                error_message=str(e),
                latency_ms=latency
            )
            raise

    def smart_crop_image(self, image_url: str) -> str:
        """智能抠图（预留）"""
        # TODO: 实现智能抠图
        return image_url

    def auto_fill_attributes(self, product_id: int, platform: str) -> dict:
        """自动填充商品属性（预留）"""
        # TODO: 实现属性填充
        return {}

    def cross_platform_publish(self, content_id: int, shops: List[dict]) -> dict:
        """跨平台发布（预留）"""
        # TODO: 实现跨平台发布
        return {'status': 'pending'}

    # ==================== iClip能力 ====================
    
    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        """生成视频 - 带重试机制"""
        start_time = time.time()
        
        def _call():
            provider = self._select_provider('iclip_generate_video', None)
            return provider.iclip_generate_video(images, script, duration), provider
        
        try:
            result, provider = self._retry_with_fallback(_call, 'iclip_generate_video')
            latency = int((time.time() - start_time) * 1000)
            
            cost = result.get('token_cost', 0) or self._estimate_cost(provider.name, 'video', 1)
            
            self._log_call(
                task_type='iclip_generate_video',
                provider=provider,
                model='video',
                tokens=None,
                cost=cost,
                status='success',
                error_message=None,
                latency_ms=latency
            )
            
            return result
            
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            provider = self._select_provider('iclip_generate_video', None)
            self._log_call(
                task_type='iclip_generate_video',
                provider=provider,
                model='video',
                tokens=None,
                cost=None,
                status='failed',
                error_message=str(e),
                latency_ms=latency
            )
            raise

    def iclip_get_token_quota(self) -> dict:
        """查询iClip积分余额（预留）"""
        # TODO: 实现积分查询
        return {'total_quota': 0, 'used_quota': 0, 'remaining': 0}
