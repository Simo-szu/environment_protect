# 支柱四：技术架构与工程实现 (Technical Architecture & Engineering)

**版本：1.0**
**关联蓝图版本：1.0**

## 1.0 文档目标与原则
本文件旨在为“My Digital Biome”项目提供一份清晰、可执行的技术蓝图。它将详细说明技术选型、项目结构、核心代码架构和开发路线图，以确保高效、稳健的工程实现。

### 核心指导原则：

- **关注点分离 (Separation of Concerns)**: 模拟器的核心逻辑（“引擎”）必须与UI渲染层完全解耦。引擎应是纯粹的TypeScript，不依赖任何React或DOM API，以便于独立测试和维护。

- **单向数据流 (Unidirectional Data Flow)**: 严格遵循 State -> UI 的渲染模式。用户交互通过调用Action来改变State，State的改变自动触发UI的更新。这能极大地降低复杂性。

- **组件化开发 (Component-Driven Development)**: 将UI彻底拆分为独立的、可复用的组件，每个组件只负责自己的渲染和交互逻辑。

- **MVP优先 (MVP First)**: 所有技术决策都应首先服务于最小可行产品（MVP）的快速实现。避免过度工程化和过早优化。

## 2.0 技术选型 (Technology Stack)
| 领域 | 技术 | 理由 |
|---|---|---|
| 核心框架 | Next.js (App Router) | 提供现代化的React开发体验、强大的工程化支持（构建、路由等）。虽然本项目MVP阶段不需要服务端渲染，但其框架为未来扩展提供了无限可能。 |
| 开发语言 | TypeScript | 为项目提供类型安全，大大减少运行时错误，提高代码的可维护性和可读性，对于复杂状态管理至关重要。 |
| 状态管理 | Zustand | 一个极其轻量、简洁且对TypeScript友好的状态管理库。没有Redux的样板代码，上手快，性能高，非常适合单人开发。 |
| 数据可视化 | 自定义SVG圆盘仪表盘 | 使用原生SVG和CSS实现轻量级圆盘仪表盘，相比Recharts折线图大幅减少渲染开销，确保池塘动画优先流畅运行。 |
| UI图标 | Lucide Icons | 一个设计简洁、风格统一的SVG图标库，与我们的整体美术风格完美契合。 |
| 样式方案 | CSS Modules / Tailwind CSS | 推荐CSS Modules与全局CSS变量结合。这提供了组件级别的样式隔离，同时允许我们通过CSS变量（如--water-color）来动态改变全局主题。 |

## 3.0 项目结构 (Project Structure)
/my-digital-biome
|
├── /app/                      # Next.js App Router 核心目录
│   ├── /components/           # 全局可复用UI组件
│   │   ├── /ui/               # 基础UI组件 (Button, Modal etc.)
│   │   └── ...
│   ├── /lib/                  # 辅助函数、类型定义
│   │   └── types.ts           # 全局TypeScript类型定义
│   ├── /store/                # Zustand状态管理
│   │   └── simulationStore.ts # 核心的状态容器
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主页面
|
├── /core/                     # ‼️ 核心模拟引擎 (纯TS, 无React依赖)
│   ├── simulation.ts          # SimulationEngine 类
│   ├── rules.ts               # 生态规则函数
│   └── types.ts               # 引擎相关的类型定义 (BiomeState等)
|
├── /public/                   # 静态资源 (SVG图标, 图片)
|
├── styles/                    # 全局样式
│   └── globals.css            # 全局CSS变量和基础样式
|
└── ... (next.config.js, tsconfig.json etc.)

## 4.0 核心架构设计 (Core Architecture Design)

### 4.1 模拟引擎 (/core)
这是项目的“大脑”在代码层面的实现。

#### /core/types.ts

// 定义支柱一中描述的所有状态变量
export interface BiomeState {
  tick: number;
  nutrients: number;
  dissolvedOxygen: number;
  waterTurbidity: number;
  phytoplankton: number;
  aquaticPlants: number;
  zooplankton: number;
  smallFish: number;
  largeFish: number;
  decomposers: number;
}

#### /core/simulation.ts

import { BiomeState } from './types';
import { applyAllRules } from './rules';

export class SimulationEngine {
  public state: BiomeState;

  constructor() {
    // 初始化健康的池塘状态
    this.state = {
      tick: 0,
      nutrients: 20,
      dissolvedOxygen: 80,
      // ... and all other initial values from Pillar 1
    };
  }

  // 推进模拟一个时间步长
  public tick(): void {
    const nextState = applyAllRules(this.state);
    this.state = { ...nextState, tick: this.state.tick + 1 };
  }

  // 应用外部干预
  public applyIntervention(type: 'AGRICULTURAL_RUNOFF'): void {
    if (type === 'AGRICULTURAL_RUNOFF') {
      this.state.nutrients = Math.min(100, this.state.nutrients + 60);
    }
  }
 
  // 应用修复工具
  public toggleRestorationTool(type: 'AERATOR' | 'RIPARIAN_BUFFER', isActive: boolean): void {
    // 这里的逻辑会更复杂，需要在 applyAllRules 中处理
    // 此处仅为示例
  }
}

### 4.2 前端状态管理 (/store)
Zustand Store是连接“引擎”和“UI”的桥梁。

#### /store/simulationStore.ts

import { create } from 'zustand';
import { SimulationEngine } from '@/core/simulation';
import { BiomeState } from '@/core/types';

interface SimulationState {
  engine: SimulationEngine;
  gameState: 'OBSERVING' | 'INTERVENING' | 'WITNESSING' | 'RESTORING';
  isPaused: boolean;
  biomeState: BiomeState;
  history: BiomeState[]; // 保留用于未来扩展，当前圆盘仪表盘只使用实时数据
  actions: {
    initialize: () => void;
    tick: () => void;
    togglePause: () => void;
    applyIntervention: (type: 'AGRICULTURAL_RUNOFF') => void;
    // ... other actions
  };
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  engine: new SimulationEngine(),
  gameState: 'OBSERVING',
  isPaused: true,
  biomeState: new SimulationEngine().state,
  history: [],
  actions: {
    initialize: () => {
      const engine = new SimulationEngine();
      set({
        engine,
        biomeState: engine.state,
        history: [engine.state],
        isPaused: true,
        gameState: 'OBSERVING',
      });
    },
    tick: () => {
      const { engine } = get();
      engine.tick();
      const newState = { ...engine.state };
      set((state) => ({
        biomeState: newState,
        history: [...state.history, newState],
      }));
    },
    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
    applyIntervention: (type) => {
      const { engine } = get();
      engine.applyIntervention(type);
      set({ biomeState: { ...engine.state } });
    },
  },
}));

### 4.3 UI组件化 (/app/components)

根据支柱二的线框图，我们将UI拆分为以下核心组件：

| 组件名 | 职责 | 依赖的状态/Action |
|---|---|---|
| PondPage.tsx | 页面主容器。负责整体布局，并使用useEffect驱动模拟器的tick循环。 | isPaused, actions.tick |
| Visualizer.tsx | 主视觉区。根据biomeState渲染池塘、生物和环境特效。 | biomeState |
| Dashboard.tsx | 数据仪表盘。使用自定义SVG圆盘仪表盘显示实时生态数据，性能优化优先。 | biomeState |
| Controls.tsx | 互动控制区。根据gameState显示不同的按钮，并调用相应的actions。 | gameState, isPaused, actions |
| EventLog.tsx | 事件日志。根据biomeState的变化，显示对应的叙事文本。 | biomeState |

## 5.0 实施路线图 (Implementation Roadmap)
这是一个分阶段的、可行的开发计划。

里程碑 1: 引擎核心与控制台测试 (1-2周)

任务: 完成 /core 目录下的所有代码。创建一个临时的 main.ts 文件，在其中实例化 SimulationEngine，并用一个 for 循环运行100个tick，将每一步的state打印到console。

目标: 验证生态模型在没有UI的情况下能按预期工作。

里程碑 2: 项目搭建与状态集成 (1周)

任务: 初始化Next.js项目，安装所有依赖，搭建好项目结构。完成 /store/simulationStore.ts 的编写。

目标: 将引擎集成到Zustand store中，并能通过actions控制引擎。

里程碑 3: “只读”UI的实现 (1-2周)

任务: 创建所有UI组件的骨架。将biomeState从store连接到Visualizer和Dashboard组件，实现数据的可视化展示。Dashboard使用轻量级圆盘仪表盘确保性能优化。在PondPage.tsx中用requestAnimationFrame驱动actions.tick。

目标: 能够在屏幕上“看”到模拟的运行，但还不能互动。

里程碑 4: 实现完整交互闭环 (1周)

任务: 完成Controls.tsx组件的逻辑，实现时间控制、干预和修复按钮的功能。实现基于gameState的UI动态切换。

目标: 完成从Stage 1到Stage 4的完整核心玩法循环。

里程碑 5: 美术与体验打磨 (2周)

任务: 根据支柱三的设计，全面应用CSS样式、颜色变量、图标和字体。添加CSS过渡和简单动画，优化用户体验。

目标: 项目达到可对外展示的视觉和体验完成度。