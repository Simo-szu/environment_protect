/**
 * Game API.
 */

import { apiGet, apiPost } from '../api-client';

export interface GameCardUnlockCost {
  industry: number;
  tech: number;
  population: number;
  green: number;
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
