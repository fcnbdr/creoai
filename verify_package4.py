#!/usr/bin/env python3
"""
任务包4：AI爆款分析闭环 - 验收测试脚本
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

print_header("任务包4：AI爆款分析闭环 - 验收测试")

# ==================== 1. 检查后端Analysis API ====================
print_header("1. 检查后端Analysis API")

api_path = Path("backend/app/api/analyses.py")
if api_path.exists():
    content = api_path.read_text(encoding='utf-8')
    
    tests = [
        ("analyses.py路由存在", True),
        ("获取分析接口存在", "get_analysis" in content),
        ("列表分析接口存在", "list_analyses" in content),
        ("触发转写接口存在", "trigger_transcription" in content),
        ("触发关键帧分析接口存在", "trigger_keyframe_analysis" in content),
        ("触发结构分析接口存在", "trigger_structure_analysis" in content),
        ("完整分析接口存在", "trigger_full_analysis" in content),
    ]
else:
    tests = [(name, False) for name in ["analyses.py路由存在", "所有接口"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 2. 检查Analysis Schema ====================
print_header("2. 检查Analysis Schema")

schema_path = Path("backend/app/schemas/analysis.py")
if schema_path.exists():
    content = schema_path.read_text(encoding='utf-8')
    
    tests = [
        ("analysis schema存在", True),
        ("AnalysisBase存在", "class AnalysisBase" in content),
        ("AnalysisCreate存在", "class AnalysisCreate" in content),
        ("AnalysisUpdate存在", "class AnalysisUpdate" in content),
        ("AnalysisRead存在", "class AnalysisRead" in content),
    ]
else:
    tests = [(name, False) for name in ["analysis schema存在", "所有Schema类"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 3. 检查AI任务实现 ====================
print_header("3. 检查AI任务实现")

tasks_path = Path("backend/app/tasks/ai_tasks.py")
if tasks_path.exists():
    content = tasks_path.read_text(encoding='utf-8')
    
    tests = [
        ("ai_tasks.py存在", True),
        ("transcribe_audio_task存在", "def transcribe_audio_task" in content),
        ("analyze_keyframes_task存在", "def analyze_keyframes_task" in content),
        ("analyze_structure_task存在", "def analyze_structure_task" in content),
        ("Celery装饰器存在", "@shared_task" in content),
        ("重试机制存在", "max_retries" in content),
    ]
else:
    tests = [(name, False) for name in ["ai_tasks.py存在", "所有任务函数"]]

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
        ("analyses_router导入存在", "from app.api.analyses import router as analyses_router" in content),
        ("analyses路由注册存在", "app.include_router(analyses_router" in content),
    ]
else:
    tests = [(name, False) for name in ["main.py路由注册"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 5. 检查前端视频详情页增强 ====================
print_header("5. 检查前端视频详情页增强")

detail_page_path = Path("frontend/app/videos/[id]/page.tsx")
if detail_page_path.exists():
    content = detail_page_path.read_text(encoding='utf-8')
    
    tests = [
        ("视频详情页存在", True),
        ("Analysis类型定义存在", "type Analysis" in content),
        ("fetchAnalysis函数存在", "fetchAnalysis" in content),
        ("handleFullAnalysis函数存在", "handleFullAnalysis" in content),
        ("口播转写Tab存在", "'transcript'" in content and "口播转写" in content),
        ("钩子画面Tab存在", "'hook'" in content and "钩子画面" in content),
        ("爆款结构Tab存在", "'structure'" in content and "爆款结构" in content),
        ("运镜分析Tab存在", "'camera'" in content and "运镜分析" in content),
        ("AI分析按钮存在", "AI分析" in content),
        ("分析结果展示存在", "analysis.hook_analysis" in content or "analysis.script_structure" in content),
    ]
else:
    tests = [(name, False) for name in ["视频详情页", "所有功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 6. 检查数据模型完整性 ====================
print_header("6. 检查数据模型完整性")

models_path = Path("backend/app/models.py")
if models_path.exists():
    content = models_path.read_text(encoding='utf-8')
    
    tests = [
        ("Analysis模型存在", "class Analysis" in content),
        ("AIPrompt模型存在", "class AIPrompt" in content),
        ("hook_analysis字段存在", "hook_analysis" in content),
        ("script_structure字段存在", "script_structure" in content),
        ("spoken_copy字段存在", "spoken_copy" in content),
        ("camera_analysis字段存在", "camera_analysis" in content),
        ("viral_reason字段存在", "viral_reason" in content),
        ("replication_score字段存在", "replication_score" in content),
    ]
else:
    tests = [(name, False) for name in ["数据模型"]]

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
    print(f"\n{GREEN}✅ 所有测试通过！任务包4验收成功！{RESET}")
    print("\n下一步操作：")
    print("1. 启动系统: docker-compose up --build")
    print("2. 访问视频详情: http://localhost:3000/videos/[id]")
    print("3. 点击'AI分析'按钮触发完整分析流程")
    print("4. 验证Tabs展示：口播转写、钩子画面、爆款结构、运镜拆解")
    sys.exit(0)
else:
    print(f"\n{RED}❌ 有{failed}项测试失败，请检查后重试{RESET}")
    sys.exit(1)
