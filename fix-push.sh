#!/bin/bash

echo "🔧 GitHub 推送问题诊断和修复工具"
echo "===================================="
echo ""

# 检查 SSH 密钥
echo "📋 步骤 1: 检查 SSH 密钥"
if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo "✅ SSH 密钥已存在"
    echo ""
    echo "你的 SSH 公钥是："
    echo "----------------------------------------"
    cat ~/.ssh/id_ed25519.pub
    echo "----------------------------------------"
    echo ""
    echo "📝 请复制上面的公钥（整行内容）"
else
    echo "❌ SSH 密钥不存在"
    exit 1
fi

# 测试 SSH 连接
echo ""
echo "📋 步骤 2: 测试 GitHub SSH 连接"
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ SSH 连接成功！"
    CAN_PUSH=true
else
    echo "❌ SSH 连接失败"
    echo ""
    echo "🔧 解决方法："
    echo "1. 访问：https://github.com/settings/keys"
    echo "2. 点击 'New SSH key'"
    echo "3. 粘贴上面显示的公钥"
    echo "4. 点击 'Add SSH key'"
    echo ""
    CAN_PUSH=false
fi

# 检查 Git 状态
echo ""
echo "📋 步骤 3: 检查 Git 状态"
cd "$(dirname "$0")"
git status --short

# 检查远程仓库
echo ""
echo "📋 步骤 4: 检查远程仓库配置"
git remote -v

# 尝试推送
if [ "$CAN_PUSH" = true ]; then
    echo ""
    echo "📋 步骤 5: 尝试推送到 GitHub"
    read -p "是否现在推送？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main
        if [ $? -eq 0 ]; then
            echo "✅ 推送成功！"
        else
            echo "❌ 推送失败"
            echo ""
            echo "可能的原因："
            echo "1. 没有仓库写入权限"
            echo "2. 需要先接受协作邀请"
            echo "3. SSH 密钥配置有问题"
        fi
    fi
else
    echo ""
    echo "⚠️  请先配置 SSH 密钥后再推送"
    echo "📖 详细步骤请查看：SSH_SETUP_GUIDE.md"
fi

echo ""
echo "===================================="
echo "💡 提示："
echo "- 如果 SSH 配置困难，可以使用 GitHub Desktop"
echo "- 查看详细指南：SSH_SETUP_GUIDE.md"
echo "- 查看 GitHub Desktop 指南：GITHUB_DESKTOP_GUIDE.md"