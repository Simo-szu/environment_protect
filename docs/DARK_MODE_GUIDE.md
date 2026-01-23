# 深色模式实现指南

## 🌙 功能特性

本项目支持完整的深色/浅色主题切换系统，具备以下特性：

- ✅ **浅色/深色主题切换**
- ✅ **自动跟随系统偏好**
- ✅ **主题持久化存储**
- ✅ **平滑过渡动画**
- ✅ **三种模式循环切换**：浅色 → 深色 → 跟随系统
- ✅ **浮动主题切换按钮**：固定在右下角，美观易用

## 🛠 技术实现

### 核心依赖
- `next-themes` - Next.js 官方推荐的主题管理库
- `Tailwind CSS` - 使用 `dark:` 前缀实现深色模式样式
- `framer-motion` - 提供流畅的动画效果

### 文件结构
```
src/
├── components/
│   ├── ThemeProvider.tsx           # 主题提供者组件
│   └── ui/
│       ├── ThemeToggle.tsx         # 原始主题切换按钮（已弃用）
│       └── FloatingThemeToggle.tsx # 浮动主题切换按钮
├── app/
│   └── layout.tsx                  # 根布局，注入主题提供者
└── components/
    ├── Layout.tsx                  # 主布局组件（包含浮动按钮）
    └── ui/
        └── UnifiedHeader.tsx       # 头部组件
```

## 🎨 设计系统

### 颜色映射
| 元素 | 浅色模式 | 深色模式 |
|------|----------|----------|
| 主背景 | `#FAFAF9` | `slate-900` |
| 卡片背景 | `white/80` | `slate-800/80` |
| 主文字 | `slate-600` | `slate-300` |
| 主色调 | `#30499B` | `#56B949` |
| 强调色 | `#56B949` | `#F0A32F` |

### 样式规范
```css
/* 基础用法 */
className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"

/* 带过渡动画 */
className="bg-white dark:bg-slate-800 transition-colors duration-300"

/* 边框和阴影 */
className="border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/20"
```

## 🔧 使用方法

### 1. 浮动主题切换按钮
浮动主题切换按钮位于页面右下角，具有以下特性：
- 🎯 **固定位置**：始终可见，不会被内容遮挡
- 🎨 **展开式设计**：点击主按钮展开三个主题选项
- ✨ **动画效果**：流畅的展开/收起动画
- 🏷️ **悬浮提示**：每个选项都有清晰的标签说明

**三种主题模式：**
- 🌞 **浅色模式**：适合白天使用
- 🌙 **深色模式**：适合夜间使用  
- 🖥️ **跟随系统**：自动根据系统设置切换

### 2. 交互方式
- 点击主按钮展开选项
- 点击任意选项切换主题
- 点击页面其他区域收起选项

### 3. 在组件中使用主题
```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-slate-800 transition-colors duration-300">
      <p>当前主题: {theme}</p>
      <button onClick={() => setTheme('dark')}>切换到深色</button>
    </div>
  );
}
```

### 4. 添加新页面的深色模式支持
为新页面添加深色模式支持时，遵循以下模式：

```tsx
// 背景色
className="bg-white dark:bg-slate-900"

// 文字颜色
className="text-slate-600 dark:text-slate-300"

// 卡片背景
className="bg-white/80 dark:bg-slate-800/80"

// 边框
className="border-slate-200 dark:border-slate-700"

// 添加过渡动画
className="transition-colors duration-300"
```

## 📱 响应式支持

主题系统完全支持响应式设计，在所有设备尺寸下都能正常工作。

## 🔄 持久化

用户的主题选择会自动保存到 localStorage，页面刷新后会保持用户的选择。

## 🎯 最佳实践

1. **始终添加过渡动画**：使用 `transition-colors duration-300`
2. **保持颜色一致性**：使用设计系统中定义的颜色
3. **测试两种模式**：确保在浅色和深色模式下都有良好的对比度
4. **考虑可访问性**：确保文字和背景有足够的对比度

## 🚀 未来扩展

- [ ] 更多主题色彩选项
- [ ] 自定义主题编辑器
- [ ] 主题预设方案
- [ ] 更细粒度的组件主题控制