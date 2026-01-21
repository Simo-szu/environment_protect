# Query Layer（BFF/聚合查询层）规范 · v0.1

> 目标：面向前端页面，提供“只读聚合查询”，把多个模块的数据拼装成 UI 需要的 DTO。
> 原则：Query 层只读，不写入；写入必须回到各模块应用服务；统计与用户态可拼装。

---

## 1. Query 层职责
Query 层负责：
- 把页面需要的数据一次性查出来并拼装（减少前端多次请求）
- 组合读取：主表 + stats + 用户态（是否点赞/收藏）+ 评论树
- 做轻量排序/过滤/分页（基于索引字段）
- 做“读模型”优化（未来可加缓存/物化视图）

Query 层不负责：
- 不创建/修改任何业务数据（禁止写入任何表）
- 不做核心权限判定（只做最基础的可见性过滤）
- 不负责积分计算、推荐生成、统计重算

---

## 2. 权限与可见性（只读层的最小规则）
- Content/Activity 只返回 status=PUBLISHED（除非是后台接口，后置）
- 用户态字段（liked/faved）仅在 user_id 存在时拼装，否则返回 false
- 游客可读公开内容与活动，但不可评论/互动写入

---

## 3. v0.1 页面级聚合查询清单（必须覆盖）

### 3.1 首页 Home 聚合
#### HomeFeed（首页模块卡片与热门内容）
返回：
- 最新 3 条内容（NEWS 优先，按 published_at desc）
- 最新 3 个活动（按 start_time desc，null 兜底 created_at desc）
- 轮播卡片数据：固定配置（可先写死在前端/配置表后置）

说明：
- v0.1 不做“真正推荐”，首页先用最新数据

---

### 3.2 科普列表页 ContentList
输入：
- type（NEWS/DYNAMIC/POLICY/WIKI）
- page/pageSize（默认 10）

返回（每条）：
- content.id / title / summary / cover_url / published_at
- stats：like_count / fav_count / comment_count
- userState（可选）：liked / faved

排序：
- published_at desc（为空按 created_at desc）

---

### 3.3 科普详情页 ContentDetail
输入：content_id

返回：
- content 主体（title/cover/body/published_at/source_url 等）
- stats（like/fav/comment/hot）
- userState：liked/faved
- commentPreview（可选）：前 N 条 root 评论（最新/最热可切换）

---

### 3.4 活动列表页 ActivityList
输入：
- category（默认“环保市集”）
- page/pageSize（默认 5）
- sort（默认最新：start_time desc, null 兜底 created_at desc）

返回（每条）：
- activity.id / title / category / start_time / location / description(截断)
- poster_urls[0]（封面）
- stats：like/fav/comment
- userState：liked/faved
- signupState（登录用户可选）：hasSignedUp（后置，v0.1 可不做）

---

### 3.5 活动详情页 ActivityDetail
输入：activity_id

返回：
- activity 主体（含 source_type/host_user_id/source_url）
- stats
- userState：liked/faved
- signupPolicy：
  - source_type=CRAWLED：canSignup=false + source_url
  - source_type=HOSTED：canSignup=true
- comment 区：同 ContentDetail（target=ACTIVITY）

---

### 3.6 我的页面 MyHome
输入：user_id

返回：
- profile（nickname/avatar/gender/birthday/hometown）
- points（balance）
- unread（后置：回复我的红点，需要通知模块 v1.1）

---

### 3.7 我的收藏/点赞列表 MyReactions
输入：
- user_id
- reaction_type（LIKE 或 FAV）
- target_type（CONTENT/ACTIVITY）
- page/pageSize

返回：
- 目标主体摘要（title/cover/published_at 或 activity.title/poster/start_time）
- 对应 stats（可选）
- reaction.created_at（收藏时间）

说明：
- 这是典型跨表 join：reaction → content/activity

---

## 4. 评论树查询规范（Interaction Read Model）
评论展示需求：
- root 评论分页
- 支持 最新/最热 切换
- 回复按时间正序

Query 推荐拆分为 2 次读（性能/复杂度平衡）：
1) 拉 root 评论列表（带 stats）
2) 对本页 root_id 批量拉 replies（where root_id in (...)）

备注：
- depth 最大 3 层由应用层约束
- “最热排序”使用 comment_stats.hot_score

---

## 5. 用户态拼装（liked/faved）
对列表/详情：
- 在 user_id 存在时，批量查询 yl_reaction：
  - where user_id=? and target_type=? and target_id in (...)
- 组装 liked/faved 布尔值
- 统计 count 永远来自 *_stats，不从 reaction 聚合

---

## 6. 推荐查询（v0.1）
- 个性推荐：读 yl_weekly_recommendation（本周 week_start）
- 每周最新：实时查 activity/content 最新 5 条（不落表）

---

## 7. 未来扩展点（先留口）
- 缓存：热门列表、详情页可加 Redis
- 物化视图：极热场景可把 list DTO 物化
- 搜索：增加 SearchQuery 聚合（后置）
