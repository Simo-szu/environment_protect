# Stats Strategy（v0.1）

> 目标：点赞/收藏/评论等互动行为能驱动各类 count 与 hot_score，但不让核心写操作跨模块事务。
> 原则：主数据强一致；统计最终一致；统计更新幂等；允许重算。

---

## 1. 哪些属于 Stats（统计数据）
### 1.1 ContentStats（yl_content_stats）
- like_count
- fav_count
- comment_count
- hot_score

### 1.2 ActivityStats（yl_activity_stats）
- like_count
- fav_count
- comment_count
- hot_score

### 1.3 CommentStats（yl_comment_stats）
- like_count
- down_count
- reply_count
- hot_score

---

## 2. Owner 与写入边界
- yl_comment_stats：由 Interaction 模块同步更新（同模块写，允许强一致）
- yl_content_stats / yl_activity_stats：由 StatsUpdater 统一更新（最终一致）
  - StatsUpdater 可以是 Worker，也可以是 Interaction 内的异步组件（同进程队列）

原因：
- Content/Activity 是业务主表，不应被 Interaction 的写事务“牵连”
- 统计更新天然允许延迟（最终一致）

---

## 3. 统计更新事件（输入）
### 3.1 事件来源（由 Interaction 产生）
- REACTION_CREATED（LIKE/FAV/DOWNVOTE）
- REACTION_DELETED（取消点赞/取消收藏/取消踩）
- COMMENT_CREATED（新增评论）
- COMMENT_HIDDEN（被折叠/审核隐藏）
- COMMENT_RESTORED（恢复可见）

### 3.2 事件载荷（最小必要字段）
- event_id（幂等）
- happened_at
- actor_user_id
- target_type（CONTENT/ACTIVITY/COMMENT）
- target_id
- action（LIKE/FAV/DOWNVOTE/COMMENT_CREATE/COMMENT_HIDE/COMMENT_RESTORE）
- delta（+1 / -1）

---

## 4. v0.1 推荐实现：Outbox + 异步更新（最终一致）
### 4.1 为什么要 Outbox（避免“写成功但事件丢了”）
- 互动写入（yl_comment / yl_reaction）与“待更新统计”必须同事务落库
- 然后由后台异步消费更新 stats

### 4.2 新增一张表（Outbox）
表名建议：yl_outbox_event
字段：
- id（uuid pk）
- event_type（varchar）
- payload（jsonb）
- status（smallint：1 pending 2 processing 3 done 4 dead）
- created_at / updated_at
- retry_count

写入时机：
- 在 Interaction 的事务内：
  - 写 comment/reaction
  - 写 outbox_event（pending）

消费方式：
- Worker 定时拉取 pending（按 created_at）
- 更新对应 stats（content_stats/activity_stats/comment_stats）
- 更新 outbox 状态为 done
- 失败则 retry_count+1，超过阈值进入 dead

---

## 5. 统计更新的幂等与并发策略（核心）
### 5.1 幂等键
- 每个 outbox_event.id 只能消费一次（status 机保证）

### 5.2 并发更新
- 更新 stats 用“原子加减”：
  - like_count = like_count + delta
- 避免读-改-写（会丢增量）

### 5.3 重算兜底
- 允许夜间或手动执行重算：
  - content_stats.like_count = count(reaction where type=LIKE and target=content)
  - comment_count = count(comment visible)
  - fav_count 类似
用于修复历史一致性

---

## 6. hot_score（热度）的 v0.1 计算策略
v0.1 不追求完美，追求“可解释 + 不乱跳”。

建议：
- Content/Activity：
  hot_score = like_count*3 + fav_count*4 + comment_count*5
- Comment：
  hot_score = like_count*2 + reply_count*3 - down_count*4

说明：
- 后续可以加入时间衰减（后置）
- v0.1 先让“最热排序能用、稳定”即可

---

## 7. 与“踩踩折叠”规则的关系
- down_count/like_count 更新走 comment_stats（同模块同步）
- 折叠判定在 Interaction 服务内执行：
  - down_count >= 3 且 down/(like+1) >= threshold → comment.status=HIDDEN
- 折叠/恢复也写 outbox，用于：
  - 更新 content/activity 的 comment_count（可见评论数）
## 8. StatsUpdater（统计更新器）职责边界

### 输入
- 消费 yl_outbox_event（仅关心互动类事件）

### 输出
- 对应 *_stats 表的原子加减更新
- 重新计算 hot_score（简单线性公式）

### 不负责
- 不修改主表（content/activity/comment/reaction/signup）
- 不负责权限校验（由 API 层负责）
