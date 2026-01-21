# Start Here｜YOUTHLOOP 后端架构文档入口（v0.1）

> 如果你是第一次打开这套文档，**不要从头翻**。  
> 按下面顺序看，只需要 5 页，就可以开始写后端代码。

---

## 🟢 一、我该先看什么？（必读 5 页）

### 1️⃣ 架构与整体边界
📄 01-Architecture/Module-Boundaries  
**作用**：  
- 系统有哪些模块  
- 哪个模块“拥有哪些数据”  
- 谁能写、谁只能读  

👉 写代码时的“红线文件”。

---

### 2️⃣ 数据库设计（全局）
📄 03-Data/Schema-V0.1-Final  
**作用**：  
- 所有表的总览  
- 模块级数据边界  
- Outbox / Stats / Interaction 的关系  

👉 后端建表 & 心里有数用。

---

### 3️⃣ 核心业务流（不看接口也能懂业务）
📄 02-Domain/Core-Flows  
**作用**：  
- 注册 / 登录（邮箱 / 手机 / Google）  
- 游客报名 vs 登录报名  
- 评论 / 回复 / 点赞 / 收藏  
- 关键状态机与失败分支  

👉 写 Service 之前一定要过一遍。

---

### 4️⃣ 接口契约（真正的“我要写什么接口”）
📄 04-API/Interface-Contracts-V0.1  
**作用**：  
- 所有接口清单  
- 每个接口的 Request / Response  
- 错误码 / 幂等 / 副作用  

👉 **这页 + 数据库 = 可以直接写后端代码。**

---

### 5️⃣ DTO 字段字典（防止前后端吵架）
📄 04-API/DTO-Glossary  
**作用**：  
- 字段统一命名  
- stats / userState / commentTree 结构  
- 时间格式、可空规则  

👉 写 Controller / Mapper / JSON 返回必看。

---

## 🟡 二、什么时候需要看“进阶页”？

### 写认证/验证码/报名邮件时
📄 01-Architecture/Email-SMS-Policy  

### 写积分 / 任务 / 问答时
📄 02-Domain/Enums-V0.1  
📄 04-API/Idempotency-Policy  

### 写 stats / 热度 / 异步逻辑时
📄 03-Data/Outbox-Data  
📄 01-Architecture/Deployment-Shape  

---

## 🔵 三、如果你只想“快速写后端”（极简路径）
按这个顺序即可：

1. Schema-V0.1-Final  
2. Interface-Contracts-V0.1  
3. DTO-Glossary  
4. Core-Flows（遇到业务疑问再翻）

---

## 🔴 四、重要约定（请遵守）
- 数据库是事实真相（source of truth）
- Query 不写数据，Command 不拼复杂 Join
- stats / 积分 / 推荐 全部允许“最终一致”
- smallint 枚举 **只增不改**
- 幂等优先用 DB 唯一约束

---

## ✅ 五、当前阶段结论
v0.1 架构设计 **已完成**。  
现在可以：
- 开始写 Spring Boot 后端
- 用 Flyway 写 migration
- 用 MyBatis 实现 Mapper
- 用 Next.js 对接接口

如需 v0.2（搜索 / 推荐 / 性能优化），再新增文档即可。
