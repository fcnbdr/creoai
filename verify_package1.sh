#!/bin/bash
# 任务包1验收测试脚本
# 验证项目骨架与基础设施是否完整就绪

echo "========================================="
echo "任务包1：项目骨架与基础设施 - 验收测试"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
PASS=0
FAIL=0

# 测试函数
test_check() {
    local test_name=$1
    local command=$2
    
    echo -n "测试: $test_name ... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ 失败${NC}"
        ((FAIL++))
    fi
}

echo "1. 检查文件结构"
echo "-------------------"
test_check "backend目录存在" "[ -d 'backend' ]"
test_check "frontend目录存在" "[ -d 'frontend' ]"
test_check "docker-compose.yml存在" "[ -f 'docker-compose.yml' ]"
test_check ".env.example存在" "[ -f '.env.example' ]"
test_check "README.md存在" "[ -f 'README.md' ]"
test_check "README_DEPLOY.md存在" "[ -f 'README_DEPLOY.md' ]"
test_check "nginx.conf存在" "[ -f 'nginx.conf' ]"
test_check ".gitignore存在" "[ -f '.gitignore' ]"
echo ""

echo "2. 检查后端核心文件"
echo "-------------------"
test_check "backend/app/main.py存在" "[ -f 'backend/app/main.py' ]"
test_check "backend/app/models.py存在" "[ -f 'backend/app/models.py' ]"
test_check "backend/requirements.txt存在" "[ -f 'backend/requirements.txt' ]"
test_check "backend/Dockerfile存在" "[ -f 'backend/Dockerfile' ]"
test_check "Alembic配置存在" "[ -f 'backend/alembic.ini' ]"
test_check "初始迁移文件存在" "[ -f 'backend/alembic/versions/0001_initial.py' ]"
test_check "第二迁移文件存在" "[ -f 'backend/alembic/versions/0002_add_missing_tables.py' ]"
echo ""

echo "3. 检查后端模块"
echo "-------------------"
test_check "core/config.py存在" "[ -f 'backend/app/core/config.py' ]"
test_check "core/initial_data.py存在" "[ -f 'backend/app/core/initial_data.py' ]"
test_check "core/seed_data.py存在" "[ -f 'backend/app/core/seed_data.py' ]"
test_check "services/storage.py存在" "[ -f 'backend/app/services/storage.py' ]"
test_check "services/video_processing.py存在" "[ -f 'backend/app/services/video_processing.py' ]"
test_check "tasks/__init__.py存在" "[ -f 'backend/app/tasks/__init__.py' ]"
test_check "tasks/video_tasks.py存在" "[ -f 'backend/app/tasks/video_tasks.py' ]"
test_check "tasks/ai_tasks.py存在" "[ -f 'backend/app/tasks/ai_tasks.py' ]"
echo ""

echo "4. 检查数据模型完整性"
echo "-------------------"
test_check "User模型存在" "grep -q 'class User' backend/app/models.py"
test_check "Category模型存在" "grep -q 'class Category' backend/app/models.py"
test_check "ProductProfile模型存在" "grep -q 'class ProductProfile' backend/app/models.py"
test_check "Video模型存在" "grep -q 'class Video' backend/app/models.py"
test_check "AIProvider模型存在" "grep -q 'class AIProvider' backend/app/models.py"
test_check "AIModel模型存在" "grep -q 'class AIModel' backend/app/models.py"
test_check "AIPrompt模型存在" "grep -q 'class AIPrompt' backend/app/models.py"
test_check "ECProTemplate模型存在" "grep -q 'class ECProTemplate' backend/app/models.py"
test_check "VideoTemplate模型存在" "grep -q 'class VideoTemplate' backend/app/models.py"
test_check "CostLimit模型存在" "grep -q 'class CostLimit' backend/app/models.py"
test_check "CrawlJob模型存在" "grep -q 'class CrawlJob' backend/app/models.py"
test_check "JobLog模型存在" "grep -q 'class JobLog' backend/app/models.py"
echo ""

echo "5. 检查Docker配置"
echo "-------------------"
test_check "PostgreSQL服务配置" "grep -q 'postgres:' docker-compose.yml"
test_check "Redis服务配置" "grep -q 'redis:' docker-compose.yml"
test_check "Backend服务配置" "grep -q 'backend:' docker-compose.yml"
test_check "Frontend服务配置" "grep -q 'frontend:' docker-compose.yml"
test_check "Celery Worker配置" "grep -q 'celery_worker:' docker-compose.yml"
test_check "Celery Beat配置" "grep -q 'celery_beat:' docker-compose.yml"
test_check "健康检查配置" "grep -q 'healthcheck:' docker-compose.yml"
echo ""

echo "6. 检查环境变量配置"
echo "-------------------"
test_check "DATABASE_URL配置" "grep -q 'DATABASE_URL' .env.example"
test_check "REDIS_URL配置" "grep -q 'REDIS_URL' .env.example"
test_check "JWT_SECRET_KEY配置" "grep -q 'JWT_SECRET_KEY' .env.example"
test_check "DEEPSEEK_API_KEY配置" "grep -q 'DEEPSEEK_API_KEY' .env.example"
test_check "OSS配置" "grep -q 'OSS_ACCESS_KEY_ID' .env.example"
test_check "ECPRO配置" "grep -q 'ECPRO_API_KEY' .env.example"
test_check "ICLIP配置" "grep -q 'ICLIP_API_KEY' .env.example"
echo ""

echo "7. 检查Python依赖"
echo "-------------------"
test_check "FastAPI依赖" "grep -q 'fastapi' backend/requirements.txt"
test_check "SQLAlchemy依赖" "grep -q 'sqlalchemy' backend/requirements.txt"
test_check "Celery依赖" "grep -q 'celery' backend/requirements.txt"
test_check "Redis依赖" "grep -q 'redis' backend/requirements.txt"
test_check "FFmpeg依赖" "grep -q 'ffmpeg-python' backend/requirements.txt"
test_check "Alembic依赖" "grep -q 'alembic' backend/requirements.txt"
test_check "OSS2依赖" "grep -q 'oss2' backend/requirements.txt"
test_check "Pydantic Settings依赖" "grep -q 'pydantic-settings' backend/requirements.txt"
echo ""

echo "8. 检查代码质量"
echo "-------------------"
test_check "main.py无语法错误" "python -m py_compile backend/app/main.py"
test_check "models.py无语法错误" "python -m py_compile backend/app/models.py"
test_check "config.py无语法错误" "python -m py_compile backend/app/core/config.py"
test_check "storage.py无语法错误" "python -m py_compile backend/app/services/storage.py"
test_check "video_tasks.py无语法错误" "python -m py_compile backend/app/tasks/video_tasks.py"
test_check "ai_tasks.py无语法错误" "python -m py_compile backend/app/tasks/ai_tasks.py"
echo ""

echo "========================================="
echo "测试结果汇总"
echo "========================================="
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo "总计: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ 所有测试通过！任务包1验收成功！${NC}"
    echo ""
    echo "下一步操作："
    echo "1. 复制环境变量: cp .env.example .env"
    echo "2. 编辑 .env 文件，配置必要的API密钥"
    echo "3. 启动服务: docker-compose up --build"
    echo "4. 访问前端: http://localhost:3000"
    echo "5. 访问API文档: http://localhost:8000/docs"
    exit 0
else
    echo -e "${RED}❌ 有$FAIL个测试失败，请检查并修复问题${NC}"
    exit 1
fi
