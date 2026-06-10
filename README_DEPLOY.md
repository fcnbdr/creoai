# AI短视频爆款系统 - 生产环境部署指南

## 目录

- [前置要求](#前置要求)
- [快速部署](#快速部署)
- [环境变量配置](#环境变量配置)
- [HTTPS配置](#https配置)
- [数据库备份](#数据库备份)
- [监控与日志](#监控与日志)
- [故障排查](#故障排查)

---

## 前置要求

### 硬件要求
- CPU: 4核及以上
- 内存: 8GB及以上
- 硬盘: 100GB及以上（用于存储视频文件和数据库）
- 网络: 稳定的互联网连接（用于调用AI API）

### 软件要求
- Docker 20.10+
- Docker Compose 2.0+
- Git

---

## 快速部署

### 1. 克隆代码仓库

```bash
git clone <your-repo-url>
cd ecpro-iclip-system
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填写实际的API密钥和配置
nano .env
```

**必须修改的配置项：**
- `JWT_SECRET_KEY`: 生成一个强随机字符串
- `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`: 设置管理员账号
- `DEEPSEEK_API_KEY`: DeepSeek API密钥
- `OSS_ACCESS_KEY_ID` 和 `OSS_ACCESS_KEY_SECRET`: 阿里云OSS凭证（可选）

### 3. 启动服务

```bash
docker-compose up -d --build
```

### 4. 验证部署

```bash
# 检查所有服务状态
docker-compose ps

# 查看后端日志
docker-compose logs -f backend

# 测试健康检查
curl http://localhost:8000/api/health

# 访问前端
open http://localhost:3000
```

### 5. 运行数据库迁移

```bash
docker-compose exec backend alembic upgrade head
```

---

## 环境变量配置

### 核心配置项

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL连接字符串 | `postgresql://postgres:postgres@db:5432/aivideo` |
| `REDIS_URL` | Redis连接字符串 | `redis://redis:6379/0` |
| `JWT_SECRET_KEY` | JWT签名密钥 | 至少32字符的随机字符串 |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@example.com` |
| `ADMIN_PASSWORD` | 管理员密码 | 强密码 |

### AI服务配置

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | ✅ |
| `ECPRO_API_KEY` | ECPro API密钥 | ❌（可选） |
| `ICLIP_API_KEY` | iClip API密钥 | ❌（可选） |

### 对象存储配置（可选）

如果不配置OSS，系统将使用本地存储。

| 变量名 | 说明 |
|--------|------|
| `OSS_ACCESS_KEY_ID` | 阿里云Access Key ID |
| `OSS_ACCESS_KEY_SECRET` | 阿里云Access Key Secret |
| `OSS_BUCKET` | OSS Bucket名称 |
| `OSS_ENDPOINT` | OSS Endpoint |

---

## HTTPS配置

### 方案一：使用Let's Encrypt（推荐）

1. 安装certbot：
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. 获取证书：
```bash
sudo certbot --nginx -d your-domain.com
```

3. 更新nginx.conf，启用HTTPS部分配置

4. 重启Nginx：
```bash
docker-compose restart nginx
```

### 方案二：使用自有证书

1. 将证书文件放置到 `./ssl/` 目录：
   - `fullchain.pem`: 完整证书链
   - `privkey.pem`: 私钥

2. 取消nginx.conf中HTTPS配置的注释

3. 重启服务：
```bash
docker-compose up -d
```

---

## 数据库备份

### 自动备份脚本

创建备份脚本 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/aivideo_backup_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
docker-compose exec -T db pg_dump -U postgres aivideo > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### 设置定时任务

```bash
# 每天凌晨2点执行备份
crontab -e
# 添加以下行：
0 2 * * * /path/to/backup.sh >> /var/log/db_backup.log 2>&1
```

### 手动备份

```bash
docker-compose exec db pg_dump -U postgres aivideo > backup.sql
```

### 恢复数据

```bash
docker-compose exec -T db psql -U postgres aivideo < backup.sql
```

---

## 监控与日志

### 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f celery_worker
docker-compose logs -f frontend
```

### 资源监控

```bash
# 查看容器资源使用情况
docker stats

# 查看磁盘使用
docker system df
```

### 应用监控端点

- 健康检查: `http://your-domain/api/health`
- API文档: `http://your-domain/docs` (Swagger UI)
- ReDoc文档: `http://your-domain/redoc`

---

## 故障排查

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查PostgreSQL是否运行
docker-compose ps db

# 查看数据库日志
docker-compose logs db

# 重启数据库
docker-compose restart db
```

#### 2. Redis连接失败

```bash
# 检查Redis状态
docker-compose exec redis redis-cli ping

# 应该返回 PONG
```

#### 3. Celery Worker不工作

```bash
# 检查Celery日志
docker-compose logs celery_worker

# 重启Celery
docker-compose restart celery_worker
```

#### 4. 视频上传失败

检查：
- 磁盘空间是否充足
- `uploads` 目录权限
- Nginx的 `client_max_body_size` 配置

```bash
# 检查磁盘空间
df -h

# 检查uploads目录
ls -la uploads/
```

#### 5. AI API调用失败

检查：
- API密钥是否正确
- 网络连接是否正常
- API配额是否用完

```bash
# 测试DeepSeek API
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'
```

### 清理和重置

```bash
# 停止所有服务
docker-compose down

# 清理所有容器和数据卷（⚠️ 会删除所有数据）
docker-compose down -v

# 重新构建并启动
docker-compose up -d --build
```

---

## 性能优化建议

### 1. 数据库优化

在 `docker-compose.yml` 中为PostgreSQL增加资源限制：

```yaml
db:
  deploy:
    resources:
      limits:
        memory: 2G
      reservations:
        memory: 1G
```

### 2. Celery Worker扩展

增加worker并发数：

```yaml
celery_worker:
  command: celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4
```

### 3. 静态文件CDN

对于生产环境，建议将静态文件（上传的视频和图片）托管到CDN以提升加载速度。

---

## 安全建议

1. **定期更新依赖**: `pip install --upgrade -r requirements.txt`
2. **使用强密码**: 数据库、管理员账号、JWT密钥
3. **启用HTTPS**: 生产环境必须使用HTTPS
4. **限制API访问**: 使用防火墙限制不必要的端口暴露
5. **定期备份**: 至少每天备份一次数据库
6. **监控日志**: 定期检查异常日志

---

## 联系支持

如遇问题，请提供：
- 错误日志（`docker-compose logs`）
- 环境变量配置（隐藏敏感信息）
- 复现步骤

---

**最后更新**: 2026-06-07
