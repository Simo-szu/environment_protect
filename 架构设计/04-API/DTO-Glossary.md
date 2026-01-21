# DTO Glossary（字段字典）· v0.1

> 目标：统一接口字段命名、时间格式、通用结构（stats/userState/commentTree）。
> 原则：JSON 字段使用 lowerCamelCase；时间使用 ISO-8601；可选字段明确 nullable。

---

## 1) 通用字段命名
- id: string（uuid）
- createdAt: string（ISO-8601）
- updatedAt: string（ISO-8601）
- publishedAt: string|null（ISO-8601）
- startTime: string|null（ISO-8601）
- endTime: string|null（ISO-8601）

字符串：
- title: string
- summary: string|null
- body: string
- coverUrl: string|null
- avatarUrl: string|null
- sourceUrl: string|null
- location: string|null

---

## 2) 通用响应结构
### 2.1 BaseResponse<T>
- code: string
- message: string
- data: T|null
- traceId: string

### 2.2 PageResponse<T>
- page: number
- size: number
- total: number
- items: T[]

---

## 3) User 相关 DTO
### 3.1 UserBrief
- id: string
- nickname: string|null
- avatarUrl: string|null

### 3.2 MyProfile
- user: UserBrief
- gender: number|null
- birthday: string|null（YYYY-MM-DD）
- hometown: string|null

---

## 4) Stats 与 UserState（全站通用）
### 4.1 Stats（用于 content/activity）
- likeCount: number
- favCount: number
- commentCount: number
- hotScore: number

### 4.2 CommentStats
- likeCount: number
- downCount: number
- replyCount: number
- hotScore: number

### 4.3 UserState（针对某个目标）
- liked: boolean
- faved: boolean
- downvoted: boolean（仅当 target=COMMENT 时可返回；否则可省略）

约定：
- 未登录时：UserState 不返回或全部为 false（API-Surface 已规定）

---

## 5) Content DTO
### 5.1 ContentListItem
- id: string
- type: string|number（建议对外用 string：NEWS/DYNAMIC/POLICY/WIKI）
- title: string
- summary: string|null
- coverUrl: string|null
- publishedAt: string|null
- stats: Stats
- userState?: UserState

### 5.2 ContentDetail
- id: string
- type: string|number
- title: string
- body: string
- coverUrl: string|null
- sourceUrl: string|null
- publishedAt: string|null
- stats: Stats
- userState?: UserState

---

## 6) Activity DTO
### 6.1 ActivityListItem
- id: string
- title: string
- category: string|number（建议对外 string：MARKET/TREE/...）
- startTime: string|null
- location: string|null
- descriptionPreview: string|null
- posterCoverUrl: string|null
- stats: Stats
- userState?: UserState

### 6.2 SignupPolicy
- canSignup: boolean
- sourceUrl?: string|null  # 当 canSignup=false 时返回原文链接
- reason?: string|null     # 可选，如 "CRAWLED_ACTIVITY"

### 6.3 ActivityDetail
- id: string
- sourceType: string|number（CRAWLED/HOSTED）
- title: string
- category: string|number
- topic: string|null
- startTime: string|null
- endTime: string|null
- location: string|null
- description: string|null
- posterUrls: string[]|null
- sourceUrl: string|null
- hostUserId: string|null
- stats: Stats
- userState?: UserState
- signupPolicy: SignupPolicy

---

## 7) Comment Tree DTO（关键）
### 7.1 CommentItem（统一结构）
- id: string
- targetType: string|number（CONTENT/ACTIVITY）
- targetId: string
- rootId: string
- parentId: string|null
- depth: number（0/1/2）
- body: string
- status: string|number（VISIBLE/HIDDEN）
- createdAt: string
- user: UserBrief
- stats: CommentStats

### 7.2 CommentTreeResponse（Query 聚合返回）
- sort: "latest" | "hot"
- page: number
- size: number
- total: number
- roots: CommentItem[]
- repliesByRoot: { [rootId: string]: CommentItem[] }

约定：
- repliesByRoot 只包含本页 roots 对应的 replies（避免一次拉爆）
- replies 内按 createdAt 升序
- “最热”排序仅对 roots 生效（v0.1），replies 仍按时间升序

---

## 8) Reaction DTO（写入）
### 8.1 CreateReactionRequest
- targetType: string|number（CONTENT/ACTIVITY/COMMENT）
- targetId: string
- reactionType: string|number（LIKE/FAV/DOWNVOTE）

### 8.2 DeleteReactionRequest
同上

---

## 9) Signup DTO（报名）
### 9.1 SignupRequest
- email?: string  # 游客必填；登录用户可选
- realName: string
- phone: string
- joinTime: string（ISO-8601）

---

## 10) Points DTO
### 10.1 PointsBalance
- balance: number

### 10.2 SigninResponse
- gainedPoints: number
- streakBonusPoints: number
- newBalance: number

### 10.3 TaskItem
- taskId: string
- code: string
- name: string
- points: number
- progress: number
- target: number
- status: string|number（DOING/CLAIMABLE/DONE）

### 10.4 QuizQuestion
- quizDate: string（YYYY-MM-DD）
- question: object（结构化）
- points: number
- hasDone: boolean

### 10.5 QuizSubmitResponse
- isCorrect: boolean
- gainedPoints: number
- knowledgeCard?: object|null

---

## 11) Recommendation DTO
### 11.1 WeeklyRecommendationResponse
- weekStart: string（YYYY-MM-DD）
- items: { type: "activity"|"content", id: string, score?: number, reason?: string }[]

### 11.2 LatestRecommendationResponse
- activities: ActivityListItem[]
- contents: ContentListItem[]
