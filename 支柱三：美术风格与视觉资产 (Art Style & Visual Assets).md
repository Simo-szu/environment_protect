# 支柱三：美术风格与视觉资产 (Art Style & Visual Assets)

**版本：1.0**
**关联蓝图版本：1.0**

## 1.0 文档目标与原则
本文件旨在定义“My Digital Biome”的整体视觉语言、艺术风格和所有必需的视觉资产。它是项目的“面容”，其核心任务是通过视觉叙事，让用户直观地“感受”到生态系统的健康状况。

### 核心指导原则：

- **服务于清晰度 (Clarity is Paramount)**: 所有的美术选择都必须首先服务于信息的清晰传达。用户必须能通过视觉变化，一目了然地判断生态系统的状态。

- **风格统一且可行 (Consistent & Feasible)**: 我们将采用一种对于单人开发者而言易于实现或采购的风格。避免追求照片级真实感，拥抱干净、程式化的美学。

- **情感化传达 (Emotional Conveyance)**: 视觉风格的目标是引发情感共鸣。健康的池塘应让人感到宁静愉悦，而崩溃的生态则应带来视觉上的不适感。

## 2.0 艺术风格定义 (Art Style Definition)

### 2.1 核心关键词
干净 (Clean) | 扁平化 (Flat) | 程式化 (Stylized) | 科学仪表盘风 (Scientific Dashboard-style)

### 2.2 情绪板与参考 (Mood Board & References)

我们的视觉风格将从以下来源汲取灵感：

- **核心灵感 - Kurzgesagt – In a Nutshell (YouTube频道)**: 借鉴其将复杂科学概念转化为明亮、生动、信息密集的扁平化动画风格。

- **游戏参考 - Alto's Adventure / Florence**: 借鉴其简约的几何形状、大胆的色彩运用和创造宁静氛围的能力。

- **插画参考 - 现代科学教科书/杂志插画**: 借鉴其清晰、准确地展示剖面图和生态关系的程式化画风。

想象一下，我们的项目就像一个“可以玩的Kurzgesagt视频”。

### 2.3 核心调色板 (Core Color Palette)
颜色是传递生态系统状态最直接的工具。我们将定义三套核心色板，并在UI中使用CSS变量来实现状态间的平滑过渡。

#### A. 健康状态 (Healthy State)

- **天空**: #a_sky_blue (天蓝色, 如 #87CEEB)
- **水体 (清澈)**: #a_clear_water_blue (清澈的蓝色, 如 #5F9EA0)
- **植物 (健康)**: #a_vibrant_green (活力绿色, 如 #2E8B57)
- **土地/河岸**: #an_earthy_brown (大地棕色, 如 #A0522D)
- **UI强调色**: #a_bright_accent_blue (亮蓝色, 如 #007BFF)

#### B. 污染/衰退状态 (Polluted/Decaying State)

- **天空**: #a_greyish_sky (灰蒙蒙的天空, 如 #B0C4DE)
- **水体 (富营养化)**: #a_murky_green (浑浊的绿色, 如 #556B2F)
- **植物 (枯萎)**: #a_sickly_yellow_brown (病态黄棕色, 如 #BDB76B)
- **UI强调色**: #a_warning_orange (警告橙色, 如 #FD7E14)

#### C. 崩溃状态 (Collapsed State)

- **天空**: #a_dark_oppressive_grey (压抑的深灰色, 如 #778899)
- **水体 (严重污染)**: #a_dark_sludge_brown (黑泥棕色, 如 #6B4226)
- **植物 (死亡)**: #a_dead_grey (死寂的灰色, 如 #808080)
- **UI强调色**: #a_danger_red (危险红色, 如 #DC3545)

#### D. UI基础色 (Base UI Colors)

- **背景**: #a_light_grey (浅灰色, 如 #F8F9FA)
- **面板**: #FFFFFF (白色)
- **主文字**: #212529 (近黑色)
- **次要文字**: #6C757D (灰色)

## 3.0 视觉资产清单 (Visual Asset List)
所有生物和大部分UI元素都应优先使用 SVG格式，以便于通过代码进行缩放和颜色修改。

### 3.1 背景资产 (Background Assets)

#### 池塘剖面图 (Pond Cross-section):

- 一个静态的多层SVG或PNG文件。
- **图层划分**: [天空层], [远景/岸边层], [水面线], [水体层], [水底/泥土层]。
- **实现**: 水体层应为一个独立的HTML元素，以便我们能通过CSS直接修改其 background-color 和 opacity 来模拟水质变化。

### 3.2 生物资产 (Biotic Assets)

#### 水生植物 (aquaticPlants):

- **样式**: 2-3种不同形态的、简约的程式化水草SVG图标。
- **状态**:
  - 健康: 填充色为 healthy_plant_green。
  - 枯萎: 填充色变为 sickly_yellow_brown。

#### 小型鱼类 (smallFish):

- **样式**: 一种小巧、轮廓清晰的鱼形SVG图标。
- **状态**: 颜色可以保持不变。其存在、数量和消失是关键信息。

#### 大型鱼类 (largeFish):

- **样式**: 一种体型稍大、更具“捕食者”轮廓的鱼形SVG图标。
- **状态**: 同小型鱼类。

### 3.3 环境与特效资产 (Environment & FX Assets)

#### 藻类水华 (Algae Bloom):

- **实现**: 一个覆盖在水体层之上的半透明 div，背景色为 murky_green。可以叠加一个缓慢移动的、由许多小圆点组成的粒子效果背景，以增加动态感。

#### 曝气机气泡 (Aerator Bubbles):

- **实现**: 使用纯CSS或一个轻量JS库实现的上升气泡动画。每个气泡是一个带有 border-radius: 50% 的小 div。

### 3.4 UI元素与图标 (UI Elements & Icons)

图标库: 推荐使用一个统一的图标库，如 Feather Icons 或 Lucide Icons，以保证风格一致。

#### 所需图标清单:

- **时间控制**: play, pause, fast-forward
- **信息/帮助**: info, help-circle
- **警告/错误**: alert-triangle, x-circle

工具: tool, settings (或更能代表“曝气机”和“缓冲带”的自定义图标)

按钮和面板:

样式: 统一使用圆角设计 (border-radius: 8px)。

交互: 按钮在鼠标悬停 (hover) 时应有轻微的放大或变亮效果。活动状态应有清晰的视觉标识（如更深的背景色或边框）。

4.0 字体与排版 (Typography)
字体选择 (Font Family):

推荐使用 Inter 或 Noto Sans。这些是免费的Google Fonts，字重齐全，在各种屏幕上都表现出色的可读性。

排版层级 (Hierarchy):

面板标题: font-weight: 600 (Semibold), font-size: 1.25rem

引导/正文: font-weight: 400 (Regular), font-size: 1rem

仪表盘数值/次要信息: font-weight: 400 (Regular), font-size: 0.875rem, 颜色为 secondary_text_grey。圆盘仪表盘中心数值使用font-weight: 700 (Bold)以突出显示。

5.0 资源采购与实现策略 (Sourcing & Implementation)
优先自制/采购SVG: 对于核心生物资产，优先在 Flaticon, Freepik 或 The Noun Project 等网站寻找风格合适的SVG图标。

利用CSS变量: 将所有颜色定义为CSS根变量 (:root { --water-color: #5F9EA0; })。当生态系统状态改变时，只需用JavaScript动态更新这些变量，即可实现全局主题的平滑切换。

动画保持克制: 动画应用来增强反馈和生命感，但应避免过度使用，以免分散用户对核心信息的注意力。所有的动画都应有明确的目的。