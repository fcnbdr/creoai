@echo off
chcp 65001 >nul
echo ========================================
echo   AI短视频爆款系统 - 快速启动脚本
echo ========================================
echo.

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] Docker 未安装或未添加到系统路径
    echo.
    echo 请先安装 Docker Desktop:
    echo 1. 访问: https://www.docker.com/products/docker-desktop/
    echo 2. 下载并安装 Docker Desktop for Windows
    echo 3. 重启电脑
    echo 4. 运行此脚本
    echo.
    echo 详细安装指南请查看: DOCKER_INSTALLATION_GUIDE.md
    echo.
    pause
    exit /b 1
)

echo [检查] Docker 版本...
docker --version
echo.

echo [检查] Docker Compose 版本...
docker compose version
echo.

echo [提示] 正在检查 Docker 引擎状态...
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] Docker 引擎未运行
    echo.
    echo 请启动 Docker Desktop 应用程序
    echo 等待左下角显示 "Engine running" 后再运行此脚本
    echo.
    pause
    exit /b 1
)

echo [成功] Docker 引擎正在运行
echo.

REM 检查 .env 文件
if not exist .env (
    echo [提示] 未找到 .env 文件，正在从 .env.example 复制...
    copy .env.example .env >nul
    echo [成功] 已创建 .env 文件
    echo [提示] 请编辑 .env 文件配置必要的 API Key（可选）
    echo.
) else (
    echo [成功] 找到 .env 文件
    echo.
)

echo ========================================
echo   开始启动所有服务...
echo ========================================
echo.

echo [步骤 1/3] 构建 Docker 镜像...
docker compose build

echo.
echo [步骤 2/3] 启动所有服务...
docker compose up -d

echo.
echo [步骤 3/3] 等待服务启动...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   服务启动完成！
echo ========================================
echo.

echo [检查] 服务状态...
docker compose ps

echo.
echo ========================================
echo   访问地址
echo ========================================
echo.
echo   前端首页:     http://localhost:3000
echo   登录页面:     http://localhost:3000/login
echo   视频库:       http://localhost:3000/videos
echo   后端API:      http://localhost:8000
echo   API文档:      http://localhost:8000/docs
echo.
echo ========================================
echo   默认账号
echo ========================================
echo.
echo   邮箱: admin@example.com
echo   密码: admin123
echo.
echo ========================================
echo   常用命令
echo ========================================
echo.
echo   查看日志:     docker compose logs -f
echo   停止服务:     docker compose down
echo   重启服务:     docker compose restart
echo   查看状态:     docker compose ps
echo.

echo 按任意键打开浏览器...
pause >nul

start http://localhost:3000/login

echo.
echo 祝您使用愉快！
pause
