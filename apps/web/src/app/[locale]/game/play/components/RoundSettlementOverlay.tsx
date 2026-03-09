'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Globe2, PlayCircle, X } from 'lucide-react';
import { EventRecord, MetricState, readDelta, ResourceState, SettlementRecord, TransitionNotice } from '../hooks/gamePlay.shared';

interface RoundSettlementOverlayProps {
  locale: string;
  t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string;
  transitionNotice: TransitionNotice;
  latestSettlement: SettlementRecord;
  activeNegativeEvents: EventRecord[];
  resources: ResourceState;
  metrics: MetricState;
  onClose: () => void;
}

type DeltaCard = {
  key: string;
  label: string;
  after: number;
  delta: number;
  tone: string;
};

function readAfter(entry: SettlementRecord | undefined, section: string, field: string): number | null {
  const sectionNode = entry?.[section];
  if (!sectionNode || typeof sectionNode !== 'object' || Array.isArray(sectionNode)) {
    return null;
  }
  const fieldNode = (sectionNode as Record<string, unknown>)[field];
  if (!fieldNode || typeof fieldNode !== 'object' || Array.isArray(fieldNode)) {
    return null;
  }
  const value = Number((fieldNode as Record<string, unknown>).after ?? 0);
  return Number.isFinite(value) ? value : null;
}

function formatDelta(delta: number): string {
  return `${delta > 0 ? '+' : ''}${delta}`;
}

function deltaClass(delta: number): string {
  if (delta > 0) {
    return 'text-emerald-700';
  }
  if (delta < 0) {
    return 'text-rose-700';
  }
  return 'text-slate-500';
}

export default function RoundSettlementOverlay(props: RoundSettlementOverlayProps) {
  const {
    locale,
    t,
    transitionNotice,
    latestSettlement,
    activeNegativeEvents,
    resources,
    metrics,
    onClose
  } = props;

  const pathname = usePathname();
  const router = useRouter();
  const settlementTurn = Number(latestSettlement.turn ?? transitionNotice.turn ?? 1);
  const videoSrc = '/assets/videos/green-upgrade-animation.mp4';

  const deltaCards: DeltaCard[] = [
    {
      key: 'industry',
      label: t('play.resources.industry', 'Industry'),
      after: readAfter(latestSettlement, 'resources', 'industry') ?? Number(resources.industry ?? 0),
      delta: readDelta(latestSettlement, 'resources', 'industry'),
      tone: 'bg-[#dbeafe]'
    },
    {
      key: 'tech',
      label: t('play.resources.tech', 'Tech'),
      after: readAfter(latestSettlement, 'resources', 'tech') ?? Number(resources.tech ?? 0),
      delta: readDelta(latestSettlement, 'resources', 'tech'),
      tone: 'bg-[#ede9fe]'
    },
    {
      key: 'population',
      label: t('play.resources.population', 'Population'),
      after: readAfter(latestSettlement, 'resources', 'population') ?? Number(resources.population ?? 0),
      delta: readDelta(latestSettlement, 'resources', 'population'),
      tone: 'bg-[#fef3c7]'
    },
    {
      key: 'green',
      label: t('play.metrics.green', 'Green'),
      after: readAfter(latestSettlement, 'metrics', 'green') ?? Number(metrics.green ?? 0),
      delta: readDelta(latestSettlement, 'metrics', 'green'),
      tone: 'bg-[#dcfce7]'
    },
    {
      key: 'carbon',
      label: t('play.metrics.carbon', 'Carbon'),
      after: readAfter(latestSettlement, 'metrics', 'carbon') ?? Number(metrics.carbon ?? 0),
      delta: readDelta(latestSettlement, 'metrics', 'carbon'),
      tone: 'bg-[#fee2e2]'
    },
    {
      key: 'satisfaction',
      label: t('play.metrics.satisfaction', 'Satisfaction'),
      after: readAfter(latestSettlement, 'metrics', 'satisfaction') ?? Number(metrics.satisfaction ?? 0),
      delta: readDelta(latestSettlement, 'metrics', 'satisfaction'),
      tone: 'bg-[#cffafe]'
    }
  ];

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) {
      return;
    }
    router.replace(pathname.replace(`/${locale}`, `/${nextLocale}`));
  };

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-[#ebe6dc] text-slate-900">
      <div className="min-h-screen bg-[linear-gradient(180deg,#f6f0e5_0%,#ebe6dc_100%)]">
        <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-32 lg:px-8 lg:py-8 xl:pb-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.32em] text-[#2f6a4f]">
                {t('play.settlement.badge', 'Turn Settlement')}
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-[0.01em] text-[#14281d] sm:text-[3.25rem]">
                {t('play.settlement.heading', 'Turn {turn} Report', { turn: settlementTurn })}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-full border border-[#c9c1b2] bg-[#f8f4ed] p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => switchLocale('zh')}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    locale === 'zh' ? 'bg-[#173b2f] text-white' : 'text-[#5d645f] hover:bg-[#ece5d8]'
                  }`}
                >
                  中文
                </button>
                <button
                  type="button"
                  onClick={() => switchLocale('en')}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    locale === 'en' ? 'bg-[#173b2f] text-white' : 'text-[#5d645f] hover:bg-[#ece5d8]'
                  }`}
                >
                  English
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#c9c1b2] bg-[#f8f4ed] text-[#58615b] shadow-sm transition-colors hover:bg-[#ece5d8]"
                aria-label={t('play.settlement.continue', 'Continue')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid flex-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-[2rem] border border-[#d4ccbf] bg-[#f8f4ed] p-5 shadow-[0_24px_60px_rgba(34,41,37,0.08)] lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-full bg-[#173b2f] px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-[#ecf4ef]">
                    {transitionNotice.title}
                  </div>
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#4f5b53]">
                    {transitionNotice.subtitle}
                  </p>
                </div>

                <div className="rounded-full border border-[#d4ccbf] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#2f6a4f]">
                  T{settlementTurn}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
                <div className="rounded-[1.5rem] border border-[#d8d0c4] bg-[#fffdf8] p-4">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#6a736d]">
                    <PlayCircle className="h-4 w-4 text-[#b07643]" />
                    {t('play.settlement.videoLabel', '4:3 Video Slot')}
                  </div>
                  <div className="aspect-[4/3] overflow-hidden rounded-[1.2rem] border border-[#d4ccbf] bg-[#efe8d9]">
                    <video
                      src={videoSrc}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      preload="metadata"
                    />
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[#6a645b]">
                    {t('play.settlement.videoHint', 'Place your sample file here later. The slot keeps a fixed 4:3 ratio and will not affect the layout.')}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[#d8d0c4] bg-[#fffdf8] p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#6a736d]">
                    <Globe2 className="h-4 w-4 text-[#2f6a4f]" />
                    {t('play.settlement.summaryLabel', 'Settlement Notes')}
                  </div>

                  <div className="mt-3 space-y-3 text-[15px] leading-7 text-[#505c54]">
                    <p>{t('play.settlement.summaryLead', 'The city state has been recalculated for the new turn. Review the updated indicators before continuing.')}</p>
                    <p>
                      {activeNegativeEvents.length > 0
                        ? t('play.settlement.eventsActive', '{count} active risks entered the next turn.', { count: activeNegativeEvents.length })
                        : t('play.settlement.eventsCalm', 'No active negative event carried into the next turn.')}
                    </p>
                    <p>{t('play.settlement.summaryFoot', 'Use the language buttons in the top-right corner at any time. This settlement page stays isolated from the board and card area until you continue.')}</p>
                  </div>

                  <div className="mt-4 rounded-[1.2rem] border border-[#d8d0c4] bg-[#f4efe6] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#6a736d]">
                      {t('play.settlement.eventStatusTitle', 'Next Turn Status')}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeNegativeEvents.length > 0 ? (
                        activeNegativeEvents.map((event, index) => (
                          <span
                            key={`${String(event.eventType || 'event')}-${index}`}
                            className="rounded-full bg-[#5f2f2f] px-3 py-1 text-xs font-bold text-[#fff4f4]"
                          >
                            {String(event.eventType || t('play.events.title', 'Event'))}
                            {' · '}
                            {t('play.events.remaining', 'remaining')} {Number(event.remainingTurns || 0)}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-[#2f6a4f] px-3 py-1 text-xs font-bold text-[#f4fff8]">
                          {t('play.events.noneActive', 'No active negative events')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {deltaCards.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-[1.3rem] border border-[#d8d0c4] ${item.tone} p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]`}
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#49534d]">
                      {item.label}
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="text-[2.35rem] font-black leading-none text-[#14281d]">{item.after}</div>
                      <div className={`text-base font-black ${deltaClass(item.delta)}`}>{formatDelta(item.delta)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="flex flex-col gap-4 rounded-[2rem] border border-[#d4ccbf] bg-[#f8f4ed] p-5 shadow-[0_24px_60px_rgba(34,41,37,0.08)] lg:p-5">
              <div className="rounded-[1.4rem] border border-[#d8d0c4] bg-white p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#6a736d]">
                  {t('play.settlement.insightTitle', 'Round Insight')}
                </div>
                <div className="mt-3 text-[2rem] font-black leading-tight text-[#173b2f]">{transitionNotice.title}</div>
                <p className="mt-3 text-[15px] leading-7 text-[#505c54]">{transitionNotice.subtitle}</p>
              </div>

              <div className="rounded-[1.4rem] border border-[#d8d0c4] bg-white p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#6a736d]">
                  {t('play.settlement.requirementsTitle', 'Overlay Rules')}
                </div>
                <ul className="mt-3 space-y-3 text-[15px] leading-7 text-[#505c54]">
                  <li>{t('play.settlement.ruleFullscreen', 'This settlement layer occupies the full viewport and blocks the board below.')}</li>
                  <li>{t('play.settlement.ruleVideo', 'The video slot keeps a fixed 4:3 area, so adding media later will not disturb the page.')}</li>
                  <li>{t('play.settlement.ruleLanguage', 'Chinese and English can be switched here directly without leaving the current game session.')}</li>
                </ul>
              </div>

              <div className="mt-auto hidden rounded-[1.4rem] border border-[#d8d0c4] bg-white p-4 xl:block">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-[linear-gradient(135deg,#173b2f_0%,#2f6a4f_100%)] px-5 py-4 text-base font-black text-white shadow-[0_18px_34px_rgba(23,59,47,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(23,59,47,0.3)]"
                >
                  {t('play.settlement.continue', 'Continue')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        </div>

        <div className="fixed inset-x-4 bottom-4 z-[270] xl:hidden">
          <div className="mx-auto max-w-[1320px] rounded-[1.5rem] border border-[#d8d0c4] bg-[#fffaf1] p-3 shadow-[0_20px_40px_rgba(34,41,37,0.16)]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-[linear-gradient(135deg,#173b2f_0%,#2f6a4f_100%)] px-5 py-4 text-base font-black text-white shadow-[0_18px_34px_rgba(23,59,47,0.24)] transition-all active:translate-y-[1px]"
            >
              {t('play.settlement.continue', 'Continue')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
