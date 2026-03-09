'use client';

import { DragEvent, useMemo, useState } from 'react';
import type { GameCardMeta } from '@/lib/api/game';
import type { GamePlayController } from '../hooks/useGamePlayController';

type PlayBoardAndHandsPanelProps = Pick<
  GamePlayController,
  | 't'
  | 'selectedCoreId'
  | 'selectedCoreCard'
  | 'selectedTile'
  | 'recommendedTile'
  | 'placeableTileKeySet'
  | 'guidedTutorialActive'
  | 'currentGuidedTask'
  | 'boardSize'
  | 'boardOccupied'
  | 'selectedOccupiedTile'
  | 'tileAdjacencyScoreMap'
  | 'adjacencyRequired'
  | 'ending'
  | 'pendingDiscardBlocking'
  | 'setSelectedOccupiedTile'
  | 'setSelectedTile'
  | 'dragOverTile'
  | 'setDragOverTile'
  | 'draggingCoreId'
  | 'setDraggingCoreId'
  | 'setSelectedCoreId'
  | 'handCoreCards'
  | 'pendingDiscardActive'
  | 'pendingDiscardRequiredTotal'
  | 'pendingDiscardTargetHandSize'
  | 'canPlaceCoreCard'
  | 'coreAffordabilityMap'
  | 'discardCard'
  | 'resolveImageUrl'
  | 'actionLoading'
  | 'placeCoreCard'
  | 'handPolicyCards'
  | 'setSelectedPolicyId'
  | 'selectedPolicyId'
  | 'runAction'
  | 'strictGuideMode'
  | 'placeActionBlockedReason'
  | 'policyActionBlockedReason'
  | 'endTurn'
  | 'endTurnDisabled'
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

type ZoneDefinition = {
  id: 'industry' | 'ecology' | 'science' | 'society';
  title: string;
  rows: number[];
  cols: number[];
};

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

function TradeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
      <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-[14px] font-black text-slate-700 dark:text-slate-100">{value}</div>
    </div>
  );
}

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
    adjacencyRequired,
    ending,
    pendingDiscardBlocking,
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
    placeCoreCard,
    handPolicyCards,
    setSelectedPolicyId,
    selectedPolicyId,
    runAction,
    strictGuideMode,
    placeActionBlockedReason,
    policyActionBlockedReason,
    endTurn,
    endTurnDisabled,
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

  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const zoneDefinitions = useMemo<ZoneDefinition[]>(() => {
    const half = Math.max(1, Math.floor(boardSize / 2));
    const topRows = Array.from({ length: half }, (_, index) => index);
    const bottomRows = Array.from({ length: boardSize - half }, (_, index) => index + half);
    const leftCols = Array.from({ length: half }, (_, index) => index);
    const rightCols = Array.from({ length: boardSize - half }, (_, index) => index + half);
    return [
      { id: 'industry', title: t('play.domains.industry', 'Industrial'), rows: topRows, cols: leftCols },
      { id: 'ecology', title: t('play.domains.ecology', 'Ecological System'), rows: topRows, cols: rightCols },
      { id: 'science', title: t('play.domains.science', 'Science'), rows: bottomRows, cols: leftCols },
      { id: 'society', title: locale === 'zh' ? '人与社会' : 'Society', rows: bottomRows, cols: rightCols }
    ];
  }, [boardSize, locale, t]);

  const tradedThisTurn = useMemo(() => {
    const recordTurn = Number(latestTradeRecord?.turn ?? 0);
    const action = String(latestTradeRecord?.action ?? '').toLowerCase();
    return recordTurn === turn && (action === 'buy' || action === 'sell');
  }, [latestTradeRecord, turn]);

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

  function handleCardDragStart(event: DragEvent<HTMLButtonElement>, cardId: string) {
    setDraggingCoreId(cardId);
    setSelectedCoreId(cardId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', cardId);
      event.dataTransfer.setDragImage(event.currentTarget, event.currentTarget.clientWidth / 2, event.currentTarget.clientHeight / 2);
    }
  }

  function renderPlacedCard(cardId: string, emphasized: boolean) {
    const card = catalog.get(cardId);
    if (!card) {
      return (
        <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
          {cardId}
        </div>
      );
    }
    const effectSummary = collectCoreContinuousEffects(card).slice(0, 3).join('  ');
    return (
      <>
        <img
          src={resolveImageUrl(card.imageKey)}
          className="absolute inset-0 h-full w-full object-cover"
          alt={locale === 'zh' ? card.chineseName : card.englishName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-900/30 to-slate-950/10" />
        <div className="relative z-10 flex h-full flex-col justify-between p-2">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
            {locale === 'zh' ? card.domain : card.domain}
          </div>
          <div className="space-y-1">
            <div className={`line-clamp-2 text-[11px] font-black leading-tight text-white ${emphasized ? 'text-emerald-100' : ''}`}>
              {locale === 'zh' ? card.chineseName : card.englishName}
            </div>
            <div className="line-clamp-2 text-[9px] font-semibold leading-4 text-white/80">
              {effectSummary || t('play.common.none', 'None')}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <section className="h-full min-h-[860px] xl:min-h-0 flex flex-col gap-4">
      <div className="grid flex-1 min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-h-0 rounded-[2rem] border border-slate-200/60 bg-white/40 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur sm:p-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-black text-[10px] uppercase tracking-[0.24em] text-emerald-900/30 dark:text-emerald-200/40">
              {t('play.board.title', 'Planning Grid')}
            </h2>
            <div className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
              {adjacencyRequired ? 'ADJ' : 'FREE'}
            </div>
          </div>

          <div className="grid h-full gap-3 md:grid-cols-2">
            {zoneDefinitions.map((zone) => (
              <div
                key={zone.id}
                className={`rounded-[1.8rem] border border-slate-200 bg-white/60 p-3 shadow-sm backdrop-blur-md ${guidedTutorialActive && currentGuidedTask?.id === 'select_tile' ? 'ring-4 ring-emerald-400/20' : ''}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-800/40">
                    {zone.title}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {zone.rows.length * zone.cols.length} slots
                  </div>
                </div>

                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${zone.cols.length}, minmax(0, 1fr))` }}
                >
                  {zone.rows.flatMap((row) =>
                    zone.cols.map((col) => {
                      const key = `${row},${col}`;
                      const occupiedCardId = boardOccupied[key];
                      const occupied = Boolean(occupiedCardId);
                      const selected = selectedTile === key;
                      const selectedOccupied = selectedOccupiedTile === key;
                      const placeableTile = placeableTileKeySet.has(key);
                      const recommended = key === recommendedTile;
                      const dragOver = key === dragOverTile;
                      const adjacencyScore = tileAdjacencyScoreMap.get(key) || 0;

                      const styleClasses = `group relative aspect-[9/13] overflow-hidden rounded-[1.2rem] border transition-all duration-300 ${
                        occupied
                          ? selectedOccupied
                            ? 'border-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 ring-2 ring-emerald-400/30'
                            : 'border-slate-200 bg-white dark:bg-slate-800 hover:border-emerald-300 shadow-sm'
                          : selected
                            ? 'border-emerald-600 bg-emerald-500 text-white shadow-md scale-[1.02]'
                            : dragOver && placeableTile
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 scale-[1.02]'
                              : recommended
                                ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                                : placeableTile
                                  ? 'border-slate-200 bg-slate-50 dark:bg-slate-800 hover:border-emerald-200'
                                  : 'border-slate-200/70 bg-slate-50/70 dark:bg-slate-800/70'
                      }`;

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={pendingDiscardActive || actionLoading}
                          onClick={() => {
                            if (pendingDiscardActive || actionLoading) {
                              return;
                            }
                            if (occupied) {
                              setSelectedTile('');
                              setSelectedOccupiedTile((current) => current === key ? '' : key);
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
                          className={`${styleClasses} ${pendingDiscardActive || actionLoading ? 'cursor-not-allowed' : occupied ? 'cursor-pointer' : 'cursor-cell'}`}
                        >
                          {occupied && occupiedCardId ? (
                            renderPlacedCard(occupiedCardId, selectedOccupied)
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2">
                              {selected ? (
                                <div className="h-3 w-3 rounded-full bg-white" />
                              ) : (
                                <div className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                                  placeableTile ? 'bg-white/90 text-emerald-700' : 'bg-white/80 text-slate-400'
                                }`}>
                                  {placeableTile ? t('play.afford.canPlace', 'Can Place') : t('play.common.none', 'None')}
                                </div>
                              )}
                              {(placeableTile || adjacencyScore > 0) && (
                                <div className="text-[10px] font-black text-slate-500">
                                  +{adjacencyScore}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="min-h-0 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white/60 p-4 shadow-sm backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black text-[10px] uppercase tracking-[0.24em] text-emerald-900/30 dark:text-emerald-200/40">
              {t('play.coreHand.title', 'Cards In Hand')}
            </h2>
            <div className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
              {handCoreCards.length + handPolicyCards.length}
            </div>
          </div>

          {pendingDiscardActive && (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-[11px] font-semibold leading-5 text-rose-700 shadow-sm">
              {t('play.discard.requiredHint', 'Discard {count} card(s) to keep {limit} in hand.', {
                count: pendingDiscardRequiredTotal,
                limit: pendingDiscardTargetHandSize
              })}
            </div>
          )}

          <div className="grid max-h-[calc(100vh-20rem)] gap-3 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {handCoreCards.map((card, index) => {
              const canPlace = coreAffordabilityMap.get(card.cardId)?.canPlace;
              const isSelected = selectedCoreId === card.cardId;
              const cardFrameStyles = !pendingDiscardActive
                ? (isSelected
                  ? 'border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.02] z-50'
                  : 'border-white hover:border-emerald-300 hover:scale-[1.01]')
                : 'border-white';
              return (
                <button
                  key={`${card.cardId}-${index}`}
                  draggable={!pendingDiscardActive && canPlaceCoreCard(card.cardId)}
                  onDragStart={(event) => handleCardDragStart(event, card.cardId)}
                  onDragEnd={() => setDraggingCoreId('')}
                  onClick={() => {
                    if (pendingDiscardActive) {
                      discardCard('core', card.cardId);
                      return;
                    }
                    setSelectedCoreId((current) => current === card.cardId ? '' : card.cardId);
                  }}
                  className={`relative h-[220px] w-full overflow-hidden rounded-[1.4rem] border-2 transition-all duration-500 shadow-xl ${cardFrameStyles} ${canPlace === false ? (pendingDiscardActive ? 'opacity-40 grayscale' : 'opacity-40 grayscale pointer-events-none') : ''}`}
                >
                  <img src={resolveImageUrl(card.imageKey)} className="absolute inset-0 h-full w-full object-cover" alt={card.chineseName} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-slate-950/10" />
                  <div className="absolute inset-x-0 top-0 p-4 text-white z-20">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full w-max">
                      {card.domain}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-left">
                    <div className="text-[12px] font-black leading-tight text-white line-clamp-2">
                      {locale === 'zh' ? card.chineseName : card.englishName}
                    </div>
                    <div className="mt-2 line-clamp-2 text-[10px] font-semibold leading-4 text-white/80">
                      {collectCoreContinuousEffects(card).slice(0, 3).join('  ') || t('play.common.none', 'None')}
                    </div>
                  </div>
                </button>
              );
            })}

            {handPolicyCards.map((card, index) => {
              const isSelected = selectedPolicyId === card.cardId;
              const cardFrameStyles = !pendingDiscardActive
                ? (isSelected
                  ? 'border-emerald-500 scale-[1.02] z-50 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-100 bg-white hover:border-emerald-300 hover:scale-[1.01]')
                : 'border-slate-100 bg-white';

              return (
                <button
                  key={`${card.cardId}-${index}`}
                  onClick={() => {
                    if (pendingDiscardActive) {
                      discardCard('policy', card.cardId);
                      return;
                    }
                    setSelectedPolicyId((current) => current === card.cardId ? '' : card.cardId);
                  }}
                  className={`relative h-[200px] w-full overflow-hidden rounded-[1.2rem] border-2 transition-all duration-500 shadow-lg ${cardFrameStyles}`}
                >
                  {card.imageKey ? (
                    <img
                      src={resolveImageUrl(card.imageKey)}
                      className="absolute inset-0 h-full w-full object-cover"
                      alt={card.chineseName}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-slate-950/10" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-4 text-left">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
                      {card.domain}
                    </div>
                    <div className="space-y-1">
                      <div className="text-[12px] font-black leading-tight text-white line-clamp-3">
                        {locale === 'zh' ? card.chineseName : card.englishName}
                      </div>
                      <div className="text-[11px] font-black text-white/80 pt-2 border-t border-white/20 uppercase tracking-tighter">
                        Policy
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/92 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {selectedPolicyId
                ? t('play.actions.usePolicy', 'Use Policy')
                : selectedCoreId
                  ? t('play.actions.placeCore', 'Place Core')
                  : t('play.flow.endTurn', 'End Turn')}
            </div>
            <div className="mt-1 text-[12px] font-bold text-slate-800 truncate">
              {selectedCoreCard
                ? (locale === 'zh' ? selectedCoreCard.chineseName : selectedCoreCard.englishName)
                : t('play.common.selectedCard', 'Selected Card')}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => setTradeModalOpen(true)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              {locale === 'zh' ? '碳交易区' : 'Carbon Trading'}
            </button>

            {selectedCoreId && selectedTile ? (
              <button
                type="button"
                onClick={() => {
                  const [row, col] = selectedTile.split(',').map((value) => Number(value));
                  void placeCoreCard(selectedCoreId, row, col);
                }}
                disabled={actionLoading || !!placeActionBlockedReason}
                title={placeActionBlockedReason || t('play.actions.placeCore', 'Place Core')}
                className="rounded-2xl bg-emerald-700 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-40"
              >
                DEPLOY
              </button>
            ) : selectedPolicyId ? (
              <button
                type="button"
                onClick={() => runAction(3, { cardId: selectedPolicyId })}
                disabled={actionLoading || !!policyActionBlockedReason}
                title={policyActionBlockedReason || t('play.actions.usePolicy', 'Use Policy')}
                className="rounded-2xl bg-indigo-900 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-40"
              >
                EXECUTE
              </button>
            ) : (
              <button
                type="button"
                onClick={endTurn}
                disabled={endTurnDisabled}
                className="rounded-2xl bg-emerald-700 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-40"
              >
                {t('play.actions.endTurn', 'End Turn')}
              </button>
            )}
          </div>
        </div>
      </div>

      {tradeModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-[10px] uppercase tracking-[0.24em] text-emerald-900/40 dark:text-emerald-200/40">
                {t('play.trade.title', 'Carbon Market')}
              </h2>
              <button
                type="button"
                onClick={() => setTradeModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {t('play.actions.back', 'Back')}
              </button>
            </div>

            {tradeWindowOpened ? (
              <div className="flex flex-col gap-4">
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
                    onChange={(event) => {
                      const rawValue = event.target.value;
                      if (rawValue === '') {
                        setTradeAmount('');
                        return;
                      }
                      const nextValue = Number(rawValue);
                      if (!Number.isFinite(nextValue)) {
                        return;
                      }
                      setTradeAmount(nextValue);
                    }}
                    onBlur={() => {
                      if (tradeAmount === '') {
                        return;
                      }
                      setTradeAmount(Math.max(1, Math.floor(tradeAmount)));
                    }}
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
              <div className="rounded-[1.4rem] border border-amber-200/80 bg-amber-50/85 px-4 py-4">
                <div className="text-[12px] font-bold text-slate-800">
                  {locale === 'zh'
                    ? roundsUntilTradeOpen > 0
                      ? `碳交易 ${roundsUntilTradeOpen} 回合后开放`
                      : '本回合不可交易'
                    : roundsUntilTradeOpen > 0
                      ? `Carbon market opens in ${roundsUntilTradeOpen} turns`
                      : 'Carbon market unavailable this turn'}
                </div>
                <div className="mt-2 text-[11px] leading-5 text-slate-500">
                  {tradeActionBlockedReason || t('play.trade.windowClosed', 'Trade Unavailable This Turn')}
                </div>
              </div>
            )}

            <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {t('play.trade.profit', 'Profit')}: {tradeProfit.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
