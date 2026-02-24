'use client';

import { useMemo, useState } from 'react';
import type { GameCardMeta } from '@/lib/api/game';
import type { GamePlayController } from '../hooks/useGamePlayController';

type PlayBoardAndHandsPanelProps = Pick<
  GamePlayController,
  | 't'
  | 'boardViewMode'
  | 'setBoardViewMode'
  | 'selectedCoreId'
  | 'selectedCoreCard'
  | 'selectedTile'
  | 'recommendedTile'
  | 'placeableTileKeySet'
  | 'selectedTileAdjacency'
  | 'selectedTileSynergyBreakdown'
  | 'boardPlacementMode'
  | 'guidedTutorialActive'
  | 'currentGuidedTask'
  | 'boardSize'
  | 'boardOccupied'
  | 'selectedOccupiedTile'
  | 'tileAdjacencyScoreMap'
  | 'tileSynergyBreakdownMap'
  | 'adjacencyRequired'
  | 'ending'
  | 'pendingDiscardBlocking'
  | 'guidedActionAllowed'
  | 'setSelectedOccupiedTile'
  | 'setSelectedTile'
  | 'dragOverTile'
  | 'setDragOverTile'
  | 'draggingCoreId'
  | 'setDraggingCoreId'
  | 'setSelectedCoreId'
  | 'setError'
  | 'handCoreCards'
  | 'pendingDiscardActive'
  | 'pendingDiscardRequiredTotal'
  | 'pendingDiscardTargetHandSize'
  | 'canPlaceCoreCard'
  | 'coreAffordabilityMap'
  | 'discardCard'
  | 'resolveImageUrl'
  | 'formatDelta'
  | 'setCorePeekOpen'
  | 'actionLoading'
  | 'corePlacedThisTurn'
  | 'selectedCoreAffordability'
  | 'placeCoreCard'
  | 'runRemoveCoreAction'
  | 'guidedGateEnabled'
  | 'guidedTutorialCompleted'
  | 'placeActionBlockedReason'
  | 'removeActionBlockedReason'
  | 'handPolicyCards'
  | 'setSelectedPolicyId'
  | 'selectedPolicyId'
  | 'runAction'
  | 'policyUsedThisTurn'
  | 'strictGuideMode'
  | 'policyActionBlockedReason'
  | 'selectedPolicyCard'
  | 'selectedPolicyRiskLevel'
  | 'selectedPolicyImmediateDelta'
  | 'selectedPolicyHasImmediateDelta'
  | 'tradeType'
  | 'setTradeType'
  | 'tradeAmount'
  | 'setTradeAmount'
  | 'runTradeAction'
  | 'tradeActionDisabled'
  | 'tradeActionBlockedReason'
  | 'tradeWindowOpened'
  | 'tradeWindowInterval'
  | 'tradeQuota'
  | 'tradeLastPrice'
  | 'tradeProfit'
  | 'latestTradeRecord'
  | 'turn'
  | 'catalog'
  | 'locale'
>;

export default function PlayBoardAndHandsPanel(props: PlayBoardAndHandsPanelProps) {
  const {
    t,
    selectedCoreId,
    selectedCoreCard,
    selectedTile,
    recommendedTile,
    placeableTileKeySet,
    guidedTutorialActive,
    currentGuidedTask,
    boardSize,
    boardOccupied,
    selectedOccupiedTile,
    tileAdjacencyScoreMap,
    tileSynergyBreakdownMap,
    adjacencyRequired,
    ending,
    pendingDiscardBlocking,
    guidedActionAllowed,
    setSelectedOccupiedTile,
    setSelectedTile,
    dragOverTile,
    setDragOverTile,
    draggingCoreId,
    setDraggingCoreId,
    setSelectedCoreId,
    handCoreCards,
    pendingDiscardActive,
    pendingDiscardRequiredTotal,
    pendingDiscardTargetHandSize,
    canPlaceCoreCard,
    coreAffordabilityMap,
    discardCard,
    resolveImageUrl,
    actionLoading,
    corePlacedThisTurn,
    selectedCoreAffordability,
    placeCoreCard,
    handPolicyCards,
    setSelectedPolicyId,
    selectedPolicyId,
    runAction,
    policyUsedThisTurn,
    strictGuideMode,
    selectedTileSynergyBreakdown,
    selectedTileAdjacency,
    boardViewMode,
    boardPlacementMode,
    tradeType,
    setTradeType,
    tradeAmount,
    setTradeAmount,
    runTradeAction,
    tradeActionDisabled,
    tradeActionBlockedReason,
    tradeWindowOpened,
    tradeWindowInterval,
    tradeQuota,
    tradeLastPrice,
    tradeProfit,
    latestTradeRecord,
    turn,
    catalog,
    locale
  } = props;
  const [showTradeSummary, setShowTradeSummary] = useState(false);

  const [hoveredTileKey, setHoveredTileKey] = useState('');
  const activeInfoKey = hoveredTileKey || selectedOccupiedTile || selectedTile;
  const selectedCoreName = selectedCoreCard
    ? (locale === 'zh' ? selectedCoreCard.chineseName : selectedCoreCard.englishName)
    : '';
  const selectedCoreDomain = selectedCoreCard?.domain || '';
  const selectedCorePhase = selectedCoreCard?.phaseBucket || '';

  function collectCoreContinuousEffects(card: GameCardMeta | null): string[] {
    if (!card) {
      return [];
    }
    const effects: string[] = [];
    const rows: Array<{ k: string; v: number | undefined }> = [
      { k: 'I', v: card.coreContinuousIndustryDelta },
      { k: 'T', v: card.coreContinuousTechDelta },
      { k: 'P', v: card.coreContinuousPopulationDelta },
      { k: 'G', v: card.coreContinuousGreenDelta },
      { k: 'C', v: card.coreContinuousCarbonDelta },
      { k: 'S', v: card.coreContinuousSatisfactionDelta }
    ];
    rows.forEach((item) => {
      const value = Number(item.v || 0);
      if (value !== 0) {
        effects.push(`${item.k}${value > 0 ? '+' : ''}${value}`);
      }
    });
    return effects;
  }
  const activeTileInfo = useMemo(() => {
    if (!activeInfoKey) {
      return null;
    }
    const [row, col] = activeInfoKey.split(',').map((value) => Number(value));
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      return null;
    }
    const occupiedCardId = boardOccupied[activeInfoKey];
    const occupiedCard = occupiedCardId ? catalog.get(occupiedCardId) : null;
    const tileBreakdown = tileSynergyBreakdownMap.get(activeInfoKey) || null;
    const occupiedEffects = collectCoreContinuousEffects(occupiedCard || null);
    const occupiedRelationToSelectedCore = occupiedCard && selectedCoreCard ? {
      sameDomain: occupiedCard.domain === selectedCoreDomain,
      samePhase: occupiedCard.phaseBucket === selectedCorePhase
    } : null;
    return {
      key: activeInfoKey,
      row,
      col,
      occupiedCardId,
      occupiedCard,
      occupiedName: occupiedCard
        ? (locale === 'zh' ? occupiedCard.chineseName : occupiedCard.englishName)
        : '',
      placeable: placeableTileKeySet.has(activeInfoKey),
      adjacencyScore: tileAdjacencyScoreMap.get(activeInfoKey) || 0,
      synergyScore: tileSynergyBreakdownMap.get(activeInfoKey)?.totalScore || 0,
      recommended: activeInfoKey === recommendedTile,
      tileBreakdown,
      occupiedEffects,
      occupiedRelationToSelectedCore
    };
  }, [
    activeInfoKey,
    boardOccupied,
    catalog,
    locale,
    placeableTileKeySet,
    tileAdjacencyScoreMap,
    tileSynergyBreakdownMap,
    recommendedTile,
    selectedCoreCard,
    selectedCoreDomain,
    selectedCorePhase
  ]);

  const roundsUntilTradeOpen = useMemo(() => {
    if (tradeWindowOpened) {
      return 0;
    }
    if (strictGuideMode) {
      return Math.max(0, 4 - turn);
    }
    const interval = Number(tradeWindowInterval || 0);
    if (!Number.isFinite(interval) || interval <= 0) {
      return 0;
    }
    const remainder = turn % interval;
    return remainder === 0 ? interval : interval - remainder;
  }, [tradeWindowOpened, strictGuideMode, turn, tradeWindowInterval]);

  const tradedThisTurn = useMemo(() => {
    const recordTurn = Number(latestTradeRecord?.turn ?? 0);
    const action = String(latestTradeRecord?.action ?? '').toLowerCase();
    return recordTurn === turn && (action === 'buy' || action === 'sell');
  }, [latestTradeRecord, turn]);

  return (
    <section className="h-full flex flex-col relative bg-transparent overflow-visible gap-4 p-0 transition-all duration-500">

      {/* 移除强遮罩，改为通知条 + 牌面反馈 */}

      {/* --- TOP ZONE (50% Height): Board & Trade Segmented --- */}
      <div className={`flex-[5] flex gap-4 min-h-0 transition-all duration-500 ${pendingDiscardActive ? 'grayscale opacity-60 pointer-events-none' : ''}`}>

        {/* Left 50%: Board (Grid) */}
        <div className="flex-1 bg-white/60 dark:bg-slate-900/70 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-700 p-4 relative z-[60] shadow-sm overflow-visible flex flex-col">
          <div className="mb-2 flex items-center justify-between z-10 px-2 min-h-[24px]">
            <h2 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-800/40 dark:text-emerald-200/50">
              {t('play.board.title', 'PLANNING GRID')}
            </h2>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
              {t('play.board.viewMode.smart', boardViewMode)}
            </div>
          </div>

          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            <div className="h-full aspect-square max-h-full max-w-full relative z-[70]">
              <div
                className={`grid gap-1 w-full h-full rounded-[1.5rem] p-1.5 shrink-0 bg-slate-100/40 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700 ${guidedTutorialActive && currentGuidedTask?.id === 'select_tile'
                  ? 'ring-4 ring-emerald-400/30'
                  : ''
                  }`}
                style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: boardSize * boardSize }).map((_, idx) => {
                  const row = Math.floor(idx / boardSize);
                  const col = idx % boardSize;
                  const key = `${row},${col}`;
                  const occupied = boardOccupied[key];
                  const selected = selectedTile === key;
                  const selectedOccupied = selectedOccupiedTile === key;
                  const recommended = key === recommendedTile;
                  const placeableTile = placeableTileKeySet.has(key);
                  const dragOver = key === dragOverTile;
                  const adjacencyScore = tileAdjacencyScoreMap.get(key) || 0;
                  const synergyScore = tileSynergyBreakdownMap.get(key)?.totalScore || 0;

                  const cardData = occupied ? catalog.get(occupied) : null;
                  const displayName = cardData
                    ? (locale === 'zh' ? cardData.chineseName : cardData.englishName)
                    : (occupied || '');

                  const styleClasses = `group w-full h-full rounded-xl border transition-all duration-300 relative overflow-hidden flex items-center justify-center ${occupied
                    ? selectedOccupied
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-300 shadow-sm'
                    : selected
                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-md scale-105 z-10'
                    : dragOver && placeableTile
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 scale-110 z-10'
                        : boardViewMode === 'placeable' && !placeableTile
                          ? 'bg-transparent border-transparent opacity-10'
                          : boardViewMode === 'adjacency' && !occupied
                            ? adjacencyScore > 0
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          : recommended
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 text-emerald-600 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-200'
                    }`;

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={pendingDiscardActive || actionLoading}
                      onMouseEnter={() => setHoveredTileKey(key)}
                      onMouseLeave={() => setHoveredTileKey((current) => (current === key ? '' : current))}
                      onClick={() => {
                        if (pendingDiscardActive || actionLoading) {
                          return;
                        }
                        if (occupied) {
                          setSelectedTile('');
                          setSelectedOccupiedTile(current => current === key ? '' : key);
                          return;
                        }
                        setSelectedOccupiedTile('');
                        setSelectedTile(key);
                      }}
                      onDragOver={(event) => {
                        if (pendingDiscardActive || actionLoading || !draggingCoreId || occupied) {
                          return;
                        }
                        event.preventDefault();
                        if (dragOverTile !== key) {
                          setDragOverTile(key);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverTile === key) {
                          setDragOverTile('');
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragOverTile('');
                        if (pendingDiscardActive || actionLoading || !draggingCoreId || occupied) {
                          return;
                        }
                        setSelectedCoreId(draggingCoreId);
                        setSelectedOccupiedTile('');
                        setSelectedTile(key);
                        setDraggingCoreId('');
                      }}
                      className={`${styleClasses} ${pendingDiscardActive || actionLoading ? 'cursor-not-allowed' : occupied ? 'cursor-pointer' : 'cursor-cell'} group/tile`}
                    >
                      {occupied ? (
                        <div className="flex flex-col items-center px-1 overflow-hidden w-full h-full justify-center">
                          <span className="text-[11px] leading-[1] text-center font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 break-words line-clamp-2 px-0.5">
                            {displayName}
                          </span>
                        </div>
                      ) : selected ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : boardViewMode === 'adjacency' && !occupied && adjacencyScore > 0 ? (
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">{adjacencyScore}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {activeTileInfo && (
                <div
                  className="absolute z-[200] pointer-events-none"
                  style={{
                    left: `${((activeTileInfo.col + 0.5) / boardSize) * 100}%`,
                    top: `${((activeTileInfo.row + (activeTileInfo.row <= 1 ? 1.0 : 0.0)) / boardSize) * 100}%`,
                    transform: activeTileInfo.row <= 1 ? 'translate(-50%, 8%)' : 'translate(-50%, -102%)'
                  }}
                >
                  <div className="min-w-[180px] max-w-[240px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-2 shadow-lg">
                    <div className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      {activeTileInfo.occupiedCardId ? (activeTileInfo.occupiedName || activeTileInfo.occupiedCardId) : t('play.board.selection.title', 'Current Placement Target')}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{activeTileInfo.key}</div>
                    {activeTileInfo.occupiedCard && (
                      <div className="mt-1 space-y-1">
                        <div className="text-[10px] text-slate-600 dark:text-slate-300">
                          {String(activeTileInfo.occupiedCard.domain).toUpperCase()} | {String(activeTileInfo.occupiedCard.phaseBucket).toUpperCase()} | ★{activeTileInfo.occupiedCard.star}
                        </div>
                        {activeTileInfo.occupiedEffects.length > 0 ? (
                          <div className="text-[10px] text-slate-700 dark:text-slate-200">
                            Buff/Debuff: {activeTileInfo.occupiedEffects.join('  ')}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Buff/Debuff: none in base continuous fields</div>
                        )}
                        {activeTileInfo.occupiedRelationToSelectedCore && (
                          <div className="text-[10px] text-slate-700 dark:text-slate-200">
                            {selectedCoreName ? `${selectedCoreName}` : 'Selected core'} relation:
                            {' '}
                            <span className={activeTileInfo.occupiedRelationToSelectedCore.sameDomain ? 'text-emerald-700 font-black' : 'text-slate-400'}>same domain</span>
                            {' / '}
                            <span className={activeTileInfo.occupiedRelationToSelectedCore.samePhase ? 'text-emerald-700 font-black' : 'text-slate-400'}>same phase</span>
                          </div>
                        )}
                      </div>
                    )}
                    {!activeTileInfo.occupiedCardId && (
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 space-y-1">
                        <div>
                          {t('play.preview.synergyAdjacency', 'Adjacency')}: {activeTileInfo.tileBreakdown?.adjacencyBonus ?? activeTileInfo.adjacencyScore}
                          {' | '}
                          {t('play.preview.synergyDomain', 'Same Domain')}: {activeTileInfo.tileBreakdown?.sameDomainBonus ?? 0}
                          {' | '}
                          {t('play.preview.synergyPhase', 'Same Phase')}: {activeTileInfo.tileBreakdown?.samePhaseBonus ?? 0}
                          {' | '}
                          {t('play.preview.synergyDiversity', 'Diversity')}: {activeTileInfo.tileBreakdown?.diversityBonus ?? 0}
                        </div>
                        <div className="font-black text-slate-700 dark:text-slate-200">
                          {t('play.board.synergyScore', 'Synergy')}: {activeTileInfo.synergyScore}
                        </div>
                        {activeTileInfo.tileBreakdown?.neighbors?.length ? (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Neighbors: {activeTileInfo.tileBreakdown.neighbors.map((neighbor) => {
                              const marks = [
                                neighbor.sameDomain ? 'D+' : '',
                                neighbor.samePhase ? 'P+' : ''
                              ].filter(Boolean).join('/');
                              return `${neighbor.cardName}${marks ? `(${marks})` : ''}`;
                            }).join(', ')}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Neighbors: none</div>
                        )}
                      </div>
                    )}
                    {!activeTileInfo.occupiedCardId && activeTileInfo.recommended && (
                      <div className="text-[10px] text-emerald-700 font-black uppercase tracking-wider mt-1">
                        {t('play.board.recommended', 'Recommended tile')}
                      </div>
                    )}
                    {!activeTileInfo.occupiedCardId && (
                      <div className="text-[10px] mt-1 font-black uppercase tracking-wider">
                        <span className={activeTileInfo.placeable ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}>
                          {activeTileInfo.placeable ? t('play.afford.canPlace', '可放置') : t('play.actions.blocked.tileInvalid', '当前格子不可放置，请选择高亮可用格。')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 50%: Carbon Trade */}
        <div className="flex-1 bg-white/60 dark:bg-slate-900/70 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-700 p-8 relative shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-800/40 dark:text-emerald-200/50">
              {t('play.trade.title', 'CARBON MARKET')}
            </h2>
          </div>
          {tradeWindowOpened ? (
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="grid grid-cols-2 gap-3">
                <TradeCell label={t('play.trade.quota', 'Quota')} value={String(tradeQuota)} />
                <TradeCell label={t('play.trade.currentPrice', 'Current Price')} value={tradeLastPrice.toFixed(1)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTradeType('buy')}
                  className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider border ${tradeType === 'buy'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {t('play.trade.buy', 'Buy Quota')}
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('sell')}
                  className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider border ${tradeType === 'sell'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {t('play.trade.sell', 'Sell Quota')}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={tradeAmount}
                  onChange={(event) => setTradeAmount(Math.max(1, Number(event.target.value || 1)))}
                  className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => { void runTradeAction(); }}
                  disabled={tradeActionDisabled}
                  className="flex-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest py-2 disabled:opacity-40"
                >
                  {t('play.trade.execute', 'Execute Trade')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center gap-3">
              {tradedThisTurn ? (
                <>
                  <div className="text-[12px] font-black tracking-wide text-emerald-600 dark:text-emerald-300">
                    {locale === 'zh' ? '\u672c\u56de\u5408\u5df2\u4ea4\u6613' : 'Trade completed this turn'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTradeSummary((current) => !current)}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 text-[10px] font-black tracking-wide text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    {showTradeSummary
                      ? (locale === 'zh' ? '\u6536\u8d77\u4ea4\u6613\u53d8\u5316' : 'Hide trade changes')
                      : (locale === 'zh' ? '\u67e5\u770b\u672c\u56de\u5408\u4ea4\u6613\u53d8\u5316' : 'View trade changes')}
                  </button>
                  {showTradeSummary && (
                    <div className="w-full max-w-[340px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-4 py-3 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{locale === 'zh' ? '\u4ea4\u6613\u65b9\u5411' : 'Action'}</span>
                        <span className="font-black">
                          {String(latestTradeRecord?.action || '').toLowerCase() === 'buy'
                            ? (locale === 'zh' ? '\u4e70\u5165\u914d\u989d' : 'Buy quota')
                            : (locale === 'zh' ? '\u5356\u51fa\u914d\u989d' : 'Sell quota')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{locale === 'zh' ? '\u6570\u91cf' : 'Amount'}</span>
                        <span className="font-black">{Number(latestTradeRecord?.amount || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{locale === 'zh' ? '\u4ef7\u683c' : 'Price'}</span>
                        <span className="font-black">{tradeLastPrice.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{locale === 'zh' ? '\u7d2f\u8ba1\u6536\u76ca' : 'Total profit'}</span>
                        <span className={`font-black ${tradeProfit >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                          {tradeProfit >= 0 ? '+' : ''}{tradeProfit.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-[11px] font-black tracking-wide text-slate-500 dark:text-slate-300">
                    {locale === 'zh'
                      ? roundsUntilTradeOpen > 0
                        ? `\u78b3\u4ea4\u6613\u533a\u9501\u5b9a \u00b7 \u8fd8\u9700 ${roundsUntilTradeOpen} \u56de\u5408`
                        : '\u78b3\u4ea4\u6613\u533a\u9501\u5b9a'
                      : roundsUntilTradeOpen > 0
                        ? `Carbon market locked ? available in ${roundsUntilTradeOpen} turns`
                        : 'Carbon market locked'}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {tradeActionBlockedReason || t('play.trade.windowClosed', 'Trade Unavailable This Turn')}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- BOTTOM ZONE: Cards In Hand (焦点区域) --- */}
      <div className="flex-[5] bg-white/40 dark:bg-slate-900/65 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700 p-5 relative flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">

        {/* 指示条：非侵入式提示 */}
        <div className="mb-2 flex items-center justify-between px-4">
          {pendingDiscardActive ? (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
              <span className="text-rose-600 font-extrabold text-[11px] uppercase tracking-[0.2em]">
                {t('play.discard.title', 'Discard Mode Active')} - {t('play.discard.instruction', 'Select cards to liquefy')}
                {pendingDiscardRequiredTotal > 0
                  ? ` ${t('play.discard.requiredHint', 'Discard {count} card(s) to keep {limit} in hand.', {
                    count: pendingDiscardRequiredTotal,
                    limit: pendingDiscardTargetHandSize
                  })}`
                  : ''}
              </span>
            </div>
          ) : (
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-900/30 dark:text-emerald-200/40">
              {t('play.coreHand.title', 'CARDS IN HANDS')}
            </h2>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center min-w-0">
          <div className="flex -space-x-20 hover:-space-x-8 transition-all duration-700 ease-in-out py-4">
            {handCoreCards.map((card, index) => {
              const canPlace = coreAffordabilityMap.get(card.cardId)?.canPlace;
              const isSelected = selectedCoreId === card.cardId;
              const cardFrameStyles = !pendingDiscardActive && isSelected
                ? 'border-emerald-500 ring-4 ring-emerald-500/10 -translate-y-12 scale-105 z-50'
                : 'border-white';

              return (
                <button
                  key={`${card.cardId}-${index}`}
                  draggable={!pendingDiscardActive && canPlaceCoreCard(card.cardId)}
                  onDragStart={() => {
                    setDraggingCoreId(card.cardId);
                    setSelectedCoreId(card.cardId);
                  }}
                  onDragEnd={() => setDraggingCoreId('')}
                  onClick={() => {
                    if (pendingDiscardActive) {
                      discardCard('core', card.cardId);
                      return;
                    }
                    setSelectedCoreId(current => current === card.cardId ? '' : card.cardId);
                  }}
                  className={`flex-shrink-0 h-[300px] aspect-[9/16] rounded-[1.5rem] border-2 transition-all duration-500 relative overflow-hidden group shadow-xl hover:z-[100] ${cardFrameStyles} ${canPlace === false ? (pendingDiscardActive ? 'opacity-40 grayscale' : 'opacity-40 grayscale pointer-events-none') : ''}`}
                >
                  <img src={resolveImageUrl(card.imageKey)} className="absolute inset-0 w-full h-full object-cover" alt={card.chineseName} />

                  <div className="absolute inset-x-0 top-0 p-4 text-white z-20">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full w-max mx-auto">{card.domain}</div>
                  </div>
                </button>
              );
            })}

            <div className="w-[1px] h-24 bg-slate-200/50 dark:bg-slate-700 self-center mx-8 z-10" />

            <div className="flex -space-x-12 hover:-space-x-4 transition-all duration-700 py-4">
              {handPolicyCards.map((card, index) => {
                const isSelected = selectedPolicyId === card.cardId;
                const cardFrameStyles = !pendingDiscardActive && isSelected ? 'border-emerald-500 -translate-y-8 z-50 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800';

                return (
                  <button
                    key={`${card.cardId}-${index}`}
                    onClick={() => {
                      if (pendingDiscardActive) { discardCard('policy', card.cardId); return; }
                      setSelectedPolicyId(current => current === card.cardId ? '' : card.cardId);
                    }}
                    className={`flex-shrink-0 h-[220px] aspect-[9/16] mt-auto rounded-[1.2rem] border-2 transition-all duration-500 p-5 flex flex-col justify-between shadow-lg hover:z-[100] hover:-translate-y-6 ${cardFrameStyles}`}
                  >
                    {card.imageKey ? (
                      <img
                        src={resolveImageUrl(card.imageKey)}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={card.chineseName}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-slate-950/10 dark:from-slate-950/90 dark:via-slate-900/40 dark:to-slate-950/20" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
                        {card.domain}
                      </div>
                      <div className="space-y-1">
                        <div className="text-[12px] font-black leading-tight text-white line-clamp-3">
                          {locale === 'zh' ? card.chineseName : card.englishName}
                        </div>
                        <div className="text-[11px] font-black text-white/80 pt-2 border-t border-white/20 uppercase tracking-tighter">Policy</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 只有在非弃牌阶段显示部署按钮 */}
        {!pendingDiscardActive && (
          <div className="absolute right-12 bottom-12 z-[100]">
            {selectedCoreId && selectedTile && (
              <button
                onClick={() => {
                  const [row, col] = selectedTile.split(',').map(v => Number(v));
                  void placeCoreCard(selectedCoreId, row, col);
                }}
                disabled={actionLoading || corePlacedThisTurn}
                className="group flex items-center gap-6 px-12 py-5 rounded-[3rem] bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_20px_50px_rgba(4,120,87,0.3)] hover:-translate-y-2 active:translate-y-0"
              >
                <span>DEPLOY</span>
              </button>
            )}
            {selectedPolicyId && (
              <button
                onClick={() => runAction(3, { cardId: selectedPolicyId })}
                disabled={actionLoading || !!ending || policyUsedThisTurn}
                className="group flex items-center gap-6 px-12 py-5 rounded-[3rem] bg-indigo-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_20px_50px_rgba(49,46,129,0.3)] hover:-translate-y-2"
              >
                <span>EXECUTE</span>
              </button>
            )}
          </div>
        )}
      </div>

    </section>
  );
}

function TradeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
      <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-[14px] font-black text-slate-700 dark:text-slate-100">{value}</div>
    </div>
  );
}
