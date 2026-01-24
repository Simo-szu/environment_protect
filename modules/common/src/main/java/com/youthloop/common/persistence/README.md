# 数据访问规范

## 分层结构

```
<module>/
├── api/              # 对外契约 (DTO + Facade)
├── application/      # 用例层 (Service + DTO)
├── domain/           # 领域层 (Model + Repository接口)
├── infrastructure/   # 适配层 (MQ/Cache/Storage/Client)
└── persistence/      # 持久化层 (Entity/Mapper/Repository实现)
    ├── entity/       # 数据库实体（对应表结构）
    ├── mapper/       # MyBatis Mapper 接口
    └── repository/   # Repository 实现（Domain -> Persistence 转换）
```

## 命名规范

### Entity 命名
- 类名：`{TableName}Entity`（如 `UserEntity`、`UserProfileEntity`）
- 包名：`com.youthloop.{module}.persistence.entity`
- 继承：`BaseEntity`（包含 createdAt、updatedAt）

### Mapper 命名
- 接口名：`{TableName}Mapper`（如 `UserMapper`、`UserProfileMapper`）
- 包名：`com.youthloop.{module}.persistence.mapper`
- 注解：`@Mapper`
- XML 文件：`src/main/resources/mapper/{TableName}Mapper.xml`

### Repository 命名
- 接口名：`{Domain}Repository`（如 `UserProfileRepository`）
- 实现类：`{Domain}RepositoryImpl`
- 接口包名：`com.youthloop.{module}.domain.repository`
- 实现包名：`com.youthloop.{module}.persistence.repository`

## MyBatis 规范

### XML 映射文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.youthloop.user.persistence.mapper.UserMapper">

  <!-- Result Map -->
  <resultMap id="BaseResultMap" type="com.youthloop.user.persistence.entity.UserEntity">
    <id column="id" property="id" jdbcType="OTHER" typeHandler="org.apache.ibatis.type.UUIDTypeHandler"/>
    <result column="role" property="role" jdbcType="INTEGER"/>
  </resultMap>

  <!-- Base Column List -->
  <sql id="Base_Column_List">
    id, role, status, created_at, updated_at
  </sql>

  <!-- 查询 -->
  <select id="selectById" resultMap="BaseResultMap">
    SELECT <include refid="Base_Column_List"/>
    FROM shared.user
    WHERE id = #{id}::uuid
  </select>
</mapper>
```

### UUID 处理
- PostgreSQL UUID 类型需要使用 `::uuid` 转换
- MyBatis 使用 `UUIDTypeHandler`
- 示例：`WHERE id = #{id}::uuid`

### Schema 前缀
- 必须明确指定 schema：`shared.user`、`social.content`
- 不要依赖 `currentSchema` 配置

## 事务规范

### 事务边界
- **Application 层**负责事务管理（Service 类）
- **Domain 层**不涉及事务
- **Persistence 层**不涉及事务

### 事务注解
```java
// 只读事务
@Transactional(readOnly = true)
public UserProfileDTO getUserProfile(UUID userId) {
    // ...
}

// 写事务
@Transactional
public void updateUserProfile(UUID userId, UserProfileDTO dto) {
    // ...
}
```

### 事务传播
- 默认：`REQUIRED`（如果当前有事务则加入，否则新建）
- 嵌套调用：同一事务内
- 异常回滚：RuntimeException 自动回滚

## 分页规范

### 请求参数
- 继承 `PageRequest`（page、size）
- page 从 1 开始
- size 默认 20，最大 100

### 响应格式
- 使用 `PageResponse<T>`
- 包含：items、total、page、size、totalPages、hasNext、hasPrev

### SQL 实现
```xml
<select id="selectList" resultMap="BaseResultMap">
  SELECT <include refid="Base_Column_List"/>
  FROM shared.user
  ORDER BY created_at DESC
  LIMIT #{limit} OFFSET #{offset}
</select>

<select id="countTotal" resultType="java.lang.Long">
  SELECT COUNT(*) FROM shared.user
</select>
```

## 时间字段约定

### 数据库类型
- `timestamptz`：带时区的时间戳（推荐）
- `date`：日期（无时间部分）

### Java 类型
- `LocalDateTime`：对应 `timestamptz`
- `LocalDate`：对应 `date`

### 自动填充
- `created_at`：插入时设置 `LocalDateTime.now()`
- `updated_at`：更新时设置 `LocalDateTime.now()`
- 或使用数据库默认值：`DEFAULT now()`

## 乐观锁（可选）

如需乐观锁，添加 version 字段：

```java
@Data
public class UserEntity extends BaseEntity {
    private UUID id;
    private Integer version; // 乐观锁版本号
}
```

```xml
<update id="update">
  UPDATE shared.user
  SET role = #{role},
      version = version + 1,
      updated_at = NOW()
  WHERE id = #{id}::uuid
    AND version = #{version}
</update>
```

## 索引策略

### 主键
- 使用 UUID：`id uuid PRIMARY KEY DEFAULT gen_random_uuid()`

### 外键
- 添加索引：`CREATE INDEX idx_xxx_user_id ON xxx(user_id)`

### 唯一约束
- 单列：`UNIQUE (email)`
- 多列：`UNIQUE (user_id, signin_date)`

### 查询优化
- 常用查询字段添加索引
- 分页查询的排序字段添加索引
- 全文搜索使用 GIN 索引

## 示例：完整的 CRUD

参考 `modules/user` 模块：
- Entity: `UserProfileEntity`
- Mapper: `UserProfileMapper` + `UserProfileMapper.xml`
- Domain Model: `UserProfile`
- Repository: `UserProfileRepository` + `UserProfileRepositoryImpl`
- Service: `UserProfileService`
- Controller: `UserProfileController`
