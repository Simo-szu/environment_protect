# Project-Structure（Monorepo 项目总指南）v0.4.1（2026-01-24）

目标：用两份文档稳定推进开发：
- 项目总指南：本文件（monorepo 文件结构、接口规范、端点清单、数据库 schema / Flyway 组织方式）

---

## 0. 现状与目标架构

当前仓库是 Monorepo，前端已迁移到 `apps/web/`，后端服务骨架已搭建完成。

目标是分布式架构（两个后端）：
- Social Service：社媒/内容/活动/互动/积分等
- Game Service：游戏服务（独立部署/独立接口）
- 两个服务共用 1 个 PostgreSQL 实例，但通过 **多 schema + 最小权限 + 独立迁移历史** 隔离

前后端分离：Web 只负责 UI 与调用 API，不承载业务写入规则。

---

## Changelog

- v0.4.2（2026-01-25）：修正架构边界，移除“手机号验证”（尚未支持），新增“Google 登录”；移除“游戏服务”具体规范（标记为未来规划），清理历史遗留的生态小游戏逻辑。

---

## 1. Monorepo 仓库结构（全局规划）

说明：下面是“目标结构”。当前 Next.js 已迁移到 `apps/web`，后续请保持前后端资产不要混放到仓库根目录。

```
repo-root/
├─ README.md                          # 项目入口说明：如何启动 web/social/game；环境变量清单
├─ .gitignore
├─ .editorconfig                      # 可选：统一换行/缩进
├─ docs/                              # 可选：面向开发的补充文档（非架构设计）
├─ scripts/                           # 可选：一键启动/检查脚本（lint、db、docker 等）
│  ├─ dev.sh
│  ├─ dev.ps1
│  └─ ...
├─ apps/
│  ├─ web/                             # Next.js（前端）
│  │  ├─ package.json                  # web 专用依赖（Next.js/React/UI）
│  │  ├─ next.config.ts
│  │  ├─ tsconfig.json
│  │  ├─ public/
│  │  └─ src/
│  │     ├─ app/                       # 路由与页面（/activities /science /points /profile /login /register /notifications）
│  │     ├─ components/                # UI 组件（页面组件/通用组件）
│  │     ├─ hooks/                     # React hooks
│  │     ├─ lib/                       # 工具与客户端（API client、fetch wrapper、zod schema 等）
│  │     ├─ store/                     # 状态管理（如 zustand）
│  │     └─ styles/
│  ├─ social-api/                       # Social Service - API 进程（Spring Boot）
│  │  ├─ build.gradle / pom.xml         # 只声明“入口层”依赖（web/security/openapi）；业务依赖来自 modules/*
│  │  └─ src/
│  │     ├─ main/java/com/youthloop/social/api/
│  │     │  ├─ SocialApiApplication.java
│  │     │  ├─ web/
│  │     │  │  ├─ controller/           # 路由入口：只做参数校验/鉴权/DTO 转换（按模块分包）
│  │     │  │  │  ├─ auth/              # /api/v1/auth/*
│  │     │  │  │  ├─ home/              # /api/v1/home
│  │     │  │  │  ├─ content/           # /api/v1/contents*
│  │     │  │  │  ├─ activity/          # /api/v1/activities*、/api/v1/host/*
│  │     │  │  │  ├─ interaction/       # /api/v1/comments、/api/v1/reactions
│  │     │  │  │  ├─ me/                # /api/v1/me/*
│  │     │  │  │  ├─ points/            # /api/v1/points/*
│  │     │  │  │  ├─ search/            # /api/v1/search*
│  │     │  │  │  ├─ recommendation/    # /api/v1/recommendations/*
│  │     │  │  │  └─ files/             # /api/v1/files/*
│  │     │  │  ├─ advice/               # 统一异常与响应包装
│  │     │  │  ├─ filter/               # traceId、日志、限流（轻量）
│  │     │  │  └─ security/             # 认证鉴权（JWT/Session/ACL）
│  │     │  ├─ query/                   # Query/BFF 入口：只读聚合
│  │     │  └─ config/                  # MVC/Jackson/CORS/OpenAPI 配置
│  │     └─ main/resources/
│  │        ├─ application.yml          # 环境变量映射（端口、DB、Redis、RabbitMQ、S3/MinIO）
│  │        └─ logback-spring.xml       # 可选：日志格式与 traceId
│  ├─ social-worker/                    # Social Service - Worker 进程（Spring Boot）
│  │  ├─ build.gradle / pom.xml         # 只声明“worker 入口层”依赖（scheduler/rabbit/redis）；业务依赖来自 modules/*
│  │  └─ src/
│  │     ├─ main/java/com/youthloop/social/worker/
│  │     │  ├─ SocialWorkerApplication.java
│  │     │  ├─ jobs/                    # 定时任务入口（10:00 刷新、热度重算、推荐生成、抓取）
│  │     │  ├─ consumers/               # RabbitMQ 消费者（Outbox、统计更新、邮件任务等）
│  │     │  └─ config/                  # 调度器、队列、分布式锁等配置
│  │     └─ main/resources/
│  │        ├─ application.yml
│  │        └─ logback-spring.xml


├─ modules/                             # Social Service 业务模块（模块化单体）
│  ├─ common/
│  ├─ auth/
│  ├─ user/
│  ├─ content/
│  ├─ activity/
│  ├─ interaction/
│  ├─ notification/
│  ├─ points/
│  ├─ search/
│  ├─ recommendation/
│  ├─ event/
│  ├─ ingestion/
│  └─ query/
├─ packages/                            # 跨服务共享（可选：只放“真正通用”的东西）
│  ├─ api-contracts/                    # API 契约：请求响应规范、OpenAPI 源文件、DTO 约束（供前后端生成/校验）
│  └─ tooling/                          # 代码生成、lint 规则、CI 复用脚本等
├─ infra/
│  ├─ db/
│  │  └─ migrations/
│  │     ├─ shared/                      # schema=shared（共享基础）
│  │     ├─ social/                      # schema=social（社媒）
│  │     └─ game/                        # schema=game（游戏）
│  ├─ docker/                            # compose：postgres/redis/rabbitmq/minio
│  │  ├─ compose.yml
│  │  └─ ...
│  └─ docs/
└─ 架构设计/
   ├─ 01-Architecture/
   └─ 03-Data/
```

强制约束：
- `apps/*` 之间发布与配置隔离（不同端口、不同环境变量、不同镜像）
- Social 的“模块化单体”只存在于 `modules/*`；app 只做入口适配
- Web 不实现任何业务写入规则（只负责调用 API）

---

## 2. Social Service：模块化单体结构（强制）

运行进程：
- `apps/social-api`：对外 HTTP API
- `apps/social-worker`：异步任务（爬虫、统计、热度、推荐、索引、每日任务刷新）

---

## 3. Social Modules：模块内部分层（统一模板）

modules/<domain>/
├─ api/                                         # “模块对外契约”：DTO + Facade（供 controller/query/其他模块调用）
│  ├─ dto/                                      # 入参/出参 DTO（仅协议层字段）
│  ├─ enums/                                    # 对外枚举（建议 string enum：NEWS/POLICY...）
│  └─ facade/                                   # 对外门面接口（只暴露必须的能力）
├─ application/                                 # 用例层：事务边界、幂等、编排（写入都在这里）
│  ├─ command/                                  # 写入用例（Create/Update/Claim/Signup...）
│  ├─ query/                                    # 模块内只读（非页面聚合；页面聚合在 modules/query）
│  └─ service/                                  # 可选：应用服务（如果 command/query 太多可再分组）
├─ domain/                                      # 领域层：业务规则本体
│  ├─ model/                                    # 实体/值对象
│  ├─ event/                                    # 领域事件（如 CommentCreated）
│  └─ service/                                  # 领域服务（纯规则，不做 IO）
├─ infrastructure/                              # 适配层：第三方与集成
│  ├─ mq/                                       # RabbitMQ 发布/订阅适配（仅实现，不放业务）
│  ├─ cache/                                    # Redis 适配（验证码、限流、窗口去重）
│  ├─ storage/                                  # S3/MinIO 适配（头像、海报）
│  └─ client/                                   # 外部 HTTP client（后置：第三方平台抓取/回调）
└─ persistence/                                 # MyBatis 持久化（固定 MyBatis）
   ├─ entity/                                   # 数据库映射对象（PO/Entity，不承载业务规则）
   ├─ mapper/                                   # MyBatis Mapper 接口
   └─ sql/                                      # 复杂 SQL（可选：按场景存放，便于 review）

Mapper XML 放置位置（强约束）：
- `modules/<domain>/src/main/resources/mapper/**/*.xml`

放置规则（强约束）：
- `apps/social-api` 只能依赖 `modules/*`，不允许把业务写进 controller
- `apps/social-worker` 只能依赖 `modules/*`，不允许直接写 DB（必须走模块的 application 或 ingestion/query ）
- 模块内部：`application` 可以依赖 `domain`、`persistence`（通过 repository 接口）、`infrastructure`
- 模块之间：只允许依赖“对方的 api 或 application 门面”，禁止引用对方的 persistence/entity/mapper

建议包名（以当前实现为准，统一即可）：
- Social Modules（`modules/*`）：`com.youthloop.<domain>.(api|application|domain|infrastructure|persistence)`
- Social Apps：
  - `apps/social-api`：`com.youthloop.social.api.*`
  - `apps/social-worker`：`com.youthloop.social.worker.*`
- Game：`com.youthloop.game.<domain>.(api|application|domain|infrastructure|persistence)`（game 结构可不同，但包名前缀建议统一）

---

## 4. Social Modules：边界与依赖规则（强制）

### 4.1 Command（写入）规则
- 写入必须由对应模块的 `application` 执行（例如：报名写入只在 `modules/activity/application`）
- 需要更新统计/积分/通知：写入事务内只写业务表 + outbox（或 event），其余由 Worker 异步处理

### 4.2 Query（只读）规则
- 页面级聚合查询放在 `modules/query`（只读，不写任何业务表）
- `modules/query` 可以用自己的只读 DAO/Mapper 直接 join 多表（避免把聚合逻辑塞回各业务模块）
- `apps/social-api/query` 只做“入口适配”（路由、鉴权、DTO 返回），真实聚合在 `modules/query`

### 4.3 禁止项（踩一次就会失控）
- 禁止 `apps/social-api` 直接调用任何 `modules/*/persistence`（否则 Controller 会变胖）
- 禁止 Worker 直接写任何业务表（否则事务边界、幂等会失控）
- 禁止模块 A 直接 import 模块 B 的 entity/mapper（未来拆服务会非常痛）

---

## 5. API 规范（全服务统一）

说明：接口看起来要“整齐、好读”。约束靠规范与代码分层来实现，不靠丑路径。

### 5.1 路由与方法（强制）
- 基础前缀：`/api/v1`
- 读：`GET`（禁止写表；在代码结构上由 Query 层保证）
- 写：`POST/PUT/PATCH/DELETE`（只做校验 + 调用 application service）
- 资源命名：全小写 + 复数名词（`/contents`、`/activities`、`/comments`、`/reactions`）
- 嵌套资源：仅用于强从属关系（`/contents/{id}/comments`、`/activities/{id}/sessions`）

### 5.2 请求结构（统一）
所有端点都必须遵守：
- `Content-Type: application/json`
- Query 参数：用于筛选/分页/排序
- JSON Body：仅用于写入（POST/PUT/PATCH）；读请求不使用 body

统一请求体（写入类）：
```json
{
  "requestId": "uuid-or-client-generated-id (optional)",
  "data": { }
}
```
约定：
- `requestId` 用于幂等（可选；签到/领取/报名等建议传）
- 业务字段全部放在 `data` 内，便于后续统一日志与网关策略

### 5.2 响应结构（统一）
- 响应结构以 `packages/api-contracts/API_REQUEST_RESPONSE_SPEC.md` 为准
- `PageResponse<T>`：`page` / `size` / `total` / `items`

### 5.3 字段命名与时间格式（统一）
- JSON 字段：lowerCamelCase
- 时间：ISO-8601（前端展示“YYYY-MM-DD”可在 UI 层格式化）
- UUID：字符串

### 5.4 登录态与游客
- Auth 标记说明：
  - `No`：无需登录
  - `Optional`：可不登录（登录则返回 userState/个性化字段）
  - `Yes`：必须登录
  - `G`：允许游客（不登录也能写；通常通过 email 等完成去重/联系）
  - `Admin`：管理员权限（`user.role=admin`），用于运营配置/审核
- 读接口：允许 Optional（未登录也能读内容/活动）；未登录时 `userState` 可不返回或全部为 false
- 写接口：除活动报名（允许游客）外，其它互动写入（评论/点赞/收藏/踩）必须登录

### 5.5 分页与排序（统一）
- 分页参数：`page`（从 1 开始）+ `size`
- 默认值建议：列表类 `size=10`（内容）/ `size=5`（活动）；评论 root 分页 `size=10`
- 排序参数：
  - 评论：`sort=latest|hot`
  - 活动列表：`sort=latest`（按 start_time desc，null 兜底 created_at desc）或后置更多排序

---

## 6. API 端点清单（整齐按功能模块划分）

说明：
- 端点按模块分组，保持“整齐、稳定”，后续新增也按模块追加
- Social 与 Game 分属两个服务，但接口风格保持一致
- 后台管理端（后置）：建议 `/api/v1/admin/*` 单独分组，不混入用户端

### 6.1 Social：Auth / Session

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /api/v1/auth/otp/email | No | 发送邮箱验证码（注册/登录/重置密码） |
| POST | /api/v1/auth/register/email | No | 邮箱注册（email+otp+password+termsAccepted） |
| POST | /api/v1/auth/login/otp/email | No | 邮箱验证码登录 |
| POST | /api/v1/auth/login/password | No | 账号密码登录（email + password） |
| POST | /api/v1/auth/login/google | No | Google 登录/注册（携带 idToken） |
| POST | /api/v1/auth/password/reset | No | 找回/重置密码（account+otp+newPassword） |
| POST | /api/v1/auth/token/refresh | No | 刷新 token |
| POST | /api/v1/auth/logout | Yes | 登出 |

### 6.2 Social：Home

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /api/v1/home | Optional | 首页聚合（最新内容 + 最新活动 + 轮播配置） |
| GET | /api/v1/home/banners | Optional | 首页轮播/运营位列表（仅返回启用且在有效期内） |

### 6.3 Social：Content（科普）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /api/v1/contents | Optional | 内容列表（含 stats + userState） |
| GET | /api/v1/contents/{id} | Optional | 内容详情（含 stats + userState） |
| GET | /api/v1/contents/{id}/comments | Optional | 内容评论树（sort=latest\|hot） |

### 6.4 Social：Activity（活动）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /api/v1/activities | Optional | 活动列表（分类筛选 + 排序） |
| GET | /api/v1/activities/{id} | Optional | 活动详情（含 signupPolicy） |
| GET | /api/v1/activities/{id}/comments | Optional | 活动评论树（sort=latest\|hot） |
| GET | /api/v1/activities/{id}/sessions | Optional | 活动场次列表（HOSTED 才有） |
| POST | /api/v1/activities/{id}/signups | G | 活动报名（同一活动只能报一次） |
| PATCH | /api/v1/activities/{id}/signups/{signupId} | G | 修改报名信息/改场次（仅未开始且状态允许时） |
| DELETE | /api/v1/activities/{id}/signups/{signupId} | G | 取消报名（仅未开始且状态允许时） |

### 6.5 Social：Host（主办方）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /api/v1/host/activities | Yes | 主办方发布活动（HOSTED） |
| PUT | /api/v1/host/activities/{id} | Yes | 主办方编辑活动（仅本人/管理员） |
| POST | /api/v1/host/activities/{id}/sessions | Yes | 创建/更新场次（批量也可） |
| GET | /api/v1/host/activities | Yes | 我发布的活动列表 |
| GET | /api/v1/host/activities/{id}/signups | Yes | 查看报名名单与统计（敏感信息） |
| PATCH | /api/v1/host/activities/{id}/signups/{signupId}/approve | Yes | 审核通过报名（仅本人/管理员） |
| PATCH | /api/v1/host/activities/{id}/signups/{signupId}/reject | Yes | 审核拒绝报名（仅本人/管理员） |
| POST | /api/v1/host/verification/submit | Yes | 提交主办方认证/资质审核材料 |
| GET | /api/v1/host/verification | Yes | 查看主办方认证状态与资料（脱敏） |

### 6.6 Social：Interaction（互动）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /api/v1/comments | Yes | 发表评论/回复（depth<=2） |
| POST | /api/v1/reactions | Yes | 点赞/收藏/踩（幂等创建） |
| DELETE | /api/v1/reactions | Yes | 取消点赞/收藏/踩（幂等删除） |

### 6.7 Social：Me / User（我的）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /api/v1/me/profile | Yes | 获取我的资料 |
| POST | /api/v1/me/profile | Yes | 修改个人资料（头像/昵称/性别/生日/家乡） |
| GET | /api/v1/me/points | Yes | 获取积分余额 |
| GET | /api/v1/me/reactions | Yes | 我的点赞/收藏列表（reaction join content/activity） |
| GET | /api/v1/me/notifications | Yes | 回复我的：列表 + 未读 |
| POST | /api/v1/me/notifications/read | Yes | 标记已读（支持批量） |
| GET | /api/v1/me/activities | Yes | 我报名的活动列表 |
| GET | /api/v1/users/{userId}/profile | No | 公开查询指定用户档案（仅查询，不提供更新） |
| PUT | /api/v1/notifications/{id}/read | Yes | 标记单个通知为已读（备用接口；推荐使用 /api/v1/me/notifications/read） |
| PUT | /api/v1/notifications/read-all | Yes | 标记全部通知为已读（备用接口；推荐使用 /api/v1/me/notifications/read） |

### 6.8 Social：Points（积分系统）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /api/v1/points/signins | Yes | 签到/补签（请求体携带 signinDate） |
| GET | /api/v1/points/tasks | Yes | 获取每日任务 |
| POST | /api/v1/points/tasks/{taskId}/claim | Yes | 领取任务积分 |
| GET | /api/v1/points/quiz/today | Yes | 今日问答 |
| POST | /api/v1/points/quiz/submissions | Yes | 提交问答（一天一次） |
| GET | /api/v1/points/account | Yes | 获取积分余额（备用接口；与 /api/v1/me/points 等价） |

### 6.9 Social：Recommendation（推荐）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /api/v1/recommendations/weekly | Yes | 本周个性推荐 |
| GET | /api/v1/recommendations/latest | No | 最新推荐（实时查） |

### 6.10 Social：Search（站内搜索）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /api/v1/search | Optional | 站内搜索（活动 + 科普词条，支持模糊/FTS） |
| GET | /api/v1/search/suggest | Optional | 关键词联想（后置可先不做） |

### 6.11 Social：Files / Upload

说明：头像与活动海报需要上传。前后端分离时，推荐后端返回对象存储的预签名 URL，前端直传，后端只保存最终 URL。

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /api/v1/files/presign | Yes | 获取上传预签名（avatar/activityPoster 等） |

### 6.12 Social：System / Admin / Health

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /health | No | 健康检查（不加 /api 前缀） |
| GET | /api/v1/admin/home/banners | Admin | 运营位管理：列表 |
| POST | /api/v1/admin/home/banners | Admin | 运营位管理：创建/启用/排序 |
| GET | /api/v1/admin/home/banners/{id} | Admin | 运营位管理：详情 |
| PATCH | /api/v1/admin/home/banners/{id} | Admin | 运营位管理：修改/上下线 |
| DELETE | /api/v1/admin/home/banners/{id} | Admin | 运营位管理：删除 |
| GET | /api/v1/admin/host/verifications | Admin | 主办方认证审核：列表 |
| PATCH | /api/v1/admin/host/verifications/{id} | Admin | 主办方认证审核：通过/拒绝 |

### 6.13 Game：(规划中)
 
说明：Game 服务目前处于“规划中”状态，前端生态小游戏功能暂停开发。接口预留但暂不实现。

---

## 7. Query Layer（BFF/聚合查询）规范（强制）

Query 层职责：面向页面，一次性把 “主数据 + stats + userState + 评论树” 拼装为 DTO，减少前端多次请求。

强约束：
- Query 层只读，不写任何业务表（包括 stats）
- 写入必须回到各模块 application service
- 评论树查询建议拆两次：先查 root 分页，再按 root_id 批量拉 replies（本页）

---

## 8. Stats/Outbox 策略（v0.1 就按这个做）

- 主数据强一致：content/activity/comment/reaction/signup 在本库事务内写入
- 统计最终一致：`*_stats` 由异步更新器（Worker）消费 Outbox 后原子加减更新
- hot_score 可重算：Worker 支持定时/手动重算；热度“公式/参数”可配置（见数据库设计）

---

## 9. 幂等/去重策略（按接口落地）

- Reaction：DB 唯一约束 `(user_id, target_type, target_id, reaction_type)`，重复创建返回 OK
- Signin：DB 主键 `(user_id, signin_date)`，重复签到返回明确错误响应
- Quiz：DB 主键 `(user_id, quiz_date)`，重复提交返回明确错误响应
- Activity Signup：同一活动只能报一次（登录按 user_id，游客按 email；DB 用 dedup_key 统一约束）

---

## 10. 前端页面 → Social API（对接映射）

你们当前 Next.js 路由（示例）：`apps/web/src/app/activities`、`apps/web/src/app/science`、`apps/web/src/app/points`、`apps/web/src/app/profile`、`apps/web/src/app/login`、`apps/web/src/app/register`、`apps/web/src/app/notifications` 等。

映射建议（只列核心）：
- `/`（首页）：`GET /api/v1/home`
- `/science`（科普列表）：`GET /api/v1/contents?type=NEWS|DYNAMIC|POLICY|WIKI&page=&size=`
- `/science/[id]`（科普详情）：`GET /api/v1/contents/{id}` + `GET /api/v1/contents/{id}/comments`
- `/activities`（活动列表）：`GET /api/v1/activities?category=&page=&size=&sort=`
- `/activities/[id]`（活动详情）：`GET /api/v1/activities/{id}` + `GET /api/v1/activities/{id}/sessions` + `GET /api/v1/activities/{id}/comments`
- `/activities/register`（报名）：`POST /api/v1/activities/{id}/signups`
- `/likes`、`/favorites`：`GET /api/v1/me/reactions?reactionType=LIKE|FAV&targetType=CONTENT|ACTIVITY&page=&size=`
- `/profile`：`GET /api/v1/me/profile`；编辑：`POST /api/v1/me/profile`
- `/points`：`POST /api/v1/points/signins`、`GET /api/v1/points/tasks`、`POST /api/v1/points/tasks/{taskId}/claim`、`GET /api/v1/points/quiz/today`、`POST /api/v1/points/quiz/submissions`
- `/notifications`：`GET /api/v1/me/notifications`、`POST /api/v1/me/notifications/read`
- `/login`、`/register`：Auth 端点（支持 Email / Google）

---

## 11. 社媒后端：功能 → 代码放哪

后端实现时只要照这张表放文件，review 时也按这张表检查“有没有放错层/放错模块”。

### 11.1 首页（Home）
- 首页聚合（最新内容/最新活动/轮播配置）：`modules/query`；路由入口在 `apps/social-api/query`
- 运营位/轮播配置（可运营表）：`modules/ops/application` + `modules/ops/persistence`（Admin 通过 `/api/v1/admin/home/banners` 维护）
- 热门排序（hot_score 重算、规则切换）：规则在数据库 + `modules/*` 的 stats 模型；重算任务在 `apps/social-worker/jobs`

### 11.2 登录/注册/忘记密码
- OTP 发送/校验：`modules/auth/application` + `modules/auth/infrastructure`（email 适配；*注：sms/phone 已暂停支持*）
- Google 登录：`modules/auth/infrastructure`（Google IdP 适配，校验 idToken）
- 多登录方式 identity：`modules/auth/domain`（支持 Email、Google 自动创建账户）
- refresh token：`modules/auth/persistence`
- 条款/隐私同意留痕：`modules/auth`（对应数据库 `user_terms_acceptance`）
- API 路由与参数：`apps/social-api/web/controller/auth`

### 11.3 科普（Content：新闻/动态/政策/百科）
- 内容写模型：`modules/content/application`
- 抓取与清洗：`modules/ingestion`（Worker 调用）；入库仍由 `modules/content` 执行
- 列表/详情聚合（含 stats + userState + commentTree）：`modules/query`
- API：`apps/social-api/web/controller/content`

### 11.4 活动（Activity：发布/场次/报名）
- 主办方发布活动（HOSTED）：`modules/activity/application`
- 活动场次（用户选择时段）：`modules/activity`（`activity_session` 相关）
- 报名（同一活动只能报一次）：`modules/activity/application`（幂等/去重在此模块内；支持取消/改场次；支持审核流）
- 报名审核：`modules/activity/application`（主办方/管理员审核；状态流与审计字段见 Schema）
- 抓取活动：`modules/ingestion`（Worker 定时/批处理），去重策略落在 ingestion + activity
- 列表/右侧推荐/最新：`modules/query`
- API：`apps/social-api/web/controller/activity`

### 11.5 互动（评论/点赞/收藏/踩）
- 评论树写入：`modules/interaction/application`
- reaction 写入：`modules/interaction/application`
- 统计异步更新（*_stats）：`modules/event`（outbox 抽象）+ `apps/social-worker/consumers`（消费更新）
- 评论热度规则（可配置）：规则表/规则读取在 `modules/interaction`；重算在 Worker
- API：`apps/social-api/web/controller/interaction`

### 11.6 我的（个人资料、收藏/点赞、回复我的）
- 个人资料：`modules/user/application` + `modules/user/infrastructure`（对象存储适配）
- 我的收藏/点赞列表（跨表 join）：`modules/query`（reaction → content/activity）
- 回复我的：写入/已读在 `modules/notification/application`；读取聚合在 `modules/query`
- API：`apps/social-api/web/controller/me`

### 11.7 积分系统（签到/补签/任务/问答/勋章）
- 签到/补签（Asia/Shanghai 日期）：`modules/points/application`
- 任务/问答/勋章：`modules/points/application`
- 积分发放：写 `points_ledger` + 更新 `points_account`（同事务/幂等控制在 points 模块）
- 每日 10:00 刷新：`apps/social-worker/jobs` 调用 `modules/points/application`
- API：`apps/social-api/web/controller/points`

### 11.8 搜索（全文 + 模糊）
- 搜索预处理（拼音/简繁/大小写）：`modules/search/domain`（规则）+ `modules/search/application`
- 搜索查询：`modules/search/persistence`（PG FTS 或后续 ES 适配）
- 索引更新：`apps/social-worker/jobs`（消费 outbox 或定时重建）
- API：`apps/social-api/web/controller/search`

### 11.9 推荐（每周个性推荐 / 最新推荐）
- 每周个性推荐生成：`apps/social-worker/jobs` 调用 `modules/recommendation/application`
- 最新推荐（实时）：`modules/query` 直接按时间读取 `content/activity`
- API：`apps/social-api/web/controller/recommendation`

### 11.10 主办方认证（Host Verification）
- 主办方资料：`modules/host/application`（对应数据库 `host_profile`）
- 认证提交/审核：`modules/host/application`（对应数据库 `host_verification`；Admin 审核入口见端点清单）
- API：`apps/social-api/web/controller/host` + `apps/social-api/web/controller/admin`

---

## 12. 数据库：1 个 Postgres 实例 + 3 个 schema + Flyway（必须定稿）

### 12.0 前置条件：pgcrypto（必须）
本项目的迁移脚本中使用了 `gen_random_uuid()` 作为主键默认值（例如 shared/social/game 的 V001 初始化）。
该函数来自 PostgreSQL 扩展 `pgcrypto`。如果目标数据库未启用该扩展，Flyway 在建表阶段会直接失败（函数不存在）。

**约定（方案 A，推荐）：**
- `pgcrypto` 的启用属于“数据库初始化阶段”职责，由具备足够权限的账号（通常是 `postgres` 超级用户）执行一次：
  - `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- Flyway 的 migrator 账号（`social_migrator` / `game_migrator`）只负责 schema 内的 DDL（建表/改表），不要求也不建议具备创建扩展的权限。
- Docker 场景：由 `infra/db/init/db_init_roles_schemas.sql` 在容器首次初始化时自动完成（见 `infra/docker/compose.yml` 的 init 挂载）。

### 12.1 schema 划分（建议）
一个实例内使用 3 个 schema 隔离：
- `shared`：共享基础（建议放 auth/user 之类“跨服务都需要识别”的最小集合；Owner 明确，避免双方乱改）
- `social`：社媒后端自有表（content/activity/interaction/points/recommendation/...）
- `game`：游戏后端自有表（*规划中*）

原则：
- 一个表只属于一个 schema（一个 Owner）
- 跨服务不要直接写对方 schema 的表；需要协作用 API 或事件（后置可上消息队列）

### 12.2 数据库用户与权限（最小权限）
推荐 4 类角色（示例命名，可按你们规范调整）：
- 迁移用户（DDL）：`social_migrator`、`game_migrator`（Flyway 使用）
- 运行用户（DML）：`social_app`、`game_app`（应用运行时使用）

权限策略：
- migrator：仅对自己负责的 schema 拥有建表/改表权限
- app：仅对自己负责的 schema 拥有 DML 权限（SELECT/INSERT/UPDATE/DELETE），不允许 DDL
- 读取共享：如果 game 需要读取 `shared`，只授予 `game_app` 对 `shared` 的 SELECT

### 12.3 Flyway 组织方式（两服务不互相踩）
关键点：**每个服务只迁移自己负责的 schema**，并且 Flyway history 表要隔离。

推荐：
- Social Service（apps/social-api）：
  - 负责：`shared` + `social`
  - `flyway.schemas=shared,social`
  - `flyway.defaultSchema=social`
  - `flyway.table=flyway_schema_history_social`
  - migrations：
    - `db/migration/shared/V001__init_shared.sql`
    - `db/migration/social/V001__init_social.sql`
- Social Worker（apps/social-worker）：
  - 默认不跑 Flyway（避免多进程并发迁移带来的锁/启动顺序问题）
  - 约定：先启动 `social-api` 完成迁移，再启动 `social-worker`


### 12.4 两服务怎么连同一个库
连接同一个 Postgres 实例，但使用不同账号 + 不同默认 schema：
- Social Service：使用 `social_app`，search_path=`social,shared`

JDBC 常见做法：
- 用连接串参数 `currentSchema=social,shared`（或在连接池 init SQL 里 `set search_path`）
- 永远不要用 `public` 存业务表（避免权限与命名污染）

### 12.5 v0.1（Social）表归属清单（必须完整标注）
说明：这里的“shared/social”是指 PostgreSQL schema。**表一旦定归属就不要跨 schema 迁移**；跨 schema 的关联只允许“读”或通过 API/事件协作写入。

| 归属 schema | 表（Schema-V0.1.dsl.md 中的 model） | 备注 |
|---|---|---|
| `shared` | `user` / `user_profile` / `user_identity` / `user_password` | 用户与档案（跨服务识别的最小集合） |
| `shared` | `auth_refresh_token` / `verification_code` | 登录态与验证码（跨服务共享的最小集合） |
| `shared` | `user_terms_acceptance` | 条款/隐私同意留痕（合规审计） |
| `social` | `content` / `content_stats` | 内容与统计（含 like/fav/comment/down + hot_score） |
| `social` | `activity` / `activity_session` / `activity_stats` / `activity_signup` | 活动与报名（含取消/改场次/审核流） |
| `social` | `comment` / `comment_stats` / `reaction` / `notification` | 互动与通知（含 downvote 展示统计） |
| `social` | `points_account` / `points_ledger` / `signin_record` | 积分与签到 |
| `social` | `daily_task` / `daily_task_progress` / `daily_quiz` / `daily_quiz_record` | 任务与问答 |
| `social` | `badge` / `user_badge` | 勋章 |
| `social` | `user_event` | 埋点/行为事件（推荐/搜索/统计输入） |
| `social` | `weekly_recommendation` | 每周个性推荐结果 |
| `social` | `hot_score_rule` | 热度公式/规则配置 |
| `social` | `home_banner` | 首页运营位/轮播配置（可运营） |
| `social` | `host_profile` / `host_verification` | 主办方资料与认证审核（v0.1 需要做） |
| `social` | `outbox_event` | Outbox 事件表（Worker 消费更新 stats/索引/邮件等） |

---

## 13. 技术选型（建议固定下来）

- Java：21（Temurin 21 LTS）
- Spring Boot：3.4.x（建议固定到具体小版本；与 Java 21 兼容性最好、生态成熟）
- DB：PostgreSQL（单实例 + 2 schema：shared/social）
- Migration：Flyway（必选）
- Cache：Redis
- Queue：RabbitMQ（必选）
- ORM：MyBatis（固定下来；SQL 可控、便于做 Query 层聚合与性能优化）
- API 文档：springdoc-openapi（Swagger UI）
- 测试：JUnit5 + Testcontainers（后置也可以，但建议至少保留 DB 集成测试能力）

---

## 14. 与前端的契约

- API 风格：REST
- 请求响应结构：以 `packages/api-contracts/API_REQUEST_RESPONSE_SPEC.md` 为唯一规范来源

---

## 15. 本文档的“合并与替代”说明

为减少文档分散，本文档已吸收并覆盖以下内容（后续以本文档为准）：
- Query 层规范（原 `架构设计/01-Architecture/Query-Layer.md`）
- API Surface/端点约定（原 `架构设计/01-Architecture/API-Surface.md`、`架构设计/04-API/API-Endpoints-Index.md`）
- DTO 字段与通用结构（原 `架构设计/04-API/DTO-Glossary.md`）
- Stats/Outbox 策略与幂等要点（原 `架构设计/01-Architecture/Stats-Strategy.md` 等）
