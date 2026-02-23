'use client';

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
>;

export default function PlayBoardAndHandsPanel(props: PlayBoardAndHandsPanelProps) {
  const {
    t,
    boardViewMode,
    setBoardViewMode,
    selectedCoreId,
    selectedCoreCard,
    selectedTile,
    recommendedTile,
    placeableTileKeySet,
    selectedTileAdjacency,
    selectedTileSynergyBreakdown,
    boardPlacementMode,
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
    setError,
    handCoreCards,
    pendingDiscardActive,
    canPlaceCoreCard,
    coreAffordabilityMap,
    discardCard,
    resolveImageUrl,
    formatDelta,
    setCorePeekOpen,
    actionLoading,
    corePlacedThisTurn,
    selectedCoreAffordability,
    placeCoreCard,
    runRemoveCoreAction,
    guidedGateEnabled,
    guidedTutorialCompleted,
    placeActionBlockedReason,
    removeActionBlockedReason,
    handPolicyCards,
    setSelectedPolicyId,
    selectedPolicyId,
    runAction,
    policyUsedThisTurn,
    strictGuideMode,
    policyActionBlockedReason,
    selectedPolicyCard,
    selectedPolicyRiskLevel,
    selectedPolicyImmediateDelta,
    selectedPolicyHasImmediateDelta
  } = props;

  return (
    <section className="col-span-10 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm min-h-0 overflow-hidden flex flex-col relative">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">{t('play.board.title', '棋盘')}</div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setBoardViewMode('smart')}
            className={`px-2 py-1 rounded border text-[11px] ${boardViewMode === 'smart' ? 'border-slate-700 bg-slate-700 text-white' : 'border-slate-300 text-slate-600'}`}
          >
            {t('play.board.viewMode.smart', '智能')}
          </button>
          <button
            type="button"
            onClick={() => setBoardViewMode('adjacency')}
            className={`px-2 py-1 rounded border text-[11px] ${boardViewMode === 'adjacency' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 text-slate-600'}`}
          >
            {t('play.board.viewMode.adjacency', '相邻热力')}
          </button>
          <button
            type="button"
            onClick={() => setBoardViewMode('placeable')}
            className={`px-2 py-1 rounded border text-[11px] ${boardViewMode === 'placeable' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-slate-600'}`}
          >
            {t('play.board.viewMode.placeable', '可放置')}
          </button>
        </div>
      </div>
      {selectedCoreId && (
        <div className="mb-2 rounded border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
          <div>{t('play.board.placementHint', '落点提示：格子上的 +N 代表与已放置卡牌的相邻数量，通常更容易形成联动。')}</div>
          <div className="mt-1">
            {t('play.board.target', '当前放置目标')}
            ：{selectedCoreCard?.chineseName || selectedCoreId}
            {selectedTile ? ` / ${t('play.board.tile', '格子')} ${selectedTile}` : ''}
            {selectedTile ? ` / ${t('play.board.adjacentUnit', '相邻')} ${selectedTileAdjacency}` : ''}
            {selectedTile && selectedTile === recommendedTile ? ` / ${t('play.preview.recommendedTag', '推荐')}` : ''}
          </div>
          {selectedTileSynergyBreakdown && (
            <div className="mt-1">
              {t('play.board.synergyScore', '联动分')}：{selectedTileSynergyBreakdown.totalScore}
              {'  '}
              ({t('play.preview.synergyAdjacency', '邻接')} {selectedTileSynergyBreakdown.adjacencyBonus}
              {' / '}
              {t('play.preview.synergyDomain', '同板块')} {selectedTileSynergyBreakdown.sameDomainBonus}
              {' / '}
              {t('play.preview.synergyPhase', '同阶段')} {selectedTileSynergyBreakdown.samePhaseBonus}
              {' / '}
              {t('play.preview.synergyDiversity', '多样性')} {selectedTileSynergyBreakdown.diversityBonus})
            </div>
          )}
        </div>
      )}
      <div
        className={`grid gap-1 mb-3 rounded p-2 shrink-0 ${guidedTutorialActive && currentGuidedTask?.id === 'select_tile'
          ? 'ring-2 ring-amber-300'
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
          const adjacency = tileAdjacencyScoreMap.get(key) || 0;
          const synergyBreakdown = tileSynergyBreakdownMap.get(key) || null;
          const recommended = key === recommendedTile;
          const placeableTile = placeableTileKeySet.has(key);
          const dragOver = key === dragOverTile;
          const styleClasses = `aspect-square rounded border text-xs flex items-center justify-center transition relative overflow-hidden ${
            occupied
              ? selectedOccupied
                ? 'bg-amber-50 border-amber-400'
                : 'bg-slate-100 border-slate-300'
              : selected
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : !placeableTile
                  ? adjacency > 0
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                    : 'bg-white border-slate-300 text-slate-500'
                  : recommended
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : boardPlacementMode
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-700'
                      : adjacency > 0
                        ? 'bg-sky-50 border-sky-200 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-400'
            }`;

          return (
            <button
              key={key}
              type="button"
              disabled={!!ending || pendingDiscardBlocking || (!occupied && (!guidedActionAllowed('select_tile') || !placeableTile))}
              onClick={() => {
                if (occupied) {
                  setSelectedOccupiedTile((current: string) => (current === key ? '' : key));
                  setSelectedTile('');
                  return;
                }
                if (!placeableTile) {
                  return;
                }
                setSelectedTile((current: string) => (current === key ? '' : key));
                setSelectedOccupiedTile('');
              }}
              onDragOver={(event) => {
                if (occupied || pendingDiscardBlocking || !!ending || !draggingCoreId || !placeableTile) {
                  return;
                }
                event.preventDefault();
                setDragOverTile(key);
              }}
              onDragLeave={() => {
                if (dragOverTile === key) {
                  setDragOverTile('');
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverTile('');
                if (!draggingCoreId || occupied || pendingDiscardBlocking || !!ending || !placeableTile) {
                  setDraggingCoreId('');
                  return;
                }
                setSelectedCoreId(draggingCoreId);
                setSelectedTile(key);
                setSelectedOccupiedTile('');
                setError(null);
                setDraggingCoreId('');
              }}
              className={styleClasses}
              title={
                occupied
                  ? `${occupied} (${t('play.actions.selectToRemove', '点击以选择移除')})`
                  : !placeableTile
                    ? adjacencyRequired
                      ? t('play.actions.blocked.mustBeAdjacent', '该格子必须与已放置卡牌正交相邻。')
                      : t('play.actions.blocked.tileInvalid', '当前格子不可放置，请选择高亮可用格。')
                    : `${t('play.board.tile', '格子')} ${key}${adjacency > 0 ? ` (${t('play.board.adjacentUnit', '相邻')} ${adjacency})` : ''
                    }${selectedCoreId && synergyBreakdown
                      ? `\n${t('play.board.synergyScore', '联动分')}: ${synergyBreakdown.totalScore}\n${t('play.preview.synergyAdjacency', '邻接')
                      }: ${synergyBreakdown.adjacencyBonus} / ${t('play.preview.synergyDomain', '同板块')}: ${synergyBreakdown.sameDomainBonus} / ${t('play.preview.synergyPhase', '同阶段')
                      }: ${synergyBreakdown.samePhaseBonus} / ${t('play.preview.synergyDiversity', '多样性')}: ${synergyBreakdown.diversityBonus}`
                      : ''
                    }`
              }
            >
              {occupied ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center backdrop-blur-sm mb-1">
                    <span className="text-xs font-bold text-slate-800">{occupied.slice(-3)}</span>
                  </div>
                </div>
              ) : selected ? (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md animate-bounce">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : adjacency > 0 && !placeableTile ? (
                <span className="opacity-50 text-xl font-light">+{adjacency}</span>
              ) : (placeableTile && recommended) ?
                <span className="text-emerald-500 font-bold tracking-wide">推荐</span>
                : (placeableTile && dragOver) ?
                  <span className="text-blue-500 font-bold tracking-wide text-xs">放置</span>
                  : placeableTile ?
                    <span className="text-emerald-500/50 text-2xl font-light opacity-50">+</span>
                    : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 w-full flex flex-col relative z-20 overflow-visible">
        <div className="flex items-center justify-between px-6 z-10 w-full mb-2">
          <div className="flex items-center gap-2">
            <div className="font-bold text-slate-800 text-lg drop-shadow-sm">{t('play.hand.title', '综合手牌')}</div>
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
              {t('play.coreHand.title', '核心手牌')} {handCoreCards.length}
            </span>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              {t('play.policyHand.title', '政策手牌')} {handPolicyCards.length}
            </span>
          </div>
          {selectedCoreCard && (
            <button
              type="button"
              onClick={() => setCorePeekOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-blue-400 bg-blue-50 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-100 transition-colors"
            >
              {t('play.coreHand.openPeek', '展开选中卡牌详情档案')}
            </button>
          )}
        </div>
        {!pendingDiscardActive && (
          <div className="text-xs text-slate-500 px-6 font-medium z-10">
            {t('play.coreHand.dragHint', '拖拽可放置的卡牌到棋盘空位，也可先点选后执行放置。')}
          </div>
        )}
        {pendingDiscardActive && (
          <div className="mx-6 mt-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 shadow-md z-10 text-center animate-pulse">
            {t('play.discard.inlineHint', '🚨 警告：手牌已超上限！请点击下方要弃置的卡牌！')}
          </div>
        )}

        <div
          className={`mt-6 w-full flex justify-center items-end px-12 pb-8 pt-12 min-h-[300px] overflow-visible ${guidedTutorialActive && currentGuidedTask?.id === 'select_core'
            ? 'ring-4 ring-amber-300 rounded-3xl bg-amber-50/20'
            : ''
            }`}
        >
          <div className="flex h-full items-end justify-center w-full relative">
            {handCoreCards.map((card, idx: number) => {
              const canPlace = coreAffordabilityMap.get(card.cardId)?.canPlace;
              const isSelected = selectedCoreId === card.cardId;

              return (
                <button
                  key={card.cardId}
                  draggable={!pendingDiscardActive && canPlaceCoreCard(card.cardId) && guidedActionAllowed('select_core')}
                  onDragStart={() => {
                    if (!pendingDiscardActive && canPlaceCoreCard(card.cardId) && guidedActionAllowed('select_core')) {
                      setDraggingCoreId(card.cardId);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggingCoreId('');
                    setDragOverTile('');
                  }}
                  onClick={() => {
                    if (pendingDiscardActive) {
                      void discardCard('core', card.cardId);
                      return;
                    }
                    if (!guidedActionAllowed('select_core')) {
                      return;
                    }
                    setSelectedCoreId((current) => (current === card.cardId ? '' : card.cardId));
                  }}
                  className={`group relative w-[24rem] h-auto flex flex-col shrink-0 text-left rounded-2xl p-0 shadow-2xl transition-all duration-300 border-[3px] cursor-pointer origin-bottom ${idx > 0 ? '-ml-64' : ''} ${pendingDiscardActive
                    ? 'border-amber-400 bg-amber-50 hover:border-amber-500 hover:z-50 hover:-translate-y-16 hover:scale-110'
                    : !guidedActionAllowed('select_core')
                      ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-60 grayscale'
                      : canPlace === false
                        ? 'border-slate-400 bg-slate-50 opacity-90 grayscale-[40%] hover:border-slate-500 hover:z-50 hover:-translate-y-8 hover:scale-110'
                        : isSelected
                          ? 'border-blue-500 ring-4 ring-blue-500/40 shadow-blue-500/50 -translate-y-16 scale-110 z-40'
                          : 'border-slate-800 hover:border-blue-400 hover:z-50 hover:-translate-y-20 hover:scale-110 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'
                    } ${isSelected ? 'z-40' : 'z-10'}`}
                >
                  <div className="relative aspect-video w-full bg-slate-800 overflow-hidden rounded-t-[14px]">
                    <img src={resolveImageUrl(card.imageKey)} alt={card.chineseName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-16">
                      <div className="text-white text-xl font-bold truncate drop-shadow-lg">{card.chineseName}</div>
                      <div className="text-white/70 text-sm font-medium tracking-wider">{card.cardId}</div>
                    </div>
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg">
                      {card.domain || '通用'}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/95 backdrop-blur rounded-b-[14px] flex-1 flex flex-col justify-end">
                    {pendingDiscardActive ? (
                      <div className="text-xs font-medium text-amber-600 bg-amber-50 p-1.5 rounded border border-amber-200 text-center">{t('play.discard.clickCore', '点击弃置这张核心卡')}</div>
                    ) : (
                      <>
                        <div className="flex gap-1.5 mb-2 flex-wrap">
                          {Number(card.unlockCost.industry ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-semibold">I {Number(card.unlockCost.industry)}</span>}
                          {Number(card.unlockCost.tech ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-semibold">T {Number(card.unlockCost.tech)}</span>}
                          {Number(card.unlockCost.population ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-semibold">P {Number(card.unlockCost.population)}</span>}
                          {Number(card.unlockCost.green ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold">G {Number(card.unlockCost.green)}</span>}
                        </div>

                        <div className={`text-xs font-semibold px-2 py-1 rounded w-full text-center ${canPlace ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                          {canPlace
                            ? t('play.afford.canPlace', '可放置')
                            : t('play.afford.insufficient', '资源不足')}
                        </div>
                      </>
                    )}
                  </div>

                  {!pendingDiscardActive && (
                    <div className="pointer-events-none absolute inset-[-3rem] z-50 rounded-2xl bg-slate-900/95 p-6 text-sm text-slate-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex flex-col justify-center backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-2 ring-blue-500/50">
                      <div className="font-extrabold text-white text-2xl mb-4 text-center tracking-tight drop-shadow">{card.chineseName}</div>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-slate-700/50 pb-1.5">
                          <span className="text-slate-400">{t('play.preview.industry', '产业')}</span>
                          <span className="font-bold text-sky-400 text-lg">{formatDelta(Number(card.coreContinuousIndustryDelta ?? 0))}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700/50 pb-1.5">
                          <span className="text-slate-400">{t('play.preview.tech', '科创')}</span>
                          <span className="font-bold text-violet-400 text-lg">{formatDelta(Number(card.coreContinuousTechDelta ?? 0))}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700/50 pb-1.5">
                          <span className="text-slate-400">{t('play.preview.population', '人口')}</span>
                          <span className="font-bold text-amber-400 text-lg">{formatDelta(Number(card.coreContinuousPopulationDelta ?? 0))}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700/50 pb-1.5">
                          <span className="text-slate-400">{t('play.preview.green', '绿建')}</span>
                          <span className="font-bold text-emerald-400 text-lg">{formatDelta(Number(card.coreContinuousGreenDelta ?? 0))}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700/50 pb-1.5">
                          <span className="text-slate-400">{t('play.preview.carbon', '碳排')}</span>
                          <span className="font-bold text-teal-400 text-lg">{formatDelta(Number(card.coreContinuousCarbonDelta ?? 0))}</span>
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
                          <span className="text-slate-400 font-medium">{t('play.preview.satisfaction', '满意度')}</span>
                          <span className="font-bold text-blue-400 text-xl">{formatDelta(Number(card.coreContinuousSatisfactionDelta ?? 0))}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 shrink-0 flex gap-2">
        <button
          onClick={() => {
            if (!selectedCoreId || !selectedTile) {
              return;
            }
            const [row, col] = selectedTile.split(',').map((v) => Number(v));
            void placeCoreCard(selectedCoreId, row, col);
          }}
          disabled={
            actionLoading ||
            !selectedCoreId ||
            !selectedTile ||
            !!ending ||
            corePlacedThisTurn ||
            pendingDiscardBlocking ||
            !guidedActionAllowed('place_core') ||
            (selectedCoreAffordability ? !selectedCoreAffordability.canPlace : false)
          }
          className={`px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50 ${guidedTutorialActive && currentGuidedTask?.id === 'place_core'
            ? 'ring-2 ring-amber-300 ring-offset-2'
            : ''
            }`}
        >
          {t('play.actions.placeCore', '放置核心卡')}
        </button>
        <button
          onClick={() => {
            setSelectedCoreId('');
            setSelectedTile('');
            setSelectedOccupiedTile('');
          }}
          type="button"
          className="px-3 py-1.5 rounded border border-slate-300 text-sm"
        >
          {t('play.actions.clearSelection', '取消选择')}
        </button>
        <button
          onClick={() => {
            void runRemoveCoreAction();
          }}
          disabled={
            actionLoading ||
            !selectedOccupiedTile ||
            !!ending ||
            pendingDiscardBlocking ||
            (guidedGateEnabled && !guidedTutorialCompleted)
          }
          className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm disabled:opacity-50"
        >
          {t('play.actions.removeCore', '移除核心卡')}
        </button>
      </div>
      {placeActionBlockedReason && (
        <div className="mt-2 text-xs text-amber-700">{placeActionBlockedReason}</div>
      )}
      {removeActionBlockedReason && (
        <div className="mt-1 text-xs text-amber-700">{removeActionBlockedReason}</div>
      )}
      {!pendingDiscardActive && selectedCoreId && selectedCoreAffordability && !selectedCoreAffordability.canPlace && (
        <div className="mt-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {t('play.afford.cannotPlaceHint', '这张卡当前无法放置，缺少资源：')}
          {' '}
          {[
            selectedCoreAffordability.needIndustry > 0 ? `${t('play.resources.industry', '产业值')} ${selectedCoreAffordability.needIndustry}` : null,
            selectedCoreAffordability.needTech > 0 ? `${t('play.resources.tech', '科创点')} ${selectedCoreAffordability.needTech}` : null,
            selectedCoreAffordability.needPopulation > 0 ? `${t('play.resources.population', '人口')} ${selectedCoreAffordability.needPopulation}` : null,
            selectedCoreAffordability.needGreen > 0 ? `${t('play.metrics.green', '绿建度')} ${selectedCoreAffordability.needGreen}` : null
          ].filter(Boolean).join(' / ')}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <div className="font-semibold mb-3">{t('play.policyHand.title', '政策手牌')}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {handPolicyCards.map((card) => (
            <button
              key={card.cardId}
              onClick={() => {
                if (pendingDiscardActive) {
                  void discardCard('policy', card.cardId);
                  return;
                }
                if (!guidedActionAllowed('policy')) {
                  return;
                }
                setSelectedPolicyId((current) => (current === card.cardId ? '' : card.cardId));
              }}
              className={`w-full text-left border rounded p-2 ${pendingDiscardActive
                ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                : !guidedActionAllowed('policy')
                  ? 'border-slate-200 bg-slate-50 text-slate-400'
                  : selectedPolicyId === card.cardId
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200'
                } transition-transform duration-150 hover:-translate-y-0.5`}
            >
              <div className="text-sm font-medium">{card.chineseName}</div>
              <div className="text-xs text-slate-500">{card.cardId}</div>
              {pendingDiscardActive && (
                <div className="text-[11px] text-amber-700 mt-1">{t('play.discard.clickPolicy', '点击弃置这张政策卡')}</div>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => selectedPolicyId && runAction(3, { cardId: selectedPolicyId })}
          disabled={actionLoading || !selectedPolicyId || !!ending || pendingDiscardBlocking || policyUsedThisTurn || strictGuideMode || !guidedActionAllowed('policy')}
          className="mt-3 px-3 py-1.5 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
        >
          {t('play.actions.usePolicy', '使用政策卡')}
        </button>
        {policyActionBlockedReason && (
          <div className="mt-2 text-xs text-amber-700">{policyActionBlockedReason}</div>
        )}
        {selectedPolicyCard && (
          <div className="mt-3 p-3 rounded border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white text-xs space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-sm">{selectedPolicyCard.chineseName}</div>
                <div className="text-slate-500">{selectedPolicyCard.cardId}</div>
              </div>
              <span
                className={`px-2 py-0.5 rounded border text-[11px] ${selectedPolicyRiskLevel === 'high'
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : selectedPolicyRiskLevel === 'medium'
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  }`}
              >
                {t(`play.detail.risk.${selectedPolicyRiskLevel}`, selectedPolicyRiskLevel === 'high' ? '高风险' : selectedPolicyRiskLevel === 'medium' ? '中风险' : '低风险')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded border border-slate-200 bg-white px-2 py-1">
                <div className="text-slate-500">{t('play.detail.domain', '板块')}</div>
                <div className="font-medium">{selectedPolicyCard.domain}</div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-2 py-1">
                <div className="text-slate-500">{t('play.detail.phase', '阶段')}</div>
                <div className="font-medium">{selectedPolicyCard.phaseBucket}</div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-2 py-1">
                <div className="text-slate-500">{t('play.detail.star', '星级')}</div>
                <div className="font-medium">{selectedPolicyCard.star}</div>
              </div>
            </div>
            <div className="rounded border border-slate-200 bg-white px-2 py-1">
              <div className="font-semibold">{t('play.policyDetail.immediate', '即时效果（基础）')}</div>
              {selectedPolicyImmediateDelta && selectedPolicyHasImmediateDelta ? (
                <div>
                  {[
                    selectedPolicyImmediateDelta.industry !== 0 ? `${t('play.preview.industry', '产业')} ${selectedPolicyImmediateDelta.industry > 0 ? '+' : ''}${selectedPolicyImmediateDelta.industry}` : null,
                    selectedPolicyImmediateDelta.tech !== 0 ? `${t('play.preview.tech', '科创')} ${selectedPolicyImmediateDelta.tech > 0 ? '+' : ''}${selectedPolicyImmediateDelta.tech}` : null,
                    selectedPolicyImmediateDelta.population !== 0 ? `${t('play.preview.population', '人口')} ${selectedPolicyImmediateDelta.population > 0 ? '+' : ''}${selectedPolicyImmediateDelta.population}` : null,
                    selectedPolicyImmediateDelta.green !== 0 ? `${t('play.preview.green', '绿建')} ${selectedPolicyImmediateDelta.green > 0 ? '+' : ''}${selectedPolicyImmediateDelta.green}` : null,
                    selectedPolicyImmediateDelta.carbon !== 0 ? `${t('play.preview.carbon', '碳排')} ${selectedPolicyImmediateDelta.carbon > 0 ? '+' : ''}${selectedPolicyImmediateDelta.carbon}` : null,
                    selectedPolicyImmediateDelta.satisfaction !== 0 ? `${t('play.preview.satisfaction', '满意度')} ${selectedPolicyImmediateDelta.satisfaction > 0 ? '+' : ''}${selectedPolicyImmediateDelta.satisfaction}` : null
                  ].filter(Boolean).join(' / ')}
                </div>
              ) : (
                <div>{t('play.policyDetail.noImmediate', '这张政策卡没有可识别的即时数值。')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
