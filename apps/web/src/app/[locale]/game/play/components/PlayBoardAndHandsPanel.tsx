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
    catalog,
    locale
  } = props;

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

  return (
    <section className="h-full flex flex-col relative bg-transparent overflow-visible gap-4 p-0 transition-all duration-500">

      {/* 移除强遮罩，改为通知条 + 牌面反馈 */}

      {/* --- TOP ZONE (50% Height): Board & Trade Segmented --- */}
      <div className={`flex-[5] flex gap-4 min-h-0 transition-all duration-500 ${pendingDiscardActive ? 'grayscale opacity-60 pointer-events-none' : ''}`}>

        {/* Left 50%: Board (Grid) */}
        <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[2rem] border border-slate-200 p-4 relative z-[60] shadow-sm overflow-visible flex flex-col">
          <div className="mb-2 flex items-center justify-between z-10 px-2 min-h-[24px]">
            <h2 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-800/40">
              {t('play.board.title', 'PLANNING GRID')}
            </h2>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {t('play.board.viewMode.smart', boardViewMode)}
            </div>
          </div>

          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            <div className="h-full aspect-square max-h-full max-w-full relative z-[70]">
              <div
                className={`grid gap-1 w-full h-full rounded-[1.5rem] p-1.5 shrink-0 bg-slate-100/40 border border-slate-200/40 ${guidedTutorialActive && currentGuidedTask?.id === 'select_tile'
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
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-white border-slate-100 hover:border-emerald-300 shadow-sm'
                    : selected
                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-md scale-105 z-10'
                      : dragOver && placeableTile
                        ? 'bg-emerald-50 border-emerald-500 scale-110 z-10'
                        : boardViewMode === 'placeable' && !placeableTile
                          ? 'bg-transparent border-transparent opacity-10'
                          : boardViewMode === 'adjacency' && !occupied
                            ? adjacencyScore > 0
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-slate-50 border-slate-200'
                          : recommended
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                            : 'bg-white border-slate-100 hover:border-emerald-200'
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
                          <span className="text-[11px] leading-[1] text-center font-black uppercase tracking-tight text-slate-800 break-words line-clamp-2 px-0.5">
                            {displayName}
                          </span>
                        </div>
                      ) : selected ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : boardViewMode === 'adjacency' && !occupied && adjacencyScore > 0 ? (
                        <span className="text-[10px] font-black text-emerald-700">{adjacencyScore}</span>
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
                  <div className="min-w-[180px] max-w-[240px] rounded-xl border border-slate-200 bg-white/95 backdrop-blur px-3 py-2 shadow-lg">
                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                      {activeTileInfo.occupiedCardId ? (activeTileInfo.occupiedName || activeTileInfo.occupiedCardId) : t('play.board.selection.title', 'Current Placement Target')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{activeTileInfo.key}</div>
                    {activeTileInfo.occupiedCard && (
                      <div className="mt-1 space-y-1">
                        <div className="text-[10px] text-slate-600">
                          {String(activeTileInfo.occupiedCard.domain).toUpperCase()} | {String(activeTileInfo.occupiedCard.phaseBucket).toUpperCase()} | ★{activeTileInfo.occupiedCard.star}
                        </div>
                        {activeTileInfo.occupiedEffects.length > 0 ? (
                          <div className="text-[10px] text-slate-700">
                            Buff/Debuff: {activeTileInfo.occupiedEffects.join('  ')}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Buff/Debuff: none in base continuous fields</div>
                        )}
                        {activeTileInfo.occupiedRelationToSelectedCore && (
                          <div className="text-[10px] text-slate-700">
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
                      <div className="text-[10px] text-slate-600 mt-1 space-y-1">
                        <div>
                          {t('play.preview.synergyAdjacency', 'Adjacency')}: {activeTileInfo.tileBreakdown?.adjacencyBonus ?? activeTileInfo.adjacencyScore}
                          {' | '}
                          {t('play.preview.synergyDomain', 'Same Domain')}: {activeTileInfo.tileBreakdown?.sameDomainBonus ?? 0}
                          {' | '}
                          {t('play.preview.synergyPhase', 'Same Phase')}: {activeTileInfo.tileBreakdown?.samePhaseBonus ?? 0}
                          {' | '}
                          {t('play.preview.synergyDiversity', 'Diversity')}: {activeTileInfo.tileBreakdown?.diversityBonus ?? 0}
                        </div>
                        <div className="font-black text-slate-700">
                          {t('play.board.synergyScore', 'Synergy')}: {activeTileInfo.synergyScore}
                        </div>
                        {activeTileInfo.tileBreakdown?.neighbors?.length ? (
                          <div className="text-[10px] text-slate-500">
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
                        <span className={activeTileInfo.placeable ? 'text-emerald-700' : 'text-slate-400'}>
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
        <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[2rem] border border-slate-200 p-8 relative shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-800/40">
              {t('play.trade.title', 'CARBON MARKET')}
            </h2>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">Section Locked</div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ZONE: Cards In Hand (焦点区域) --- */}
      <div className="flex-[5] bg-white/40 rounded-[2.5rem] border border-slate-200/60 p-5 relative flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">

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
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-900/30">
              {t('play.coreHand.title', 'CARDS IN HANDS')}
            </h2>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center min-w-0">
          <div className="flex -space-x-20 hover:-space-x-8 transition-all duration-700 ease-in-out py-4">
            {handCoreCards.map((card) => {
              const canPlace = coreAffordabilityMap.get(card.cardId)?.canPlace;
              const isSelected = selectedCoreId === card.cardId;
              const cardFrameStyles = !pendingDiscardActive && isSelected
                ? 'border-emerald-500 ring-4 ring-emerald-500/10 -translate-y-12 scale-105 z-50'
                : 'border-white';

              return (
                <button
                  key={card.cardId}
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

            <div className="w-[1px] h-24 bg-slate-200/50 self-center mx-8 z-10" />

            <div className="flex -space-x-12 hover:-space-x-4 transition-all duration-700 py-4">
              {handPolicyCards.map((card) => {
                const isSelected = selectedPolicyId === card.cardId;
                const cardFrameStyles = !pendingDiscardActive && isSelected ? 'border-emerald-500 -translate-y-8 z-50 bg-emerald-50' : 'border-slate-100 bg-white';

                return (
                  <button
                    key={card.cardId}
                    onClick={() => {
                      if (pendingDiscardActive) { discardCard('policy', card.cardId); return; }
                      setSelectedPolicyId(current => current === card.cardId ? '' : card.cardId);
                    }}
                    className={`flex-shrink-0 h-[220px] aspect-[9/16] mt-auto rounded-[1.2rem] border-2 transition-all duration-500 p-5 flex flex-col justify-between shadow-lg hover:z-[100] hover:-translate-y-6 ${cardFrameStyles}`}
                  >
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">
                      {card.domain}
                    </div>
                    <div className="flex-1" />
                    <div className="text-[11px] font-black text-slate-400 pt-4 border-t border-slate-50 uppercase tracking-tighter">Policy</div>
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
