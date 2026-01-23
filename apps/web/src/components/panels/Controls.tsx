"use client"

import { useSimulationStore } from '@/store/simulationStore'
import thresholds from '@/app/assets/tokens/thresholds.json'
import { Button } from '@/components/ui/button'
import { Pause, Play, FastForward, Info } from 'lucide-react'

export default function Controls() {
  const gameStage = useSimulationStore((s) => s.gameStage)
  const isPaused = useSimulationStore((s) => s.isPaused)
  const speed = useSimulationStore((s) => s.speed)
  const actions = useSimulationStore((s) => s.actions)
  const engine = useSimulationStore((s) => s.engine)

  return (
    <div className="w-full rounded-xl border bg-white p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">阶段：{stageLabel(gameStage)}</div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => actions.togglePause()}>
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="ml-1">{isPaused ? '播放' : '暂停'}</span>
          </Button>
          <Button variant={speed === 'FAST' ? 'default' : 'outline'} size="sm" onClick={() => actions.setSpeed(speed === 'FAST' ? 'NORMAL' : 'FAST')}>
            <FastForward className="w-4 h-4" />
            <span className="ml-1">快进</span>
          </Button>
        </div>
      </div>

      {gameStage === 'OBSERVING' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600">准备好后进入“干预”阶段</div>
          <Button onClick={() => actions.toStage('INTERVENING')}>进入干预</Button>
        </div>
      )}

      {gameStage === 'INTERVENING' && (
        <div className="flex items-center justify-between">
          <div className="text-sm">一次性引入农业径流（营养+60）</div>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => { actions.applyRunoff(); actions.toStage('WITNESSING') }}>引入农业径流</Button>
          </div>
        </div>
      )}

      {gameStage === 'WITNESSING' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600">时间以 10x 加速推进 {thresholds.time.witnessYears} 年……</div>
          <Button variant="outline" onClick={() => actions.toStage('RESTORING')}>跳过见证</Button>
        </div>
      )}

      {gameStage === 'RESTORING' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">修复工具</div>
            <Info className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="flex gap-2">
            <Button variant={engine.flags.aeratorActive ? 'default' : 'outline'} onClick={() => actions.setAerator(!engine.flags.aeratorActive)}>
              {engine.flags.aeratorActive ? '✅ 曝气机开启' : '启用曝气机'}
            </Button>
            <Button variant={engine.flags.bufferActive ? 'default' : 'outline'} onClick={() => actions.setBuffer(!engine.flags.bufferActive)}>
              {engine.flags.bufferActive ? '✅ 河岸缓冲带开启' : '种植河岸缓冲带'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function stageLabel(s: string) {
  switch (s) {
    case 'OBSERVING':
      return '观察'
    case 'INTERVENING':
      return '干预'
    case 'WITNESSING':
      return '见证'
    case 'RESTORING':
      return '修复'
    default:
      return s
  }
}

