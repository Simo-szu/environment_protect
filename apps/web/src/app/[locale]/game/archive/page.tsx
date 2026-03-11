'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { GameActionLogItem, getSessionById, listSessionActions } from '@/lib/api/game';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
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
}

function safeAfter(node: AnyRecord | undefined): number {
  return Number(node?.after ?? 0);
}

function resolveEventText(record: AnyRecord, t: (key: string, fallback: string, vars?: Record<string, any>) => string): string {
  const eventType = String(record?.eventType || '');
  if (eventType === 'policy_unlock') {
    return t('archive.replay.eventPolicyUnlock', 'Unlocked {policyId}', { policyId: String(record?.policyId || '-') });
  }
  if (eventType === 'event_resolved') {
    return t('archive.replay.eventResolved', 'Resolved {event} via {policyId}', {
      event: String(record?.resolvedEvent || '-'),
      policyId: String(record?.policyId || '-')
    });
  }
  return t('archive.replay.eventTriggered', 'Triggered {eventType}', { eventType: eventType || '-' });
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
                        {resolveEventText(item, t)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-sm">
                  <div className="font-semibold mb-1">{t('archive.replay.combosTitle', 'Combos')}</div>
                  {selectedCombos.length === 0 ? (
                    <div className="text-slate-500">{t('archive.replay.noCombos', 'No combo triggered.')}</div>
                  ) : (
                    <div className="text-slate-700">{selectedCombos.join(', ')}</div>
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
