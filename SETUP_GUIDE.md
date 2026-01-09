# 环境配置指南

## 🚀 系统要求

在开始之前，请确保您的系统满足以下要求：

### 必需软件

1. **Node.js** (版本 18.0.0 或更高)
2. **Git**
3. **包管理器** (npm/yarn/pnpm)

## 📦 安装 Node.js

### macOS 系统

#### 方式1：使用 Homebrew（推荐）
```bash
# 安装 Homebrew（如果尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node

# 验证安装
node --version
npm --version
```

#### 方式2：使用官方安装包
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 macOS 安装包
3. 运行安装程序

#### 方式3：使用 nvm（Node Version Manager）
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端或运行
source ~/.zshrc

# 安装最新的 LTS 版本
nvm install --lts
nvm use --lts
```

### Windows 系统

#### 方式1：使用官方安装包（推荐）
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 Windows 安装包 (.msi)
3. 运行安装程序

#### 方式2：使用 Chocolatey
```cmd
# 安装 Chocolatey（如果尚未安装）
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 Node.js
choco install nodejs

# 验证安装
node --version
npm --version
```

#### 方式3：使用 nvm-windows
1. 从 [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases) 下载安装包
2. 运行安装程序
3. 使用命令安装 Node.js：
```cmd
nvm install lts
nvm use lts
```

### Linux 系统

#### Ubuntu/Debian
```bash
# 更新包列表
sudo apt update

# 安装 Node.js
sudo apt install nodejs npm

# 或者安装最新版本
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### CentOS/RHEL/Fedora
```bash
# 使用 dnf (Fedora)
sudo dnf install nodejs npm

# 使用 yum (CentOS/RHEL)
sudo yum install nodejs npm

# 或者安装最新版本
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

## 🔧 验证安装

安装完成后，请验证所有工具是否正确安装：

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 Git 版本
git --version
```

预期输出示例：
```
v18.17.0
9.6.7
git version 2.39.0
```

## 📋 包管理器选择

### npm（默认）
Node.js 自带，无需额外安装。

### pnpm（推荐）
```bash
# 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

### yarn
```bash
# 安装 yarn
npm install -g yarn

# 验证安装
yarn --version
```

## 🚀 项目配置

安装完必需软件后，按照以下步骤配置项目：

### 1. 克隆项目
```bash
git clone https://github.com/Simo-szu/environment_protect.git
cd environment_protect
```

### 2. 运行自动配置
```bash
npm run setup
```

### 3. 启动开发服务器

#### macOS/Linux
```bash
./scripts/dev.sh
# 或
npm run dev
```

#### Windows
```cmd
scripts\dev.bat
# 或
npm run dev
```

## 🔍 故障排除

### 常见问题

#### 1. Node.js 未找到
- 确保 Node.js 已正确安装
- 重启终端/命令提示符
- 检查 PATH 环境变量

#### 2. 权限错误（macOS/Linux）
```bash
# 给脚本添加执行权限
chmod +x scripts/dev.sh
chmod +x scripts/setup.js
```

#### 3. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 杀死进程或更改端口
export PORT=3001  # macOS/Linux
set PORT=3001     # Windows
```

#### 4. 依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules & del package-lock.json  # Windows

npm install
```

## 📞 获取帮助

如果遇到问题，请：

1. 检查 [Node.js 官方文档](https://nodejs.org/docs/)
2. 查看项目的 [GitHub Issues](https://github.com/Simo-szu/environment_protect/issues)
3. 联系项目维护者

## 🎯 下一步

环境配置完成后，您可以：

- 阅读 [README.md](./README.md) 了解项目详情
- 查看 [开发计划.md](./开发计划.md) 了解开发路线图
- 开始编写代码！