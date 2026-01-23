"use client"

import { useEffect } from 'react'
import colors from '@/app/assets/tokens/colors.json'
import { useSimulationStore, evaluateTheme } from '@/store/simulationStore'

export default function ThemeColors() {
  const biome = useSimulationStore((s) => s.biomeState)
  const theme = evaluateTheme(biome)
  useEffect(() => {
    const root = document.documentElement
    const palette = (colors as any).palette
    const ui = palette.ui
    const t = palette[theme]
    if (!t || !ui) return
    root.style.setProperty('--color-sky', t.sky)
    root.style.setProperty('--color-water', t.water)
    root.style.setProperty('--color-plant', t.plant)
    if (t.land) root.style.setProperty('--color-land', t.land)
    root.style.setProperty('--color-accent', t.accent)
    root.style.setProperty('--ui-bg', ui.background)
    root.style.setProperty('--ui-panel', ui.panel)
    root.style.setProperty('--ui-text', ui.text)
    root.style.setProperty('--ui-text-secondary', ui.textSecondary)
  }, [theme])
  return null
}

