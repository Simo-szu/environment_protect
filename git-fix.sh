#!/bin/bash
# Git 仓库修复脚本

echo "🔧 修复 Git 仓库..."

# 备份当前更改
echo "📦 备份当前更改..."
cp -r . ../environment_protect_backup

# 重新初始化 Git 仓库
echo "🔄 重新初始化 Git 仓库..."
rm -rf .git
git init
git branch -M main

# 添加远程仓库
echo "🌐 添加远程仓库..."
git remote add origin https://github.com/Simo-szu/environment_protect.git

# 配置用户信息（请替换为你的信息）
echo "👤 配置用户信息..."
echo "请手动运行以下命令配置你的 Git 用户信息："
echo "git config --global user.name '你的用户名'"
echo "git config --global user.email '你的邮箱@example.com'"

# 添加所有文件
echo "📁 添加文件..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "feat: 配置跨平台开发环境和项目结构

- 添加环境变量配置文件
- 创建跨平台启动脚本
- 配置 VS Code 工作区
- 更新项目文档
- 修改首页标题为中文"

echo "✅ Git 仓库修复完成！"
echo "🚀 现在可以推送到 GitHub："
echo "git push -u origin main"