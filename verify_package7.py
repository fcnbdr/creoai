#!/usr/bin/env python3
"""
任务包7：ECPro内容生成与审核 - 验收测试脚本
"""
import os
import sys
from pathlib import Path

# ANSI颜色代码
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{YELLOW}{'=' * 50}{RESET}")
    print(f"{YELLOW}{text}{RESET}")
    print(f"{YELLOW}{'=' * 50}{RESET}\n")

def print_test(test_name, passed):
    status = f"{GREEN}✓ 通过{RESET}" if passed else f"{RED}✗ 失败{RESET}"
    print(f"测试: {test_name:<30} ... {status}")
    return passed

# 统计变量
passed = 0
failed = 0
total = 0

print_header("任务包7：ECPro内容生成与审核 - 验收测试")

# ==================== 1. 检查后端ECPro API ====================
print_header("1. 检查后端ECPro API")

ecpro_api_path = Path("backend/app/api/ecpro.py")
if ecpro_api_path.exists():
    content = ecpro_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("ecpro.py路由存在", True),
        ("GET列表接口存在", "@router.get('/'" in content),
        ("GET详情接口存在", "@router.get('/{job_id}'" in content),
        ("POST创建接口存在", "@router.post('/'" in content),
        ("DELETE删除接口存在", "@router.delete" in content),
        ("批量生成接口存在", "batch-generate" in content),
        ("审核接口存在", "/audit" in content),
        ("mock_ecpro_content_service函数存在", "def mock_ecpro_content_service" in content),
        ("BackgroundTasks导入存在", "BackgroundTasks" in content),
        ("异步任务执行存在", "background_tasks.add_task" in content),
        ("状态流转逻辑存在", "processing" in content and "completed" in content),
    ]
else:
    tests = [(name, False) for name in ["ecpro.py路由存在", "所有API功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 2. 检查敏感词检测功能 ====================
print_header("2. 检查敏感词检测功能")

if ecpro_api_path.exists():
    content = ecpro_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("敏感词库定义存在", "SENSITIVE_WORDS" in content),
        ("check_sensitive_words函数存在", "def check_sensitive_words" in content),
        ("敏感词检测逻辑存在", "has_sensitive_words" in content),
        ("返回敏感词列表", "sensitive_words" in content),
        ("返回命中数量", "count" in content),
    ]
else:
    tests = [(name, False) for name in ["敏感词检测"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 3. 检查合规性检查功能 ====================
print_header("3. 检查合规性检查功能")

if ecpro_api_path.exists():
    content = ecpro_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("合规规则定义存在", "COMPLIANCE_RULES" in content),
        ("check_compliance函数存在", "def check_compliance" in content),
        ("长度检查逻辑存在", "max_length" in content and "min_length" in content),
        ("正则模式检查存在", "forbidden_patterns" in content),
        ("返回合规状态", "is_compliant" in content),
        ("返回问题列表", "issues" in content),
    ]
else:
    tests = [(name, False) for name in ["合规性检查"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 4. 检查main.py路由注册 ====================
print_header("4. 检查main.py路由注册")

main_path = Path("backend/app/main.py")
if main_path.exists():
    content = main_path.read_text(encoding='utf-8')
    
    tests = [
        ("ecpro_router导入存在", "from app.api.ecpro import router as ecpro_router" in content),
        ("ecpro路由注册存在", "app.include_router(ecpro_router" in content),
        ("路由前缀正确", "prefix='/api/ecpro'" in content),
    ]
else:
    tests = [(name, False) for name in ["main.py路由注册"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 5. 检查数据模型完整性 ====================
print_header("5. 检查数据模型完整性")

models_path = Path("backend/app/models.py")
if models_path.exists():
    content = models_path.read_text(encoding='utf-8')
    
    tests = [
        ("ECProContentJob模型存在", "class ECProContentJob" in content),
        ("product_id字段存在", "product_id" in content),
        ("job_type字段存在", "job_type" in content),
        ("platform_targets字段存在", "platform_targets" in content),
        ("status字段存在", "status" in content),
        ("content_urls字段存在", "content_urls" in content),
        ("ProductProfile关系存在", "product = relationship" in content),
    ]
else:
    tests = [(name, False) for name in ["数据模型"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 6. 检查前端ECPro页面 ====================
print_header("6. 检查前端ECPro页面")

ecpro_page_path = Path("frontend/app/ecpro/page.tsx")
if ecpro_page_path.exists():
    content = ecpro_page_path.read_text(encoding='utf-8')
    
    tests = [
        ("ECPro页面存在", True),
        ("提交单个任务按钮存在", "提交单个任务" in content),
        ("批量生成按钮存在", "批量生成" in content),
        ("状态筛选器存在", "filterStatus" in content),
        ("类型筛选器存在", "filterJobType" in content),
        ("任务卡片布局存在", "grid gap-4" in content),
        ("进度条动画存在", "animate-pulse" in content),
        ("内容预览区域存在", "生成内容" in content),
        ("审核结果展示存在", "敏感词检测" in content and "合规检查" in content),
        ("重新审核按钮存在", "重新审核" in content),
        ("查看内容链接存在", "查看内容" in content),
        ("删除按钮存在", "删除" in content),
        ("自动轮询机制存在", "setInterval" in content),
        ("状态颜色映射存在", "getStatusColor" in content),
        ("状态文本映射存在", "getStatusText" in content),
        ("任务类型文本映射存在", "getJobTypeText" in content),
    ]
else:
    tests = [(name, False) for name in ["ECPro页面存在", "所有功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 7. 检查Pydantic Schema ====================
print_header("7. 检查Pydantic Schema定义")

if ecpro_api_path.exists():
    content = ecpro_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("ECProJobCreate Schema存在", "class ECProJobCreate" in content),
        ("ECProJobRead Schema存在", "class ECProJobRead" in content),
        ("product_id必填字段", "product_id: int" in content),
        ("job_type默认值", 'job_type: str = "copywriting"' in content),
        ("platform_targets可选字段", "platform_targets: Optional" in content),
        ("from_attributes配置", "from_attributes = True" in content),
    ]
else:
    tests = [(name, False) for name in ["Schema定义"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 8. 检查模拟服务实现 ====================
print_header("8. 检查模拟ECPro服务实现")

if ecpro_api_path.exists():
    content = ecpro_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("模拟服务函数存在", "def mock_ecpro_content_service" in content),
        ("模拟延迟存在", "time.sleep" in content),
        ("文案生成逻辑存在", "copywriting" in content),
        ("脚本生成逻辑存在", "script" in content),
        ("标签生成逻辑存在", "hashtag" in content),
        ("调用敏感词检测", "check_sensitive_words" in content),
        ("调用合规检查", "check_compliance" in content),
        ("返回content_url", '"content_url"' in content),
        ("返回word_count", '"word_count"' in content),
    ]
else:
    tests = [(name, False) for name in ["模拟服务"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 测试结果汇总 ====================
print_header("测试结果汇总")
print(f"通过: {passed}")
print(f"失败: {failed}")
print(f"总计: {total}")

if failed == 0:
    print(f"\n{GREEN}✅ 所有测试通过！任务包7验收成功！{RESET}")
    print("\n下一步操作：")
    print("1. 启动系统: docker-compose up --build")
    print("2. 访问ECPro页面: http://localhost:3000/ecpro")
    print("3. 点击'提交单个任务'按钮创建内容生成任务")
    print("4. 观察任务状态从pending → processing → completed")
    print("5. 完成后查看内容预览和审核结果")
    print("6. 点击'重新审核'按钮手动触发审核")
    sys.exit(0)
else:
    print(f"\n{RED}❌ 有{failed}项测试失败，请检查后重试{RESET}")
    sys.exit(1)
