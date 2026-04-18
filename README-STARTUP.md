# YouthLoop 项目启动指南

## 快速启动

### 方式一：使用启动脚本（推荐）

```powershell
# 启动所有服务
.\start-all.ps1

# 停止所有服务
.\stop-all.ps1
```

### 方式二：手动启动

在 4 个不同的终端窗口中分别执行：

```powershell
# 终端 1 - Social API
cd apps/social-api
mvn spring-boot:run

# 终端 2 - Game API
cd apps/game-api
mvn spring-boot:run

# 终端 3 - Social Worker
cd apps/social-worker
mvn spring-boot:run

# 终端 4 - Web 前端
cd apps/web
pnpm dev
```

## 服务地址

启动成功后，可以访问：

- **前端应用**: http://localhost:8000
- **Social API**: http://localhost:8080
- **Game API**: http://localhost:8082
- **Social API Health**: http://localhost:8080/actuator/health
- **Game API Health**: http://localhost:8082/actuator/health

## 前置要求

### 1. PostgreSQL 数据库

确保 PostgreSQL 服务正在运行：

```powershell
# 检查服务状态
Get-Service postgresql*

# 如果未运行，启动服务
Start-Service postgresql-x64-16
```

### 2. 数据库初始化（首次运行）

如果是第一次运行项目，需要初始化数据库：

```powershell
# 创建数据库
$env:PGPASSWORD = 'postgres'
& 'D:\PostgreSQL\bin\psql.exe' -U postgres -h localhost -p 5432 -c 'CREATE DATABASE youthloop;'

# 初始化角色和 schemas
& 'D:\PostgreSQL\bin\psql.exe' -U postgres -h localhost -p 5432 -d youthloop -f infra/db/init/db_init_roles_schemas.sql
```

### 3. PowerShell 执行策略

如果遇到"禁止运行脚本"错误，执行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 4. 前端依赖

首次运行前需要安装依赖：

```powershell
cd apps/web
pnpm install
```

## 启动时间

- **后端服务**: 每个约 15-20 秒
- **前端服务**: 约 5-10 秒
- **总计**: 约 20-30 秒所有服务完全启动

## 停止服务

### 使用脚本停止

```powershell
.\stop-all.ps1
```

### 手动停止

在每个终端窗口按 `Ctrl + C`，或直接关闭窗口。

## 常见问题

### 端口被占用

```powershell
# 查看端口占用
netstat -ano | findstr :8080
netstat -ano | findstr :8082
netstat -ano | findstr :8000

# 杀掉进程
taskkill /PID <进程ID> /F
```

### 数据库连接失败

检查 `.env` 文件中的数据库配置：

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=youthloop
```

### Maven 构建失败

```powershell
# 清理并重新构建
mvn clean install
```

### 前端启动失败

```powershell
# 删除 node_modules 重新安装
cd apps/web
Remove-Item -Recurse -Force node_modules
Remove-Item -Force pnpm-lock.yaml
pnpm install
```

## 开发建议

1. **首次启动**: 使用 `start-all.ps1` 脚本
2. **日常开发**: 只启动需要的服务
3. **调试**: 在 IDE 中单独启动服务，方便断点调试
4. **停止服务**: 使用 `stop-all.ps1` 或 `Ctrl + C`

## 项目结构

```
carbon-game/
├── apps/
│   ├── game-api/          # 游戏 API 服务 (端口 8082)
│   ├── social-api/        # 社交 API 服务 (端口 8080)
│   ├── social-worker/     # 社交后台任务处理
│   └── web/               # Next.js 前端 (端口 8000)
├── infra/
│   └── db/
│       └── init/          # 数据库初始化脚本
├── .env                   # 环境变量配置
├── start-all.ps1          # 启动脚本
├── stop-all.ps1           # 停止脚本
└── README-STARTUP.md      # 本文件
```

## 技术栈

- **后端**: Spring Boot 3.4.1 + Java 21
- **前端**: Next.js 16 + React 19 + TypeScript
- **数据库**: PostgreSQL 16
- **包管理**: Maven (后端) + pnpm (前端)

## 环境变量

主要配置在 `.env` 文件中：

- 数据库连接
- JWT 密钥
- 对象存储配置
- 第三方服务配置

## 更多信息

- 数据库文档: `infra/db/README.md`
- API 文档: 启动后访问 `/actuator` 端点
