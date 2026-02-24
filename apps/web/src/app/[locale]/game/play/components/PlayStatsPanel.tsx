'use client';

import { useMemo, useState } from 'react';
import type { GamePlayController } from '../hooks/useGamePlayController';

type PlayStatsPanelProps = Pick<
  GamePlayController,
  | 't'
  | 'resources'
  | 'metrics'
  | 'lowCarbonScore'
  | 'selectedCoreCard'
  | 'selectedCorePreviewReady'
  | 'selectedTile'
  | 'selectedTileAdjacency'
  | 'selectedTileSynergyBreakdown'
  | 'recommendedTile'
  | 'formatDelta'
  | 'placedCore'
  | 'catalog'
  | 'activeNegativeEvents'
  | 'resolveEventLabel'
  | 'resolvePolicyHintByEvent'
  | 'resolvePolicyIdsByEvent'
  | 'handPolicySet'
  | 'selectPolicyForEvent'
>;

type ValueKey = 'industry' | 'tech' | 'population' | 'green' | 'carbon' | 'satisfaction' | 'lowCarbonScore';
type ValueMap = Record<ValueKey, number>;

export default function PlayStatsPanel(props: PlayStatsPanelProps) {
  const {
    t,
    resources,
    metrics,
    lowCarbonScore,
    selectedCoreCard,
    selectedCorePreviewReady,
    selectedTile,
    selectedTileAdjacency,
    selectedTileSynergyBreakdown,
    recommendedTile,
    formatDelta,
    placedCore,
    catalog,
    activeNegativeEvents,
    resolveEventLabel,
    resolvePolicyHintByEvent,
    resolvePolicyIdsByEvent,
    handPolicySet,
    selectPolicyForEvent
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

  const currentValues = useMemo<ValueMap>(() => {
    return {
      industry: Number(resources.industry ?? 0),
      tech: Number(resources.tech ?? 0),
      population: Number(resources.population ?? 0),
      green: Number(metrics.green ?? 0),
      carbon: Number(metrics.carbon ?? 0),
      satisfaction: Number(metrics.satisfaction ?? 0),
      lowCarbonScore: Number(lowCarbonScore ?? 0)
    };
  }, [resources, metrics, lowCarbonScore]);

  const immediateDelta = useMemo<ValueMap | null>(() => {
    if (!selectedCoreCard) {
      return null;
    }
    return {
      industry: Number(selectedCoreCard.coreImmediateIndustryDelta ?? 0) - Number(selectedCoreCard.unlockCost.industry ?? 0),
      tech: Number(selectedCoreCard.coreImmediateTechDelta ?? 0) - Number(selectedCoreCard.unlockCost.tech ?? 0),
      population: Number(selectedCoreCard.coreImmediatePopulationDelta ?? 0) - Number(selectedCoreCard.unlockCost.population ?? 0),
      green: Number(selectedCoreCard.coreImmediateGreenDelta ?? 0) - Number(selectedCoreCard.unlockCost.green ?? 0),
      carbon: Number(selectedCoreCard.coreImmediateCarbonDelta ?? 0),
      satisfaction: Number(selectedCoreCard.coreImmediateSatisfactionDelta ?? 0),
      lowCarbonScore: 1
    };
  }, [selectedCoreCard]);

  const currentCardSettlementDelta = useMemo<ValueMap>(() => {
    if (!selectedCoreCard) {
      return {
        industry: 0,
        tech: 0,
        population: 0,
        green: 0,
        carbon: 0,
        satisfaction: 0,
        lowCarbonScore: 0
      };
    }
    return {
      industry: Number(selectedCoreCard.coreContinuousIndustryDelta ?? 0),
      tech: Number(selectedCoreCard.coreContinuousTechDelta ?? 0),
      population: Number(selectedCoreCard.coreContinuousPopulationDelta ?? 0),
      green: Number(selectedCoreCard.coreContinuousGreenDelta ?? 0),
      carbon: Number(selectedCoreCard.coreContinuousCarbonDelta ?? 0),
      satisfaction: Number(selectedCoreCard.coreContinuousSatisfactionDelta ?? 0),
      lowCarbonScore: 0
    };
  }, [selectedCoreCard]);

  const recurringDelta = useMemo<ValueMap>(() => {
    const total: ValueMap = {
      industry: 0,
      tech: 0,
      population: 0,
      green: 0,
      carbon: 0,
      satisfaction: 0,
      lowCarbonScore: 0
    };
    placedCore.forEach((cardId) => {
      const card = catalog.get(cardId);
      if (!card) {
        return;
      }
      total.industry += Number(card.coreContinuousIndustryDelta ?? 0);
      total.tech += Number(card.coreContinuousTechDelta ?? 0);
      total.population += Number(card.coreContinuousPopulationDelta ?? 0);
      total.green += Number(card.coreContinuousGreenDelta ?? 0);
      total.carbon += Number(card.coreContinuousCarbonDelta ?? 0);
      total.satisfaction += Number(card.coreContinuousSatisfactionDelta ?? 0);
    });
    return total;
  }, [placedCore, catalog]);

  return (
    <section className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4 overflow-hidden shadow-sm">
      <div className="space-y-2">
        <PanelHeader title={t('play.preview.selectedProjection', 'Action Preview')} toneClass="bg-violet-500" />
        <div className="space-y-2">
          <div className="text-[11px] text-slate-600 dark:text-slate-300">
            {t('play.common.selectedCard', 'Selected Card')}: <span className="font-bold text-slate-800 dark:text-slate-100">{selectedCoreCard?.chineseName || '-'}</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {selectedTile ? `${t('play.common.tile', 'Tile')}: ${selectedTile}` : t('play.common.tileNotSelected', 'Tile not selected')}
            {selectedTile && recommendedTile && selectedTile === recommendedTile ? ` · ${t('play.preview.recommendedTag', 'Recommended')}` : ''}
          </div>
          <CompactPreviewTable
            t={t}
            current={currentValues}
            recurringDelta={recurringDelta}
            immediateDelta={immediateDelta}
            currentCardSettlementDelta={currentCardSettlementDelta}
            formatDelta={formatDelta}
          />
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-[10px] text-slate-600 dark:text-slate-300">
            {t('play.preview.synergyAdjacency', 'Adjacency')}: {selectedTileAdjacency} · {t('play.preview.synergyTitle', 'Synergy')}: {selectedTileSynergyBreakdown?.totalScore ?? 0}
          </div>
          {!selectedCoreCard && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {t('play.preview.selectTileFirst', 'Select a core card and a tile to view preview.')}
            </div>
          )}
          {selectedCoreCard && !selectedCorePreviewReady && (
            <div className="text-[10px] text-amber-700">{t('play.stats.previewNotReady', 'Choose a placeable tile to finalize preview.')}</div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2 min-h-0">
        <PanelHeader title={t('play.events.title', 'Risk & Events')} toneClass="bg-rose-500" />
        {activeNegativeEvents.length === 0 && (
          <div className="text-[11px] text-emerald-700">{t('play.events.noneActive', 'No active negative events')}</div>
        )}
        {activeNegativeEvents.length > 0 && (
          <div className="space-y-2">
            {activeNegativeEvents.slice(0, 2).map((event, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedEventType(String(event.eventType))}
                className={`w-full text-left p-2 rounded-xl border transition-colors ${effectiveSelectedEventType === String(event.eventType) ? 'bg-rose-100 border-rose-300' : 'bg-rose-50 border-rose-100 hover:bg-rose-100/70'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-rose-900 truncate">{resolveEventLabel(String(event.eventType))}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-200/60 rounded-lg text-rose-700">{event.remainingTurns}T</span>
                </div>
              </button>
            ))}
            {selectedEvent && (
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 space-y-2">
                <div className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {resolvePolicyHintByEvent(String(selectedEvent.eventType))}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t('play.events.suggestedPolicies', 'Suggested policies')}: {recommendedPolicies.length > 0 ? recommendedPolicies.join(', ') : t('play.common.none', 'None')}
                </div>
                <button
                  type="button"
                  onClick={() => selectPolicyForEvent(String(selectedEvent.eventType))}
                  className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${hasRecommendedPolicyInHand ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
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

function PanelHeader({ title, toneClass }: { title: string; toneClass: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className={`w-1 h-3 rounded-full ${toneClass}`} />
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
    </div>
  );
}

function CompactPreviewTable({
  t,
  current,
  recurringDelta,
  immediateDelta,
  currentCardSettlementDelta,
  formatDelta
}: {
  t: GamePlayController['t'];
  current: ValueMap;
  recurringDelta: ValueMap;
  immediateDelta: ValueMap | null;
  currentCardSettlementDelta: ValueMap;
  formatDelta: (value: number) => string;
}) {
  const rows: Array<{ key: ValueKey; label: string }> = [
    { key: 'industry', label: `${t('play.resources.industry', 'Industry')} (I)` },
    { key: 'tech', label: `${t('play.resources.tech', 'Tech')} (T)` },
    { key: 'population', label: `${t('play.resources.population', 'Population')} (P)` },
    { key: 'green', label: `${t('play.metrics.green', 'Green')} (G)` },
    { key: 'carbon', label: `${t('play.metrics.carbon', 'Carbon')} (C)` },
    { key: 'satisfaction', label: `${t('play.metrics.satisfaction', 'Satisfaction')} (S)` },
    { key: 'lowCarbonScore', label: `${t('play.metrics.lowCarbon', 'Low Carbon Score')} (L)` }
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 mb-1 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <div>{t('play.metrics.title', 'Metric')}</div>
        <div className="text-right">{t('play.stats.immediateImpact', 'Immediate')}</div>
        <div className="text-right">{t('play.stats.settlementImpact', 'Settlement')}</div>
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => {
          const base = current[row.key];
          const immediateDiff = immediateDelta ? Number(immediateDelta[row.key] ?? 0) : 0;
          const settlementDiff = Number(recurringDelta[row.key] ?? 0) + Number(currentCardSettlementDelta[row.key] ?? 0);
          const immediateProjected = base + immediateDiff;
          const settlementProjected = base + settlementDiff;
          return (
            <div key={row.key} className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 items-center text-[10px]">
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{row.label}</span>
              <span className="text-right text-slate-700 dark:text-slate-200">
                <span>{base}</span>{' '}
                <span className={immediateDiff === 0 ? 'text-slate-400' : immediateDiff > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {immediateDiff === 0 ? '0' : formatDelta(immediateDiff)}
                </span>{' '}
                <span className="text-slate-400">{'->'}</span>{' '}
                <span className={immediateDiff > 0 ? 'text-emerald-700 font-bold' : immediateDiff < 0 ? 'text-rose-700 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                  {immediateProjected}
                </span>
              </span>
              <span className="text-right text-slate-700 dark:text-slate-200">
                <span>{base}</span>{' '}
                <span className={settlementDiff === 0 ? 'text-slate-400' : settlementDiff > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {settlementDiff === 0 ? '0' : formatDelta(settlementDiff)}
                </span>{' '}
                <span className="text-slate-400">{'->'}</span>{' '}
                <span className={settlementDiff > 0 ? 'text-emerald-700 font-bold' : settlementDiff < 0 ? 'text-rose-700 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                  {settlementProjected}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
