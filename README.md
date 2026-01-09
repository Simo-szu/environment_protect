# My Digital Biome - 交互式生态模拟系统

这是一个基于 [Next.js](https://nextjs.org) 的交互式生态模拟系统项目，支持跨平台开发。

## 🚀 快速开始

### 系统要求

- Node.js 18.0.0 或更高版本
- npm、yarn 或 pnpm 包管理器
- Git

### 🔧 环境配置

#### 自动配置（推荐）

```bash
# 运行自动配置脚本
npm run setup
```

#### 手动配置

1. **克隆项目**
```bash
git clone https://github.com/Simo-szu/environment_protect.git
cd environment_protect
```

2. **安装依赖**
```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，填入实际配置
```

### 🖥️ 跨平台启动

#### Windows 系统
```cmd
# 方式1：使用批处理脚本
scripts\dev.bat

# 方式2：使用 npm 脚本
npm run dev:win
```

#### macOS/Linux 系统
```bash
# 方式1：使用 shell 脚本
./scripts/dev.sh

# 方式2：使用 npm 脚本
npm run dev:unix

# 方式3：直接启动
npm run dev
```

### 📱 访问应用

启动成功后，在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🛠️ 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 清理构建文件
npm run clean        # macOS/Linux
npm run clean:win    # Windows
```

## 📁 项目结构

```
environment_protect/
├── src/
│   ├── app/           # Next.js App Router 页面
│   ├── components/    # React 组件
│   ├── core/          # 核心业务逻辑
│   ├── lib/           # 工具库
│   ├── store/         # 状态管理
│   └── styles/        # 样式文件
├── public/            # 静态资源
├── scripts/           # 跨平台脚本
├── .env.example       # 环境变量模板
└── dev.config.js      # 开发配置
```

## 🌍 跨平台支持

本项目已配置完整的跨平台开发环境：

- **Windows**: 支持 cmd 和 PowerShell
- **macOS**: 支持 zsh 和 bash
- **Linux**: 支持各种 shell 环境

### 平台特定配置

- 自动检测操作系统
- 适配不同的路径分隔符
- 兼容不同的换行符
- 支持不同的包管理器

## 🔧 技术栈

- **框架**: Next.js 16.0.1
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: GSAP
- **状态管理**: Zustand
- **UI组件**: Radix UI
- **图表**: Recharts

## 🤝 协同开发

### Git 工作流

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 提交更改
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/your-feature-name
```

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 TypeScript 进行类型检查
- 遵循 Conventional Commits 规范

## 📚 了解更多

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 🚀 部署

推荐使用 [Vercel](https://vercel.com) 进行部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 📄 许可证

本项目采用 MIT 许可证。
