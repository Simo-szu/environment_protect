# Interface Contracts V0.1（接口契约）

> 目标：让后端可以直接按此实现；前端可以直接按此对接；测试可以直接按此验收。
> 约定：
> - /q/* = Query（只读聚合）
> - /c/* = Command（写入）
> - 错误码见：02-Domain/Error-Codes-V0.1
> - 幂等：除非特别说明，写入接口都应具备幂等语义或可安全重试

---

## 0. 通用响应约定（v0.1）
Response：
- code: string（OK 或错误码）
- message: string（可读提示）
- data: object | null
- traceId: string（用于排查）

分页：
- page: number
- size: number
- total: number
- items: array

---

# A. Auth（注册/登录/会话）

## A1. 发送邮箱验证码
- POST /c/auth/otp/email/send
Auth：否
Request：
- email (string, required)
- purpose (REGISTER|LOGIN|RESET_PASSWORD, required)
Response：
- OK
Errors：
- INVALID_PARAM / RATE_LIMITED / OTP_SEND_FAILED

Notes：
- 对外统一提示“已发送”，不暴露账号是否存在

---

## A2. 发送短信验证码
- POST /c/auth/otp/phone/send
Auth：否
Request：
- phone (string, required, E.164)
- purpose (REGISTER|LOGIN|RESET_PASSWORD, required)
Response：OK
Errors：同上

---

## A3. 邮箱注册（验证码 + 密码）
- POST /c/auth/register/email
Auth：否
Request：
- email (string, required)
- otp (string, required)
- password (string, required)
Response data：
- accessToken (string)
- refreshToken (string)
- user (id, nickname?, avatarUrl?)
Errors：
- OTP_EXPIRED / OTP_INVALID / OTP_TOO_MANY_ATTEMPTS
- PASSWORD_WEAK
- IDENTITY_EXISTS
- INTERNAL_ERROR

---

## A4. 手机注册（验证码 + 密码）
- POST /c/auth/register/phone
Auth：否
Request：
- phone, otp, password
Response：同 A3
Errors：同 A3

---

## A5. 邮箱验证码登录
- POST /c/auth/login/email-otp
Auth：否
Request：
- email, otp
Response：同 A3
Errors：
- OTP_EXPIRED / OTP_INVALID / OTP_TOO_MANY_ATTEMPTS
- NOT_REGISTERED

---

## A6. 手机验证码登录
- POST /c/auth/login/phone-otp
Auth：否
Request：phone, otp
Response：同 A3
Errors：同 A5

---

## A7. Google OAuth 登录
- POST /c/auth/oauth/google
Auth：否
Request：
- idToken (string, required)  # 或 code，看你前端实现
Response：同 A3
Errors：
- GOOGLE_TOKEN_INVALID

---

## A8. Refresh Token
- POST /c/auth/token/refresh
Auth：否（用 refreshToken）
Request：refreshToken
Response：new accessToken/refreshToken
Errors：UNAUTHORIZED

---

## A9. Logout
- POST /c/auth/logout
Auth：是
Request：none
Response：OK
Notes：
- 使 refresh token 失效（或标记 revoked）

---

# B. Content（科普）

## B1. 内容列表（聚合）
- GET /q/contents?type=&page=&size=
Auth：可选
Response item：
- id, type, title, summary, coverUrl, publishedAt
- stats: likeCount, favCount, commentCount
- userState (optional if logged in): liked, faved
Errors：
- INVALID_PARAM

---

## B2. 内容详情（聚合）
- GET /q/contents/{id}
Auth：可选
Response：
- content: id,type,title,body,coverUrl,sourceUrl,publishedAt
- stats
- userState
Errors：
- NOT_FOUND / CONTENT_HIDDEN

---

## B3. 内容评论区（聚合）
- GET /q/contents/{id}/comments?sort=latest|hot&page=&size=
Auth：可选
Response：
- roots: rootComments[]
- repliesByRoot: map(rootId -> replies[])
Errors：
- NOT_FOUND / CONTENT_HIDDEN

---

# C. Activity（活动）

## C1. 活动列表（聚合）
- GET /q/activities?category=&page=&size=&sort=
Auth：可选
Response item：
- id,title,category,startTime,location,descriptionPreview,posterCoverUrl
- stats
- userState: liked,faved
Errors：
- INVALID_PARAM

---

## C2. 活动详情（聚合）
- GET /q/activities/{id}
Auth：可选
Response：
- activity: 主体字段（含 sourceType, sourceUrl, hostUserId）
- stats
- userState
- signupPolicy:
  - canSignup (bool)
  - sourceUrl?（抓取活动时给出）
Errors：
- NOT_FOUND / ACTIVITY_HIDDEN

---

## C3. 活动报名（登录/游客）
- POST /c/activities/{id}/signup
Auth：可选（允许游客）
Request：
- email (string, required for guest; optional for logged-in if profile has email)
- realName (string, required)
- phone (string, required)
- joinTime (datetime, required)
Response：OK
Errors：
- ACTIVITY_NOT_SIGNABLE
- SIGNUP_DUPLICATE
- SIGNUP_REQUIRED_MISSING
- INVALID_PARAM

Side Effects：
- 写入 yl_activity_signup（去重规则见 Activity-Data）
- 触发邮件提醒（异步 MailJob，推荐通过 OutboxEvent: SIGNUP_CREATED）

---

## C4. 活动评论区（聚合）
- GET /q/activities/{id}/comments?sort=latest|hot&page=&size=
Auth：可选
Errors：NOT_FOUND / ACTIVITY_HIDDEN

---

# D. Interaction（评论/点赞/收藏/踩踩）

## D1. 发表评论/回复
- POST /c/comments
Auth：是（必须登录）
Request：
- targetType (CONTENT|ACTIVITY)
- targetId
- parentId? (uuid, optional)
- body (string, required)
Response：
- comment: {id, rootId, parentId, depth, body, createdAt, user{...}}
Errors：
- UNAUTHORIZED
- COMMENT_BODY_EMPTY
- COMMENT_DEPTH_EXCEEDED
- NOT_FOUND（目标不存在）

Side Effects：
- 写 yl_comment + yl_comment_stats（初始化）
- 写 OutboxEvent: COMMENT_CREATED（用于更新 content/activity commentCount）

---

## D2. 点赞/收藏/踩踩（创建）
- POST /c/reactions
Auth：是
Request：
- targetType (CONTENT|ACTIVITY|COMMENT)
- targetId
- reactionType (LIKE|FAV|DOWNVOTE)
Response：OK
Errors：
- UNAUTHORIZED
- NOT_FOUND

Idempotency：
- 同一 user + target + reactionType 重复创建 → 返回 OK（或 CONFLICT 但建议 OK）

Side Effects：
- 写 yl_reaction
- 若 target=COMMENT：同步更新 comment_stats
- 写 OutboxEvent: REACTION_CREATED（用于更新 content/activity stats）

---

## D3. 取消点赞/收藏/踩踩
- DELETE /c/reactions
Auth：是
Request：
- targetType,targetId,reactionType
Response：OK
Errors：
- UNAUTHORIZED

Idempotency：
- 不存在也返回 OK

Side Effects：
- 删 yl_reaction
- 若 target=COMMENT：同步更新 comment_stats
- 写 OutboxEvent: REACTION_DELETED

---

# E. Points（积分系统）

## E1. 获取我的积分余额
- GET /q/me/points
Auth：是
Response：
- balance
Errors：UNAUTHORIZED

---

## E2. 今日签到
- POST /c/points/signin
Auth：是
Request：none
Response：
- gainedPoints（今日固定分）
- streakBonusPoints（若达成 7/14/21）
- newBalance
Errors：
- SIGNIN_ALREADY_DONE
- UNAUTHORIZED

Side Effects：
- 写 signin_record
- 写 points_ledger（固定分 + 里程碑奖励分）

---

## E3. 获取每日任务列表
- GET /q/points/tasks?date=
Auth：是
Response item：
- taskId, code, name, points
- progress, target, status
Errors：UNAUTHORIZED

---

## E4. 领取任务积分
- POST /c/points/tasks/{taskId}/claim
Auth：是
Request：
- date（可选，默认今天）
Response：
- gainedPoints
- newBalance
Errors：
- TASK_NOT_CLAIMABLE
- TASK_ALREADY_CLAIMED
- UNAUTHORIZED

Side Effects：
- 写 points_ledger
- 更新 task_progress.status=DONE

---

## E5. 获取每日问答
- GET /q/points/quiz/today
Auth：是
Response：
- quizDate
- question（结构化）
- points
- hasDone（bool）
Errors：UNAUTHORIZED

---

## E6. 提交每日问答
- POST /c/points/quiz/submit
Auth：是
Request：
- quizDate
- answer（json）
Response：
- isCorrect
- gainedPoints
- knowledgeCard?（答错给科普卡片，v0.1 可后置）
Errors：
- QUIZ_ALREADY_DONE
- QUIZ_INVALID_ANSWER
- UNAUTHORIZED

Side Effects：
- 写 quiz_record
- 若正确写 points_ledger

---

# F. Recommendation（推荐）

## F1. 本周个性推荐
- GET /q/recommendations/weekly
Auth：是（个性化）
Response：
- weekStart
- items[]（可能包含 activity+content）
Errors：UNAUTHORIZED

---

## F2. 每周最新推荐
- GET /q/recommendations/latest
Auth：否
Response：
- activities[0..4]
- contents[0..4]
Errors：none
Notes：
- 不落表，实时按时间查询
