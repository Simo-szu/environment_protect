# YouthLoop API 请求响应结构规范（讨论稿）

> 状态：讨论稿  
> 目标：统一查询类、写操作类、文件类接口的请求与响应结构，降低维护复杂度。

## 1. 统一响应外层

除文件流下载接口外，所有 JSON 接口统一使用以下外层结构：

```json
{
  "success": true,
  "message": "成功不填，失败时必填",
  "data": {},
  "errors": [],
  "traceId": "a1b2c3d4e5f6g7h8"
}
```

字段约定：
- `success`：`true/false`。
- `message`：成功时不填，失败时必填。
- `data`：业务数据载体；成功时必填（可为空对象），失败时可为空。
- `errors`：字段级错误数组，仅在参数校验/导入失败等场景返回。
- `traceId`：必填，用于日志排查和链路追踪。

## 2. 查询类接口（2种）

### 2.1 分页列表

- HTTP 方法：`GET`
- HTTP 状态码：`200`
- 响应 `data` 固定结构：

```json
{
  "page": 1,
  "size": 10,
  "total": 156,
  "items": []
}
```

示例：

```http
GET /api/users?page=1&size=10&keyword=张三
```

```json
{
  "success": true,
  "data": {
    "page": 1,
    "size": 10,
    "total": 156,
    "items": [
      {
        "id": "u_1001",
        "name": "张三",
        "email": "zhangsan@example.com",
        "createTime": "2024-01-01T10:00:00Z"
      }
    ]
  },
  "traceId": "t_query_001"
}
```

### 2.2 详情查询

- HTTP 方法：`GET`
- HTTP 状态码：`200`
- 响应 `data` 为单对象：

```http
GET /api/users/u_1001
```

```json
{
  "success": true,
  "data": {
    "id": "u_1001",
    "name": "张三",
    "email": "zhangsan@example.com",
    "status": 1,
    "updateTime": "2024-02-08T15:30:00Z"
  },
  "traceId": "t_query_002"
}
```

## 3. 写操作类接口（3种）

> 覆盖：新增、更新、删除、状态切换、审批。

### 3.1 新增

- HTTP 方法：`POST`
- HTTP 状态码：`201`
- 返回创建后的对象（至少含 `id`）：

```json
{
  "success": true,
  "data": {
    "id": "u_2001",
    "name": "王五",
    "createTime": "2024-02-08T16:00:00Z"
  },
  "traceId": "t_cmd_001"
}
```

### 3.2 更新

- HTTP 方法：`PUT` / `PATCH`
- HTTP 状态码：`200`
- 返回更新后的对象或关键字段快照：

```json
{
  "success": true,
  "data": {
    "id": "u_1001",
    "email": "zhangsan_new@example.com",
    "updateTime": "2024-02-08T16:10:00Z"
  },
  "traceId": "t_cmd_002"
}
```

### 3.3 删除

- HTTP 方法：`DELETE`
- HTTP 状态码：`200`
- 返回删除结果：

```json
{
  "success": true,
  "data": {
    "id": "u_1001",
    "deletedTime": "2024-02-08T16:20:00Z"
  },
  "traceId": "t_cmd_003"
}
```

### 3.4 批量部分失败（明确采用 HTTP 207）

- 场景：批量删除、批量导入等存在“部分成功部分失败”
- HTTP 状态码：`207 Multi-Status`
- 响应示例：

```json
{
  "success": false,
  "message": "批量删除部分失败",
  "data": {
    "total": 4,
    "successCount": 2,
    "failCount": 2,
    "successIds": ["u_1001", "u_1004"],
    "failedItems": [
      { "id": "u_1002", "reason": "用户有关联订单" },
      { "id": "u_1003", "reason": "用户不存在" }
    ],
    "processedTime": "2024-02-08T16:30:00Z"
  },
  "traceId": "t_cmd_004"
}
```

## 4. 文件类接口（3种）

### 4.1 文件上传

- HTTP 方法：`POST`
- Content-Type：`multipart/form-data`
- HTTP 状态码：`201`
- 返回 JSON 外层结构（含 `traceId`）

### 4.2 文件导出

- HTTP 方法：`GET`
- HTTP 状态码：`200`
- 返回文件流（二进制），不使用 JSON 外层。
- 必须在响应头返回追踪信息：`X-Trace-Id`。

### 4.3 文件导入

- HTTP 方法：`POST`
- Content-Type：`multipart/form-data`
- 全量成功：`200`
- 部分失败：`207`
- 部分失败时在 `data.errors` 或 `data.failedItems` 中返回明细。

## 5. 错误响应（5种）

### 5.1 参数校验错误（400）

```json
{
  "success": false,
  "message": "参数校验失败",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ],
  "traceId": "t_err_001"
}
```

### 5.2 资源不存在（404）

```json
{
  "success": false,
  "message": "用户不存在",
  "traceId": "t_err_002"
}
```

### 5.3 业务逻辑错误（422）

```json
{
  "success": false,
  "message": "该用户有5个关联订单，无法删除",
  "traceId": "t_err_003"
}
```

### 5.4 认证/权限错误（401/403）

```json
{
  "success": false,
  "message": "请先登录",
  "traceId": "t_err_004"
}
```

```json
{
  "success": false,
  "message": "无权限执行此操作",
  "traceId": "t_err_005"
}
```

### 5.5 服务器错误（500）

```json
{
  "success": false,
  "message": "服务器内部错误",
  "traceId": "t_err_006"
}
```

## 6. 请求侧约定

- 查询接口：
  - 简单查询使用 `GET + query params`（如 `page/size/keyword`）。
  - 复杂搜索允许 `POST /search`，请求体承载筛选条件。
- 写接口：
  - 新增：`POST`
  - 更新：`PUT/PATCH`
  - 删除：`DELETE`
  - 状态切换/审批：`PUT/PATCH/POST`（保持同一业务域一致）

## 7. 命名与格式

- JSON 字段：`lowerCamelCase`
- 时间：ISO-8601（UTC）
- ID：字符串（UUID 或业务 ID）

## 8. 执行要求（建议）

1. 所有 JSON 响应必须包含 `traceId`。
2. 所有列表接口必须分页返回，不再提供裸数组列表。
3. 批量部分失败统一使用 `HTTP 207`。
4. 对外错误语义以 HTTP 状态码 + `message/errors` 为主，避免过细错误码对接成本。

## 9. 代码层约束（Spring Boot）

为保证规范可执行，项目提供了注解与校验机制：

- 注解：`@ApiResponseContract`
- 枚举：`ApiEndpointKind.PAGE_LIST | DETAIL | COMMAND`
- 统一响应类型：`ApiSpecResponse<T>`
- 分页数据类型：`ApiPageData<T>`
- 运行时校验：`ApiResponseContractAdvice`（仅校验标注了注解的方法）
- 签名校验测试：`ApiResponseContractSignatureTest`

约束规则：

1. `PAGE_LIST` 必须返回 `ApiSpecResponse<ApiPageData<T>>`
2. `DETAIL` 必须返回 `ApiSpecResponse<T>`，且 `T` 不能是 `Void`
3. `COMMAND` 必须返回 `ApiSpecResponse<T>`，且 `T` 不能是 `Void`
4. `success=true` 时必须有 `data`
5. `traceId` 不能为空（Advice 会在缺失时补齐）

控制器示例：

```java
@ApiResponseContract(ApiEndpointKind.PAGE_LIST)
@GetMapping("/users")
public ApiSpecResponse<ApiPageData<UserListItemDTO>> listUsers(...) {
    return ApiSpecResponse.ok(pageData);
}

@ApiResponseContract(ApiEndpointKind.DETAIL)
@GetMapping("/users/{id}")
public ApiSpecResponse<UserDetailDTO> getUser(@PathVariable String id) {
    return ApiSpecResponse.ok(detail);
}

@ApiResponseContract(ApiEndpointKind.COMMAND)
@DeleteMapping("/users/{id}")
public ApiSpecResponse<DeleteResultDTO> deleteUser(@PathVariable String id) {
    return ApiSpecResponse.ok(result);
}
```
