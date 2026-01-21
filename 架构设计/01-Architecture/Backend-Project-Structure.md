# 后端工程结构（Java + Spring Boot）

## 1. 目标
- 模块化单体（清晰边界）
- API 与 Worker 解耦（不同运行职责）
- 统一代码规范与依赖管理
- 未来可拆分为微服务但不提前拆

---

## 2. 推荐仓库结构（Monorepo）

youthloop-backend/
├─ build.gradle / pom.xml
├─ README.md
├─ apps/
│  ├─ api/                      # 对外 HTTP 服务
│  │  ├─ src/main/java/.../ApiApplication.java
│  │  ├─ controller/            # 仅做参数接收 + 调用 application service
│  │  ├─ config/                # security/web/mvc/openapi
│  │  └─ ...
│  └─ worker/                   # 后台任务服务
│     ├─ src/main/java/.../WorkerApplication.java
│     ├─ jobs/                  # 定时任务入口（10点刷新、每周抓取等）
│     ├─ consumers/             # 消息队列消费者（事件处理）
│     └─ ...
├─ modules/
│  ├─ common/                   # 通用：异常、统一返回、工具、事件基类
│  ├─ auth/                     # D1
│  ├─ user/                     # D2
│  ├─ content/                  # D3
│  ├─ activity/                 # D4
│  ├─ interaction/              # D5
│  ├─ points/                   # D6
│  ├─ search/                   # D7
│  ├─ event/                    # D8
│  ├─ recommendation/           # D9
│  └─ ingestion/                # D10（抓取/清洗逻辑）
└─ infra/
   ├─ db/                       # migration（Flyway/Liquibase）
   ├─ docker/                   # 本地/部署用 compose
   └─ docs/                     # 生成的 openapi、架构图等

---

## 3. 每个业务模块内部的标准分层

modules/<domain>/
├─ api/                         # DTO、对外接口定义（不一定有 controller）
├─ application/                 # 应用服务（用例层，事务边界）
├─ domain/                      # 领域模型（实体/值对象/领域服务）
├─ infrastructure/              # repository 实现、第三方适配（redis/s3/http）
└─ persistence/                 # JPA entity / MyBatis mapper / SQL

说明：
- Controller 只存在于 apps/api（避免模块互相暴露 web 层）
- Worker 调用 application service，不直接写 repository
- 跨模块访问：只允许 application 调用另一个模块的 application（或发事件）

---

## 4. 运行方式（两个进程）

### API 进程（apps/api）
- 处理：登录、浏览、评论、点赞、报名、积分查询、搜索
- 特点：低延迟，禁做长任务

### Worker 进程（apps/worker）
- 处理：爬虫、统计、热度、积分发放、每日任务刷新、推荐计算、索引更新
- 特点：允许延迟与批量

---

## 5. 技术选型（建议固定下来）

- Java：17（或 21）
- Spring Boot：3.x
- DB：PostgreSQL
- Migration：Flyway（推荐）
- Cache：Redis
- Queue：RabbitMQ（易用）或 Redis Stream（轻量）
- ORM：二选一
  - JPA/Hibernate（快速、规范）
  - MyBatis（SQL 可控、性能稳定）
- API 文档：springdoc-openapi（Swagger）
- 测试：JUnit5 + Testcontainers（可后置）

---

## 6. 与前端的契约

- API 风格：REST
- 统一响应格式：code / message / data / traceId
- 统一错误码：Auth / Validation / Business / System
