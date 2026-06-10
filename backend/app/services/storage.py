"""
对象存储适配器
支持本地存储和阿里云OSS/S3兼容存储
"""
import os
import uuid
from pathlib import Path
from typing import Optional, BinaryIO
from abc import ABC, abstractmethod

from app.core.config import settings


class StorageAdapter(ABC):
    """存储适配器抽象基类"""
    
    @abstractmethod
    def upload_file(self, file_content: bytes, filename: str, content_type: str = "application/octet-stream") -> str:
        """上传文件并返回访问URL"""
        pass
    
    @abstractmethod
    def delete_file(self, file_url: str) -> bool:
        """删除文件"""
        pass
    
    @abstractmethod
    def get_file_url(self, file_key: str, expires_in: int = 3600) -> str:
        """获取文件访问URL（对于私有bucket生成签名URL）"""
        pass


class LocalStorageAdapter(StorageAdapter):
    """本地存储适配器"""
    
    def __init__(self, base_dir: str = "uploads"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def upload_file(self, file_content: bytes, filename: str, content_type: str = "application/octet-stream") -> str:
        # 生成唯一文件名
        ext = Path(filename).suffix
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = self.base_dir / unique_filename
        
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return f"/uploads/{unique_filename}"
    
    def delete_file(self, file_url: str) -> bool:
        try:
            filename = file_url.split('/')[-1]
            file_path = self.base_dir / filename
            if file_path.exists():
                file_path.unlink()
                return True
        except Exception as e:
            print(f"Error deleting file: {e}")
        return False
    
    def get_file_url(self, file_key: str, expires_in: int = 3600) -> str:
        # 本地存储直接返回路径
        if file_key.startswith('/'):
            return file_key
        return f"/uploads/{file_key}"


class OSSStorageAdapter(StorageAdapter):
    """阿里云OSS存储适配器"""
    
    def __init__(self):
        try:
            import oss2
            self.oss2 = oss2
            
            auth = oss2.Auth(settings.OSS_ACCESS_KEY_ID, settings.OSS_ACCESS_KEY_SECRET)
            self.bucket = oss2.Bucket(auth, settings.OSS_ENDPOINT, settings.OSS_BUCKET)
        except ImportError:
            raise ImportError("Please install oss2: pip install oss2")
    
    def upload_file(self, file_content: bytes, filename: str, content_type: str = "application/octet-stream") -> str:
        # 生成唯一文件名
        ext = Path(filename).suffix
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        # 上传到OSS
        self.bucket.put_object(unique_filename, file_content, headers={'Content-Type': content_type})
        
        # 返回公开访问URL
        return f"https://{settings.OSS_BUCKET}.{settings.OSS_ENDPOINT}/{unique_filename}"
    
    def delete_file(self, file_url: str) -> bool:
        try:
            filename = file_url.split('/')[-1]
            self.bucket.delete_object(filename)
            return True
        except Exception as e:
            print(f"Error deleting file from OSS: {e}")
            return False
    
    def get_file_url(self, file_key: str, expires_in: int = 3600) -> str:
        # 生成签名URL
        return self.bucket.sign_url('GET', file_key, expires_in)


def get_storage_adapter() -> StorageAdapter:
    """
    根据配置返回合适的存储适配器
    如果配置了OSS则使用OSS，否则使用本地存储
    """
    if settings.OSS_ACCESS_KEY_ID and settings.OSS_ACCESS_KEY_ID != "your_access_key":
        try:
            return OSSStorageAdapter()
        except Exception as e:
            print(f"Failed to initialize OSS adapter: {e}, falling back to local storage")
    
    return LocalStorageAdapter()


# 全局存储适配器实例
storage = get_storage_adapter()
