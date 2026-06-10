# Docker Desktop 安装完整教程

## 📋 目录
1. [系统要求](#系统要求)
2. [下载 Docker Desktop](#下载-docker-desktop)
3. [安装步骤（图文详解）](#安装步骤图文详解)
4. [首次启动配置](#首次启动配置)
5. [验证安装](#验证安装)
6. [常见问题解决](#常见问题解决)
7. [启动项目](#启动项目)

---

## 💻 系统要求

### Windows 版本要求
- ✅ **Windows 10 64位**：专业版、企业版或教育版（版本 2004 或更高）
- ✅ **Windows 11**：所有版本
- ❌ Windows 10 家庭版需要额外配置 WSL 2

### 硬件要求
- **CPU**：支持虚拟化的64位处理器
- **内存**：至少 4GB RAM（推荐 8GB+）
- **硬盘**：至少 10GB 可用空间
- **BIOS**：启用虚拟化技术（Intel VT-x / AMD-V）

### 检查虚拟化是否启用
1. 按 `Ctrl + Shift + Esc` 打开任务管理器
2. 切换到 **"性能"** 标签
3. 点击 **"CPU"**
4. 查看右下角：**"虚拟化：已启用"**

如果显示"已禁用"，需要进入 BIOS 启用虚拟化：
- **Intel CPU**：找到 Intel Virtualization Technology 或 VT-x，设置为 Enabled
- **AMD CPU**：找到 SVM Mode 或 AMD-V，设置为 Enabled

---

## 📥 下载 Docker Desktop

### 方法1：官方网站下载（推荐）
1. 访问：https://www.docker.com/products/docker-desktop/
2. 点击 **"Download for Windows"** 按钮
3. 等待下载完成（文件大小约 500MB）

### 方法2：直接下载链接
```
https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
```

### 方法3：使用 Chocolatey（包管理器）
如果您已安装 Chocolatey，可以运行：
```powershell
choco install docker-desktop
```

---

## 🔧 安装步骤（图文详解）

### 步骤 1：运行安装程序
1. 找到下载的 `Docker Desktop Installer.exe` 文件
2. **右键点击** → 选择 **"以管理员身份运行"**
3. 如果弹出用户账户控制（UAC），点击 **"是"**

![运行安装程序](https://docs.docker.com/desktop/images/install-wizard-1.png)

### 步骤 2：接受许可协议
1. 阅读 Docker 许可协议
2. 勾选 **"I accept the terms"**
3. 点击 **"OK"**

![接受协议](https://docs.docker.com/desktop/images/install-wizard-2.png)

### 步骤 3：配置选项（重要！）

会出现配置对话框，请按以下设置：

#### ✅ 推荐配置
```
☑️ Use WSL 2 instead of Hyper-V (recommended)
   └─ 使用 WSL 2 后端，性能更好，资源占用更少

☑️ Add shortcut to desktop
   └─ 在桌面创建快捷方式，方便快速访问

☐ Start Docker Desktop when you log in
   └─ 登录时自动启动（可选，根据需求决定）
```

#### ❌ 不推荐配置
```
☐ Use Windows containers instead of Linux containers
   └─ 除非您需要运行 Windows 容器，否则不要勾选
```

![配置选项](https://docs.docker.com/desktop/images/install-wizard-3.png)

点击 **"OK"** 开始安装。

### 步骤 4：等待安装完成
- 安装进度条会显示当前状态
- 安装时间：**5-10分钟**（取决于电脑性能）
- 期间可能会弹出多个 UAC 提示，全部点击 **"是"**

![安装进度](https://docs.docker.com/desktop/images/install-wizard-4.png)

### 步骤 5：安装完成
- 看到 **"Installation succeeded!"** 提示
- 点击 **"Close and restart"** 或 **"Close"**
- Docker Desktop 会自动启动

---

## 🚀 首次启动配置

### 启动 Docker Desktop
1. 从桌面快捷方式或开始菜单启动
2. 首次启动会显示欢迎界面
3. 可以选择跳过教程，直接点击 **"Get Started"** 或关闭

### 等待引擎初始化
启动后，左下角状态栏会显示：

```
Starting... 
    ↓
Engine starting...
    ↓
Engine running ✓
```

**初始化时间**：约 2-3 分钟

![引擎启动](https://docs.docker.com/desktop/images/engine-starting.png)

### 确认就绪状态
看到以下标志表示 Docker 已就绪：
- ✅ 左下角显示绿色圆点
- ✅ 文字显示 **"Engine running"**
- ✅ 可以点击鲸鱼图标查看菜单

---

## ✅ 验证安装

### 方法1：命令行验证
打开 **PowerShell** 或 **命令提示符**，运行以下命令：

#### 检查 Docker 版本
```powershell
docker --version
```
预期输出：
```
Docker version 24.0.x, build xxxxxxx
```

#### 检查 Docker Compose 版本
```powershell
docker compose version
```
预期输出：
```
Docker Compose version v2.x.x
```

#### 运行测试容器
```powershell
docker run hello-world
```
预期输出：
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

### 方法2：Docker Desktop 界面验证
1. 点击系统托盘中的 Docker 图标（鲸鱼图标）
2. 应该能看到菜单选项：
   - Dashboard
   - Settings
   - Troubleshoot
   - Quit Docker Desktop

---

## ❓ 常见问题解决

### 问题1：WSL 2 未安装

**错误信息**：
```
WSL 2 installation is incomplete.
```

**解决方案**：
1. 以管理员身份打开 PowerShell
2. 运行以下命令：
```powershell
wsl --install
```
3. 重启电脑
4. 重新启动 Docker Desktop

### 问题2：虚拟化未启用

**错误信息**：
```
Hardware assisted virtualization and data execution protection must be enabled in the BIOS.
```

**解决方案**：
1. 重启电脑，进入 BIOS（通常按 F2、F10、Del 或 Esc）
2. 找到虚拟化设置：
   - **Intel CPU**：Intel Virtualization Technology / VT-x
   - **AMD CPU**：SVM Mode / AMD-V
3. 设置为 **Enabled**
4. 保存并退出（通常按 F10）
5. 重新启动 Docker Desktop

### 问题3：端口冲突

**错误信息**：
```
Port 5432 is already in use.
```

**解决方案**：
1. 检查是否有其他 PostgreSQL 服务正在运行
2. 停止冲突的服务，或修改 docker-compose.yml 中的端口映射

### 问题4：内存不足

**症状**：
- Docker Desktop 启动缓慢
- 容器运行卡顿

**解决方案**：
1. 点击 Docker 图标 → Settings → Resources
2. 调整资源分配：
   - CPU：2-4 核
   - Memory：4-8 GB
   - Swap：1-2 GB
3. 点击 **"Apply & Restart"**

### 问题5：防火墙阻止

**症状**：
- 无法拉取镜像
- 网络连接失败

**解决方案**：
1. 打开 Windows 防火墙设置
2. 允许 Docker Desktop 通过防火墙
3. 或者暂时禁用防火墙测试

---

## 🎯 启动项目

### 安装完成后的操作

#### 1. 克隆或打开项目
```powershell
cd "e:\桌面文件夹\ECPro + iClip）全部应用功能结合开发"
```

#### 2. 复制环境变量文件
```powershell
cp .env.example .env
```

编辑 `.env` 文件，填写必要的 API Key（可选，有默认值）。

#### 3. 启动所有服务
```powershell
docker compose up -d --build
```

**参数说明**：
- `-d`：后台运行（detached mode）
- `--build`：重新构建镜像

#### 4. 查看服务状态
```powershell
docker compose ps
```

应该看到以下服务：
```
NAME                STATUS              PORTS
db                  Up                  5432/tcp
redis               Up                  6379/tcp
backend             Up                  0.0.0.0:8000->8000/tcp
worker              Up                  
frontend            Up                  0.0.0.0:3000->3000/tcp
```

#### 5. 查看日志（调试用）
```powershell
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f worker
```

#### 6. 访问系统
- **前端**：http://localhost:3000
- **后端API**：http://localhost:8000
- **API文档**：http://localhost:8000/docs
- **登录页面**：http://localhost:3000/login

#### 7. 停止服务
```powershell
# 停止所有服务
docker compose down

# 停止并删除数据卷（谨慎使用！）
docker compose down -v
```

---

## 📊 服务架构

```
┌─────────────────────────────────────┐
│         Docker Compose Stack        │
├─────────────────────────────────────┤
│                                     │
│  frontend (Next.js)                 │
│  Port: 3000                         │
│  └─> 用户界面                        │
│                                     │
│  backend (FastAPI)                  │
│  Port: 8000                         │
│  └─> REST API                       │
│                                     │
│  worker (Celery)                    │
│  └─> 异步任务处理                    │
│                                     │
│  db (PostgreSQL)                    │
│  Port: 5432 (内部)                   │
│  └─> 关系型数据库                    │
│                                     │
│  redis (Redis)                      │
│  Port: 6379 (内部)                   │
│  └─> 缓存 + 消息队列                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔗 有用链接

- **Docker 官方文档**：https://docs.docker.com/
- **Docker Desktop 文档**：https://docs.docker.com/desktop/
- **Docker Compose 文档**：https://docs.docker.com/compose/
- **WSL 2 文档**：https://docs.microsoft.com/en-us/windows/wsl/
- **项目 README**：./README.md
- **快速开始指南**：./QUICKSTART.md
- **部署文档**：./README_DEPLOY.md

---

## 📞 获取帮助

如果遇到问题：

1. **查看日志**：`docker compose logs -f`
2. **检查服务状态**：`docker compose ps`
3. **重启服务**：`docker compose restart`
4. **完全重置**：`docker compose down -v && docker compose up -d --build`
5. **查看 Docker Desktop 日志**：点击鲸鱼图标 → Troubleshoot → Get Support

---

**祝您安装顺利！** 🎉

如有任何问题，请参考本文档或查看项目 Issue。
