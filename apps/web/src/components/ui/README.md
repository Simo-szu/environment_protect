# YouthLoop Next.js 统一UI组件系统

## 概述

这个组件系统为 YouthLoop Next.js 应用提供了统一的用户界面元素，包括回到顶部按钮、统一的Header导航栏和Footer页脚。所有组件都使用 TypeScript 和 React 18+ 构建。

## 组件列表

### 1. 回到顶部按钮 (BackToTop.tsx)
- **路径**: `src/components/ui/BackToTop.tsx`
- **功能**: 在页面滚动超过300px时显示，点击平滑滚动到顶部
- **特性**:
  - 使用 React Hooks (useState, useEffect)
  - 性能优化的滚动监听 (requestAnimationFrame)
  - 淡色圆形按钮，固定在右下角
  - 符合主页设计风格的动画效果

```tsx
import BackToTop from '@/components/ui/BackToTop';

// 在Layout或页面中使用
<BackToTop />
```

### 2. 统一Header (UnifiedHeader.tsx)
- **路径**: `src/components/ui/UnifiedHeader.tsx`
- **功能**: 
  - 自动检测当前页面并高亮对应导航项
  - 响应式设计，移动端汉堡菜单
  - 可配置搜索框显示
- **特性**:
  - 使用 Next.js usePathname hook
  - TypeScript 接口定义
  - 自动路由匹配

```tsx
import UnifiedHeader from '@/components/ui/UnifiedHeader';

// 基本使用
<UnifiedHeader />

// 自定义配置
<UnifiedHeader 
  showSearch={false}
  showAuth={true}
/>
```

### 3. 带认证的Header (AuthenticatedHeader.tsx)
- **路径**: `src/components/ui/AuthenticatedHeader.tsx`
- **功能**:
  - 集成用户认证状态
  - 用户下拉菜单
  - 登录/注销功能
- **依赖**: `@/hooks/useAuth`

```tsx
import AuthenticatedHeader from '@/components/ui/AuthenticatedHeader';

<AuthenticatedHeader showSearch={true} />
```

### 4. 统一Footer (UnifiedFooter.tsx)
- **路径**: `src/components/ui/UnifiedFooter.tsx`
- **功能**:
  - 主页面显示完整Footer
  - 子页面显示简化Footer
  - 响应式布局

```tsx
import UnifiedFooter from '@/components/ui/UnifiedFooter';

// 完整Footer
<UnifiedFooter showFullFooter={true} />

// 简化Footer
<UnifiedFooter showFullFooter={false} />
```

## 集成到Layout组件

主Layout组件 (`src/components/Layout.tsx`) 已经集成了所有UI组件：

```tsx
import Layout from '@/components/Layout';

export default function MyPage() {
  return (
    <Layout>
      <div>页面内容</div>
    </Layout>
  );
}
```

## 页面类型自动检测

Layout组件会根据路径自动检测页面类型：

```tsx
// 检查是否是子页面
const isSubPage = pathname.includes('/login') || 
                 pathname.includes('/register') || 
                 pathname.includes('/profile') ||
                 pathname.includes('/edit') ||
                 pathname.includes('/settings');

// 检查是否是认证页面
const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
```

## 样式和动画

### CSS-in-JS 动画
组件使用 `styled-jsx` 定义关键帧动画：

```tsx
<style jsx>{`
  @keyframes liquid-drift {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
    100% { transform: translate(0, 0) scale(1); }
  }
`}</style>
```

### Tailwind CSS 类
所有组件都使用 Tailwind CSS 进行样式设计：

```tsx
className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md"
```

## 设计系统

### 颜色方案
```tsx
const colors = {
  primary: '#30499B',    // 蓝色
  success: '#56B949',    // 绿色
  warning: '#F0A32F',    // 橙色
  danger: '#EE4035'      // 红色
};
```

### 字体
- 主字体: Inter (无衬线)
- 标题字体: Cormorant Garamond (衬线)

## TypeScript 接口

### 组件Props接口
```tsx
interface UnifiedHeaderProps {
  showSearch?: boolean;
  showAuth?: boolean;
}

interface UnifiedFooterProps {
  showFullFooter?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}
```

## 依赖项

### 必需依赖
- React 18+
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (图标)

### 可选依赖
- `@/hooks/useAuth` (用户认证)

## 使用示例

### 基本页面
```tsx
// app/page.tsx
import Layout from '@/components/Layout';

export default function HomePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1>欢迎来到 YouthLoop</h1>
      </div>
    </Layout>
  );
}
```

### 无Header/Footer页面
```tsx
// app/login/page.tsx
import Layout from '@/components/Layout';

export default function LoginPage() {
  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="min-h-screen flex items-center justify-center">
        <div>登录表单</div>
      </div>
    </Layout>
  );
}
```

### 自定义组件使用
```tsx
// 在任何组件中单独使用
import BackToTop from '@/components/ui/BackToTop';
import UnifiedFooter from '@/components/ui/UnifiedFooter';

export default function CustomPage() {
  return (
    <div>
      <main>页面内容</main>
      <UnifiedFooter showFullFooter={true} />
      <BackToTop />
    </div>
  );
}
```

## 性能优化

### 1. 滚动监听优化
```tsx
// 使用 requestAnimationFrame 节流
useEffect(() => {
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        toggleVisibility();
        ticking = false;
      });
      ticking = true;
    }
  };
  // ...
}, []);
```

### 2. 条件渲染
```tsx
// 只在需要时渲染组件
{showHeader && <AuthenticatedHeader />}
{isVisible && <BackToTop />}
```

## 部署注意事项

1. 确保所有依赖项已安装
2. Tailwind CSS 配置正确
3. 图标库 (Lucide React) 可用
4. TypeScript 编译无错误

## 更新日志

### v1.0.0 (2024-01-20)
- 初始 Next.js 版本
- TypeScript 支持
- React 18+ Hooks
- 响应式设计
- 用户认证集成
- 性能优化