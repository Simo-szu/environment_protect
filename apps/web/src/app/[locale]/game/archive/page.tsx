'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { GameActionLogItem, GameCardMeta, getSessionById, listCards, listSessionActions } from '@/lib/api/game';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { resolveComboName, resolveEventLabel } from '@/app/[locale]/game/play/hooks/gamePlay.shared';
import { ArrowLeft, Archive, Clock, AlertTriangle } from 'lucide-react';

type AnyRecord = Record<string, any>;

interface TurnSnapshot {
  turn: number;
  industry: number;
  tech: number;
  population: number;
  green: number;
  carbon: number;
  satisfaction: number;
  endedAt?: string; // settlement timestamp
}

function safeAfter(node: AnyRecord | undefined): number {
  return Number(node?.after ?? 0);
}

function resolveEventText(record: AnyRecord, locale?: string): string {
  const eventType = String(record?.eventType || '');
  if (eventType === 'policy_unlock') {
    const policyId = String(record?.policyId || '-');
    return locale === 'zh' ? `解锁政策卡：${policyId}` : `Unlocked policy: ${policyId}`;
  }
  if (eventType === 'event_resolved') {
    const resolvedLabel = resolveEventLabel(String(record?.resolvedEvent || '-'), locale);
    const policyId = String(record?.policyId || '-');
    return locale === 'zh' ? `化解事件「${resolvedLabel}」（使用 ${policyId}）` : `Resolved "${resolvedLabel}" via ${policyId}`;
  }
  const label = resolveEventLabel(eventType, locale);
  return locale === 'zh' ? `触发事件：${label}` : `Triggered: ${label}`;
}

function resolveActionDesc(item: GameActionLogItem, cardMap: Map<string, GameCardMeta>, locale: string): string {
  const zh = locale === 'zh';
  const data = (item.actionData || {}) as AnyRecord;
  switch (item.actionType) {
    case 1: {
      const card = cardMap.get(String(data.cardId || ''));
      const name = card ? (zh ? card.chineseName : card.englishName) : String(data.cardId || '-');
      return zh ? `放置核心卡：${name}（位置 ${data.row},${data.col}）` : `Place core: ${name} at (${data.row},${data.col})`;
    }
    case 2: return zh ? '结束回合' : 'End turn';
    case 3: {
      const card = cardMap.get(String(data.cardId || ''));
      const name = card ? (zh ? card.chineseName : card.englishName) : String(data.cardId || '-');
      return zh ? `使用政策卡：${name}` : `Use policy: ${name}`;
    }
    case 4: {
      const tradeType = data.tradeType === 'buy' ? (zh ? '买入' : 'Buy') : (zh ? '卖出' : 'Sell');
      return zh ? `碳交易 ${tradeType} ${data.amount} 份` : `Carbon trade: ${tradeType} ${data.amount}`;
    }
    case 5: {
      const card = cardMap.get(String(data.cardId || ''));
      const name = card ? (zh ? card.chineseName : card.englishName) : String(data.cardId || '-');
      return zh ? `弃置卡牌：${name}` : `Discard: ${name}`;
    }
    case 6: return zh ? `移除核心卡（位置 ${data.row},${data.col}）` : `Remove core at (${data.row},${data.col})`;
    default: return zh ? `操作 #${item.actionType}` : `Action #${item.actionType}`;
  }
}

export default function GameArchivePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useSafeTranslation('game');
  const locale = params.locale as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AnyRecord | null>(null);
  const [selectedTurn, setSelectedTurn] = useState<number>(1);
  const [actions, setActions] = useState<GameActionLogItem[]>([]);
  const [cardMap, setCardMap] = useState<Map<string, GameCardMeta>>(new Map());

  const sessionIdFromUrl = searchParams.get('sessionId') || '';

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const sessionId = sessionIdFromUrl || window.sessionStorage.getItem('game:lastSessionId') || '';
        if (!sessionId) {
          setError(t('archive.replay.loadErrorNoSession', 'No available session for archive replay'));
          return;
        }
        const [session, catalog] = await Promise.all([
          getSessionById(sessionId),
          listCards(true)
        ]);
        const map = new Map<string, GameCardMeta>();
        catalog.items.forEach((c) => map.set(c.cardId, c));

        const actionItems: GameActionLogItem[] = [];
        let page = 1;
        const size = 100;
        while (true) {
          const response = await listSessionActions(sessionId, page, size);
          actionItems.push(...response.items);
          if (actionItems.length >= response.total || response.items.length < size) break;
          page += 1;
        }
        if (canceled) return;
        setCardMap(map);
        setActions(actionItems);
        const pondState = (session.pondState || {}) as AnyRecord;
        setState(pondState);
        const settlementHistory: AnyRecord[] = pondState.settlementHistory || [];
        const lastTurn = settlementHistory.length > 0
          ? Number(settlementHistory[settlementHistory.length - 1]?.turn || 1)
          : Number(pondState.turn || 1);
        setSelectedTurn(lastTurn);
      } catch (e: any) {
        if (!canceled) setError(e?.message || t('archive.replay.loadErrorFailed', 'Failed to load archive'));
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, [sessionIdFromUrl, t]);

  const settlementHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.settlementHistory) ? (state?.settlementHistory as AnyRecord[]) : []),
    [state]
  );
  const eventHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.eventHistory) ? (state?.eventHistory as AnyRecord[]) : []),
    [state]
  );
  const comboHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.comboHistory) ? (state?.comboHistory as AnyRecord[]) : []),
    [state]
  );
  const policyHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.policyHistory) ? (state?.policyHistory as AnyRecord[]) : []),
    [state]
  );

  const snapshots = useMemo(() => {
    return settlementHistory
      .map((entry) => ({
        turn: Number(entry?.turn || 0),
        industry: safeAfter(entry?.resources?.industry),
        tech: safeAfter(entry?.resources?.tech),
        population: safeAfter(entry?.resources?.population),
        green: safeAfter(entry?.metrics?.green),
        carbon: safeAfter(entry?.metrics?.carbon),
        satisfaction: safeAfter(entry?.metrics?.satisfaction),
        endedAt: String(entry?.endedAt || ''),
      }))
      .filter((row) => row.turn > 0);
  }, [settlementHistory]);

  // Group actions by turn using settlement timestamps as boundaries
  const actionsByTurn = useMemo(() => {
    const map = new Map<number, GameActionLogItem[]>();
    if (snapshots.length === 0 || actions.length === 0) return map;

    // Build turn boundaries: actions before snapshot[i].endedAt belong to turn i
    const boundaries = snapshots.map((s) => ({ turn: s.turn, endedAt: s.endedAt ? new Date(s.endedAt).getTime() : 0 }));

    actions.forEach((action) => {
      const actionTime = new Date(action.createdAt).getTime();
      // Find which turn this action belongs to
      let assignedTurn = snapshots[0]?.turn ?? 1;
      for (const b of boundaries) {
        if (b.endedAt === 0 || actionTime <= b.endedAt) {
          assignedTurn = b.turn;
          break;
        }
      }
      if (!map.has(assignedTurn)) map.set(assignedTurn, []);
      map.get(assignedTurn)!.push(action);
    });
    return map;
  }, [actions, snapshots]);

  const selectedSnapshot = snapshots.find((row) => row.turn === selectedTurn) || null;
  const selectedEvents = eventHistory.filter((item) => Number(item?.turn || 0) === selectedTurn);
  const selectedCombos = (comboHistory.find((item) => Number(item?.turn || 0) === selectedTurn)?.combos || []) as string[];
  const selectedPolicies = policyHistory.filter((item) => Number(item?.turn || 0) === selectedTurn);
  const selectedTurnActions = (actionsByTurn.get(selectedTurn) || []).filter((a) => a.actionType !== 2); // exclude end_turn

  function handleBack() {
    router.push(`/${locale}/game/play`);
  }

  function formatDateTime(input: string): string {
    const localeName = locale === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(input).toLocaleString(localeName);
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">{t('archive.replay.loading', 'Loading archive...')}</div>;
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen flex flex-col text-slate-700 font-sans">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#30499b]/10 rounded-lg">
              <Archive className="w-5 h-5 text-[#30499b]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-800">{t('archive.title', '游戏档案')}</h1>
              <p className="text-xs text-slate-500">{t('archive.replay.subtitle', '回合回放')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {!error && (
            <>
              {/* Turn selector */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#30499b]" />
                  {locale === 'zh' ? '选择回合' : 'Select Turn'}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {snapshots.map((row) => (
                    <button
                      key={row.turn}
                      onClick={() => setSelectedTurn(row.turn)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTurn === row.turn ? 'bg-[#30499b] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {locale === 'zh' ? `第 ${row.turn} 回合` : `Turn ${row.turn}`}
                    </button>
                  ))}
                </div>
              </section>

              {/* Snapshot */}
              {selectedSnapshot ? (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">
                    {locale === 'zh' ? `第 ${selectedSnapshot.turn} 回合结算快照` : `Turn ${selectedSnapshot.turn} Snapshot`}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {[
                      [locale === 'zh' ? '产业' : 'Industry', selectedSnapshot.industry],
                      [locale === 'zh' ? '科创' : 'Tech', selectedSnapshot.tech],
                      [locale === 'zh' ? '人口' : 'Population', selectedSnapshot.population],
                      [locale === 'zh' ? '绿建度' : 'Green', selectedSnapshot.green],
                      [locale === 'zh' ? '碳排放' : 'Carbon', selectedSnapshot.carbon],
                      [locale === 'zh' ? '满意度' : 'Satisfaction', selectedSnapshot.satisfaction],
                      [locale === 'zh' ? '已用政策' : 'Policies Used', selectedPolicies.length],
                      [locale === 'zh' ? '联动触发' : 'Combos', selectedCombos.length],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded border border-slate-200 p-3">
                        <div className="text-[11px] text-slate-500">{label}</div>
                        <div className="font-semibold text-slate-800">{value}</div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-sm text-slate-500">
                  {locale === 'zh' ? '暂无结算快照。' : 'No settlement snapshots available.'}
                </section>
              )}

              {/* Events & Combos */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {locale === 'zh' ? `第 ${selectedTurn} 回合事件` : `Turn ${selectedTurn} Events`}
                </h2>
                {selectedEvents.length === 0 ? (
                  <div className="text-sm text-slate-500">{locale === 'zh' ? '暂无事件记录。' : 'No event records.'}</div>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((item, index) => (
                      <div key={`${selectedTurn}-${index}`} className="text-sm rounded border border-slate-200 p-2">
                        {resolveEventText(item, locale)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-sm">
                  <div className="font-semibold mb-2">{locale === 'zh' ? '联动触发' : 'Combos'}</div>
                  {selectedCombos.length === 0 ? (
                    <div className="text-slate-500">{locale === 'zh' ? '本回合未触发联动。' : 'No combo triggered.'}</div>
                  ) : (
                    <div className="space-y-1">
                      {selectedCombos.map((comboId, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700">
                          <span className="text-emerald-500">✦</span>
                          <span>{resolveComboName(comboId, locale)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Actions */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-3">
                  {locale === 'zh' ? `第 ${selectedTurn} 回合操作` : `Turn ${selectedTurn} Actions`}
                </h2>
                {selectedTurnActions.length === 0 ? (
                  <div className="text-sm text-slate-500">{locale === 'zh' ? '本回合暂无操作记录。' : 'No action logs for this turn.'}</div>
                ) : (
                  <div className="space-y-2">
                    {selectedTurnActions.map((item) => (
                      <div key={item.id} className="rounded border border-slate-200 p-3 text-sm flex items-center justify-between gap-3">
                        <span className="text-slate-700">{resolveActionDesc(item, cardMap, locale)}</span>
                        <span className="text-[11px] text-slate-400 shrink-0">{formatDateTime(item.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


type AnyRecord = Record<string, any>;

interface TurnSnapshot {
  turn: number;
  industry: number;
  tech: number;
  population: number;
  green: number;
  carbon: number;
  satisfaction: number;
}

function safeAfter(node: AnyRecord | undefined): number {
  return Number(node?.after ?? 0);
}

function resolveEventText(record: AnyRecord, t: (key: string, fallback: string, vars?: Record<string, any>) => string, locale?: string): string {
  const eventType = String(record?.eventType || '');
  if (eventType === 'policy_unlock') {
    return t('archive.replay.eventPolicyUnlock', '解锁政策卡 {policyId}', { policyId: String(record?.policyId || '-') });
  }
  if (eventType === 'event_resolved') {
    const resolvedLabel = resolveEventLabel(String(record?.resolvedEvent || '-'), locale);
    return t('archive.replay.eventResolved', '化解事件「{event}」（使用 {policyId}）', {
      event: resolvedLabel,
      policyId: String(record?.policyId || '-')
    });
  }
  const label = resolveEventLabel(eventType, locale);
  return t('archive.replay.eventTriggered', '触发事件：{eventType}', { eventType: label || eventType || '-' });
}

function resolveActionTypeLabel(actionType: number, t: (key: string, fallback: string, vars?: Record<string, any>) => string): string {
  if (actionType === 1) return t('archive.replay.action.placeCore', 'Place Core Card');
  if (actionType === 2) return t('archive.replay.action.endTurn', 'End Turn');
  if (actionType === 3) return t('archive.replay.action.usePolicy', 'Use Policy Card');
  if (actionType === 4) return t('archive.replay.action.tradeCarbon', 'Trade Carbon');
  if (actionType === 5) return t('archive.replay.action.discardCard', 'Discard Card');
  if (actionType === 6) return t('archive.replay.action.removeCore', 'Remove Core Card');
  return t('archive.replay.action.fallback', 'Action {type}', { type: actionType });
}

export default function GameArchivePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useSafeTranslation('game');
  const locale = params.locale as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AnyRecord | null>(null);
  const [selectedTurn, setSelectedTurn] = useState<number>(1);
  const [actions, setActions] = useState<GameActionLogItem[]>([]);

  const sessionIdFromUrl = searchParams.get('sessionId') || '';

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const sessionId = sessionIdFromUrl || window.sessionStorage.getItem('game:lastSessionId') || '';
        if (!sessionId) {
          setError(t('archive.replay.loadErrorNoSession', 'No available session for archive replay'));
          return;
        }
        const session = await getSessionById(sessionId);
        const actionItems: GameActionLogItem[] = [];
        let page = 1;
        const size = 100;
        while (true) {
          const response = await listSessionActions(sessionId, page, size);
          actionItems.push(...response.items);
          if (actionItems.length >= response.total || response.items.length < size) {
            break;
          }
          page += 1;
        }
        if (canceled) {
          return;
        }
        setActions(actionItems);
        const pondState = (session.pondState || {}) as AnyRecord;
        setState(pondState);
        const settlementHistory: AnyRecord[] = pondState.settlementHistory || [];
        const lastTurn = settlementHistory.length > 0 ? Number(settlementHistory[settlementHistory.length - 1]?.turn || 1) : Number(pondState.turn || 1);
        setSelectedTurn(lastTurn);
      } catch (e: any) {
        if (!canceled) {
          setError(e?.message || t('archive.replay.loadErrorFailed', 'Failed to load archive'));
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      canceled = true;
    };
  }, [sessionIdFromUrl, t]);

  const settlementHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.settlementHistory) ? (state?.settlementHistory as AnyRecord[]) : []),
    [state]
  );
  const eventHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.eventHistory) ? (state?.eventHistory as AnyRecord[]) : []),
    [state]
  );
  const comboHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.comboHistory) ? (state?.comboHistory as AnyRecord[]) : []),
    [state]
  );
  const policyHistory = useMemo<AnyRecord[]>(
    () => (Array.isArray(state?.policyHistory) ? (state?.policyHistory as AnyRecord[]) : []),
    [state]
  );

  const snapshots = useMemo(() => {
    const rows: TurnSnapshot[] = settlementHistory.map((entry) => ({
      turn: Number(entry?.turn || 0),
      industry: safeAfter(entry?.resources?.industry),
      tech: safeAfter(entry?.resources?.tech),
      population: safeAfter(entry?.resources?.population),
      green: safeAfter(entry?.metrics?.green),
      carbon: safeAfter(entry?.metrics?.carbon),
      satisfaction: safeAfter(entry?.metrics?.satisfaction),
    }));
    return rows.filter((row) => row.turn > 0);
  }, [settlementHistory]);

  const selectedSnapshot = snapshots.find((row) => row.turn === selectedTurn) || null;
  const selectedEvents = eventHistory.filter((item) => Number(item?.turn || 0) === selectedTurn);
  const selectedCombos = comboHistory.find((item) => Number(item?.turn || 0) === selectedTurn)?.combos || [];
  const selectedPolicies = policyHistory.filter((item) => Number(item?.turn || 0) === selectedTurn);
  const selectedTurnActions = actions.filter((item) => {
    const turn = Number((item.actionData as AnyRecord | undefined)?.turn || 0);
    return turn === selectedTurn;
  });

  function handleBack() {
    router.push(`/${locale}/game/play`);
  }

  function formatDateTime(input: string): string {
    const localeName = locale === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(input).toLocaleString(localeName);
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">{t('archive.replay.loading', 'Loading archive...')}</div>;
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen flex flex-col text-slate-700 font-sans">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#30499b]/10 rounded-lg">
              <Archive className="w-5 h-5 text-[#30499b]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-800">{t('archive.title', '游戏档案')}</h1>
              <p className="text-xs text-slate-500">{t('archive.replay.subtitle', 'Replay from real session state')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && (
            <>
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#30499b]" />
                  {t('archive.replay.turnSelector', 'Turn Selector')}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {snapshots.map((row) => (
                    <button
                      key={row.turn}
                      onClick={() => setSelectedTurn(row.turn)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTurn === row.turn ? 'bg-[#30499b] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('archive.replay.turnLabel', 'Turn {turn}', { turn: row.turn })}
                    </button>
                  ))}
                </div>
              </section>

              {selectedSnapshot ? (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">
                    {t('archive.replay.snapshotTitle', 'Turn {turn} Snapshot', { turn: selectedSnapshot.turn })}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.industry', 'Industry')}: {selectedSnapshot.industry}</div>
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.tech', 'Tech')}: {selectedSnapshot.tech}</div>
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.population', 'Population')}: {selectedSnapshot.population}</div>
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.green', 'Green')}: {selectedSnapshot.green}</div>
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.carbon', 'Carbon')}: {selectedSnapshot.carbon}</div>
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.satisfaction', 'Satisfaction')}: {selectedSnapshot.satisfaction}</div>
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.policiesUsed', 'Policies Used')}: {selectedPolicies.length}</div>
                    <div className="rounded border border-slate-200 p-3">{t('archive.replay.stats.combos', 'Combos')}: {selectedCombos.length}</div>
                  </div>
                </section>
              ) : (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-sm text-slate-500">
                  {t('archive.replay.noSnapshots', 'No settlement snapshots available.')}
                </section>
              )}

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t('archive.replay.eventsTitle', 'Turn {turn} Events', { turn: selectedTurn })}
                </h2>
                {selectedEvents.length === 0 ? (
                  <div className="text-sm text-slate-500">{t('archive.replay.noEvents', 'No event records.')}</div>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((item, index) => (
                      <div key={`${selectedTurn}-${index}`} className="text-sm rounded border border-slate-200 p-2">
                        {resolveEventText(item, t, locale)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-sm">
                  <div className="font-semibold mb-1">{t('archive.replay.combosTitle', '联动触发')}</div>
                  {selectedCombos.length === 0 ? (
                    <div className="text-slate-500">{t('archive.replay.noCombos', '本回合未触发联动。')}</div>
                  ) : (
                    <div className="space-y-1">
                      {(selectedCombos as string[]).map((comboId, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700">
                          <span className="text-emerald-500">✦</span>
                          <span>{resolveComboName(comboId, locale)}</span>
                          <span className="text-[11px] text-slate-400">({comboId})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-3">
                  {t('archive.replay.actionsTitle', 'Turn {turn} Actions', { turn: selectedTurn })}
                </h2>
                {selectedTurnActions.length === 0 ? (
                  <div className="text-sm text-slate-500">{t('archive.replay.noActions', 'No action logs for this turn.')}</div>
                ) : (
                  <div className="space-y-2">
                    {selectedTurnActions.map((item) => (
                      <div key={item.id} className="rounded border border-slate-200 p-3 text-sm">
                        <div className="font-semibold text-slate-700">{resolveActionTypeLabel(item.actionType, t)}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {t('archive.replay.points', 'Points')} {item.pointsEarned} | {formatDateTime(item.createdAt)}
                        </div>
                        {item.actionData && (
                          <pre className="mt-2 text-xs text-slate-600 bg-slate-50 rounded p-2 overflow-x-auto">
                            {JSON.stringify(item.actionData, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
