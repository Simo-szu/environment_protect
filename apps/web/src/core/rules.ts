import type { BiomeState, EngineFlags } from './types'

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

export interface TickContext {
  flags: EngineFlags
}

export function initialBiomeState(): BiomeState {
  return {
    tick: 0,
    nutrients: 20,
    dissolvedOxygen: 80,
    waterTurbidity: 15,
    phytoplankton: 25,
    aquaticPlants: 60,
    zooplankton: 30,
    smallFish: 50,
    largeFish: 20,
    decomposers: 40,
  }
}

export function applyAllRules(prev: BiomeState, ctx: TickContext): BiomeState {
  const s = { ...prev }

  // Producers: gentle growth with self-limitation
  let phytoGrowth = 2
  if (s.nutrients > 40) phytoGrowth += 2
  if (s.nutrients > 70) phytoGrowth += 4
  if (s.aquaticPlants > 60) phytoGrowth -= 2
  phytoGrowth -= s.phytoplankton * 0.02 // natural turnover / logistic brake

  let plantGrowth = 1.8
  if (s.nutrients > 30) plantGrowth += 1.5
  if (s.waterTurbidity > 50) plantGrowth -= 3
  if (s.dissolvedOxygen > 60) plantGrowth += 0.5
  plantGrowth -= s.aquaticPlants * 0.01

  s.phytoplankton = clamp(s.phytoplankton + phytoGrowth)
  s.aquaticPlants = clamp(s.aquaticPlants + plantGrowth)

  // Consumers: moderated response with mortality
  let zooGrowth = s.phytoplankton * 0.06 - s.smallFish * 0.07
  zooGrowth -= s.zooplankton * 0.02
  s.zooplankton = clamp(s.zooplankton + zooGrowth)

  let smallGrowth = s.zooplankton * 0.05 - s.largeFish * 0.06 - s.smallFish * 0.01
  if (s.dissolvedOxygen < 40) smallGrowth -= 3
  if (s.dissolvedOxygen < 20) smallGrowth -= 10
  s.smallFish = clamp(s.smallFish + smallGrowth)

  let largeGrowth = s.smallFish * 0.03 - 1.2 - s.largeFish * 0.005
  if (s.dissolvedOxygen < 30) largeGrowth -= 5
  s.largeFish = clamp(s.largeFish + largeGrowth)

  // Decomposition & nutrient cycling: smoother, less aggressive
  const healthScore = 0.5 * s.dissolvedOxygen + 0.25 * (100 - s.nutrients) + 0.25 * (100 - s.waterTurbidity)
  const deadOrganicMatter = (100 - healthScore) / 6
  let decomposersChange = deadOrganicMatter * 0.08 - s.decomposers * 0.02
  s.decomposers = clamp(s.decomposers + decomposersChange)

  // Nutrients: input from decomposers, uptake by producers, slight outflow
  let nutrientsDelta = s.decomposers * 0.07 - (s.phytoplankton * 0.015 + s.aquaticPlants * 0.01) - 0.3
  s.nutrients = clamp(s.nutrients + nutrientsDelta)

  // Oxygen: photosynthesis vs decomposition
  const oxygenFromPhotosynthesis = s.aquaticPlants * 0.09 + s.phytoplankton * 0.05
  const oxygenConsumedByDecomp = s.decomposers * 0.06
  s.dissolvedOxygen = clamp(s.dissolvedOxygen + oxygenFromPhotosynthesis - oxygenConsumedByDecomp)

  // Turbidity: algae & nutrients increase, plants clarify
  let turbidityChange = s.phytoplankton * 0.06 + s.nutrients * 0.03 - s.aquaticPlants * 0.05
  s.waterTurbidity = clamp(s.waterTurbidity + turbidityChange)

  // Restoration tools (softened for gradual feel)
  if (ctx.flags.aeratorActive) {
    s.dissolvedOxygen = clamp(s.dissolvedOxygen + 8)
  }
  if (ctx.flags.bufferActive) {
    s.nutrients = clamp(s.nutrients - 4)
  }

  return s
}

export function applyRunoff(s: BiomeState): BiomeState {
  return { ...s, nutrients: clamp(s.nutrients + 60) }
}

export const clamp01 = clamp
