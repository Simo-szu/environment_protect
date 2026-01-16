#!/bin/bash

echo "🚀 简单推送脚本"
echo "=================="

# 检查是否有更改
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    echo "请输入提交信息（按回车使用默认信息）:"
    read commit_message
    if [ -z "$commit_message" ]; then
        commit_message="update: 更新项目文件"
    fi
    git commit -m "$commit_message"
fi

echo "📤 正在推送到 GitHub..."

# 尝试推送
if git push origin main; then
    echo "✅ 推送成功！"
    echo "🌐 查看你的项目：https://github.com/Simo-szu/environment_protect"
else
    echo "❌ 推送失败"
    echo "💡 建议使用以下方法之一："
    echo "   1. GitHub Desktop（最简单）"
    echo "   2. VS Code Git 功能"
    echo "   3. 重新配置 SSH 密钥"
    echo ""
    echo "📖 查看详细指南："
    echo "   - GITHUB_DESKTOP_GUIDE.md"
    echo "   - VSCODE_GIT_GUIDE.md"
fi