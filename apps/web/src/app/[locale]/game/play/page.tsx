'use client';

import { useEffect, useMemo, useState } from 'react';
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
