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
const ONBOARDING_STEPS = [
  {
    title: 'Turn Goal',
    body: 'Place one core card, optionally use one policy card, then end the turn to settle effects.'
  },
  {
    title: 'Board Placement',
    body: 'Select a core card in hand, pick an empty tile, then click "Place Core Card".'
  },
  {
    title: 'Policy and Event',
    body: 'Use policy cards to boost metrics and resolve negative events shown on the left panel.'
  },
  {
    title: 'Trade and Ending',
    body: 'Trade opens every few turns. Keep carbon in control and push toward a positive ending before turn 30.'
  }
] as const;

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
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [endingCountdown, setEndingCountdown] = useState(0);
  const [transitionAnimationEnabled, setTransitionAnimationEnabled] = useState(true);
  const [transitionNotice, setTransitionNotice] = useState<TransitionNotice | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
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
  const boardSize = Number(pondState?.boardSize || 6);
  const boardOccupied = (pondState?.boardOccupied || {}) as Record<string, string>;
  const pendingDiscard = (pondState?.pendingDiscard || {}) as Record<string, unknown>;
  const pendingDiscardActive = Boolean(pendingDiscard.active);
  const pendingDiscardExpiresAt = Number(pendingDiscard.expiresAt || 0);
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
  const tradeWindowExpiresAt = Number(carbonTrade.windowExpiresAt || 0);
  const tradeWindowSecondsLeft = tradeWindowOpened && tradeWindowExpiresAt > 0
    ? Math.max(0, Math.ceil((tradeWindowExpiresAt - nowTick) / 1000))
    : 0;
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
        }
        const endingState = ((sessionRes.pondState as PondState)?.ending || null) as EndingView | null;
        if (endingState?.endingId) {
          setEnding(endingState);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to initialize game');
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
    if (!tradeWindowOpened || tradeWindowExpiresAt <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 250);
    return () => {
      window.clearInterval(timer);
    };
  }, [tradeWindowOpened, tradeWindowExpiresAt]);

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
      setError(e?.message || 'Discard failed');
    } finally {
      setActionLoading(false);
    }
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
      setError(e?.message || 'Refresh failed');
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

  function closeOnboarding(markSeen: boolean) {
    if (markSeen && typeof window !== 'undefined') {
      window.localStorage.setItem(PLAY_ONBOARDING_STORAGE_KEY, '1');
    }
    setShowOnboarding(false);
    setOnboardingStep(0);
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading game...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            Back
          </button>
          <div className="font-semibold">Low Carbon City Card Game</div>
          <div className="text-xs text-slate-500">Turn {turn}/{maxTurn}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleOpenArchive} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            Archive
          </button>
          <button onClick={refreshSession} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            Refresh
          </button>
          <button
            onClick={() => {
              setShowOnboarding(true);
              setOnboardingStep(0);
            }}
            className="px-3 py-1.5 rounded border border-slate-300 text-sm"
          >
            Guide
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
            Turn Animation
          </label>
          <button
            onClick={() => runAction(2)}
            disabled={actionLoading || !!ending || pendingDiscardActive}
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm disabled:opacity-50"
          >
            End Turn
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-4">
        <section className="col-span-3 bg-white rounded border p-4 space-y-2">
          <div className="font-semibold">Resources</div>
          <div className="text-sm">Industry: {resources.industry ?? 0}</div>
          <div className="text-sm">Tech: {resources.tech ?? 0}</div>
          <div className="text-sm">Population: {resources.population ?? 0}</div>
          <div className="pt-3 font-semibold">Metrics</div>
          <div className="text-sm">Green: {metrics.green ?? 0}</div>
          <div className="text-sm">Carbon: {metrics.carbon ?? 0}</div>
          <div className="text-sm">Satisfaction: {metrics.satisfaction ?? 0}</div>
          <div className="pt-2 text-xs text-slate-500">Placed core cards: {placedCore.length}</div>
          <div className={`text-xs ${corePlacedThisTurn ? 'text-amber-600' : 'text-slate-500'}`}>
            {corePlacedThisTurn ? 'Core card already placed this turn' : 'You can place one core card this turn'}
          </div>
          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="font-semibold mb-1">Carbon Trade</div>
            <div className="text-sm">Quota: {tradeQuota}</div>
            <div className="text-sm">Current Price: {tradeLastPrice.toFixed(1)}</div>
            <div className="text-sm">Profit: {tradeProfit.toFixed(1)}</div>
            {latestTradeRecord && (
              <div className="text-xs text-slate-500 mt-1">
                Last: {String(latestTradeRecord.action)} / amount {Number(latestTradeRecord.amount || 0)}
              </div>
            )}
            <div className={`text-xs mt-1 ${tradeWindowOpened ? 'text-emerald-600' : 'text-slate-500'}`}>
              {tradeWindowOpened
                ? `Window Open (${tradeWindowSecondsLeft}s left)`
                : 'Window Closed'}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="font-semibold mb-1">Active Negative Events</div>
            {activeNegativeEvents.length === 0 && <div className="text-xs text-slate-500">None</div>}
            {activeNegativeEvents.map((event, idx) => (
              <div key={`${String(event.eventType)}-${idx}`} className="text-xs text-slate-600">
                <div>{String(event.eventType)} (remaining: {Number(event.remainingTurns || 0)})</div>
                <div className="text-slate-500">{resolvePolicyHintByEvent(String(event.eventType || ''))}</div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="font-semibold mb-1">Turn Timeline</div>
            {timelineItems.length === 0 && <div className="text-xs text-slate-500">No records yet</div>}
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
          <div className="font-semibold mb-3">Board</div>
          <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}>
            {Array.from({ length: boardSize * boardSize }).map((_, idx) => {
              const row = Math.floor(idx / boardSize);
              const col = idx % boardSize;
              const key = `${row},${col}`;
              const occupied = boardOccupied[key];
              const selected = selectedTile === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!!occupied || !!ending || pendingDiscardActive}
                  onClick={() => setSelectedTile(key)}
                  className={`h-8 rounded border text-[10px] ${
                    occupied
                      ? 'bg-slate-200 border-slate-300 text-slate-500'
                      : selected
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}
                  title={occupied ? occupied : `tile ${key}`}
                >
                  {occupied ? occupied.slice(-3) : ''}
                </button>
              );
            })}
          </div>

          <div className="font-semibold mb-3">Core Cards in Hand</div>
          <div className="grid grid-cols-3 gap-3">
            {handCoreCards.map((card) => (
              <button
                key={card.cardId}
                onClick={() => setSelectedCoreId(card.cardId)}
                className={`text-left border rounded p-2 ${selectedCoreId === card.cardId ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
              >
                <img src={resolveImageUrl(card.imageKey)} alt={card.chineseName} className="w-full h-40 object-cover rounded mb-2" />
                <div className="text-sm font-medium">{card.chineseName}</div>
                <div className="text-xs text-slate-500">{card.cardId}</div>
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
                runAction(1, { cardId: selectedCoreId, row, col });
              }}
              disabled={actionLoading || !selectedCoreId || !selectedTile || !!ending || corePlacedThisTurn || pendingDiscardActive}
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
            >
              Place Core Card
            </button>
          </div>
          {selectedCoreCard && (
            <div className="mt-4 p-3 rounded border border-blue-100 bg-blue-50/60 text-xs space-y-1">
              <div className="font-semibold text-sm">{selectedCoreCard.chineseName}</div>
              <div>Card ID: {selectedCoreCard.cardId}</div>
              <div>Domain: {selectedCoreCard.domain}</div>
              <div>Phase: {selectedCoreCard.phaseBucket}</div>
              <div>Star: {selectedCoreCard.star}</div>
              <div>
                Cost: I {selectedCoreCard.unlockCost.industry}, T {selectedCoreCard.unlockCost.tech},
                P {selectedCoreCard.unlockCost.population}, G {selectedCoreCard.unlockCost.green}
              </div>
            </div>
          )}
        </section>

        <section className="col-span-3 bg-white rounded border p-4">
          <div className="font-semibold mb-3">Policy Cards in Hand</div>
          <div className="space-y-2">
            {handPolicyCards.map((card) => (
              <button
                key={card.cardId}
                onClick={() => setSelectedPolicyId(card.cardId)}
                className={`w-full text-left border rounded p-2 ${selectedPolicyId === card.cardId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
              >
                <div className="text-sm font-medium">{card.chineseName}</div>
                <div className="text-xs text-slate-500">{card.cardId}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => selectedPolicyId && runAction(3, { cardId: selectedPolicyId })}
            disabled={actionLoading || !selectedPolicyId || !!ending || pendingDiscardActive}
            className="mt-3 px-3 py-1.5 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
          >
            Use Policy Card
          </button>
          {selectedPolicyCard && (
            <div className="mt-3 p-3 rounded border border-emerald-100 bg-emerald-50/60 text-xs space-y-1">
              <div className="font-semibold text-sm">{selectedPolicyCard.chineseName}</div>
              <div>Card ID: {selectedPolicyCard.cardId}</div>
              <div>Domain: {selectedPolicyCard.domain}</div>
              <div>Phase: {selectedPolicyCard.phaseBucket}</div>
              <div>Star: {selectedPolicyCard.star}</div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="font-semibold text-sm">Trade Action</div>
            <select
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
            >
              <option value="buy">Buy Quota</option>
              <option value="sell">Sell Quota</option>
            </select>
            <input
              type="number"
              min={1}
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value) || 1)}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
              placeholder="Amount"
            />
            <button
              onClick={runTradeAction}
              disabled={actionLoading || !tradeWindowOpened || tradeWindowSecondsLeft <= 0 || !!ending || pendingDiscardActive}
              className="w-full px-3 py-1.5 rounded bg-amber-600 text-white text-sm disabled:opacity-50"
            >
              Execute Trade
            </button>
          </div>
        </section>
      </main>

      {pendingDiscardActive && (
        <div className="px-6 pb-4">
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
            <div className="font-semibold text-amber-700">Discard Required</div>
            <div className="text-amber-700/90">
              Please discard cards within 10 seconds. Timeout: auto-discard oldest cards.
            </div>
            <div className="text-xs text-amber-700/80">
              Expires at: {pendingDiscardExpiresAt > 0 ? new Date(pendingDiscardExpiresAt).toLocaleTimeString() : '-'}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {handCore.map((id) => (
                <button
                  key={`d-core-${id}`}
                  onClick={() => discardCard('core', id)}
                  className="text-left px-2 py-1 rounded border border-amber-300 bg-white text-xs"
                >
                  Discard core: {id}
                </button>
              ))}
              {handPolicy.map((id) => (
                <button
                  key={`d-policy-${id}`}
                  onClick={() => discardCard('policy', id)}
                  className="text-left px-2 py-1 rounded border border-amber-300 bg-white text-xs"
                >
                  Discard policy: {id}
                </button>
              ))}
            </div>
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
              Quick Guide {onboardingStep + 1}/{ONBOARDING_STEPS.length}
            </div>
            <div className="text-xl font-semibold text-slate-800">
              {ONBOARDING_STEPS[onboardingStep].title}
            </div>
            <div className="text-sm text-slate-600 leading-6">
              {ONBOARDING_STEPS[onboardingStep].body}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => closeOnboarding(true)}
                className="px-3 py-1.5 rounded border border-slate-300 text-sm"
              >
                Skip
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnboardingStep((prev) => Math.max(0, prev - 1))}
                  disabled={onboardingStep <= 0}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm disabled:opacity-40"
                >
                  Prev
                </button>
                {onboardingStep < ONBOARDING_STEPS.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((prev) => Math.min(ONBOARDING_STEPS.length - 1, prev + 1))}
                    className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => closeOnboarding(true)}
                    className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                  >
                    Start Playing
                  </button>
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
