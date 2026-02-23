'use client';

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
    tradeQuota,
    tradeLastPrice,
  } = props;

  return (
    <section className="h-full bg-white/60 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar shadow-sm">
      {/* 1. Resources Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-3 bg-emerald-600 rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('play.resources.title', 'RESOURCES')}</h3>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <StatItem label={t('play.resources.industry', 'Industry')} value={resources.industry ?? 0} color="text-emerald-950" icon="factory" />
          <StatItem label={t('play.resources.tech', 'Tech')} value={resources.tech ?? 0} color="text-emerald-800" icon="cpu" />
          <StatItem label={t('play.resources.population', 'Population')} value={resources.population ?? 0} color="text-emerald-700" icon="users" />
        </div>
      </div>

      {/* 2. Metrics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-3 bg-sky-500 rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('play.metrics.title', 'METRICS')}</h3>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <StatItem label={t('play.metrics.green', 'Green Score')} value={metrics.green ?? 0} color="text-emerald-600" icon="leaf" />
          <StatItem label={t('play.metrics.carbon', 'Carbon Emission')} value={metrics.carbon ?? 0} color="text-rose-600" icon="cloud" />
          <StatItem label={t('play.metrics.satisfaction', 'Satisfaction')} value={metrics.satisfaction ?? 0} color="text-sky-600" icon="smile" />
        </div>
      </div>

      {/* 3. Placement Projection */}
      <div className={`p-5 rounded-3xl border transition-all duration-300 ${selectedCorePreviewReady
        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
        : 'bg-slate-50 border-slate-100'
        }`}>
        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('play.preview.selectedProjection', 'PROJECTION')}</h3>
        {(!selectedCorePreviewReady || !selectedCorePlacementPreview) ? (
          <p className="text-[10px] text-slate-400 italic leading-relaxed">{t('play.preview.selectTileFirst', 'SELECT UNIT & TILE')}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ProjectionDelta label="I" delta={selectedCorePlacementPreview.delta.industry} format={formatDelta} />
              <ProjectionDelta label="T" delta={selectedCorePlacementPreview.delta.tech} format={formatDelta} />
              <ProjectionDelta label="P" delta={selectedCorePlacementPreview.delta.population} format={formatDelta} />
              <div className="w-full h-px bg-slate-200 col-span-2 my-0.5" />
              <ProjectionDelta label="G" delta={selectedCorePlacementPreview.delta.green} format={formatDelta} />
              <ProjectionDelta label="C" delta={selectedCorePlacementPreview.delta.carbon} format={formatDelta} />
              <ProjectionDelta label="S" delta={selectedCorePlacementPreview.delta.satisfaction} format={formatDelta} />
            </div>

            {selectedTileSynergyBreakdown && (
              <div className="mt-2 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">{t('play.preview.synergyTitle', 'SYNERGY')}</span>
                <span className="text-sm font-black text-emerald-600">+{selectedTileSynergyBreakdown.totalScore}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Alerts & Market */}
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
              <div key={idx} className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-rose-950 truncate uppercase tracking-tighter">{resolveEventLabel(String(event.eventType))}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-200/50 rounded-lg text-rose-700">{event.remainingTurns}T</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="flex items-center justify-between group p-1.5 rounded-xl transition-colors">
      <span className="text-[11px] font-black text-slate-500">{label}</span>
      <span className={`text-[12px] font-black ${color}`}>{value}</span>
    </div>
  );
}

function ProjectionDelta({ label, delta, format }: { label: string; delta: number; format: (d: number) => string }) {
  if (delta === 0) return null;
  const isPos = delta > 0;
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white border border-slate-200/50">
      <span className="text-[8px] font-black text-slate-400">{label}</span>
      <span className={`text-[10px] font-black ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
        {format(delta)}
      </span>
    </div>
  );
}
