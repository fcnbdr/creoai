#!/usr/bin/env python3
"""
任务包8：复刻脚本与分镜生成 - 验收测试脚本
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

print_header("任务包8：复刻脚本与分镜生成 - 验收测试")

# ==================== 1. 检查后端Replications API ====================
print_header("1. 检查后端Replications API")

replications_api_path = Path("backend/app/api/replications.py")
if replications_api_path.exists():
    content = replications_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("replications.py路由存在", True),
        ("GET列表接口存在", "@router.get('/'" in content),
        ("GET详情接口存在", "@router.get('/{replication_id}'" in content),
        ("POST创建接口存在", "@router.post('/'" in content),
        ("PUT更新接口存在", "@router.put" in content),
        ("DELETE删除接口存在", "@router.delete" in content),
        ("脚本生成接口存在", "generate-script" in content),
        ("导出接口存在", "/export" in content),
        ("mock_generate_script函数存在", "def mock_generate_script" in content),
        ("mock_generate_shot_list函数存在", "def mock_generate_shot_list" in content),
        ("BackgroundTasks导入存在", "BackgroundTasks" in content),
        ("异步任务执行存在", "background_tasks.add_task" in content),
    ]
else:
    tests = [(name, False) for name in ["replications.py路由存在", "所有API功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 2. 检查脚本生成功能 ====================
print_header("2. 检查脚本生成功能")

if replications_api_path.exists():
    content = replications_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("15秒脚本生成逻辑存在", '"15s"' in content and "script_15s" in content),
        ("30秒脚本生成逻辑存在", "duration == \"15s\"" in content and "else:" in content and "script_30s" in content),
        ("脚本结构定义存在", "structure" in content),
        ("脚本内容字段存在", "content" in content),
        ("字数统计存在", "word_count" in content),
        ("时长参数验证存在", 'regex="^(15s|30s)$"' in content),
    ]
else:
    tests = [(name, False) for name in ["脚本生成"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 3. 检查分镜生成功能 ====================
print_header("3. 检查分镜生成功能")

if replications_api_path.exists():
    content = replications_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("分镜列表生成函数存在", "def mock_generate_shot_list" in content),
        ("shot_number字段存在", "shot_number" in content),
        ("time_range字段存在", "time_range" in content),
        ("visual_description字段存在", "visual_description" in content),
        ("camera_movement字段存在", "camera_movement" in content),
        ("audio字段存在", "audio" in content),
        ("text_overlay字段存在", "text_overlay" in content),
        ("15秒分镜数据存在", "15s" in content and "shots" in content),
        ("30秒分镜数据存在", "30s" in content and "shots" in content),
    ]
else:
    tests = [(name, False) for name in ["分镜生成"]]

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
        ("replications_router导入存在", "from app.api.replications import router as replications_router" in content),
        ("replications路由注册存在", "app.include_router(replications_router" in content),
        ("路由前缀正确", "prefix='/api/replications'" in content),
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
        ("Replication模型存在", "class Replication" in content),
        ("video_id字段存在", "video_id" in content),
        ("product_id字段存在", "product_id" in content),
        ("script_15s字段存在", "script_15s" in content),
        ("script_30s字段存在", "script_30s" in content),
        ("shot_list字段存在", "shot_list" in content),
        ("spoken_copy字段存在", "spoken_copy" in content),
        ("shooting_notes字段存在", "shooting_notes" in content),
        ("Video关系存在", "video = relationship" in content),
        ("ProductProfile关系存在", "product = relationship" in content),
        ("IClipVideoJob关系存在", "iclip_jobs = relationship" in content),
    ]
else:
    tests = [(name, False) for name in ["数据模型"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 6. 检查前端Replications页面 ====================
print_header("6. 检查前端Replications页面")

replications_page_path = Path("frontend/app/replications/page.tsx")
if replications_page_path.exists():
    content = replications_page_path.read_text(encoding='utf-8')
    
    tests = [
        ("复刻脚本页面存在", True),
        ("创建新脚本按钮存在", "创建新脚本" in content),
        ("生成15秒脚本按钮存在", "生成15秒脚本" in content),
        ("生成30秒脚本按钮存在", "生成30秒脚本" in content),
        ("导出MD按钮存在", "导出MD" in content),
        ("删除按钮存在", "删除" in content),
        ("脚本卡片布局存在", "rounded-2xl border" in content),
        ("15秒脚本区域存在", "15秒脚本" in content),
        ("30秒脚本区域存在", "30秒脚本" in content),
        ("分镜列表预览存在", "分镜列表" in content),
        ("口播文案展示存在", "口播文案" in content),
        ("拍摄备注展示存在", "拍摄备注" in content),
        ("已生成状态标签存在", "已生成" in content),
        ("未生成状态标签存在", "未生成" in content),
        ("生成中状态显示存在", "生成中..." in content),
        ("镜头详细信息存在", "镜头" in content and "画面" in content),
    ]
else:
    tests = [(name, False) for name in ["复刻脚本页面存在", "所有功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 7. 检查Pydantic Schema ====================
print_header("7. 检查Pydantic Schema定义")

if replications_api_path.exists():
    content = replications_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("ReplicationCreate Schema存在", "class ReplicationCreate" in content),
        ("ReplicationUpdate Schema存在", "class ReplicationUpdate" in content),
        ("ReplicationRead Schema存在", "class ReplicationRead" in content),
        ("video_id必填字段", "video_id: int" in content),
        ("product_id可选字段", "product_id: Optional[int]" in content),
        ("script_15s可选字段", "script_15s: Optional[dict]" in content),
        ("shot_list可选字段", "shot_list: Optional[List[dict]]" in content),
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
print_header("8. 检查模拟AI服务实现")

if replications_api_path.exists():
    content = replications_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("脚本生成模拟函数存在", "def mock_generate_script" in content),
        ("分镜生成模拟函数存在", "def mock_generate_shot_list" in content),
        ("模拟延迟存在", "time.sleep" in content),
        ("15秒脚本结构完整", "hook" in content and "pain_point" in content and "solution" in content and "cta" in content),
        ("30秒脚本结构完整", "problem" in content and "demo" in content and "benefit" in content),
        ("分镜数量合理", "shot_number" in content and "time_range" in content),
        ("运镜方式描述存在", "camera_movement" in content),
        ("字幕文案存在", "text_overlay" in content),
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
    print(f"\n{GREEN}✅ 所有测试通过！任务包8验收成功！{RESET}")
    print("\n下一步操作：")
    print("1. 启动系统: docker-compose up --build")
    print("2. 访问复刻脚本页面: http://localhost:3000/replications")
    print("3. 点击'创建新脚本'按钮创建复刻记录")
    print("4. 点击'生成15秒脚本'或'生成30秒脚本'按钮")
    print("5. 等待2秒后刷新查看生成的脚本和分镜列表")
    print("6. 点击'导出MD'按钮下载Markdown格式脚本")
    sys.exit(0)
else:
    print(f"\n{RED}❌ 有{failed}项测试失败，请检查后重试{RESET}")
    sys.exit(1)
