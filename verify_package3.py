"""
任务包3验收测试脚本
验证视频导入与预处理是否完整就绪
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
    print(f"{Colors.CYAN}任务包3：视频导入与预处理 - 验收测试{Colors.END}")
    print(f"{Colors.CYAN}========================================={Colors.END}\n")
    
    # 1. 检查后端视频API
    print(f"{Colors.YELLOW}1. 检查后端视频API{Colors.END}")
    print("-------------------")
    test_check("videos.py路由存在", os.path.isfile("backend/app/api/videos.py"))
    
    if os.path.isfile("backend/app/api/videos.py"):
        with open("backend/app/api/videos.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("上传视频接口存在", "@router.post('/upload'" in content)
        test_check("导入视频接口存在", "@router.post('/import'" in content)
        test_check("视频列表接口存在", "@router.get('/'" in content)
        test_check("视频详情接口存在", "@router.get('/{video_id}'" in content)
        test_check("处理视频接口存在", "/process" in content)
        test_check("分析视频接口存在", "/analyze" in content)
        test_check("复刻视频接口存在", "/replicate" in content)
        test_check("批量分析接口存在", "/batch/analyze" in content)
        test_check("删除视频接口存在", "@router.delete('/{video_id}'" in content)
    print()
    
    # 2. 检查视频处理服务
    print(f"{Colors.YELLOW}2. 检查视频处理服务{Colors.END}")
    print("-------------------")
    test_check("video_processing.py存在", os.path.isfile("backend/app/services/video_processing.py"))
    
    if os.path.isfile("backend/app/services/video_processing.py"):
        with open("backend/app/services/video_processing.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("save_upload_file函数存在", "def save_upload_file" in content)
        test_check("extract_audio函数存在", "def extract_audio" in content)
        test_check("extract_keyframes函数存在", "def extract_keyframes" in content)
        test_check("generate_thumbnail函数存在", "def generate_thumbnail" in content)
        test_check("get_video_metadata函数存在", "def get_video_metadata" in content)
        test_check("process_video_file函数存在", "def process_video_file" in content)
        test_check("ffmpeg导入存在", "import ffmpeg" in content)
    print()
    
    # 3. 检查Celery任务
    print(f"{Colors.YELLOW}3. 检查Celery任务{Colors.END}")
    print("-------------------")
    test_check("video_tasks.py存在", os.path.isfile("backend/app/tasks/video_tasks.py"))
    
    if os.path.isfile("backend/app/tasks/video_tasks.py"):
        with open("backend/app/tasks/video_tasks.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("process_video_task存在", "def process_video_task" in content)
    print()
    
    # 4. 检查数据模型
    print(f"{Colors.YELLOW}4. 检查数据模型完整性{Colors.END}")
    print("-------------------")
    if os.path.isfile("backend/app/models.py"):
        with open("backend/app/models.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("Video模型存在", "class Video" in content)
        test_check("VideoAsset模型存在", "class VideoAsset" in content)
    print()
    
    # 5. 检查前端视频库页面
    print(f"{Colors.YELLOW}5. 检查前端视频库页面{Colors.END}")
    print("-------------------")
    test_check("videos/page.tsx存在", os.path.isfile("frontend/app/videos/page.tsx"))
    test_check("videos/[id]/page.tsx存在", os.path.isfile("frontend/app/videos/[id]/page.tsx"))
    
    if os.path.isfile("frontend/app/videos/page.tsx"):
        with open("frontend/app/videos/page.tsx", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("视频列表功能存在", "fetchVideos" in content)
        test_check("筛选功能存在", "platform" in content and "category" in content)
        test_check("搜索功能存在", "handleSearch" in content)
        test_check("分页功能存在", "setPage" in content)
        test_check("删除功能存在", "handleDelete" in content)
        test_check("处理功能存在", "handleProcess" in content)
        test_check("状态显示存在", "getStatusColor" in content)
    print()
    
    if os.path.isfile("frontend/app/videos/[id]/page.tsx"):
        with open("frontend/app/videos/[id]/page.tsx", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("视频详情加载存在", "fetchVideoDetail" in content)
        test_check("视频播放器存在", "<video" in content)
        test_check("关键帧画廊存在", "keyframe" in content.lower())
        test_check("Tabs切换存在", "activeTab" in content)
    print()
    
    # 6. 检查Schema定义
    print(f"{Colors.YELLOW}6. 检查Schema定义{Colors.END}")
    print("-------------------")
    test_check("video schema存在", os.path.isfile("backend/app/schemas/video.py"))
    
    if os.path.isfile("backend/app/schemas/video.py"):
        with open("backend/app/schemas/video.py", 'r', encoding='utf-8') as f:
            content = f.read()
        test_check("VideoCreateResponse存在", "VideoCreateResponse" in content)
        test_check("VideoListResponse存在", "VideoListResponse" in content)
        test_check("VideoDetailResponse存在", "VideoDetailResponse" in content)
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
        print(f"{Colors.GREEN}✅ 所有测试通过！任务包3验收成功！{Colors.END}")
        print()
        print(f"{Colors.YELLOW}下一步操作：{Colors.END}")
        print("1. 启动系统: docker-compose up --build")
        print("2. 访问视频库: http://localhost:3000/videos")
        print("3. 上传测试视频并验证处理流程")
        print("4. 验证关键帧抽取和音频提取")
        return 0
    else:
        print(f"{Colors.RED}❌ 有{FAIL}个测试失败，请检查并修复问题{Colors.END}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
