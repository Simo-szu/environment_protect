/**
 * Game API.
 */

import { apiGet, apiPost } from '../api-client';
import { PageResponse } from '../api-types';

export interface GameCardUnlockCost {
  industry: number;
  tech: number;
  population: number;
  green: number;
}

export interface GameCardUpgradeRequirement {
  fromStar?: number;
  toStar?: number;
  reqDomain1?: 'industry' | 'ecology' | 'science' | 'society';
  reqDomain1MinPct?: number;
  reqDomain2?: 'industry' | 'ecology' | 'science' | 'society';
  reqDomain2MinPct?: number;
  costIndustry?: number;
  costTech?: number;
  costPopulation?: number;
  costGreen?: number;
  ruleJson?: Record<string, unknown>;
  costJson?: Record<string, unknown>;
  configSnapshot?: Record<string, unknown>;
}

export interface GameCardMeta {
  cardId: string;
  cardNo: number;
  chineseName: string;
  englishName: string;
  cardType: 'core' | 'policy';
  domain: 'industry' | 'ecology' | 'science' | 'society' | 'policy';
  star: number;
  phaseBucket: 'early' | 'mid' | 'late' | 'policy';
  unlockCost: GameCardUnlockCost;
  imageKey: string;
  advancedImageKey?: string;
  coreContinuousIndustryDelta?: number;
  coreContinuousTechDelta?: number;
  coreContinuousPopulationDelta?: number;
  coreContinuousGreenDelta?: number;
  coreContinuousCarbonDelta?: number;
  coreContinuousSatisfactionDelta?: number;
  policyImmediateIndustryDelta?: number;
  policyImmediateTechDelta?: number;
  policyImmediatePopulationDelta?: number;
  policyImmediateGreenDelta?: number;
  policyImmediateCarbonDelta?: number;
  policyImmediateSatisfactionDelta?: number;
  policyImmediateQuotaDelta?: number;
  policyImmediateGroup?: string;
  policyImmediateTurns?: number;
  policyContinuousIndustryDelta?: number;
  policyContinuousTechDelta?: number;
  policyContinuousPopulationDelta?: number;
  policyContinuousGreenDelta?: number;
  policyContinuousCarbonDelta?: number;
  policyContinuousSatisfactionDelta?: number;
  policyContinuousLowCarbonDelta?: number;
  policyContinuousGreenPct?: number;
  policyContinuousTechPct?: number;
  policyContinuousPopulationPct?: number;
  policyContinuousIndustryPct?: number;
  policyContinuousIndustryCarbonReductionPct?: number;
  policyImmediateEffect?: Record<string, unknown>;
  policyContinuousEffect?: Record<string, unknown>;
  policyImmediateExt?: Record<string, unknown>;
  policyContinuousExt?: Record<string, unknown>;
  coreImmediateIndustryDelta?: number;
  coreImmediateTechDelta?: number;
  coreImmediatePopulationDelta?: number;
  coreImmediateGreenDelta?: number;
  coreImmediateCarbonDelta?: number;
  coreImmediateSatisfactionDelta?: number;
  coreImmediateQuotaDelta?: number;
  coreImmediateComboPct?: number;
  coreImmediateIndustryCarbonDelta?: number;
  coreImmediateIndustryCarbonReductionPct?: number;
  coreImmediateEffect?: Record<string, unknown>;
  coreImmediateExt?: Record<string, unknown>;
  coreDomainProgressBonus?: number;
  coreContinuousQuotaDelta?: number;
  coreContinuousLowCarbonDelta?: number;
  coreContinuousIndustryPct?: number;
  coreContinuousTechPct?: number;
  coreContinuousPopulationPct?: number;
  coreContinuousGreenPct?: number;
  coreContinuousGlobalPct?: number;
  coreContinuousLowCarbonPct?: number;
  coreContinuousIndustryCarbonReductionPct?: number;
  coreContinuousCarbonDeltaReductionPct?: number;
  coreContinuousTradePricePct?: number;
  coreContinuousComboPct?: number;
  coreContinuousSciencePct?: number;
  coreContinuousSharedMobilityPct?: number;
  coreContinuousCrossDomainCarbonDelta?: number;
  coreContinuousCrossDomainComboPct?: number;
  coreContinuousIndustryCarbonOffset?: number;
  coreContinuousEffect?: Record<string, unknown>;
  coreContinuousExt?: Record<string, unknown>;
  coreConditionMinTurn?: number;
  coreConditionMinIndustryResource?: number;
  coreConditionMinTechResource?: number;
  coreConditionMinCarbon?: number;
  coreConditionMaxCarbon?: number;
  coreConditionMinIndustryCards?: number;
  coreConditionMinEcologyCards?: number;
  coreConditionMinScienceCards?: number;
  coreConditionMinSocietyCards?: number;
  coreConditionMinIndustryProgressPct?: number;
  coreConditionMinGreen?: number;
  coreConditionMinPopulation?: number;
  coreConditionMinSatisfaction?: number;
  coreConditionMinSocietyProgressPct?: number;
  coreConditionMinTaggedCards?: number;
  coreConditionRequiredTag?: string;
  coreConditionEffect?: Record<string, unknown>;
  coreConditionExt?: Record<string, unknown>;
  coreSpecialEcologyCardCostReductionPct?: number;
  coreSpecialScienceCardCostReductionPct?: number;
  coreSpecialFloodResistancePct?: number;
  coreSpecialNewEnergyIndustryPct?: number;
  coreSpecialEcologyCarbonSinkPerTenGreen?: number;
  coreSpecialEcologyCarbonSinkBaseGreen?: number;
  coreSpecialEcologyCarbonSinkPct?: number;
  coreSpecialUpgradeCostReductionPct?: number;
  coreSpecialEffect?: Record<string, unknown>;
  coreSpecialExt?: Record<string, unknown>;
  upgradeDeltaIndustry?: number;
  upgradeDeltaTech?: number;
  upgradeDeltaPopulation?: number;
  upgradeDeltaGreen?: number;
  upgradeDeltaCarbon?: number;
  upgradeDeltaSatisfaction?: number;
  upgradeDeltaQuota?: number;
  upgradeDeltaLowCarbon?: number;
  upgradeDeltaSectorProgressPct?: number;
  upgradeDeltaIndustryPct?: number;
  upgradeDeltaGreenPct?: number;
  upgradeDeltaGlobalPct?: number;
  upgradeDeltaTechPct?: number;
  upgradeDeltaIndustryCarbonReductionPct?: number;
  upgradeDeltaCarbonDeltaReductionPct?: number;
  upgradeDeltaTradePricePct?: number;
  upgradeDeltaComboPct?: number;
  upgradeDeltaSharedMobilityPct?: number;
  upgradeDeltaEcologyCardCostPct?: number;
  upgradeDeltaScienceCardCostPct?: number;
  upgradeDeltaFloodResistancePct?: number;
  upgradeDeltaNewEnergyPct?: number;
  upgradeDeltaEcologySink?: number;
  upgradeDeltaTradUpgradePct?: number;
  upgradeDeltaUpgradeCostPct?: number;
  upgradeEffect?: Record<string, unknown>;
  upgradeExt?: Record<string, unknown>;
  upgradeRequirement?: GameCardUpgradeRequirement;
}

export interface GameCardCatalog {
  items: GameCardMeta[];
}

export interface GameSession {
  id: string;
  userId: string | null;
  pondState: Record<string, unknown>;
  score: number;
  level: number;
  startedAt: string;
  lastActionAt: string;
  status: number;
}

export interface GameActionResponse {
  newPondState: Record<string, unknown>;
  pointsEarned: number;
  totalScore: number;
  newLevel: number;
  message: string;
  sessionEnded?: boolean;
  endingId?: string;
  endingName?: string;
  endingImageKey?: string;
}

export interface GameActionLogItem {
  id: string;
  sessionId: string;
  userId: string;
  actionType: number;
  actionData?: Record<string, unknown>;
  pointsEarned: number;
  createdAt: string;
}

export async function listCards(includePolicy: boolean = true): Promise<GameCardCatalog> {
  return apiGet<GameCardCatalog>('/api/v1/game/cards', { includePolicy });
}

export async function startSession(): Promise<GameSession> {
  return apiPost<GameSession>('/api/v1/game/sessions/start', {}, true);
}

export async function getCurrentSession(): Promise<GameSession> {
  return apiGet<GameSession>('/api/v1/game/sessions/current');
}

export async function getSessionById(sessionId: string): Promise<GameSession> {
  return apiGet<GameSession>(`/api/v1/game/sessions/${sessionId}`);
}

export async function listSessionActions(
  sessionId: string,
  page: number = 1,
  size: number = 50
): Promise<PageResponse<GameActionLogItem>> {
  return apiGet<PageResponse<GameActionLogItem>>(`/api/v1/game/sessions/${sessionId}/actions`, { page, size });
}

export async function performAction(payload: {
  sessionId: string;
  actionType: number;
  actionData?: Record<string, unknown>;
}): Promise<GameActionResponse> {
  return apiPost<GameActionResponse>('/api/v1/game/actions', payload, true);
}

export async function tradeCarbon(payload: {
  sessionId: string;
  tradeType: 'buy' | 'sell';
  amount: number;
}): Promise<GameActionResponse> {
  return performAction({
    sessionId: payload.sessionId,
    actionType: 4,
    actionData: {
      tradeType: payload.tradeType,
      amount: payload.amount,
    },
  });
}

export async function endSession(sessionId: string): Promise<GameActionResponse> {
  return apiPost<GameActionResponse>(`/api/v1/game/sessions/${sessionId}/end`, {}, true);
}

export async function removeCoreCard(payload: {
  sessionId: string;
  row: number;
  col: number;
}): Promise<GameActionResponse> {
  return performAction({
    sessionId: payload.sessionId,
    actionType: 6,
    actionData: {
      row: payload.row,
      col: payload.col,
    },
  });
}
