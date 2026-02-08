# API Contracts

YouthLoop 项目的 API 契约文档统一入口。

## 当前生效文档

- `API_REQUEST_RESPONSE_SPEC.md`：API 请求响应结构规范（当前主规范）

## 目录结构

```text
api-contracts/
├── API_REQUEST_RESPONSE_SPEC.md   # 请求响应结构规范（主规范）
├── openapi/                       # OpenAPI 规范文件目录
└── schemas/                       # 共享模型定义目录
```

## 维护规则

1. 接口响应结构、HTTP 状态码、错误返回格式以 `API_REQUEST_RESPONSE_SPEC.md` 为准。
2. `openapi/` 中的接口示例与状态码必须与主规范保持一致。
3. 出现冲突时，先更新主规范，再更新其他文档或代码实现。
