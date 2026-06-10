# AI短视频爆款系统 - PowerShell 快速启动脚本
# 使用方法: .\start.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI短视频爆款系统 - 快速启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否安装
Write-Host "[检查] Docker 是否安装..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "[成功] $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] Docker 未安装或未添加到系统路径" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Docker Desktop:" -ForegroundColor Yellow
    Write-Host "1. 访问: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. 下载并安装 Docker Desktop for Windows" -ForegroundColor White
    Write-Host "3. 重启电脑" -ForegroundColor White
    Write-Host "4. 运行此脚本" -ForegroundColor White
    Write-Host ""
    Write-Host "详细安装指南请查看: DOCKER_INSTALLATION_GUIDE.md" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

# 检查 Docker Compose
Write-Host "[检查] Docker Compose 版本..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "[成功] $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "[警告] Docker Compose 可能未正确安装" -ForegroundColor Yellow
}

Write-Host ""

# 检查 Docker 引擎状态
Write-Host "[检查] Docker 引擎状态..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "[成功] Docker 引擎正在运行" -ForegroundColor Green
} catch {
    Write-Host "[错误] Docker 引擎未运行" -ForegroundColor Red
    Write-Host ""
    Write-Host "请启动 Docker Desktop 应用程序" -ForegroundColor Yellow
    Write-Host "等待左下角显示 'Engine running' 后再运行此脚本" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 检查 .env 文件
if (-Not (Test-Path ".env")) {
    Write-Host "[提示] 未找到 .env 文件，正在从 .env.example 复制..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[成功] 已创建 .env 文件" -ForegroundColor Green
    Write-Host "[提示] 请编辑 .env 文件配置必要的 API Key（可选）" -ForegroundColor Cyan
} else {
    Write-Host "[成功] 找到 .env 文件" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  开始启动所有服务..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 构建镜像
Write-Host "[步骤 1/3] 构建 Docker 镜像..." -ForegroundColor Yellow
docker compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 镜像构建失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 步骤 2: 启动服务
Write-Host "[步骤 2/3] 启动所有服务..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 服务启动失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 步骤 3: 等待服务启动
Write-Host "[步骤 3/3] 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  服务启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 显示服务状态
Write-Host "[信息] 服务状态:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  访问地址" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  前端首页:     http://localhost:3000" -ForegroundColor White
Write-Host "  登录页面:     http://localhost:3000/login" -ForegroundColor White
Write-Host "  视频库:       http://localhost:3000/videos" -ForegroundColor White
Write-Host "  后端API:      http://localhost:8000" -ForegroundColor White
Write-Host "  API文档:      http://localhost:8000/docs" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  默认账号" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  邮箱: admin@example.com" -ForegroundColor White
Write-Host "  密码: admin123" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  常用命令" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  查看日志:     docker compose logs -f" -ForegroundColor Gray
Write-Host "  停止服务:     docker compose down" -ForegroundColor Gray
Write-Host "  重启服务:     docker compose restart" -ForegroundColor Gray
Write-Host "  查看状态:     docker compose ps" -ForegroundColor Gray
Write-Host ""

# 询问是否打开浏览器
$openBrowser = Read-Host "是否打开浏览器? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "http://localhost:3000/login"
}

Write-Host ""
Write-Host "祝您使用愉快！" -ForegroundColor Green
Read-Host "按回车键退出"
