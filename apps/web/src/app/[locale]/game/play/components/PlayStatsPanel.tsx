'use client';

import { useMemo } from 'react';
import type { GamePlayController } from '../hooks/useGamePlayController';

type PlayStatsPanelProps = Pick<
  GamePlayController,
  | 't'
  | 'resources'
  | 'metrics'
  | 'lowCarbonScore'
  | 'activeNegativeEvents'
  | 'handPolicySet'
  | 'resolveEventLabel'
  | 'resolvePolicyIdsByEvent'
  | 'resolvePolicyDisplayLabel'
  | 'selectPolicyForEvent'
  | 'strictGuideMode'
>;

export default function PlayStatsPanel(props: PlayStatsPanelProps) {
  const {
    t,
    resources,
    metrics,
    lowCarbonScore,
    activeNegativeEvents,
    handPolicySet,
    resolveEventLabel,
    resolvePolicyIdsByEvent,
    resolvePolicyDisplayLabel,
    selectPolicyForEvent,
    strictGuideMode
  } = props;

  const rating = useMemo(() => {
    const green = Number(metrics.green ?? 0);
    if (green >= 85) return 'A';
    if (green >= 70) return 'B';
    if (green >= 55) return 'C';
    if (green >= 40) return 'D';
    return 'E';
  }, [metrics.green]);

  const statCards = [
    {
      key: 'industry',
      title: t('play.resources.industry', 'Industry'),
      value: Number(resources.industry ?? 0),
      detail: t('play.domains.industry', 'Industry')
    },
    {
      key: 'population',
      title: t('play.resources.population', 'Population'),
      value: Number(resources.population ?? 0),
      detail: `${t('play.metrics.satisfaction', 'Satisfaction')} ${Number(metrics.satisfaction ?? 0)}`
    },
    {
      key: 'tech',
      title: t('play.resources.tech', 'Tech'),
      value: Number(resources.tech ?? 0),
      detail: t('play.domains.science', 'Science')
    },
    {
      key: 'green',
      title: t('play.metrics.green', 'Green'),
      value: Number(metrics.green ?? 0),
      detail: `${t('play.detail.risk.low', 'Low Risk')} ${rating}`
    },
    {
      key: 'lowCarbon',
      title: t('play.metrics.lowCarbon', 'Low Carbon Score'),
      value: Number(lowCarbonScore ?? 0),
      detail: `${t('play.common.phase', 'Phase')} · ${rating}`
    }
  ];

  return (
    <section className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-slate-700 p-3 sm:p-4 flex flex-col gap-3 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-3 rounded-full bg-violet-500" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {t('play.resources.title', 'Resources')}
        </h3>
      </div>

      <div className="grid gap-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="rounded-[1.35rem] border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 px-4 py-4 transition-all duration-300"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {card.title}
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-[2rem] font-black leading-none text-slate-800 dark:text-slate-100">
                {card.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 text-right">
                {card.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50/90 px-3 py-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-700">
          {t('play.events.title', 'Risk & Events')}
        </div>
        {activeNegativeEvents.length === 0 ? (
          <div className="mt-2 text-[11px] font-semibold text-slate-600">
            {t('play.events.noneActive', 'No active negative events')}
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {activeNegativeEvents.map((event, index) => {
              const eventType = String(event.eventType || '');
              const resolverIds = resolvePolicyIdsByEvent(eventType);
              const resolverLabels = resolverIds
                .map((id) => resolvePolicyDisplayLabel(id))
                .filter(Boolean);
              const handResolverId = resolverIds.find((id) => handPolicySet.has(id)) || '';
              const resolverAvailable = !!handResolverId;
              return (
                <div
                  key={`${eventType || 'event'}-${index}`}
                  className="rounded-xl border border-rose-200/80 bg-white/85 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-black text-rose-800">
                      {resolveEventLabel(eventType)}
                    </div>
                    <div className="text-[10px] font-semibold text-rose-700">
                      {t('play.events.remainingTurns', '剩余 {count} 回合', { count: Number(event.remainingTurns || 0) })}
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">
                    {resolverAvailable
                      ? t('play.events.resolverReady', '可用政策已在手牌中，可直接执行。')
                      : t('play.events.resolverMissing', '当前手牌暂无对应政策，建议保留政策位并尽快抽取。')}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">
                    {t('play.events.suggestedPolicies', '建议政策')}: {resolverLabels.join('、') || t('play.common.none', 'None')}
                  </div>
                  {resolverAvailable ? (
                    <button
                      type="button"
                      onClick={() => selectPolicyForEvent(eventType)}
                      className="mt-2 w-full rounded-lg bg-rose-700 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white"
                    >
                      {t('play.events.selectResolver', 'Select Resolver Policy')}
                    </button>
                  ) : (
                    <div className="mt-2 text-[10px] font-semibold text-amber-700">
                      {strictGuideMode
                        ? t('play.events.guideHint', '引导阶段中，若事件触发，政策卡已允许用于应对。')
                        : t('play.events.noResolverHint', '本回合优先关注政策卡获取与保留。')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
