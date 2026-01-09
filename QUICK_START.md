# 🚀 快速启动指南

## 📋 前置条件

确保您已安装：
- Node.js 18.0.0+
- Git
- 包管理器 (npm/yarn/pnpm)

> 💡 如果尚未安装，请查看 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## ⚡ 一键启动

### 1. 环境检查
```bash
npm run health-check
```

### 2. 自动配置
```bash
npm run setup
```

### 3. 启动开发服务器

#### macOS/Linux
```bash
npm run dev
```

#### Windows
```cmd
npm run dev
```

## 🌐 访问应用

启动成功后访问: http://localhost:3000

## 🛠️ 常用命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 生产模式
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 环境检查
npm run health-check
```

## 🔧 故障排除

### 端口被占用
```bash
# 使用其他端口
PORT=3001 npm run dev
```

### 依赖问题
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 权限问题 (macOS/Linux)
```bash
chmod +x scripts/*.sh scripts/*.js
```

## 📚 更多信息

- [完整文档](./README.md)
- [环境配置指南](./SETUP_GUIDE.md)
- [开发计划](./开发计划.md)