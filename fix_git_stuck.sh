#!/bin/bash

echo "🔧 修复Git卡住问题..."

# 1. 强制结束Git进程
echo "1. 结束Git进程..."
pkill -f git 2>/dev/null || echo "没有找到Git进程"

# 2. 删除锁文件
echo "2. 删除Git锁文件..."
rm -f .git/.COMMIT_EDITMSG.swp
rm -f .git/.MERGE_MSG.swp  
rm -f .git/index.lock
rm -f .git/refs/heads/*.lock

# 3. 中止rebase
echo "3. 中止rebase操作..."
git rebase --abort 2>/dev/null || echo "没有进行中的rebase"

# 4. 检查状态
echo "4. 检查Git状态..."
git status

echo "✅ Git修复完成！"
echo ""
echo "现在你可以重新提交更改："
echo "git add ."
echo "git commit -m 'fix: 修复404页面问题并恢复登录注册功能'"
echo "git push origin main"