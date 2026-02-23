'use client';

import { useState } from 'react';
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

  const [hoverTileInfo, setHoverTileInfo] = useState<{ key: string; name: string; deltas: string } | null>(null);

  return (
    <section className="h-full flex flex-col relative bg-transparent overflow-hidden gap-4 p-0 transition-all duration-500">

      {/* 移除强遮罩，改为通知条 + 牌面反馈 */}

      {/* --- TOP ZONE (50% Height): Board & Trade Segmented --- */}
      <div className={`flex-[5] flex gap-4 min-h-0 transition-all duration-500 ${pendingDiscardActive ? 'grayscale opacity-60 pointer-events-none' : ''}`}>

        {/* Left 50%: Board (Grid) */}
        <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[2rem] border border-slate-200 p-4 relative shadow-sm overflow-hidden flex flex-col">
          <div className="mb-2 flex items-center justify-between z-10 px-2 min-h-[24px]">
            <h2 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-800/40">
              {t('play.board.title', 'PLANNING GRID')}
            </h2>
            {hoverTileInfo && (
              <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                <span className="text-emerald-400 mr-2">●</span>
                {hoverTileInfo.name} <span className="text-slate-400 ml-2 italic">{hoverTileInfo.deltas}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            <div className="h-full aspect-square max-h-full max-w-full">
              <div
                className={`grid gap-1 w-full h-full rounded-[1.5rem] p-1.5 shrink-0 bg-slate-100/40 border border-slate-200/40 ${guidedTutorialActive && currentGuidedTask?.id === 'select_tile'
                  ? 'ring-4 ring-emerald-400/30 animate-pulse'
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
                        : !placeableTile
                          ? 'bg-transparent border-transparent opacity-10'
                          : recommended
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                            : 'bg-white border-slate-100 hover:border-emerald-200'
                    }`;

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={true} // 由于上层容器已经禁用了点击，这里只是保险
                      className={`${styleClasses} cursor-help group/tile`}
                    >
                      {occupied ? (
                        <div className="flex flex-col items-center px-1 overflow-hidden w-full h-full justify-center">
                          <span className="text-[11px] leading-[1] text-center font-black uppercase tracking-tight text-slate-800 break-words line-clamp-2 px-0.5">
                            {displayName}
                          </span>
                        </div>
                      ) : selected ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
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
              <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
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

              // 弃牌模式样式：变红、抖动提示
              const discardStyles = pendingDiscardActive
                ? 'border-rose-500 ring-4 ring-rose-500/20 hover:ring-rose-500 hover:scale-110 hover:-translate-y-4 hover:shadow-rose-500/20'
                : isSelected
                  ? 'border-emerald-500 ring-4 ring-emerald-500/10 -translate-y-12 scale-105 z-50'
                  : 'border-white';

              return (
                <button
                  key={card.cardId}
                  draggable={!pendingDiscardActive && canPlaceCoreCard(card.cardId)}
                  onDragStart={() => setDraggingCoreId(card.cardId)}
                  onDragEnd={() => setDraggingCoreId('')}
                  onClick={() => {
                    if (pendingDiscardActive) {
                      discardCard('core', card.cardId);
                      return;
                    }
                    setSelectedCoreId(current => current === card.cardId ? '' : card.cardId);
                  }}
                  className={`flex-shrink-0 h-[300px] aspect-[9/16] rounded-[1.5rem] border-2 transition-all duration-500 relative overflow-hidden group shadow-xl hover:z-[100] ${discardStyles} ${(!pendingDiscardActive && canPlace === false) ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                >
                  <img src={resolveImageUrl(card.imageKey)} className="absolute inset-0 w-full h-full object-cover" alt={card.chineseName} />

                  {/* 弃牌模式下的牌面文字标记 */}
                  {pendingDiscardActive && (
                    <div className="absolute inset-0 bg-rose-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none animate-in fade-in">
                      <div className="bg-rose-600 text-white font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-white/20">
                        {t('play.discard.action', 'Discard')}
                      </div>
                    </div>
                  )}

                  {!pendingDiscardActive && (
                    <div className="absolute inset-x-0 top-0 p-4 text-white z-20">
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full w-max mx-auto">{card.domain}</div>
                    </div>
                  )}
                </button>
              );
            })}

            <div className="w-[1px] h-24 bg-slate-200/50 self-center mx-8 z-10" />

            <div className="flex -space-x-12 hover:-space-x-4 transition-all duration-700 py-4">
              {handPolicyCards.map((card) => {
                const isSelected = selectedPolicyId === card.cardId;
                const discardStyles = pendingDiscardActive
                  ? 'border-rose-400 ring-4 ring-rose-400/10 hover:border-rose-500'
                  : isSelected ? 'border-emerald-500 -translate-y-8 z-50 bg-emerald-50' : 'border-slate-100 bg-white';

                return (
                  <button
                    key={card.cardId}
                    onClick={() => {
                      if (pendingDiscardActive) { discardCard('policy', card.cardId); return; }
                      setSelectedPolicyId(current => current === card.cardId ? '' : card.cardId);
                    }}
                    className={`flex-shrink-0 h-[220px] aspect-[9/16] mt-auto rounded-[1.2rem] border-2 transition-all duration-500 p-5 flex flex-col justify-between shadow-lg hover:z-[100] hover:-translate-y-6 ${discardStyles}`}
                  >
                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${pendingDiscardActive ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {pendingDiscardActive ? 'LIQUEFY' : card.domain}
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
