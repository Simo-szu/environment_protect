#!/bin/bash

echo "=== 检查Git状态 ==="

# 检查是否有未提交的更改
echo "1. 检查工作区状态："
git status --porcelain

echo ""
echo "2. 检查最近的提交："
git log --oneline -3

echo ""
echo "3. 检查远程状态："
git remote -v

echo ""
echo "4. 检查分支状态："
git branch -v

echo ""
echo "=== 检查完成 ==="