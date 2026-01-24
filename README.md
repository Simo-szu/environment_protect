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
- **后端**：Spring Boot + Java 17（模块化单体架构）
- **数据库**：PostgreSQL（多 schema 隔离）
- **对象存储**：MinIO
- **消息队列**：Outbox 模式（基于数据库轮询）

## 快速开始

### 前置要求

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose（可选，用于本地开发环境）

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
   
   # Game API
   cd apps/game-api
   mvn spring-boot:run
   ```

4. **启动前端**
   ```bash
   cd apps/web
   pnpm install
   pnpm dev
   ```

### 访问地址

- 前端：http://localhost:8000
- Social API：http://localhost:8080
- Social API Swagger：http://localhost:8080/swagger-ui.html
- Game API：http://localhost:8082
- Game API Swagger：http://localhost:8082/swagger-ui.html

## 项目结构

```
youthloop/
├── apps/                    # 应用层（API 进程 + 前端）
│   ├── social-api/          # Social Service API
│   ├── social-worker/       # Social Service Worker（后台任务）
│   ├── game-api/            # Game Service API
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
│   └── api-contracts/       # API 契约（错误码、OpenAPI 规范）
└── infra/                   # 基础设施
    ├── db/                  # 数据库迁移脚本
    ├── docker/              # Docker Compose 配置
    └── minio/               # 对象存储配置
```

## 开发规范

### 核心文档

- **[Project-Structure.md](./Project-Structure.md)** - 项目架构与开发规范（必读）
- **[Schema-V0.1.dsl.md.md](./Schema-V0.1.dsl.md.md)** - 数据库模型定义
- **[packages/api-contracts/ERROR_CODES.md](./packages/api-contracts/ERROR_CODES.md)** - 错误码规范

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
- 所有响应使用 `BaseResponse<T>` 统一格式

### API 规范

- 统一请求格式：`{ requestId, data }`
- 统一响应格式：`{ code, message, data, traceId }`
- 分页响应格式：`{ page, size, total, items }`
- 错误码遵循 5 位数字格式：模块代码 + 错误类型 + 序号

## 数据库

### Schema 组织

- **shared**：跨服务共享的最小数据集（用户、身份、认证）
- **social**：Social Service 业务数据
- **game**：Game Service 业务数据

### 迁移管理

使用 Flyway 进行数据库版本管理，迁移脚本位于 `infra/db/migrations/`。

## 贡献指南

1. 所有开发必须遵循 [Project-Structure.md](./Project-Structure.md) 中的规范
2. 新增 API 端点必须先在文档中定义
3. 新增错误码必须先在 [ERROR_CODES.md](./packages/api-contracts/ERROR_CODES.md) 中定义
4. 提交前确保代码通过编译和测试

## 许可证

[待定]

## 联系方式

[待定]
