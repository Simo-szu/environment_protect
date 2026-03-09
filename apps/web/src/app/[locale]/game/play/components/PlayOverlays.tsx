'use client';

import type { GamePlayController } from '../hooks/useGamePlayController';
import type { SettlementRecord } from '../hooks/gamePlay.shared';
import RoundSettlementOverlay from './RoundSettlementOverlay';

type PlayOverlaysProps = Pick<
  GamePlayController,
  | 't'
  | 'guidedGateEnabled'
  | 'currentGuidedTask'
  | 'guidedOverlayMessage'
  | 'error'
  | 'connectionState'
  | 'lastMessage'
  | 'transitionNotice'
  | 'activeNegativeEvents'
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
  | 'locale'
  | 'handleOpenArchive'
  | 'refreshSession'
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
    connectionState,
    lastMessage,
    transitionNotice,
    activeNegativeEvents,
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
    locale,
    handleOpenArchive,
    refreshSession,
    handleRestartSession,
    handleExitSession,
    setGuidedTutorialActive,
    setError,
    setLastMessage,
    setTransitionNotice
  } = props;

  const latestSettlement = settlementHistory.length > 0
    ? settlementHistory[settlementHistory.length - 1] as SettlementRecord
    : null;

  const upgradeDeltaItems = selectedCoreCard
    ? [
        ['I', Number(selectedCoreCard.upgradeDeltaIndustry ?? 0)],
        ['T', Number(selectedCoreCard.upgradeDeltaTech ?? 0)],
        ['P', Number(selectedCoreCard.upgradeDeltaPopulation ?? 0)],
        ['G', Number(selectedCoreCard.upgradeDeltaGreen ?? 0)],
        ['C', Number(selectedCoreCard.upgradeDeltaCarbon ?? 0)],
        ['S', Number(selectedCoreCard.upgradeDeltaSatisfaction ?? 0)],
        ['Q', Number(selectedCoreCard.upgradeDeltaQuota ?? 0)],
        ['LC', Number(selectedCoreCard.upgradeDeltaLowCarbon ?? 0)],
        ['SP', Number(selectedCoreCard.upgradeDeltaSectorProgressPct ?? 0)]
      ].filter((item) => item[1] !== 0)
    : [];

  const upgradeRequirementSummary = selectedCoreCard?.upgradeRequirement
    ? [
        selectedCoreCard.upgradeRequirement.reqDomain1
          ? `${selectedCoreCard.upgradeRequirement.reqDomain1}>=${Number(selectedCoreCard.upgradeRequirement.reqDomain1MinPct ?? 0)}%`
          : '',
        selectedCoreCard.upgradeRequirement.reqDomain2
          ? `${selectedCoreCard.upgradeRequirement.reqDomain2}>=${Number(selectedCoreCard.upgradeRequirement.reqDomain2MinPct ?? 0)}%`
          : ''
      ]
        .filter(Boolean)
        .join(' + ')
    : '';

  const normalizedError = (error || '').toLowerCase();
  const isConnectionIssue =
    normalizedError.includes('connection to game service failed')
    || normalizedError.includes('err_connection_refused')
    || normalizedError.includes('failed to fetch')
    || normalizedError.includes('networkerror')
    || normalizedError.includes('service unavailable')
    || normalizedError.includes('http_5');

  return (
    <>
      {connectionState !== 'online' && (
        <div className="fixed inset-x-0 top-2 z-[115] px-2 sm:top-4 sm:px-4">
          <div
            className={`mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-xs font-semibold shadow-sm backdrop-blur sm:px-4 sm:py-2.5 ${
              connectionState === 'offline'
                ? 'border-rose-200 bg-rose-50/95 text-rose-700'
                : connectionState === 'retrying'
                  ? 'border-amber-200 bg-amber-50/95 text-amber-700'
                  : 'border-emerald-200 bg-emerald-50/95 text-emerald-700'
            }`}
          >
            <span>
              {connectionState === 'offline'
                ? t('play.errors.connectionHint', '网络连接异常，已暂停当前操作。请重试连接。')
                : connectionState === 'retrying'
                  ? t('play.errors.reconnecting', '正在重连游戏服务...')
                  : t('play.errors.connectionRecovered', '连接已恢复，状态已同步。')}
            </span>
            {connectionState === 'offline' && (
              <button
                type="button"
                onClick={() => {
                  void refreshSession();
                }}
                className="shrink-0 rounded-xl border border-rose-300 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-rose-700 transition-colors hover:bg-rose-100"
              >
                {t('play.errors.retryConnection', 'Retry Connection')}
              </button>
            )}
          </div>
        </div>
      )}

      {guidedGateEnabled && currentGuidedTask && (
        <div className="fixed top-16 sm:top-24 left-1/2 z-[120] w-[min(94vw,500px)] -translate-x-1/2 animate-in slide-in-from-top-4 duration-500">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-amber-500/30 bg-slate-900/90 p-3 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-xl sm:rounded-2xl sm:p-5">
            <div className="absolute -top-1 -right-1">
              <div className="rounded-bl-xl bg-amber-500 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-black shadow-lg">
                Active Mission
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 sm:h-8 sm:w-8">
                <span className="text-xs font-black text-amber-400">!</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-500 sm:text-[10px] sm:tracking-[0.2em]">
                  {t('play.guided.overlayTitle', 'Guide')}
                </h4>
                <div className="mb-1 text-[13px] font-black leading-tight text-slate-100 sm:text-sm">
                  {guidedOverlayMessage}
                </div>
                <div className="hidden text-[11px] italic leading-relaxed text-slate-400 sm:block">
                  {currentGuidedTask.detail}
                </div>
                <div className="line-clamp-2 text-[10px] leading-4 text-slate-400 sm:hidden">
                  {currentGuidedTask.detail}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/5 pt-3 sm:mt-4 sm:pt-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 sm:text-[10px] sm:tracking-widest">
                In Progress
              </div>
              <button
                onClick={() => setGuidedTutorialActive(false)}
                className="rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 transition-all hover:bg-white/10 hover:text-white sm:px-3 sm:tracking-widest"
              >
                {t('play.guided.pause', 'Pause Guide')}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-[2.5rem] border border-rose-100 bg-white p-10 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-black uppercase tracking-[0.2em] text-rose-950">
              {isConnectionIssue ? t('play.errors.connectionTitle', 'Connection Lost') : 'System Alert'}
            </h3>
            <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500">{error}</p>
            {isConnectionIssue ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setError(null);
                    void refreshSession();
                  }}
                  className="w-full rounded-2xl bg-rose-600 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-rose-900/20 transition-all hover:-translate-y-1 hover:bg-rose-700 active:translate-y-0"
                >
                  {t('play.errors.retryConnection', 'Retry Connection')}
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    window.location.reload();
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0"
                >
                  {t('play.errors.reloadPage', 'Reload Page')}
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    void handleExitSession();
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0"
                >
                  {t('play.errors.backToHome', 'Back to Game Home')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setError(null);
                  setLastMessage('');
                }}
                className="w-full rounded-2xl bg-rose-600 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-rose-900/20 transition-all hover:-translate-y-1 hover:bg-rose-700 active:translate-y-0"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      )}

      {transitionNotice && latestSettlement && !showOnboarding && !ending && (
        <RoundSettlementOverlay
          locale={locale}
          t={t}
          transitionNotice={transitionNotice}
          latestSettlement={latestSettlement}
          activeNegativeEvents={activeNegativeEvents}
          resources={resources}
          metrics={metrics}
          onClose={() => setTransitionNotice(null)}
        />
      )}

      {showOnboarding && !ending && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-xs text-slate-500">
                {t('play.onboarding.progress', 'Quick Start')} {onboardingStep + 1}/{onboardingSteps.length}
              </div>
              <div className="text-lg font-semibold text-slate-800 sm:text-xl">{onboardingSteps[onboardingStep].title}</div>
              <div className="text-sm leading-6 text-slate-600">{onboardingSteps[onboardingStep].body}</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 sm:pt-4">
              <button
                onClick={() => closeOnboarding(true, false)}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm"
              >
                {t('play.onboarding.skip', 'Skip')}
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setOnboardingStep((prev: number) => Math.max(0, prev - 1))}
                  disabled={onboardingStep <= 0}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  {t('play.onboarding.prev', 'Previous')}
                </button>
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((prev: number) => Math.min(onboardingSteps.length - 1, prev + 1))}
                    className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
                  >
                    {t('play.onboarding.next', 'Next')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => closeOnboarding(true, false)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                    >
                      {t('play.onboarding.closeOnly', 'Close')}
                    </button>
                    <button
                      onClick={() => closeOnboarding(true, true)}
                      className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
                    >
                      {t('play.onboarding.startGuided', 'Start Guided')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {corePeekOpen && selectedCoreCard && (
        <div className="fixed bottom-4 right-4 z-[125] w-[min(92vw,360px)] rounded-xl border border-blue-300 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div className="text-sm font-semibold">{t('play.coreHand.peekTitle', 'Core Card Details')}</div>
            <button
              type="button"
              onClick={() => setCorePeekOpen(false)}
              className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600"
            >
              {t('play.coreHand.closePeek', 'Close')}
            </button>
          </div>
          <div className="space-y-2 p-3 text-xs">
            <div className="text-sm font-semibold">{selectedCoreCard.chineseName}</div>
            <div className="text-slate-500">{selectedCoreCard.cardId}</div>
            {selectedCoreCard.upgradeRequirement && (
              <div className="space-y-1 border-t border-slate-100 pt-2">
                <div className="text-[11px] font-semibold text-slate-700">Upgrade Requirement</div>
                <div className="text-[11px] text-slate-600">
                  ★{Number(selectedCoreCard.upgradeRequirement.fromStar ?? 0)} → ★{Number(selectedCoreCard.upgradeRequirement.toStar ?? 0)}
                </div>
                {upgradeRequirementSummary && <div className="text-[11px] text-slate-600">{upgradeRequirementSummary}</div>}
                <div className="text-[11px] text-slate-600">
                  Cost I {Number(selectedCoreCard.upgradeRequirement.costIndustry ?? 0)} / T {Number(selectedCoreCard.upgradeRequirement.costTech ?? 0)} / P {Number(selectedCoreCard.upgradeRequirement.costPopulation ?? 0)} / G {Number(selectedCoreCard.upgradeRequirement.costGreen ?? 0)}
                </div>
              </div>
            )}
            {upgradeDeltaItems.length > 0 && (
              <div className="space-y-1 border-t border-slate-100 pt-2">
                <div className="text-[11px] font-semibold text-slate-700">Upgrade Effect</div>
                <div className="text-[11px] text-slate-600">
                  {upgradeDeltaItems.map((item) => `${item[0]} ${formatDelta(item[1] as number)}`).join(' / ')}
                </div>
              </div>
            )}
            <div>
              I {Number(selectedCoreCard.unlockCost.industry ?? 0)} / T {Number(selectedCoreCard.unlockCost.tech ?? 0)} / P {Number(selectedCoreCard.unlockCost.population ?? 0)} / G {Number(selectedCoreCard.unlockCost.green ?? 0)}
            </div>
            <div>
              {t('play.preview.industry', 'Industry')} {formatDelta(Number(selectedCoreCard.coreContinuousIndustryDelta ?? 0))} /
              {' '}{t('play.preview.tech', 'Tech')} {formatDelta(Number(selectedCoreCard.coreContinuousTechDelta ?? 0))} /
              {' '}{t('play.preview.population', 'Population')} {formatDelta(Number(selectedCoreCard.coreContinuousPopulationDelta ?? 0))} /
              {' '}{t('play.preview.green', 'Green')} {formatDelta(Number(selectedCoreCard.coreContinuousGreenDelta ?? 0))} /
              {' '}{t('play.preview.carbon', 'Carbon')} {formatDelta(Number(selectedCoreCard.coreContinuousCarbonDelta ?? 0))} /
              {' '}{t('play.preview.satisfaction', 'Satisfaction')} {formatDelta(Number(selectedCoreCard.coreContinuousSatisfactionDelta ?? 0))}
            </div>
          </div>
        </div>
      )}

      {ending && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="space-y-4 p-5 md:p-6">
              <div className="space-y-1">
                <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">{ending.endingName}</div>
                <div className="text-sm leading-6 text-slate-700 dark:text-slate-300">{ending.reason}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Reached at turn: {ending.turn}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Auto open archive in {endingCountdown}s</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Replay Summary</div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
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
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Final Board Snapshot
                  </div>
                  <img
                    src={resolveImageUrl(ending.imageKey)}
                    alt={ending.endingName}
                    className="max-h-[320px] w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700"
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
                    className="hidden min-h-[140px] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
                  >
                    Ending image not found in storage
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleOpenArchive}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    void handleRestartSession();
                  }}
                  className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Restart
                </button>
                <button
                  onClick={() => {
                    void handleExitSession();
                  }}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
