# 数据库配置与初始化（YouthLoop）

本文档说明 YouthLoop 后端在本地/测试环境如何初始化 PostgreSQL（含必须的 `pgcrypto` 扩展、3 个 schema、4 个账号）以及如何验证是否初始化成功。

## 1. 关键约定

- 1 个 PostgreSQL 实例，3 个 schema：`shared`、`social`、`game`
- 4 个角色（最小权限）：
  - 迁移用户（DDL）：`social_migrator`、`game_migrator`
  - 运行用户（DML）：`social_app`、`game_app`
- **必须启用 `pgcrypto` 扩展**：迁移脚本使用 `gen_random_uuid()` 作为默认主键生成函数

`pgcrypto` 的启用属于“数据库初始化阶段”职责，建议由 `postgres` 超级用户执行一次，而不是让 Flyway migrator 去创建扩展（很多生产环境会禁用）。

## 2. 使用 Docker（推荐）

仓库内已经提供基础设施编排：

```powershell
cd infra/docker
docker compose up -d
```

说明：
- `infra/docker/compose.yml` 会把 `infra/db/init/` 挂载到 Postgres 容器的 `/docker-entrypoint-initdb.d`。
- **仅在首次创建数据卷时**，Postgres 会自动执行 `infra/db/init/db_init_roles_schemas.sql`（包含 `pgcrypto`、角色、schema、权限）。

如果你已经启动过并生成了数据卷，但需要重新初始化：
- 清空并重建（会丢数据）：`docker compose down -v` 后再 `docker compose up -d`
- 或者手动在容器内补跑 init（不丢数据，幂等执行）：
  - 参考 `infra/docker/README.md` 的 “Database Initialization” 小节

## 3. 不使用 Docker（手动初始化）

### 3.1 创建数据库

```powershell
psql -U postgres -h localhost -p 5432
CREATE DATABASE youthloop;
\q
```

### 3.2 执行初始化脚本（必须先做）

```powershell
psql -U postgres -h localhost -p 5432 -d youthloop -f infra/db/init/db_init_roles_schemas.sql
```

这个脚本会：
- `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- 创建 4 个角色与 3 个 schema，并设置最小权限/默认权限

## 4. 迁移（Flyway）

项目采用 Spring Boot 集成 Flyway，默认在服务启动时自动迁移：

```powershell
# Social API：迁移 shared + social
./mvnw -pl apps/social-api spring-boot:run

# Game API：迁移 game
./mvnw -pl apps/game-api spring-boot:run
```

说明：
- `DB_USER/DB_PASSWORD` 是应用运行时账号（默认 `social_app` / `game_app`）。
- `FLYWAY_USER/FLYWAY_PASSWORD` 是迁移账号（默认 `social_migrator` / `game_migrator`）。
- 如果没先执行初始化脚本，Flyway 可能会在建表阶段因 `gen_random_uuid()` 报错而启动失败。

## 5. 快速验收（建议每个新环境都跑一次）

### 5.1 验证 pgcrypto

```sql
SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto';
SELECT gen_random_uuid();
```

### 5.2 验证 schema/角色

```sql
SELECT nspname FROM pg_namespace WHERE nspname IN ('shared','social','game');
SELECT rolname FROM pg_roles WHERE rolname IN ('social_migrator','social_app','game_migrator','game_app');
```

### 5.3 验证权限预期（口径）

- `social_migrator`：可在 `shared`、`social` 执行 DDL
- `social_app`：只允许在 `shared`、`social` 执行 DML（不允许 DDL）
- `game_migrator`：可在 `game` 执行 DDL
- `game_app`：`game` 可 DML；`shared` 只读（SELECT）

## 6. 进一步参考

- `infra/db/README.md`（数据库结构、角色权限、迁移方式说明）
- `infra/docker/README.md`（Docker 启动与容器内初始化）
- `Project-Structure.md`（架构约束与 Flyway 多 schema 约定）

