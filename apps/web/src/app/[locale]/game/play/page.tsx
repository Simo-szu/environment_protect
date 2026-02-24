'use client';

import PlayHeader from './components/PlayHeader';
import PlayStatsPanel from './components/PlayStatsPanel';
import PlayBoardAndHandsPanel from './components/PlayBoardAndHandsPanel';
import PlayOverlays from './components/PlayOverlays';
import { useGamePlayController } from './hooks/useGamePlayController';

export default function GamePlayPage() {
  const controller = useGamePlayController();

  if (controller.loading) {
    return <div className="p-6 text-sm text-slate-600">{controller.t('play.loading', '游戏加载中...')}</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f4f7f4] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
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

      <main className="flex-1 min-h-0 overflow-hidden p-4 flex gap-5">
        <aside className="w-72 shrink-0 h-full">
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

        <section className="flex-1 min-w-0 h-full flex flex-col overflow-visible relative">
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
