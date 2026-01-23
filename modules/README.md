# Modules 目录

Social Service 业务模块（模块化单体架构）

## 模块列表

- **common/**: 通用工具和基础设施
- **auth/**: 认证与授权
- **user/**: 用户档案管理
- **content/**: 科普内容 (新闻/动态/政策/百科)
- **activity/**: 活动发布与报名
- **interaction/**: 评论/点赞/收藏/踩
- **notification/**: 通知系统
- **points/**: 积分系统 (签到/任务/问答/勋章)
- **search/**: 站内搜索
- **recommendation/**: 推荐系统
- **event/**: 事件处理 (Outbox)
- **ingestion/**: 数据抓取与清洗
- **query/**: 聚合查询层 (BFF)
- **host/**: 主办方管理
- **ops/**: 运营配置 (轮播/运营位)

## 模块内部结构

每个模块遵循统一的分层结构:

```
<module>/
├── api/              # 对外契约 (DTO + Facade)
├── application/      # 用例层 (Command/Query/Service)
├── domain/           # 领域层 (Model/Event/Service)
├── infrastructure/   # 适配层 (MQ/Cache/Storage/Client)
└── persistence/      # 持久化层 (Entity/Mapper/XML)
```
