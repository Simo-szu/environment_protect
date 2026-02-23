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
    placedCore,
    corePlacedThisTurn,
    tradeQuota,
    tradeLastPrice,
    tradeProfit,
    latestTradeRecord,
    tradeWindowOpened,
    activeNegativeEvents,
    resolveEventLabel,
    resolvePolicyHintByEvent,
    resolvePolicyIdsByEvent,
    handPolicySet,
    pendingDiscardBlocking,
    selectPolicyForEvent,
    timelineItems
  } = props;

  return (
    <section className="col-span-2 bg-white rounded-2xl border border-slate-200/60 p-4 space-y-2 min-h-0 overflow-y-auto shadow-sm">
      <div className="font-semibold">{t('play.resources.title', '资源')}</div>
      <div className="text-sm">{t('play.resources.industry', '产业值')}: {resources.industry ?? 0}</div>
      <div className="text-sm">{t('play.resources.tech', '科创点')}: {resources.tech ?? 0}</div>
      <div className="text-sm">{t('play.resources.population', '人口')}: {resources.population ?? 0}</div>
      <div className="pt-3 font-semibold">{t('play.metrics.title', '指标')}</div>
      <div className="text-sm">{t('play.metrics.green', '绿建度')}: {metrics.green ?? 0}</div>
      <div className="text-sm">{t('play.metrics.carbon', '碳排放')}: {metrics.carbon ?? 0}</div>
      <div className="text-sm">{t('play.metrics.satisfaction', '满意度')}: {metrics.satisfaction ?? 0}</div>
      {selectedCorePlacementPreview && (
        <div className={`pt-3 mt-3 border-t border-slate-200 ${selectedCorePreviewReady ? 'text-slate-700' : 'text-slate-500'}`}>
          <div className="font-semibold">{t('play.preview.selectedProjection', '选中落点预估')}</div>
          {!selectedCorePreviewReady && (
            <div className="text-xs mt-1">{t('play.preview.selectTileFirst', '先选择一张核心卡和一个棋盘空位以查看预估变化。')}</div>
          )}
          {selectedCorePreviewReady && (
            <div className="mt-1 space-y-1 text-xs">
              <div>{t('play.resources.industry', '产业值')}: {selectedCorePlacementPreview.industry} ({formatDelta(selectedCorePlacementPreview.delta.industry)})</div>
              <div>{t('play.resources.tech', '科创点')}: {selectedCorePlacementPreview.tech} ({formatDelta(selectedCorePlacementPreview.delta.tech)})</div>
              <div>{t('play.resources.population', '人口')}: {selectedCorePlacementPreview.population} ({formatDelta(selectedCorePlacementPreview.delta.population)})</div>
              <div>{t('play.metrics.green', '绿建度')}: {selectedCorePlacementPreview.green} ({formatDelta(selectedCorePlacementPreview.delta.green)})</div>
              <div>{t('play.metrics.carbon', '碳排放')}: {selectedCorePlacementPreview.carbon} ({formatDelta(selectedCorePlacementPreview.delta.carbon)})</div>
              <div>{t('play.metrics.satisfaction', '满意度')}: {selectedCorePlacementPreview.satisfaction} ({formatDelta(selectedCorePlacementPreview.delta.satisfaction)})</div>
              <div className="pt-1 mt-1 border-t border-slate-200">
                <div className="font-semibold">{t('play.preview.breakdownTitle', '变化分解')}</div>
                <div>{t('play.preview.costImpact', '放置成本')}: I {formatDelta(-Number(selectedCoreCard?.unlockCost.industry ?? 0))} / T {formatDelta(-Number(selectedCoreCard?.unlockCost.tech ?? 0))} / P {formatDelta(-Number(selectedCoreCard?.unlockCost.population ?? 0))} / G {formatDelta(-Number(selectedCoreCard?.unlockCost.green ?? 0))}</div>
                <div>{t('play.preview.baseEffect', '基础持续')}: I {formatDelta(Number(selectedCoreCard?.coreContinuousIndustryDelta ?? 0))} / T {formatDelta(Number(selectedCoreCard?.coreContinuousTechDelta ?? 0))} / P {formatDelta(Number(selectedCoreCard?.coreContinuousPopulationDelta ?? 0))} / G {formatDelta(Number(selectedCoreCard?.coreContinuousGreenDelta ?? 0))} / C {formatDelta(Number(selectedCoreCard?.coreContinuousCarbonDelta ?? 0))} / S {formatDelta(Number(selectedCoreCard?.coreContinuousSatisfactionDelta ?? 0))}</div>
                <div>
                  {t('play.preview.tilePotential', '落点联动潜力')}: {selectedTileAdjacency} {t('play.board.adjacentUnit', '相邻')}
                  {selectedTile && selectedTile === recommendedTile ? ` (${t('play.preview.recommendedTag', '推荐')})` : ''}
                </div>
                {selectedTileSynergyBreakdown && (
                  <div className="pt-1 mt-1 border-t border-slate-200 space-y-1">
                    <div className="font-semibold">
                      {t('play.preview.synergyTitle', '联动解释')}
                      : {selectedTileSynergyBreakdown.totalScore}
                    </div>
                    <div>
                      {t('play.preview.synergyFormula', '总潜力 = 邻接 + 同板块 + 同阶段 + 多样性')}
                    </div>
                    <div>
                      {t('play.preview.synergyAdjacency', '邻接')} {selectedTileSynergyBreakdown.adjacencyBonus}
                      {' / '}
                      {t('play.preview.synergyDomain', '同板块')} {selectedTileSynergyBreakdown.sameDomainBonus}
                      {' / '}
                      {t('play.preview.synergyPhase', '同阶段')} {selectedTileSynergyBreakdown.samePhaseBonus}
                      {' / '}
                      {t('play.preview.synergyDiversity', '多样性')} {selectedTileSynergyBreakdown.diversityBonus}
                    </div>
                    {selectedTileSynergyBreakdown.neighbors.length > 0 && (
                      <div className="space-y-1">
                        {selectedTileSynergyBreakdown.neighbors.map((item) => (
                          <div key={`${item.position}-${item.cardId}`}>
                            [{item.position}] {item.cardName}
                            {item.sameDomain ? ` / ${t('play.preview.sameDomainTag', '同板块')}` : ''}
                            {item.samePhase ? ` / ${t('play.preview.samePhaseTag', '同阶段')}` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-500">{t('play.preview.applyHint', '按基础规则估算：已包含放置成本与基础持续值，不包含组合技/政策/事件修正。')}</div>
            </div>
          )}
        </div>
      )}
      <div className="pt-2 text-xs text-slate-500">{t('play.metrics.placedCore', '已放置核心卡')}: {placedCore.length}</div>
      <div className={`text-xs ${corePlacedThisTurn ? 'text-amber-600' : 'text-slate-500'}`}>
        {corePlacedThisTurn
          ? t('play.metrics.corePlacedDone', '本回合已放置核心卡')
          : t('play.metrics.corePlacedTodo', '本回合可放置 1 张核心卡')}
      </div>
      <div className="pt-3 border-t border-slate-200 mt-3">
        <div className="font-semibold mb-1">{t('play.trade.title', '碳交易')}</div>
        <div className="text-sm">{t('play.trade.quota', '配额')}: {tradeQuota}</div>
        <div className="text-sm">{t('play.trade.currentPrice', '当前价格')}: {tradeLastPrice.toFixed(1)}</div>
        <div className="text-sm">{t('play.trade.profit', '累计收益')}: {tradeProfit.toFixed(1)}</div>
        {latestTradeRecord && (
          <div className="text-xs text-slate-500 mt-1">
            {t('play.trade.last', '最近交易')}: {String(latestTradeRecord.action)} / {t('play.trade.amount', '数量')} {Number(latestTradeRecord.amount || 0)}
          </div>
        )}
        <div className={`text-xs mt-1 ${tradeWindowOpened ? 'text-emerald-600' : 'text-slate-500'}`}>
          {tradeWindowOpened
            ? t('play.trade.windowOpen', '本回合可交易')
            : t('play.trade.windowClosed', '本回合不可交易')}
        </div>
      </div>
      <div className="pt-3 border-t border-slate-200 mt-3">
        <div className="font-semibold mb-1">{t('play.events.title', '当前负面事件')}</div>
        {activeNegativeEvents.length === 0 && <div className="text-xs text-slate-500">{t('play.common.none', '无')}</div>}
        {activeNegativeEvents.map((event, idx: number) => (
          <div key={`${String(event.eventType)}-${idx}`} className="text-xs text-slate-600 rounded border border-slate-200 p-2 mb-2">
            <div className="font-medium">
              {resolveEventLabel(String(event.eventType || ''))} ({t('play.events.remaining', '剩余')}: {Number(event.remainingTurns || 0)})
            </div>
            <div className="text-slate-500 mt-1">{resolvePolicyHintByEvent(String(event.eventType || ''))}</div>
            {resolvePolicyIdsByEvent(String(event.eventType || '')).length > 0 && (
              <div className="mt-1">
                <div className="text-[11px] text-slate-500">{t('play.events.suggestedPolicies', '建议政策')}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resolvePolicyIdsByEvent(String(event.eventType || '')).map((policyId: string) => {
                    const inHand = handPolicySet.has(policyId);
                    return (
                      <span
                        key={`${String(event.eventType)}-${policyId}`}
                        className={`px-1.5 py-0.5 rounded border text-[10px] ${inHand
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                      >
                        {policyId}
                      </span>
                    );
                  })}
                </div>
                {!pendingDiscardBlocking && (
                  <button
                    type="button"
                    onClick={() => selectPolicyForEvent(String(event.eventType || ''))}
                    className="mt-1 px-2 py-1 rounded border border-emerald-300 bg-emerald-50 text-[11px] text-emerald-700"
                  >
                    {t('play.events.selectAvailablePolicy', '一键选中可用政策')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-slate-200 mt-3">
        <div className="font-semibold mb-1">{t('play.timeline.title', '回合记录')}</div>
        {timelineItems.length === 0 && <div className="text-xs text-slate-500">{t('play.timeline.empty', '暂无记录')}</div>}
        <div className="space-y-1">
          {timelineItems.map((item) => (
            <div key={item.key} className="text-xs text-slate-600">
              <span className="text-slate-400">T{item.turn}</span> {item.message}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
