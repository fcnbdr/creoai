# ========================================
# Docker Desktop 快速安装指南
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Docker Desktop 安装助手" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-Not $isAdmin) {
    Write-Host "[错误] 请以管理员身份运行此脚本！" -ForegroundColor Red
    Write-Host "右键点击 PowerShell -> 选择 '以管理员身份运行'" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

Write-Host "[成功] 已获取管理员权限" -ForegroundColor Green
Write-Host ""

# 步骤1: 检查WSL2
Write-Host "步骤 1/4: 检查 WSL 2..." -ForegroundColor Cyan
try {
    wsl --status | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[成功] WSL 2 已安装" -ForegroundColor Green
    } else {
        Write-Host "[提示] 正在安装 WSL 2..." -ForegroundColor Yellow
        wsl --install
        Write-Host "[重要] 请重启电脑后继续" -ForegroundColor Yellow
        $restart = Read-Host "是否立即重启? (Y/N)"
        if ($restart -eq "Y" -or $restart -eq "y") { Restart-Computer }
        exit 0
    }
} catch {
    Write-Host "[错误] WSL 2 检查失败" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤2: 下载Docker
Write-Host "步骤 2/4: 下载 Docker Desktop..." -ForegroundColor Cyan
$downloadUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$installerPath = "$env:TEMP\DockerDesktopInstaller.exe"

if (-Not (Test-Path $installerPath)) {
    Write-Host "正在下载... (约500MB，请耐心等待)" -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "[成功] 下载完成" -ForegroundColor Green
    } catch {
        Write-Host "[错误] 下载失败，请手动下载:" -ForegroundColor Red
        Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "[成功] 使用已下载的文件" -ForegroundColor Green
}

Write-Host ""

# 步骤3: 安装Docker
Write-Host "步骤 3/4: 安装 Docker Desktop..." -ForegroundColor Cyan
Write-Host "请在安装向导中勾选:" -ForegroundColor Yellow
Write-Host "  [x] Use WSL 2 instead of Hyper-V" -ForegroundColor White
Write-Host "  [x] Add shortcut to desktop" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "开始安装? (Y/N)"
if ($confirm -eq "Y" -or $confirm -eq "y") {
    Start-Process -FilePath $installerPath -Wait
    Write-Host "[成功] 安装完成" -ForegroundColor Green
} else {
    Write-Host "[提示] 稍后可手动运行: $installerPath" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# 步骤4: 启动Docker
Write-Host "步骤 4/4: 启动 Docker Desktop..." -ForegroundColor Cyan
$dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (Test-Path $dockerExe) {
    Start-Process -FilePath $dockerExe
    Write-Host "[提示] 等待左下角显示 'Engine running' (约2-3分钟)" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "等待 Docker 启动..." -ForegroundColor Cyan
    for ($i = 1; $i -le 36; $i++) {
        Start-Sleep -Seconds 5
        try {
            docker info | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[成功] Docker 引擎已就绪！" -ForegroundColor Green
                break
            }
        } catch {}
        Write-Host "  等待中... ($($i*5)秒)" -ForegroundColor Gray
    }
} else {
    Write-Host "[提示] 请手动启动 Docker Desktop" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  安装完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步: 运行 .\start.ps1 启动项目" -ForegroundColor Cyan
Write-Host ""

Read-Host "按回车键退出"
