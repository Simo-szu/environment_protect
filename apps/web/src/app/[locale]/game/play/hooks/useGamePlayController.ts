'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  endSession,
  GameActionResponse,
  GameCardMeta,
  getSessionById,
  performAction,
  removeCoreCard,
  tradeCarbon
} from '@/lib/api/game';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { getPublicSystemConfig } from '@/lib/api/system';
import { useGamePlayEffects } from './useGamePlayEffects';
import {
  BoardViewMode,
  ComboRecord,
  CarbonTradeState,
  EndingView,
  EventRecord,
  getErrorMessage,
  isConnectionIssueMessage,
  GuidedAction,
  GuidedTask,
  LowCarbonScoreBreakdown,
  MetricState,
  PendingDiscardState,
  PLAY_ONBOARDING_STORAGE_KEY,
  PolicyRecord,
  PondState,
  ResourceState,
  resolveComboName,
  resolveEventLabel,
  resolvePolicyHintByEvent,
  resolvePolicyIdsByEvent,
  resolveTransitionNotice,
  SettlementRecord,
  TimelineItem,
  TransitionNotice,
  TURN_ANIMATION_STORAGE_KEY,
  TurnFlowStep,
  UnknownRecord
} from './gamePlay.shared';
import { useGamePlayBoardCardSelectors } from './useGamePlayBoardCardSelectors';

export type {
  BoardViewMode,
  CoreCardAffordability,
  EndingView,
  GuidedAction,
  GuidedTask,
  TileSynergyBreakdown,
  TransitionNotice,
  TurnFlowStep
} from './gamePlay.shared';

export function useGamePlayController() {
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
        body: t('play.onboarding.step3.body', '先选一张核心卡，再点棋盘空地，最后点击“放置核心卡”。每回合放置上限为 1 张，放置后请点击“结束回合”看结算变化。')
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
        detail: t('play.guided.placeCore.detail', '点击“放置核心卡”提交本回合放置。注意：每回合最多只能放置 1 张核心卡。')
      },
      {
        id: 'end_turn',
        title: t('play.guided.endTurn.title', '结束回合并结算'),
        detail: t('play.guided.endTurn.detail', '本回合放置完成后，点击右上角“结束回合”进入下一回合（本回合不能再放第二张核心卡）。')
      }
    ],
    [t]
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sessionControlLoading, setSessionControlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [pondState, setPondState] = useState<PondState | null>(null);
  const [catalog, setCatalog] = useState<Map<string, GameCardMeta>>(new Map());
  const [selectedCoreId, setSelectedCoreId] = useState('');
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [selectedTile, setSelectedTile] = useState<string>('');
  const [selectedOccupiedTile, setSelectedOccupiedTile] = useState<string>('');
  const [ending, setEnding] = useState<EndingView | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState<number | ''>(1);
  const [endingCountdown, setEndingCountdown] = useState(0);
  const [transitionAnimationEnabled, setTransitionAnimationEnabled] = useState(true);
  const [transitionNotice, setTransitionNotice] = useState<TransitionNotice | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [guidedTutorialActive, setGuidedTutorialActive] = useState(false);
  const [storageBaseUrl, setStorageBaseUrl] = useState(
    () => (process.env.NEXT_PUBLIC_STORAGE_BASE_URL || '').trim().replace(/\/+$/, '')
  );
  const [draggingCoreId, setDraggingCoreId] = useState('');
  const [dragOverTile, setDragOverTile] = useState('');
  const [boardViewMode, setBoardViewMode] = useState<BoardViewMode>('smart');
  const [corePeekOpen, setCorePeekOpen] = useState(false);
  const previousSettlementLengthRef = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const endingTimerRef = useRef<number | null>(null);
  const recoveredTimerRef = useRef<number | null>(null);
  const tradeRequestInFlightRef = useRef(false);
  const [connectionState, setConnectionState] = useState<'online' | 'retrying' | 'offline' | 'recovered'>('online');

  function clearSavedSessionId() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('game:lastSessionId');
    }
  }

  const resources = (pondState?.resources || {}) as ResourceState;
  const metrics = (pondState?.metrics || {}) as MetricState;
  const handCore = Array.isArray(pondState?.handCore) ? (pondState?.handCore as string[]) : [];
  const handPolicy = Array.isArray(pondState?.handPolicy) ? (pondState?.handPolicy as string[]) : [];
  const placedCore = Array.isArray(pondState?.placedCore) ? (pondState?.placedCore as string[]) : [];
  const turn = Number(pondState?.turn ?? 1);
  const maxTurn = Number(pondState?.maxTurn ?? 30);
  const corePlacedThisTurn = Boolean(pondState?.corePlacedThisTurn);
  const policyUsedThisTurn = Boolean(pondState?.policyUsedThisTurn);
  const boardRows = Number(pondState?.boardRows || pondState?.boardSize || 6);
  const boardCols = Number(pondState?.boardCols || boardRows + 2);
  const boardSize = boardRows;
  const phase = String(pondState?.phase || 'early');
  const boardOccupied = (pondState?.boardOccupied || {}) as Record<string, string>;
  const domainProgress = (pondState?.domainProgress || {}) as UnknownRecord;
  const pendingDiscard = (pondState?.pendingDiscard || {}) as PendingDiscardState;
  const pendingDiscardActive = Boolean(pendingDiscard.active);
  const pendingDiscardCoreRequired = Math.max(0, Number(pendingDiscard.coreRequired ?? 0));
  const pendingDiscardPolicyRequired = Math.max(0, Number(pendingDiscard.policyRequired ?? 0));
  const pendingDiscardRequiredTotal = pendingDiscardCoreRequired + pendingDiscardPolicyRequired;
  const pendingDiscardTargetHandSize = Math.max(0, handCore.length + handPolicy.length - pendingDiscardRequiredTotal);
  const pendingDiscardBlocking = pendingDiscardActive;
  const carbonTrade = (pondState?.carbonTrade || {}) as CarbonTradeState;
  const activeNegativeEvents = Array.isArray(pondState?.activeNegativeEvents) ? (pondState?.activeNegativeEvents as EventRecord[]) : [];
  const eventHistory = Array.isArray(pondState?.eventHistory) ? (pondState?.eventHistory as EventRecord[]) : [];
  const comboHistory = Array.isArray(pondState?.comboHistory) ? (pondState?.comboHistory as ComboRecord[]) : [];
  const policyHistory = Array.isArray(pondState?.policyHistory) ? (pondState?.policyHistory as PolicyRecord[]) : [];
  const settlementHistory = Array.isArray(pondState?.settlementHistory) ? (pondState?.settlementHistory as SettlementRecord[]) : [];
  const policyUnlocked = Array.isArray(pondState?.policyUnlocked) ? (pondState?.policyUnlocked as string[]) : [];
  const eventStats = (pondState?.eventStats || {}) as UnknownRecord;
  const runtimeConfig = (pondState?.runtimeConfig || {}) as UnknownRecord;
  const lowCarbonScoreBreakdown = (pondState?.lowCarbonScoreBreakdown || null) as LowCarbonScoreBreakdown | null;
  const lowCarbonScore = Number(metrics.lowCarbonScore ?? 0);

  const tradeWindowOpened = Boolean(carbonTrade.windowOpened);
  const tradeLastPrice = Number(carbonTrade.lastPrice || 2);
  const tradeQuota = Number(carbonTrade.quota || 0);
  const tradeProfit = Number(carbonTrade.profit || 0);
  const tradeHistory = Array.isArray(carbonTrade.history) ? carbonTrade.history : [];
  const latestTradeRecord = tradeHistory.length > 0 ? tradeHistory[tradeHistory.length - 1] : null;
  const runtimeMaxCarbonQuotaRaw = Number(runtimeConfig.maxCarbonQuota);
  const maxCarbonQuota = Number.isFinite(runtimeMaxCarbonQuotaRaw) && runtimeMaxCarbonQuotaRaw > 0
    ? Math.floor(runtimeMaxCarbonQuotaRaw)
    : 120;
  const tradeQuotaCapacityLeft = Math.max(0, maxCarbonQuota - tradeQuota);
  const normalizedTradeAmount = useMemo(() => {
    const parsed = typeof tradeAmount === 'number' ? tradeAmount : Number(tradeAmount);
    if (!Number.isFinite(parsed)) {
      return 1;
    }
    return Math.max(1, Math.floor(parsed));
  }, [tradeAmount]);
  const estimatedTradeIndustryCost = useMemo(() => Math.ceil(normalizedTradeAmount * tradeLastPrice), [normalizedTradeAmount, tradeLastPrice]);
  const maxTradeAmount = useMemo(() => {
    if (tradeType === 'sell') {
      return Math.max(0, Math.floor(Number(tradeQuota) || 0));
    }
    const industryValue = Number(resources.industry ?? 0);
    const affordableByIndustry = tradeLastPrice > 0
      ? Math.max(0, Math.floor(industryValue / tradeLastPrice))
      : 0;
    return Math.max(0, Math.min(tradeQuotaCapacityLeft, affordableByIndustry));
  }, [tradeType, tradeQuota, resources.industry, tradeLastPrice, tradeQuotaCapacityLeft]);
  const uniquePoliciesUsed = useMemo(
    () => new Set(policyHistory.map((record) => String(record.policyId || ''))).size,
    [policyHistory]
  );
  const endingDisplaySeconds = Math.max(1, Number(runtimeConfig.endingDisplaySeconds || 5));
  const turnTransitionAnimationDefault = runtimeConfig.turnTransitionAnimationEnabledDefault !== false;
  const turnTransitionAnimationSeconds = Math.max(1, Number(runtimeConfig.turnTransitionAnimationSeconds || 2));
  const freePlacementEnabled = runtimeConfig.freePlacementEnabled !== false;
  const rawTradeWindowInterval = Number(runtimeConfig.tradeWindowInterval);
  const tradeWindowInterval = Number.isFinite(rawTradeWindowInterval) && rawTradeWindowInterval > 0
    ? Math.floor(rawTradeWindowInterval)
    : 0;

  const {
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
  } = useGamePlayBoardCardSelectors({
    handCore,
    handPolicy,
    catalog,
    selectedCoreId,
    selectedPolicyId,
    selectedTile,
    resources,
    metrics,
    boardRows,
    boardCols,
    boardOccupied,
    freePlacementEnabled
  });

  const selectedCoreDomainLabel = useMemo(() => {
    const raw = String(selectedCoreCard?.domain || '').toLowerCase();
    if (raw.includes('industry') || raw.includes('工业')) {
      return t('play.domains.industry', '工业');
    }
    if (raw.includes('ecology') || raw.includes('生态')) {
      return t('play.domains.ecology', '生态');
    }
    if (raw.includes('science') || raw.includes('科学') || raw.includes('科技')) {
      return t('play.domains.science', '科学');
    }
    if (raw.includes('society') || raw.includes('社会') || raw.includes('人文')) {
      return t('play.domains.society', '社会');
    }
    return t('play.domains.policy', '板块');
  }, [selectedCoreCard?.domain, t]);

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
    if (selectedCoreAffordability && !selectedCoreAffordability.canPlace) {
      if (selectedCoreAffordability.blockedReason === 'no_placeable_tile') {
        return t(
          'play.actions.blocked.noPlaceableTileDetailed',
          '当前没有可用落点：{domain}卡需要放在对应板块区域，且必须与已放置卡正交相邻。请更换核心卡或结束回合。',
          { domain: selectedCoreDomainLabel }
        );
      }
      return t('play.actions.blocked.insufficient', '资源不足，暂时无法放置。');
    }
    if (!selectedTile) {
      return t('play.actions.blocked.selectTile', '请先选择棋盘空位。');
    }
    if (!selectedTilePlaceable) {
      return adjacencyRequired
        ? t('play.actions.blocked.mustBeAdjacent', '该格子必须与已放置卡牌正交相邻。')
        : t('play.actions.blocked.tileInvalid', '当前格子不可放置，请选择高亮可用格。');
    }
    return '';
  }, [pendingDiscardBlocking, corePlacedThisTurn, selectedCoreId, selectedTile, selectedTilePlaceable, adjacencyRequired, selectedCoreAffordability, selectedCoreDomainLabel, t]);

  const policyActionBlockedReason = useMemo(() => {
    if (pendingDiscardBlocking) {
      return t('play.actions.blocked.discardFirst', '请先完成弃牌。');
    }
    if (policyUsedThisTurn) {
      return t('play.actions.blocked.policyUsed', '本回合已使用过政策卡。');
    }
    if (strictGuideMode && activeNegativeEvents.length === 0) {
      return t('play.actions.blocked.guidePolicyLocked', '引导阶段前3回合暂不开放政策卡操作。');
    }
    if (!selectedPolicyId) {
      return t('play.actions.blocked.selectPolicy', '请先选择政策卡。');
    }
    return '';
  }, [pendingDiscardBlocking, policyUsedThisTurn, strictGuideMode, activeNegativeEvents.length, selectedPolicyId, t]);

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
    if (maxTradeAmount <= 0) {
      return tradeType === 'buy'
        ? t('play.trade.errors.quotaCapacityReached', '当前配额容量已满或产业值不足，无法继续买入。')
        : t('play.trade.errors.insufficientQuota', '配额不足：卖出 {amount} 需要至少 {amount} 配额，当前仅有 {current}。', {
          amount: 1,
          current: Number(tradeQuota)
        });
    }
    if (normalizedTradeAmount > maxTradeAmount) {
      return tradeType === 'buy'
        ? t('play.trade.errors.buyAmountTooHigh', '买入数量过高：本回合最多可买入 {max}。', { max: maxTradeAmount })
        : t('play.trade.errors.sellAmountTooHigh', '卖出数量过高：本回合最多可卖出 {max}。', { max: maxTradeAmount });
    }
    if (tradeType === 'buy') {
      if (Number(resources.industry ?? 0) < estimatedTradeIndustryCost) {
        return t(
          'play.trade.errors.insufficientIndustry',
          '产业值不足：买入 {amount} 配额需 {cost} 产业值，当前仅有 {current}。',
          {
            amount: normalizedTradeAmount,
            cost: estimatedTradeIndustryCost,
            current: Number(resources.industry ?? 0)
          }
        );
      }
    } else if (Number(tradeQuota) < normalizedTradeAmount) {
      return t(
        'play.trade.errors.insufficientQuota',
        '配额不足：卖出 {amount} 需要至少 {amount} 配额，当前仅有 {current}。',
        {
          amount: normalizedTradeAmount,
          current: Number(tradeQuota)
        }
      );
    }
    return '';
  }, [
    pendingDiscardBlocking,
    strictGuideMode,
    tradeWindowOpened,
    tradeType,
    resources.industry,
    estimatedTradeIndustryCost,
    normalizedTradeAmount,
    maxTradeAmount,
    tradeQuota,
    t
  ]);

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
        (task.id === 'select_core' && (!!selectedCoreId || corePlacedThisTurn || placedCore.length > 0 || turn > 1))
        || (task.id === 'select_tile' && (!!selectedTile || corePlacedThisTurn || placedCore.length > 0))
        || (task.id === 'place_core' && (corePlacedThisTurn || placedCore.length > 0))
        || (task.id === 'end_turn' && (turn > 1 || settlementHistory.length > 0))
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

  const removeActionBlockedReason = useMemo(() => {
    if (pendingDiscardBlocking) {
      return t('play.actions.blocked.discardFirst', '请先完成弃牌。');
    }
    if (!!ending) {
      return t('play.actions.blocked.sessionEnded', '当前对局已结束。');
    }
    if (guidedGateEnabled && !guidedTutorialCompleted) {
      return t('play.actions.blocked.guideRemoveLocked', '引导未完成前暂不开放移除操作。');
    }
    if (!selectedOccupiedTile) {
      return t('play.actions.blocked.selectOccupiedTile', '请先选择一个已放置核心卡的棋盘格。');
    }
    return '';
  }, [pendingDiscardBlocking, ending, guidedGateEnabled, guidedTutorialCompleted, selectedOccupiedTile, t]);

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

  useEffect(() => {
    if (!selectedOccupiedTile) {
      return;
    }
    if (boardOccupied[selectedOccupiedTile]) {
      return;
    }
    setSelectedOccupiedTile('');
  }, [selectedOccupiedTile, boardOccupied]);

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

  useGamePlayEffects({
    t,
    setLoading,
    setError,
    setCatalog,
    setSessionId,
    setPondState,
    setShowOnboarding,
    setOnboardingStep,
    setGuidedTutorialActive,
    setEnding,
    setEndingCountdown,
    setTransitionAnimationEnabled,
    setTransitionNotice,
    setLastMessage,
    turnTransitionAnimationDefault,
    ending,
    endingDisplaySeconds,
    endingTimerRef,
    transitionTimerRef,
    previousSettlementLengthRef,
    settlementHistory,
    transitionAnimationEnabled,
    activeNegativeEvents,
    turn,
    guidedTutorialActive,
    guidedTutorialCompleted,
    onEndingTimeout: handleOpenArchive,
    resolveTransitionNotice: (
      settlement: Record<string, unknown> | undefined,
      activeEvents: Array<Record<string, unknown>>
    ) => resolveTransitionNotice(settlement, activeEvents as EventRecord[]),
    getErrorMessage,
    onboardingStorageKey: PLAY_ONBOARDING_STORAGE_KEY,
    animationStorageKey: TURN_ANIMATION_STORAGE_KEY
  });

  useEffect(() => {
    return () => {
      if (recoveredTimerRef.current !== null) {
        window.clearTimeout(recoveredTimerRef.current);
        recoveredTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fallbackBase = (process.env.NEXT_PUBLIC_STORAGE_BASE_URL || '').trim().replace(/\/+$/, '');
    async function loadPublicConfig() {
      try {
        const config = await getPublicSystemConfig();
        const nextBase = typeof config?.storageBaseUrl === 'string' ? config.storageBaseUrl.trim() : '';
        if (!cancelled && nextBase) {
          setStorageBaseUrl(nextBase.replace(/\/+$/, ''));
        }
      } catch {
        // Keep env fallback when public config is unavailable.
        if (!cancelled && fallbackBase) {
          setStorageBaseUrl(fallbackBase);
        }
      }
    }
    void loadPublicConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  function resolveImageUrl(imageKey?: string | null): string | undefined {
    if (!imageKey) {
      return undefined;
    }
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey;
    }
    let normalizedKey = imageKey;
    if ((normalizedKey.startsWith('endings/') || normalizedKey.startsWith('events/')) && /\.jpe?g$/i.test(normalizedKey)) {
      normalizedKey = normalizedKey.replace(/\.jpe?g$/i, '.webp');
    }
    const base = storageBaseUrl.trim().replace(/\/+$/, '');
    if (!base) {
      return undefined;
    }
    return `${base}/${normalizedKey.replace(/^\/+/, '')}`;
  }

  function formatDelta(value: number): string {
    return `${value > 0 ? '+' : ''}${value}`;
  }

  function markConnectionRecovered() {
    setConnectionState('recovered');
    if (recoveredTimerRef.current !== null) {
      window.clearTimeout(recoveredTimerRef.current);
    }
    recoveredTimerRef.current = window.setTimeout(() => {
      setConnectionState('online');
      recoveredTimerRef.current = null;
    }, 2400);
  }

  function handleRequestError(error: unknown, fallbackMessage: string): string {
    const rawMessage = getErrorMessage(error) || fallbackMessage;
    const normalizedRaw = String(rawMessage || '').toLowerCase();
    let message = rawMessage;
    if (normalizedRaw.includes('insufficient industry value for trade')) {
      message = t(
        'play.trade.errors.insufficientIndustry',
        '产业值不足：买入 {amount} 配额需 {cost} 产业值，当前仅有 {current}。',
        {
          amount: normalizedTradeAmount,
          cost: estimatedTradeIndustryCost,
          current: Number(resources.industry ?? 0)
        }
      );
    } else if (normalizedRaw.includes('insufficient quota for selling')) {
      message = t(
        'play.trade.errors.insufficientQuota',
        '配额不足：卖出 {amount} 需要至少 {amount} 配额，当前仅有 {current}。',
        {
          amount: normalizedTradeAmount,
          current: Number(tradeQuota)
        }
      );
    } else if (normalizedRaw.includes('carbon trade window is not open')) {
      message = t('play.actions.blocked.tradeClosed', '当前回合不可交易。');
    } else if (normalizedRaw.includes('quota exceeds maximum capacity')) {
      message = t('play.trade.errors.quotaCapacityReached', '当前配额容量已满或产业值不足，无法继续买入。');
    } else if (normalizedRaw.includes('trade amount exceeds supported range')) {
      message = t('play.trade.errors.tradeAmountOutOfRange', '交易数量超出系统支持范围，请降低交易配额后重试。');
    } else if (normalizedRaw.includes('discard required before other actions')) {
      message = t('play.actions.blocked.discardFirst', '请先完成弃牌。');
    }
    if (isConnectionIssueMessage(message)) {
      setConnectionState('offline');
      setLastMessage(t('play.errors.connectionHint', '网络连接异常，已暂停当前操作。请重试连接。'));
    }
    return message;
  }

  function applyActionResult(response: GameActionResponse) {
    if (connectionState === 'offline' || connectionState === 'retrying') {
      markConnectionRecovered();
      setLastMessage(t('play.errors.connectionRecovered', '连接已恢复，状态已同步。'));
    }
    const nextState = (response.newPondState || {}) as PondState;
    setPondState(nextState);
    if (sessionId) {
      window.sessionStorage.setItem('game:lastSessionId', sessionId);
    }
    setLastMessage(typeof response.message === 'string' ? response.message : '');
    setSelectedCoreId('');
    setSelectedPolicyId('');
    setSelectedTile('');
    setSelectedOccupiedTile('');

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
        turn: Number(nextState.turn ?? turn)
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
      const affordability = coreAffordabilityMap.get(cardId);
      if (affordability?.blockedReason === 'no_placeable_tile') {
        setError(
          t(
            'play.actions.blocked.noPlaceableTileDetailed',
            '当前没有可用落点：{domain}卡需要放在对应板块区域，且必须与已放置卡正交相邻。请更换核心卡或结束回合。',
            { domain: selectedCoreDomainLabel }
          )
        );
      } else {
        setError(t('play.actions.blocked.insufficient', '资源不足，暂时无法放置。'));
      }
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

  async function runAction(actionType: number, actionData?: UnknownRecord) {
    if (!sessionId) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const response = await performAction({ sessionId, actionType, actionData });
      applyActionResult(response);
    } catch (e: unknown) {
      setError(handleRequestError(e, 'Action failed'));
    } finally {
      setActionLoading(false);
    }
  }

  async function runTradeAction() {
    if (!sessionId) {
      return;
    }
    if (tradeRequestInFlightRef.current) {
      return;
    }
    if (tradeActionBlockedReason) {
      setError(tradeActionBlockedReason);
      return;
    }
    tradeRequestInFlightRef.current = true;
    setActionLoading(true);
    setError(null);
    try {
      const parsedTradeAmount = typeof tradeAmount === 'number' ? tradeAmount : Number(tradeAmount);
      const normalizedAmount = Number.isFinite(parsedTradeAmount) ? Math.max(1, Math.floor(parsedTradeAmount)) : 1;
      const amount = Math.min(normalizedAmount, Math.max(1, maxTradeAmount));
      setTradeAmount(amount);
      const response = await tradeCarbon({
        sessionId,
        tradeType,
        amount
      });
      applyActionResult(response);
    } catch (e: unknown) {
      const rawMessage = (getErrorMessage(e) || '').toLowerCase();
      // Enhanced error handling for trade window synchronization issues
      if (rawMessage.includes('carbon trade window is not open') || 
          rawMessage.includes('window_not_open') ||
          rawMessage.includes('trade window')) {
        // Force refresh session state to sync trade window status
        await refreshSession();
        setError(t('play.trade.errors.windowClosed', '交易窗口已关闭，状态已同步。请在下个交易回合重试。'));
      } else {
        setError(handleRequestError(e, 'Carbon trade failed'));
      }
    } finally {
      tradeRequestInFlightRef.current = false;
      setActionLoading(false);
    }
  }

  async function runRemoveCoreAction() {
    if (!sessionId || !selectedOccupiedTile) {
      return;
    }
    const [row, col] = selectedOccupiedTile.split(',').map((v) => Number(v));
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      setError(t('play.actions.blocked.selectOccupiedTile', '请先选择一个已放置核心卡的棋盘格。'));
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const response = await removeCoreCard({ sessionId, row, col });
      applyActionResult(response);
    } catch (e: unknown) {
      setError(handleRequestError(e, t('play.errors.removeFailed', '移除核心卡失败')));
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
    } catch (e: unknown) {
      const message = handleRequestError(e, t('play.errors.discardFailed', '弃牌失败'));
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

  function handleCoreCardSelect(cardId: string) {
    if (!cardId) {
      return;
    }
    if (pendingDiscardBlocking) {
      setError(t('play.actions.blocked.discardFirst', '请先完成弃牌。'));
      return;
    }
    if (corePlacedThisTurn) {
      setError(t('play.actions.blocked.alreadyPlaced', '本回合已放置过核心卡。'));
      return;
    }
    if (ending) {
      setError(t('play.actions.blocked.sessionEnded', '当前对局已结束。'));
      return;
    }
    setSelectedPolicyId('');
    setSelectedCoreId((current) => (current === cardId ? '' : cardId));
  }

  function resolvePolicyDisplayLabel(policyId: string) {
    const id = String(policyId || '').trim();
    if (!id) {
      return '';
    }
    const card = catalog.get(id);
    if (!card) {
      return id;
    }
    const zhName = String(card.chineseName || '').trim();
    const enName = String(card.englishName || '').trim();
    const preferredName = locale === 'zh'
      ? (zhName || enName)
      : (enName || zhName);
    if (!preferredName) {
      return id;
    }
    if (preferredName.toLowerCase() === id.toLowerCase()) {
      return preferredName;
    }
    return `${preferredName} (${id})`;
  }

  async function refreshSession() {
    if (!sessionId) {
      return;
    }
    setConnectionState('retrying');
    setLastMessage(t('play.errors.reconnecting', '正在重连游戏服务...'));
    try {
      const current = await getSessionById(sessionId);
      setSessionId(current.id);
      setPondState((current.pondState || {}) as PondState);
      markConnectionRecovered();
      setLastMessage(t('play.errors.connectionRecovered', '连接已恢复，状态已同步。'));
    } catch (e: unknown) {
      setError(handleRequestError(e, t('play.errors.refreshFailed', '刷新失败')));
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
      clearSavedSessionId();
      router.push(`/${locale}/game`);
    }
  }

  async function handleExitSession() {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(t('play.actions.confirmExit', '确认退出当前对局？未结算回合进度将丢失。'));
      if (!confirmed) {
        return;
      }
    }
    setSessionControlLoading(true);
    setError(null);
    try {
      if (sessionId) {
        await endSession(sessionId);
      }
      clearSavedSessionId();
      router.push(`/${locale}/game`);
    } catch (e: unknown) {
      setError(handleRequestError(e, t('play.errors.endSessionFailed', '结束对局失败')));
    } finally {
      setSessionControlLoading(false);
    }
  }

  async function handleRestartSession() {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(t('play.actions.confirmRestart', '确认结束当前对局并开始新对局？'));
      if (!confirmed) {
        return;
      }
    }
    setSessionControlLoading(true);
    setError(null);
    try {
      if (sessionId) {
        await endSession(sessionId);
      }
      clearSavedSessionId();
      window.location.reload();
    } catch (e: unknown) {
      setError(handleRequestError(e, t('play.errors.endSessionFailed', '结束对局失败')));
      setSessionControlLoading(false);
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

  function openGuide() {
    setShowOnboarding(true);
    setOnboardingStep(0);
    setGuidedTutorialActive(true);
  }

  function toggleTransitionAnimation(checked: boolean) {
    setTransitionAnimationEnabled(checked);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TURN_ANIMATION_STORAGE_KEY, checked ? '1' : '0');
    }
  }

  function endTurn() {
    void runAction(2);
  }

  const endTurnBlockedReason = useMemo(() => {
    if (actionLoading || sessionControlLoading) {
      return t('play.actions.blocked.processing', 'Action is processing.');
    }
    if (ending) {
      return t('play.actions.blocked.sessionEnded', '当前对局已结束。');
    }
    if (pendingDiscardBlocking) {
      return t('play.actions.blocked.discardFirst', '请先完成弃牌。');
    }
    if (guidedGateEnabled && currentGuidedTask?.id && currentGuidedTask.id !== 'end_turn') {
      return t('play.actions.blocked.followGuide', '请先完成当前引导步骤。');
    }
    return '';
  }, [actionLoading, sessionControlLoading, ending, pendingDiscardBlocking, guidedGateEnabled, currentGuidedTask, t]);

  const endTurnDisabled = actionLoading || sessionControlLoading || !!ending || pendingDiscardBlocking || !guidedActionAllowed('end_turn');
  const tradeActionDisabled = actionLoading
    || !tradeWindowOpened
    || !!ending
    || pendingDiscardBlocking
    || strictGuideMode
    || !guidedActionAllowed('trade')
    || !!tradeActionBlockedReason;

  return {
    t,
    loading,
    actionLoading,
    sessionControlLoading,
    error,
    connectionState,
    lastMessage,
    turn,
    maxTurn,
    phase,
    turnFlowSteps,
    strictGuideMode,
    handleBack,
    handleOpenArchive,
    refreshSession,
    handleRestartSession,
    handleExitSession,
    openGuide,
    transitionAnimationEnabled,
    toggleTransitionAnimation,
    endTurn,
    endTurnDisabled,
    endTurnBlockedReason,
    guidedTutorialActive,
    currentGuidedTask,
    tradeType,
    setTradeType,
    tradeAmount,
    setTradeAmount,
    runTradeAction,
    tradeActionDisabled,
    tradeActionBlockedReason,
    normalizedTradeAmount,
    estimatedTradeIndustryCost,
    tradeWindowInterval,
    maxTradeAmount,
    maxCarbonQuota,
    guidedTaskProgress,
    guidedTutorialCompleted,
    setGuidedTutorialActive,
    resources,
    metrics,
    lowCarbonScore,
    lowCarbonScoreBreakdown,
    domainProgress,
    selectedCorePlacementPreview,
    selectedCorePreviewReady,
    formatDelta,
    selectedCoreCard,
    selectedTileAdjacency,
    selectedTile,
    recommendedTile,
    selectedTileSynergyBreakdown,
    placedCore,
    corePlacedThisTurn,
    tradeQuota,
    tradeLastPrice,
    tradeProfit,
    latestTradeRecord,
    tradeWindowOpened,
    activeNegativeEvents,
    resolveEventLabel,
    resolvePolicyHintByEvent,
    resolvePolicyIdsByEvent,
    resolvePolicyDisplayLabel,
    handPolicySet,
    pendingDiscardBlocking,
    pendingDiscardCoreRequired,
    pendingDiscardPolicyRequired,
    pendingDiscardRequiredTotal,
    pendingDiscardTargetHandSize,
    selectPolicyForEvent,
    timelineItems,
    boardViewMode,
    setBoardViewMode,
    selectedCoreId,
    placeableTileKeySet,
    boardPlacementMode,
    boardSize,
    boardRows,
    boardCols,
    boardOccupied,
    selectedOccupiedTile,
    tileAdjacencyScoreMap,
    tileSynergyBreakdownMap,
    adjacencyRequired,
    ending,
    guidedActionAllowed,
    setSelectedOccupiedTile,
    setSelectedTile,
    dragOverTile,
    setDragOverTile,
    draggingCoreId,
    setDraggingCoreId,
    handleCoreCardSelect,
    setSelectedCoreId,
    setError,
    setLastMessage,
    setTransitionNotice,
    handCoreCards,
    pendingDiscardActive,
    canPlaceCoreCard,
    coreAffordabilityMap,
    discardCard,
    resolveImageUrl,
    setCorePeekOpen,
    selectedCoreAffordability,
    placeCoreCard,
    runRemoveCoreAction,
    guidedGateEnabled,
    placeActionBlockedReason,
    removeActionBlockedReason,
    handPolicyCards,
    setSelectedPolicyId,
    selectedPolicyId,
    runAction,
    policyUsedThisTurn,
    policyActionBlockedReason,
    selectedPolicyCard,
    selectedPolicyRiskLevel,
    selectedPolicyImmediateDelta,
    selectedPolicyHasImmediateDelta,
    guidedOverlayMessage,
    transitionNotice,
    showOnboarding,
    onboardingStep,
    onboardingSteps,
    closeOnboarding,
    setOnboardingStep,
    corePeekOpen,
    endingCountdown,
    policyHistory,
    policyUnlockedCount: policyUnlocked.length,
    uniquePoliciesUsed,
    settlementHistory,
    eventStats,
    catalog,
    locale
  };
}

export type GamePlayController = ReturnType<typeof useGamePlayController>;
