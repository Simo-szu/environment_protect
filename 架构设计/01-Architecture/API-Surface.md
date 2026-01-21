# API Surface（接口面）· v0.1

> 目标：把系统接口按 Query（读）与 Command（写）分层，指导后续服务拆分与路由设计。
> 原则：Query 只读聚合；Command 只做写入与校验；统计更新与推荐生成走异步。

---

## 1) Query APIs（只读聚合）
### Home
- GET /q/home
  - 返回：首页内容+活动最新卡片，轮播卡片配置（v0.1 可固定）

### Content（科普）
- GET /q/contents?type=&page=&size=
  - 返回：列表（含 stats + userState）
- GET /q/contents/{id}
  - 返回：详情（含 stats + userState）
- GET /q/contents/{id}/comments?sort=latest|hot&page=&size=
  - 返回：root 评论列表 + 本页 replies（按规范批量拉）

### Activity（活动）
- GET /q/activities?category=&page=&size=&sort=
  - 返回：列表（含 stats + userState）
- GET /q/activities/{id}
  - 返回：详情（含 stats + userState + signupPolicy）
- GET /q/activities/{id}/comments?sort=latest|hot&page=&size=
  - 返回：评论区（同上）

### My（我的）
- GET /q/me/profile
- GET /q/me/points
- GET /q/me/reactions?reactionType=LIKE|FAV&targetType=CONTENT|ACTIVITY&page=&size=
  - 返回：收藏/点赞列表（reaction join content/activity）

### Recommendation
- GET /q/recommendations/weekly
  - 返回：本周个性推荐（读 weekly_recommendation）
- GET /q/recommendations/latest
  - 返回：每周最新推荐（实时查最新 5 条）

---

## 2) Command APIs（写入/状态改变）
### Auth
- POST /c/auth/otp/email/send
- POST /c/auth/otp/phone/send
- POST /c/auth/register/email   (email + otp + password)
- POST /c/auth/register/phone   (phone + otp + password)
- POST /c/auth/login/email-otp  (email + otp)
- POST /c/auth/login/phone-otp  (phone + otp)
- POST /c/auth/oauth/google
- POST /c/auth/token/refresh
- POST /c/auth/logout

### User
- POST /c/me/profile
  - 修改昵称/性别/生日/家乡/头像url（头像上传策略后置）

### Interaction（必须登录）
- POST /c/reactions
  - (target_type, target_id, reaction_type) 幂等创建
- DELETE /c/reactions
  - 幂等取消
- POST /c/comments
  - 发表评论/回复（depth<=2）
- POST /c/comments/{id}/restore   （后置：作者/管理员）
- POST /c/comments/{id}/hide      （后置：管理员/折叠触发）

### Activity Signup（允许游客）
- POST /c/activities/{id}/signup
  - 登录用户：user_id 非空
  - 游客：user_id 为空但必须 email
  - 成功后可触发邮件提醒（异步）

### Points
- POST /c/points/signin
  - 当日签到（固定分 + 连续里程碑奖励）
- POST /c/points/tasks/{taskId}/claim
  - 领取任务积分（必须 claim）
- POST /c/points/quiz/submit
  - 每日问答提交（一天一次）

---

## 3) 异步/Worker（不对外暴露的内部能力）
### StatsUpdater（消费 Outbox）
- 输入：yl_outbox_event（reaction/comment 等）
- 输出：*_stats 更新 + hot_score 重算

### RecommendationJob（后置）
- 输入：yl_user_event + reactions + signups 等（或只用 event）
- 输出：yl_weekly_recommendation

### MailJob（邮件提醒）
- 输入：signup 创建事件（可写 outbox 或单独队列）
- 输出：向报名者发送提醒邮件（模板后置）

---

## 4) v0.1 约束（防止接口膨胀）
- Query 与 Command 必须分路径（/q/* vs /c/*）或分模块路由
- Query 不得写表（包括 stats）
- Command 不得做跨模块复杂 join（最多校验存在性/权限）
- 一切统计与推荐的“计算”都不在请求链路里做
