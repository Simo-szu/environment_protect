#!/bin/bash
# macOS/Linux 开发启动脚本

echo "🚀 启动 My Digital Biome 开发环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

echo "📦 Node.js 版本: $(node --version)"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install
    elif [ -f "yarn.lock" ]; then
        yarn install
    else
        npm install
    fi
fi

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env.local"
        echo "✅ 已创建 .env.local 文件"
    fi
fi

# 启动开发服务器
echo "🌟 启动开发服务器..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm dev
elif [ -f "yarn.lock" ]; then
    yarn dev
else
    npm run dev
fi