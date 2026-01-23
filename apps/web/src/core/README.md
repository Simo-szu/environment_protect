# Core (Simulation Engine)

此目录预留为“生态模拟引擎”的纯 TypeScript 实现（不依赖 React/DOM）。

建议文件：
- `types.ts`：核心类型（BiomeState 等）
- `rules.ts`：每 tick 的规则函数（生产者/消费者/分解/环境变化）
- `simulation.ts`：`SimulationEngine` 类（初始化、tick、干预与修复入口）

注意：当前仅初始化结构，未编写业务代码。

