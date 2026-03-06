'use client';

import { useEffect, useMemo } from 'react';
import PlayHeader from './components/PlayHeader';
import PlayStatsPanel from './components/PlayStatsPanel';
import PlayBoardAndHandsPanel from './components/PlayBoardAndHandsPanel';
import PlayOverlays from './components/PlayOverlays';
import { useGamePlayController } from './hooks/useGamePlayController';

export default function GamePlayPage() {
  const controller = useGamePlayController();

  const mobileDigestItems = useMemo(() => {
    const items: Array<{ key: string; label: string; tone: string }> = [];
    if (controller.transitionNotice) {
      items.push({
        key: 'transition',
        label: controller.transitionNotice.title,
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      });
    } else if (controller.lastMessage) {
      items.push({
        key: 'message',
        label: controller.lastMessage,
        tone: 'bg-slate-100 text-slate-700 border-slate-200'
      });
    }

    if (controller.activeNegativeEvents.length > 0) {
      items.push({
        key: 'events',
        label: controller.t('play.events.title', 'Risk & Events'),
        tone: 'bg-rose-50 text-rose-700 border-rose-200'
      });
    }

    if (!controller.tradeWindowOpened) {
      const roundsUntilTradeOpen = controller.strictGuideMode
        ? Math.max(0, 4 - controller.turn)
        : (() => {
            const interval = Number(controller.tradeWindowInterval || 0);
            if (!Number.isFinite(interval) || interval <= 0) {
              return 0;
            }
            const remainder = controller.turn % interval;
            return remainder === 0 ? interval : interval - remainder;
          })();
      const lockedLabel = controller.locale === 'zh'
        ? roundsUntilTradeOpen > 0
          ? `碳交易 ${roundsUntilTradeOpen} 回合后开放`
          : '本回合不可交易'
        : roundsUntilTradeOpen > 0
          ? `Trade opens in ${roundsUntilTradeOpen} turns`
          : 'Trade unavailable this turn';
      items.push({
        key: 'trade',
        label: lockedLabel,
        tone: 'bg-amber-50 text-amber-700 border-amber-200'
      });
    }

    if (controller.currentGuidedTask) {
      items.push({
        key: 'guide',
        label: controller.currentGuidedTask.title,
        tone: 'bg-sky-50 text-sky-700 border-sky-200'
      });
    }

    return items.slice(0, 3);
  }, [
    controller.activeNegativeEvents,
    controller.currentGuidedTask,
    controller.lastMessage,
    controller.strictGuideMode,
    controller.t,
    controller.tradeWindowInterval,
    controller.tradeWindowOpened,
    controller.transitionNotice,
    controller.turn
  ]);

  useEffect(() => {
    const nextWindow = window as Window & {
      render_game_to_text?: () => string;
      advanceTime?: (ms: number) => Promise<void>;
    };

    nextWindow.render_game_to_text = () =>
      JSON.stringify({
        mode: controller.ending ? 'ending' : controller.showOnboarding ? 'onboarding' : 'play',
        coordinateSystem: 'board[row,col], origin top-left, row increases downward, col increases rightward',
        turn: controller.turn,
        maxTurn: controller.maxTurn,
        phase: controller.phase,
        selectedCoreId: controller.selectedCoreId || null,
        selectedPolicyId: controller.selectedPolicyId || null,
        selectedTile: controller.selectedTile || null,
        selectedOccupiedTile: controller.selectedOccupiedTile || null,
        board: {
          size: controller.boardSize,
          occupied: Object.entries(controller.boardOccupied).map(([tile, cardId]) => ({ tile, cardId })),
          recommendedTile: controller.recommendedTile || null,
        },
        hand: {
          core: controller.handCoreCards.map((card) => card.cardId),
          policy: controller.handPolicyCards.map((card) => card.cardId),
        },
        resources: controller.resources,
        metrics: controller.metrics,
        trade: {
          quota: controller.tradeQuota,
          profit: controller.tradeProfit,
          price: controller.tradeLastPrice,
          windowOpened: controller.tradeWindowOpened,
        },
        activeNegativeEvents: controller.activeNegativeEvents.map((event) => ({
          eventType: String(event.eventType || ''),
          remainingTurns: Number(event.remainingTurns || 0),
        })),
        onboarding: controller.showOnboarding
          ? {
              step: controller.onboardingStep,
              title: controller.onboardingSteps[controller.onboardingStep]?.title || null,
            }
          : null,
        guidedTask: controller.currentGuidedTask
          ? {
              id: controller.currentGuidedTask.id,
              title: controller.currentGuidedTask.title,
            }
          : null,
        ending: controller.ending
          ? {
              id: controller.ending.endingId,
              name: controller.ending.endingName,
            }
          : null,
        error: controller.error,
        lastMessage: controller.lastMessage,
      });

    nextWindow.advanceTime = async (ms: number) => {
      await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, ms)));
    };

    return () => {
      delete nextWindow.render_game_to_text;
      delete nextWindow.advanceTime;
    };
  }, [controller]);

  if (controller.loading) {
    return <div className="p-6 text-sm text-slate-600">{controller.t('play.loading', '游戏加载中...')}</div>;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#f4f7f4] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      <PlayHeader
        t={controller.t}
        turn={controller.turn}
        maxTurn={controller.maxTurn}
        phase={controller.phase}
        domainProgress={controller.domainProgress}
        turnFlowSteps={controller.turnFlowSteps}
        strictGuideMode={controller.strictGuideMode}
        handleBack={controller.handleBack}
        handleOpenArchive={controller.handleOpenArchive}
        refreshSession={controller.refreshSession}
        handleRestartSession={controller.handleRestartSession}
        handleExitSession={controller.handleExitSession}
        sessionControlLoading={controller.sessionControlLoading}
        onOpenGuide={controller.openGuide}
        transitionAnimationEnabled={controller.transitionAnimationEnabled}
        onToggleTransitionAnimation={controller.toggleTransitionAnimation}
        onEndTurn={controller.endTurn}
        endTurnDisabled={controller.endTurnDisabled}
        guidedTutorialActive={controller.guidedTutorialActive}
        currentGuidedTaskId={controller.currentGuidedTask?.id}
        boardViewMode={controller.boardViewMode}
        setBoardViewMode={controller.setBoardViewMode}
      />

      {mobileDigestItems.length > 0 && (
        <div className="sm:hidden px-2 pt-2">
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/88 px-3 py-2 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
              {mobileDigestItems.map((item) => (
                <div
                  key={item.key}
                  className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-black tracking-[0.12em] ${item.tone}`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 overflow-visible p-2 pb-28 sm:pb-4 sm:p-4 flex flex-col xl:flex-row gap-3 sm:gap-4 xl:gap-5">
        <aside className="w-full xl:w-72 shrink-0 xl:h-full">
          <PlayStatsPanel
            t={controller.t}
            resources={controller.resources}
            metrics={controller.metrics}
            lowCarbonScore={controller.lowCarbonScore}
            selectedCorePreviewReady={controller.selectedCorePreviewReady}
            formatDelta={controller.formatDelta}
            selectedCoreCard={controller.selectedCoreCard}
            selectedTileAdjacency={controller.selectedTileAdjacency}
            selectedTile={controller.selectedTile}
            recommendedTile={controller.recommendedTile}
            selectedTileSynergyBreakdown={controller.selectedTileSynergyBreakdown}
            placedCore={controller.placedCore}
            catalog={controller.catalog}
            activeNegativeEvents={controller.activeNegativeEvents}
            resolveEventLabel={controller.resolveEventLabel}
            resolvePolicyHintByEvent={controller.resolvePolicyHintByEvent}
            resolvePolicyIdsByEvent={controller.resolvePolicyIdsByEvent}
            handPolicySet={controller.handPolicySet}
            selectPolicyForEvent={controller.selectPolicyForEvent}
          />
        </aside>

        <section className="flex-1 min-w-0 xl:h-full flex flex-col overflow-visible relative">
          <PlayBoardAndHandsPanel
            t={controller.t}
            boardViewMode={controller.boardViewMode}
            setBoardViewMode={controller.setBoardViewMode}
            selectedCoreId={controller.selectedCoreId}
            selectedCoreCard={controller.selectedCoreCard}
            selectedTile={controller.selectedTile}
            recommendedTile={controller.recommendedTile}
            placeableTileKeySet={controller.placeableTileKeySet}
            selectedTileAdjacency={controller.selectedTileAdjacency}
            selectedTileSynergyBreakdown={controller.selectedTileSynergyBreakdown}
            boardPlacementMode={controller.boardPlacementMode}
            guidedTutorialActive={controller.guidedTutorialActive}
            currentGuidedTask={controller.currentGuidedTask}
            boardSize={controller.boardSize}
            boardOccupied={controller.boardOccupied}
            selectedOccupiedTile={controller.selectedOccupiedTile}
            tileAdjacencyScoreMap={controller.tileAdjacencyScoreMap}
            tileSynergyBreakdownMap={controller.tileSynergyBreakdownMap}
            adjacencyRequired={controller.adjacencyRequired}
            ending={controller.ending}
            pendingDiscardBlocking={controller.pendingDiscardBlocking}
            guidedActionAllowed={controller.guidedActionAllowed}
            setSelectedOccupiedTile={controller.setSelectedOccupiedTile}
            setSelectedTile={controller.setSelectedTile}
            dragOverTile={controller.dragOverTile}
            setDragOverTile={controller.setDragOverTile}
            draggingCoreId={controller.draggingCoreId}
            setDraggingCoreId={controller.setDraggingCoreId}
            setSelectedCoreId={controller.setSelectedCoreId}
            setError={controller.setError}
            handCoreCards={controller.handCoreCards}
            pendingDiscardActive={controller.pendingDiscardActive}
            pendingDiscardRequiredTotal={controller.pendingDiscardRequiredTotal}
            pendingDiscardTargetHandSize={controller.pendingDiscardTargetHandSize}
            canPlaceCoreCard={controller.canPlaceCoreCard}
            coreAffordabilityMap={controller.coreAffordabilityMap}
            discardCard={controller.discardCard}
            resolveImageUrl={controller.resolveImageUrl}
            formatDelta={controller.formatDelta}
            setCorePeekOpen={controller.setCorePeekOpen}
            actionLoading={controller.actionLoading}
            corePlacedThisTurn={controller.corePlacedThisTurn}
            selectedCoreAffordability={controller.selectedCoreAffordability}
            placeCoreCard={controller.placeCoreCard}
            runRemoveCoreAction={controller.runRemoveCoreAction}
            guidedGateEnabled={controller.guidedGateEnabled}
            guidedTutorialCompleted={controller.guidedTutorialCompleted}
            placeActionBlockedReason={controller.placeActionBlockedReason}
            removeActionBlockedReason={controller.removeActionBlockedReason}
            handPolicyCards={controller.handPolicyCards}
            setSelectedPolicyId={controller.setSelectedPolicyId}
            selectedPolicyId={controller.selectedPolicyId}
            runAction={controller.runAction}
            policyUsedThisTurn={controller.policyUsedThisTurn}
            strictGuideMode={controller.strictGuideMode}
            policyActionBlockedReason={controller.policyActionBlockedReason}
            selectedPolicyCard={controller.selectedPolicyCard}
            selectedPolicyRiskLevel={controller.selectedPolicyRiskLevel}
            selectedPolicyImmediateDelta={controller.selectedPolicyImmediateDelta}
            selectedPolicyHasImmediateDelta={controller.selectedPolicyHasImmediateDelta}
            endTurn={controller.endTurn}
            endTurnDisabled={controller.endTurnDisabled}
            tradeType={controller.tradeType}
            setTradeType={controller.setTradeType}
            tradeAmount={controller.tradeAmount}
            setTradeAmount={controller.setTradeAmount}
            runTradeAction={controller.runTradeAction}
            tradeActionDisabled={controller.tradeActionDisabled}
            tradeActionBlockedReason={controller.tradeActionBlockedReason}
            tradeWindowOpened={controller.tradeWindowOpened}
            tradeWindowInterval={controller.tradeWindowInterval}
            tradeQuota={controller.tradeQuota}
            tradeLastPrice={controller.tradeLastPrice}
            tradeProfit={controller.tradeProfit}
            latestTradeRecord={controller.latestTradeRecord}
            turn={controller.turn}
            catalog={controller.catalog}
            locale={controller.locale}
          />
        </section>
      </main>

      <PlayOverlays
        t={controller.t}
        guidedGateEnabled={controller.guidedGateEnabled}
        currentGuidedTask={controller.currentGuidedTask}
        guidedOverlayMessage={controller.guidedOverlayMessage}
        error={controller.error}
        lastMessage={controller.lastMessage}
        transitionNotice={controller.transitionNotice}
        showOnboarding={controller.showOnboarding}
        ending={controller.ending}
        onboardingStep={controller.onboardingStep}
        onboardingSteps={controller.onboardingSteps}
        closeOnboarding={controller.closeOnboarding}
        setOnboardingStep={controller.setOnboardingStep}
        setError={controller.setError}
        setLastMessage={controller.setLastMessage}
        setTransitionNotice={controller.setTransitionNotice}
        corePeekOpen={controller.corePeekOpen}
        selectedCoreCard={controller.selectedCoreCard}
        setCorePeekOpen={controller.setCorePeekOpen}
        formatDelta={controller.formatDelta}
        resolveImageUrl={controller.resolveImageUrl}
        endingCountdown={controller.endingCountdown}
        placedCore={controller.placedCore}
        policyHistory={controller.policyHistory}
        uniquePoliciesUsed={controller.uniquePoliciesUsed}
        settlementHistory={controller.settlementHistory}
        resources={controller.resources}
        metrics={controller.metrics}
        tradeQuota={controller.tradeQuota}
        tradeProfit={controller.tradeProfit}
        eventStats={controller.eventStats}
        handleOpenArchive={controller.handleOpenArchive}
        handleRestartSession={controller.handleRestartSession}
        handleExitSession={controller.handleExitSession}
        setGuidedTutorialActive={controller.setGuidedTutorialActive}
      />
    </div>
  );
}
