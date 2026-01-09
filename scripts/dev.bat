@echo off
REM Windows 开发启动脚本

echo 🚀 启动 My Digital Biome 开发环境...

REM 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 请先安装 Node.js
    pause
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    if exist "pnpm-lock.yaml" (
        pnpm install
    ) else if exist "yarn.lock" (
        yarn install
    ) else (
        npm install
    )
)

REM 检查环境变量文件
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local"
        echo ✅ 已创建 .env.local 文件
    )
)

REM 启动开发服务器
echo 🌟 启动开发服务器...
if exist "pnpm-lock.yaml" (
    pnpm dev
) else if exist "yarn.lock" (
    yarn dev
) else (
    npm run dev
)

pause