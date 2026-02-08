# YouthLoop - 青年环保社交平台

YouthLoop 是一个面向青年群体的环保主题社交平台，通过科普内容、活动组织、互动社区和游戏化激励，帮助青年人了解环保知识、参与环保活动、养成环保习惯。

## 项目概述

### 核心功能模块

- **科普内容**：环保新闻、动态、政策、百科等内容的发布与浏览
- **活动管理**：环保活动的发布、报名、签到与管理
- **社交互动**：评论、点赞、收藏、分享等社交功能
- **积分系统**：签到、任务、问答等多种积分获取方式
- **游戏化**：通过游戏化机制（如虚拟池塘）激励用户参与
- **通知系统**：实时通知用户关注的内容和活动动态

### 技术架构

- **前端**：Next.js + React + TypeScript
- **后端**：Spring Boot 3.4.x + Java 21（模块化单体架构）
- **数据库**：PostgreSQL（多 schema 隔离）
- **对象存储**：MinIO
- **消息队列**：Outbox 模式（基于数据库轮询）

## 快速开始

### 前置要求

- Java 21（Temurin 21 LTS）
- Node.js 18.18+（建议使用 LTS）
- PostgreSQL 14+
- Docker & Docker Compose（可选，用于本地开发环境）

### Windows / macOS 协同（必读）

- 本仓库使用 `.gitattributes` 统一文本文件为 `LF`，并为 `*.cmd/*.ps1` 使用 `CRLF`；请不要手动改行尾。
- 推荐在本仓库关闭自动行尾转换，避免反复出现“只改了换行”的 diff：`git config core.autocrlf false`
- macOS/Linux 通过 `./mvnw` 启动 Maven（仓库已跟踪可执行位）。

### 本地开发

1. **启动基础设施**（数据库、MinIO 等）
   ```bash
   cd infra/docker
   docker-compose up -d
   ```

2. **初始化数据库**
   ```powershell
   cd infra/db
   .\setup_all.ps1
   ```

3. **启动后端服务**
   ```bash
   # Social API
   cd apps/social-api
   mvn spring-boot:run
   
   # Social Worker
   cd apps/social-worker
   mvn spring-boot:run
   
   ```

4. **启动前端**
   ```bash
   cd apps/web
   pnpm install
   # 首次启动请准备环境变量
   cp .env.example .env.local
   pnpm dev
   ```

### 访问地址

- 前端：http://localhost:8000
- Social API：http://localhost:8080
- Social API Swagger：http://localhost:8080/swagger-ui.html


## 项目结构

```
youthloop/
├── apps/                    # 应用层（API 进程 + 前端）
│   ├── social-api/          # Social Service API
│   ├── social-worker/       # Social Service Worker（后台任务）

│   └── web/                 # Web 前端（Next.js）
├── modules/                 # 业务模块（模块化单体）
│   ├── auth/                # 认证与授权
│   ├── user/                # 用户管理
│   ├── content/             # 科普内容
│   ├── activity/            # 活动管理
│   ├── interaction/         # 社交互动
│   ├── notification/        # 通知系统
│   ├── points/              # 积分系统
│   ├── event/               # 事件处理（Outbox）
│   └── common/              # 通用工具
├── packages/                # 跨服务共享
│   └── api-contracts/       # API 契约（请求响应规范、OpenAPI 规范）
└── infra/                   # 基础设施
    ├── db/                  # 数据库迁移脚本
    ├── docker/              # Docker Compose 配置
    └── minio/               # 对象存储配置
```

## 开发规范

### 核心文档

- **[Project-Structure.md](./Project-Structure.md)** - 项目架构与开发规范（必读）
- **[Schema-V0.1.dsl.md](./Schema-V0.1.dsl.md)** - 数据库模型定义
- **[packages/api-contracts/API_REQUEST_RESPONSE_SPEC.md](./packages/api-contracts/API_REQUEST_RESPONSE_SPEC.md)** - API 请求响应结构规范

### 模块开发规范

每个业务模块遵循统一的分层结构：

```
<module>/
├── api/              # 对外契约（DTO + Facade）
├── application/      # 用例层（Service）
├── domain/           # 领域层（可选）
├── infrastructure/   # 适配层（可选）
└── persistence/      # 持久化层（Entity + Mapper）
```

**关键原则：**
- 模块间只能通过 `api/facade` 交互，禁止直接依赖其他模块的 `persistence` 或 `application`
- Controller 只依赖 Facade，不直接依赖 Service
- 所有写入接口使用 `UnifiedRequest<T>` 包装请求体
- 所有接口请求/响应结构统一遵循 `packages/api-contracts/API_REQUEST_RESPONSE_SPEC.md`

### API 规范

- 统一请求格式：`{ requestId, data }`
- 统一响应格式：`{ success, message, data, errors, traceId }`
- 分页响应格式：`{ page, size, total, items }`
- 错误返回结构遵循 `success/message/errors/traceId` 规范

## 数据库

### Schema 组织

- **shared**：跨服务共享的最小数据集（用户、身份、认证）
- **social**：Social Service 业务数据


### 迁移管理

使用 Flyway 进行数据库版本管理。

**Social Service（apps/social-api）：**
- 管理 schemas：`shared`, `social`
- 迁移脚本位置：`apps/social-api/src/main/resources/db/migration/`
- History 表：`flyway_schema_history_social`
- Migrator 账号：`social_migrator`



首次启动应用时，Flyway 会自动执行迁移。也可以通过环境变量配置：
```bash
FLYWAY_USER=social_migrator
FLYWAY_PASSWORD=postgres
```

## 贡献指南

1. 所有开发必须遵循 [Project-Structure.md](./Project-Structure.md) 中的规范
2. 新增 API 端点必须先在文档中定义
3. 接口响应结构与错误返回约定必须先在 [API_REQUEST_RESPONSE_SPEC.md](./packages/api-contracts/API_REQUEST_RESPONSE_SPEC.md) 中定义
4. 提交前确保代码通过编译和测试

## 许可证

[待定]

## 联系方式

[待定]
