'use client';

export type UnknownRecord = Record<string, unknown>;
export type PondState = UnknownRecord;

export interface ResourceState extends UnknownRecord {
  industry?: number;
  tech?: number;
  population?: number;
}

export interface MetricState extends UnknownRecord {
  green?: number;
  carbon?: number;
  satisfaction?: number;
}

export interface PendingDiscardState extends UnknownRecord {
  active?: boolean;
  coreRequired?: number;
  policyRequired?: number;
}

export interface TradeRecord extends UnknownRecord {
  turn?: number;
  action?: string;
  amount?: number;
}

export interface CarbonTradeState extends UnknownRecord {
  windowOpened?: boolean;
  lastPrice?: number;
  quota?: number;
  profit?: number;
  history?: TradeRecord[];
}

export interface EventRecord extends UnknownRecord {
  turn?: number;
  eventType?: string;
  remainingTurns?: number;
  resolvedEvent?: string;
  policyId?: string;
}

export interface ComboRecord extends UnknownRecord {
  turn?: number;
  combos?: string[];
}

export interface PolicyRecord extends UnknownRecord {
  policyId?: string;
}

interface DeltaNode extends UnknownRecord {
  delta?: number;
}

export interface SettlementRecord extends UnknownRecord {
  turn?: number;
}

export interface EndingView {
  endingId: string;
  endingName: string;
  imageKey: string;
  reason: string;
  turn: number;
}

export interface TimelineItem {
  key: string;
  turn: number;
  type: 'unlock' | 'combo' | 'event' | 'trade';
  message: string;
}

export type TransitionKind =
  | 'industry_growth'
  | 'green_growth'
  | 'tech_burst'
  | 'satisfaction_growth'
  | 'carbon_optimized'
  | 'balanced_growth'
  | 'carbon_disaster';

export interface TransitionNotice {
  token: number;
  kind: TransitionKind;
  title: string;
  subtitle: string;
  toneClass: string;
  turn: number;
}

export interface GuidedTask {
  id: 'select_core' | 'select_tile' | 'place_core' | 'end_turn';
  title: string;
  detail: string;
}

export interface CoreCardAffordability {
  canPlace: boolean;
  needIndustry: number;
  needTech: number;
  needPopulation: number;
  needGreen: number;
}

export interface TileSynergyNeighbor {
  position: string;
  cardId: string;
  cardName: string;
  domain: string;
  phaseBucket: string;
  sameDomain: boolean;
  samePhase: boolean;
}

export interface TileSynergyBreakdown {
  totalScore: number;
  adjacencyBonus: number;
  sameDomainBonus: number;
  samePhaseBonus: number;
  diversityBonus: number;
  neighbors: TileSynergyNeighbor[];
}

export interface TurnFlowStep {
  id: 'select_core' | 'select_tile' | 'place_core' | 'optional_actions' | 'end_turn';
  label: string;
  done: boolean;
  active: boolean;
}

export type GuidedAction = 'select_core' | 'select_tile' | 'place_core' | 'end_turn' | 'policy' | 'trade';
export type BoardViewMode = 'smart' | 'adjacency' | 'placeable';

export const DEFAULT_STORAGE_BASE = process.env.NEXT_PUBLIC_MINIO_PUBLIC_BASE_URL || 'http://127.0.0.1:9000/youthloop';
export const TURN_ANIMATION_STORAGE_KEY = 'game:turn-transition-animation-enabled';
export const PLAY_ONBOARDING_STORAGE_KEY = 'game:play-onboarding:v1';

export function resolvePolicyHintByEvent(eventType: string): string {
  if (eventType === 'flood') {
    return 'Use card063 or card064 to resolve';
  }
  if (eventType === 'sea_level_rise') {
    return 'Use card062 or card066 to resolve';
  }
  if (eventType === 'citizen_protest') {
    return 'Use card067 or card068 to resolve';
  }
  return 'No policy mapping';
}

export function resolvePolicyIdsByEvent(eventType: string): string[] {
  if (eventType === 'flood') {
    return ['card063', 'card064'];
  }
  if (eventType === 'sea_level_rise') {
    return ['card062', 'card066'];
  }
  if (eventType === 'citizen_protest') {
    return ['card067', 'card068'];
  }
  return [];
}

export function resolveEventLabel(eventType: string): string {
  if (eventType === 'flood') {
    return 'Flood';
  }
  if (eventType === 'sea_level_rise') {
    return 'Sea Level Rise';
  }
  if (eventType === 'citizen_protest') {
    return 'Citizen Protest';
  }
  return eventType;
}

export function resolveComboName(comboId: string): string {
  const names: Record<string, string> = {
    policy_industry_chain: 'Policy + Industry Chain',
    policy_ecology_chain: 'Policy + Ecology Chain',
    policy_science_chain: 'Policy + Science Chain',
    policy_society_chain: 'Policy + Society Chain',
    cross_science_industry: 'Cross Science-Industry',
    cross_industry_ecology: 'Cross Industry-Ecology',
    cross_ecology_society: 'Cross Ecology-Society',
    cross_science_ecology: 'Cross Science-Ecology',
    intra_industry_scale: 'Intra Industry Cluster',
    intra_ecology_restore: 'Intra Ecology Cluster',
    intra_science_boost: 'Intra Science Cluster',
    intra_society_mobilize: 'Intra Society Cluster'
  };
  return names[comboId] || comboId;
}

export function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as UnknownRecord;
}

export function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return error.message;
  }
  const record = asRecord(error);
  const message = record?.message;
  return typeof message === 'string' ? message : null;
}

export function readDelta(entry: UnknownRecord | undefined, section: string, field: string): number {
  const sectionNode = asRecord(entry?.[section]);
  const fieldNode = asRecord(sectionNode?.[field]) as DeltaNode | null;
  const value = Number(fieldNode?.delta ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function resolveTransitionNotice(
  settlement: UnknownRecord | undefined,
  activeEvents: EventRecord[]
): Omit<TransitionNotice, 'token' | 'turn'> {
  const carbonDelta = readDelta(settlement, 'metrics', 'carbon');
  const greenDelta = readDelta(settlement, 'metrics', 'green');
  const satisfactionDelta = readDelta(settlement, 'metrics', 'satisfaction');
  const industryDelta = readDelta(settlement, 'resources', 'industry');
  const techDelta = readDelta(settlement, 'resources', 'tech');
  const growthMax = Math.max(industryDelta, greenDelta, techDelta, satisfactionDelta);
  const carbonDrop = -carbonDelta;

  if (activeEvents.length > 0 || carbonDelta >= 20) {
    return {
      kind: 'carbon_disaster',
      title: 'Carbon Disaster',
      subtitle: 'Emergency pressure is rising',
      toneClass: 'border-rose-300 bg-rose-50 text-rose-700'
    };
  }
  if (industryDelta >= 8 && industryDelta >= growthMax) {
    return {
      kind: 'industry_growth',
      title: 'Industry Growth',
      subtitle: 'Infrastructure momentum accelerated',
      toneClass: 'border-sky-300 bg-sky-50 text-sky-700'
    };
  }
  if (greenDelta >= 6 && greenDelta >= growthMax) {
    return {
      kind: 'green_growth',
      title: 'Green Building Rise',
      subtitle: 'Eco assets expanded this turn',
      toneClass: 'border-emerald-300 bg-emerald-50 text-emerald-700'
    };
  }
  if (techDelta >= 8 && techDelta >= growthMax) {
    return {
      kind: 'tech_burst',
      title: 'Tech Burst',
      subtitle: 'Innovation output spiked',
      toneClass: 'border-violet-300 bg-violet-50 text-violet-700'
    };
  }
  if (satisfactionDelta >= 6 && satisfactionDelta >= growthMax) {
    return {
      kind: 'satisfaction_growth',
      title: 'Citizen Confidence',
      subtitle: 'Public support improved',
      toneClass: 'border-amber-300 bg-amber-50 text-amber-700'
    };
  }
  if (carbonDrop >= 8 && carbonDrop >= growthMax) {
    return {
      kind: 'carbon_optimized',
      title: 'Carbon Optimization',
      subtitle: 'Emission reduction was effective',
      toneClass: 'border-teal-300 bg-teal-50 text-teal-700'
    };
  }
  return {
    kind: 'balanced_growth',
    title: 'Balanced Development',
    subtitle: 'All systems moved steadily',
    toneClass: 'border-slate-300 bg-slate-50 text-slate-700'
  };
}
