# 数据库设置指南

## 概述

本项目使用 Redis 和 PostgreSQL 作为数据存储解决方案。这些服务已通过 Homebrew 安装为系统级服务。

## 已安装的服务

### Redis
- **版本**: 最新稳定版
- **端口**: 6379
- **用途**: 缓存、会话存储、实时数据

### PostgreSQL
- **版本**: 16.x
- **端口**: 5432
- **数据库名**: environment_protect
- **用户**: macbook (当前系统用户)

## 服务管理

### 使用 npm 脚本 (推荐)

```bash
# 启动所有数据库服务
npm run db:start

# 停止所有数据库服务
npm run db:stop

# 重启所有数据库服务
npm run db:restart

# 查看服务状态
npm run db:status

# 测试连接
npm run db:test
```

### 使用 brew services

```bash
# Redis
brew services start redis
brew services stop redis
brew services restart redis

# PostgreSQL
brew services start postgresql@16
brew services stop postgresql@16
brew services restart postgresql@16
```

### 直接命令行访问

```bash
# Redis CLI
redis-cli

# PostgreSQL CLI - 使用系统用户 (macbook)
psql -d environment_protect

# PostgreSQL CLI - 使用 postgres 用户
export PGPASSWORD='postgres'
psql -U postgres -h 127.0.0.1 -p 5432 -d environment_protect

# 或者一行命令
PGPASSWORD='postgres' psql -U postgres -h 127.0.0.1 -p 5432 -d environment_protect
```

## 环境变量

项目的 `.env.local` 文件已配置以下变量：

```env
# 数据库配置 - 默认使用系统用户
DATABASE_URL=postgresql://macbook@localhost:5432/environment_protect
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=environment_protect
POSTGRES_USER=macbook

# 可选：使用 postgres 用户连接
DATABASE_URL_POSTGRES=postgresql://postgres:postgres@localhost:5432/environment_protect
POSTGRES_USER_ALT=postgres
POSTGRES_PASSWORD=postgres

# Redis 配置
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 用户说明

PostgreSQL 实例现在有两个超级用户：

1. **macbook** (系统用户) - 无密码，本地连接
2. **postgres** (标准用户) - 密码: `postgres`，可用于远程连接

## 常用操作

### PostgreSQL

```bash
# 创建新数据库
createdb my_new_database

# 删除数据库
dropdb my_database

# 备份数据库
pg_dump environment_protect > backup.sql

# 恢复数据库
psql environment_protect < backup.sql

# 查看所有数据库
psql -l
```

### Redis

```bash
# 测试连接
redis-cli ping

# 查看所有键
redis-cli keys "*"

# 清空所有数据
redis-cli flushall

# 查看内存使用
redis-cli info memory
```

## 故障排除

### 服务无法启动

1. 检查端口是否被占用：
   ```bash
   lsof -i :5432  # PostgreSQL
   lsof -i :6379  # Redis
   ```

2. 查看服务日志：
   ```bash
   brew services list
   tail -f /opt/homebrew/var/log/postgresql@16.log
   tail -f /opt/homebrew/var/log/redis.log
   ```

### 连接问题

1. 确保服务正在运行：
   ```bash
   npm run db:status
   ```

2. 测试连接：
   ```bash
   npm run db:test
   ```

3. 检查防火墙设置（如果适用）

## 开发建议

1. **自动启动**: 服务已配置为系统启动时自动启动
2. **数据持久化**: 数据存储在 `/opt/homebrew/var/` 目录下
3. **配置文件**: 
   - PostgreSQL: `/opt/homebrew/var/postgresql@16/postgresql.conf`
   - Redis: `/opt/homebrew/etc/redis.conf`

## 生产环境注意事项

在生产环境中，请确保：
1. 使用强密码和适当的用户权限
2. 配置防火墙规则
3. 定期备份数据
4. 监控服务状态和性能
5. 使用环境变量管理敏感信息