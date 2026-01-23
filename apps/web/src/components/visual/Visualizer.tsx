"use client"

import { useRef, useEffect, memo, useMemo } from 'react'
import Image from 'next/image'
import colors from '@/app/assets/tokens/colors.json'
import { useUIState, useSimulationStore, usePerformanceState, evaluateTheme } from '@/store/simulationStore'
import thresholds from '@/app/assets/tokens/thresholds.json'
import { FishManager } from './FishManager'

function Visualizer() {
  // 使用throttled UI状态，确保30fps平滑渲染
  const { biomeState } = useUIState()
  const performance = usePerformanceState()
  const engine = useSimulationStore((s) => s.engine)

  // 使用useMemo缓存主题计算，避免每次渲染都重新计算
  const theme = useMemo(() => evaluateTheme(biomeState), [biomeState])

  // 性能监控（仅在开发环境）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 16.67) { // 超过一帧的时间
            console.warn(`Performance warning: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });

      return () => observer.disconnect();
    }
  }, [])

  // 鱼类管理器引用
  const fishContainerRef = useRef<HTMLDivElement>(null)
  const fishManagerRef = useRef<FishManager | null>(null)

  // 使用useMemo缓存颜色计算
  const { palette, waterColor, plantColor } = useMemo(() => {
    const paletteData = (colors as any).palette[theme]
    return {
      palette: paletteData,
      waterColor: paletteData.water as string,
      plantColor: paletteData.plant as string
    }
  }, [theme])

  const showAlgae = (() => {
    const cfg = thresholds.visuals.algaeOverlay as any
    if (!cfg) return false
    if (cfg.logic === 'OR') {
      return biomeState.phytoplankton >= (cfg.phytoplanktonMin ?? 999) || biomeState.waterTurbidity >= (cfg.waterTurbidityMin ?? 999)
    }
    return biomeState.phytoplankton >= (cfg.phytoplanktonMin ?? 999) && biomeState.waterTurbidity >= (cfg.waterTurbidityMin ?? 999)
  })()

  const showBubbles = engine.flags.aeratorActive === true

  // derive opacity from turbidity (0..100 -> 0.2 .. 0.95)
  const opacity = Math.min(0.9, 0.35 + biomeState.waterTurbidity * 0.005)

  // 初始化鱼类管理器
  useEffect(() => {
    if (fishContainerRef.current && !fishManagerRef.current) {
      fishManagerRef.current = new FishManager(fishContainerRef.current)
      fishManagerRef.current.createFish(15) // 创建15条鱼
    }

    return () => {
      if (fishManagerRef.current) {
        fishManagerRef.current.destroy()
        fishManagerRef.current = null
      }
    }
  }, [])

  // 更新鱼类健康状态和数量（只根据生态状态）
  useEffect(() => {
    if (fishManagerRef.current) {
      fishManagerRef.current.updateFishHealth(theme as 'healthy' | 'polluted' | 'collapsed')
      // 鱼群变化只根据生态状态，与性能无关
      fishManagerRef.current.setEcologicalState(theme as 'healthy' | 'polluted' | 'collapsed', biomeState)
    }
  }, [theme, biomeState.smallFish])

  // 根据性能状态调整动画质量（只影响动画，不影响鱼群数量）
  useEffect(() => {
    if (fishManagerRef.current) {
      // 性能调整只影响动画质量，绝不影响鱼群的存在
      fishManagerRef.current.setPerformanceQuality(performance.animationQuality)
    }
  }, [performance.animationQuality])

  // derive counts for fish/plants (coarse, not exact)
  const plants = Math.round(biomeState.aquaticPlants / 20)
  const smallFish = Math.round(biomeState.smallFish / 20)
  const largeFish = Math.round(biomeState.largeFish / 20)

  // 性能自适应的CSS类名
  const animationQualityClass = `animation-quality-${performance.animationQuality}`

  return (
    <div className={`relative w-full h-[420px] rounded-xl overflow-hidden border bg-[--ui-panel] ${animationQualityClass}`}>
      {/* Background illustration */}
      <div className="absolute inset-0">
        <Image src="/assets/svg/pond-background.svg" alt="pond background" fill priority style={{ objectFit: 'cover' }} />
      </div>

      {/* Water layer */}
      <div
        className={`absolute inset-0 ${theme === 'collapsed' ? 'water-turbulent' : 'water-surface'}`}
        style={{ backgroundColor: waterColor, opacity }}
      />

      {/* Algae overlay */}
      {showAlgae && (
        <div className="absolute inset-0 opacity-60 algae-cluster">
          <Image src="/assets/svg/algae-overlay.svg" alt="algae" fill style={{ objectFit: 'cover' }} />
        </div>
      )}

      {/* Bubbles overlay (aerator) */}
      {showBubbles && (
        <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none">
          <div className="bubble">
            <Image src="/assets/svg/aerator-bubbles.svg" alt="bubbles" fill style={{ objectFit: 'cover', opacity: 0.6 }} />
          </div>
        </div>
      )}

      {/* Plants */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-around p-4">
        {Array.from({ length: Math.max(0, Math.min(plants, 6)) }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <PlantIcon key={`p-${i}`} color={plantColor} biomeState={biomeState} theme={theme} />
        ))}
      </div>

      {/* Fish */}
      <div className="absolute inset-0">
        {/* small fish */}
        {Array.from({ length: Math.max(0, Math.min(smallFish, 8)) }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <FishSmall
            key={`sf-${i}`}
            left={(i * 12 + 10) % 90}
            top={20 + (i * 7) % 60}
            biomeState={biomeState}
            theme={theme}
          />
        ))}
        {/* large fish */}
        {Array.from({ length: Math.max(0, Math.min(largeFish, 4)) }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <FishLarge
            key={`lf-${i}`}
            left={(i * 25 + 5) % 90}
            top={30 + (i * 12) % 50}
            biomeState={biomeState}
            theme={theme}
          />
        ))}
      </div>

      {/* Fish container */}
      <div
        ref={fishContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'hidden', zIndex: 15 }}
      />

      {/* HUD minimal text with performance info */}
      <div className="absolute top-2 left-2 text-xs rounded bg-white/70 px-2 py-1 text-neutral-800">
        <span>Tick: {biomeState.tick} | Theme: {theme}</span>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-1 text-[10px] text-neutral-600">
            FPS: {performance.currentFPS} | Quality: {performance.animationQuality}
            {performance.isChartUpdating && ' | Chart Updating'}
          </div>
        )}
      </div>
    </div>
  )}

// Helper function to determine organism health state
function getOrganismState(biomeState: any, theme: string) {
  if (theme === 'healthy') return 'healthy'
  if (theme === 'polluted') return 'sick'
  return 'dead' // collapsed theme
}

function PlantIcon({ color, biomeState, theme }: { color: string; biomeState: any; theme: string }) {
  const state = getOrganismState(biomeState, theme)
  const plantSrc = state === 'healthy'
    ? '/assets/svg/plant-01.svg'
    : state === 'sick'
    ? '/assets/svg/plant-01-sick.svg'
    : '/assets/svg/plant-01-dead.svg'

  const animationClass = state === 'healthy'
    ? 'plant-healthy'
    : state === 'sick'
    ? 'plant-sick'
    : 'plant-dead'

  return (
    <div style={{ color }} className={animationClass}>
      <Image src={plantSrc} alt={`${state} plant`} width={32} height={64} />
    </div>
  )
}

function FishSmall({ left, top, biomeState, theme }: { left: number; top: number; biomeState: any; theme: string }) {
  const state = getOrganismState(biomeState, theme)
  const fishSrc = state === 'healthy'
    ? '/assets/svg/fish-small.svg'
    : state === 'sick'
    ? '/assets/svg/fish-small-sick.svg'
    : '/assets/svg/fish-small-dead.svg'

  const animationClass = state === 'healthy'
    ? 'fish-healthy'
    : state === 'sick'
    ? 'fish-sick'
    : 'fish-dead'

  return (
    <div className={`absolute ${animationClass}`} style={{ left: `${left}%`, top: `${top}%` }}>
      <Image src={fishSrc} alt={`${state} small fish`} width={28} height={18} />
    </div>
  )
}

function FishLarge({ left, top, biomeState, theme }: { left: number; top: number; biomeState: any; theme: string }) {
  const state = getOrganismState(biomeState, theme)
  // For now, we only have healthy large fish, but we can extend this
  const fishSrc = '/assets/svg/fish-large.svg'

  const animationClass = state === 'healthy'
    ? 'fish-healthy'
    : state === 'sick'
    ? 'fish-sick'
    : 'fish-dead'

  return (
    <div className={`absolute ${animationClass}`} style={{ left: `${left}%`, top: `${top}%` }}>
      <Image src={fishSrc} alt={`${state} large fish`} width={40} height={22} />
    </div>
  )
}

// 使用React.memo优化渲染性能
export default memo(Visualizer)
