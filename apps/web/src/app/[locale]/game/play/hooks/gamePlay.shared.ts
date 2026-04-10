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
  lowCarbonScore?: number;
}

export interface LowCarbonScoreBreakdown extends UnknownRecord {
  baseCards?: number;
  latePhaseBonus?: number;
  domainBonus?: number;
  policyUnlockScore?: number;
  policyUnlockAllBonus?: number;
  eventResolveScore?: number;
  eventUnresolvedPenalty?: number;
  carbonTierScore?: number;
  overLimitPenalty?: number;
  tradeProfitScore?: number;
  quotaPenalty?: number;
  invalidPenalty?: number;
  scoreBeforeBonuses?: number;
  settlementBonus?: number;
  phaseMatchBonus?: number;
  percentageBonus?: number;
  rawTotal?: number;
  finalTotal?: number;
  target?: number;
  gapToTarget?: number;
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
  hasPlaceableTile: boolean;
  blockedReason: 'none' | 'insufficient_resources' | 'no_placeable_tile';
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

export const DEFAULT_STORAGE_BASE = '';
export const TURN_ANIMATION_STORAGE_KEY = 'game:turn-transition-animation-enabled';
export const PLAY_ONBOARDING_STORAGE_KEY = 'game:play-onboarding:v1';
export const GAME_SESSION_STORAGE_KEY = 'game:lastSessionId';

export function readStoredGameSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const savedId = window.localStorage.getItem(GAME_SESSION_STORAGE_KEY) || '';
    if (savedId) {
      return savedId;
    }
    return window.sessionStorage.getItem(GAME_SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function writeStoredGameSessionId(sessionId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (sessionId) {
      window.localStorage.setItem(GAME_SESSION_STORAGE_KEY, sessionId);
      window.sessionStorage.setItem(GAME_SESSION_STORAGE_KEY, sessionId);
    } else {
      window.localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
      window.sessionStorage.removeItem(GAME_SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures in private or restricted browsing modes.
  }
}

export function clearStoredGameSessionId(): void {
  writeStoredGameSessionId('');
}

export function resolvePolicyHintByEvent(eventType: string): string {
  if (eventType === 'flood') {
    return 'Use card063, card064 or card061 to resolve';
  }
  if (eventType === 'sea_level_rise') {
    return 'Use card062, card066 or card061 to resolve';
  }
  if (eventType === 'citizen_protest') {
    return 'Use card067, card068 or card061 to resolve';
  }
  if (eventType === 'negative_ecology_warning') {
    return 'Use card064 to resolve';
  }
  if (eventType === 'negative_industrial_carbon_abnormal') {
    return 'Use card062 to resolve';
  }
  return 'No policy mapping';
}

export function resolvePolicyIdsByEvent(eventType: string): string[] {
  if (eventType === 'flood') {
    return ['card063', 'card064', 'card061'];
  }
  if (eventType === 'sea_level_rise') {
    return ['card062', 'card066', 'card061'];
  }
  if (eventType === 'citizen_protest') {
    return ['card067', 'card068', 'card061'];
  }
  if (eventType === 'negative_ecology_warning') {
    return ['card064'];
  }
  if (eventType === 'negative_industrial_carbon_abnormal') {
    return ['card062'];
  }
  return [];
}

export function resolveEventLabel(eventType: string, locale?: string): string {
  const zh = locale === 'zh' || !locale;
  const labels: Record<string, [string, string]> = {
    flood: ['内涝', 'Flood'],
    sea_level_rise: ['海平面上升', 'Sea Level Rise'],
    citizen_protest: ['市民抗议', 'Citizen Protest'],
    negative_ecology_warning: ['生态破坏预警', 'Ecology Warning'],
    negative_high_carbon_industry: ['工业碳排放异常', 'High Carbon Industry'],
    positive_ecology_sink_growth: ['生态碳汇增值', 'Ecology Carbon Sink Growth'],
  };
  labels.negative_industrial_carbon_abnormal = labels.negative_high_carbon_industry;
  const pair = labels[eventType];
  if (pair) {
    return zh ? pair[0] : pair[1];
  }
  return eventType;
}

export function resolveComboName(comboId: string, locale?: string): string {
  const zh = locale === 'zh' || !locale;
  const names: Record<string, [string, string]> = {
    policy_industry_chain: ['政策×产业联动', 'Policy + Industry Chain'],
    policy_ecology_chain: ['政策×生态联动', 'Policy + Ecology Chain'],
    policy_science_chain: ['政策×科创联动', 'Policy + Science Chain'],
    policy_society_chain: ['政策×社会联动', 'Policy + Society Chain'],
    cross_science_industry: ['科创×产业跨板块', 'Cross Science-Industry'],
    cross_industry_ecology: ['产业×生态跨板块', 'Cross Industry-Ecology'],
    cross_ecology_society: ['生态×社会跨板块', 'Cross Ecology-Society'],
    cross_science_ecology: ['科创×生态跨板块', 'Cross Science-Ecology'],
    intra_industry_scale: ['产业板块集群', 'Intra Industry Cluster'],
    intra_ecology_restore: ['生态板块集群', 'Intra Ecology Cluster'],
    intra_science_boost: ['科创板块集群', 'Intra Science Cluster'],
    intra_society_mobilize: ['社会板块集群', 'Intra Society Cluster'],
  };
  const pair = names[comboId];
  if (pair) return zh ? pair[0] : pair[1];
  return comboId;
}

export function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as UnknownRecord;
}

export function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return normalizeErrorMessage(error.message);
  }
  const record = asRecord(error);
  const message = record?.message;
  if (typeof message === 'string') {
    return normalizeErrorMessage(message);
  }
  return null;
}

export function isConnectionIssueMessage(message: string | null | undefined): boolean {
  if (!message) {
    return false;
  }
  const lower = message.toLowerCase();
  return lower.includes('connection to game service failed')
    || lower.includes('err_connection_refused')
    || lower.includes('failed to fetch')
    || lower.includes('networkerror')
    || lower.includes('fetch failed')
    || lower.includes('network request failed')
    || lower.includes('econnrefused')
    || lower.includes('service unavailable')
    || /^http_5\d\d$/.test(lower);
}

function normalizeErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return 'Request failed. Please try again.';
  }

  const lower = trimmed.toLowerCase();
  if (isConnectionIssueMessage(lower)) {
    return 'Connection to game service failed. Please retry in a moment.';
  }

  return trimmed;
}

export function readDelta(entry: UnknownRecord | undefined, section: string, field: string): number {
  const sectionNode = asRecord(entry?.[section]);
  const fieldNode = asRecord(sectionNode?.[field]) as DeltaNode | null;
  const value = Number(fieldNode?.delta ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function resolveTransitionNotice(
  settlement: UnknownRecord | undefined,
  _activeEvents: EventRecord[]
): Omit<TransitionNotice, 'token' | 'turn'> {
  const carbonDelta = readDelta(settlement, 'metrics', 'carbon');
  const greenDelta = readDelta(settlement, 'metrics', 'green');
  const satisfactionDelta = readDelta(settlement, 'metrics', 'satisfaction');
  const industryDelta = readDelta(settlement, 'resources', 'industry');
  const techDelta = readDelta(settlement, 'resources', 'tech');
  const carbonDrop = -carbonDelta;
  const cardEffects = asRecord(settlement?.cardEffects);
  const effectCarbon = Number(cardEffects?.carbon ?? 0);
  const effectCarbonDeltaReductionPct = Number(cardEffects?.carbonDeltaReductionPct ?? 0);
  const effectIndustryCarbonReductionPct = Number(cardEffects?.industryCarbonReductionPct ?? 0);
  const hasCarbonReductionMeasure = effectCarbon < 0
    || effectCarbonDeltaReductionPct > 0
    || effectIndustryCarbonReductionPct > 0;

  if (carbonDelta >= 20 && !hasCarbonReductionMeasure) {
    return {
      kind: 'carbon_disaster',
      title: 'Carbon Disaster',
      subtitle: 'Emergency pressure is rising',
      toneClass: 'border-rose-300 bg-rose-50 text-rose-700'
    };
  }
  if (
    industryDelta >= 8
    && industryDelta > greenDelta
    && industryDelta > techDelta
    && industryDelta > satisfactionDelta
    && industryDelta > Math.max(0, carbonDrop)
  ) {
    return {
      kind: 'industry_growth',
      title: 'Industry Growth',
      subtitle: 'Infrastructure momentum accelerated',
      toneClass: 'border-sky-300 bg-sky-50 text-sky-700'
    };
  }
  if (
    greenDelta >= 6
    && greenDelta > industryDelta
    && greenDelta > techDelta
    && greenDelta > satisfactionDelta
    && greenDelta > Math.max(0, carbonDrop)
  ) {
    return {
      kind: 'green_growth',
      title: 'Green Building Rise',
      subtitle: 'Eco assets expanded this turn',
      toneClass: 'border-emerald-300 bg-emerald-50 text-emerald-700'
    };
  }
  if (
    techDelta >= 8
    && techDelta > industryDelta
    && techDelta > greenDelta
    && techDelta > satisfactionDelta
    && techDelta > Math.max(0, carbonDrop)
  ) {
    return {
      kind: 'tech_burst',
      title: 'Tech Burst',
      subtitle: 'Innovation output spiked',
      toneClass: 'border-violet-300 bg-violet-50 text-violet-700'
    };
  }
  if (
    satisfactionDelta >= 6
    && satisfactionDelta > industryDelta
    && satisfactionDelta > greenDelta
    && satisfactionDelta > techDelta
    && satisfactionDelta > Math.max(0, carbonDrop)
  ) {
    return {
      kind: 'satisfaction_growth',
      title: 'Citizen Confidence',
      subtitle: 'Public support improved',
      toneClass: 'border-amber-300 bg-amber-50 text-amber-700'
    };
  }
  if (
    carbonDrop >= 8
    && carbonDrop > industryDelta
    && carbonDrop > greenDelta
    && carbonDrop > techDelta
    && carbonDrop > satisfactionDelta
  ) {
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
