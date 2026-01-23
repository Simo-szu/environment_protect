#!/bin/bash

# 添加所有更改
git add .

# 提交更改
git commit -m "fix: 修复404页面问题并恢复登录注册功能

主要更改：
- 创建缺失的locale版本动态路由页面
- 添加活动详情页面和科普文章详情页面
- 创建完整的Footer链接页面系统
- 恢复登录和注册页面的locale版本
- 添加帮助中心、意见反馈、联系我们页面
- 所有页面支持深色模式和响应式设计
- 修复路由导航和链接问题

新增文件：
- apps/web/src/app/[locale]/activities/[id]/page.tsx
- apps/web/src/app/[locale]/science/[id]/page.tsx
- apps/web/src/app/[locale]/login/page.tsx
- apps/web/src/app/[locale]/register/page.tsx
- apps/web/src/app/[locale]/game/page.tsx
- apps/web/src/app/[locale]/help/page.tsx
- apps/web/src/app/[locale]/feedback/page.tsx
- apps/web/src/app/[locale]/contact/page.tsx
- apps/web/src/app/[locale]/terms/page.tsx
- apps/web/src/app/[locale]/privacy/page.tsx
- apps/web/src/app/[locale]/activities/register/page.tsx
- apps/web/src/app/help/page.tsx
- apps/web/src/app/feedback/page.tsx
- apps/web/src/app/contact/page.tsx
- docs/PROGRESS_UPDATE_404_FIXES.md"

# 推送到远程仓库
git push origin main

echo "提交完成！"