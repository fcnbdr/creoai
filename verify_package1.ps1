# 任务包1验收测试脚本 (Windows PowerShell版本)
# 验证项目骨架与基础设施是否完整就绪

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "任务包1：项目骨架与基础设施 - 验收测试" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 测试计数
$PASS = 0
$FAIL = 0

# 测试函数
function Test-Check {
    param(
        [string]$TestName,
        [scriptblock]$Condition
    )
    
    Write-Host "测试: $TestName ... " -NoNewline
    
    try {
        if (& $Condition) {
            Write-Host "✓ 通过" -ForegroundColor Green
            $script:PASS++
        } else {
            Write-Host "✗ 失败" -ForegroundColor Red
            $script:FAIL++
        }
    } catch {
        Write-Host "✗ 失败" -ForegroundColor Red
        $script:FAIL++
    }
}

Write-Host "1. 检查文件结构" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Test-Check "backend目录存在" { Test-Path "backend" }
Test-Check "frontend目录存在" { Test-Path "frontend" }
Test-Check "docker-compose.yml存在" { Test-Path "docker-compose.yml" }
Test-Check ".env.example存在" { Test-Path ".env.example" }
Test-Check "README.md存在" { Test-Path "README.md" }
Test-Check "README_DEPLOY.md存在" { Test-Path "README_DEPLOY.md" }
Test-Check "nginx.conf存在" { Test-Path "nginx.conf" }
Test-Check ".gitignore存在" { Test-Path ".gitignore" }
Write-Host ""

Write-Host "2. 检查后端核心文件" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Test-Check "backend/app/main.py存在" { Test-Path "backend/app/main.py" }
Test-Check "backend/app/models.py存在" { Test-Path "backend/app/models.py" }
Test-Check "backend/requirements.txt存在" { Test-Path "backend/requirements.txt" }
Test-Check "backend/Dockerfile存在" { Test-Path "backend/Dockerfile" }
Test-Check "Alembic配置存在" { Test-Path "backend/alembic.ini" }
Test-Check "初始迁移文件存在" { Test-Path "backend/alembic/versions/0001_initial.py" }
Test-Check "第二迁移文件存在" { Test-Path "backend/alembic/versions/0002_add_missing_tables.py" }
Write-Host ""

Write-Host "3. 检查后端模块" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Test-Check "core/config.py存在" { Test-Path "backend/app/core/config.py" }
Test-Check "core/initial_data.py存在" { Test-Path "backend/app/core/initial_data.py" }
Test-Check "core/seed_data.py存在" { Test-Path "backend/app/core/seed_data.py" }
Test-Check "services/storage.py存在" { Test-Path "backend/app/services/storage.py" }
Test-Check "services/video_processing.py存在" { Test-Path "backend/app/services/video_processing.py" }
Test-Check "tasks/__init__.py存在" { Test-Path "backend/app/tasks/__init__.py" }
Test-Check "tasks/video_tasks.py存在" { Test-Path "backend/app/tasks/video_tasks.py" }
Test-Check "tasks/ai_tasks.py存在" { Test-Path "backend/app/tasks/ai_tasks.py" }
Write-Host ""

Write-Host "4. 检查数据模型完整性" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Test-Check "User模型存在" { (Get-Content "backend/app/models.py") -match "class User" }
Test-Check "Category模型存在" { (Get-Content "backend/app/models.py") -match "class Category" }
Test-Check "ProductProfile模型存在" { (Get-Content "backend/app/models.py") -match "class ProductProfile" }
Test-Check "Video模型存在" { (Get-Content "backend/app/models.py") -match "class Video" }
Test-Check "AIProvider模型存在" { (Get-Content "backend/app/models.py") -match "class AIProvider" }
Test-Check "AIModel模型存在" { (Get-Content "backend/app/models.py") -match "class AIModel" }
Test-Check "AIPrompt模型存在" { (Get-Content "backend/app/models.py") -match "class AIPrompt" }
Test-Check "ECProTemplate模型存在" { (Get-Content "backend/app/models.py") -match "class ECProTemplate" }
Test-Check "VideoTemplate模型存在" { (Get-Content "backend/app/models.py") -match "class VideoTemplate" }
Test-Check "CostLimit模型存在" { (Get-Content "backend/app/models.py") -match "class CostLimit" }
Test-Check "CrawlJob模型存在" { (Get-Content "backend/app/models.py") -match "class CrawlJob" }
Test-Check "JobLog模型存在" { (Get-Content "backend/app/models.py") -match "class JobLog" }
Write-Host ""

Write-Host "5. 检查Docker配置" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Test-Check "PostgreSQL服务配置" { (Get-Content "docker-compose.yml") -match "postgres:" }
Test-Check "Redis服务配置" { (Get-Content "docker-compose.yml") -match "redis:" }
Test-Check "Backend服务配置" { (Get-Content "docker-compose.yml") -match "backend:" }
Test-Check "Frontend服务配置" { (Get-Content "docker-compose.yml") -match "frontend:" }
Test-Check "Celery Worker配置" { (Get-Content "docker-compose.yml") -match "celery_worker:" }
Test-Check "Celery Beat配置" { (Get-Content "docker-compose.yml") -match "celery_beat:" }
Test-Check "健康检查配置" { (Get-Content "docker-compose.yml") -match "healthcheck:" }
Write-Host ""

Write-Host "6. 检查环境变量配置" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Test-Check "DATABASE_URL配置" { (Get-Content ".env.example") -match "DATABASE_URL" }
Test-Check "REDIS_URL配置" { (Get-Content ".env.example") -match "REDIS_URL" }
Test-Check "JWT_SECRET_KEY配置" { (Get-Content ".env.example") -match "JWT_SECRET_KEY" }
Test-Check "DEEPSEEK_API_KEY配置" { (Get-Content ".env.example") -match "DEEPSEEK_API_KEY" }
Test-Check "OSS配置" { (Get-Content ".env.example") -match "OSS_ACCESS_KEY_ID" }
Test-Check "ECPRO配置" { (Get-Content ".env.example") -match "ECPRO_API_KEY" }
Test-Check "ICLIP配置" { (Get-Content ".env.example") -match "ICLIP_API_KEY" }
Write-Host ""

Write-Host "7. 检查Python依赖" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Test-Check "FastAPI依赖" { (Get-Content "backend/requirements.txt") -match "fastapi" }
Test-Check "SQLAlchemy依赖" { (Get-Content "backend/requirements.txt") -match "sqlalchemy" }
Test-Check "Celery依赖" { (Get-Content "backend/requirements.txt") -match "celery" }
Test-Check "Redis依赖" { (Get-Content "backend/requirements.txt") -match "redis" }
Test-Check "FFmpeg依赖" { (Get-Content "backend/requirements.txt") -match "ffmpeg-python" }
Test-Check "Alembic依赖" { (Get-Content "backend/requirements.txt") -match "alembic" }
Test-Check "OSS2依赖" { (Get-Content "backend/requirements.txt") -match "oss2" }
Test-Check "Pydantic Settings依赖" { (Get-Content "backend/requirements.txt") -match "pydantic-settings" }
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "测试结果汇总" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "通过: $PASS" -ForegroundColor Green
Write-Host "失败: $FAIL" -ForegroundColor Red
Write-Host "总计: $($PASS + $FAIL)" -ForegroundColor White
Write-Host ""

if ($FAIL -eq 0) {
    Write-Host "✅ 所有测试通过！任务包1验收成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor Yellow
    Write-Host "1. 复制环境变量: Copy-Item .env.example .env"
    Write-Host "2. 编辑 .env 文件，配置必要的API密钥"
    Write-Host "3. 启动服务: docker-compose up --build"
    Write-Host "4. 访问前端: http://localhost:3000"
    Write-Host "5. 访问API文档: http://localhost:8000/docs"
    exit 0
} else {
    Write-Host "❌ 有$FAIL个测试失败，请检查并修复问题" -ForegroundColor Red
    exit 1
}
