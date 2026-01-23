"use client"

import { useUIState, evaluateTheme } from '@/store/simulationStore'
import { useMemo, memo } from 'react'
import colors from '@/app/assets/tokens/colors.json'

// 圆盘仪表盘组件
function CircularGauge({
  value,
  max,
  label,
  color,
  unit = ''
}: {
  value: number
  max: number
  label: string
  color: string
  unit?: string
}) {
  const percentage = Math.min(Math.max(value / max, 0), 1)

  // 根据数值确定状态颜色
  const getStatusColor = () => {
    if (percentage > 0.7) return '#10b981' // 绿色 - 良好
    if (percentage > 0.3) return '#f59e0b' // 黄色 - 警告
    return '#ef4444' // 红色 - 危险
  }

  const statusColor = getStatusColor()

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-20 h-20">
        {/* 背景圆弧 */}
        <svg className="w-full h-full transform -rotate-45" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
            strokeDasharray="164.9 54.9" // 270° 弧长
            strokeLinecap="round"
          />
          {/* 数值弧 */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke={statusColor}
            strokeWidth="6"
            strokeDasharray={`${164.9 * percentage} ${164.9 * (1 - percentage) + 54.9}`}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* 中心数值 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold" style={{ color: statusColor }}>
            {Math.round(value)}
          </span>
          {unit && (
            <span className="text-[10px] text-gray-500">{unit}</span>
          )}
        </div>
      </div>

      {/* 标签 */}
      <div className="text-center">
        <div className="text-xs font-medium text-gray-700">{label}</div>
        <div className="text-[10px] text-gray-500">/ {max}</div>
      </div>
    </div>
  )
}

function Dashboard() {
  // 使用throttled UI状态，确保30fps平滑渲染
  const { biomeState } = useUIState()

  // 缓存主题和颜色计算
  const theme = useMemo(() => evaluateTheme(biomeState), [biomeState])
  const themeColors = useMemo(() => colors.palette[theme], [theme])
  return (
    <div className="bg-white rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">生态监测</h2>
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeColors.accent }}
          title={`当前状态: ${theme}`}
        />
      </div>

      {/* 三个圆盘仪表盘 */}
      <div className="grid grid-cols-3 gap-2">
        <CircularGauge
          value={biomeState.smallFish}
          max={100}
          label="小型鱼类"
          color="#28a745"
          unit="只"
        />
        <CircularGauge
          value={biomeState.dissolvedOxygen}
          max={100}
          label="溶解氧"
          color="#1e90ff"
          unit="mg/L"
        />
        <CircularGauge
          value={biomeState.nutrients}
          max={100}
          label="营养物"
          color="#6f42c1"
          unit="mg/L"
        />
      </div>

      {/* 状态指示器 */}
      <div className="flex items-center justify-center space-x-3 text-[10px] text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>良好</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          <span>警告</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          <span>危险</span>
        </div>
      </div>
    </div>
  )
}

// 使用React.memo优化渲染性能，只有props变化时才重新渲染
export default memo(Dashboard)
