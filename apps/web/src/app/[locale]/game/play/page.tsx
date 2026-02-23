'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  endSession,
  GameActionResponse,
  GameCardMeta,
  getSessionById,
  listCards,
  performAction,
  startSession,
  tradeCarbon
} from '@/lib/api/game';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

type PondState = Record<string, any>;

interface EndingView {
  endingId: string;
  endingName: string;
  imageKey: string;
  reason: string;
  turn: number;
}

interface TimelineItem {
  key: string;
  turn: number;
  type: 'unlock' | 'combo' | 'event' | 'trade';
  message: string;
}

interface TransitionNotice {
  token: number;
  kind: TransitionKind;
  title: string;
  subtitle: string;
  toneClass: string;
  turn: number;
}

interface GuidedTask {
  id: 'select_core' | 'select_tile' | 'place_core' | 'end_turn';
  title: string;
  detail: string;
}

interface CoreCardAffordability {
  canPlace: boolean;
  needIndustry: number;
  needTech: number;
  needPopulation: number;
  needGreen: number;
}

interface TurnFlowStep {
  id: 'select_core' | 'select_tile' | 'place_core' | 'optional_actions' | 'end_turn';
  label: string;
  done: boolean;
  active: boolean;
}

type GuidedAction = 'select_core' | 'select_tile' | 'place_core' | 'end_turn' | 'policy' | 'trade';

type TransitionKind =
  | 'industry_growth'
  | 'green_growth'
  | 'tech_burst'
  | 'satisfaction_growth'
  | 'carbon_optimized'
  | 'balanced_growth'
  | 'carbon_disaster';

function resolvePolicyHintByEvent(eventType: string): string {
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

function resolvePolicyIdsByEvent(eventType: string): string[] {
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

function resolveEventLabel(eventType: string): string {
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

function resolveComboName(comboId: string): string {
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

const DEFAULT_STORAGE_BASE = process.env.NEXT_PUBLIC_MINIO_PUBLIC_BASE_URL || 'http://127.0.0.1:9000/youthloop';
const TURN_ANIMATION_STORAGE_KEY = 'game:turn-transition-animation-enabled';
const PLAY_ONBOARDING_STORAGE_KEY = 'game:play-onboarding:v1';
function readDelta(entry: Record<string, any> | undefined, section: string, field: string): number {
  const value = Number(entry?.[section]?.[field]?.delta ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function resolveTransitionNotice(
  settlement: Record<string, any> | undefined,
  activeEvents: Array<Record<string, unknown>>
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

export default function GamePlayPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'zh';
  const { t } = useSafeTranslation('game');

  const onboardingSteps = useMemo(
    () => [
      {
        title: t('play.onboarding.step1.title', '欢迎来到低碳规划师'),
        body: t('play.onboarding.step1.body', '这是一款回合制卡牌策略游戏。每回合你最多放置 1 张核心卡，可选使用 1 张政策卡，然后结束回合进行结算。')
      },
      {
        title: t('play.onboarding.step2.title', '胜利目标（简版）'),
        body: t('play.onboarding.step2.body', '控制碳排放、提升绿建度与满意度，并保持产业/科创/人口平衡。回合上限 30，未达成优质条件会进入失败结局。')
      },
      {
        title: t('play.onboarding.step3.title', '你的第一个回合'),
        body: t('play.onboarding.step3.body', '先选一张核心卡，再点棋盘空地，最后点击“放置核心卡”。接着点击“结束回合”看结算变化。')
      },
      {
        title: t('play.onboarding.step4.title', '提示信息在哪里看'),
        body: t('play.onboarding.step4.body', '左侧看资源/指标与负面事件，底部看错误与回合反馈。出现负面事件时，按提示使用对应政策卡化解。')
      }
    ],
    [t]
  );

  const guidedTasks = useMemo<GuidedTask[]>(
    () => [
      {
        id: 'select_core',
        title: t('play.guided.selectCore.title', '选择一张核心卡'),
        detail: t('play.guided.selectCore.detail', '在中间“核心手牌”里点击任意卡牌。')
      },
      {
        id: 'select_tile',
        title: t('play.guided.selectTile.title', '选择棋盘空地'),
        detail: t('play.guided.selectTile.detail', '在“棋盘”区域点击一个空白格子。')
      },
      {
        id: 'place_core',
        title: t('play.guided.placeCore.title', '放置核心卡'),
        detail: t('play.guided.placeCore.detail', '点击“放置核心卡”提交本回合放置。')
      },
      {
        id: 'end_turn',
        title: t('play.guided.endTurn.title', '结束回合并结算'),
        detail: t('play.guided.endTurn.detail', '点击右上角“结束回合”，观察左侧指标变化。')
      }
    ],
    [t]
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState('');

  const [sessionId, setSessionId] = useState('');
  const [pondState, setPondState] = useState<PondState | null>(null);
  const [catalog, setCatalog] = useState<Map<string, GameCardMeta>>(new Map());
  const [selectedCoreId, setSelectedCoreId] = useState('');
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [selectedTile, setSelectedTile] = useState<string>('');
  const [ending, setEnding] = useState<EndingView | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState(1);
  const [endingCountdown, setEndingCountdown] = useState(0);
  const [transitionAnimationEnabled, setTransitionAnimationEnabled] = useState(true);
  const [transitionNotice, setTransitionNotice] = useState<TransitionNotice | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [guidedTutorialActive, setGuidedTutorialActive] = useState(false);
  const [draggingCoreId, setDraggingCoreId] = useState('');
  const [dragOverTile, setDragOverTile] = useState('');
  const previousSettlementLengthRef = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const endingTimerRef = useRef<number | null>(null);

  const resources = pondState?.resources || {};
  const metrics = pondState?.metrics || {};
  const handCore: string[] = pondState?.handCore || [];
  const handPolicy: string[] = pondState?.handPolicy || [];
  const placedCore: string[] = pondState?.placedCore || [];
  const turn = pondState?.turn || 1;
  const maxTurn = pondState?.maxTurn || 30;
  const corePlacedThisTurn = Boolean(pondState?.corePlacedThisTurn);
  const policyUsedThisTurn = Boolean(pondState?.policyUsedThisTurn);
  const boardSize = Number(pondState?.boardSize || 6);
  const boardOccupied = (pondState?.boardOccupied || {}) as Record<string, string>;
  const pendingDiscard = (pondState?.pendingDiscard || {}) as Record<string, unknown>;
  const pendingDiscardActive = Boolean(pendingDiscard.active);
  const pendingDiscardBlocking = pendingDiscardActive;
  const carbonTrade = pondState?.carbonTrade || {};
  const activeNegativeEvents: Array<Record<string, unknown>> = pondState?.activeNegativeEvents || [];
  const eventHistory: Array<Record<string, unknown>> = pondState?.eventHistory || [];
  const comboHistory: Array<Record<string, unknown>> = pondState?.comboHistory || [];
  const policyHistory: Array<Record<string, unknown>> = pondState?.policyHistory || [];
  const settlementHistory: Array<Record<string, unknown>> = pondState?.settlementHistory || [];
  const eventStats = pondState?.eventStats || {};
  const runtimeConfig = (pondState?.runtimeConfig || {}) as Record<string, unknown>;

  const tradeWindowOpened = Boolean(carbonTrade.windowOpened);
  const tradeLastPrice = Number(carbonTrade.lastPrice || 2);
  const tradeQuota = Number(carbonTrade.quota || 0);
  const tradeProfit = Number(carbonTrade.profit || 0);
  const tradeHistory: Array<Record<string, unknown>> = carbonTrade.history || [];
  const latestTradeRecord = tradeHistory.length > 0 ? tradeHistory[tradeHistory.length - 1] : null;
  const selectedCoreCard = selectedCoreId ? catalog.get(selectedCoreId) || null : null;
  const selectedPolicyCard = selectedPolicyId ? catalog.get(selectedPolicyId) || null : null;
  const uniquePoliciesUsed = useMemo(
    () => new Set(policyHistory.map((record) => String(record.policyId || ''))).size,
    [policyHistory]
  );
  const resolveRate = Number(eventStats.negativeTriggered || 0) > 0
    ? Math.round((Number(eventStats.negativeResolved || 0) * 10000) / Number(eventStats.negativeTriggered || 1)) / 100
    : 100;
  const endingDisplaySeconds = Math.max(1, Number(runtimeConfig.endingDisplaySeconds || 5));
  const turnTransitionAnimationDefault = runtimeConfig.turnTransitionAnimationEnabledDefault !== false;
  const turnTransitionAnimationSeconds = Math.max(1, Number(runtimeConfig.turnTransitionAnimationSeconds || 2));

  const handCoreCards = useMemo(
    () => handCore.map((id) => catalog.get(id)).filter(Boolean) as GameCardMeta[],
    [handCore, catalog]
  );

  const handPolicyCards = useMemo(
    () => handPolicy.map((id) => catalog.get(id)).filter(Boolean) as GameCardMeta[],
    [handPolicy, catalog]
  );
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
  const selectedCoreProjectedDelta = useMemo(() => {
    if (!selectedCoreCard) {
      return null;
    }
    return {
      industry: Number(selectedCoreCard.coreContinuousIndustryDelta ?? 0),
      tech: Number(selectedCoreCard.coreContinuousTechDelta ?? 0),
      population: Number(selectedCoreCard.coreContinuousPopulationDelta ?? 0),
      green: Number(selectedCoreCard.coreContinuousGreenDelta ?? 0),
      carbon: Number(selectedCoreCard.coreContinuousCarbonDelta ?? 0),
      satisfaction: Number(selectedCoreCard.coreContinuousSatisfactionDelta ?? 0)
    };
  }, [selectedCoreCard]);
  const selectedCoreHasProjectedDelta = useMemo(() => {
    if (!selectedCoreProjectedDelta) {
      return false;
    }
    return Object.values(selectedCoreProjectedDelta).some((value) => Number(value) !== 0);
  }, [selectedCoreProjectedDelta]);
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
  const selectedCoreRiskLevel = useMemo<'low' | 'medium' | 'high'>(() => {
    if (!selectedCoreCard || !selectedCoreProjectedDelta) {
      return 'low';
    }
    const costTotal = Number(selectedCoreCard.unlockCost.industry || 0)
      + Number(selectedCoreCard.unlockCost.tech || 0)
      + Number(selectedCoreCard.unlockCost.population || 0)
      + Number(selectedCoreCard.unlockCost.green || 0);
    const carbonPenalty = Math.max(0, Number(selectedCoreProjectedDelta.carbon || 0));
    const riskScore = costTotal + carbonPenalty * 2;
    if (riskScore >= 18) {
      return 'high';
    }
    if (riskScore >= 10) {
      return 'medium';
    }
    return 'low';
  }, [selectedCoreCard, selectedCoreProjectedDelta]);
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
  const adjacencyRequired = occupiedTileCount > 0;
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
  const recommendedTile = useMemo(() => {
    if (!selectedCoreId || tileAdjacencyScoreMap.size === 0) {
      return '';
    }
    let bestKey = '';
    let bestScore = -1;
    for (const [key, score] of tileAdjacencyScoreMap.entries()) {
      if (score > bestScore || (score === bestScore && key < bestKey)) {
        bestKey = key;
        bestScore = score;
      }
    }
    return bestScore > 0 ? bestKey : '';
  }, [selectedCoreId, tileAdjacencyScoreMap]);
  const tradeDoneThisTurn = useMemo(() => {
    return tradeHistory.some((record) => {
      const recordTurn = Number(record.turn || 0);
      const action = String(record.action || '');
      return recordTurn === turn && (action === 'buy' || action === 'sell');
    });
  }, [tradeHistory, turn]);
  const handPolicySet = useMemo(() => new Set(handPolicy), [handPolicy]);
  const strictGuideMode = guidedTutorialActive && turn <= 3;
  const guidedGateEnabled = guidedTutorialActive;
  const turnFlowSteps = useMemo<TurnFlowStep[]>(() => {
    const steps: Array<Omit<TurnFlowStep, 'active'>> = [
      { id: 'select_core', label: t('play.flow.selectCore', '选核心卡'), done: !!selectedCoreId || corePlacedThisTurn },
      { id: 'select_tile', label: t('play.flow.selectTile', '选棋盘位'), done: !!selectedTile || corePlacedThisTurn },
      { id: 'place_core', label: t('play.flow.placeCore', '放置核心卡'), done: corePlacedThisTurn },
      { id: 'optional_actions', label: t('play.flow.optionalActions', '可选操作'), done: strictGuideMode || policyUsedThisTurn || tradeDoneThisTurn || (!tradeWindowOpened && !handPolicyCards.length) },
      { id: 'end_turn', label: t('play.flow.endTurn', '结束回合'), done: turn > 1 || settlementHistory.length > 0 }
    ];
    const firstPendingId = steps.find((step) => !step.done)?.id;
    return steps.map((step) => ({
      ...step,
      active: firstPendingId === step.id
    }));
  }, [
    t,
    selectedCoreId,
    corePlacedThisTurn,
    selectedTile,
    policyUsedThisTurn,
    tradeDoneThisTurn,
    tradeWindowOpened,
    handPolicyCards.length,
    strictGuideMode,
    turn,
    settlementHistory.length
  ]);
  const placeActionBlockedReason = useMemo(() => {
    if (pendingDiscardBlocking) {
      return t('play.actions.blocked.discardFirst', '请先完成弃牌。');
    }
    if (corePlacedThisTurn) {
      return t('play.actions.blocked.alreadyPlaced', '本回合已放置过核心卡。');
    }
    if (!selectedCoreId) {
      return t('play.actions.blocked.selectCore', '请先选择核心卡。');
    }
    if (!selectedTile) {
      return t('play.actions.blocked.selectTile', '请先选择棋盘空位。');
    }
    if (!selectedTilePlaceable) {
      return adjacencyRequired
        ? t('play.actions.blocked.mustBeAdjacent', '该格子必须与已放置卡牌正交相邻。')
        : t('play.actions.blocked.tileInvalid', '当前格子不可放置，请选择高亮可用格。');
    }
    if (selectedCoreAffordability && !selectedCoreAffordability.canPlace) {
      return t('play.actions.blocked.insufficient', '资源不足，暂时无法放置。');
    }
    return '';
  }, [pendingDiscardBlocking, corePlacedThisTurn, selectedCoreId, selectedTile, selectedTilePlaceable, adjacencyRequired, selectedCoreAffordability, t]);
  const policyActionBlockedReason = useMemo(() => {
    if (pendingDiscardBlocking) {
      return t('play.actions.blocked.discardFirst', '请先完成弃牌。');
    }
    if (policyUsedThisTurn) {
      return t('play.actions.blocked.policyUsed', '本回合已使用过政策卡。');
    }
    if (strictGuideMode) {
      return t('play.actions.blocked.guidePolicyLocked', '引导阶段前3回合暂不开放政策卡操作。');
    }
    if (!selectedPolicyId) {
      return t('play.actions.blocked.selectPolicy', '请先选择政策卡。');
    }
    return '';
  }, [pendingDiscardBlocking, policyUsedThisTurn, strictGuideMode, selectedPolicyId, t]);
  const tradeActionBlockedReason = useMemo(() => {
    if (pendingDiscardBlocking) {
      return t('play.actions.blocked.discardFirst', '请先完成弃牌。');
    }
    if (strictGuideMode) {
      return t('play.actions.blocked.guideTradeLocked', '引导阶段前3回合暂不开放交易操作。');
    }
    if (!tradeWindowOpened) {
      return t('play.actions.blocked.tradeClosed', '当前回合不可交易。');
    }
    return '';
  }, [pendingDiscardBlocking, strictGuideMode, tradeWindowOpened, t]);
  function guidedActionAllowed(action: GuidedAction): boolean {
    if (!guidedGateEnabled) {
      return true;
    }
    const step = currentGuidedTask?.id;
    if (!step) {
      return true;
    }
    if (step === 'select_core') {
      return action === 'select_core';
    }
    if (step === 'select_tile') {
      return action === 'select_tile';
    }
    if (step === 'place_core') {
      return action === 'place_core';
    }
    if (step === 'end_turn') {
      return action === 'end_turn';
    }
    return true;
  }
  const guidedTaskProgress = useMemo(
    () => guidedTasks.map((task) => ({
      ...task,
      done:
        (task.id === 'select_core' && !!selectedCoreId) ||
        (task.id === 'select_tile' && !!selectedTile) ||
        (task.id === 'place_core' && (corePlacedThisTurn || placedCore.length > 0)) ||
        (task.id === 'end_turn' && (turn > 1 || settlementHistory.length > 0))
    })),
    [selectedCoreId, selectedTile, corePlacedThisTurn, placedCore.length, turn, settlementHistory.length, guidedTasks]
  );
  const currentGuidedTask = useMemo(
    () => guidedTaskProgress.find((task) => !task.done) || null,
    [guidedTaskProgress]
  );
  const guidedTutorialCompleted = useMemo(
    () => guidedTaskProgress.every((task) => task.done),
    [guidedTaskProgress]
  );
  const guidedOverlayMessage = useMemo(() => {
    if (!guidedGateEnabled || !currentGuidedTask) {
      return '';
    }
    return `${t('play.guided.overlayPrefix', '当前必须完成')}: ${currentGuidedTask.title}`;
  }, [guidedGateEnabled, currentGuidedTask, t]);
  const boardPlacementMode = useMemo(() => {
    if (!selectedCoreId) {
      return false;
    }
    return canPlaceCoreCard(selectedCoreId) && guidedActionAllowed('select_tile');
  }, [selectedCoreId, corePlacedThisTurn, pendingDiscardBlocking, ending, coreAffordabilityMap, guidedGateEnabled, currentGuidedTask]);

  useEffect(() => {
    if (!selectedTile) {
      return;
    }
    if (placeableTileKeySet.has(selectedTile)) {
      return;
    }
    setSelectedTile('');
  }, [selectedTile, placeableTileKeySet]);

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    for (const record of eventHistory.slice(-12)) {
      const turnValue = Number(record.turn || 0);
      const eventType = String(record.eventType || '');
      if (eventType === 'policy_unlock') {
        const policyId = String(record.policyId || '');
        const card = catalog.get(policyId);
        items.push({
          key: `unlock-${turnValue}-${policyId}`,
          turn: turnValue,
          type: 'unlock',
          message: `Unlocked ${card?.chineseName || policyId}`
        });
      } else if (eventType === 'event_resolved') {
        const resolvedEvent = String(record.resolvedEvent || '');
        const policyId = String(record.policyId || '');
        items.push({
          key: `resolved-${turnValue}-${resolvedEvent}-${policyId}`,
          turn: turnValue,
          type: 'event',
          message: `Resolved ${resolveEventLabel(resolvedEvent)} via ${policyId}`
        });
      } else if (eventType) {
        items.push({
          key: `event-${turnValue}-${eventType}`,
          turn: turnValue,
          type: 'event',
          message: `Triggered ${resolveEventLabel(eventType)}`
        });
      }
    }

    for (const record of comboHistory.slice(-6)) {
      const turnValue = Number(record.turn || 0);
      const combos = (record.combos || []) as string[];
      if (combos.length > 0) {
        items.push({
          key: `combo-${turnValue}-${combos.join('-')}`,
          turn: turnValue,
          type: 'combo',
          message: `Combos: ${combos.map((id) => resolveComboName(String(id))).join(', ')}`
        });
      }
    }

    for (const record of tradeHistory.slice(-6)) {
      const turnValue = Number(record.turn || 0);
      const action = String(record.action || '');
      const amount = Number(record.amount || 0);
      if (action) {
        items.push({
          key: `trade-${turnValue}-${action}-${amount}`,
          turn: turnValue,
          type: 'trade',
          message: `Trade ${action}${amount > 0 ? ` (${amount})` : ''}`
        });
      }
    }

    return items
      .sort((a, b) => b.turn - a.turn)
      .slice(0, 8);
  }, [eventHistory, comboHistory, tradeHistory, catalog]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [cardsRes, sessionRes] = await Promise.all([listCards(true), startSession()]);
        if (cancelled) {
          return;
        }
        const nextMap = new Map<string, GameCardMeta>();
        cardsRes.items.forEach((card) => nextMap.set(card.cardId, card));
        setCatalog(nextMap);
        setSessionId(sessionRes.id);
        window.sessionStorage.setItem('game:lastSessionId', sessionRes.id);
        setPondState((sessionRes.pondState || {}) as PondState);
        const guideSeen = window.localStorage.getItem(PLAY_ONBOARDING_STORAGE_KEY);
        if (!guideSeen) {
          setShowOnboarding(true);
          setOnboardingStep(0);
          setGuidedTutorialActive(true);
        }
        const endingState = ((sessionRes.pondState as PondState)?.ending || null) as EndingView | null;
        if (endingState?.endingId) {
          setEnding(endingState);
        }
      } catch (e: any) {
        setError(e?.message || t('play.errors.initFailed', '初始化游戏失败'));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(TURN_ANIMATION_STORAGE_KEY);
    if (stored === null) {
      setTransitionAnimationEnabled(turnTransitionAnimationDefault);
      return;
    }
    setTransitionAnimationEnabled(stored === '1');
  }, [turnTransitionAnimationDefault]);

  useEffect(() => {
    if (!ending) {
      setEndingCountdown(0);
      if (endingTimerRef.current !== null) {
        window.clearInterval(endingTimerRef.current);
        endingTimerRef.current = null;
      }
      return;
    }
    setEndingCountdown(endingDisplaySeconds);
    endingTimerRef.current = window.setInterval(() => {
      setEndingCountdown((current) => {
        if (current <= 1) {
          if (endingTimerRef.current !== null) {
            window.clearInterval(endingTimerRef.current);
            endingTimerRef.current = null;
          }
          handleOpenArchive();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (endingTimerRef.current !== null) {
        window.clearInterval(endingTimerRef.current);
        endingTimerRef.current = null;
      }
    };
  }, [ending, endingDisplaySeconds]);

  useEffect(() => {
    const currentLength = settlementHistory.length;
    if (currentLength <= previousSettlementLengthRef.current) {
      previousSettlementLengthRef.current = currentLength;
      return;
    }
    previousSettlementLengthRef.current = currentLength;
    if (!transitionAnimationEnabled || ending) {
      return;
    }
    const latest = settlementHistory[currentLength - 1] as Record<string, any> | undefined;
    const turnValue = Number(latest?.turn || turn);
    const notice = resolveTransitionNotice(latest, activeNegativeEvents);
    setTransitionNotice({
      token: Date.now(),
      kind: notice.kind,
      title: notice.title,
      subtitle: notice.subtitle,
      toneClass: notice.toneClass,
      turn: turnValue
    });
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      setTransitionNotice(null);
      transitionTimerRef.current = null;
    }, turnTransitionAnimationSeconds * 1000);
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [settlementHistory, activeNegativeEvents, transitionAnimationEnabled, turnTransitionAnimationSeconds, ending, turn]);

  useEffect(() => {
    if (!guidedTutorialActive || !guidedTutorialCompleted) {
      return;
    }
    setGuidedTutorialActive(false);
    setLastMessage(t('play.guided.completed', '新手引导已完成：你已经掌握一个完整回合。接下来重点关注碳排放、配额与事件化解。'));
  }, [guidedTutorialActive, guidedTutorialCompleted, t]);

  function resolveImageUrl(imageKey?: string | null): string {
    if (!imageKey) {
      return '';
    }
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey;
    }
    return `${DEFAULT_STORAGE_BASE}/${imageKey}`;
  }

  function applyActionResult(response: GameActionResponse) {
    const nextState = (response.newPondState || {}) as PondState;
    setPondState(nextState);
    if (sessionId) {
      window.sessionStorage.setItem('game:lastSessionId', sessionId);
    }
    setLastMessage(response.message || '');
    setSelectedCoreId('');
    setSelectedPolicyId('');

    const endingState = (nextState.ending || null) as EndingView | null;
    if (endingState?.endingId) {
      setEnding(endingState);
      return;
    }
    if (response.sessionEnded && response.endingId) {
      setEnding({
        endingId: response.endingId,
        endingName: response.endingName || response.endingId,
        imageKey: response.endingImageKey || '',
        reason: response.message || '',
        turn: nextState.turn || turn
      });
    }
  }

  function canPlaceCoreCard(cardId: string): boolean {
    if (!cardId) {
      return false;
    }
    if (pendingDiscardBlocking || corePlacedThisTurn || !!ending) {
      return false;
    }
    const affordability = coreAffordabilityMap.get(cardId);
    if (!affordability) {
      return false;
    }
    return affordability.canPlace;
  }

  async function placeCoreCard(cardId: string, row: number, col: number) {
    if (!canPlaceCoreCard(cardId)) {
      setError(t('play.actions.blocked.insufficient', '资源不足，暂时无法放置。'));
      return;
    }
    const targetTile = `${row},${col}`;
    if (!placeableTileKeySet.has(targetTile)) {
      setSelectedTile(targetTile);
      setError(
        adjacencyRequired
          ? t('play.actions.blocked.mustBeAdjacent', '该格子必须与已放置卡牌正交相邻。')
          : t('play.actions.blocked.tileInvalid', '当前格子不可放置，请选择高亮可用格。')
      );
      return;
    }
    setSelectedCoreId(cardId);
    setSelectedTile(targetTile);
    await runAction(1, { cardId, row, col });
  }

  async function runAction(actionType: number, actionData?: Record<string, unknown>) {
    if (!sessionId) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const response = await performAction({ sessionId, actionType, actionData });
      applyActionResult(response);
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function runTradeAction() {
    if (!sessionId) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const amount = Math.max(1, Math.floor(tradeAmount || 1));
      const response = await tradeCarbon({
        sessionId,
        tradeType,
        amount
      });
      applyActionResult(response);
    } catch (e: any) {
      setError(e?.message || 'Carbon trade failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function discardCard(handType: 'core' | 'policy', cardId: string) {
    if (!sessionId) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const response = await performAction({
        sessionId,
        actionType: 5,
        actionData: { handType, cardId }
      });
      applyActionResult(response);
    } catch (e: any) {
      const message = e?.message || t('play.errors.discardFailed', '弃牌失败');
      if (typeof message === 'string' && message.includes('No pending discard')) {
        await refreshSession();
        setError(t('play.errors.noPendingDiscard', '当前没有待弃牌任务，界面已同步最新状态。'));
      } else {
        setError(message);
      }
    } finally {
      setActionLoading(false);
    }
  }

  function selectPolicyForEvent(eventType: string) {
    const candidates = resolvePolicyIdsByEvent(eventType);
    const matched = candidates.find((policyId) => handPolicy.includes(policyId));
    if (!matched) {
      setError(t('play.events.noPolicyInHand', '当前手牌没有可化解该事件的政策卡。'));
      return;
    }
    setSelectedPolicyId(matched);
    const policyName = catalog.get(matched)?.chineseName || matched;
    setLastMessage(t('play.events.policySelected', '已为你选中可用政策卡：{policy}', { policy: policyName }));
  }

  async function refreshSession() {
    if (!sessionId) {
      return;
    }
    try {
      const current = await getSessionById(sessionId);
      setSessionId(current.id);
      setPondState((current.pondState || {}) as PondState);
    } catch (e: any) {
      setError(e?.message || t('play.errors.refreshFailed', '刷新失败'));
    }
  }

  async function handleBack() {
    if (!sessionId) {
      router.push(`/${locale}/game`);
      return;
    }
    try {
      await endSession(sessionId);
    } catch {
      // no-op
    } finally {
      router.push(`/${locale}/game`);
    }
  }

  function handleOpenArchive() {
    if (!sessionId) {
      router.push(`/${locale}/game/archive`);
      return;
    }
    router.push(`/${locale}/game/archive?sessionId=${encodeURIComponent(sessionId)}`);
  }

  function closeOnboarding(markSeen: boolean, keepGuidedActive: boolean) {
    if (markSeen && typeof window !== 'undefined') {
      window.localStorage.setItem(PLAY_ONBOARDING_STORAGE_KEY, '1');
    }
    setShowOnboarding(false);
    setOnboardingStep(0);
    setGuidedTutorialActive(keepGuidedActive && !guidedTutorialCompleted);
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">{t('play.loading', '游戏加载中...')}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            {t('play.actions.back', '返回')}
          </button>
          <div className="font-semibold">{t('play.title', '低碳城市卡牌游戏')}</div>
          <div className="text-xs text-slate-500">{t('play.turn', '回合')} {turn}/{maxTurn}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleOpenArchive} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            {t('play.actions.archive', '档案')}
          </button>
          <button onClick={refreshSession} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            {t('play.actions.refresh', '刷新')}
          </button>
          <button
            onClick={() => {
              setShowOnboarding(true);
              setOnboardingStep(0);
              setGuidedTutorialActive(true);
            }}
            className="px-3 py-1.5 rounded border border-slate-300 text-sm"
          >
            {t('play.actions.guide', '引导')}
          </button>
          <label className="flex items-center gap-1.5 px-2 py-1 text-xs border border-slate-300 rounded">
            <input
              type="checkbox"
              checked={transitionAnimationEnabled}
              onChange={(e) => {
                const checked = e.target.checked;
                setTransitionAnimationEnabled(checked);
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(TURN_ANIMATION_STORAGE_KEY, checked ? '1' : '0');
                }
              }}
            />
            {t('play.actions.turnAnimation', '回合动效')}
          </label>
          <button
            onClick={() => runAction(2)}
            disabled={actionLoading || !!ending || pendingDiscardBlocking || !guidedActionAllowed('end_turn')}
            className={`px-3 py-1.5 rounded bg-slate-900 text-white text-sm disabled:opacity-50 ${
              guidedTutorialActive && currentGuidedTask?.id === 'end_turn'
                ? 'ring-2 ring-amber-300 ring-offset-2'
                : ''
            }`}
          >
            {t('play.actions.endTurn', '结束回合')}
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-4">
        {guidedTutorialActive && !guidedTutorialCompleted && (
          <section className="col-span-12 rounded border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-amber-800">{t('play.guided.title', '新手引导（实操模式）')}</div>
                <div className="text-xs text-amber-700 mt-1">
                  {t('play.guided.currentTask', '当前任务')}：{currentGuidedTask?.title || t('play.guided.allDone', '全部完成')}
                </div>
                <div className="text-xs text-amber-700">{currentGuidedTask?.detail}</div>
              </div>
              <button
                onClick={() => setGuidedTutorialActive(false)}
                className="px-2 py-1 rounded border border-amber-300 bg-white text-xs text-amber-700"
              >
                {t('play.guided.pause', '暂停引导')}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {guidedTaskProgress.map((task) => (
                <div
                  key={task.id}
                  className={`rounded border px-2 py-1 text-xs ${
                    task.done
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : currentGuidedTask?.id === task.id
                        ? 'border-amber-300 bg-white text-amber-800'
                        : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {task.done ? '✓ ' : ''}{task.title}
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="col-span-12 rounded border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-700 mb-2">{t('play.flow.title', '回合步骤')}</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {turnFlowSteps.map((step) => (
              <div
                key={step.id}
                className={`rounded border px-2 py-1 text-xs ${
                  step.done
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : step.active
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                {step.done ? '✓ ' : ''}{step.label}
              </div>
            ))}
          </div>
          {strictGuideMode && (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {t('play.guideMode.message', '强引导模式（前3回合）：先完成核心卡放置与结束回合，政策与交易暂时锁定。')}
            </div>
          )}
        </section>
        <section className="col-span-3 bg-white rounded border p-4 space-y-2">
          <div className="font-semibold">{t('play.resources.title', '资源')}</div>
          <div className="text-sm">{t('play.resources.industry', '产业值')}: {resources.industry ?? 0}</div>
          <div className="text-sm">{t('play.resources.tech', '科创点')}: {resources.tech ?? 0}</div>
          <div className="text-sm">{t('play.resources.population', '人口')}: {resources.population ?? 0}</div>
          <div className="pt-3 font-semibold">{t('play.metrics.title', '指标')}</div>
          <div className="text-sm">{t('play.metrics.green', '绿建度')}: {metrics.green ?? 0}</div>
          <div className="text-sm">{t('play.metrics.carbon', '碳排放')}: {metrics.carbon ?? 0}</div>
          <div className="text-sm">{t('play.metrics.satisfaction', '满意度')}: {metrics.satisfaction ?? 0}</div>
          <div className="pt-2 text-xs text-slate-500">{t('play.metrics.placedCore', '已放置核心卡')}: {placedCore.length}</div>
          <div className={`text-xs ${corePlacedThisTurn ? 'text-amber-600' : 'text-slate-500'}`}>
            {corePlacedThisTurn
              ? t('play.metrics.corePlacedDone', '本回合已放置核心卡')
              : t('play.metrics.corePlacedTodo', '本回合可放置 1 张核心卡')}
          </div>
          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="font-semibold mb-1">{t('play.trade.title', '碳交易')}</div>
            <div className="text-sm">{t('play.trade.quota', '配额')}: {tradeQuota}</div>
            <div className="text-sm">{t('play.trade.currentPrice', '当前价格')}: {tradeLastPrice.toFixed(1)}</div>
            <div className="text-sm">{t('play.trade.profit', '累计收益')}: {tradeProfit.toFixed(1)}</div>
            {latestTradeRecord && (
              <div className="text-xs text-slate-500 mt-1">
                {t('play.trade.last', '最近交易')}: {String(latestTradeRecord.action)} / {t('play.trade.amount', '数量')} {Number(latestTradeRecord.amount || 0)}
              </div>
            )}
            <div className={`text-xs mt-1 ${tradeWindowOpened ? 'text-emerald-600' : 'text-slate-500'}`}>
              {tradeWindowOpened
                ? t('play.trade.windowOpen', '本回合可交易')
                : t('play.trade.windowClosed', '本回合不可交易')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="font-semibold mb-1">{t('play.events.title', '当前负面事件')}</div>
            {activeNegativeEvents.length === 0 && <div className="text-xs text-slate-500">{t('play.common.none', '无')}</div>}
            {activeNegativeEvents.map((event, idx) => (
              <div key={`${String(event.eventType)}-${idx}`} className="text-xs text-slate-600 rounded border border-slate-200 p-2 mb-2">
                <div className="font-medium">
                  {resolveEventLabel(String(event.eventType || ''))} ({t('play.events.remaining', '剩余')}: {Number(event.remainingTurns || 0)})
                </div>
                <div className="text-slate-500 mt-1">{resolvePolicyHintByEvent(String(event.eventType || ''))}</div>
                {resolvePolicyIdsByEvent(String(event.eventType || '')).length > 0 && (
                  <div className="mt-1">
                    <div className="text-[11px] text-slate-500">{t('play.events.suggestedPolicies', '建议政策')}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resolvePolicyIdsByEvent(String(event.eventType || '')).map((policyId) => {
                        const inHand = handPolicySet.has(policyId);
                        return (
                          <span
                            key={`${String(event.eventType)}-${policyId}`}
                            className={`px-1.5 py-0.5 rounded border text-[10px] ${
                              inHand
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                          >
                            {policyId}
                          </span>
                        );
                      })}
                    </div>
                    {!pendingDiscardBlocking && (
                      <button
                        type="button"
                        onClick={() => selectPolicyForEvent(String(event.eventType || ''))}
                        className="mt-1 px-2 py-1 rounded border border-emerald-300 bg-emerald-50 text-[11px] text-emerald-700"
                      >
                        {t('play.events.selectAvailablePolicy', '一键选中可用政策')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="font-semibold mb-1">{t('play.timeline.title', '回合记录')}</div>
            {timelineItems.length === 0 && <div className="text-xs text-slate-500">{t('play.timeline.empty', '暂无记录')}</div>}
            <div className="space-y-1">
              {timelineItems.map((item) => (
                <div key={item.key} className="text-xs text-slate-600">
                  <span className="text-slate-400">T{item.turn}</span> {item.message}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-6 bg-white rounded border p-4">
          <div className="font-semibold mb-3">{t('play.board.title', '棋盘')}</div>
          {selectedCoreId && (
            <div className="mb-2 rounded border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
              <div>{t('play.board.placementHint', '落点提示：格子上的 +N 代表与已放置卡牌的相邻数量，通常更容易形成联动。')}</div>
              {adjacencyRequired && (
                <div className="mt-1">{t('play.board.adjacencyRule', '规则：首张卡可放任意空位；后续每张核心卡必须与已放置卡正交相邻。')}</div>
              )}
              {recommendedTile && (
                <div className="mt-1">{t('play.board.recommended', '推荐落点')}: {recommendedTile}</div>
              )}
            </div>
          )}
          <div
            className={`grid gap-1 mb-4 rounded p-2 ${
              guidedTutorialActive && currentGuidedTask?.id === 'select_tile'
                ? 'ring-2 ring-amber-300'
                : ''
            }`}
            style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: boardSize * boardSize }).map((_, idx) => {
              const row = Math.floor(idx / boardSize);
              const col = idx % boardSize;
              const key = `${row},${col}`;
              const occupied = boardOccupied[key];
              const selected = selectedTile === key;
              const adjacency = tileAdjacencyScoreMap.get(key) || 0;
              const recommended = key === recommendedTile;
              const placeableTile = placeableTileKeySet.has(key);
              const dragOver = key === dragOverTile;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!!occupied || !!ending || pendingDiscardBlocking || !guidedActionAllowed('select_tile') || !placeableTile}
                  onClick={() => {
                    if (!placeableTile) {
                      return;
                    }
                    setSelectedTile(key);
                  }}
                  onDragOver={(event) => {
                    if (occupied || pendingDiscardBlocking || !!ending || !draggingCoreId || !placeableTile) {
                      return;
                    }
                    event.preventDefault();
                    setDragOverTile(key);
                  }}
                  onDragLeave={() => {
                    if (dragOverTile === key) {
                      setDragOverTile('');
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOverTile('');
                    if (!draggingCoreId || occupied || pendingDiscardBlocking || !!ending || !placeableTile) {
                      setDraggingCoreId('');
                      return;
                    }
                    void placeCoreCard(draggingCoreId, row, col);
                    setDraggingCoreId('');
                  }}
                  className={`h-8 rounded border text-[10px] ${
                    occupied
                      ? 'bg-slate-200 border-slate-300 text-slate-500'
                      : !guidedActionAllowed('select_tile')
                        ? 'bg-slate-100 border-slate-200 text-slate-300'
                      : !placeableTile
                        ? 'bg-slate-100 border-slate-200 text-slate-300'
                      : dragOver
                        ? 'bg-blue-200 border-blue-500 text-blue-800'
                      : recommended
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                      : boardPlacementMode
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-700'
                      : selected
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : adjacency > 0
                          ? 'bg-sky-50 border-sky-200 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}
                  title={
                    occupied
                      ? occupied
                      : !placeableTile
                        ? adjacencyRequired
                          ? t('play.actions.blocked.mustBeAdjacent', '该格子必须与已放置卡牌正交相邻。')
                          : t('play.actions.blocked.tileInvalid', '当前格子不可放置，请选择高亮可用格。')
                      : `${t('play.board.tile', '格子')} ${key}${
                        adjacency > 0 ? ` (${t('play.board.adjacentUnit', '相邻')} ${adjacency})` : ''
                      }`
                  }
                >
                  {occupied ? occupied.slice(-3) : adjacency > 0 ? `+${adjacency}` : ''}
                </button>
              );
            })}
          </div>

          <div className="font-semibold mb-3">{t('play.coreHand.title', '核心手牌')}</div>
          {!pendingDiscardActive && (
            <div className="mb-2 text-[11px] text-slate-500">
              {t('play.coreHand.dragHint', '可拖拽“可放置”核心卡到棋盘空位，或先点选再点击“放置核心卡”。')}
            </div>
          )}
          {pendingDiscardActive && (
            <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {t('play.discard.inlineHint', '当前手牌超上限：请直接点击下方手牌进行弃置，直到恢复上限。')}
            </div>
          )}
          <div
            className={`grid grid-cols-3 gap-3 rounded p-2 ${
              guidedTutorialActive && currentGuidedTask?.id === 'select_core'
                ? 'ring-2 ring-amber-300'
                : ''
            }`}
          >
            {handCoreCards.map((card) => (
              <button
                key={card.cardId}
                draggable={!pendingDiscardActive && canPlaceCoreCard(card.cardId) && guidedActionAllowed('select_core')}
                onDragStart={() => {
                  if (!pendingDiscardActive && canPlaceCoreCard(card.cardId) && guidedActionAllowed('select_core')) {
                    setDraggingCoreId(card.cardId);
                  }
                }}
                onDragEnd={() => {
                  setDraggingCoreId('');
                  setDragOverTile('');
                }}
                onClick={() => {
                  if (pendingDiscardActive) {
                    void discardCard('core', card.cardId);
                    return;
                  }
                  if (!guidedActionAllowed('select_core')) {
                    return;
                  }
                  setSelectedCoreId(card.cardId);
                }}
                className={`text-left border rounded p-2 ${
                  pendingDiscardActive
                    ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                    : !guidedActionAllowed('select_core')
                      ? 'border-slate-200 bg-slate-50 text-slate-400'
                    : coreAffordabilityMap.get(card.cardId)?.canPlace === false
                      ? 'border-rose-300 bg-rose-50/40'
                    : selectedCoreId === card.cardId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200'
                } transition-transform duration-150 hover:-translate-y-1 hover:shadow-sm`}
              >
                <img src={resolveImageUrl(card.imageKey)} alt={card.chineseName} className="w-full h-40 object-cover rounded mb-2" />
                <div className="text-sm font-medium">{card.chineseName}</div>
                <div className="text-xs text-slate-500">{card.cardId}</div>
                {pendingDiscardActive && (
                  <div className="text-[11px] text-amber-700 mt-1">{t('play.discard.clickCore', '点击弃置这张核心卡')}</div>
                )}
                {!pendingDiscardActive && (
                  <div className={`text-[11px] mt-1 ${
                    coreAffordabilityMap.get(card.cardId)?.canPlace ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {coreAffordabilityMap.get(card.cardId)?.canPlace
                      ? t('play.afford.canPlace', '可放置')
                      : t('play.afford.insufficient', '资源不足')}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                if (!selectedCoreId || !selectedTile) {
                  return;
                }
                const [row, col] = selectedTile.split(',').map((v) => Number(v));
                void placeCoreCard(selectedCoreId, row, col);
              }}
              disabled={
                actionLoading ||
                !selectedCoreId ||
                !selectedTile ||
                !!ending ||
                corePlacedThisTurn ||
                pendingDiscardBlocking ||
                !guidedActionAllowed('place_core') ||
                (selectedCoreAffordability ? !selectedCoreAffordability.canPlace : false)
              }
              className={`px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50 ${
                guidedTutorialActive && currentGuidedTask?.id === 'place_core'
                  ? 'ring-2 ring-amber-300 ring-offset-2'
                  : ''
              }`}
            >
              {t('play.actions.placeCore', '放置核心卡')}
            </button>
          </div>
          {placeActionBlockedReason && (
            <div className="mt-2 text-xs text-amber-700">{placeActionBlockedReason}</div>
          )}
          {!pendingDiscardActive && selectedCoreId && selectedCoreAffordability && !selectedCoreAffordability.canPlace && (
            <div className="mt-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {t('play.afford.cannotPlaceHint', '这张卡当前无法放置，缺少资源：')}
              {' '}
              {[
                selectedCoreAffordability.needIndustry > 0 ? `${t('play.resources.industry', '产业值')} ${selectedCoreAffordability.needIndustry}` : null,
                selectedCoreAffordability.needTech > 0 ? `${t('play.resources.tech', '科创点')} ${selectedCoreAffordability.needTech}` : null,
                selectedCoreAffordability.needPopulation > 0 ? `${t('play.resources.population', '人口')} ${selectedCoreAffordability.needPopulation}` : null,
                selectedCoreAffordability.needGreen > 0 ? `${t('play.metrics.green', '绿建度')} ${selectedCoreAffordability.needGreen}` : null
              ].filter(Boolean).join(' / ')}
            </div>
          )}
          {selectedCoreCard && (
            <div className="mt-4 p-3 rounded border border-blue-200 bg-gradient-to-b from-blue-50 to-white text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{selectedCoreCard.chineseName}</div>
                  <div className="text-slate-500">{selectedCoreCard.cardId}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] ${
                    selectedCoreRiskLevel === 'high'
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : selectedCoreRiskLevel === 'medium'
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {t(`play.detail.risk.${selectedCoreRiskLevel}`, selectedCoreRiskLevel === 'high' ? '高风险' : selectedCoreRiskLevel === 'medium' ? '中风险' : '低风险')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded border border-slate-200 bg-white px-2 py-1">
                  <div className="text-slate-500">{t('play.detail.domain', '板块')}</div>
                  <div className="font-medium">{selectedCoreCard.domain}</div>
                </div>
                <div className="rounded border border-slate-200 bg-white px-2 py-1">
                  <div className="text-slate-500">{t('play.detail.phase', '阶段')}</div>
                  <div className="font-medium">{selectedCoreCard.phaseBucket}</div>
                </div>
                <div className="rounded border border-slate-200 bg-white px-2 py-1">
                  <div className="text-slate-500">{t('play.detail.star', '星级')}</div>
                  <div className="font-medium">{selectedCoreCard.star}</div>
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-2 py-1">
                <div className="font-semibold">{t('play.detail.cost', '成本')}</div>
                <div>I {selectedCoreCard.unlockCost.industry} / T {selectedCoreCard.unlockCost.tech} / P {selectedCoreCard.unlockCost.population} / G {selectedCoreCard.unlockCost.green}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('play.afford.currentResource', '当前资源')}:
                  {' '}
                  I {Number(resources.industry ?? 0)} / T {Number(resources.tech ?? 0)} / P {Number(resources.population ?? 0)} / G {Number(metrics.green ?? 0)}
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-2 py-1">
                <div className="font-semibold">{t('play.preview.title', '预估结算（基础）')}</div>
                {selectedCoreProjectedDelta && selectedCoreHasProjectedDelta ? (
                  <div>
                    {[
                      selectedCoreProjectedDelta.industry !== 0 ? `${t('play.preview.industry', '产业')} ${selectedCoreProjectedDelta.industry > 0 ? '+' : ''}${selectedCoreProjectedDelta.industry}` : null,
                      selectedCoreProjectedDelta.tech !== 0 ? `${t('play.preview.tech', '科创')} ${selectedCoreProjectedDelta.tech > 0 ? '+' : ''}${selectedCoreProjectedDelta.tech}` : null,
                      selectedCoreProjectedDelta.population !== 0 ? `${t('play.preview.population', '人口')} ${selectedCoreProjectedDelta.population > 0 ? '+' : ''}${selectedCoreProjectedDelta.population}` : null,
                      selectedCoreProjectedDelta.green !== 0 ? `${t('play.preview.green', '绿建')} ${selectedCoreProjectedDelta.green > 0 ? '+' : ''}${selectedCoreProjectedDelta.green}` : null,
                      selectedCoreProjectedDelta.carbon !== 0 ? `${t('play.preview.carbon', '碳排')} ${selectedCoreProjectedDelta.carbon > 0 ? '+' : ''}${selectedCoreProjectedDelta.carbon}` : null,
                      selectedCoreProjectedDelta.satisfaction !== 0 ? `${t('play.preview.satisfaction', '满意度')} ${selectedCoreProjectedDelta.satisfaction > 0 ? '+' : ''}${selectedCoreProjectedDelta.satisfaction}` : null
                    ].filter(Boolean).join(' / ')}
                  </div>
                ) : (
                  <div>{t('play.preview.noDelta', '这张卡没有可识别的基础持续数值。')}</div>
                )}
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('play.preview.tip', '提示：该预估不包含组合技、政策和事件修正。')}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="col-span-3 bg-white rounded border p-4">
          <div className="font-semibold mb-3">{t('play.policyHand.title', '政策手牌')}</div>
          <div className="space-y-2">
            {handPolicyCards.map((card) => (
              <button
                key={card.cardId}
                onClick={() => {
                  if (pendingDiscardActive) {
                    void discardCard('policy', card.cardId);
                    return;
                  }
                  if (!guidedActionAllowed('policy')) {
                    return;
                  }
                  setSelectedPolicyId(card.cardId);
                }}
                className={`w-full text-left border rounded p-2 ${
                  pendingDiscardActive
                    ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                    : !guidedActionAllowed('policy')
                      ? 'border-slate-200 bg-slate-50 text-slate-400'
                    : selectedPolicyId === card.cardId
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200'
                } transition-transform duration-150 hover:-translate-y-0.5`}
              >
                <div className="text-sm font-medium">{card.chineseName}</div>
                <div className="text-xs text-slate-500">{card.cardId}</div>
                {pendingDiscardActive && (
                  <div className="text-[11px] text-amber-700 mt-1">{t('play.discard.clickPolicy', '点击弃置这张政策卡')}</div>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => selectedPolicyId && runAction(3, { cardId: selectedPolicyId })}
            disabled={actionLoading || !selectedPolicyId || !!ending || pendingDiscardBlocking || policyUsedThisTurn || strictGuideMode || !guidedActionAllowed('policy')}
            className="mt-3 px-3 py-1.5 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
          >
            {t('play.actions.usePolicy', '使用政策卡')}
          </button>
          {policyActionBlockedReason && (
            <div className="mt-2 text-xs text-amber-700">{policyActionBlockedReason}</div>
          )}
          {selectedPolicyCard && (
            <div className="mt-3 p-3 rounded border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{selectedPolicyCard.chineseName}</div>
                  <div className="text-slate-500">{selectedPolicyCard.cardId}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] ${
                    selectedPolicyRiskLevel === 'high'
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : selectedPolicyRiskLevel === 'medium'
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {t(`play.detail.risk.${selectedPolicyRiskLevel}`, selectedPolicyRiskLevel === 'high' ? '高风险' : selectedPolicyRiskLevel === 'medium' ? '中风险' : '低风险')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded border border-slate-200 bg-white px-2 py-1">
                  <div className="text-slate-500">{t('play.detail.domain', '板块')}</div>
                  <div className="font-medium">{selectedPolicyCard.domain}</div>
                </div>
                <div className="rounded border border-slate-200 bg-white px-2 py-1">
                  <div className="text-slate-500">{t('play.detail.phase', '阶段')}</div>
                  <div className="font-medium">{selectedPolicyCard.phaseBucket}</div>
                </div>
                <div className="rounded border border-slate-200 bg-white px-2 py-1">
                  <div className="text-slate-500">{t('play.detail.star', '星级')}</div>
                  <div className="font-medium">{selectedPolicyCard.star}</div>
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-2 py-1">
                <div className="font-semibold">{t('play.policyDetail.immediate', '即时效果（基础）')}</div>
                {selectedPolicyImmediateDelta && selectedPolicyHasImmediateDelta ? (
                  <div>
                    {[
                      selectedPolicyImmediateDelta.industry !== 0 ? `${t('play.preview.industry', '产业')} ${selectedPolicyImmediateDelta.industry > 0 ? '+' : ''}${selectedPolicyImmediateDelta.industry}` : null,
                      selectedPolicyImmediateDelta.tech !== 0 ? `${t('play.preview.tech', '科创')} ${selectedPolicyImmediateDelta.tech > 0 ? '+' : ''}${selectedPolicyImmediateDelta.tech}` : null,
                      selectedPolicyImmediateDelta.population !== 0 ? `${t('play.preview.population', '人口')} ${selectedPolicyImmediateDelta.population > 0 ? '+' : ''}${selectedPolicyImmediateDelta.population}` : null,
                      selectedPolicyImmediateDelta.green !== 0 ? `${t('play.preview.green', '绿建')} ${selectedPolicyImmediateDelta.green > 0 ? '+' : ''}${selectedPolicyImmediateDelta.green}` : null,
                      selectedPolicyImmediateDelta.carbon !== 0 ? `${t('play.preview.carbon', '碳排')} ${selectedPolicyImmediateDelta.carbon > 0 ? '+' : ''}${selectedPolicyImmediateDelta.carbon}` : null,
                      selectedPolicyImmediateDelta.satisfaction !== 0 ? `${t('play.preview.satisfaction', '满意度')} ${selectedPolicyImmediateDelta.satisfaction > 0 ? '+' : ''}${selectedPolicyImmediateDelta.satisfaction}` : null
                    ].filter(Boolean).join(' / ')}
                  </div>
                ) : (
                  <div>{t('play.policyDetail.noImmediate', '这张政策卡没有可识别的即时数值。')}</div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="font-semibold text-sm">{t('play.trade.actionTitle', '交易操作')}</div>
            <select
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
            >
              <option value="buy">{t('play.trade.buy', '买入配额')}</option>
              <option value="sell">{t('play.trade.sell', '卖出配额')}</option>
            </select>
            <input
              type="number"
              min={1}
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value) || 1)}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
              placeholder={t('play.trade.amount', '数量')}
            />
            <button
              onClick={runTradeAction}
              disabled={actionLoading || !tradeWindowOpened || !!ending || pendingDiscardBlocking || strictGuideMode || !guidedActionAllowed('trade')}
              className="w-full px-3 py-1.5 rounded bg-amber-600 text-white text-sm disabled:opacity-50"
            >
              {t('play.trade.execute', '执行交易')}
            </button>
            {tradeActionBlockedReason && (
              <div className="text-xs text-amber-700">{tradeActionBlockedReason}</div>
            )}
          </div>
        </section>
      </main>

      {guidedGateEnabled && currentGuidedTask && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-slate-900/25" />
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[min(92vw,720px)] rounded-xl border border-amber-300 bg-white/95 px-4 py-3 shadow-lg">
            <div className="text-xs font-semibold text-amber-700">{t('play.guided.overlayTitle', '操作引导')}</div>
            <div className="text-sm text-slate-700 mt-1">{guidedOverlayMessage}</div>
            <div className="text-xs text-slate-500 mt-1">{currentGuidedTask.detail}</div>
          </div>
        </div>
      )}

      {(error || lastMessage) && (
        <div className="px-6 pb-6 text-sm">
          {error && <div className="text-red-600">{error}</div>}
          {lastMessage && <div className="text-slate-600 mt-1">{lastMessage}</div>}
        </div>
      )}

      {transitionNotice && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {transitionNotice.kind === 'industry_growth' && (
              <>
                <div className="absolute bottom-0 left-[12%] h-28 w-8 bg-sky-400/40 animate-pulse rounded-t" />
                <div className="absolute bottom-0 left-[20%] h-36 w-10 bg-sky-500/40 animate-pulse rounded-t" />
                <div className="absolute bottom-0 left-[29%] h-24 w-7 bg-sky-300/40 animate-pulse rounded-t" />
              </>
            )}
            {transitionNotice.kind === 'green_growth' && (
              <>
                <div className="absolute bottom-12 left-[16%] h-10 w-10 rounded-full bg-emerald-300/40 animate-bounce" />
                <div className="absolute bottom-20 left-[26%] h-8 w-8 rounded-full bg-emerald-400/40 animate-bounce" />
                <div className="absolute bottom-8 left-[34%] h-9 w-9 rounded-full bg-emerald-500/40 animate-bounce" />
              </>
            )}
            {transitionNotice.kind === 'tech_burst' && (
              <>
                <div className="absolute top-20 left-[18%] h-16 w-16 border border-violet-400/50 rotate-45 animate-pulse" />
                <div className="absolute top-28 left-[30%] h-12 w-12 border border-indigo-400/50 rotate-45 animate-pulse" />
                <div className="absolute top-16 left-[40%] h-10 w-10 border border-sky-400/50 rotate-45 animate-pulse" />
              </>
            )}
            {transitionNotice.kind === 'satisfaction_growth' && (
              <>
                <div className="absolute top-24 left-[16%] h-3 w-3 rounded-full bg-amber-400/70 animate-ping" />
                <div className="absolute top-32 left-[24%] h-3 w-3 rounded-full bg-amber-300/70 animate-ping" />
                <div className="absolute top-20 left-[34%] h-3 w-3 rounded-full bg-orange-300/70 animate-ping" />
              </>
            )}
            {transitionNotice.kind === 'carbon_optimized' && (
              <>
                <div className="absolute top-24 left-[15%] h-1.5 w-12 rounded bg-emerald-400/60 -rotate-12 animate-pulse" />
                <div className="absolute top-30 left-[26%] h-1.5 w-14 rounded bg-emerald-500/60 -rotate-12 animate-pulse" />
                <div className="absolute top-18 left-[36%] h-1.5 w-10 rounded bg-teal-400/60 -rotate-12 animate-pulse" />
              </>
            )}
            {transitionNotice.kind === 'balanced_growth' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/30 to-transparent animate-pulse" />
            )}
            {transitionNotice.kind === 'carbon_disaster' && (
              <>
                <div className="absolute inset-0 bg-rose-900/10 animate-pulse" />
                <div className="absolute top-24 left-[18%] h-12 w-20 rounded-full bg-slate-500/40 blur-sm animate-pulse" />
                <div className="absolute top-30 left-[30%] h-10 w-16 rounded-full bg-slate-600/40 blur-sm animate-pulse" />
                <div className="absolute top-18 left-[38%] h-14 w-24 rounded-full bg-slate-700/40 blur-sm animate-pulse" />
              </>
            )}
          </div>
          <div className="absolute inset-x-0 top-20 flex justify-center px-4">
            <div
              key={transitionNotice.token}
              className={`rounded-xl border px-5 py-3 shadow-lg ${transitionNotice.toneClass}`}
            >
              <div className="text-sm font-semibold">{transitionNotice.title}</div>
              <div className="text-xs opacity-80">{transitionNotice.subtitle}</div>
              <div className="text-[11px] opacity-70 mt-1">Turn {transitionNotice.turn} settled</div>
            </div>
          </div>
        </div>
      )}

      {showOnboarding && !ending && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="text-xs text-slate-500">
              {t('play.onboarding.progress', '快速上手')} {onboardingStep + 1}/{onboardingSteps.length}
            </div>
            <div className="text-xl font-semibold text-slate-800">
              {onboardingSteps[onboardingStep].title}
            </div>
            <div className="text-sm text-slate-600 leading-6">
              {onboardingSteps[onboardingStep].body}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => closeOnboarding(true, false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-sm"
              >
                {t('play.onboarding.skip', '跳过')}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnboardingStep((prev) => Math.max(0, prev - 1))}
                  disabled={onboardingStep <= 0}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm disabled:opacity-40"
                >
                  {t('play.onboarding.prev', '上一步')}
                </button>
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((prev) => Math.min(onboardingSteps.length - 1, prev + 1))}
                    className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                  >
                    {t('play.onboarding.next', '下一步')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => closeOnboarding(true, false)}
                      className="px-3 py-1.5 rounded border border-slate-300 text-sm"
                    >
                      {t('play.onboarding.closeOnly', '仅关闭说明')}
                    </button>
                    <button
                      onClick={() => closeOnboarding(true, true)}
                      className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                    >
                      {t('play.onboarding.startGuided', '开始实操引导')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {ending && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-xl border overflow-hidden">
            {ending.imageKey && (
              <img src={resolveImageUrl(ending.imageKey)} alt={ending.endingName} className="w-full h-72 object-cover" />
            )}
            <div className="p-5 space-y-2">
              <div className="text-xl font-semibold">{ending.endingName}</div>
              <div className="text-sm text-slate-600">{ending.reason}</div>
              <div className="text-xs text-slate-500">Reached at turn: {ending.turn}</div>
              <div className="text-xs text-slate-500">
                Auto open archive in {endingCountdown}s
              </div>
              <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-sm mb-2">Replay Summary</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700">
                  <div>Placed Core Cards: {placedCore.length}</div>
                  <div>Policies Used: {policyHistory.length}</div>
                  <div>Unique Policies Used: {uniquePoliciesUsed}</div>
                  <div>Settlement Turns: {settlementHistory.length}</div>
                  <div>Industry: {resources.industry ?? 0}</div>
                  <div>Tech: {resources.tech ?? 0}</div>
                  <div>Population: {resources.population ?? 0}</div>
                  <div>Green: {metrics.green ?? 0}</div>
                  <div>Carbon: {metrics.carbon ?? 0}</div>
                  <div>Satisfaction: {metrics.satisfaction ?? 0}</div>
                  <div>Quota: {tradeQuota}</div>
                  <div>Trade Profit: {tradeProfit.toFixed(1)}</div>
                  <div>Negative Events: {Number(eventStats.negativeTriggered || 0)}</div>
                  <div>Resolved Events: {Number(eventStats.negativeResolved || 0)}</div>
                  <div>Resolve Rate: {resolveRate}%</div>
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleOpenArchive}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm"
                >
                  Skip
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                >
                  Restart
                </button>
                <button
                  onClick={() => router.push(`/${locale}/game`)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm"
                >
                  Back to Game Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
