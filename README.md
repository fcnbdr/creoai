# CreoAI - 电商AI内容生产全能引擎

> 版本：V4.0-FUSION | 日期：2026-06-08  
> **DeepSeek智能分析 + ECPro图文生产 + iClip视频创作 的完整融合系统**

## 📋 项目简介

这是一个完整的"从爆款分析到AI成片、再到全平台分发"的电商内容生产引擎系统，深度融合了DeepSeek、ECPro和iClip三大AI能力。

### 核心能力

| 能力模块 | 功能说明 |
|---------|----------|
| 🔍 DeepSeek智能分析 | 音频转写、关键帧视觉分析、爆款结构拆解、选题推荐 |
| ✍️ ECPro图文生产 | 智能抠图、批量生成主图、详情页自动生成、跨平台上架 |
| 🎬 iClip视频创作 | 图片生成视频、微详情短视频、直播切片、积分管理 |
| ✨ 内容生产中心 | ECPro+iClip一站式融合,图文+视频全链路生产 |
| 🚀 跨平台分发 | 淘宝、天猫、京东、唯品会、拼多多、抖音等16+平台一键发布 |

---

## 🗂️ 目录结构

```
.
├── backend/              # FastAPI 后端服务
│   ├── app/
│   │   ├── api/         # API路由
│   │   ├── core/        # 核心配置
│   │   ├── db/          # 数据库连接
│   │   ├── models.py    # 数据模型
│   │   ├── schemas/     # Pydantic模式
│   │   ├── services/    # 业务逻辑
│   │   └── tasks/       # Celery任务
│   ├── alembic/         # 数据库迁移
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # Next.js 前端应用
│   ├── app/             # App Router页面
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # 容器编排
├── nginx.conf           # Nginx配置
├── .env.example         # 环境变量示例
├── README.md            # 项目说明
└── README_DEPLOY.md     # 部署指南
```

---

## 🚀 快速启动

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 步骤1：配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，至少修改以下配置：
# - JWT_SECRET_KEY: 生成一个强随机字符串
# - ADMIN_EMAIL 和 ADMIN_PASSWORD: 设置管理员账号
# - DEEPSEEK_API_KEY: DeepSeek API密钥
```

### 步骤2：启动所有服务

```bash
docker-compose up --build
```

首次启动会自动：
- 创建数据库表
- 初始化管理员账号
- 初始化品类、AI供应商、模板等种子数据

### 步骤3：访问系统

- **前端界面**: http://localhost:3000
- **后端API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/health
- **内容生产中心**: http://localhost:3000/content-production

### 默认管理员账号

- 邮箱: `admin@example.com`（可在.env中修改）
- 密码: `admin123`（可在.env中修改）

⚠️ **重要**: 首次登录后请立即修改密码！

---

## 🛠️ 技术栈

### 后端
- **框架**: FastAPI (Python 3.11+)
- **数据库**: PostgreSQL + pgvector
- **ORM**: SQLAlchemy 2.0
- **队列**: Redis + Celery
- **视频处理**: FFmpeg
- **迁移工具**: Alembic
- **AI网关**: 自建AIGateway(支持DeepSeek/ECPro/iClip多Provider)

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS变量主题系统
- **组件库**: shadcn/ui
- **特色功能**: 深浅色主题切换、动态粒子动画、磨砂玻璃效果

### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **对象存储**: 阿里云OSS / S3兼容 / 本地存储
- **AI网关**: 自建AIGateway

---

## 📊 数据库表清单

### 核心业务表
- `users` - 用户账号
- `categories` - 视频品类管理
- `product_profiles` - 商品档案
- `videos` - 视频主表
- `video_assets` - 视频处理素材
- `analyses` - 爆款分析结果
- `replications` - 复刻脚本
- `topic_recommendations` - 选题推荐

### AI与外部服务表
- `ai_providers` - AI供应商配置
- `ai_models` - 模型映射表
- `ai_prompts` - Prompt版本管理
- `ai_calls` - AI调用日志
- `iclip_token_quota` - iClip积分额度
- `cost_limits` - 成本上限控制

### 内容生产与分发表
- `ecpro_templates` - ECPro详情页模板
- `ecpro_content_jobs` - ECPro图文生产任务
- `iclip_video_jobs` - iClip视频生成任务
- `video_templates` - 视频模板管理
- `content_distributions` - 内容分发记录
- `platform_credentials` - 各平台API凭证

### 任务与日志表
- `crawl_jobs` - 每日自动采集任务
- `job_logs` - 任务执行日志

---

## 🔌 API接口概览

所有接口前缀 `/api`，需JWT鉴权（除登录外）。

### 主要模块

| 模块 | 路径前缀 | 说明 |
|------|---------|------|
| 认证 | `/auth` | 登录、注册、用户信息 |
| AI配置 | `/ai` | 供应商管理、测试台、模型映射 |
| 视频库 | `/videos` | 上传、导入、分析、复刻 |
| 商品档案 | `/products` | CRUD操作 |
| 选题推荐 | `/recommendations` | 推荐列表、导出 |
| ECPro图文 | `/ecpro` | 详情页生成、批量生产、跨平台上架 |
| iClip视频 | `/iclip` | 视频生成、积分查询、模板管理 |
| 分发管理 | `/distribution` | 多平台发布、凭证管理 |
| 成本统计 | `/costs` | AI成本、调用详情 |
| 任务日志 | `/jobs` | 任务列表、重试 |

详细API文档请访问: http://localhost:8000/docs

---

## ⚙️ 环境变量详解

详见 `.env.example` 文件。

### 必须配置项

```bash
# 数据库
DATABASE_URL=postgresql://postgres:postgres@db:5432/aivideo

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=<生成一个强随机字符串>

# 管理员
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<强密码>

# DeepSeek API
DEEPSEEK_API_KEY=<你的DeepSeek API密钥>
```

### 可选配置项

```bash
# 阿里云OSS（不配置则使用本地存储）
OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_secret
OSS_BUCKET=your-bucket
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# ECPro API
ECPRO_API_KEY=your-ecpro-key

# iClip API
ICLIP_API_KEY=your-iclip-key
```

---

## 🧪 测试验证

### 核心闭环检验

1. ✅ 配置DeepSeek接口并测试成功
2. ✅ 上传视频并完成音频/关键帧抽取
3. ✅ 完成口播转写和视觉分析
4. ✅ 生成爆款结构拆解
5. ✅ 选择商品生成原创复刻脚本
6. ✅ 生成选题推荐和推荐理由

### 运行测试

```bash
# 健康检查
curl http://localhost:8000/api/health

# 登录获取Token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 查看视频列表（需要替换TOKEN）
curl http://localhost:8000/api/videos \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 📦 交付物清单

- [x] 完整代码仓库（frontend + backend）
- [x] 数据库迁移文件（Alembic）
- [x] README.md（启动方式、环境变量、API文档）
- [x] README_DEPLOY.md（生产环境部署指南）
- [x] Mock数据种子脚本（自动初始化）
- [x] API文档（FastAPI自动生成，访问`/docs`）
- [x] Docker Compose配置
- [x] Nginx配置（支持HTTPS）

---

## 🔒 安全注意事项

1. **不要在代码中硬编码API密钥**：所有敏感信息通过环境变量管理
2. **定期更换JWT密钥**：建议每月更换一次
3. **启用HTTPS**：生产环境必须使用HTTPS
4. **限制文件上传大小**：默认200MB，可根据需要调整
5. **定期备份数据库**：至少每天一次
6. **监控AI调用成本**：设置每日/每月上限

---

## 📝 开发规范

### 后端开发

- 遵循PEP 8代码规范
- 所有API返回统一格式：`{code, data, message}`
- 使用Pydantic进行请求/响应验证
- 异步任务使用Celery
- 数据库变更必须编写Alembic迁移脚本

### 前端开发

- 使用TypeScript严格模式
- 组件采用函数式编程 + Hooks
- 样式使用Tailwind CSS工具类
- 遵循shadcn/ui设计规范
- 深色主题，响应式布局

---

## 🐛 故障排查

详见 [README_DEPLOY.md](README_DEPLOY.md) 的"故障排查"章节。

常见问题：
- 数据库连接失败 → 检查PostgreSQL是否运行
- Redis连接失败 → 检查Redis状态
- Celery Worker不工作 → 查看Celery日志
- 视频上传失败 → 检查磁盘空间和目录权限

---

## 📄 许可证

本项目仅供学习和研究使用。

---

## 🤝 联系与支持

如遇问题，请提供：
- 错误日志（`docker-compose logs`）
- 环境变量配置（隐藏敏感信息）
- 复现步骤

---

**最后更新**: 2026-06-07  
**版本**: V3.0-FINAL
