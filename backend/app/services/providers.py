"""
AI Provider适配器
支持多种AI服务提供商
"""
import json
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings


class BaseProvider(ABC):
    """AI Provider抽象基类"""
    
    def __init__(self, name: str, base_url: Optional[str] = None, 
                 api_key: Optional[str] = None, priority: int = 10):
        self.name = name
        self.base_url = base_url or ''
        self.api_key = api_key
        self.priority = priority

    # 能力标识
    supports_text = False
    supports_vision = False
    supports_audio = False
    supports_image_to_video = False
    supports_detail_page = False

    @abstractmethod
    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        """生成文本"""
        raise NotImplementedError

    @abstractmethod
    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        """生成JSON格式数据"""
        raise NotImplementedError

    @abstractmethod
    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        """分析图片"""
        raise NotImplementedError

    @abstractmethod
    def transcribe_audio(self, audio_url: str) -> str:
        """音频转写"""
        raise NotImplementedError

    @abstractmethod
    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        """ECPro详情页生成"""
        raise NotImplementedError

    @abstractmethod
    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        """iClip视频生成"""
        raise NotImplementedError


class DeepSeekProvider(BaseProvider):
    """DeepSeek API Provider"""
    
    supports_text = True
    supports_vision = True
    supports_audio = False  # DeepSeek暂不支持音频
    
    def __init__(self, name: str = "DeepSeek", base_url: str = None, 
                 api_key: str = None, priority: int = 1):
        super().__init__(name, base_url or settings.deepseek_base_url, 
                        api_key or settings.deepseek_api_key, priority)
        self.model = settings.deepseek_model

    def _create_client(self) -> httpx.Client:
        """创建HTTP客户端"""
        return httpx.Client(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            timeout=60.0
        )

    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        """调用DeepSeek生成文本"""
        if not self.api_key:
            raise ValueError("DeepSeek API key not configured")
        
        with self._create_client() as client:
            response = client.post(
                "/chat/completions",
                json={
                    "model": model_alias or self.model,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                }
            )
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content']

    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        """调用DeepSeek生成JSON"""
        if not self.api_key:
            raise ValueError("DeepSeek API key not configured")
        
        # 在prompt中强调JSON格式
        json_prompt = f"""{prompt}

请严格按照以下JSON Schema格式输出，只返回JSON对象，不要包含其他文字：
{json.dumps(json_schema, ensure_ascii=False, indent=2)}
"""
        
        with self._create_client() as client:
            response = client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "你是一个JSON输出助手，只返回有效的JSON格式。"},
                        {"role": "user", "content": json_prompt}
                    ],
                    "temperature": 0.3,  # 降低温度以提高JSON格式准确性
                    "max_tokens": 2000,
                }
            )
            response.raise_for_status()
            data = response.json()
            content = data['choices'][0]['message']['content']
            
            # 尝试解析JSON
            try:
                # 清理可能的markdown代码块标记
                content = content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.endswith('```'):
                    content = content[:-3]
                content = content.strip()
                
                return json.loads(content)
            except json.JSONDecodeError as e:
                raise ValueError(f"Failed to parse JSON response: {e}\nResponse: {content}")

    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        """调用DeepSeek进行图片分析（如果支持视觉）"""
        if not self.api_key:
            raise ValueError("DeepSeek API key not configured")
        
        # 构建消息，包含图片URL
        messages = [{"role": "user", "content": prompt}]
        
        # 添加图片（DeepSeek Vision支持）
        for url in image_urls:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": url}}
                ]
            })
        
        with self._create_client() as client:
            response = client.post(
                "/chat/completions",
                json={
                    "model": "deepseek-chat",  # 或使用vision模型
                    "messages": messages,
                    "temperature": 0.5,
                    "max_tokens": 2000,
                }
            )
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content']

    def transcribe_audio(self, audio_url: str) -> str:
        """音频转写（DeepSeek暂不支持，抛出异常）"""
        raise NotImplementedError("DeepSeek does not support audio transcription")

    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        """ECPro详情页生成（不支持）"""
        raise NotImplementedError("DeepSeek does not support ECPro detail page generation")

    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        """视频生成（不支持）"""
        raise NotImplementedError("DeepSeek does not support video generation")


class MockDeepSeekProvider(BaseProvider):
    """Mock DeepSeek Provider（用于测试和开发）"""
    
    supports_text = True
    supports_vision = True
    supports_audio = True

    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        return f'[Mock DeepSeek] Generated text for task "{task_type}":\n\n{prompt[:50]}...'

    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "mock": True,
            "task_type": task_type,
            "prompt_preview": prompt[:50],
            "schema_keys": list(json_schema.keys()) if isinstance(json_schema, dict) else []
        }

    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        return f'[Mock DeepSeek] Analyzed {len(image_urls)} image(s):\n{prompt[:50]}...'

    def transcribe_audio(self, audio_url: str) -> str:
        return f"[Mock DeepSeek] Transcribed audio from: {audio_url}\n\n这是模拟的音频转写文本..."

    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        return {
            'status': 'mocked',
            'product_id': product_id,
            'template_id': template_id,
            'platforms': platforms,
            'content_url': f'/mock/ecpro/{product_id}'
        }

    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        return {
            'video_url': '/mock/video.mp4',
            'duration': duration,
            'token_cost': 0,
            'status': 'completed'
        }


class MockECProProvider(BaseProvider):
    """Mock ECPro Provider"""
    
    supports_detail_page = True

    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        return f'[Mock ECPro] Text fallback for {task_type}'

    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        return {'ecpro_mock': True, 'task_type': task_type}

    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        return '[Mock ECPro] Image analysis result.'

    def transcribe_audio(self, audio_url: str) -> str:
        return '[Mock ECPro] Audio transcription.'

    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        return {
            'content_id': f'ecpro-{product_id}-{template_id}',
            'status': 'generated',
            'platforms': platforms,
            'preview_url': f'/mock/ecpro/preview/{product_id}'
        }

    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        return {
            'video_url': '/mock/ecpro_video.mp4',
            'duration': duration,
            'cost': 0
        }


class MockIClipProvider(BaseProvider):
    """Mock iClip Provider"""
    
    supports_image_to_video = True

    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        return f'[Mock iClip] Text for {task_type}'

    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        return {'iclip_mock': True, 'task_type': task_type}

    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        return '[Mock iClip] Image analysis result.'

    def transcribe_audio(self, audio_url: str) -> str:
        return '[Mock iClip] Audio transcription.'

    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        return {'status': 'iclip-fallback', 'product_id': product_id}

    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        return {
            'video_url': '/mock/iclip_video.mp4',
            'duration': duration,
            'token_cost': 15,
            'status': 'completed'
        }


class RealECProProvider(BaseProvider):
    """真实ECPro API Provider"""
    
    supports_detail_page = True
    supports_text = True
    
    def __init__(self, name: str = "ECPro", base_url: str = None, 
                 api_key: str = None, priority: int = 2):
        from app.core.config import settings
        super().__init__(name, base_url or settings.ecpro_api_base_url, 
                        api_key or settings.ecpro_api_key, priority)

    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        """ECPro文本生成（降级使用DeepSeek）"""
        raise NotImplementedError("ECPro does not support text generation directly")

    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        """ECPro JSON生成（降级使用DeepSeek）"""
        raise NotImplementedError("ECPro does not support JSON generation directly")

    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        """ECPro图片分析"""
        raise NotImplementedError("ECPro does not support image analysis directly")

    def transcribe_audio(self, audio_url: str) -> str:
        """ECPro音频转写（不支持）"""
        raise NotImplementedError("ECPro does not support audio transcription")

    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        """调用ECPro API生成详情页"""
        if not self.api_key:
            raise ValueError("ECPro API key not configured")
        
        with httpx.Client(timeout=120.0) as client:
            response = client.post(
                f"{self.base_url}/generate-detail-page",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "product_id": product_id,
                    "template_id": template_id,
                    "platforms": platforms,
                }
            )
            response.raise_for_status()
            return response.json()

    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        """ECPro视频生成（不支持，交给iClip）"""
        raise NotImplementedError("ECPro does not support video generation")


class RealIClipProvider(BaseProvider):
    """真实iClip API Provider"""
    
    supports_image_to_video = True
    supports_text = True
    
    def __init__(self, name: str = "iClip", base_url: str = None, 
                 api_key: str = None, priority: int = 3):
        from app.core.config import settings
        super().__init__(name, base_url or settings.iclip_api_base_url, 
                        api_key or settings.iclip_api_key, priority)

    def generate_text(self, task_type: str, prompt: str, model_alias: str = None) -> str:
        """iClip文本生成（降级使用DeepSeek）"""
        raise NotImplementedError("iClip does not support text generation directly")

    def generate_json(self, task_type: str, prompt: str, json_schema: Dict[str, Any]) -> Dict[str, Any]:
        """iClip JSON生成（降级使用DeepSeek）"""
        raise NotImplementedError("iClip does not support JSON generation directly")

    def analyze_images(self, task_type: str, image_urls: List[str], prompt: str) -> str:
        """iClip图片分析"""
        raise NotImplementedError("iClip does not support image analysis directly")

    def transcribe_audio(self, audio_url: str) -> str:
        """iClip音频转写（不支持）"""
        raise NotImplementedError("iClip does not support audio transcription")

    def ecpro_generate_detail_page(self, product_id: int, template_id: int, platforms: List[str]) -> Dict[str, Any]:
        """iClip详情页生成（不支持，交给ECPro）"""
        raise NotImplementedError("iClip does not support detail page generation")

    def iclip_generate_video(self, images: List[str], script: str, duration: int) -> Dict[str, Any]:
        """调用iClip API生成视频"""
        if not self.api_key:
            raise ValueError("iClip API key not configured")
        
        with httpx.Client(timeout=180.0) as client:
            response = client.post(
                f"{self.base_url}/generate-video",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "images": images,
                    "script": script,
                    "duration": duration,
                }
            )
            response.raise_for_status()
            result = response.json()
            
            # 扣减积分
            token_cost = result.get('token_cost', 0)
            if token_cost > 0:
                self._deduct_token_quota(token_cost)
            
            return result
    
    def get_token_quota(self, user_id: int) -> Dict[str, Any]:
        """查询iClip积分余额"""
        if not self.api_key:
            raise ValueError("iClip API key not configured")
        
        with httpx.Client(timeout=30.0) as client:
            response = client.get(
                f"{self.base_url}/quota/{user_id}",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                }
            )
            response.raise_for_status()
            return response.json()
    
    def _deduct_token_quota(self, cost: int):
        """扣减积分（内部方法，实际应由后端数据库管理）"""
        # TODO: 实现积分扣减逻辑
        pass
