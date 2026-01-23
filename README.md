# My Digital Biome (Monorepo)

本项目采用 **Monorepo** 架构，包含前端 Web 应用与后端微服务（Social Service + Game Service）。旨在打造一个集生态模拟游戏、科普教育与社交互动于一体的综合平台。

---

## 🏗️ 系统架构

目标采用 **分布式架构**，前后端分离：

*   **Web Frontend**: 负责 UI 展示与 API 调用（Next.js）。
*   **Social Service**: 处理社媒、内容、活动、互动、积分等核心业务（Spring Boot 模块化单体）。
*   **Game Service**: 独立的游戏服务，处理游戏会话与逻辑（Spring Boot）。

两个服务共用一个 PostgreSQL 实例，通过 **多 Schema (shared/social/game)** 实现隔离。

---

## 📁 目录结构

```text
repo-root/
├─ apps/                   # 可独立部署的应用
│  ├─ web/                 # Next.js 前端应用
│  ├─ social-api/          # Social Service - API 接入层 (Spring Boot)
│  ├─ social-worker/       # Social Service - 异步任务 Worker (Spring Boot)
│  └─ game-api/            # Game Service - 独立游戏服务 (Spring Boot)
├─ modules/                # Social Service 业务模块 (模块化单体核心)
│  ├─ common/              # 通用工具和基础设施
│  ├─ auth/                # 认证与授权
│  ├─ user/                # 用户档案
│  ├─ content/             # 科普内容 (News/Wiki/Policy/Dynamic)
│  ├─ activity/            # 活动与报名
│  ├─ interaction/         # 评论/点赞/收藏/踩
│  ├─ notification/        # 通知系统
│  ├─ points/              # 积分系统 (签到/任务/问答/勋章)
│  ├─ search/              # 站内搜索
│  ├─ recommendation/      # 推荐系统
│  ├─ event/               # 事件处理 (Outbox)
│  ├─ ingestion/           # 数据抓取与清洗
│  ├─ query/               # 聚合查询层 (BFF)
│  ├─ host/                # 主办方管理
│  └─ ops/                 # 运营配置
├─ packages/               # 跨服务共享
│  ├─ api-contracts/       # API 契约 (OpenAPI/错误码/DTO)
│  └─ tooling/             # 代码生成/Lint/CI 脚本
├─ infra/                  # 基础设施配置
│  ├─ db/                  # 数据库相关
│  │  ├─ init/             # 初始化脚本 (角色/Schema)
│  │  ├─ migrations/       # Flyway 迁移脚本
│  │  │  ├─ shared/        # shared schema
│  │  │  ├─ social/        # social schema
│  │  │  └─ game/          # game schema
│  │  └─ scripts/          # 数据库操作脚本
│  └─ docker/              # Docker Compose (DB/Redis/RabbitMQ/MinIO)
├─ scripts/                # 开发和运维脚本
└─ docs/                   # 补充文档
```

---

## 🛠️ 技术栈

### Frontend (Web)
*   **Framework**: [Next.js 16.0.1](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS 4.x](https://tailwindcss.com/)
*   **State**: [Zustand](https://github.com/pmndrs/zustand)
*   **Visuals**: GSAP, Recharts, Radix UI

### Backend (Services)
*   **Language**: Java 21 (Temurin LTS)
*   **Framework**: Spring Boot 3.4.x
*   **ORM**: MyBatis
*   **API Docs**: SpringDoc OpenAPI (Swagger)

### Infrastructure & Data
*   **Database**: PostgreSQL (Schemes: `shared`, `social`, `game`)
*   **Migration**: Flyway
*   **Cache**: Redis
*   **Message Queue**: RabbitMQ
*   **Search**: PG Full Text Search (v0.1) -> Elasticsearch (Future)

---

## 🧩 核心业务模块

### Social Service
采用“模块化单体”架构，所有业务逻辑收敛于 `modules/`：
*   **Auth**: 统一认证（OTP/Password），支持多端登录。
*   **Home/Query**: 聚合查询层（BFF），负责组装多种数据源。
*   **Content**: 科普文章、动态、政策发布。
*   **Activity**: 环保活动发布、场次管理、报名系统。
*   **Interaction**: 全局互动系统（评论树、点赞、收藏）。
*   **Points**: 积分任务、签到、答题、兑换。
*   **User**: 用户画像与个人中心。

### Game Service
*   **Game Session**: 游戏会话管理。
*   **Events**: 游戏内事件上报与结算。

---

## 🚀 快速开始

### 1. 基础设施启动
确保本地安装 Docker，运行基础设施容器：
```bash
cd infra/docker
docker compose up -d
# 启动 Postgres, Redis, RabbitMQ, MinIO
```

### 1.1 构建 Web 镜像（可选）
从仓库根目录构建（build context 必须是 repo root）：
```bash
docker build -f apps/web/Dockerfile -t youthloop-web:dev .
```

### 2. 数据库迁移
执行 Flyway 脚本初始化数据库结构：
*   **Shared Schema**: `infra/db/migrations/shared`
*   **Social Schema**: `infra/db/migrations/social`
*   **Game Schema**: `infra/db/migrations/game`

### 3.后端服务启动
*   **Social API**: 运行 `apps/social-api`
*   **Social Worker**: 运行 `apps/social-worker` (处理异步任务)

### 4. 前端启动 (Web)
```bash
# 假设位于 apps/web (或当前根目录)
pnpm install
pnpm dev
# 访问 http://localhost:8000
```

---

## 📏 接口规范简述
*   **前缀**: `/api/v1`
*   **风格**: RESTful
*   **格式**: JSON
*   **响应封装**:
    ```json
    {
      "code": 200,
      "message": "success",
      "data": { ... },
      "traceId": "..."
    }
    ```

详细接口文档请参考代码中的 OpenAPI/Swagger 定义或 `Project-Structure.md` 中的端点清单。
