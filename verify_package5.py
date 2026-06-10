#!/usr/bin/env python3
"""
任务包5：ECPro商品与选题推荐 - 验收测试脚本
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

print_header("任务包5：ECPro商品与选题推荐 - 验收测试")

# ==================== 1. 检查后端Products API增强 ====================
print_header("1. 检查后端Products API增强")

products_api_path = Path("backend/app/api/products.py")
if products_api_path.exists():
    content = products_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("products.py路由存在", True),
        ("ECPro同步接口存在", "sync-from-ecpro" in content),
        ("CSV导出接口存在", "export/csv" in content),
        ("mock_ecpro_crawl函数存在", "def mock_ecpro_crawl" in content),
        ("BackgroundTasks导入存在", "BackgroundTasks" in content),
        ("异步任务执行存在", "background_tasks.add_task" in content),
    ]
else:
    tests = [(name, False) for name in ["products.py路由存在", "所有增强功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 2. 检查后端Recommendations API增强 ====================
print_header("2. 检查后端Recommendations API增强")

recommendations_api_path = Path("backend/app/api/recommendations.py")
if recommendations_api_path.exists():
    content = recommendations_api_path.read_text(encoding='utf-8')
    
    tests = [
        ("recommendations.py路由存在", True),
        ("批量生成接口存在", "batch-generate" in content),
        ("删除接口存在", "@router.delete" in content),
        ("video_id筛选存在", "video_id" in content),
        ("批量任务执行存在", "_batch_task" in content),
    ]
else:
    tests = [(name, False) for name in ["recommendations.py路由存在", "所有增强功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 3. 检查前端商品库页面 ====================
print_header("3. 检查前端商品库页面")

products_page_path = Path("frontend/app/products/page.tsx")
if products_page_path.exists():
    content = products_page_path.read_text(encoding='utf-8')
    
    tests = [
        ("商品库页面存在", True),
        ("ECPro同步按钮存在", "从ECPro同步" in content),
        ("CSV导出按钮存在", "导出CSV" in content),
        ("搜索功能存在", "search" in content and "onChange" in content),
        ("分页功能存在", "page" in content and "pageSize" in content),
        ("表格展示存在", "<table" in content),
        ("商品详情链接存在", "/products/${product.id}" in content),
    ]
else:
    tests = [(name, False) for name in ["商品库页面存在", "所有功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 4. 检查前端商品详情页面 ====================
print_header("4. 检查前端商品详情页面")

product_detail_path = Path("frontend/app/products/[id]/page.tsx")
if product_detail_path.exists():
    content = product_detail_path.read_text(encoding='utf-8')
    
    tests = [
        ("商品详情页面存在", True),
        ("商品信息展示存在", "selling_points" in content),
        ("卖点展示存在", "卖点" in content),
        ("痛点展示存在", "痛点" in content),
        ("使用场景展示存在", "使用场景" in content),
        ("生成选题推荐按钮存在", "生成选题推荐" in content),
        ("选题推荐列表存在", "recommendations" in content),
    ]
else:
    tests = [(name, False) for name in ["商品详情页面存在", "所有功能"]]

for test_name, result in tests:
    total += 1
    if print_test(test_name, result):
        passed += 1
    else:
        failed += 1

# ==================== 5. 检查前端选题推荐页面 ====================
print_header("5. 检查前端选题推荐页面")

recommendations_page_path = Path("frontend/app/recommendations/page.tsx")
if recommendations_page_path.exists():
    content = recommendations_page_path.read_text(encoding='utf-8')
    
    tests = [
        ("选题推荐页面存在", True),
        ("批量生成按钮存在", "批量生成推荐" in content),
        ("卡片式布局存在", "grid gap-4" in content),
        ("导出MD按钮存在", "导出MD" in content),
        ("删除按钮存在", "删除" in content),
        ("难度标签存在", "难度" in content),
        ("商品关联显示存在", "商品 #" in content),
    ]
else:
    tests = [(name, False) for name in ["选题推荐页面存在", "所有功能"]]

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
        ("ProductProfile模型存在", "class ProductProfile" in content),
        ("TopicRecommendation模型存在", "class TopicRecommendation" in content),
        ("商品-推荐关联字段存在", "topic_recommendations" in content),
        ("推荐-视频关联字段存在", "source_video_id" in content),
        ("推荐难度字段存在", "difficulty" in content),
        ("推荐理由字段存在", "recommend_reason" in content),
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
    print(f"\n{GREEN}✅ 所有测试通过！任务包5验收成功！{RESET}")
    print("\n下一步操作：")
    print("1. 启动系统: docker-compose up --build")
    print("2. 访问商品库: http://localhost:3000/products")
    print("3. 点击'从ECPro同步'按钮导入模拟商品数据")
    print("4. 访问商品详情并生成选题推荐")
    print("5. 访问选题推荐页面查看AI生成的选题")
    sys.exit(0)
else:
    print(f"\n{RED}❌ 有{failed}项测试失败，请检查后重试{RESET}")
    sys.exit(1)
