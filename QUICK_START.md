# 🚀 快速开始 - 3步启动系统

## 前提条件
- ✅ Windows 10/11 64位
- ✅ 至少 8GB RAM
- ✅ 至少 10GB 硬盘空间

---

## 📦 第1步：安装 Docker Desktop

### 下载地址
```
https://www.docker.com/products/docker-desktop/
```

### 安装要点
1. 以管理员身份运行安装程序
2. 勾选 **"Use WSL 2 instead of Hyper-V"**
3. 等待安装完成（5-10分钟）
4. 启动 Docker Desktop
5. 等待左下角显示 **"Engine running"** ✓

### 验证安装
```powershell
docker --version
docker compose version
```

**详细教程**: 查看 [DOCKER_INSTALLATION_GUIDE.md](DOCKER_INSTALLATION_GUIDE.md)

---

## ⚙️ 第2步：配置环境变量

```powershell
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件（可选，有默认值）
notepad .env
```

需要配置的 API Key（可选）：
- `DEEPSEEK_API_KEY` - DeepSeek AI
- `OPENAI_API_KEY` - OpenAI（可选）
- `ECPRO_API_KEY` - ECPro 商品同步
- `ICLIP_API_KEY` - iClip 视频生成

---

## 🎯 第3步：一键启动

### 方法1：使用启动脚本（推荐）
```powershell
.\start.ps1
```

或

```cmd
start.bat
```

### 方法2：手动启动
```powershell
docker compose up -d --build
```

---

## 🌐 访问系统

| 服务 | 地址 |
|------|------|
| **登录页面** | http://localhost:3000/login |
| **前端首页** | http://localhost:3000 |
| **视频库** | http://localhost:3000/videos |
| **后端API** | http://localhost:8000 |
| **API文档** | http://localhost:8000/docs |

### 默认账号
```
邮箱: admin@example.com
密码: admin123
```

---

## 🔧 常用命令

```powershell
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 完全重置（删除数据）
docker compose down -v
```

---

## ❓ 常见问题

### Docker 未安装？
→ 查看 [DOCKER_INSTALLATION_GUIDE.md](DOCKER_INSTALLATION_GUIDE.md)

### 端口被占用？
→ 修改 `docker-compose.yml` 中的端口映射

### 服务启动失败？
```powershell
docker compose logs -f backend
docker compose logs -f frontend
```

### 需要帮助？
→ 查看 [README.md](README.md) 和 [QUICKSTART.md](QUICKSTART.md)

---

**祝您使用愉快！** 🎉
