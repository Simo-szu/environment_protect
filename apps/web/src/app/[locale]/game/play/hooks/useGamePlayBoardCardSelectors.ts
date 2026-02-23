'use client';

import { useMemo } from 'react';
import { GameCardMeta } from '@/lib/api/game';
import { CoreCardAffordability, MetricState, ResourceState, TileSynergyBreakdown, TileSynergyNeighbor } from './gamePlay.shared';

interface UseGamePlayBoardCardSelectorsParams {
  handCore: string[];
  handPolicy: string[];
  catalog: Map<string, GameCardMeta>;
  selectedCoreId: string;
  selectedPolicyId: string;
  selectedTile: string;
  resources: ResourceState;
  metrics: MetricState;
  boardSize: number;
  boardOccupied: Record<string, string>;
  freePlacementEnabled: boolean;
}

export function useGamePlayBoardCardSelectors(params: UseGamePlayBoardCardSelectorsParams) {
  const {
    handCore,
    handPolicy,
    catalog,
    selectedCoreId,
    selectedPolicyId,
    selectedTile,
    resources,
    metrics,
    boardSize,
    boardOccupied,
    freePlacementEnabled
  } = params;

  const handCoreCards = useMemo(
    () => handCore.map((id) => catalog.get(id)).filter(Boolean) as GameCardMeta[],
    [handCore, catalog]
  );

  const handPolicyCards = useMemo(
    () => handPolicy.map((id) => catalog.get(id)).filter(Boolean) as GameCardMeta[],
    [handPolicy, catalog]
  );

  const selectedCoreCard = selectedCoreId ? catalog.get(selectedCoreId) || null : null;
  const selectedPolicyCard = selectedPolicyId ? catalog.get(selectedPolicyId) || null : null;

  const coreAffordabilityMap = useMemo(() => {
    const resourceIndustry = Number(resources.industry ?? 0);
    const resourceTech = Number(resources.tech ?? 0);
    const resourcePopulation = Number(resources.population ?? 0);
    const metricGreen = Number(metrics.green ?? 0);
    const result = new Map<string, CoreCardAffordability>();

    for (const card of handCoreCards) {
      const costIndustry = Number(card.unlockCost?.industry ?? 0);
      const costTech = Number(card.unlockCost?.tech ?? 0);
      const costPopulation = Number(card.unlockCost?.population ?? 0);
      const costGreen = Number(card.unlockCost?.green ?? 0);
      const needIndustry = Math.max(0, costIndustry - resourceIndustry);
      const needTech = Math.max(0, costTech - resourceTech);
      const needPopulation = Math.max(0, costPopulation - resourcePopulation);
      const needGreen = Math.max(0, costGreen - metricGreen);
      result.set(card.cardId, {
        canPlace: needIndustry === 0 && needTech === 0 && needPopulation === 0 && needGreen === 0,
        needIndustry,
        needTech,
        needPopulation,
        needGreen
      });
    }
    return result;
  }, [handCoreCards, resources.industry, resources.tech, resources.population, metrics.green]);

  const selectedCoreAffordability = selectedCoreCard ? coreAffordabilityMap.get(selectedCoreCard.cardId) : null;

  const selectedCorePlacementPreview = useMemo(() => {
    if (!selectedCoreCard) {
      return null;
    }
    const currentIndustry = Number(resources.industry ?? 0);
    const currentTech = Number(resources.tech ?? 0);
    const currentPopulation = Number(resources.population ?? 0);
    const currentGreen = Number(metrics.green ?? 0);
    const currentCarbon = Number(metrics.carbon ?? 0);
    const currentSatisfaction = Number(metrics.satisfaction ?? 0);
    const costIndustry = Number(selectedCoreCard.unlockCost.industry ?? 0);
    const costTech = Number(selectedCoreCard.unlockCost.tech ?? 0);
    const costPopulation = Number(selectedCoreCard.unlockCost.population ?? 0);
    const costGreen = Number(selectedCoreCard.unlockCost.green ?? 0);
    const deltaIndustry = Number(selectedCoreCard.coreContinuousIndustryDelta ?? 0);
    const deltaTech = Number(selectedCoreCard.coreContinuousTechDelta ?? 0);
    const deltaPopulation = Number(selectedCoreCard.coreContinuousPopulationDelta ?? 0);
    const deltaGreen = Number(selectedCoreCard.coreContinuousGreenDelta ?? 0);
    const deltaCarbon = Number(selectedCoreCard.coreContinuousCarbonDelta ?? 0);
    const deltaSatisfaction = Number(selectedCoreCard.coreContinuousSatisfactionDelta ?? 0);
    return {
      industry: currentIndustry - costIndustry + deltaIndustry,
      tech: currentTech - costTech + deltaTech,
      population: currentPopulation - costPopulation + deltaPopulation,
      green: currentGreen - costGreen + deltaGreen,
      carbon: currentCarbon + deltaCarbon,
      satisfaction: currentSatisfaction + deltaSatisfaction,
      delta: {
        industry: deltaIndustry - costIndustry,
        tech: deltaTech - costTech,
        population: deltaPopulation - costPopulation,
        green: deltaGreen - costGreen,
        carbon: deltaCarbon,
        satisfaction: deltaSatisfaction
      }
    };
  }, [selectedCoreCard, resources.industry, resources.tech, resources.population, metrics.green, metrics.carbon, metrics.satisfaction]);

  const selectedCorePreviewReady = Boolean(selectedCoreId && selectedTile && selectedCorePlacementPreview);

  const selectedPolicyImmediateDelta = useMemo(() => {
    if (!selectedPolicyCard) {
      return null;
    }
    return {
      industry: Number(selectedPolicyCard.policyImmediateIndustryDelta ?? 0),
      tech: Number(selectedPolicyCard.policyImmediateTechDelta ?? 0),
      population: Number(selectedPolicyCard.policyImmediatePopulationDelta ?? 0),
      green: Number(selectedPolicyCard.policyImmediateGreenDelta ?? 0),
      carbon: Number(selectedPolicyCard.policyImmediateCarbonDelta ?? 0),
      satisfaction: Number(selectedPolicyCard.policyImmediateSatisfactionDelta ?? 0)
    };
  }, [selectedPolicyCard]);

  const selectedPolicyHasImmediateDelta = useMemo(() => {
    if (!selectedPolicyImmediateDelta) {
      return false;
    }
    return Object.values(selectedPolicyImmediateDelta).some((value) => Number(value) !== 0);
  }, [selectedPolicyImmediateDelta]);

  const selectedPolicyRiskLevel = useMemo<'low' | 'medium' | 'high'>(() => {
    if (!selectedPolicyImmediateDelta) {
      return 'low';
    }
    const positive = Math.max(0, selectedPolicyImmediateDelta.industry)
      + Math.max(0, selectedPolicyImmediateDelta.tech)
      + Math.max(0, selectedPolicyImmediateDelta.population)
      + Math.max(0, selectedPolicyImmediateDelta.green)
      + Math.max(0, selectedPolicyImmediateDelta.satisfaction);
    const carbonUp = Math.max(0, selectedPolicyImmediateDelta.carbon);
    if (carbonUp >= 15) {
      return 'high';
    }
    if (carbonUp >= 8 || positive < 5) {
      return 'medium';
    }
    return 'low';
  }, [selectedPolicyImmediateDelta]);

  const tileAdjacencyScoreMap = useMemo(() => {
    const result = new Map<string, number>();
    if (!selectedCoreId) {
      return result;
    }
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        const key = `${row},${col}`;
        if (boardOccupied[key]) {
          continue;
        }
        let adjacency = 0;
        for (const [dr, dc] of dirs) {
          const neighbor = `${row + dr},${col + dc}`;
          if (boardOccupied[neighbor]) {
            adjacency += 1;
          }
        }
        result.set(key, adjacency);
      }
    }
    return result;
  }, [selectedCoreId, boardSize, boardOccupied]);

  const occupiedTileCount = useMemo(() => Object.keys(boardOccupied).length, [boardOccupied]);
  const adjacencyRequired = !freePlacementEnabled && occupiedTileCount > 0;

  const placeableTileKeySet = useMemo(() => {
    const result = new Set<string>();
    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        const key = `${row},${col}`;
        if (boardOccupied[key]) {
          continue;
        }
        if (!adjacencyRequired) {
          result.add(key);
          continue;
        }
        const adjacency = tileAdjacencyScoreMap.get(key) || 0;
        if (adjacency > 0) {
          result.add(key);
        }
      }
    }
    return result;
  }, [boardSize, boardOccupied, adjacencyRequired, tileAdjacencyScoreMap]);

  const selectedTilePlaceable = selectedTile ? placeableTileKeySet.has(selectedTile) : false;
  const selectedTileAdjacency = selectedTile ? (tileAdjacencyScoreMap.get(selectedTile) || 0) : 0;

  const tileSynergyBreakdownMap = useMemo(() => {
    const result = new Map<string, TileSynergyBreakdown>();
    if (!selectedCoreCard) {
      return result;
    }
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        const key = `${row},${col}`;
        if (boardOccupied[key]) {
          continue;
        }
        const neighbors: TileSynergyNeighbor[] = [];
        for (const [dr, dc] of dirs) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr < 0 || nc < 0 || nr >= boardSize || nc >= boardSize) {
            continue;
          }
          const neighborKey = `${nr},${nc}`;
          const neighborCardId = String(boardOccupied[neighborKey] || '');
          if (!neighborCardId) {
            continue;
          }
          const neighborCard = catalog.get(neighborCardId);
          const neighborDomain = String(neighborCard?.domain || 'unknown');
          const neighborPhase = String(neighborCard?.phaseBucket || 'unknown');
          neighbors.push({
            position: neighborKey,
            cardId: neighborCardId,
            cardName: String(neighborCard?.chineseName || neighborCardId),
            domain: neighborDomain,
            phaseBucket: neighborPhase,
            sameDomain: neighborDomain === selectedCoreCard.domain,
            samePhase: neighborPhase === selectedCoreCard.phaseBucket
          });
        }
        const adjacencyBonus = neighbors.length;
        const sameDomainBonus = neighbors.filter((item) => item.sameDomain).length;
        const samePhaseBonus = neighbors.filter((item) => item.samePhase).length;
        const diversityBonus = new Set(neighbors.map((item) => item.domain)).size >= 2 ? 1 : 0;
        result.set(key, {
          totalScore: adjacencyBonus + sameDomainBonus + samePhaseBonus + diversityBonus,
          adjacencyBonus,
          sameDomainBonus,
          samePhaseBonus,
          diversityBonus,
          neighbors
        });
      }
    }
    return result;
  }, [selectedCoreCard, boardSize, boardOccupied, catalog]);

  const selectedTileSynergyBreakdown = selectedTile ? (tileSynergyBreakdownMap.get(selectedTile) || null) : null;

  const recommendedTile = useMemo(() => {
    if (!selectedCoreId || tileSynergyBreakdownMap.size === 0) {
      return '';
    }
    let bestKey = '';
    let bestScore = -1;
    let bestAdjacency = -1;
    for (const [key, breakdown] of tileSynergyBreakdownMap.entries()) {
      const score = Number(breakdown.totalScore || 0);
      const adjacency = Number(breakdown.adjacencyBonus || 0);
      if (
        score > bestScore
        || (score === bestScore && adjacency > bestAdjacency)
        || (score === bestScore && adjacency === bestAdjacency && key < bestKey)
      ) {
        bestKey = key;
        bestScore = score;
        bestAdjacency = adjacency;
      }
    }
    return bestScore >= 0 ? bestKey : '';
  }, [selectedCoreId, tileSynergyBreakdownMap]);

  return {
    handCoreCards,
    handPolicyCards,
    selectedCoreCard,
    selectedPolicyCard,
    coreAffordabilityMap,
    selectedCoreAffordability,
    selectedCorePlacementPreview,
    selectedCorePreviewReady,
    selectedPolicyImmediateDelta,
    selectedPolicyHasImmediateDelta,
    selectedPolicyRiskLevel,
    tileAdjacencyScoreMap,
    adjacencyRequired,
    placeableTileKeySet,
    selectedTilePlaceable,
    selectedTileAdjacency,
    tileSynergyBreakdownMap,
    selectedTileSynergyBreakdown,
    recommendedTile
  };
}
