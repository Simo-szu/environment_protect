'use client';

import { useMemo } from 'react';
import type { GamePlayController } from '../hooks/useGamePlayController';

type PlayStatsPanelProps = Pick<
  GamePlayController,
  | 't'
  | 'resources'
  | 'metrics'
  | 'lowCarbonScore'
>;

export default function PlayStatsPanel(props: PlayStatsPanelProps) {
  const {
    t,
    resources,
    metrics,
    lowCarbonScore
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
    </section>
  );
}
