# API Contracts

YouthLoop 项目的 API 契约定义，包含错误码、OpenAPI 规范等跨服务共享的契约文档。

## 目录结构

```
api-contracts/
├── ERROR_CODES.md          # 错误码规范
├── openapi/                # OpenAPI 规范文件（待补充）
│   ├── social-api.yaml     # Social API 规范
│   └── game-api.yaml       # Game API 规范
└── schemas/                # 共享的数据模型定义（待补充）
```

## 文档说明

### ERROR_CODES.md

定义了整个系统的错误码规范，包括：
- 错误码格式定义
- 模块代码分配
- 错误类型分类
- 常用错误码列表
- 响应格式规范

所有服务必须遵循此错误码规范。

### openapi/ (待补充)

存放各服务的 OpenAPI 3.0 规范文件，用于：
- API 文档生成
- 前端 SDK 生成
- API 测试
- 契约测试

### schemas/ (待补充)

存放跨服务共享的数据模型定义，如：
- 通用 DTO 定义
- 枚举类型定义
- 验证规则定义

## 使用方式

### 后端

后端服务应参考 ERROR_CODES.md 定义错误码常量：

```java
public class ErrorCode {
    public static final int SUCCESS = 0;
    public static final int INVALID_PARAM = 00101;
    public static final int USER_NOT_FOUND = 10022;
    // ...
}
```

### 前端

前端应根据错误码进行统一的错误处理：

```typescript
const ERROR_MESSAGES = {
  10023: '密码错误，请重试',
  10024: '验证码错误',
  // ...
};

function handleError(code: number) {
  const message = ERROR_MESSAGES[code] || '操作失败，请稍后重试';
  showToast(message);
}
```

## 维护规范

1. 新增错误码必须先在 ERROR_CODES.md 中定义
2. 错误码一旦定义不得修改，只能废弃后新增
3. 所有 API 变更必须同步更新 OpenAPI 规范
4. 重大变更需要版本号升级

## 相关文档

- [Project-Structure.md](../../Project-Structure.md) - 项目整体架构
- [Schema-V0.1.dsl.md.md](../../Schema-V0.1.dsl.md.md) - 数据库模型定义
