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

function resolveEventText(record: AnyRecord, locale?: string, cardMap?: Map<string, GameCardMeta>): string {
  const eventType = String(record?.eventType || '');
  const zh = locale === 'zh';
  const resolveCardName = (id: string) => {
    const card = cardMap?.get(id);
    return card ? (zh ? card.chineseName : card.englishName) : id;
  };
  if (eventType === 'policy_unlock') {
    const policyId = String(record?.policyId || '-');
    const name = resolveCardName(policyId);
    return zh ? `解锁政策卡：${name}` : `Unlocked policy: ${name}`;
  }
  if (eventType === 'event_resolved') {
    const resolvedLabel = resolveEventLabel(String(record?.resolvedEvent || '-'), locale);
    const policyId = String(record?.policyId || '-');
    const policyName = resolveCardName(policyId);
    return zh ? `化解事件「${resolvedLabel}」（使用 ${policyName}）` : `Resolved "${resolvedLabel}" via ${policyName}`;
  }
  const label = resolveEventLabel(eventType, locale);
  return zh ? `触发事件：${label}` : `Triggered: ${label}`;
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

function resolveActionTurn(item: GameActionLogItem): number | null {
  const data = (item.actionData || {}) as AnyRecord;
  const turn = Number(data.actionTurn ?? data.turn ?? 0);
  if (!Number.isFinite(turn) || turn <= 0) {
    return null;
  }
  return turn;
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
        const [session, catalog] = await Promise.all([getSessionById(sessionId), listCards(true)]);
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
        actionItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

  const actionsByTurn = useMemo(() => {
    const map = new Map<number, GameActionLogItem[]>();
    if (actions.length === 0) return map;
    const boundaries = snapshots.map((s) => ({ turn: s.turn, endedAt: s.endedAt ? new Date(s.endedAt).getTime() : 0 }));
    actions.forEach((action) => {
      const turnFromActionData = resolveActionTurn(action);
      let assignedTurn = turnFromActionData ?? 1;
      if (turnFromActionData == null) {
        const actionTime = new Date(action.createdAt).getTime();
        assignedTurn = snapshots[0]?.turn ?? 1;
        for (const b of boundaries) {
          if (b.endedAt === 0 || actionTime <= b.endedAt) {
            assignedTurn = b.turn;
            break;
          }
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
  const selectedTurnActions = actionsByTurn.get(selectedTurn) || [];

  function handleBack() { router.push(`/${locale}/game/play`); }

  function formatDateTime(input: string): string {
    return new Date(input).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US');
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
              <p className="text-xs text-slate-500">{locale === 'zh' ? '回合回放' : 'Turn Replay'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {!error && (
            <>
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#30499b]" />
                  {locale === 'zh' ? '选择回合' : 'Select Turn'}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {snapshots.map((row) => (
                    <button key={row.turn} onClick={() => setSelectedTurn(row.turn)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedTurn === row.turn ? 'bg-[#30499b] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {locale === 'zh' ? `第 ${row.turn} 回合` : `Turn ${row.turn}`}
                    </button>
                  ))}
                </div>
              </section>

              {selectedSnapshot ? (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">
                    {locale === 'zh' ? `第 ${selectedSnapshot.turn} 回合结算快照` : `Turn ${selectedSnapshot.turn} Snapshot`}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {([
                      [locale === 'zh' ? '产业' : 'Industry', selectedSnapshot.industry],
                      [locale === 'zh' ? '科创' : 'Tech', selectedSnapshot.tech],
                      [locale === 'zh' ? '人口' : 'Population', selectedSnapshot.population],
                      [locale === 'zh' ? '绿建度' : 'Green', selectedSnapshot.green],
                      [locale === 'zh' ? '碳排放' : 'Carbon', selectedSnapshot.carbon],
                      [locale === 'zh' ? '满意度' : 'Satisfaction', selectedSnapshot.satisfaction],
                      [locale === 'zh' ? '已用政策' : 'Policies Used', selectedPolicies.length],
                      [locale === 'zh' ? '联动触发' : 'Combos', selectedCombos.length],
                    ] as [string, number][]).map(([label, value]) => (
                      <div key={label} className="rounded border border-slate-200 p-3">
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

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {locale === 'zh' ? `第 ${selectedTurn} 回合事件` : `Turn ${selectedTurn} Events`}
                </h2>
                {selectedEvents.length === 0
                  ? <div className="text-sm text-slate-500">{locale === 'zh' ? '暂无事件记录。' : 'No event records.'}</div>
                  : <div className="space-y-2">{selectedEvents.map((item, i) => (
                      <div key={i} className="text-sm rounded border border-slate-200 p-2">{resolveEventText(item, locale, cardMap)}</div>
                    ))}</div>
                }
                <div className="mt-4 text-sm">
                  <div className="font-semibold mb-2">{locale === 'zh' ? '联动触发' : 'Combos'}</div>
                  {selectedCombos.length === 0
                    ? <div className="text-slate-500">{locale === 'zh' ? '本回合未触发联动。' : 'No combo triggered.'}</div>
                    : <div className="space-y-1">{selectedCombos.map((comboId, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700">
                          <span className="text-emerald-500">✦</span>
                          <span>{resolveComboName(comboId, locale)}</span>
                        </div>
                      ))}</div>
                  }
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-3">
                  {locale === 'zh' ? `第 ${selectedTurn} 回合操作` : `Turn ${selectedTurn} Actions`}
                </h2>
                {selectedTurnActions.length === 0
                  ? <div className="text-sm text-slate-500">{locale === 'zh' ? '本回合暂无操作记录。' : 'No action logs for this turn.'}</div>
                  : <div className="space-y-2">{selectedTurnActions.map((item, index) => (
                      <div key={item.id} className="rounded border border-slate-200 p-3 text-sm flex items-center justify-between gap-3">
                        <span className="text-slate-700">
                          {locale === 'zh' ? `步骤 ${index + 1}：` : `Step ${index + 1}: `}
                          {resolveActionDesc(item, cardMap, locale)}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">{formatDateTime(item.createdAt)}</span>
                      </div>
                    ))}</div>
                }
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
