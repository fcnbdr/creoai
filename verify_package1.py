"""
任务包1验收测试脚本 (Python版本)
验证项目骨架与基础设施是否完整就绪
"""
import os
import sys
from pathlib import Path

# 颜色代码
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    CYAN = '\033[96m'
    END = '\033[0m'

PASS = 0
FAIL = 0

def test_check(test_name, condition):
    """测试检查函数"""
    global PASS, FAIL
    
    print(f"测试: {test_name} ... ", end='')
    
    if condition:
        print(f"{Colors.GREEN}✓ 通过{Colors.END}")
        PASS += 1
    else:
        print(f"{Colors.RED}✗ 失败{Colors.END}")
        FAIL += 1

def main():
    global PASS, FAIL
    
    print(f"{Colors.CYAN}========================================={Colors.END}")
    print(f"{Colors.CYAN}任务包1：项目骨架与基础设施 - 验收测试{Colors.END}")
    print(f"{Colors.CYAN}========================================={Colors.END}\n")
    
    # 1. 检查文件结构
    print(f"{Colors.YELLOW}1. 检查文件结构{Colors.END}")
    print("-------------------")
    test_check("backend目录存在", os.path.isdir("backend"))
    test_check("frontend目录存在", os.path.isdir("frontend"))
    test_check("docker-compose.yml存在", os.path.isfile("docker-compose.yml"))
    test_check(".env.example存在", os.path.isfile(".env.example"))
    test_check("README.md存在", os.path.isfile("README.md"))
    test_check("README_DEPLOY.md存在", os.path.isfile("README_DEPLOY.md"))
    test_check("nginx.conf存在", os.path.isfile("nginx.conf"))
    test_check(".gitignore存在", os.path.isfile(".gitignore"))
    print()
    
    # 2. 检查后端核心文件
    print(f"{Colors.YELLOW}2. 检查后端核心文件{Colors.END}")
    print("-------------------")
    test_check("backend/app/main.py存在", os.path.isfile("backend/app/main.py"))
    test_check("backend/app/models.py存在", os.path.isfile("backend/app/models.py"))
    test_check("backend/requirements.txt存在", os.path.isfile("backend/requirements.txt"))
    test_check("backend/Dockerfile存在", os.path.isfile("backend/Dockerfile"))
    test_check("Alembic配置存在", os.path.isfile("backend/alembic.ini"))
    test_check("初始迁移文件存在", os.path.isfile("backend/alembic/versions/0001_initial.py"))
    test_check("第二迁移文件存在", os.path.isfile("backend/alembic/versions/0002_add_missing_tables.py"))
    print()
    
    # 3. 检查后端模块
    print(f"{Colors.YELLOW}3. 检查后端模块{Colors.END}")
    print("-------------------")
    test_check("core/config.py存在", os.path.isfile("backend/app/core/config.py"))
    test_check("core/initial_data.py存在", os.path.isfile("backend/app/core/initial_data.py"))
    test_check("core/seed_data.py存在", os.path.isfile("backend/app/core/seed_data.py"))
    test_check("services/storage.py存在", os.path.isfile("backend/app/services/storage.py"))
    test_check("services/video_processing.py存在", os.path.isfile("backend/app/services/video_processing.py"))
    test_check("tasks/__init__.py存在", os.path.isfile("backend/app/tasks/__init__.py"))
    test_check("tasks/video_tasks.py存在", os.path.isfile("backend/app/tasks/video_tasks.py"))
    test_check("tasks/ai_tasks.py存在", os.path.isfile("backend/app/tasks/ai_tasks.py"))
    print()
    
    # 4. 检查数据模型完整性
    print(f"{Colors.YELLOW}4. 检查数据模型完整性{Colors.END}")
    print("-------------------")
    
    models_file = "backend/app/models.py"
    if os.path.isfile(models_file):
        with open(models_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        models = [
            "User", "Category", "ProductProfile", "Video",
            "AIProvider", "AIModel", "AIPrompt", "ECProTemplate",
            "VideoTemplate", "CostLimit", "CrawlJob", "JobLog"
        ]
        
        for model in models:
            test_check(f"{model}模型存在", f"class {model}" in content)
    else:
        test_check("models.py文件存在", False)
    print()
    
    # 5. 检查Docker配置
    print(f"{Colors.YELLOW}5. 检查Docker配置{Colors.END}")
    print("-------------------")
    
    docker_file = "docker-compose.yml"
    if os.path.isfile(docker_file):
        with open(docker_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        test_check("PostgreSQL服务配置", "postgres:" in content)
        test_check("Redis服务配置", "redis:" in content)
        test_check("Backend服务配置", "backend:" in content)
        test_check("Frontend服务配置", "frontend:" in content)
        test_check("Celery Worker配置", "celery_worker:" in content)
        test_check("Celery Beat配置", "celery_beat:" in content)
        test_check("健康检查配置", "healthcheck:" in content)
    else:
        test_check("docker-compose.yml存在", False)
    print()
    
    # 6. 检查环境变量配置
    print(f"{Colors.YELLOW}6. 检查环境变量配置{Colors.END}")
    print("-------------------")
    
    env_file = ".env.example"
    if os.path.isfile(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        test_check("DATABASE_URL配置", "DATABASE_URL" in content)
        test_check("REDIS_URL配置", "REDIS_URL" in content)
        test_check("JWT_SECRET_KEY配置", "JWT_SECRET_KEY" in content)
        test_check("DEEPSEEK_API_KEY配置", "DEEPSEEK_API_KEY" in content)
        test_check("OSS配置", "OSS_ACCESS_KEY_ID" in content)
        test_check("ECPRO配置", "ECPRO_API_KEY" in content)
        test_check("ICLIP配置", "ICLIP_API_KEY" in content)
    else:
        test_check(".env.example存在", False)
    print()
    
    # 7. 检查Python依赖
    print(f"{Colors.YELLOW}7. 检查Python依赖{Colors.END}")
    print("-------------------")
    
    req_file = "backend/requirements.txt"
    if os.path.isfile(req_file):
        with open(req_file, 'r', encoding='utf-8') as f:
            content = f.read().lower()
        
        test_check("FastAPI依赖", "fastapi" in content)
        test_check("SQLAlchemy依赖", "sqlalchemy" in content)
        test_check("Celery依赖", "celery" in content)
        test_check("Redis依赖", "redis" in content)
        test_check("FFmpeg依赖", "ffmpeg-python" in content)
        test_check("Alembic依赖", "alembic" in content)
        test_check("OSS2依赖", "oss2" in content)
        test_check("Pydantic Settings依赖", "pydantic-settings" in content)
    else:
        test_check("requirements.txt存在", False)
    print()
    
    # 测试结果汇总
    print(f"{Colors.CYAN}========================================={Colors.END}")
    print(f"{Colors.CYAN}测试结果汇总{Colors.END}")
    print(f"{Colors.CYAN}========================================={Colors.END}")
    print(f"通过: {Colors.GREEN}{PASS}{Colors.END}")
    print(f"失败: {Colors.RED}{FAIL}{Colors.END}")
    print(f"总计: {PASS + FAIL}")
    print()
    
    if FAIL == 0:
        print(f"{Colors.GREEN}✅ 所有测试通过！任务包1验收成功！{Colors.END}")
        print()
        print(f"{Colors.YELLOW}下一步操作：{Colors.END}")
        print("1. 复制环境变量: cp .env.example .env")
        print("2. 编辑 .env 文件，配置必要的API密钥")
        print("3. 启动服务: docker-compose up --build")
        print("4. 访问前端: http://localhost:3000")
        print("5. 访问API文档: http://localhost:8000/docs")
        return 0
    else:
        print(f"{Colors.RED}❌ 有{FAIL}个测试失败，请检查并修复问题{Colors.END}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
