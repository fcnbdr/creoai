"""
任务包2验收测试脚本
验证AIGateway与DeepSeek测试台是否完整就绪
"""
import os
import sys

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    CYAN = '\033[96m'
    END = '\033[0m'

PASS = 0
FAIL = 0

def test_check(test_name, condition):
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
    print(f"{Colors.CYAN}任务包2：AIGateway与DeepSeek测试台 - 验收测试{Colors.END}")
    print(f"{Colors.CYAN}========================================={Colors.END}\n")
    
    # 1. 检查后端AI服务模块
    print(f"{Colors.YELLOW}1. 检查后端AI服务模块{Colors.END}")
    print("-------------------")
    test_check("ai_gateway.py存在", os.path.isfile("backend/app/services/ai_gateway.py"))
    test_check("providers.py存在", os.path.isfile("backend/app/services/providers.py"))
    
    # 检查AIGateway类
    if os.path.isfile("backend/app/services/ai_gateway.py"):
        with open("backend/app/services/ai_gateway.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("AIGateway类存在", "class AIGateway" in content)
        test_check("generate_text方法存在", "def generate_text" in content)
        test_check("generate_json方法存在", "def generate_json" in content)
        test_check("analyze_images方法存在", "def analyze_images" in content)
        test_check("transcribe_audio方法存在", "def transcribe_audio" in content)
        test_check("_log_call方法存在", "def _log_call" in content)
        test_check("_estimate_cost方法存在", "def _estimate_cost" in content)
        test_check("_retry_with_fallback方法存在", "def _retry_with_fallback" in content)
    print()
    
    # 2. 检查Provider实现
    print(f"{Colors.YELLOW}2. 检查Provider实现{Colors.END}")
    print("-------------------")
    if os.path.isfile("backend/app/services/providers.py"):
        with open("backend/app/services/providers.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("BaseProvider抽象类存在", "class BaseProvider" in content)
        test_check("DeepSeekProvider存在", "class DeepSeekProvider" in content)
        test_check("MockDeepSeekProvider存在", "class MockDeepSeekProvider" in content)
        test_check("MockECProProvider存在", "class MockECProProvider" in content)
        test_check("MockIClipProvider存在", "class MockIClipProvider" in content)
        test_check("httpx导入存在", "import httpx" in content)
    print()
    
    # 3. 检查AI API接口
    print(f"{Colors.YELLOW}3. 检查AI API接口{Colors.END}")
    print("-------------------")
    test_check("ai.py路由存在", os.path.isfile("backend/app/api/ai.py"))
    
    if os.path.isfile("backend/app/api/ai.py"):
        with open("backend/app/api/ai.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("GET /providers接口存在", "@router.get" in content and "providers" in content)
        test_check("POST /providers接口存在", "@router.post" in content and "providers" in content)
        test_check("PUT /providers接口存在", "@router.put" in content and "providers" in content)
        test_check("DELETE /providers接口存在", "@router.delete" in content and "providers" in content)
        test_check("测试文本接口存在", "test/text" in content)
        test_check("测试JSON接口存在", "test/json" in content)
        test_check("测试图片接口存在", "test/image" in content)
        test_check("测试音频接口存在", "test/audio" in content)
        test_check("模型管理接口存在", "/models" in content)
        test_check("Prompt管理接口存在", "/prompts" in content)
    print()
    
    # 4. 检查Schema定义
    print(f"{Colors.YELLOW}4. 检查Schema定义{Colors.END}")
    print("-------------------")
    test_check("ai.py schema存在", os.path.isfile("backend/app/schemas/ai.py"))
    
    if os.path.isfile("backend/app/schemas/ai.py"):
        with open("backend/app/schemas/ai.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("AIProviderCreate schema存在", "class AIProviderCreate" in content)
        test_check("AIProviderRead schema存在", "class AIProviderRead" in content)
        test_check("AIModelCreate schema存在", "class AIModelCreate" in content)
        test_check("AIModelRead schema存在", "class AIModelRead" in content)
        test_check("AIPromptCreate schema存在", "class AIPromptCreate" in content)
        test_check("AIPromptRead schema存在", "class AIPromptRead" in content)
        test_check("TextTestRequest schema存在", "class TextTestRequest" in content)
        test_check("JSONTestRequest schema存在", "class JSONTestRequest" in content)
        test_check("ImageTestRequest schema存在", "class ImageTestRequest" in content)
        test_check("AudioTestRequest schema存在", "class AudioTestRequest" in content)
    print()
    
    # 5. 检查前端AI配置页面
    print(f"{Colors.YELLOW}5. 检查前端AI配置页面{Colors.END}")
    print("-------------------")
    test_check("ai-config页面存在", os.path.isfile("frontend/app/ai-config/page.tsx"))
    
    if os.path.isfile("frontend/app/ai-config/page.tsx"):
        with open("frontend/app/ai-config/page.tsx", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("供应商列表功能存在", "fetchProviders" in content)
        test_check("新增供应商功能存在", "handleCreateProvider" in content)
        test_check("删除供应商功能存在", "handleDeleteProvider" in content)
        test_check("测试台功能存在", "runTest" in content)
        test_check("Tab切换功能存在", "activeTab" in content)
        test_check("供应商管理Tab存在", "'providers'" in content)
        test_check("模型映射Tab存在", "'models'" in content)
        test_check("Prompt管理Tab存在", "'prompts'" in content)
        test_check("测试台Tab存在", "'test'" in content)
    print()
    
    # 6. 检查数据模型
    print(f"{Colors.YELLOW}6. 检查数据模型完整性{Colors.END}")
    print("-------------------")
    if os.path.isfile("backend/app/models.py"):
        with open("backend/app/models.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("AIProvider模型存在", "class AIProvider" in content)
        test_check("AIModel模型存在", "class AIModel" in content)
        test_check("AIPrompt模型存在", "class AIPrompt" in content)
        test_check("AICall模型存在", "class AICall" in content)
    print()
    
    # 7. 检查Python依赖
    print(f"{Colors.YELLOW}7. 检查Python依赖{Colors.END}")
    print("-------------------")
    if os.path.isfile("backend/requirements.txt"):
        with open("backend/requirements.txt", 'r', encoding='utf-8') as f:
            content = f.read().lower()
        test_check("httpx依赖存在", "httpx" in content)
        test_check("openai依赖存在", "openai" in content)
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
        print(f"{Colors.GREEN}✅ 所有测试通过！任务包2验收成功！{Colors.END}")
        print()
        print(f"{Colors.YELLOW}下一步操作：{Colors.END}")
        print("1. 启动系统: docker-compose up --build")
        print("2. 访问AI配置页面: http://localhost:3000/ai-config")
        print("3. 添加DeepSeek供应商并测试")
        print("4. 验证API调用日志记录")
        return 0
    else:
        print(f"{Colors.RED}❌ 有{FAIL}个测试失败，请检查并修复问题{Colors.END}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
