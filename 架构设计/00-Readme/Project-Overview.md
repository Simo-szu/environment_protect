# YouthLoop 系统架构总览

## 项目定位
YouthLoop（青循）是一个以环保为核心的内容 + 活动 + 游戏化积分平台。

目标用户：
- 普通用户（学习、参与、积分）
- 活动主办方（发布活动、招募）
- 运营人员（内容管理、冷启动）

## 技术栈（初步）
- 前端：Next.js + TypeScript
- 后端：Java + Spring Boot
- 数据库：PostgreSQL
- 缓存：Redis
- 对象存储：S3（图片、头像、海报）

## 架构原则
- 模块化单体（Modular Monolith）
- 事件驱动（行为 → 积分 / 推荐）
- 先稳后拆，不提前微服务

## 文档导航
- [[System-Architecture]]
- [[Domain-Overview]]
