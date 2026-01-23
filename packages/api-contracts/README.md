# API Contracts

YouthLoop API 契约文档

## 文档列表

- [错误码表](./ERROR_CODES.md) - 统一错误码定义与响应格式

## 设计原则

### 1. 统一响应格式

所有 API 响应必须遵循统一格式：

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {},
  "traceId": "a1b2c3d4e5f6g7h8"
}
```

### 2. RESTful 风格

- 使用标准 HTTP 方法：GET、POST、PUT、DELETE
- 使用名词复数形式：`/api/v1/contents`、`/api/v1/activities`
- 使用路径参数表示资源 ID：`/api/v1/contents/{id}`

### 3. 版本控制

- API 路径包含版本号：`/api/v1/...`
- 向后兼容，不破坏现有接口

### 4. 参数校验

- 使用 Bean Validation 注解（`@NotBlank`、`@Min`、`@Max` 等）
- 校验失败返回 `1001` 错误码

### 5. 分页规范

- 统一使用 `page` 和 `pageSize` 参数
- 响应包含 `total`、`totalPages`、`hasNext`、`hasPrev` 等元信息

### 6. 日期时间格式

- 统一使用 ISO 8601 格式：`2024-01-23T10:30:00Z`
- 时区统一使用 UTC 或明确标注

### 7. TraceId 追踪

- 所有请求/响应携带 `X-Trace-Id` 头
- 用于日志追踪和问题排查

## 使用方式

### 后端

1. 所有 Controller 返回 `BaseResponse<T>`
2. 使用 `@Valid` 注解进行参数校验
3. 抛出 `BizException` 处理业务异常
4. 分页接口继承 `PageRequest` 和返回 `PageResponse<T>`

### 前端

1. 根据 `code` 判断请求是否成功（0 为成功）
2. 从 `data` 字段获取响应数据
3. 使用 `traceId` 进行问题反馈
