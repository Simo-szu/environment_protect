# Error Codes V0.1（统一错误码与前端提示）

> 目标：后端返回稳定错误码；前端按码展示 PRD 文案；避免“字符串对齐”导致维护灾难。
> 约定：响应结构后置（你可以统一 {code, message, data, traceId}）。

---

## 1) 通用错误（Common）
- OK：成功（可不用）
- INVALID_PARAM：参数不合法/缺失
- UNAUTHORIZED：未登录
- FORBIDDEN：无权限
- NOT_FOUND：资源不存在
- CONFLICT：资源冲突（重复/并发）
- RATE_LIMITED：请求过于频繁
- INTERNAL_ERROR：服务内部错误

---

## 2) Auth / OTP
### 2.1 发送验证码
- OTP_SEND_TOO_FREQUENT：发送过于频繁（触发限流）
- OTP_SEND_FAILED：发送失败（外部服务异常，前端提示通用）

### 2.2 校验验证码
- OTP_EXPIRED：验证码已过期
  - 前端弹窗：你的验证码已过期，请重新获取验证码。
  - 前端处理：清空账号输入框 + 验证码输入框
- OTP_INVALID：验证码错误
  - 前端弹窗：验证码错误，请重新输入。
  - 前端处理：清空验证码输入框
- OTP_TOO_MANY_ATTEMPTS：错误次数过多（锁定）
  - 前端提示：尝试次数过多，请稍后再试。

### 2.3 注册/登录
- IDENTITY_EXISTS：账号已注册（邮箱/手机号）
- NOT_REGISTERED：账号未注册（验证码登录时）
- PASSWORD_WEAK：密码复杂度不足
  - 前端提示：密码需在8位以上，由数字、字母组成
- PASSWORD_MISMATCH：两次密码不一致
  - 前端弹窗：密码不一致，请重新输入
  - 前端处理：清空两次密码输入框
- GOOGLE_TOKEN_INVALID：Google 登录 token 校验失败

---

## 3) Content / Activity（读）
- CONTENT_HIDDEN：内容不可见/已下架
- ACTIVITY_HIDDEN：活动不可见/已下架

---

## 4) Activity Signup（报名）
- ACTIVITY_NOT_SIGNABLE：该活动来自外部平台，不支持站内报名
- SIGNUP_DUPLICATE：你已报名过该活动
- SIGNUP_REQUIRED_MISSING：请将信息填写完整，谢谢。
  - 对应 PRD toast 文案

---

## 5) Interaction（评论/点赞/收藏/踩踩）
- COMMENT_DEPTH_EXCEEDED：回复层级已达上限
- COMMENT_BODY_EMPTY：评论内容为空
- REACTION_DUPLICATE：重复操作（一般可直接当成功返回）
- COMMENT_HIDDEN：评论已折叠/不可见

---

## 6) Points（积分）
- SIGNIN_ALREADY_DONE：今日已签到
- TASK_NOT_CLAIMABLE：任务未达成，无法领取
- TASK_ALREADY_CLAIMED：任务已领取
- QUIZ_ALREADY_DONE：今日已作答
- QUIZ_INVALID_ANSWER：答案格式不正确

---

## 7) 邮件提醒（Mail）
- EMAIL_INVALID：邮箱格式不正确
- EMAIL_SEND_FAILED：邮件发送失败（前端可提示通用：稍后再试）
