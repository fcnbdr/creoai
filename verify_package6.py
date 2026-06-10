#!/usr/bin/env python3
"""
任务包6：IClip视频复刻流水线 - 验收测试脚本
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

print_header("任务包6：IClip视频复刻流水线 - 验收测试")

# ==================== 1. 检查后端IClip API ====================
print_header("1. 检查后端IClip API")

iclip_api_path = Path("backend/app/api/iclip.py")
if iclip_api_path.exists():
    content = iclip_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("iclip.py路由存在", True),
        ("GET列表接口存在", "@router.get('/'" in content),
        ("GET详情接口存在", "@router.get('/{job_id}'" in content),
        ("POST创建接口存在", "@router.post('/'" in content),
        ("DELETE删除接口存在", "@router.delete" in content),
        ("批量生成接口存在", "batch-generate" in content),
        ("mock_iclip_service函数存在", "def mock_iclip_service" in content),
        ("BackgroundTasks导入存在", "BackgroundTasks" in content),
        ("异步任务执行存在", "background_tasks.add_task" in content),
        ("状态流转逻辑存在", "processing" in content and "completed" in content),
    ]
else:
    tests = [(name, False) for name in ["iclip.py路由存在", "所有API功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 2. 检查main.py路由注册 ====================
print_header("2. 检查main.py路由注册")

main_path = Path("backend/app/main.py")
if main_path.exists():
    content = main_path.read_text(encoding='utf-8')
    
    tests = [
        ("iclip_router导入存在", "from app.api.iclip import router as iclip_router" in content),
        ("iclip路由注册存在", "app.include_router(iclip_router" in content),
        ("路由前缀正确", "prefix='/api/iclip'" in content),
    ]
else:
    tests = [(name, False) for name in ["main.py路由注册"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 3. 检查数据模型完整性 ====================
print_header("3. 检查数据模型完整性")

models_path = Path("backend/app/models.py")
if models_path.exists():
    content = models_path.read_text(encoding='utf-8')
    
    tests = [
        ("IClipVideoJob模型存在", "class IClipVideoJob" in content),
        ("script_id字段存在", "script_id" in content),
        ("product_id字段存在", "product_id" in content),
        ("video_type字段存在", "video_type" in content),
        ("status字段存在", "status" in content),
        ("video_url字段存在", "video_url" in content),
        ("token_cost字段存在", "token_cost" in content),
        ("assets字段存在", "assets" in content),
        ("Replication关系存在", "replication = relationship" in content),
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

# ==================== 4. 检查前端IClip页面 ====================
print_header("4. 检查前端IClip页面")

iclip_page_path = Path("frontend/app/iclip/page.tsx")
if iclip_page_path.exists():
    content = iclip_page_path.read_text(encoding='utf-8')
    
    tests = [
        ("IClip页面存在", True),
        ("提交单个任务按钮存在", "提交单个任务" in content),
        ("批量生成按钮存在", "批量生成" in content),
        ("状态筛选器存在", "filterStatus" in content),
        ("任务卡片布局存在", "grid gap-4" in content),
        ("进度条动画存在", "animate-pulse" in content),
        ("视频播放器存在", "<video" in content),
        ("下载视频链接存在", "下载视频" in content),
        ("删除按钮存在", "删除" in content),
        ("自动轮询机制存在", "setInterval" in content),
        ("状态颜色映射存在", "getStatusColor" in content),
        ("状态文本映射存在", "getStatusText" in content),
    ]
else:
    tests = [(name, False) for name in ["IClip页面存在", "所有功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 5. 检查Pydantic Schema ====================
print_header("5. 检查Pydantic Schema定义")

if iclip_api_path.exists():
    content = iclip_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("IClipJobCreate Schema存在", "class IClipJobCreate" in content),
        ("IClipJobRead Schema存在", "class IClipJobRead" in content),
        ("script_id可选字段", "script_id: Optional[int]" in content),
        ("product_id可选字段", "product_id: Optional[int]" in content),
        ("video_type必填字段", "video_type: str" in content),
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

# ==================== 6. 检查模拟服务实现 ====================
print_header("6. 检查模拟IClip服务实现")

if iclip_api_path.exists():
    content = iclip_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("模拟服务函数存在", "def mock_iclip_service" in content),
        ("模拟延迟存在", "time.sleep" in content),
        ("返回video_url", '"video_url"' in content),
        ("返回token_cost", '"token_cost"' in content),
        ("返回duration", '"duration"' in content),
        ("返回thumbnail_url", '"thumbnail_url"' in content),
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
    print(f"\n{GREEN}✅ 所有测试通过！任务包6验收成功！{RESET}")
    print("\n下一步操作：")
    print("1. 启动系统: docker-compose up --build")
    print("2. 访问IClip页面: http://localhost:3000/iclip")
    print("3. 点击'提交单个任务'按钮创建视频生成任务")
    print("4. 观察任务状态从pending → processing → completed")
    print("5. 完成后查看视频预览和下载链接")
    sys.exit(0)
else:
    print(f"\n{RED}❌ 有{failed}项测试失败，请检查后重试{RESET}")
    sys.exit(1)
