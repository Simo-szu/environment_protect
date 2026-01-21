# Schema V0.1（Final · 可读版）

> 目标：作为“设计阶段的最终数据库方案”，用于对齐后端/前端/产品。
> 原则：主数据与统计数据分离；多登录方式用 Identity 模型；游客报名支持邮件提醒；事件流驱动积分/推荐。

---

## 0. 全局约定
- 主键：uuid
- 枚举：smallint（写死，见 Enums-V0.1）
- created_at/updated_at：所有主表必备
- 统计表（*_stats）：允许异步更新（Worker/队列后置）

---

## 1. Auth（账号体系）
### 1.1 yl_user（用户主体）
用途：用户身份主体 + 权限/状态  
关键字段：role，status，last_login_at

### 1.2 yl_user_identity（登录标识）
用途：同一个用户支持多种登录方式  
identity_type：
- 1 EMAIL
- 2 PHONE
- 3 GOOGLE
identity_identifier：
- email（小写标准化）
- phone（E.164）
- google_sub（Google 唯一 id）
约束：
- (identity_type, identity_identifier) 全局唯一
- verified_at：验证码通过 / OAuth 校验通过写入

### 1.3 yl_user_password（密码凭证）
用途：EMAIL/PHONE 注册用户存 password_hash  
说明：Google-only 用户可能没有该记录

### 1.4 yl_auth_refresh_token（会话）
用途：remember me、多设备登录、可撤销

（可选）yl_verification_code：验证码审计兜底，运行时优先 Redis

---

## 2. User（用户资料）
### 2.1 yl_user_profile
用途：头像/昵称/性别/生日/家乡  
规则：
- 昵称不唯一
- 不保留头像历史（只存当前 avatar_url）

---

## 3. Content（科普）
### 3.1 yl_content
用途：新闻/动态/政策/百科  
type：NEWS/DYNAMIC/POLICY/WIKI  
source_type：MANUAL/CRAWLED  
约束：source_url 非空时唯一（防重复抓取）  
排序：按 published_at desc（为空时前端可兜底 created_at）

### 3.2 yl_content_stats
用途：like/fav/comment/hot_score 统计

---

## 4. Activity（活动）
### 4.1 yl_activity
用途：活动主体（抓取转载 + 本站发布）  
source_type：
- CRAWLED：详情带外链；不允许报名
- HOSTED：允许报名；主办方可查看报名统计
规则：
- start_time/end_time 可空（允许“待定”）

### 4.2 yl_activity_stats
用途：统计

### 4.3 yl_activity_signup（报名）
用途：活动报名（支持游客报名 + 邮件提醒）
规则：
- 允许游客报名：user_id 可空
- 游客报名必须提供 email（用于提醒/去重）
去重规则：
- 登录用户：同一 activity_id + user_id 只能报名一次
- 游客用户：同一 activity_id + email 只能报名一次
敏感信息：real_name/phone/email（需权限控制；加密后置）

---

## 5. Interaction（互动）
### 5.1 yl_comment（评论）
用途：内容/活动评论，支持楼中楼  
target_type：CONTENT / ACTIVITY  
规则：
- 评论必须登录（user_id 必填）
- 最大深度 3 层（depth 0/1/2），应用层限制
- root_id：根评论 id（根评论 root_id=id，回复继承 root_id）
排序：
- 最新：root 按 created_at desc
- 回复：按 created_at asc

### 5.2 yl_comment_stats
用途：评论的 like/down/reply/hot_score

### 5.3 yl_reaction（点赞/收藏/踩踩）
用途：统一行为表  
reaction_type：LIKE / FAV / DOWNVOTE  
约束：同一用户对同一目标同一行为只能一次（幂等）

踩踩折叠规则（比例）：
- down_count >= 3 且 down/(like+1) >= 阈值 → comment.status=HIDDEN（折叠）

## 5.4 Outbox（事件外箱）
### 5.4.1 yl_outbox_event
用途：保证互动写入与统计更新事件不丢失（Outbox Pattern）  
写入时机：Interaction 写 comment/reaction 的同事务内写入 outbox  
消费方式：Worker/StatsUpdater 拉取 pending → 更新 *_stats → 标记 done  
状态：PENDING / PROCESSING / DONE / DEAD

---

## 6. Points（积分系统）
### 6.1 yl_points_account（账户）
用途：积分余额

### 6.2 yl_points_ledger（流水）
用途：所有加减分必须落流水（可审计）

### 6.3 yl_signin_record（签到）
用途：日历签到记录 + 连续天数（streak_count 可冗余）
规则：
- 每日固定分 + 连续里程碑额外奖励（7/14/21）
- 断签：streak 清零

### 6.4 yl_daily_task（任务定义）
用途：任务配置（规则 json）
### 6.5 yl_daily_task_progress（任务进度）
规则：
- 任务进度由 Event 推进
- 达标后 status=CLAIMABLE
- 必须点击领取 → 写流水 → status=DONE

### 6.6 yl_daily_quiz（每日问答题目）
### 6.7 yl_daily_quiz_record（作答记录）
规则：一天一次（PK 保证不可重复提交）

### 6.8 yl_badge / yl_user_badge（勋章）
series：积分勋章/签到勋章  
threshold：json（points/streak）

---

## 7. Event（行为事件）
### 7.1 yl_user_event
用途：记录事实，用于推进任务/推荐/统计  
包含 VIEW 事件（浏览）
去重策略：
- VIEW_* 事件做 10 分钟去重（Redis SETNX + TTL）
- 不在 DB 做窗口唯一约束

---

## 8. Recommendation（推荐）
### 8.1 yl_weekly_recommendation
用途：存“个性推荐”结果  
规则：
- 每周生成覆盖
- items 可包含 activity + content
- “每周最新推荐”不落表，实时按时间查
