# My Digital Biome — MVP 占位素材说明

本目录包含最小可行版本（MVP）所需的占位素材，便于快速接入 Next.js/TypeScript/Tailwind/shadcn 的前端实现。所有文件均为占位，可在后续替换为最终资产。

目录概览
- `assets/svg/`：生态可视相关的 SVG（鱼类、水草、背景、藻华覆盖、曝气气泡）。
- `assets/icons/`：基础交互图标（play/pause/fast-forward/info/alert-triangle/settings）。
- `assets/content/`：中文文案（四幕引导模态、事件日志示例）。
- `assets/tokens/`：配色调色板（JSON），与文档中的“健康/污染/崩溃”三状态一致。

使用建议
- 颜色：SVG 多使用 `currentColor` 或中性填充，后续可在组件中通过 `className`（Tailwind）或内联样式覆盖。
- 自适应：图标与生物建议使用 `viewBox` 等比例缩放；背景提供 1920×1080 版本，开发中可裁剪或拉伸。
- 动效：`algae-overlay.svg`、`aerator-bubbles.svg` 可通过 CSS 设定 `opacity/transform` 实现显隐与漂浮效果。

后续替换
- 设计确定后，可将相同文件名的 SVG 直接替换，或在代码层面更新引用路径。

