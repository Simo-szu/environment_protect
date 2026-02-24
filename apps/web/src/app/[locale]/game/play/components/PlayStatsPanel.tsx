'use client';

import { useMemo, useState } from 'react';
import type { GamePlayController } from '../hooks/useGamePlayController';

type PlayStatsPanelProps = Pick<
  GamePlayController,
  | 't'
  | 'resources'
  | 'metrics'
  | 'selectedCorePlacementPreview'
  | 'selectedCorePreviewReady'
  | 'formatDelta'
  | 'selectedCoreCard'
  | 'selectedTileAdjacency'
  | 'selectedTile'
  | 'recommendedTile'
  | 'selectedTileSynergyBreakdown'
  | 'placedCore'
  | 'corePlacedThisTurn'
  | 'tradeQuota'
  | 'tradeLastPrice'
  | 'tradeProfit'
  | 'latestTradeRecord'
  | 'tradeWindowOpened'
  | 'activeNegativeEvents'
  | 'resolveEventLabel'
  | 'resolvePolicyHintByEvent'
  | 'resolvePolicyIdsByEvent'
  | 'handPolicySet'
  | 'pendingDiscardBlocking'
  | 'selectPolicyForEvent'
  | 'timelineItems'
>;

export default function PlayStatsPanel(props: PlayStatsPanelProps) {
  const {
    t,
    resources,
    metrics,
    selectedCorePlacementPreview,
    selectedCorePreviewReady,
    formatDelta,
    selectedCoreCard,
    selectedTileAdjacency,
    selectedTile,
    recommendedTile,
    selectedTileSynergyBreakdown,
    activeNegativeEvents,
    resolveEventLabel,
    resolvePolicyHintByEvent,
    resolvePolicyIdsByEvent,
    handPolicySet,
    selectPolicyForEvent,
    tradeQuota,
    tradeLastPrice,
  } = props;
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const effectiveSelectedEventType = useMemo(() => {
    if (selectedEventType && activeNegativeEvents.some((event) => String(event.eventType) === selectedEventType)) {
      return selectedEventType;
    }
    return activeNegativeEvents.length > 0 ? String(activeNegativeEvents[0].eventType) : '';
  }, [selectedEventType, activeNegativeEvents]);
  const selectedEvent = useMemo(
    () => activeNegativeEvents.find((event) => String(event.eventType) === effectiveSelectedEventType) || null,
    [activeNegativeEvents, effectiveSelectedEventType]
  );
  const recommendedPolicies = effectiveSelectedEventType ? resolvePolicyIdsByEvent(effectiveSelectedEventType) : [];
  const hasRecommendedPolicyInHand = recommendedPolicies.some((policyId) => handPolicySet.has(policyId));
  const previewDelta = selectedCorePreviewReady && selectedCorePlacementPreview
    ? selectedCorePlacementPreview.delta
    : null;

  return (
    <section className="h-full bg-white/60 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar shadow-sm">
      {/* 1. Resources Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-3 bg-emerald-600 rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('play.resources.title', 'RESOURCES')}</h3>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <StatItem label={`${t('play.resources.industry', 'Industry')} (I)`} value={resources.industry ?? 0} delta={previewDelta?.industry ?? 0} color="text-emerald-950" format={formatDelta} />
          <StatItem label={`${t('play.resources.tech', 'Tech')} (T)`} value={resources.tech ?? 0} delta={previewDelta?.tech ?? 0} color="text-emerald-800" format={formatDelta} />
          <StatItem label={`${t('play.resources.population', 'Population')} (P)`} value={resources.population ?? 0} delta={previewDelta?.population ?? 0} color="text-emerald-700" format={formatDelta} />
        </div>
      </div>

      {/* 2. Metrics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-3 bg-sky-500 rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('play.metrics.title', 'METRICS')}</h3>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <StatItem label={`${t('play.metrics.green', 'Green Score')} (G)`} value={metrics.green ?? 0} delta={previewDelta?.green ?? 0} color="text-emerald-600" format={formatDelta} />
          <StatItem label={`${t('play.metrics.carbon', 'Carbon Emission')} (C)`} value={metrics.carbon ?? 0} delta={previewDelta?.carbon ?? 0} color="text-rose-600" format={formatDelta} />
          <StatItem label={`${t('play.metrics.satisfaction', 'Satisfaction')} (S)`} value={metrics.satisfaction ?? 0} delta={previewDelta?.satisfaction ?? 0} color="text-sky-600" format={formatDelta} />
        </div>
      </div>

      {/* 3. Alerts & Market */}
      <div className="space-y-5 pt-8 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase">{t('play.trade.quota', 'CO2 QUOTA')}</span>
            <span className="text-xs font-black text-slate-900">{tradeQuota}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase">{t('play.trade.currentPrice', 'PRICE')}</span>
            <span className="text-xs font-black text-emerald-600">{tradeLastPrice.toFixed(1)}</span>
          </div>
        </div>

        {activeNegativeEvents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600">{t('play.events.title', 'ALERTS')}</h3>
            {activeNegativeEvents.map((event, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedEventType(String(event.eventType))}
                className={`w-full text-left p-3 rounded-2xl border transition-colors ${effectiveSelectedEventType === String(event.eventType) ? 'bg-rose-100 border-rose-300' : 'bg-rose-50 border-rose-100 hover:bg-rose-100/70'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-rose-950 truncate uppercase tracking-tighter">{resolveEventLabel(String(event.eventType))}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-200/50 rounded-lg text-rose-700">{event.remainingTurns}T</span>
                </div>
              </button>
            ))}
            {selectedEvent && (
              <div className="p-3 rounded-2xl bg-white border border-rose-200 space-y-2">
                <div className="text-[10px] font-black text-rose-900 uppercase tracking-widest">
                  {resolveEventLabel(String(selectedEvent.eventType))}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-600">
                  {resolvePolicyHintByEvent(String(selectedEvent.eventType))}
                </div>
                <div className="text-[10px] text-slate-500">
                  {t('play.events.suggestedPolicies', 'Suggested policies')}: {recommendedPolicies.length > 0 ? recommendedPolicies.join(', ') : t('play.common.none', 'None')}
                </div>
                <button
                  type="button"
                  onClick={() => selectPolicyForEvent(String(selectedEvent.eventType))}
                  className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${hasRecommendedPolicyInHand ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  disabled={!hasRecommendedPolicyInHand}
                >
                  {t('play.events.selectAvailablePolicy', 'Pick available policy')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StatItem({
  label,
  value,
  delta,
  color,
  format
}: {
  label: string;
  value: number;
  delta: number;
  color: string;
  format: (value: number) => string;
}) {
  const hasDelta = delta !== 0;
  const projected = value + delta;
  const deltaTone = delta > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200';
  const projectedTone = delta > 0 ? 'text-emerald-700' : 'text-rose-600';
  return (
    <div className="flex items-center justify-between group p-1.5 rounded-xl transition-colors">
      <span className="text-[11px] font-black text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-[12px] font-black ${color}`}>{value}</span>
        {hasDelta && (
          <>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border transition-all duration-300 animate-in fade-in slide-in-from-right-2 ${deltaTone}`}>
              {format(delta)}
            </span>
            <span className="text-[9px] font-black text-slate-400">→</span>
            <span className={`text-[12px] font-black transition-all duration-300 ${projectedTone}`}>
              {projected}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
