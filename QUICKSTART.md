# 🚀 快速启动指南

> 5分钟快速启动AI短视频爆款系统

## 前置要求

确保已安装：
- ✅ Docker Desktop 20.10+
- ✅ Docker Compose 2.0+

## 启动步骤

### 第1步：配置环境变量（1分钟）

```bash
# Windows PowerShell
Copy-Item .env.example .env

# 或使用命令提示符
copy .env.example .env
```

编辑 `.env` 文件，**至少修改以下3项**：

```bash
# 1. 生成JWT密钥（可以使用在线工具生成随机字符串）
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this

# 2. 设置管理员密码（建议使用强密码）
ADMIN_PASSWORD=your-strong-password

# 3. 配置DeepSeek API密钥（从 https://platform.deepseek.com 获取）
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
```

💡 **提示**: 其他配置可以暂时保持默认值，后续需要时再修改。

### 第2步：启动服务（2-3分钟）

```bash
docker-compose up --build
```

首次启动会：
- 下载Docker镜像（约1-2分钟，取决于网速）
- 构建后端和前端容器
- 初始化数据库
- 创建管理员账号
- 加载种子数据

看到以下输出表示启动成功：
```
backend      | Backend startup complete
frontend     | Ready in Xs
```

### 第3步：访问系统（1分钟）

在浏览器中打开：

| 服务 | 地址 | 说明 |
|------|------|------|
| 🌐 前端界面 | http://localhost:3000 | 主应用界面 |
| 📚 API文档 | http://localhost:8000/docs | Swagger UI |
| ❤️ 健康检查 | http://localhost:8000/api/health | 系统状态 |

### 第4步：登录系统

使用默认管理员账号登录：

- **邮箱**: `admin@example.com`
- **密码**: 你在`.env`中设置的`ADMIN_PASSWORD`值

⚠️ **重要**: 首次登录后建议立即修改密码！

## 常见问题

### ❓ Docker启动失败

**问题**: `Error: Cannot connect to the Docker daemon`

**解决**: 
1. 确保Docker Desktop正在运行
2. Windows用户检查Docker服务是否启动
3. 尝试重启Docker Desktop

---

### ❓ 端口被占用

**问题**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**解决**: 
1. 找到占用端口的进程并关闭
2. 或修改`docker-compose.yml`中的端口映射

```yaml
frontend:
  ports:
    - '3001:3000'  # 改为3001端口
```

---

### ❓ 数据库连接失败

**问题**: 后端日志显示数据库连接错误

**解决**:
```bash
# 重启数据库容器
docker-compose restart db

# 查看数据库日志
docker-compose logs db
```

---

### ❓ 前端页面空白

**问题**: 访问http://localhost:3000显示空白

**解决**:
1. 检查后端是否正常启动
2. 查看浏览器控制台是否有错误
3. 清除浏览器缓存后刷新

---

### ❓ 如何停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（⚠️ 会清空数据库）
docker-compose down -v
```

---

### ❓ 如何查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

---

### ❓ 如何重启单个服务

```bash
# 重启后端
docker-compose restart backend

# 重启前端
docker-compose restart frontend

# 重启数据库
docker-compose restart db
```

## 验证安装

运行验收测试脚本：

```bash
python verify_package1.py
```

应该看到：
```
✅ 所有测试通过！任务包1验收成功！
```

## 下一步

系统启动成功后，你可以：

1. 📖 阅读 [README.md](README.md) 了解完整功能
2. 🔧 访问 http://localhost:8000/docs 查看API文档
3. 🎯 开始使用系统：
   - 上传第一个视频
   - 创建商品档案
   - 配置AI供应商
   - 生成爆款分析

## 技术支持

如遇问题，请提供：
1. 错误日志（`docker-compose logs`）
2. 操作系统版本
3. Docker版本
4. 复现步骤

---

**祝你使用愉快！** 🎉
