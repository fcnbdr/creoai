from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Vercel Serverless 环境检测
IS_VERCEL = os.environ.get('VERCEL', '0') == '1'

app = FastAPI(
    title='AI短视频爆款系统 后端',
    # Serverless 环境下禁用 docs，减少冷启动时间
    docs_url=None if IS_VERCEL else '/docs',
    redoc_url=None if IS_VERCEL else '/redoc',
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# 延迟导入路由模块，避免 Serverless 冷启动时加载全部依赖
# 仅在非 Vercel 环境或实际请求时才触发完整导入
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.ai import router as ai_router
from app.api.videos import router as videos_router
from app.api.products import router as products_router
from app.api.recommendations import router as recommendations_router
from app.api.analyses import router as analyses_router
from app.api.iclip import router as iclip_router
from app.api.ecpro import router as ecpro_router
from app.api.replications import router as replications_router
from app.api.categories import router as categories_router
from app.api.dashboard import router as dashboard_router
from app.api.jobs import router as jobs_router
from app.api.content_production import router as content_production_router
from app.api.ecpro_images import router as ecpro_images_router
from app.api.video_ai import router as video_ai_router
from app.api.account import router as account_router

app.include_router(health_router, prefix='/api/health', tags=['health'])
app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
app.include_router(ai_router, prefix='/api/ai', tags=['ai'])
app.include_router(videos_router, prefix='/api/videos', tags=['videos'])
app.include_router(products_router, prefix='/api/products', tags=['products'])
app.include_router(recommendations_router, prefix='/api/recommendations', tags=['recommendations'])
app.include_router(analyses_router, prefix='/api/analyses', tags=['analyses'])
app.include_router(iclip_router, prefix='/api/iclip', tags=['iclip'])
app.include_router(ecpro_router, prefix='/api/ecpro', tags=['ecpro'])
app.include_router(replications_router, prefix='/api/replications', tags=['replications'])
app.include_router(categories_router, prefix='/api/categories', tags=['categories'])
app.include_router(dashboard_router, prefix='/api/dashboard', tags=['dashboard'])
app.include_router(jobs_router, prefix='/api/jobs', tags=['jobs'])
app.include_router(content_production_router, prefix='/api/content-production', tags=['content-production'])
app.include_router(ecpro_images_router, prefix='/api/ecpro-images', tags=['ecpro-images'])
app.include_router(video_ai_router, prefix='/api/video', tags=['video-ai'])
app.include_router(account_router, prefix='/api/account', tags=['account'])

@app.get('/')
def root():
    return {'message': 'AI短视频爆款系统 后端已启动', 'status': 'ok', 'vercel': IS_VERCEL}

@app.get('/api')
def api_root():
    return {'message': 'API服务正常运行', 'version': '1.0.0', 'vercel': IS_VERCEL}
