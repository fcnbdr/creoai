# AI短视频爆款系统 - Docker Desktop 自动安装助手
# 使用方法: 以管理员身份运行 PowerShell，然后执行 .\install-docker.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Docker Desktop 自动安装助手" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-Not $isAdmin) {
    Write-Host "[错误] 请以管理员身份运行此脚本！" -ForegroundColor Red
    Write-Host ""
    Write-Host "操作方法：" -ForegroundColor Yellow
    Write-Host "1. 右键点击 PowerShell" -ForegroundColor White
    Write-Host "2. 选择 '以管理员身份运行'" -ForegroundColor White
    Write-Host "3. 重新运行此脚本" -ForegroundColor White
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

Write-Host "[成功] 已获取管理员权限" -ForegroundColor Green
Write-Host ""

# 步骤 1: 检查 WSL 2 状态
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  步骤 1/5: 检查 WSL 2 状态" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $wslStatus = wsl --status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[成功] WSL 2 已安装" -ForegroundColor Green
        Write-Host ""
        Write-Host $wslStatus -ForegroundColor Gray
    } else {
        Write-Host "[提示] WSL 2 未安装，正在安装..." -ForegroundColor Yellow
        Write-Host ""
        
        # 安装 WSL 2
        wsl --install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[成功] WSL 2 安装完成" -ForegroundColor Green
            Write-Host ""
            Write-Host "[重要] 需要重启电脑才能使用 WSL 2" -ForegroundColor Yellow
            Write-Host ""
            
            $restart = Read-Host "是否立即重启电脑? (Y/N)"
            if ($restart -eq "Y" -or $restart -eq "y") {
                Write-Host "正在重启电脑..." -ForegroundColor Cyan
                Restart-Computer
                exit 0
            } else {
                Write-Host ""
                Write-Host "[提示] 请手动重启电脑后，再次运行此脚本" -ForegroundColor Yellow
                Read-Host "按回车键退出"
                exit 0
            }
        } else {
            Write-Host "[错误] WSL 2 安装失败" -ForegroundColor Red
            Write-Host ""
            Write-Host "请手动安装 WSL 2:" -ForegroundColor Yellow
            Write-Host "1. 打开 PowerShell（管理员）" -ForegroundColor White
            Write-Host "2. 运行: wsl --install" -ForegroundColor White
            Write-Host "3. 重启电脑" -ForegroundColor White
            Write-Host ""
            Read-Host "按回车键退出"
            exit 1
        }
    }
} catch {
    Write-Host "[错误] 检查 WSL 2 状态时出错: $_" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 步骤 2: 检查虚拟化支持
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  步骤 2/5: 检查虚拟化支持" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # 检查 Hyper-V 服务
    $hyperVService = Get-Service vmms -ErrorAction SilentlyContinue
    if ($hyperVService) {
        Write-Host "[成功] Hyper-V 虚拟化服务已启用" -ForegroundColor Green
    } else {
        Write-Host "[警告] Hyper-V 服务未找到" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "这可能是因为您使用的是 WSL 2 后端（推荐）" -ForegroundColor Cyan
        Write-Host "WSL 2 不需要启用 Hyper-V" -ForegroundColor Cyan
    }
} catch {
    Write-Host "[提示] 无法检测虚拟化状态（非致命错误）" -ForegroundColor Yellow
}

Write-Host ""

# 步骤 3: 下载 Docker Desktop
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  步骤 3/5: 下载 Docker Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$downloadUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$installerPath = "$env:TEMP\DockerDesktopInstaller.exe"

if (Test-Path $installerPath) {
    Write-Host "[提示] 发现已下载的 Docker 安装程序" -ForegroundColor Yellow
    $useExisting = Read-Host "是否使用已下载的文件? (Y/N)"
    if ($useExisting -ne "Y" -and $useExisting -ne "y") {
        Remove-Item $installerPath -Force
    }
}

if (-Not (Test-Path $installerPath)) {
    Write-Host "[信息] 正在下载 Docker Desktop Installer..." -ForegroundColor Cyan
    Write-Host "下载地址: $downloadUrl" -ForegroundColor Gray
    Write-Host "保存位置: $installerPath" -ForegroundColor Gray
    Write-Host ""
    
    try {
        # 使用 Invoke-WebRequest 下载
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        
        if (Test-Path $installerPath) {
            $fileSize = (Get-Item $installerPath).Length / 1MB
            Write-Host "[成功] 下载完成 (文件大小: $([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
        } else {
            Write-Host "[错误] 下载失败" -ForegroundColor Red
            Write-Host ""
            Write-Host "请手动下载:" -ForegroundColor Yellow
            Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
            Write-Host ""
            Read-Host "按回车键退出"
            exit 1
        }
    } catch {
        Write-Host "[错误] 下载失败: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "请手动下载并安装 Docker Desktop:" -ForegroundColor Yellow
        Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "按回车键退出"
        exit 1
    }
} else {
    $fileSize = (Get-Item $installerPath).Length / 1MB
    Write-Host "[成功] 使用已下载的安装程序 (文件大小: $([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
}

Write-Host ""

# 步骤 4: 安装 Docker Desktop
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  步骤 4/5: 安装 Docker Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[提示] 即将启动 Docker Desktop 安装程序" -ForegroundColor Yellow
Write-Host "[提示] 请在安装向导中勾选以下选项:" -ForegroundColor Yellow
Write-Host "  ☑ Use WSL 2 instead of Hyper-V (recommended)" -ForegroundColor White
Write-Host "  ☑ Add shortcut to desktop" -ForegroundColor White
Write-Host ""
Write-Host "[提示] 安装时间约 5-10 分钟，请耐心等待..." -ForegroundColor Cyan
Write-Host ""

$installNow = Read-Host "是否现在开始安装? (Y/N)"
if ($installNow -eq "Y" -or $installNow -eq "y") {
    Write-Host ""
    Write-Host "正在启动安装程序..." -ForegroundColor Cyan
    Start-Process -FilePath $installerPath -Wait
    
    Write-Host ""
    Write-Host "[成功] 安装程序已完成" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[提示] 您可以稍后手动运行安装程序:" -ForegroundColor Yellow
    Write-Host "$installerPath" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "按回车键退出"
    exit 0
}

Write-Host ""

# 步骤 5: 启动 Docker Desktop
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  步骤 5/5: 启动 Docker Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[提示] 正在启动 Docker Desktop..." -ForegroundColor Cyan
Write-Host "[提示] 首次启动需要 2-3 分钟初始化引擎" -ForegroundColor Yellow
Write-Host ""

# 查找 Docker Desktop 安装路径
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
    "${env:LOCALAPPDATA}\Programs\Docker\Docker\Docker Desktop.exe"
)

$dockerExe = $null
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        $dockerExe = $path
        break
    }
}

if ($dockerExe) {
    Write-Host "[成功] 找到 Docker Desktop: $dockerExe" -ForegroundColor Green
    Write-Host ""
    Write-Host "正在启动 Docker Desktop..." -ForegroundColor Cyan
    Start-Process -FilePath $dockerExe
    
    Write-Host ""
    Write-Host "[重要] 请等待 Docker Desktop 完全启动" -ForegroundColor Yellow
    Write-Host "[重要] 观察系统托盘图标，直到显示 'Engine running'" -ForegroundColor Yellow
    Write-Host ""
    
    $waitTime = 0
    $maxWaitTime = 180  # 最多等待 3 分钟
    
    Write-Host "等待 Docker 引擎启动..." -ForegroundColor Cyan
    while ($waitTime -lt $maxWaitTime) {
        Start-Sleep -Seconds 5
        $waitTime += 5
        
        try {
            docker info | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "[成功] Docker 引擎已就绪！" -ForegroundColor Green
                break
            }
        } catch {
            # 继续等待
        }
        
        Write-Host "  已等待 ${waitTime}秒... (最多 ${maxWaitTime}秒)" -ForegroundColor Gray
    }
    
    if ($waitTime -ge $maxWaitTime) {
        Write-Host ""
        Write-Host "[警告] 等待超时，Docker 可能仍在启动中" -ForegroundColor Yellow
        Write-Host "[提示] 请手动检查 Docker Desktop 状态" -ForegroundColor Yellow
    }
} else {
    Write-Host "[错误] 未找到 Docker Desktop 可执行文件" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动启动 Docker Desktop:" -ForegroundColor Yellow
    Write-Host "1. 从桌面快捷方式启动" -ForegroundColor White
    Write-Host "2. 或从开始菜单搜索 'Docker Desktop'" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  安装完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 验证安装
Write-Host "[验证] 检查 Docker 版本..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "[成功] $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[警告] 无法获取 Docker 版本（可能需要重启终端）" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[验证] 检查 Docker Compose 版本..." -ForegroundColor Cyan
try {
    $composeVersion = docker compose version
    Write-Host "[成功] $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "[警告] 无法获取 Docker Compose 版本" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下一步操作" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 确保 Docker Desktop 左下角显示 'Engine running'" -ForegroundColor White
Write-Host "2. 在项目目录运行启动脚本:" -ForegroundColor White
Write-Host "   .\start.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "或者手动启动:" -ForegroundColor White
Write-Host "   docker compose up -d --build" -ForegroundColor Cyan
Write-Host ""
Write-Host "详细文档:" -ForegroundColor White
Write-Host "  - DOCKER_INSTALLATION_GUIDE.md" -ForegroundColor Cyan
Write-Host "  - QUICK_START.md" -ForegroundColor Cyan
Write-Host "  - README.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "按回车键打开项目目录"

# 打开项目目录
explorer.exe "."
