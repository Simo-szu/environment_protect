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
import { useGamePlayEffects } from './useGamePlayEffects';
import {
  BoardViewMode,
  ComboRecord,
  CarbonTradeState,
  EndingView,
  EventRecord,
  getErrorMessage,
  GuidedAction,
  GuidedTask,
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
  UnknownRecord,
  DEFAULT_STORAGE_BASE
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
  const [tradeAmount, setTradeAmount] = useState(1);
  const [endingCountdown, setEndingCountdown] = useState(0);
  const [transitionAnimationEnabled, setTransitionAnimationEnabled] = useState(true);
  const [transitionNotice, setTransitionNotice] = useState<TransitionNotice | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [guidedTutorialActive, setGuidedTutorialActive] = useState(false);
  const [draggingCoreId, setDraggingCoreId] = useState('');
  const [dragOverTile, setDragOverTile] = useState('');
  const [boardViewMode, setBoardViewMode] = useState<BoardViewMode>('smart');
  const [corePeekOpen, setCorePeekOpen] = useState(false);
  const previousSettlementLengthRef = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const endingTimerRef = useRef<number | null>(null);

  const resources = (pondState?.resources || {}) as ResourceState;
  const metrics = (pondState?.metrics || {}) as MetricState;
  const handCore = Array.isArray(pondState?.handCore) ? (pondState?.handCore as string[]) : [];
  const handPolicy = Array.isArray(pondState?.handPolicy) ? (pondState?.handPolicy as string[]) : [];
  const placedCore = Array.isArray(pondState?.placedCore) ? (pondState?.placedCore as string[]) : [];
  const turn = Number(pondState?.turn ?? 1);
  const maxTurn = Number(pondState?.maxTurn ?? 30);
  const corePlacedThisTurn = Boolean(pondState?.corePlacedThisTurn);
  const policyUsedThisTurn = Boolean(pondState?.policyUsedThisTurn);
  const boardSize = Number(pondState?.boardSize || 6);
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
  const lowCarbonScore = Number(metrics.lowCarbonScore ?? 0);

  const tradeWindowOpened = Boolean(carbonTrade.windowOpened);
  const tradeLastPrice = Number(carbonTrade.lastPrice || 2);
  const tradeQuota = Number(carbonTrade.quota || 0);
  const tradeProfit = Number(carbonTrade.profit || 0);
  const tradeHistory = Array.isArray(carbonTrade.history) ? carbonTrade.history : [];
  const latestTradeRecord = tradeHistory.length > 0 ? tradeHistory[tradeHistory.length - 1] : null;
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
    boardSize,
    boardOccupied,
    freePlacementEnabled
  });

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
        (task.id === 'select_core' && !!selectedCoreId)
        || (task.id === 'select_tile' && !!selectedTile)
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
    turnTransitionAnimationSeconds,
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

  function resolveImageUrl(imageKey?: string | null): string {
    if (!imageKey) {
      return '';
    }
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey;
    }
    return `${DEFAULT_STORAGE_BASE}/${imageKey}`;
  }

  function formatDelta(value: number): string {
    return `${value > 0 ? '+' : ''}${value}`;
  }

  function applyActionResult(response: GameActionResponse) {
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
      setError(getErrorMessage(e) || 'Action failed');
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
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Carbon trade failed');
    } finally {
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
      setError(getErrorMessage(e) || t('play.errors.removeFailed', '移除核心卡失败'));
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
      const message = getErrorMessage(e) || t('play.errors.discardFailed', '弃牌失败');
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
    } catch (e: unknown) {
      setError(getErrorMessage(e) || t('play.errors.refreshFailed', '刷新失败'));
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
      router.push(`/${locale}/game`);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || t('play.errors.endSessionFailed', '结束对局失败'));
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
      window.location.reload();
    } catch (e: unknown) {
      setError(getErrorMessage(e) || t('play.errors.endSessionFailed', '结束对局失败'));
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

  const endTurnDisabled = actionLoading || sessionControlLoading || !!ending || pendingDiscardBlocking || !guidedActionAllowed('end_turn');
  const tradeActionDisabled = actionLoading || !tradeWindowOpened || !!ending || pendingDiscardBlocking || strictGuideMode || !guidedActionAllowed('trade');

  return {
    t,
    loading,
    actionLoading,
    sessionControlLoading,
    error,
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
    guidedTutorialActive,
    currentGuidedTask,
    tradeType,
    setTradeType,
    tradeAmount,
    setTradeAmount,
    runTradeAction,
    tradeActionDisabled,
    tradeActionBlockedReason,
    tradeWindowInterval,
    guidedTaskProgress,
    guidedTutorialCompleted,
    setGuidedTutorialActive,
    resources,
    metrics,
    lowCarbonScore,
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
    handPolicySet,
    pendingDiscardBlocking,
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
