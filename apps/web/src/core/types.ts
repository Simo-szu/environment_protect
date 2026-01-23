export type GameStage = 'OBSERVING' | 'INTERVENING' | 'WITNESSING' | 'RESTORING'

export interface BiomeState {
  tick: number
  nutrients: number
  dissolvedOxygen: number
  waterTurbidity: number
  phytoplankton: number
  aquaticPlants: number
  zooplankton: number
  smallFish: number
  largeFish: number
  decomposers: number
}

export interface EngineFlags {
  aeratorActive: boolean
  bufferActive: boolean
}

export interface SimulationSnapshot extends BiomeState {}

export interface EventItem {
  key: string
  severity: 'event' | 'warn' | 'disaster'
  text: string
  tick: number
}

export interface ThemeName {
  theme: 'healthy' | 'polluted' | 'collapsed'
}

export interface VisualTheme {
  name: 'healthy' | 'polluted' | 'collapsed'
  colors: {
    sky: string
    water: string
    plant: string
    accent: string
  }
}

export type SpeedMode = 'NORMAL' | 'FAST'

