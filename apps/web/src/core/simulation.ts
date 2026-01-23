import { applyAllRules, applyRunoff, initialBiomeState } from './rules'
import type { BiomeState, EngineFlags } from './types'

export class SimulationEngine {
  public state: BiomeState
  public flags: EngineFlags

  constructor() {
    this.state = initialBiomeState()
    this.flags = { aeratorActive: false, bufferActive: false }
  }

  tick(): void {
    const next = applyAllRules(this.state, { flags: this.flags })
    this.state = { ...next, tick: this.state.tick + 1 }
  }

  reset(): void {
    this.state = initialBiomeState()
    this.flags = { aeratorActive: false, bufferActive: false }
  }

  applyInterventionRunoff(): void {
    this.state = applyRunoff(this.state)
  }

  setAerator(active: boolean) {
    this.flags.aeratorActive = active
  }

  setBuffer(active: boolean) {
    this.flags.bufferActive = active
  }
}

