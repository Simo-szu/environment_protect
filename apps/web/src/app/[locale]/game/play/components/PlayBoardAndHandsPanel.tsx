'use client';

import { DragEvent, useMemo, useState } from 'react';
import type { GameCardMeta } from '@/lib/api/game';
import type { GamePlayController } from '../hooks/useGamePlayController';
import { CARD_INTRO_ZH_BY_ID } from './cardIntroReference';

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
  | 'boardRows'
  | 'boardCols'
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
  | 'corePlacedThisTurn'
  | 'handleCoreCardSelect'
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
  | 'normalizedTradeAmount'
  | 'maxTradeAmount'
  | 'estimatedTradeIndustryCost'
  | 'resources'
  | 'metrics'
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

type HandStackItem =
  | { key: string; type: 'core'; card: GameCardMeta; index: number }
  | { key: string; type: 'policy'; card: GameCardMeta; index: number };

function formatSignedValue(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`;
}

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
    boardRows,
    boardCols,
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
    corePlacedThisTurn,
    handleCoreCardSelect,
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
    normalizedTradeAmount,
    maxTradeAmount,
    estimatedTradeIndustryCost,
    resources,
    metrics,
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

  const TRADE_HELP_STORAGE_KEY = 'game:trade-help-seen:v1';
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeHelpOpen, setTradeHelpOpen] = useState(false);
  const [coreLockedHintOpen, setCoreLockedHintOpen] = useState(false);
  const [hoveredHandCardKey, setHoveredHandCardKey] = useState('');
  const [detailCard, setDetailCard] = useState<GameCardMeta | null>(null);

  function openTradeModal() {
    setTradeModalOpen(true);
    if (typeof window === 'undefined') {
      return;
    }
    const seen = window.localStorage.getItem(TRADE_HELP_STORAGE_KEY);
    if (!seen) {
      setTradeHelpOpen(true);
      window.localStorage.setItem(TRADE_HELP_STORAGE_KEY, '1');
    }
  }

  const zoneDefinitions = useMemo<ZoneDefinition[]>(() => {
    const halfRows = Math.max(1, Math.floor(boardRows / 2));
    const halfCols = Math.max(1, Math.floor(boardCols / 2));
    const topRows = Array.from({ length: halfRows }, (_, index) => index);
    const bottomRows = Array.from({ length: boardRows - halfRows }, (_, index) => index + halfRows);
    const leftCols = Array.from({ length: halfCols }, (_, index) => index);
    const rightCols = Array.from({ length: boardCols - halfCols }, (_, index) => index + halfCols);
    return [
      { id: 'industry', title: t('play.domains.industry', 'Industrial'), rows: topRows, cols: leftCols },
      { id: 'ecology', title: t('play.domains.ecology', 'Ecological System'), rows: topRows, cols: rightCols },
      { id: 'science', title: t('play.domains.science', 'Science'), rows: bottomRows, cols: leftCols },
      { id: 'society', title: locale === 'zh' ? '人与社会' : 'Society', rows: bottomRows, cols: rightCols }
    ];
  }, [boardRows, boardCols, locale, t]);

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
  const currentCarbon = Math.max(0, Math.round(Number(metrics.carbon ?? 0)));
  const quotaDeductPreview = currentCarbon > 90 ? Math.floor((currentCarbon - 90) / 10) : 0;
  const detailCardEffects = detailCard ? resolveCardEffects(detailCard) : [];
  const detailCardImageUrl = detailCard ? resolveImageUrl(detailCard.imageKey) : '';

  const handStackItems = useMemo<HandStackItem[]>(() => {
    const coreItems = handCoreCards.map((card, index) => ({
      key: `core-${card.cardId}-${index}`,
      type: 'core' as const,
      card,
      index
    }));
    const policyItems = handPolicyCards.map((card, index) => ({
      key: `policy-${card.cardId}-${index}`,
      type: 'policy' as const,
      card,
      index
    }));
    return [...coreItems, ...policyItems];
  }, [handCoreCards, handPolicyCards]);

  const handRows = useMemo(() => {
    const midpoint = Math.ceil(handStackItems.length / 2);
    return [handStackItems.slice(0, midpoint), handStackItems.slice(midpoint)] as const;
  }, [handStackItems]);

  function resolveCardDomainLabel(card: GameCardMeta): string {
    return t(`play.domains.${card.domain}`, card.domain);
  }

  function resolveCardIntro(card: GameCardMeta): string {
    const introFromReference = CARD_INTRO_ZH_BY_ID[card.cardId];
    if (locale === 'zh' && introFromReference) {
      return introFromReference;
    }

    const possibleTextKeys = locale === 'zh'
      ? ['descriptionZh', 'introZh', 'chineseDescription', 'cardIntroZh', 'flavorZh']
      : ['descriptionEn', 'introEn', 'englishDescription', 'cardIntroEn', 'flavorEn'];

    const fallbackTextKeys = ['description', 'intro', 'cardIntro', 'flavor'];
    const records: Array<Record<string, unknown> | undefined> = [
      card.coreImmediateExt,
      card.coreContinuousExt,
      card.policyImmediateExt,
      card.policyContinuousExt,
      card.coreImmediateEffect,
      card.coreContinuousEffect,
      card.policyImmediateEffect,
      card.policyContinuousEffect
    ];

    for (const record of records) {
      if (!record) {
        continue;
      }
      for (const key of possibleTextKeys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }
    }

    for (const record of records) {
      if (!record) {
        continue;
      }
      for (const key of fallbackTextKeys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }
    }

    if (card.cardType === 'policy') {
      return t(
        'play.cardDetails.introPolicy',
        'This is a policy card. It takes effect immediately when used and may provide ongoing bonuses in later turns.'
      );
    }
    return t(
      'play.cardDetails.introCore',
      'This is a core card in the {domain} domain. Once deployed to the board, it continuously affects city metrics.',
      { domain: resolveCardDomainLabel(card) }
    );
  }

  function resolveCardEffects(card: GameCardMeta): string[] {
    const metricLabels = {
      industry: t('play.preview.industry', 'Industry'),
      tech: t('play.preview.tech', 'Tech'),
      population: t('play.preview.population', 'Population'),
      green: t('play.preview.green', 'Green'),
      carbon: t('play.preview.carbon', 'Carbon'),
      satisfaction: t('play.preview.satisfaction', 'Satisfaction'),
      quota: t('play.cardDetails.quota', 'Quota')
    };
    const immediateLabel = t('play.cardDetails.immediate', 'Immediate');
    const continuousLabel = t('play.cardDetails.continuous', 'Continuous');
    const effects: string[] = [];

    function pushEffect(prefix: string, label: string, rawValue: number | undefined) {
      const value = Number(rawValue ?? 0);
      if (value === 0) {
        return;
      }
      effects.push(`${prefix} · ${label} ${formatSignedValue(value)}`);
    }

    if (card.cardType === 'core') {
      pushEffect(immediateLabel, metricLabels.industry, card.coreImmediateIndustryDelta);
      pushEffect(immediateLabel, metricLabels.tech, card.coreImmediateTechDelta);
      pushEffect(immediateLabel, metricLabels.population, card.coreImmediatePopulationDelta);
      pushEffect(immediateLabel, metricLabels.green, card.coreImmediateGreenDelta);
      pushEffect(immediateLabel, metricLabels.carbon, card.coreImmediateCarbonDelta);
      pushEffect(immediateLabel, metricLabels.satisfaction, card.coreImmediateSatisfactionDelta);
      pushEffect(immediateLabel, metricLabels.quota, card.coreImmediateQuotaDelta);

      pushEffect(continuousLabel, metricLabels.industry, card.coreContinuousIndustryDelta);
      pushEffect(continuousLabel, metricLabels.tech, card.coreContinuousTechDelta);
      pushEffect(continuousLabel, metricLabels.population, card.coreContinuousPopulationDelta);
      pushEffect(continuousLabel, metricLabels.green, card.coreContinuousGreenDelta);
      pushEffect(continuousLabel, metricLabels.carbon, card.coreContinuousCarbonDelta);
      pushEffect(continuousLabel, metricLabels.satisfaction, card.coreContinuousSatisfactionDelta);
      pushEffect(continuousLabel, metricLabels.quota, card.coreContinuousQuotaDelta);
      return effects;
    }

    pushEffect(immediateLabel, metricLabels.industry, card.policyImmediateIndustryDelta);
    pushEffect(immediateLabel, metricLabels.tech, card.policyImmediateTechDelta);
    pushEffect(immediateLabel, metricLabels.population, card.policyImmediatePopulationDelta);
    pushEffect(immediateLabel, metricLabels.green, card.policyImmediateGreenDelta);
    pushEffect(immediateLabel, metricLabels.carbon, card.policyImmediateCarbonDelta);
    pushEffect(immediateLabel, metricLabels.satisfaction, card.policyImmediateSatisfactionDelta);
    pushEffect(immediateLabel, metricLabels.quota, card.policyImmediateQuotaDelta);

    pushEffect(continuousLabel, metricLabels.industry, card.policyContinuousIndustryDelta);
    pushEffect(continuousLabel, metricLabels.tech, card.policyContinuousTechDelta);
    pushEffect(continuousLabel, metricLabels.population, card.policyContinuousPopulationDelta);
    pushEffect(continuousLabel, metricLabels.green, card.policyContinuousGreenDelta);
    pushEffect(continuousLabel, metricLabels.carbon, card.policyContinuousCarbonDelta);
    pushEffect(continuousLabel, metricLabels.satisfaction, card.policyContinuousSatisfactionDelta);

    return effects;
  }

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
    const cardImageUrl = resolveImageUrl(card.imageKey);
    return (
      <>
        {cardImageUrl ? (
          <img
            src={cardImageUrl}
            className="absolute inset-0 h-full w-full object-cover"
            alt={locale === 'zh' ? card.chineseName : card.englishName}
          />
        ) : null}
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
    <section className="h-full min-h-[720px] xl:min-h-0 flex flex-col gap-4">
      <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-2">
        <div
          data-tutorial-id="planning-panel"
          className="min-h-0 rounded-[2rem] border border-slate-200/60 bg-white/40 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-black text-[10px] uppercase tracking-[0.24em] text-emerald-900/30 dark:text-emerald-200/40">
              {t('play.board.title', 'Planning Grid')}
            </h2>
            <div className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
              {adjacencyRequired ? 'ADJ' : 'FREE'}
            </div>
          </div>

          <div className="grid h-full gap-2.5 md:grid-cols-2">
            {zoneDefinitions.map((zone) => (
              <div
                key={zone.id}
                className={`rounded-[1.8rem] border border-slate-200 bg-white/60 p-2.5 shadow-sm backdrop-blur-md ${guidedTutorialActive && currentGuidedTask?.id === 'select_tile' ? 'ring-4 ring-emerald-400/20' : ''}`}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-800/40">
                    {zone.title}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {zone.rows.length * zone.cols.length} slots
                  </div>
                </div>

                <div
                  className="grid gap-1.5"
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

                      const styleClasses = `group relative aspect-[16/9] overflow-hidden rounded-[1rem] border transition-all duration-300 ${
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
                          data-board-key={key}
                          data-tutorial-role="planning-slot"
                          data-tutorial-placeable={placeableTile ? '1' : '0'}
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

        <aside
          data-tutorial-id="hand-panel"
          className="min-h-0 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white/60 p-4 shadow-sm backdrop-blur-md"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black text-[10px] uppercase tracking-[0.24em] text-emerald-900/30 dark:text-emerald-200/40">
              {t('play.coreHand.title', 'Cards In Hand')}
            </h2>
            <div className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
              {handCoreCards.length + handPolicyCards.length}
            </div>
          </div>

          {pendingDiscardActive && (
            <div className="mb-3 rounded-2xl border-2 border-rose-300 bg-rose-100 px-4 py-3 shadow-md">
              <div className="text-[12px] font-black uppercase tracking-[0.14em] text-rose-800">
                {t('play.discard.title', 'Discarding Required')}
              </div>
              <div className="mt-1 text-[12px] font-semibold leading-5 text-rose-700">
                {t('play.discard.overLimitGuide', '手牌太多？每回合最多只能保留6张牌哦～用不上的卡牌直接点击弃牌，就能腾出空位啦！')}
              </div>
              <div className="mt-1 text-sm font-black leading-6 text-rose-800">
                {t('play.discard.clickToDiscardStrong', '点击下方任意卡牌即弃牌')}
              </div>
              <div className="mt-1 text-[12px] font-semibold leading-5 text-rose-700">
                {t('play.discard.requiredHint', 'Discard {count} card(s) to keep {limit} in hand.', {
                  count: pendingDiscardRequiredTotal,
                  limit: pendingDiscardTargetHandSize
                })}
              </div>
            </div>
          )}
          {!pendingDiscardActive && (
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
              {t('play.cardDetails.openHint', 'Double-click a card to open details')}
            </div>
          )}

          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-col gap-6 pt-1 pb-2">
              {handRows.map((rowItems, rowIndex) => {
                if (rowItems.length === 0) {
                  return null;
                }
                const cardWidthPercent = 42;
                const maxTravelPercent = 92 - cardWidthPercent;
                const overlapStepPercent = rowItems.length > 1
                  ? (rowItems.length === 2
                    ? Math.min(maxTravelPercent, cardWidthPercent + 4)
                    : Math.max(10, Math.min(24, maxTravelPercent / (rowItems.length - 1))))
                  : 0;

                return (
                  <div key={`row-${rowIndex}`} className="relative h-[304px] overflow-visible">
                    {rowItems.map((item, itemIndex) => {
                      const { card, key, type } = item;
                      const cardImageUrl = resolveImageUrl(card.imageKey);
                      const isHovered = hoveredHandCardKey === key;
                      const isCore = type === 'core';
                      const affordability = isCore ? coreAffordabilityMap.get(card.cardId) : null;
                      const canPlace = isCore ? affordability?.canPlace : true;
                      const coreBlockedReason = isCore ? (affordability?.blockedReason || 'none') : 'none';
                      const coreLockedThisTurn = Boolean(isCore && corePlacedThisTurn && !pendingDiscardActive);
                      const isSelected = isCore ? selectedCoreId === card.cardId : selectedPolicyId === card.cardId;

                      const baseCardFrameStyles = isCore
                        ? (!pendingDiscardActive
                          ? (isSelected
                            ? 'border-emerald-500 ring-4 ring-emerald-500/10'
                            : 'border-white')
                          : 'border-white')
                        : (!pendingDiscardActive
                          ? (isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-slate-100 bg-white')
                          : 'border-slate-100 bg-white');

                      return (
                        <button
                          key={key}
                          type="button"
                          data-tutorial-role={isCore ? 'core-card' : 'policy-card'}
                          draggable={isCore && !pendingDiscardActive && canPlaceCoreCard(card.cardId)}
                          onDragStart={(event) => {
                            if (isCore) {
                              handleCardDragStart(event, card.cardId);
                            }
                          }}
                          onDragEnd={() => setDraggingCoreId('')}
                          onMouseEnter={() => setHoveredHandCardKey(key)}
                          onMouseLeave={() => setHoveredHandCardKey((current) => (current === key ? '' : current))}
                          onFocus={() => setHoveredHandCardKey(key)}
                          onBlur={() => setHoveredHandCardKey((current) => (current === key ? '' : current))}
                          onDoubleClick={() => setDetailCard(card)}
                          onClick={() => {
                            if (pendingDiscardActive) {
                              discardCard(type, card.cardId);
                              return;
                            }
                            if (isCore) {
                              if (coreLockedThisTurn) {
                                setCoreLockedHintOpen(true);
                                return;
                              }
                              handleCoreCardSelect(card.cardId);
                              return;
                            }
                            setSelectedPolicyId((current) => current === card.cardId ? '' : card.cardId);
                          }}
                          style={{
                            left: `${4 + itemIndex * overlapStepPercent}%`,
                            zIndex: isHovered ? 220 : isSelected ? 130 : 20 + itemIndex
                          }}
                          className={`absolute top-0 w-[42%] min-w-[118px] max-w-[168px] aspect-[9/16] overflow-hidden border-2 transition-all duration-300 ease-out ${isHovered ? '-translate-y-3 translate-x-3 scale-[1.03]' : ''} ${baseCardFrameStyles} ${isCore ? 'rounded-[1.4rem] shadow-xl' : 'rounded-[1.2rem] shadow-lg'} ${canPlace === false ? (pendingDiscardActive ? 'opacity-50' : 'opacity-80') : ''} ${coreLockedThisTurn ? 'cursor-not-allowed' : ''}`}
                        >
                          {cardImageUrl ? (
                            <img
                              src={cardImageUrl}
                              className="absolute inset-0 h-full w-full object-cover"
                              alt={locale === 'zh' ? card.chineseName : card.englishName}
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div className={`absolute inset-0 ${isCore ? 'bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-slate-950/10' : 'bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-slate-950/10'}`} />

                          {isCore ? (
                            <>
                              {canPlace === false && (
                                <div className="absolute right-2 top-2 z-30 rounded-full border border-amber-300 bg-amber-100/95 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-700 shadow-sm">
                                  {coreBlockedReason === 'no_placeable_tile'
                                    ? t('play.afford.noPlaceableTile', '无可用落点')
                                    : t('play.afford.insufficient', '资源不足')}
                                </div>
                              )}
                              {coreLockedThisTurn && (
                                <div className="absolute left-2 top-2 z-30 rounded-full border border-rose-300 bg-rose-100/95 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-rose-700 shadow-sm">
                                  {t('play.metrics.corePlacedDone', '本回合已放置核心卡')}
                                </div>
                              )}
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
                            </>
                          ) : (
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
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <div
        data-tutorial-id="action-bar"
        className="rounded-[1.8rem] border border-slate-200/80 bg-white/92 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur"
      >
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
            {!!selectedCoreId && !!placeActionBlockedReason && (
              <div className="mt-1 max-w-[520px] text-[11px] font-semibold text-amber-700">
                {placeActionBlockedReason}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              data-tutorial-id="trade-button"
              onClick={openTradeModal}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              {locale === 'zh' ? '碳交易区' : 'Carbon Trading'}
            </button>

            {selectedCoreId && selectedTile ? (
              <button
                type="button"
                data-tutorial-id="deploy-button"
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
                data-tutorial-id="end-turn-button"
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

      {detailCard && (
        <div
          className="fixed inset-0 z-[335] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setDetailCard(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-52 w-full overflow-hidden bg-slate-900">
              {detailCardImageUrl ? (
                <img
                  src={detailCardImageUrl}
                  alt={locale === 'zh' ? detailCard.chineseName : detailCard.englishName}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/25 to-slate-950/10" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                  {resolveCardDomainLabel(detailCard)}
                </div>
                <div className="mt-1 text-xl font-black leading-tight">
                  {locale === 'zh' ? detailCard.chineseName : detailCard.englishName}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/80">
                  #{detailCard.cardNo} · {detailCard.cardType === 'core'
                    ? t('play.actions.placeCore', 'Place Core Card')
                    : t('play.actions.usePolicy', 'Use Policy Card')}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 md:p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {t('play.cardDetails.costTitle', 'Resource Cost')}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <TradeCell label={t('play.resources.industry', 'Industry')} value={String(Number(detailCard.unlockCost?.industry ?? 0))} />
                  <TradeCell label={t('play.resources.tech', 'Tech')} value={String(Number(detailCard.unlockCost?.tech ?? 0))} />
                  <TradeCell label={t('play.resources.population', 'Population')} value={String(Number(detailCard.unlockCost?.population ?? 0))} />
                  <TradeCell label={t('play.metrics.green', 'Green')} value={String(Number(detailCard.unlockCost?.green ?? 0))} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {t('play.cardDetails.effectTitle', 'Card Effect')}
                </div>
                <div className="mt-2 space-y-1.5">
                  {detailCardEffects.length > 0 ? (
                    detailCardEffects.map((effect, index) => (
                      <div key={`${effect}-${index}`} className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-1.5 text-sm font-semibold text-emerald-800">
                        {effect}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">
                      {t('play.cardDetails.noEffect', 'No recognizable numeric effect for this card.')}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {t('play.cardDetails.introTitle', 'Card Introduction')}
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-700">
                  {resolveCardIntro(detailCard)}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailCard(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 hover:bg-slate-50"
                >
                  {t('play.actions.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {coreLockedHintOpen && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-700">
              {t('play.actions.blocked.alreadyPlaced', '本回合已放置过核心卡。')}
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {t('play.coreHand.lockedHint', '每回合仅可放置一张核心卡。你本回合已放置核心卡，请点击“结束回合”进入下一回合。')}
            </p>
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold leading-6 text-emerald-800">
              {t('play.coreHand.lockedCarbonHint', '当前碳排放 {carbon}（风险线 90），当前配额 {quota}。若碳排放 > 90，则每超出 10 点扣 1 配额（本回合预计扣 {deduct}）。', {
                carbon: String(currentCarbon),
                quota: String(tradeQuota),
                deduct: String(quotaDeductPreview)
              })}
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-600">
              {tradeWindowOpened
                ? t('play.coreHand.lockedTradeNow', '本回合碳交易窗口已开启，可前往“碳交易区”进行买入/卖出配额。')
                : t('play.coreHand.lockedTradeLater', '碳交易窗口尚未开启，预计 {turns} 回合后开放。', {
                  turns: String(roundsUntilTradeOpen)
                })}
            </div>
            <div className="mt-4 flex justify-end">
              {tradeWindowOpened && (
                <button
                  type="button"
                  onClick={() => {
                    setCoreLockedHintOpen(false);
                    openTradeModal();
                  }}
                  className="mr-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-emerald-800"
                >
                  {t('play.trade.title', '碳交易区')}
                </button>
              )}
              <button
                type="button"
                data-tutorial-id="core-locked-hint-close"
                onClick={() => setCoreLockedHintOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 hover:bg-slate-50"
              >
                {t('play.actions.close', '关闭')}
              </button>
            </div>
          </div>
        </div>
      )}

      {tradeModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-[10px] uppercase tracking-[0.24em] text-emerald-900/40 dark:text-emerald-200/40">
                {t('play.trade.title', 'Carbon Market')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-tutorial-id="trade-help-button"
                  onClick={() => {
                    setTradeHelpOpen(true);
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem(TRADE_HELP_STORAGE_KEY, '1');
                    }
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  title={t('play.trade.help.title', 'Carbon Trade Rules')}
                  aria-label={t('play.trade.help.title', 'Carbon Trade Rules')}
                >
                  ?
                </button>
                <button
                  type="button"
                  data-tutorial-id="trade-modal-close"
                  onClick={() => {
                    setTradeModalOpen(false);
                    setTradeHelpOpen(false);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  {t('play.actions.back', 'Back')}
                </button>
              </div>
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
                    max={Math.max(1, maxTradeAmount)}
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
                      setTradeAmount(Math.max(1, Math.min(Math.floor(tradeAmount), Math.max(1, maxTradeAmount))));
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
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {tradeType === 'buy'
                    ? t('play.trade.validation.buyCost', 'Buying {amount} quota requires about {cost} industry (current: {current}).', {
                      amount: normalizedTradeAmount,
                      cost: estimatedTradeIndustryCost,
                      current: Number(resources.industry ?? 0)
                    })
                    : t('play.trade.validation.sellQuota', 'Selling {amount} quota requires at least {amount} quota (current: {current}).', {
                      amount: normalizedTradeAmount,
                      current: Number(tradeQuota)
                    })}
                </div>
                {!!tradeActionBlockedReason && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                    {tradeActionBlockedReason}
                  </div>
                )}
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

            {tradeHelpOpen && (
              <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100">
                        {t('play.trade.help.title', 'Carbon Trade Rules')}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {t('play.trade.help.desc', 'Trade opens only in open windows. You can trade once per open turn, then the window closes.')}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-tutorial-id="trade-help-close"
                      onClick={() => setTradeHelpOpen(false)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
                    >
                      {t('play.actions.back', 'Back')}
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <p>{t('play.trade.help.quotaRule', 'Quota settlement: when carbon > 90, every extra 10 carbon consumes 1 quota at end of turn.')}</p>
                    <p>{t('play.trade.help.buyRule', 'Buy: consume industry value = ceil(amount × price).')}</p>
                    <p>{t('play.trade.help.sellRule', 'Sell: requires enough quota; gained industry value = floor(amount × price).')}</p>
                    <p>{t('play.trade.help.windowRule', 'Window rule: if not traded before ending turn, this turn\'s trade chance is forfeited.')}</p>
                    <p>{t('play.trade.help.warningRule', 'Warning: if quota is deducted for 2 consecutive turns and quota is still ≥ 20, a quota warning appears.')}</p>
                    <p>{t('play.trade.help.lowRule', 'Urgent: quota < 20 means near depletion; quota = 0 means exhausted. Buy quota or lower emissions immediately.')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
