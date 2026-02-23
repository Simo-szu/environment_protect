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
    handleExitSession
  } = props;

  return (
    <>
      {guidedGateEnabled && currentGuidedTask && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-slate-900/25" />
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[min(92vw,720px)] rounded-xl border border-amber-300 bg-white/95 px-4 py-3 shadow-lg">
            <div className="text-xs font-semibold text-amber-700">{t('play.guided.overlayTitle', '操作引导')}</div>
            <div className="text-sm text-slate-700 mt-1">{guidedOverlayMessage}</div>
            <div className="text-xs text-slate-500 mt-1">{currentGuidedTask.detail}</div>
          </div>
        </div>
      )}

      {(error || lastMessage) && (
        <div className="px-6 pb-6 text-sm">
          {error && <div className="text-red-600">{error}</div>}
          {lastMessage && <div className="text-slate-600 mt-1">{lastMessage}</div>}
        </div>
      )}

      {transitionNotice && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {transitionNotice.kind === 'industry_growth' && (
              <>
                <div className="absolute bottom-0 left-[12%] h-28 w-8 bg-sky-400/40 animate-pulse rounded-t" />
                <div className="absolute bottom-0 left-[20%] h-36 w-10 bg-sky-500/40 animate-pulse rounded-t" />
                <div className="absolute bottom-0 left-[29%] h-24 w-7 bg-sky-300/40 animate-pulse rounded-t" />
              </>
            )}
            {transitionNotice.kind === 'green_growth' && (
              <>
                <div className="absolute bottom-12 left-[16%] h-10 w-10 rounded-full bg-emerald-300/40 animate-bounce" />
                <div className="absolute bottom-20 left-[26%] h-8 w-8 rounded-full bg-emerald-400/40 animate-bounce" />
                <div className="absolute bottom-8 left-[34%] h-9 w-9 rounded-full bg-emerald-500/40 animate-bounce" />
              </>
            )}
            {transitionNotice.kind === 'tech_burst' && (
              <>
                <div className="absolute top-20 left-[18%] h-16 w-16 border border-violet-400/50 rotate-45 animate-pulse" />
                <div className="absolute top-28 left-[30%] h-12 w-12 border border-indigo-400/50 rotate-45 animate-pulse" />
                <div className="absolute top-16 left-[40%] h-10 w-10 border border-sky-400/50 rotate-45 animate-pulse" />
              </>
            )}
            {transitionNotice.kind === 'satisfaction_growth' && (
              <>
                <div className="absolute top-24 left-[16%] h-3 w-3 rounded-full bg-amber-400/70 animate-ping" />
                <div className="absolute top-32 left-[24%] h-3 w-3 rounded-full bg-amber-300/70 animate-ping" />
                <div className="absolute top-20 left-[34%] h-3 w-3 rounded-full bg-orange-300/70 animate-ping" />
              </>
            )}
            {transitionNotice.kind === 'carbon_optimized' && (
              <>
                <div className="absolute top-24 left-[15%] h-1.5 w-12 rounded bg-emerald-400/60 -rotate-12 animate-pulse" />
                <div className="absolute top-30 left-[26%] h-1.5 w-14 rounded bg-emerald-500/60 -rotate-12 animate-pulse" />
                <div className="absolute top-18 left-[36%] h-1.5 w-10 rounded bg-teal-400/60 -rotate-12 animate-pulse" />
              </>
            )}
            {transitionNotice.kind === 'balanced_growth' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/30 to-transparent animate-pulse" />
            )}
            {transitionNotice.kind === 'carbon_disaster' && (
              <>
                <div className="absolute inset-0 bg-rose-900/10 animate-pulse" />
                <div className="absolute top-24 left-[18%] h-12 w-20 rounded-full bg-slate-500/40 blur-sm animate-pulse" />
                <div className="absolute top-30 left-[30%] h-10 w-16 rounded-full bg-slate-600/40 blur-sm animate-pulse" />
                <div className="absolute top-18 left-[38%] h-14 w-24 rounded-full bg-slate-700/40 blur-sm animate-pulse" />
              </>
            )}
          </div>
          <div className="absolute inset-x-0 top-20 flex justify-center px-4">
            <div
              key={transitionNotice.token}
              className={`rounded-xl border px-5 py-3 shadow-lg ${transitionNotice.toneClass}`}
            >
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
                  onClick={() => setOnboardingStep((prev) => Math.max(0, prev - 1))}
                  disabled={onboardingStep <= 0}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm disabled:opacity-40"
                >
                  {t('play.onboarding.prev', '上一步')}
                </button>
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((prev) => Math.min(onboardingSteps.length - 1, prev + 1))}
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
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-xl border overflow-hidden">
            {ending.imageKey && (
              <img src={resolveImageUrl(ending.imageKey)} alt={ending.endingName} className="w-full h-72 object-cover" />
            )}
            <div className="p-5 space-y-2">
              <div className="text-xl font-semibold">{ending.endingName}</div>
              <div className="text-sm text-slate-600">{ending.reason}</div>
              <div className="text-xs text-slate-500">Reached at turn: {ending.turn}</div>
              <div className="text-xs text-slate-500">
                Auto open archive in {endingCountdown}s
              </div>
              <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-sm mb-2">Replay Summary</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700">
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
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleOpenArchive}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    void handleRestartSession();
                  }}
                  className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                >
                  Restart
                </button>
                <button
                  onClick={() => {
                    void handleExitSession();
                  }}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm"
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
