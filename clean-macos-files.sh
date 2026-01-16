#!/bin/bash

echo "🧹 清理 macOS 系统文件..."
echo "===================================="

# 统计文件数量
DS_COUNT=$(find . -name ".DS_Store" -type f 2>/dev/null | wc -l)
DOT_COUNT=$(find . -name "._*" -type f 2>/dev/null | wc -l)

echo "📊 发现的系统文件："
echo "   .DS_Store 文件: $DS_COUNT 个"
echo "   ._ 开头文件: $DOT_COUNT 个"
echo ""

if [ $DS_COUNT -eq 0 ] && [ $DOT_COUNT -eq 0 ]; then
    echo "✨ 没有发现系统文件，项目很干净！"
    exit 0
fi

read -p "是否删除这些文件？(y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 删除 .DS_Store 文件
    if [ $DS_COUNT -gt 0 ]; then
        find . -name ".DS_Store" -type f -delete
        echo "✅ 已删除 $DS_COUNT 个 .DS_Store 文件"
    fi

    # 删除 ._ 开头的文件
    if [ $DOT_COUNT -gt 0 ]; then
        find . -name "._*" -type f -delete
        echo "✅ 已删除 $DOT_COUNT 个 ._ 文件"
    fi

    # 删除 Spotlight 索引
    find . -name ".Spotlight-V100" -type d -exec rm -rf {} + 2>/dev/null
    echo "✅ 已删除 Spotlight 索引"

    # 删除 Trashes
    find . -name ".Trashes" -type d -exec rm -rf {} + 2>/dev/null
    echo "✅ 已删除回收站文件"

    echo ""
    echo "🎉 清理完成！"
    echo ""
    echo "💡 提示："
    echo "   - 这些文件会被 .gitignore 自动忽略"
    echo "   - 以后 git add . 不会再添加它们"
    echo "   - 可以定期运行此脚本保持项目干净"
else
    echo "❌ 已取消清理"
fi

echo "===================================="