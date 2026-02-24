'use client';

import type { GamePlayController } from '../hooks/useGamePlayController';

type PlayOverlaysProps = Pick<
  GamePlayController,
  | 't'
  | 'guidedGateEnabled'
  | 'currentGuidedTask'
  | 'guidedOverlayMessage'
  | 'error'
  | 'lastMessage'
  | 'transitionNotice'
  | 'showOnboarding'
  | 'ending'
  | 'onboardingStep'
  | 'onboardingSteps'
  | 'closeOnboarding'
  | 'setOnboardingStep'
  | 'corePeekOpen'
  | 'selectedCoreCard'
  | 'setCorePeekOpen'
  | 'formatDelta'
  | 'resolveImageUrl'
  | 'endingCountdown'
  | 'placedCore'
  | 'policyHistory'
  | 'uniquePoliciesUsed'
  | 'settlementHistory'
  | 'resources'
  | 'metrics'
  | 'tradeQuota'
  | 'tradeProfit'
  | 'eventStats'
  | 'handleOpenArchive'
  | 'handleRestartSession'
  | 'handleExitSession'
  | 'setGuidedTutorialActive'
  | 'setError'
  | 'setLastMessage'
  | 'setTransitionNotice'
>;

export default function PlayOverlays(props: PlayOverlaysProps) {
  const {
    t,
    guidedGateEnabled,
    currentGuidedTask,
    guidedOverlayMessage,
    error,
    lastMessage,
    transitionNotice,
    showOnboarding,
    ending,
    onboardingStep,
    onboardingSteps,
    closeOnboarding,
    setOnboardingStep,
    corePeekOpen,
    selectedCoreCard,
    setCorePeekOpen,
    formatDelta,
    resolveImageUrl,
    endingCountdown,
    placedCore,
    policyHistory,
    uniquePoliciesUsed,
    settlementHistory,
    resources,
    metrics,
    tradeQuota,
    tradeProfit,
    eventStats,
    handleOpenArchive,
    handleRestartSession,
    handleExitSession,
    setGuidedTutorialActive,
    setError,
    setLastMessage,
    setTransitionNotice
  } = props;

  const upgradeDeltaItems = selectedCoreCard ? [
    ['I', Number(selectedCoreCard.upgradeDeltaIndustry ?? 0)],
    ['T', Number(selectedCoreCard.upgradeDeltaTech ?? 0)],
    ['P', Number(selectedCoreCard.upgradeDeltaPopulation ?? 0)],
    ['G', Number(selectedCoreCard.upgradeDeltaGreen ?? 0)],
    ['C', Number(selectedCoreCard.upgradeDeltaCarbon ?? 0)],
    ['S', Number(selectedCoreCard.upgradeDeltaSatisfaction ?? 0)],
    ['Q', Number(selectedCoreCard.upgradeDeltaQuota ?? 0)],
    ['LC', Number(selectedCoreCard.upgradeDeltaLowCarbon ?? 0)],
    ['SP', Number(selectedCoreCard.upgradeDeltaSectorProgressPct ?? 0)]
  ].filter((item) => item[1] !== 0) : [];

  const upgradeRequirementSummary = selectedCoreCard?.upgradeRequirement
    ? [
      selectedCoreCard.upgradeRequirement.reqDomain1
        ? `${selectedCoreCard.upgradeRequirement.reqDomain1}>=${Number(selectedCoreCard.upgradeRequirement.reqDomain1MinPct ?? 0)}%`
        : '',
      selectedCoreCard.upgradeRequirement.reqDomain2
        ? `${selectedCoreCard.upgradeRequirement.reqDomain2}>=${Number(selectedCoreCard.upgradeRequirement.reqDomain2MinPct ?? 0)}%`
        : ''
    ].filter(Boolean).join(' + ')
    : '';

  return (
    <>
      {guidedGateEnabled && currentGuidedTask && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,500px)] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-5 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden">
            {/* Mission Badge */}
            <div className="absolute -top-1 -right-1">
              <div className="bg-amber-500 text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest text-black shadow-lg">
                Active Mission
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <span className="text-amber-400 font-black text-xs">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">
                  {t('play.guided.overlayTitle', '操作引导')}
                </h4>
                <div className="text-sm font-black text-slate-100 mb-1 leading-tight">
                  {guidedOverlayMessage}
                </div>
                <div className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                  {currentGuidedTask.detail}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In Progress</div>
              <button
                onClick={() => setGuidedTutorialActive(false)}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                {t('play.guided.pause', 'Pause Guide')}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] border border-rose-100 p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center bg-rose-50 text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-3 text-rose-950">System Alert</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">
              {error}
            </p>
            <button
              onClick={() => { setError(null); setLastMessage(''); }}
              className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg bg-rose-600 text-white shadow-rose-900/20 hover:bg-rose-700 hover:-translate-y-1 active:translate-y-0"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {transitionNotice && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-x-0 top-20 flex justify-center px-4">
            <div
              key={transitionNotice.token}
              className={`relative rounded-xl border px-5 py-3 pr-10 shadow-lg pointer-events-auto ${transitionNotice.toneClass}`}
            >
              <button
                type="button"
                onClick={() => setTransitionNotice(null)}
                className="absolute top-2 right-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close notice"
              >
                ×
              </button>
              <div className="text-sm font-semibold">{transitionNotice.title}</div>
              <div className="text-xs opacity-80">{transitionNotice.subtitle}</div>
              <div className="text-[11px] opacity-70 mt-1">Turn {transitionNotice.turn} settled</div>
            </div>
          </div>
        </div>
      )}

      {showOnboarding && !ending && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="text-xs text-slate-500">
              {t('play.onboarding.progress', '快速上手')} {onboardingStep + 1}/{onboardingSteps.length}
            </div>
            <div className="text-xl font-semibold text-slate-800">
              {onboardingSteps[onboardingStep].title}
            </div>
            <div className="text-sm text-slate-600 leading-6">
              {onboardingSteps[onboardingStep].body}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => closeOnboarding(true, false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-sm"
              >
                {t('play.onboarding.skip', '跳过')}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnboardingStep((prev: number) => Math.max(0, prev - 1))}
                  disabled={onboardingStep <= 0}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm disabled:opacity-40"
                >
                  {t('play.onboarding.prev', '上一步')}
                </button>
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((prev: number) => Math.min(onboardingSteps.length - 1, prev + 1))}
                    className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                  >
                    {t('play.onboarding.next', '下一步')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => closeOnboarding(true, false)}
                      className="px-3 py-1.5 rounded border border-slate-300 text-sm"
                    >
                      {t('play.onboarding.closeOnly', '仅关闭说明')}
                    </button>
                    <button
                      onClick={() => closeOnboarding(true, true)}
                      className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                    >
                      {t('play.onboarding.startGuided', '开始实操引导')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {corePeekOpen && selectedCoreCard && (
        <div className="fixed bottom-4 right-4 z-40 w-[min(92vw,360px)] rounded-xl border border-blue-300 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div className="text-sm font-semibold">{t('play.coreHand.peekTitle', '核心卡详情（固定）')}</div>
            <button
              type="button"
              onClick={() => setCorePeekOpen(false)}
              className="px-2 py-1 rounded border border-slate-300 text-xs text-slate-600"
            >
              {t('play.coreHand.closePeek', '关闭')}
            </button>
          </div>
          <div className="p-3 text-xs space-y-2">
            <div className="font-semibold text-sm">{selectedCoreCard.chineseName}</div>
            <div className="text-slate-500">{selectedCoreCard.cardId}</div>
            {selectedCoreCard.upgradeRequirement && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">Upgrade Requirement</div>
                <div className="text-[11px] text-slate-600">
                  ★{Number(selectedCoreCard.upgradeRequirement.fromStar ?? 0)} → ★{Number(selectedCoreCard.upgradeRequirement.toStar ?? 0)}
                </div>
                {upgradeRequirementSummary && (
                  <div className="text-[11px] text-slate-600">{upgradeRequirementSummary}</div>
                )}
                <div className="text-[11px] text-slate-600">
                  Cost I {Number(selectedCoreCard.upgradeRequirement.costIndustry ?? 0)} / T {Number(selectedCoreCard.upgradeRequirement.costTech ?? 0)} / P {Number(selectedCoreCard.upgradeRequirement.costPopulation ?? 0)} / G {Number(selectedCoreCard.upgradeRequirement.costGreen ?? 0)}
                </div>
              </div>
            )}
            {upgradeDeltaItems.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">Upgrade Effect</div>
                <div className="text-[11px] text-slate-600">
                  {upgradeDeltaItems.map((item) => `${item[0]} ${formatDelta(item[1] as number)}`).join(' / ')}
                </div>
              </div>
            )}
            <div>I {Number(selectedCoreCard.unlockCost.industry ?? 0)} / T {Number(selectedCoreCard.unlockCost.tech ?? 0)} / P {Number(selectedCoreCard.unlockCost.population ?? 0)} / G {Number(selectedCoreCard.unlockCost.green ?? 0)}</div>
            <div>
              {t('play.preview.industry', '产业')} {formatDelta(Number(selectedCoreCard.coreContinuousIndustryDelta ?? 0))} /
              {' '}{t('play.preview.tech', '科创')} {formatDelta(Number(selectedCoreCard.coreContinuousTechDelta ?? 0))} /
              {' '}{t('play.preview.population', '人口')} {formatDelta(Number(selectedCoreCard.coreContinuousPopulationDelta ?? 0))} /
              {' '}{t('play.preview.green', '绿建')} {formatDelta(Number(selectedCoreCard.coreContinuousGreenDelta ?? 0))} /
              {' '}{t('play.preview.carbon', '碳排')} {formatDelta(Number(selectedCoreCard.coreContinuousCarbonDelta ?? 0))} /
              {' '}{t('play.preview.satisfaction', '满意度')} {formatDelta(Number(selectedCoreCard.coreContinuousSatisfactionDelta ?? 0))}
            </div>
          </div>
        </div>
      )}

      {ending && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="p-5 md:p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">{ending.endingName}</div>
                <div className="text-sm leading-6 text-slate-700 dark:text-slate-300">{ending.reason}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Reached at turn: {ending.turn}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Auto open archive in {endingCountdown}s
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4">
                <div className="font-semibold text-sm mb-3 text-slate-900 dark:text-slate-100">Replay Summary</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                  <div>Placed Core Cards: {placedCore.length}</div>
                  <div>Policies Used: {policyHistory.length}</div>
                  <div>Unique Policies Used: {uniquePoliciesUsed}</div>
                  <div>Settlement Turns: {settlementHistory.length}</div>
                  <div>Industry: {resources.industry ?? 0}</div>
                  <div>Tech: {resources.tech ?? 0}</div>
                  <div>Population: {resources.population ?? 0}</div>
                  <div>Green: {metrics.green ?? 0}</div>
                  <div>Carbon: {metrics.carbon ?? 0}</div>
                  <div>Satisfaction: {metrics.satisfaction ?? 0}</div>
                  <div>Quota: {tradeQuota}</div>
                  <div>Trade Profit: {tradeProfit.toFixed(1)}</div>
                  <div>Negative Events: {Number(eventStats.negativeTriggered || 0)}</div>
                  <div>Resolved Events: {Number(eventStats.negativeResolved || 0)}</div>
                  <div>Resolve Rate: {Number(eventStats.resolveRate ?? 0).toFixed(1)}%</div>
                </div>
              </div>

              {ending.imageKey && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Final Board Snapshot
                  </div>
                  <img
                    src={resolveImageUrl(ending.imageKey)}
                    alt={ending.endingName}
                    className="w-full max-h-[320px] object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    onError={(event) => {
                      const target = event.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('[data-ending-image-fallback]');
                      if (fallback instanceof HTMLElement) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    data-ending-image-fallback
                    className="hidden w-full min-h-[140px] items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/40"
                  >
                    Ending image not found in storage
                  </div>
                </div>
              )}

              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  onClick={handleOpenArchive}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    void handleRestartSession();
                  }}
                  className="px-3 py-1.5 rounded bg-slate-900 dark:bg-emerald-600 text-white text-sm hover:bg-slate-800 dark:hover:bg-emerald-500"
                >
                  Restart
                </button>
                <button
                  onClick={() => {
                    void handleExitSession();
                  }}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Back to Game Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
