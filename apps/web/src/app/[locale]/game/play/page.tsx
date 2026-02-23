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
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-800 flex flex-col">
      <PlayHeader
        t={controller.t}
        turn={controller.turn}
        maxTurn={controller.maxTurn}
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
        tradeType={controller.tradeType}
        setTradeType={controller.setTradeType}
        tradeAmount={controller.tradeAmount}
        setTradeAmount={controller.setTradeAmount}
        runTradeAction={controller.runTradeAction}
        tradeActionDisabled={controller.tradeActionDisabled}
        tradeActionBlockedReason={controller.tradeActionBlockedReason}
      />

      <main className="flex-1 min-h-0 overflow-hidden p-4 grid grid-cols-12 gap-4">
        {controller.guidedTutorialActive && !controller.guidedTutorialCompleted && (
          <section className="col-span-12 rounded border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-amber-800">{controller.t('play.guided.title', '新手引导（实操模式）')}</div>
                <div className="text-xs text-amber-700 mt-1">
                  {controller.t('play.guided.currentTask', '当前任务')}：{controller.currentGuidedTask?.title || controller.t('play.guided.allDone', '全部完成')}
                </div>
                <div className="text-xs text-amber-700">{controller.currentGuidedTask?.detail}</div>
              </div>
              <button
                onClick={() => controller.setGuidedTutorialActive(false)}
                className="px-2 py-1 rounded border border-amber-300 bg-white text-xs text-amber-700"
              >
                {controller.t('play.guided.pause', '暂停引导')}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {controller.guidedTaskProgress.map((task) => (
                <div
                  key={task.id}
                  className={`rounded border px-2 py-1 text-xs ${task.done
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : controller.currentGuidedTask?.id === task.id
                      ? 'border-amber-300 bg-white text-amber-800'
                      : 'border-slate-200 bg-white text-slate-500'
                    }`}
                >
                  {task.done ? '✓ ' : ''}{task.title}
                </div>
              ))}
            </div>
          </section>
        )}

        <PlayStatsPanel
          t={controller.t}
          resources={controller.resources}
          metrics={controller.metrics}
          selectedCorePlacementPreview={controller.selectedCorePlacementPreview}
          selectedCorePreviewReady={controller.selectedCorePreviewReady}
          formatDelta={controller.formatDelta}
          selectedCoreCard={controller.selectedCoreCard}
          selectedTileAdjacency={controller.selectedTileAdjacency}
          selectedTile={controller.selectedTile}
          recommendedTile={controller.recommendedTile}
          selectedTileSynergyBreakdown={controller.selectedTileSynergyBreakdown}
          placedCore={controller.placedCore}
          corePlacedThisTurn={controller.corePlacedThisTurn}
          tradeQuota={controller.tradeQuota}
          tradeLastPrice={controller.tradeLastPrice}
          tradeProfit={controller.tradeProfit}
          latestTradeRecord={controller.latestTradeRecord}
          tradeWindowOpened={controller.tradeWindowOpened}
          activeNegativeEvents={controller.activeNegativeEvents}
          resolveEventLabel={controller.resolveEventLabel}
          resolvePolicyHintByEvent={controller.resolvePolicyHintByEvent}
          resolvePolicyIdsByEvent={controller.resolvePolicyIdsByEvent}
          handPolicySet={controller.handPolicySet}
          pendingDiscardBlocking={controller.pendingDiscardBlocking}
          selectPolicyForEvent={controller.selectPolicyForEvent}
          timelineItems={controller.timelineItems}
        />

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
        />
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
      />
    </div>
  );
}
