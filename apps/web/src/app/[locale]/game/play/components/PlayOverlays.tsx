'use client';

import { useMemo, useState } from 'react';
import type { GamePlayController } from '../hooks/useGamePlayController';
import type { SettlementRecord } from '../hooks/gamePlay.shared';
import InteractiveOnboardingOverlay from './InteractiveOnboardingOverlay';
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
  | 'handPolicySet'
  | 'resolveEventLabel'
  | 'resolvePolicyIdsByEvent'
  | 'resolvePolicyDisplayLabel'
  | 'selectPolicyForEvent'
  | 'strictGuideMode'
  | 'showOnboarding'
  | 'selectedCoreId'
  | 'selectedTile'
  | 'corePlacedThisTurn'
  | 'turn'
  | 'ending'
  | 'onboardingStep'
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
  | 'lowCarbonScoreBreakdown'
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
    handPolicySet,
    resolveEventLabel,
    resolvePolicyIdsByEvent,
    resolvePolicyDisplayLabel,
    selectPolicyForEvent,
    strictGuideMode,
    showOnboarding,
    selectedCoreId,
    selectedTile,
    corePlacedThisTurn,
    turn,
    ending,
    onboardingStep,
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
    lowCarbonScoreBreakdown,
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
  const [dismissedEventAlertToken, setDismissedEventAlertToken] = useState('');

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

  function containsCjk(text: string): boolean {
    return /[\u3400-\u9fff]/.test(text);
  }

  function containsLatin(text: string): boolean {
    return /[A-Za-z]/.test(text);
  }

  function pickLocalizedText(rawText: string | undefined): string {
    const source = String(rawText || '').trim();
    if (!source) {
      return '';
    }

    const byLines = source
      .split(/\r?\n+/)
      .map((segment) => segment.trim())
      .filter(Boolean);
    const segments = byLines.length > 1
      ? byLines
      : source
        .split(/\s+[|｜/]\s+/)
        .map((segment) => segment.trim())
        .filter(Boolean);

    if (segments.length <= 1) {
      return source;
    }

    if (locale === 'zh') {
      const zh = segments.find((segment) => containsCjk(segment));
      return zh || segments[0];
    }
    const en = segments.find((segment) => containsLatin(segment) && !containsCjk(segment));
    return en || segments[segments.length - 1];
  }

  const endingTitle = pickLocalizedText(ending?.endingName || '');
  const endingReason = pickLocalizedText(ending?.reason || '');
  const endingLowCarbonTarget = Number(lowCarbonScoreBreakdown?.target ?? 0);
  const endingLowCarbonGap = Math.max(0, Number(lowCarbonScoreBreakdown?.gapToTarget ?? 0));
  const endingLowCarbonTotal = Number(lowCarbonScoreBreakdown?.finalTotal ?? metrics.lowCarbonScore ?? 0);
  const activeEventAlertToken = useMemo(() => {
    return Array.from(
      new Set(
        activeNegativeEvents.map((event) => {
          const eventType = String(event.eventType || '');
          const eventTurn = Number(event.turn || 0);
          return eventType ? `${eventType}@${eventTurn}` : '';
        }).filter(Boolean)
      )
    ).sort().join('|');
  }, [activeNegativeEvents]);
  const showEventAlertModal = Boolean(
    activeNegativeEvents.length > 0
    && !transitionNotice
    && !showOnboarding
    && !ending
    && activeEventAlertToken
    && activeEventAlertToken !== dismissedEventAlertToken
  );

  return (
    <>
      {showEventAlertModal && (
        <div className="fixed inset-0 z-[360] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[1.75rem] border border-rose-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-rose-700">
                  {t('play.events.title', 'Risk & Events')}
                </div>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {t('play.events.modalTitle', '负面事件已出现，请立即应对')}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {t('play.events.modalSubtitle', '优先使用对应政策卡化解事件，避免持续惩罚。')}
                </p>
              </div>
              <button
                type="button"
                data-tutorial-id="event-alert-close"
                onClick={() => setDismissedEventAlertToken(activeEventAlertToken)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-600"
              >
                {t('play.actions.close', 'Close')}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activeNegativeEvents.map((event, index) => {
                const eventType = String(event.eventType || '');
                const resolverIds = resolvePolicyIdsByEvent(eventType);
                const resolverLabels = resolverIds
                  .map((id) => resolvePolicyDisplayLabel(id))
                  .filter(Boolean);
                const availableResolverId = resolverIds.find((id) => handPolicySet.has(id)) || '';
                return (
                  <div
                    key={`${eventType || 'event'}-${index}`}
                    className="rounded-xl border border-rose-200 bg-rose-50/70 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-black text-rose-800">
                        {resolveEventLabel(eventType)}
                      </div>
                      <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                        {t('play.events.remaining', 'remaining')} {Number(event.remainingTurns || 0)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-700">
                      {availableResolverId
                        ? t('play.events.modalResolverReady', '你当前手牌中已有可用政策，建议立即执行。')
                        : t('play.events.modalResolverMissing', '当前手牌无直接解法政策，请优先保留政策位并尽快抽取。')}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600">
                      {t('play.events.suggestedPolicies', '建议政策')}: {resolverLabels.join('、') || t('play.common.none', 'None')}
                    </div>
                    {availableResolverId ? (
                      <button
                        type="button"
                        onClick={() => {
                          selectPolicyForEvent(eventType);
                          setDismissedEventAlertToken(activeEventAlertToken);
                        }}
                        className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white"
                      >
                        {t('play.events.selectResolver', 'Select Resolver Policy')}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {strictGuideMode && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                {t('play.events.guideHint', '引导阶段中，若事件触发，政策卡已允许用于应对。')}
              </div>
            )}
          </div>
        </div>
      )}

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

      {guidedGateEnabled && currentGuidedTask && !showOnboarding && (
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
                  data-tutorial-id="error-retry-connection"
                  onClick={() => {
                    setError(null);
                    void refreshSession();
                  }}
                  className="w-full rounded-2xl bg-rose-600 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-rose-900/20 transition-all hover:-translate-y-1 hover:bg-rose-700 active:translate-y-0"
                >
                  {t('play.errors.retryConnection', 'Retry Connection')}
                </button>
                <button
                  data-tutorial-id="error-reload-page"
                  onClick={() => {
                    setError(null);
                    window.location.reload();
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0"
                >
                  {t('play.errors.reloadPage', 'Reload Page')}
                </button>
                <button
                  data-tutorial-id="error-back-home"
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
                data-tutorial-id="error-acknowledge"
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
        <InteractiveOnboardingOverlay
          t={t}
          locale={locale}
          onboardingStep={onboardingStep}
          setOnboardingStep={setOnboardingStep}
          closeOnboarding={closeOnboarding}
          selectedCoreId={selectedCoreId}
          selectedTile={selectedTile}
          corePlacedThisTurn={corePlacedThisTurn}
          turn={turn}
        />
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="space-y-5 p-5 md:p-7">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {t('play.ending.badge', 'Ending Result')}
                </div>
                <div className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-100 md:text-3xl">{endingTitle || ending.endingName}</div>
                <div className="text-sm leading-6 text-slate-700 dark:text-slate-300">{endingReason || ending.reason}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>{t('play.ending.reachedTurn', 'Reached at turn: {turn}', { turn: ending.turn })}</span>
                  <span>{t('play.ending.archiveCountdown', 'Auto open archive in {seconds}s', { seconds: endingCountdown })}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('play.ending.replaySummary', 'Replay Summary')}</div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                  <div>{t('play.ending.summary.placedCore', 'Placed Core Cards')}: {placedCore.length}</div>
                  <div>{t('play.ending.summary.policiesUsed', 'Policies Used')}: {policyHistory.length}</div>
                  <div>{t('play.ending.summary.uniquePolicies', 'Unique Policies Used')}: {uniquePoliciesUsed}</div>
                  <div>{t('play.ending.summary.settlementTurns', 'Settlement Turns')}: {settlementHistory.length}</div>
                  <div>{t('play.ending.summary.industry', 'Industry')}: {resources.industry ?? 0}</div>
                  <div>{t('play.ending.summary.tech', 'Tech')}: {resources.tech ?? 0}</div>
                  <div>{t('play.ending.summary.population', 'Population')}: {resources.population ?? 0}</div>
                  <div>{t('play.ending.summary.green', 'Green')}: {metrics.green ?? 0}</div>
                  <div>{t('play.ending.summary.carbon', 'Carbon')}: {metrics.carbon ?? 0}</div>
                  <div>{t('play.ending.summary.satisfaction', 'Satisfaction')}: {metrics.satisfaction ?? 0}</div>
                  <div>{t('play.ending.summary.quota', 'Quota')}: {tradeQuota}</div>
                  <div>{t('play.ending.summary.tradeProfit', 'Trade Profit')}: {tradeProfit.toFixed(1)}</div>
                  <div>{t('play.ending.summary.negativeEvents', 'Negative Events')}: {Number(eventStats.negativeTriggered || 0)}</div>
                  <div>{t('play.ending.summary.resolvedEvents', 'Resolved Events')}: {Number(eventStats.negativeResolved || 0)}</div>
                  <div>{t('play.ending.summary.resolveRate', 'Resolve Rate')}: {Number(eventStats.resolveRate ?? 0).toFixed(1)}%</div>
                  <div>{t('play.metrics.lowCarbon', 'Low Carbon Score')}: {endingLowCarbonTotal}</div>
                  <div>{t('play.ending.summary.lowCarbonTarget', 'Low Carbon Target')}: {endingLowCarbonTarget}</div>
                  <div>{t('play.ending.summary.lowCarbonGap', 'Gap to Target')}: {endingLowCarbonGap}</div>
                </div>
              </div>

              {!!lowCarbonScoreBreakdown && (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('play.ending.scoreBreakdown', 'Low-Carbon Score Breakdown')}</div>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                    <div>{t('play.ending.breakdown.baseCards', 'Base Cards')}: {Number(lowCarbonScoreBreakdown.baseCards ?? 0)}</div>
                    <div>{t('play.ending.breakdown.latePhaseBonus', 'Late Phase Bonus')}: {Number(lowCarbonScoreBreakdown.latePhaseBonus ?? 0)}</div>
                    <div>{t('play.ending.breakdown.domainBonus', 'Domain Bonus')}: {Number(lowCarbonScoreBreakdown.domainBonus ?? 0)}</div>
                    <div>{t('play.ending.breakdown.policyUnlockScore', 'Policy Unlock Score')}: {Number(lowCarbonScoreBreakdown.policyUnlockScore ?? 0)}</div>
                    <div>{t('play.ending.breakdown.policyUnlockAllBonus', 'Policy Unlock All Bonus')}: {Number(lowCarbonScoreBreakdown.policyUnlockAllBonus ?? 0)}</div>
                    <div>{t('play.ending.breakdown.eventResolveScore', 'Event Resolve Score')}: {Number(lowCarbonScoreBreakdown.eventResolveScore ?? 0)}</div>
                    <div>{t('play.ending.breakdown.eventUnresolvedPenalty', 'Event Unresolved Penalty')}: -{Number(lowCarbonScoreBreakdown.eventUnresolvedPenalty ?? 0)}</div>
                    <div>{t('play.ending.breakdown.carbonTierScore', 'Carbon Tier Score')}: {Number(lowCarbonScoreBreakdown.carbonTierScore ?? 0)}</div>
                    <div>{t('play.ending.breakdown.overLimitPenalty', 'Over-limit Penalty')}: -{Number(lowCarbonScoreBreakdown.overLimitPenalty ?? 0)}</div>
                    <div>{t('play.ending.breakdown.tradeProfitScore', 'Trade Profit Score')}: {Number(lowCarbonScoreBreakdown.tradeProfitScore ?? 0)}</div>
                    <div>{t('play.ending.breakdown.quotaPenalty', 'Quota Penalty')}: -{Number(lowCarbonScoreBreakdown.quotaPenalty ?? 0)}</div>
                    <div>{t('play.ending.breakdown.invalidPenalty', 'Invalid Penalty')}: -{Number(lowCarbonScoreBreakdown.invalidPenalty ?? 0)}</div>
                    <div>{t('play.ending.breakdown.scoreBeforeBonuses', 'Score Before Settlement Bonuses')}: {Number(lowCarbonScoreBreakdown.scoreBeforeBonuses ?? 0)}</div>
                    <div>{t('play.ending.breakdown.settlementBonus', 'Settlement Bonus')}: {Number(lowCarbonScoreBreakdown.settlementBonus ?? 0)}</div>
                    <div>{t('play.ending.breakdown.phaseMatchBonus', 'Phase Match Bonus')}: {Number(lowCarbonScoreBreakdown.phaseMatchBonus ?? 0)}</div>
                    <div>{t('play.ending.breakdown.percentageBonus', 'Percentage Bonus')}: {Number(lowCarbonScoreBreakdown.percentageBonus ?? 0)}%</div>
                    <div>{t('play.ending.breakdown.rawTotal', 'Raw Total')}: {Number(lowCarbonScoreBreakdown.rawTotal ?? 0)}</div>
                    <div>{t('play.ending.breakdown.finalTotal', 'Final Total')}: {Number(lowCarbonScoreBreakdown.finalTotal ?? 0)}</div>
                  </div>
                </div>
              )}

              {ending.imageKey && (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {t('play.ending.snapshotTitle', 'Final Board Snapshot')}
                  </div>
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-emerald-100/60 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                    <img
                      src={resolveImageUrl(ending.imageKey)}
                      alt={endingTitle || ending.endingName}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        const target = event.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('[data-ending-image-fallback]');
                        if (fallback instanceof HTMLElement) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  </div>
                  <div
                    data-ending-image-fallback
                    className="hidden aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
                  >
                    {t('play.ending.snapshotMissing', 'Ending image not found in storage')}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleOpenArchive}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {t('play.ending.skip', 'Skip')}
                </button>
                <button
                  onClick={() => {
                    void handleRestartSession();
                  }}
                  className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {t('play.ending.restart', 'Restart')}
                </button>
                <button
                  onClick={() => {
                    void handleExitSession();
                  }}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {t('play.ending.backHome', 'Back to Game Home')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
