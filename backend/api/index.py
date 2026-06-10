"""Vercel Serverless 入口文件，将 FastAPI app 导出为 ASGI handler"""
import sys
import os

# 确保 backend 目录在 Python path 中
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app

# Vercel Python runtime 会查找名为 'app' 的变量作为 ASGI application
# FastAPI app 本身就是 ASGI compatible
