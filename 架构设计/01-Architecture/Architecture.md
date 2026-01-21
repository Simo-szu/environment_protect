# 一.Module Boundaries（v0.1）

> 目的：约束“谁负责什么”“谁能读/写哪些表”，避免后续系统耦合失控。
> 原则：写操作集中在各模块应用服务；跨模块通过事件或只读接口；统计与热度尽量异步。

---

## 0. 模块列表
- Auth：登录/注册/会话
- User：用户资料
- Content：科普内容（新闻/动态/政策/百科）
- Activity：活动（抓取/发布/报名）
- Interaction：评论/点赞/收藏/踩踩
- Points：积分/签到/任务/问答/勋章
- Event：行为事件（事实记录）
- Recommendation：推荐结果（每周个性化）

---

## 1. 边界规则（强制）
### 1.1 写入规则（Write Ownership）
- 一个表只能由“所属模块”写入（Owner-write）
- 其他模块如果要影响它：只能调用该模块应用服务，或发事件

### 1.2 读取规则（Read Access）
- 读允许更开放，但要遵循：
  - 业务主流程的聚合查询由 “BFF/Query 层” 做组装
  - 模块内部读写分离：写模型（主表）+ 读模型（stats/视图/缓存）

### 1.3 跨模块协作
- 需要异步可重算的：走 Event
- 需要立即一致的：调用模块应用服务（同步）

---

## 2. 模块 → 表所有权（Owner）
### Auth（Owner）
- yl_user
- yl_user_identity
- yl_user_password
- yl_auth_refresh_token
- yl_verification_code（可选/审计）

### User（Owner）
- yl_user_profile

### Content（Owner）
- yl_content
- yl_content_stats（统计可由 Interaction/Worker 更新，但写入口仍归 Content 服务）

### Activity（Owner）
- yl_activity
- yl_activity_stats
- yl_activity_signup

### Interaction（Owner）
- yl_comment
- yl_comment_stats
- yl_reaction

### Points（Owner）
- yl_points_account
- yl_points_ledger
- yl_signin_record
- yl_daily_task
- yl_daily_task_progress
- yl_daily_quiz
- yl_daily_quiz_record
- yl_badge
- yl_user_badge

### Event（Owner）
- yl_user_event

### Recommendation（Owner）
- yl_weekly_recommendation

---

## 3. 谁能读谁（Read Matrix · v0.1）
### 3.1 Content 页面（科普）
- 读：yl_content + yl_content_stats
- 互动按钮：读 yl_reaction（用户态）+ 统计来自 content_stats
- 评论区：读 yl_comment + yl_comment_stats（target=CONTENT）

### 3.2 Activity 页面（活动）
- 读：yl_activity + yl_activity_stats
- 游客报名：写 yl_activity_signup（Activity 服务）
- 评论区：读 yl_comment + yl_comment_stats（target=ACTIVITY）

### 3.3 My 页面（我的）
- 读：yl_user_profile
- 读：yl_points_account（积分余额）
- 读：收藏/点赞列表：yl_reaction → join content/activity（Query 层聚合）

---

## 4. 跨模块写入协作（必须遵守）
### 4.1 Interaction → Content/Activity 的 comment_count/like_count/fav_count
- Interaction 发生点赞/收藏/评论后：
  - 同步写：yl_reaction / yl_comment（Interaction Owner）
  - 异步更新：content_stats / activity_stats（由 Worker 或 Interaction 发事件给 Stats 更新器）

> v0.1 推荐：统计更新走异步（最终一致），避免每次点赞都跨表事务。

### 4.2 Interaction → CommentStats（最热排序）
- 点赞/踩踩/回复 → 更新 yl_comment_stats（可同步，因为同模块）

### 4.3 Event → Points（任务进度）
- Points 不直接依赖业务表查询（避免耦合）
- 由 Event 驱动：
  - VIEW_CONTENT / COMMENT_CREATE / PLAY_GAME 等
  - Points 消费事件推进 yl_daily_task_progress

### 4.4 ActivitySignup → Event → Points（可选）
- 报名成功可记录事件 SIGNUP_ACTIVITY
- 若未来有“报名加分”任务，可直接靠事件推进

---

## 5. 查询聚合层（Query/BFF 层）
v0.1 允许存在一个“查询聚合层”，它只做读取与拼装，不做写入：
- 列表页：活动/内容 + stats + 用户是否已点赞/收藏
- 详情页：主表 + stats + 评论树 + 用户行为态

写入仍回到各模块应用服务。

---

## 6. 一致性策略（v0.1）
- 主数据（content/activity/comment/reaction/signup）强一致（同库事务内）
- 统计数据（*_stats）最终一致（事件/worker 更新）
- 推荐（weekly_recommendation）最终一致（每周重算覆盖）
- VIEW 事件：Redis 去重 10min，最终一致写入 event 表


# 二.Core Flows（v0.1 核心业务流）

> 目标：把最关键的用户路径用“状态机/步骤”写清楚，作为后续 API 与实现的唯一依据。
> 约定：错误提示与交互细节由前端实现；后端返回统一错误码/错误信息即可。

---

## Flow 1：邮箱注册（验证码 + 密码）
### 输入
- email
- otp_code（120s 有效）
- password（>=8 位，数字+字母，复杂度校验）

### 状态机
1) SEND_OTP(email)
   - 触发：用户点击“获取验证码”
   - 约束：限流（按 email、IP）
   - 输出：统一提示（不暴露是否已注册）

2) SUBMIT_REGISTER(email, otp, password)
   - 校验 otp：正确/过期/错误
   - 校验 password：复杂度通过/不通过
   - 成功写入：
     - Auth：yl_user
     - Identity：EMAIL（verified_at=now）
     - Password：hash
     - Session：refresh token
   - 输出：登录态（access/refresh）

### 失败分支（后端语义）
- OTP_EXPIRED：验证码过期（前端清空 email+otp）
- OTP_INVALID：验证码错误（前端清空 otp）
- PASSWORD_WEAK：密码复杂度不通过
- IDENTITY_EXISTS：邮箱已注册（提示去登录或找回）

---

## Flow 2：手机注册（短信验证码 + 密码）
同 Flow 1，区别：
- identity_type = PHONE
- account = phone（E.164）
- channel = SMS

---

## Flow 3：邮箱验证码登录（无密码）
### 输入
- email
- otp_code

### 状态机
1) SEND_OTP(email)（同上）
2) SUBMIT_LOGIN(email, otp)
   - 校验 otp
   - 查找 Identity(EMAIL, email)
     - 不存在：返回 NOT_REGISTERED（或统一提示）
     - 存在：签发 session（refresh/access）
   - 更新 yl_user.last_login_at

---

## Flow 4：手机短信登录（无密码）
同 Flow 3，区别：PHONE + SMS

---

## Flow 5：Google 登录（OAuth，无密码）
### 输入
- google_id_token（或 code）
### 核心原则
- 后端必须校验 token 签名、aud、iss、exp
- 使用 google_sub 作为唯一标识（identity_identifier）

### 状态机
1) VERIFY_GOOGLE_TOKEN(id_token) → 得到 sub、email（可能有）
2) FIND Identity(GOOGLE, sub)
   - 存在：登录（签发 session）
   - 不存在：注册并登录：
     - 创建 yl_user
     - 创建 Identity(GOOGLE, sub, verified_at=now)
     - （v0.1 不自动合并到已有 email 账号；合并后置）

失败分支：
- GOOGLE_TOKEN_INVALID

---

## Flow 6：活动报名（支持游客 + 邮件提醒）
### 入口条件
- 活动必须 source_type=HOSTED（否则不可报名）

### 两种报名路径
#### 6A 登录用户报名
输入：
- activity_id
- real_name（必填）
- phone（必填）
- join_time（必填）

流程：
1) 校验活动可报名（HOSTED）
2) 写入 yl_activity_signup（user_id=当前用户，email=用户邮箱或表单填）
3) 去重：同 activity_id + user_id 只能一次（幂等）
4) 触发邮件提醒（异步 MailJob）
5) 返回：报名成功 toast

失败分支：
- ACTIVITY_NOT_SIGNABLE（抓取活动）
- SIGNUP_DUPLICATE（重复报名）
- REQUIRED_MISSING（字段缺失）

#### 6B 游客报名（无需登录）
输入：
- activity_id
- email（必填，用于提醒/去重）
- real_name（必填）
- phone（必填）
- join_time（必填）

流程：
1) 校验活动可报名（HOSTED）
2) 写入 yl_activity_signup（user_id=NULL，email=输入邮箱）
3) 去重：同 activity_id + email 只能一次（幂等）
4) 触发邮件提醒（异步 MailJob）
5) 返回：报名成功 toast

失败分支同上。

---

## Flow 7：评论与回复（必须登录，三层）
### 约束
- depth 最大 3 层（0/1/2），超过拒绝
- root_id：根评论 id
- 回复按 created_at 正序展示

### 7A 发表根评论
输入：
- target_type（CONTENT/ACTIVITY）
- target_id
- body

流程：
1) 校验已登录
2) 写 yl_comment（depth=0，parent_id=NULL，root_id=id）
3) 写 yl_comment_stats（初始 0）
4) 写 OutboxEvent：COMMENT_CREATED（用于更新 content/activity comment_count）
5) 返回：新评论

### 7B 回复评论（两种）
输入：
- parent_comment_id
- body

流程：
1) 校验已登录
2) 读取 parent_comment（得到 target_type/target_id/root_id/depth）
3) 若 parent.depth >= 2 → 拒绝（超层级）
4) 写新 comment：
   - parent_id = parent.id
   - root_id = parent.root_id
   - depth = parent.depth + 1
5) 更新 parent 的 reply_count（comment_stats，模块内同步）
6) 写 OutboxEvent：COMMENT_CREATED（用于更新 content/activity comment_count）
7) 返回：新回复

---

## Flow 8：点赞/收藏/踩踩（必须登录，幂等）
### 输入
- target_type（CONTENT/ACTIVITY/COMMENT）
- target_id
- reaction_type（LIKE/FAV/DOWNVOTE）

### 8A 创建 Reaction（幂等）
流程：
1) 校验已登录
2) 写 yl_reaction（唯一约束确保幂等）
3) 更新 comment_stats（若 target=COMMENT，同模块可同步）
4) 写 OutboxEvent：REACTION_CREATED（用于 content/activity stats 更新）
5) 返回：成功

### 8B 取消 Reaction（幂等）
流程：
1) 校验已登录
2) 删除 yl_reaction（不存在则视为成功）
3) 更新 comment_stats（若 target=COMMENT）
4) 写 OutboxEvent：REACTION_DELETED
5) 返回：成功

---

## Flow 9：踩踩折叠评论（比例规则）
### 判定条件（v0.1）
- down_count >= 3 且 down/(like+1) >= threshold → comment.status=HIDDEN

执行点：
- 每次 DOWNVOTE 变更后，在 Interaction 内评估是否折叠
- 折叠/恢复均写 OutboxEvent（用于外部 comment_count 可见数更新）


# 三.Enums V0.1（smallint 写死枚举统一定义）

> 目标：统一所有 smallint 枚举含义，避免前后端/运营/数据理解不一致。
> 原则：v0.1 不随意改值；新增值只能追加；弃用保留不复用。

---

## 1) Auth

### UserRole（yl_user.role）
- 1 USER（普通用户）
- 2 HOST（活动主办方）
- 3 ADMIN（运营/管理员）

### UserStatus（yl_user.status）
- 1 ACTIVE（正常）
- 2 BLOCKED（封禁/冻结）

### IdentityType（yl_user_identity.identity_type）
- 1 EMAIL
- 2 PHONE
- 3 GOOGLE

### VerificationChannel（yl_verification_code.channel）
- 1 EMAIL
- 2 SMS

### VerificationPurpose（yl_verification_code.purpose）
- 1 REGISTER
- 2 LOGIN
- 3 RESET_PASSWORD

---

## 2) Content（科普）

### ContentType（yl_content.type）
- 1 NEWS（环保新闻）
- 2 DYNAMIC（环保动态）
- 3 POLICY（环保政策）
- 4 WIKI（环保百科）

### ContentSourceType（yl_content.source_type）
- 1 MANUAL（运营手动）
- 2 CRAWLED（抓取转载）

### ContentStatus（yl_content.status）
- 1 PUBLISHED（发布）
- 2 DRAFT（草稿）
- 3 HIDDEN（下架/隐藏）

---

## 3) Activity（活动）

### ActivitySourceType（yl_activity.source_type）
- 1 CRAWLED（抓取转载：有原文链接，不可报名）
- 2 HOSTED（本站发布：可报名）

### ActivityStatus（yl_activity.status）
- 1 PUBLISHED（发布）
- 2 HIDDEN（隐藏/下架）
- 3 ENDED（已结束）

### ActivityCategory（yl_activity.category）
- 1 环保市集
- 2 植树活动
- 3 垃圾分类
- 4 环保展览
- 5 环保打卡
- 6 环保DIY
- 7 环保快闪
- 8 环保骑行

---

## 4) Interaction（评论/点赞/收藏/踩踩）

### CommentTargetType（yl_comment.target_type）
- 1 CONTENT
- 2 ACTIVITY

### CommentStatus（yl_comment.status）
- 1 VISIBLE（可见）
- 2 HIDDEN（折叠/隐藏）

### ReactionTargetType（yl_reaction.target_type）
- 1 CONTENT
- 2 ACTIVITY
- 3 COMMENT

### ReactionType（yl_reaction.reaction_type）
- 1 LIKE（点赞）
- 2 FAV（收藏）
- 3 DOWNVOTE（踩踩）

---

## 5) Points（积分系统）

### PointsReason（yl_points_ledger.reason）
- 1 SIGNIN（签到）
- 2 TASK（任务）
- 3 QUIZ（问答）
- 4 ADMIN（运营调整）
- 5 OTHER（其他）

### TaskProgressStatus（yl_daily_task_progress.status）
- 1 DOING（进行中）
- 2 CLAIMABLE（可领取）
- 3 DONE（已完成）

### BadgeSeries（yl_badge.series）
- 1 POINTS（积分兑换系列）
- 2 SIGNIN（连续签到系列）

---

## 6) Outbox（事件外箱）

### OutboxStatus（yl_outbox_event.status）
- 1 PENDING（待处理）
- 2 PROCESSING（处理中）
- 3 DONE（已完成）
- 4 DEAD（失败终止）

---

## 7) Event（行为事件）——v0.1 先用字符串
说明：yl_user_event.event_type v0.1 使用字符串，避免枚举频繁变更带来的迁移。
建议事件名（小写或大写统一一种即可）：
- VIEW_CONTENT
- VIEW_ACTIVITY
- LIKE
- FAV
- DOWNVOTE
- COMMENT_CREATE
- SIGNUP_ACTIVITY
- SIGNIN
- PLAY_GAME（后置）
## 8) 变更规则
- v0.1 之后新增枚举值只能“追加”，禁止改已有数字含义
- 删除/弃用：保留数字但标记 deprecated，不复用


# 四.Deployment Shape（系统形态/组件）· v0.1

> 目标：定义 v0.1 部署需要的组件与边界，明确每个组件负责什么。
> 原则：先单体可运行；异步能力通过 Worker 拆出；所有状态以 Postgres 为真相源。

---

## 1) 组件清单（v0.1）
### 1. Web（Next.js）
- 负责：页面渲染、UI 交互、调用后端 API
- 不负责：业务规则、权限判定、统计计算

### 2. API（Spring Boot 单体）
- 负责：所有 Command APIs（写入）与 Query APIs（读取聚合）
- 负责：鉴权、权限、数据校验、事务写入
- 不负责：重型异步任务（交给 Worker）

### 3. Worker（后台任务进程）
- 负责：
  - 消费 OutboxEvent 更新 *_stats（StatsUpdater）
  - 发送邮件（MailJob）
  - 每周生成推荐（RecommendationJob，后置）
  - 抓取内容/活动（CrawlerJob，后置）
- 运行方式：
  - v0.1 可与 API 同仓库，但独立进程部署（建议）
  - 或 v0.1 先作为 API 内的定时任务（不推荐长期）

### 4. PostgreSQL（主数据库）
- 作为真相源（source of truth）
- 存储：业务主数据 + stats + outbox + 事件流（event）

### 5. Redis（缓存/限流/去重/OTP）
- 负责：
  - OTP 存储（推荐优先 Redis）
  - 发送限流计数器
  - VIEW 去重窗口（10 min）
  - 轻量缓存（后置）

### 6. Object Storage（对象存储）
- 存储：
  - 头像 avatar
  - 活动海报 poster
  - 未来：内容图片
- 数据库只存 URL

---

## 2) 通信关系（谁调用谁）
### 2.1 Web → API
- Web 调用 /q/* 查询
- Web 调用 /c/* 写入（登录、评论、点赞、报名、签到、领取任务）

### 2.2 API ↔ PostgreSQL
- API 写主表（yl_comment/yl_reaction/yl_activity_signup 等）
- API 写 outbox_event（同事务）
- API 读 stats/拼装 userState

### 2.3 API ↔ Redis
- OTP 发送/校验（优先 Redis）
- 发送限流计数
- VIEW 去重 10 分钟
- （后置）热点缓存

### 2.4 Worker ↔ PostgreSQL
- Worker 拉取 yl_outbox_event(PENDING)
- Worker 原子更新 *_stats
- Worker 标记 outbox DONE / DEAD

### 2.5 Worker ↔ 邮件服务
- 发送报名成功邮件（v0.1）
- （后置）活动提醒邮件（需要 start_time）

---

## 3) v0.1 数据一致性与延迟
- 主数据写入：强一致（API 内事务）
- stats：最终一致（Outbox → Worker 更新，有延迟）
- 推荐：最终一致（每周计算覆盖）
- VIEW 事件：Redis 去重后写入（最终一致）

---

## 4) 进程与伸缩建议（v0.1）
- API：优先 1 个实例起步
- Worker：1 个实例即可（按 outbox 消费速度调大）
- Redis：单实例起步
- PostgreSQL：单实例起步

v0.2 扩展（后置）：
- Worker 拆分为 stats-worker / mail-worker / crawler-worker
- 引入消息队列（Kafka/RabbitMQ）替代 outbox 拉取（可选）

---

## 5) 外部依赖清单（需要提前选型）
- 邮件服务（SMTP 或第三方：SendGrid/Mailgun 等）
- 短信服务（国内供应商）
- Google OAuth（Client ID/Secret）


# 五.Repo Layout（仓库结构）· v0.1

> 目标：明确代码与文档的落位，让后续开发按结构推进。
> 原则：Web / API / Worker 分开；Domain 与 Infrastructure 分层；文档与 schema 设计在 Obsidian 维护。

---

## 1) 顶层结构（推荐 Monorepo）
repo-root/
- apps/
  - web/                # Next.js（前端）
  - api/                # Spring Boot（对外 API：Query + Command）
  - worker/             # Spring Boot 或 Java 程序（Outbox/Stats/Mail/推荐/抓取）
- libs/
  - common/             # 共享：枚举、错误码、通用DTO、时间工具、常量
  - domain/             # 领域模型（纯 Java，不依赖框架）【可后置】
- infra/
  - docker/             # Dockerfile、镜像构建脚本
  - coolify/            # Coolify 配置/模板（可选）
- docs/
  - obsidian/           # 你的 Obsidian Vault（或导出的 md）
  - diagrams/           # 导出的架构图/流程图（后置）
- scripts/
  - db/                 # （后置）生成SQL/重算脚本等
- README.md

说明：
- v0.1 不必做复杂的“领域驱动全套”，但目录先预留。
- Obsidian 建议放在 docs/obsidian，方便版本管理。

---

## 2) apps/api 内部结构（建议）
apps/api/
- src/main/java/...
  - config/             # 安全、序列化、CORS、拦截器等
  - auth/               # Auth 模块（Command + Query 分包）
  - user/               # User Profile
  - content/            # Content 模块
  - activity/           # Activity 模块
  - interaction/        # Comment/Reaction
  - points/             # Points 模块
  - event/              # UserEvent 写入
  - recommendation/     # WeeklyRecommendation 查询（生成在 worker）
  - query/              # 聚合查询层（只读 DTO 组装）
  - common/             # error、response、utils、enums（或从 libs/common 引用）
- src/main/resources/
  - mapper/             # MyBatis XML（按模块分文件夹）
  - application.yml
  - db/migration/       # Flyway（后置：真正开始编码时再加）

规则（强制）：
- /query 只读，不写库
- 模块包内的 service 负责写入与校验（Command）
- Mapper/DAO 不跨模块写入别人的表（Owner-write）

---

## 3) apps/worker 内部结构（建议）
apps/worker/
- src/main/java/...
  - jobs/
    - outbox/            # Outbox see & dispatch
    - stats/             # StatsUpdater
    - mail/              # MailJob
    - recommendation/    # Weekly job（后置）
    - crawler/           # 抓取（后置）
  - common/              # 与 api 共享的配置/工具（优先放 libs）
- src/main/resources/
  - application.yml

规则：
- Worker 不提供对外 HTTP（可选仅健康检查）
- Worker 只做异步计算/发送/更新 stats
- Worker 不写主表（除非明确的后台任务，如抓取入库）

---

## 4) libs/common（共享约定）
建议包含：
- Enums（与 docs/Enums-V0.1 对齐）
- ErrorCode（错误码）
- Time/Date utils
- Response wrapper（统一返回结构）
- DTO（跨服务共享的最小 DTO，避免耦合）

---

## 5) 文档与代码的对齐方式
- docs/obsidian 是“设计真相源”
- apps/* 代码实现必须遵守：
  - Module-Boundaries
  - Query-Layer
  - API-Surface
  - Enums-V0.1
  - Core-Flows
  - Stats-Strategy（Outbox）
  - Email-SMS-Policy
  - Deployment-Shape

# 六.Email & SMS Policy（验证码 / 邮件提醒）· v0.1

> 目标：统一验证码发送/校验规则，统一错误语义；定义游客报名邮件提醒策略。
> 原则：安全优先、可控限流、对用户反馈明确、对攻击面不泄露信息。

---

## 1) OTP（邮箱/短信验证码）基础规则
### 1.1 有效期与倒计时
- OTP 有效期：60 秒（PRD）
- 前端交互：发送后按钮显示倒计时“60s”，结束恢复“获取验证码”
- 后端不依赖前端倒计时：以 expires_at 为准

### 1.2 OTP 使用场景（purpose）
- REGISTER：注册
- LOGIN：验证码登录
- RESET_PASSWORD：找回密码/重置

### 1.3 发送策略（send）
输入：account（email/phone）+ channel（email/sms）+ purpose  
输出：统一“已发送”提示（不暴露账号是否存在）

安全原则：
- 对外响应不要暴露“该邮箱是否注册”
- 发送失败也尽量返回通用提示（详细原因写日志）

---

## 2) OTP 校验策略（verify）
### 2.1 校验结果语义（给前端用）
- OTP_OK：验证通过
- OTP_EXPIRED：验证码过期
- OTP_INVALID：验证码错误（含长度不对/格式不对）
- OTP_TOO_MANY_ATTEMPTS：错误次数过多（暂时锁定）

### 2.2 PRD 错误交互映射（前端提示建议）
- OTP_EXPIRED：
  - 弹窗：“你的验证码已过期，请重新获取验证码。”
  - 清空：手机号/邮箱输入框 + 验证码输入框
- OTP_INVALID：
  - 弹窗：“验证码错误，请重新输入。”
  - 清空：验证码输入框

### 2.3 错误次数限制
- 同一 account + purpose：
  - 最多 5 次错误尝试（达到后返回 OTP_TOO_MANY_ATTEMPTS）
  - 锁定时间：10 分钟（可配置）

---

## 3) 限流策略（Rate Limit）· v0.1 推荐
为防短信轰炸/邮箱轰炸，限流维度建议三层叠加（任一触发则拒绝）：

### 3.1 按 account 限流（最重要）
- 1 分钟最多 1 次发送
- 10 分钟最多 3 次发送
- 24 小时最多 10 次发送（短信可更严）

### 3.2 按 IP 限流
- 1 分钟最多 5 次发送请求
- 10 分钟最多 20 次

### 3.3 按 purpose 限流
- RESET_PASSWORD 更严格（防撞库）

实现建议：
- v0.1 用 Redis 计数器（incr + ttl）
- 不用落库（落库可做审计后置）

---

## 4) 注册/登录对 Identity 的策略
### 4.1 注册（email/phone）
- REGISTER 成功 → 创建 identity（verified_at=now）
- 创建 password（hash）
- 自动登录（签发 session）

### 4.2 验证码登录（email/phone）
- LOGIN 成功 → 必须存在对应 identity
- 不存在 → 返回 NOT_REGISTERED（或统一提示“请先注册”）

### 4.3 Google 登录
- 不发 OTP
- OAuth 校验通过即可 verified_at=now（identity_type=GOOGLE）

---

## 5) 游客报名邮件提醒（ActivitySignup Email）
### 5.1 触发时机
- POST /c/activities/{id}/signup 成功后触发（异步 MailJob）
- 登录报名与游客报名都可以触发邮件（游客必须 email）

### 5.2 邮件类型（v0.1）
- SIGNUP_SUCCESS：报名成功通知（立即发送）

（后置）
- EVENT_REMINDER：活动开始前提醒（需活动 start_time 非空）

### 5.3 邮件内容字段（模板占位）
报名成功（SIGNUP_SUCCESS）：
- 用户称呼：real_name（或 nickname）
- 活动标题：activity.title
- 活动时间：start_time（若为空显示“时间待定”）
- 活动地点：location（可空）
- 参与时间：join_time
- 联系方式：官方邮箱/联系方式（后置）
- 退订/隐私：后置

### 5.4 邮件发送幂等
- 同一报名记录只发送一次成功邮件
- 幂等键建议：signup_id + template_type
（实现可放在 MailJob 内部表/Redis 去重，v0.1 可简单做）

---

## 6) 与 Outbox 的关系（推荐）
v0.1 推荐：
- 报名成功时写 OutboxEvent：SIGNUP_CREATED（payload 含 signup_id、email、activity_id）
- MailJob 消费该事件发送邮件
优点：
- 请求链路不阻塞
- 失败可重试、可审计

（如果你不想 signup 也进 outbox，v0.1 也可直接异步队列/线程池，后续再统一）


# 七.Idempotency Policy（幂等/去重策略）· v0.1

> 目标：定义所有“可能被重复点击/重复请求”的接口如何保证不会重复写、不会重复发放积分、不会重复发邮件。
> 原则：能用数据库唯一约束就用；否则用幂等键/状态机；对外保持“重复也返回成功或明确冲突”。

---

## 1) 幂等策略清单（按接口）

### 1.1 OTP 发送
接口：
- POST /c/auth/otp/email/send
- POST /c/auth/otp/phone/send

策略：
- Redis 限流计数器（按 account + purpose + IP）
- 在限流窗口内重复请求 → 返回 RATE_LIMITED 或 OK（推荐：RATE_LIMITED）

备注：
- 不需要“幂等键”，以限流为准

---

### 1.2 注册（email/phone）
接口：
- POST /c/auth/register/email
- POST /c/auth/register/phone

策略：
- Identity 全局唯一约束：
  - (identity_type, identity_identifier) unique
- 重复注册同账号 → 返回 IDENTITY_EXISTS

---

### 1.3 验证码登录（email/phone）
接口：
- POST /c/auth/login/email-otp
- POST /c/auth/login/phone-otp

策略：
- 多次登录允许（签发多 session）
- 若你希望“同设备只保留一个 refresh token”：按 device_id 覆盖（后置）

---

### 1.4 Google 登录
接口：POST /c/auth/oauth/google

策略：
- google_sub 对应 identity 唯一
- token 重放：
  - 仍可登录（签发新 session），无副作用问题

---

## 2) Interaction（点赞/收藏/踩踩）
### 2.1 创建 reaction
接口：POST /c/reactions  
策略（强幂等）：
- DB 唯一约束：
  - (user_id, target_type, target_id, reaction_type) unique
- 冲突时处理：
  - 推荐：返回 OK（前端体验更好，按钮保持已点亮）

### 2.2 删除 reaction
接口：DELETE /c/reactions  
策略（强幂等）：
- 删除不存在也返回 OK（安全重试）

---

## 3) Comment（评论/回复）
接口：POST /c/comments

策略（v0.1）：
- 不做强幂等（用户连点会产生两条评论）
- 前端防抖为主（后置可加 requestId）
（可选后置）
- 客户端提交 requestId，后端按 (user_id, request_id) 幂等

---

## 4) Activity Signup（报名：允许游客）
接口：POST /c/activities/{id}/signup

去重规则（必须）：
- 登录用户：unique(activity_id, user_id) where user_id not null
- 游客：unique(activity_id, email)

重复提交行为：
- 推荐：返回 SIGNUP_DUPLICATE（给用户明确反馈）
- 或返回 OK + “你已报名”（产品选择，v0.1 用 SIGNUP_DUPLICATE 更清晰）

邮件幂等（必须）：
- 同一 signup_id 的成功邮件只发一次
- 幂等键：signup_id + template_type
- 存储方式：
  - v0.1 可 Redis setnx（ttl 7d）
  - 或单独 mail_send_log 表（后置）

---

## 5) Points（积分）
### 5.1 签到
接口：POST /c/points/signin  
策略：
- DB 主键/唯一：
  - (user_id, signin_date) PK
- 重复签到：SIGNIN_ALREADY_DONE
- 积分发放：写 points_ledger 必须与签到成功绑定（事务内）

### 5.2 领取任务积分
接口：POST /c/points/tasks/{taskId}/claim  
策略（状态机）：
- progress.status 必须是 CLAIMABLE 才能领取
- 领取后变 DONE
- 重复领取：TASK_ALREADY_CLAIMED
- points_ledger：建议加唯一约束（可选后置）：
  - (user_id, reason=TASK, ref_id=task_progress_key) unique

### 5.3 每日问答
接口：POST /c/points/quiz/submit  
策略：
- (user_id, quiz_date) PK
- 重复提交：QUIZ_ALREADY_DONE
- 发放积分依赖 record 首次写入成功

---

## 6) Outbox 消费（Worker）
对象：yl_outbox_event

策略（必须）：
- status 状态机保证“只成功一次”
- 领取 pending 事件后置为 processing（避免并发重复消费）
- stats 更新用原子加减（避免丢增量）
- 失败重试：retry_count + next_retry_at
- 超过阈值：dead（人工处理/重算兜底）

---

## 7) 总结（v0.1 最重要的三条）
1) 幂等优先用 DB 唯一约束（reaction/signup/signin/quiz）
2) 积分发放必须绑定状态机或唯一流水（避免重复发放）
3) 异步消费必须可重试 + 可审计（outbox）
