# API Endpoints Index · v0.1

> 本文档列出 YOUTHLOOP 后端 **全部对外 API 端点**。
> 仅描述：路径 / 方法 / 是否登录 / 模块归属 / 用途  
> 具体 Request / Response / ErrorCode 见 Interface-Contracts。

---

## 约定
- /q/** = Query（只读）
- /c/** = Command（写入）
- Auth = 是否需要登录
- G = Guest（允许游客）

---

## A. Auth / Session

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /c/auth/otp/email/send | No | 发送邮箱验证码 |
| POST | /c/auth/otp/phone/send | No | 发送短信验证码 |
| POST | /c/auth/register/email | No | 邮箱注册 |
| POST | /c/auth/register/phone | No | 手机注册 |
| POST | /c/auth/login/email-otp | No | 邮箱验证码登录 |
| POST | /c/auth/login/phone-otp | No | 手机验证码登录 |
| POST | /c/auth/oauth/google | No | Google 登录 |
| POST | /c/auth/token/refresh | No | 刷新 token |
| POST | /c/auth/logout | Yes | 登出 |

---

## B. User / Me

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /q/me/profile | Yes | 获取我的资料 |
| POST | /c/me/profile | Yes | 修改个人资料 |
| GET | /q/me/points | Yes | 获取积分余额 |
| GET | /q/me/reactions | Yes | 我的点赞/收藏 |

---

## C. Content（科普）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /q/contents | Optional | 内容列表 |
| GET | /q/contents/{id} | Optional | 内容详情 |
| GET | /q/contents/{id}/comments | Optional | 内容评论区 |

---

## D. Activity（活动）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /q/activities | Optional | 活动列表 |
| GET | /q/activities/{id} | Optional | 活动详情 |
| GET | /q/activities/{id}/comments | Optional | 活动评论区 |
| POST | /c/activities/{id}/signup | G | 活动报名（登录/游客） |

---

## E. Interaction（互动）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /c/comments | Yes | 发表评论/回复 |
| POST | /c/reactions | Yes | 点赞/收藏/踩踩 |
| DELETE | /c/reactions | Yes | 取消点赞/收藏 |

---

## F. Points（积分系统）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| POST | /c/points/signin | Yes | 每日签到 |
| GET | /q/points/tasks | Yes | 获取每日任务 |
| POST | /c/points/tasks/{taskId}/claim | Yes | 领取任务积分 |
| GET | /q/points/quiz/today | Yes | 今日问答 |
| POST | /c/points/quiz/submit | Yes | 提交问答 |

---

## G. Recommendation（推荐）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /q/recommendations/weekly | Yes | 本周个性推荐 |
| GET | /q/recommendations/latest | No | 最新推荐 |

---

## H. System / Health（可选）

| Method | Path | Auth | 用途 |
|------|------|------|------|
| GET | /health | No | 健康检查 |
