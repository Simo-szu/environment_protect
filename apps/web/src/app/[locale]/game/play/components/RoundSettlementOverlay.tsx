'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { EventRecord, MetricState, readDelta, resolveEventLabel, ResourceState, SettlementRecord, TransitionKind, TransitionNotice } from '../hooks/gamePlay.shared';

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

type Trend = 'up' | 'down' | 'flat';
type Tone = 'positive' | 'negative' | 'neutral';

type DeltaCard = {
  key: string;
  label: string;
  after: number;
  delta: number;
  trend: Trend;
  tone: Tone;
  highRisk: boolean;
  hint: string;
  score: number;
};

type SettlementAnimation = {
  kind: TransitionKind | 'balanced_growth';
  videoSrc: string;
};

const storageBaseUrl = (process.env.NEXT_PUBLIC_STORAGE_BASE_URL || '').trim().replace(/\/+$/, '');

function resolveStorageAssetUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalizedPath = path.replace(/^\/+/, '');
  if (!storageBaseUrl) {
    return '';
  }
  return `${storageBaseUrl}/${normalizedPath}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

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

function resolveTransitionCopy(
  kind: TransitionKind,
  t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string
): { title: string; subtitle: string } {
  switch (kind) {
    case 'carbon_disaster':
      return {
        title: t('play.settlement.transition.carbon_disaster.title', '碳排危机'),
        subtitle: t('play.settlement.transition.carbon_disaster.subtitle', '城市应急压力正在上升')
      };
    case 'industry_growth':
      return {
        title: t('play.settlement.transition.industry_growth.title', '产业增长'),
        subtitle: t('play.settlement.transition.industry_growth.subtitle', '基础设施动能明显提升')
      };
    case 'green_growth':
      return {
        title: t('play.settlement.transition.green_growth.title', '绿建提升'),
        subtitle: t('play.settlement.transition.green_growth.subtitle', '本回合生态资产持续扩张')
      };
    case 'tech_burst':
      return {
        title: t('play.settlement.transition.tech_burst.title', '科创爆发'),
        subtitle: t('play.settlement.transition.tech_burst.subtitle', '创新产出出现跃升')
      };
    case 'satisfaction_growth':
      return {
        title: t('play.settlement.transition.satisfaction_growth.title', '民意回升'),
        subtitle: t('play.settlement.transition.satisfaction_growth.subtitle', '公众支持度继续改善')
      };
    case 'carbon_optimized':
      return {
        title: t('play.settlement.transition.carbon_optimized.title', '碳排优化'),
        subtitle: t('play.settlement.transition.carbon_optimized.subtitle', '减排措施取得明显效果')
      };
    case 'balanced_growth':
    default:
      return {
        title: t('play.settlement.transition.balanced_growth.title', '均衡发展'),
        subtitle: t('play.settlement.transition.balanced_growth.subtitle', '各项指标保持稳步推进')
      };
  }
}

function resolveEventTypeLabel(
  eventType: string,
  locale: string,
  t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string
): string {
  const label = resolveEventLabel(eventType, locale);
  return label || t('play.events.title', 'Event');
}

function resolveSettlementAnimation(latestSettlement: SettlementRecord): SettlementAnimation {
  const industryUp = Math.max(0, readDelta(latestSettlement, 'resources', 'industry'));
  const techUp = Math.max(0, readDelta(latestSettlement, 'resources', 'tech'));
  const greenUp = Math.max(0, readDelta(latestSettlement, 'metrics', 'green'));
  const satisfactionUp = Math.max(0, readDelta(latestSettlement, 'metrics', 'satisfaction'));
  const carbonDelta = readDelta(latestSettlement, 'metrics', 'carbon');
  const carbonOptimization = Math.max(0, -readDelta(latestSettlement, 'metrics', 'carbon'));
  const cardEffects = asRecord(latestSettlement.cardEffects);
  const effectCarbon = Number(cardEffects?.carbon ?? 0);
  const effectCarbonDeltaReductionPct = Number(cardEffects?.carbonDeltaReductionPct ?? 0);
  const effectIndustryCarbonReductionPct = Number(cardEffects?.industryCarbonReductionPct ?? 0);
  const hasCarbonReductionMeasure = effectCarbon < 0
    || effectCarbonDeltaReductionPct > 0
    || effectIndustryCarbonReductionPct > 0;

  if (carbonDelta >= 20 && !hasCarbonReductionMeasure) {
    return {
      kind: 'carbon_disaster',
      videoSrc: '/assets/videos/carbon-disaster.mp4'
    };
  }

  const industryGrowthTriggered = industryUp >= 8
    && industryUp > greenUp
    && industryUp > techUp
    && industryUp > satisfactionUp
    && industryUp > carbonOptimization;
  if (industryGrowthTriggered) {
    return {
      kind: 'industry_growth',
      videoSrc: '/assets/videos/industry-growth.mp4'
    };
  }

  const greenGrowthTriggered = greenUp >= 6
    && greenUp > industryUp
    && greenUp > techUp
    && greenUp > satisfactionUp
    && greenUp > carbonOptimization;

  if (greenGrowthTriggered) {
    return {
      kind: 'green_growth',
      videoSrc: '/assets/videos/green-rise.mp4'
    };
  }

  const techBurstTriggered = techUp >= 8
    && techUp > industryUp
    && techUp > greenUp
    && techUp > satisfactionUp
    && techUp > carbonOptimization;
  if (techBurstTriggered) {
    return {
      kind: 'tech_burst',
      videoSrc: '/assets/videos/tech-burst.mp4'
    };
  }

  const satisfactionGrowthTriggered = satisfactionUp >= 6
    && satisfactionUp > industryUp
    && satisfactionUp > greenUp
    && satisfactionUp > techUp
    && satisfactionUp > carbonOptimization;
  if (satisfactionGrowthTriggered) {
    return {
      kind: 'satisfaction_growth',
      videoSrc: '/assets/videos/satisfaction-growth.mp4'
    };
  }

  const carbonOptimizedTriggered = carbonOptimization >= 8
    && carbonOptimization > industryUp
    && carbonOptimization > greenUp
    && carbonOptimization > techUp
    && carbonOptimization > satisfactionUp;
  if (carbonOptimizedTriggered) {
    return {
      kind: 'carbon_optimized',
      videoSrc: '/assets/videos/carbon-optimized.mp4'
    };
  }

  return {
    kind: 'balanced_growth',
    videoSrc: '/assets/videos/balanced-growth.mp4'
  };
}

function trendOf(delta: number): Trend {
  if (delta > 0) {
    return 'up';
  }
  if (delta < 0) {
    return 'down';
  }
  return 'flat';
}

function resolveTone(key: string, delta: number): Tone {
  if (delta === 0) {
    return 'neutral';
  }
  if (key === 'carbon') {
    return delta < 0 ? 'positive' : 'negative';
  }
  return delta > 0 ? 'positive' : 'negative';
}

function resolveHint(
  key: string,
  after: number,
  delta: number,
  t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string
): { highRisk: boolean; hint: string } {
  const carbonRiskBaseline = 90;
  if (key === 'carbon') {
    if (after >= carbonRiskBaseline) {
      return {
        highRisk: true,
        hint: t('play.settlement.hint.carbonHigh', '碳排放 > 90 属于高风险，建议优先降低碳排并补足配额。')
      };
    }
    if (delta > 0) {
      return {
        highRisk: true,
        hint: t('play.settlement.hint.carbonRising', '碳排放正在上升，需提前布局生态或科技减排卡。')
      };
    }
    return {
      highRisk: false,
      hint: t('play.settlement.hint.carbonSafe', '碳排放处于可控区间，可继续稳步推进发展。')
    };
  }

  if (key === 'green') {
    if (after < 50) {
      return {
        highRisk: true,
        hint: t('play.settlement.hint.greenLow', '绿建度偏低，后续抗风险能力不足，建议补生态建设。')
      };
    }
    return {
      highRisk: false,
      hint: t('play.settlement.hint.green', '绿建度越高，城市韧性与低碳表现通常越稳定。')
    };
  }

  if (key === 'satisfaction') {
    if (after < 60) {
      return {
        highRisk: true,
        hint: t('play.settlement.hint.satisfactionLow', '满意度低于 60 容易触发民生压力，建议补充社会类卡牌。')
      };
    }
    return {
      highRisk: false,
      hint: t('play.settlement.hint.satisfaction', '满意度决定社会稳定度，建议保持在 60 以上。')
    };
  }

  if (key === 'industry') {
    return {
      highRisk: false,
      hint: delta > 0
        ? t('play.settlement.hint.industryUp', '产业值上升为后续买卡与交易提供更大操作空间。')
        : t('play.settlement.hint.industryDown', '产业值下降会压缩下一回合选择，注意控制投入节奏。')
    };
  }

  if (key === 'tech') {
    return {
      highRisk: false,
      hint: t('play.settlement.hint.tech', '科创点影响政策解锁与科技路线推进。')
    };
  }

  return {
    highRisk: false,
    hint: t('play.settlement.hint.population', '人口变化会影响城市承载与社会需求压力。')
  };
}

function trendLabel(trend: Trend, t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string): string {
  if (trend === 'up') {
    return t('play.settlement.trend.up', '上升');
  }
  if (trend === 'down') {
    return t('play.settlement.trend.down', '下降');
  }
  return t('play.settlement.trend.flat', '持平');
}

function summaryFeedback(
  cards: DeltaCard[],
  transitionSubtitle: string,
  t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string
): string {
  const positive = cards
    .filter((card) => card.tone === 'positive' && card.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const risk = cards
    .filter((card) => card.highRisk || card.tone === 'negative')
    .sort((a, b) => b.score - a.score)[0];

  if (positive && risk) {
    return t(
      'play.settlement.executiveSummaryMixed',
      '{positive}表现良好，但{risk}{riskTrend}，请优先处理风险。',
      {
        positive: positive.label,
        risk: risk.label,
        riskTrend: trendLabel(risk.trend, t)
      }
    );
  }
  if (positive) {
    return t('play.settlement.executiveSummaryPositive', '本回合整体向好，{positive}提升明显。', {
      positive: positive.label
    });
  }
  if (risk) {
    return t('play.settlement.executiveSummaryRisk', '{risk}{riskTrend}，建议下一回合优先防风险。', {
      risk: risk.label,
      riskTrend: trendLabel(risk.trend, t)
    });
  }
  return transitionSubtitle;
}

function strategyTips(
  cards: DeltaCard[],
  activeNegativeEvents: EventRecord[],
  t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string
): string[] {
  const carbonRiskBaseline = 90;
  const byKey = new Map(cards.map((card) => [card.key, card]));
  const tips: string[] = [];

  const carbon = byKey.get('carbon');
  const green = byKey.get('green');
  const satisfaction = byKey.get('satisfaction');
  const industry = byKey.get('industry');
  const tech = byKey.get('tech');

  if (carbon && (carbon.after >= carbonRiskBaseline || carbon.delta > 0)) {
    tips.push(t('play.settlement.strategy.carbonHigh', '碳排放偏高，建议优先发展生态类或减排科技类卡牌。'));
  }

  if (activeNegativeEvents.length > 0) {
    tips.push(t('play.settlement.strategy.eventPressure', '存在未化解事件，建议保留政策位并优先处理风险事件。'));
  }

  if (industry && tech && industry.after >= 100 && tech.after >= 80) {
    tips.push(t('play.settlement.strategy.industryTechGood', '产业与科创基础较好，可尝试解锁工业政策卡扩大收益。'));
  }

  if (green && green.after < 50) {
    tips.push(t('play.settlement.strategy.greenLow', '绿建度偏低，下一回合建议补充生态建设稳定长期表现。'));
  }

  if (satisfaction && satisfaction.after < 60) {
    tips.push(t('play.settlement.strategy.satisfactionLow', '满意度偏低，建议加入社会类卡牌缓解民生压力。'));
  }

  if (tips.length === 0) {
    tips.push(t('play.settlement.strategy.default1', '当前结构较稳定，可在保持控碳的前提下继续推进高收益板块。'));
    tips.push(t('play.settlement.strategy.default2', '若配额富余，可结合碳交易提升产业值，为下回合做储备。'));
  }

  return tips.slice(0, 2);
}

function toneClasses(tone: Tone, highRisk: boolean): string {
  if (highRisk || tone === 'negative') {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
  if (tone === 'positive') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
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
  const settlementAnimation = resolveSettlementAnimation(latestSettlement);
  const videoSrc = resolveStorageAssetUrl(settlementAnimation.videoSrc);
  const transitionCopy = resolveTransitionCopy(settlementAnimation.kind ?? transitionNotice.kind, t);

  const baseCards: DeltaCard[] = [
    {
      key: 'industry',
      label: t('play.resources.industry', '产业值'),
      after: readAfter(latestSettlement, 'resources', 'industry') ?? Number(resources.industry ?? 0),
      delta: readDelta(latestSettlement, 'resources', 'industry'),
      trend: 'flat',
      tone: 'neutral',
      highRisk: false,
      hint: '',
      score: 0
    },
    {
      key: 'tech',
      label: t('play.resources.tech', '科创点'),
      after: readAfter(latestSettlement, 'resources', 'tech') ?? Number(resources.tech ?? 0),
      delta: readDelta(latestSettlement, 'resources', 'tech'),
      trend: 'flat',
      tone: 'neutral',
      highRisk: false,
      hint: '',
      score: 0
    },
    {
      key: 'population',
      label: t('play.resources.population', 'Population'),
      after: readAfter(latestSettlement, 'resources', 'population') ?? Number(resources.population ?? 0),
      delta: readDelta(latestSettlement, 'resources', 'population'),
      trend: 'flat',
      tone: 'neutral',
      highRisk: false,
      hint: '',
      score: 0
    },
    {
      key: 'green',
      label: t('play.metrics.green', '绿建度'),
      after: readAfter(latestSettlement, 'metrics', 'green') ?? Number(metrics.green ?? 0),
      delta: readDelta(latestSettlement, 'metrics', 'green'),
      trend: 'flat',
      tone: 'neutral',
      highRisk: false,
      hint: '',
      score: 0
    },
    {
      key: 'carbon',
      label: t('play.metrics.carbon', '碳排放'),
      after: readAfter(latestSettlement, 'metrics', 'carbon') ?? Number(metrics.carbon ?? 0),
      delta: readDelta(latestSettlement, 'metrics', 'carbon'),
      trend: 'flat',
      tone: 'neutral',
      highRisk: false,
      hint: '',
      score: 0
    },
    {
      key: 'satisfaction',
      label: t('play.metrics.satisfaction', '满意度'),
      after: readAfter(latestSettlement, 'metrics', 'satisfaction') ?? Number(metrics.satisfaction ?? 0),
      delta: readDelta(latestSettlement, 'metrics', 'satisfaction'),
      trend: 'flat',
      tone: 'neutral',
      highRisk: false,
      hint: '',
      score: 0
    }
  ].map((card) => {
    const trend = trendOf(card.delta);
    const tone = resolveTone(card.key, card.delta);
    const meaning = resolveHint(card.key, card.after, card.delta, t);
    const score = Math.abs(card.delta) + (meaning.highRisk ? 35 : 0) + (card.delta !== 0 ? 5 : 0);
    return {
      ...card,
      trend,
      tone,
      highRisk: meaning.highRisk,
      hint: meaning.hint,
      score
    };
  });

  const ranked = [...baseCards].sort((a, b) => b.score - a.score);
  const significantChanged = ranked.filter((card) => card.delta !== 0 && (Math.abs(card.delta) >= 5 || card.highRisk));
  const changed = ranked.filter((card) => card.delta !== 0);
  const focusCards = (
    significantChanged.length >= 3
      ? significantChanged.slice(0, 4)
      : changed.length >= 3
      ? changed.slice(0, 4)
      : ranked.slice(0, 3)
  );

  const summaryText = summaryFeedback(focusCards, transitionCopy.subtitle, t);
  const tips = strategyTips(baseCards, activeNegativeEvents, t);
  const comboPct = Number((latestSettlement as Record<string, unknown>)?.cardEffects && (latestSettlement as Record<string, any>).cardEffects?.comboPct || 0);
  const comboTriggered = Number.isFinite(comboPct) && comboPct > 0;

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) {
      return;
    }
    router.replace(pathname.replace(`/${locale}`, `/${nextLocale}`));
  };

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-[#f3f4f6] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-[1320px] px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-32 xl:pb-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">
              {t('play.settlement.badge', '回合结算')}
            </div>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              {t('play.settlement.heading', '第 {turn} 回合结算报告', { turn: settlementTurn })}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-700">
              {summaryText}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-slate-300 bg-white p-1">
              <button
                type="button"
                onClick={() => switchLocale('zh')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  locale === 'zh' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  locale === 'en' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t('play.settlement.languageEnglish', 'English')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {t('play.settlement.keyChangesTitle', '关键变化（本回合影响最大）')}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {focusCards.map((item) => {
                  const toneClass = toneClasses(item.tone, item.highRisk);
                  return (
                    <div key={item.key} className={`rounded-xl border p-3 ${toneClass}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-black uppercase tracking-[0.16em]">{item.label}</div>
                        <div className="inline-flex items-center gap-1 text-xs font-black">
                          {item.trend === 'up' ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : item.trend === 'down' ? (
                            <TrendingDown className="h-3.5 w-3.5" />
                          ) : (
                            <Minus className="h-3.5 w-3.5" />
                          )}
                          {trendLabel(item.trend, t)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <div className="text-2xl font-black">{item.after}</div>
                        <div className="text-base font-black">{formatDelta(item.delta)}</div>
                      </div>
                      <div className="mt-2 text-[12px] leading-5">{item.hint}</div>
                      {item.highRisk && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-rose-300 bg-white px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {t('play.settlement.riskTag', '高风险')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  {t('play.settlement.triggerTitle', '事件 / 组合技触发情况')}
                </div>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="font-semibold text-slate-900">{t('play.settlement.triggerEvents', '事件状态')}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {activeNegativeEvents.length > 0 ? (
                        activeNegativeEvents.map((event, index) => (
                          <span
                            key={`${String(event.eventType || 'event')}-${index}`}
                            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700"
                          >
                            {resolveEventTypeLabel(String(event.eventType || ''), locale, t)} · {t('play.events.remaining', 'remaining')} {Number(event.remainingTurns || 0)}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {t('play.settlement.triggerNoEvent', '本回合无新增负面事件压力')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{t('play.settlement.triggerCombos', '组合技状态')}</div>
                    <div className="mt-1 text-sm">
                      {comboTriggered
                        ? t('play.settlement.comboTriggered', '已触发组合技，联动加成 +{pct}%。', { pct: comboPct })
                        : t('play.settlement.comboNotTriggered', '本回合未触发组合技，可尝试优化相邻布局。')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  {t('play.settlement.strategyTitle', '策略建议')}
                </div>
                <div className="mt-3 space-y-2">
                  {tips.map((tip, index) => (
                    <div key={`${tip}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {t('play.settlement.videoLabel', 'Turn Settlement Demo Video')}
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-[270]">
        <div className="mx-auto max-w-[1320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 text-base font-black text-white transition-colors hover:bg-emerald-500"
          >
            {t('play.settlement.enterNextTurn', '进入下一回合')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
