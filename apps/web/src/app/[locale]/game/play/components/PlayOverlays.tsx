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
    setLastMessage
  } = props;

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
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In Progress</span>
              </div>
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

      {(error || lastMessage) && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`bg-white rounded-[2.5rem] border p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] text-center max-w-sm w-full animate-in zoom-in-95 duration-300 ${error ? 'border-rose-100' : 'border-emerald-100'}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center ${error ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
              {error ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              )}
            </div>
            <h3 className={`text-xl font-black uppercase tracking-[0.2em] mb-3 ${error ? 'text-rose-950' : 'text-emerald-950'}`}>
              {error ? 'System Alert' : 'Notification'}
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">
              {error || lastMessage}
            </p>
            <button
              onClick={() => { setError(null); setLastMessage(''); }}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg ${error ? 'bg-rose-600 text-white shadow-rose-900/20 hover:bg-rose-700 hover:-translate-y-1 active:translate-y-0' : 'bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 hover:-translate-y-1 active:translate-y-0'}`}
            >
              Acknowledge
            </button>
          </div>
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
