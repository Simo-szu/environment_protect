# 🐙 GitHub 同步完整指南

## 🚨 当前问题
Git 仓库索引文件损坏，需要修复后才能正常同步。

## 🔧 解决方案

### 方案 1: 快速修复（推荐）

1. **配置 Git 用户信息**（首次使用需要）
```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱@example.com"
```

2. **修复 Git 仓库**
```bash
# 删除损坏的 Git 文件
rm -rf .git

# 重新初始化
git init
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/Simo-szu/environment_protect.git
```

3. **提交更改**
```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 配置跨平台开发环境

- 添加环境变量配置
- 创建跨平台启动脚本  
- 配置 VS Code 工作区
- 更新项目文档"
```

4. **推送到 GitHub**
```bash
git push -u origin main
```

### 方案 2: 使用 GitHub Desktop（简单）

1. **下载 GitHub Desktop**
   - 访问 https://desktop.github.com/
   - 下载并安装

2. **添加现有仓库**
   - 打开 GitHub Desktop
   - 选择 "Add an Existing Repository from your Hard Drive"
   - 选择 `environment_protect` 文件夹

3. **同步更改**
   - 在 GitHub Desktop 中查看更改
   - 写入提交信息
   - 点击 "Commit to main"
   - 点击 "Push origin"

### 方案 3: 使用 VS Code Git 功能

1. **在 VS Code 中打开项目**
```bash
code .
```

2. **使用 VS Code 的 Git 面板**
   - 点击左侧的 Git 图标
   - 查看更改的文件
   - 在消息框中输入提交信息
   - 点击 "✓" 提交
   - 点击 "..." → "Push" 推送

## 📋 日常开发工作流

### 1. 开始开发
```bash
# 拉取最新代码
git pull origin main

# 创建功能分支（可选）
git checkout -b feature/新功能名称
```

### 2. 修改代码
- 使用 VS Code 编辑文件
- 实时预览：http://localhost:3000

### 3. 提交更改
```bash
# 查看更改
git status

# 添加文件
git add .
# 或添加特定文件
git add src/components/landing/LandingPage.tsx

# 提交更改
git commit -m "feat: 添加新功能描述"
```

### 4. 推送到 GitHub
```bash
# 推送到远程仓库
git push origin main
# 或推送功能分支
git push origin feature/新功能名称
```

## 🔄 协作开发

### 分支管理
```bash
# 创建新分支
git checkout -b feature/功能名称

# 切换分支
git checkout main
git checkout feature/功能名称

# 合并分支
git checkout main
git merge feature/功能名称

# 删除分支
git branch -d feature/功能名称
```

### 冲突解决
1. 拉取最新代码时如果有冲突：
```bash
git pull origin main
# 手动解决冲突文件
git add .
git commit -m "resolve: 解决合并冲突"
```

## 📝 提交信息规范

使用 Conventional Commits 格式：

```bash
# 新功能
git commit -m "feat: 添加用户登录功能"

# 修复 bug
git commit -m "fix: 修复登录按钮点击无响应问题"

# 文档更新
git commit -m "docs: 更新 README 安装说明"

# 样式调整
git commit -m "style: 调整首页布局样式"

# 重构代码
git commit -m "refactor: 重构用户认证模块"

# 性能优化
git commit -m "perf: 优化图片加载性能"

# 测试相关
git commit -m "test: 添加登录功能单元测试"
```

## 🛠️ 常用 Git 命令

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 撤销更改
git checkout -- 文件名

# 撤销提交（保留更改）
git reset --soft HEAD~1

# 撤销提交（丢弃更改）
git reset --hard HEAD~1

# 查看分支
git branch -a

# 拉取远程分支
git fetch origin
```

## 🔍 故障排除

### 1. 推送被拒绝
```bash
# 先拉取远程更改
git pull origin main
# 解决冲突后再推送
git push origin main
```

### 2. 忘记添加文件
```bash
# 添加遗漏的文件到上次提交
git add 遗漏的文件
git commit --amend --no-edit
```

### 3. 修改上次提交信息
```bash
git commit --amend -m "新的提交信息"
```

### 4. 查看文件更改
```bash
# 查看工作区更改
git diff

# 查看暂存区更改
git diff --cached
```

## 🎯 最佳实践

1. **频繁提交**：小步快跑，经常提交
2. **清晰的提交信息**：描述做了什么，为什么做
3. **使用分支**：为每个功能创建分支
4. **定期同步**：经常拉取远程更改
5. **代码审查**：使用 Pull Request 进行代码审查

## 📞 获取帮助

- [Git 官方文档](https://git-scm.com/docs)
- [GitHub 帮助文档](https://docs.github.com/)
- [VS Code Git 教程](https://code.visualstudio.com/docs/editor/versioncontrol)