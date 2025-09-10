"use client"

import { useEffect, useState } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import modals from '@/app/assets/content/modals.zh.json'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function StageModals() {
  const gameStage = useSimulationStore((s) => s.gameStage)
  const actions = useSimulationStore((s) => s.actions)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    // open modal on stage change
    setOpen(true)
  }, [gameStage])

  const cfg = getModalCfg(gameStage)
  if (!cfg) return null

  const onPrimary = () => {
    if (gameStage === 'OBSERVING') {
      // 开始观察阶段
      setOpen(false)
    } else if (gameStage === 'INTERVENING') {
      // 引入农业径流并进入见证阶段
      actions.applyRunoff()
      actions.toStage('WITNESSING')
      setOpen(false)
    } else if (gameStage === 'WITNESSING') {
      // 开始见证阶段（自动10倍速）
      actions.setSpeed('FAST')
      setOpen(false)
    } else if (gameStage === 'RESTORING') {
      // 开始修复阶段
      setOpen(false)
    }
  }

  const onSecondary = () => {
    if (gameStage === 'INTERVENING') {
      // "再想想" - 回到观察阶段
      actions.toStage('OBSERVING')
      setOpen(false)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cfg.title}</DialogTitle>
          <DialogDescription className="text-base text-neutral-700 whitespace-pre-line">{cfg.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {cfg.secondaryCta && (
            <Button variant="outline" onClick={onSecondary}>{cfg.secondaryCta}</Button>
          )}
          <Button onClick={onPrimary}>{cfg.primaryCta}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getModalCfg(stage: string) {
  const m: any = modals
  if (stage === 'OBSERVING') return m.stage1
  if (stage === 'INTERVENING') return m.stage2
  if (stage === 'WITNESSING') return m.stage3
  if (stage === 'RESTORING') return m.stage4
  return null
}

