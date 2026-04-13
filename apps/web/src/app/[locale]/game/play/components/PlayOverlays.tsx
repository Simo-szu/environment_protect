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
  | 'skipPlacementConfirmOpen'
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
  | 'tradeQuotaDeductionStreak'
  | 'tradeLastQuotaConsumed'
  | 'tradeLastQuotaShortage'
  | 'tradeProfit'
  | 'eventStats'
  | 'locale'
  | 'handleOpenArchive'
  | 'handleLoginToSave'
  | 'refreshSession'
  | 'handleRestartSession'
  | 'handleExitSession'
  | 'setGuidedTutorialActive'
  | 'confirmEndTurnWithoutPlacement'
  | 'cancelEndTurnWithoutPlacement'
  | 'setError'
  | 'setLastMessage'
  | 'setTransitionNotice'
  | 'isLoggedIn'
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
    skipPlacementConfirmOpen,
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
    tradeQuotaDeductionStreak,
    tradeLastQuotaConsumed,
    tradeLastQuotaShortage,
    tradeProfit,
    eventStats,
    locale,
    handleOpenArchive,
    handleLoginToSave,
    refreshSession,
    handleRestartSession,
    handleExitSession,
    setGuidedTutorialActive,
    confirmEndTurnWithoutPlacement,
    cancelEndTurnWithoutPlacement,
    setError,
    setLastMessage,
    setTransitionNotice,
    isLoggedIn
  } = props;
  const [dismissedEventAlertToken, setDismissedEventAlertToken] = useState('');
  const [dismissedQuotaAlertToken, setDismissedQuotaAlertToken] = useState('');

  const latestSettlement = settlementHistory.length > 0
    ? settlementHistory[settlementHistory.length - 1] as SettlementRecord
    : null;

  function normalizeDomainForUpgradeLabel(domain: string | null | undefined): string {
    const raw = String(domain || '').trim().toLowerCase();
    if (!raw) {
      return t('play.domains.policy', '政策');
    }
    if (raw === 'industry' || raw === 'industrial' || raw === '产业' || raw === '工业') {
      return t('play.domains.industry', '工业');
    }
    if (raw === 'ecology' || raw === 'ecological' || raw === '生态') {
      return t('play.domains.ecology', '生态');
    }
    if (raw === 'science' || raw === 'scientific' || raw === '科技' || raw === '科学') {
      return t('play.domains.science', '科学');
    }
    if (raw === 'society' || raw === 'social' || raw === '人文' || raw === '社会' || raw === '人与社会') {
      return t('play.domains.society', '社会');
    }
    if (raw === 'policy') {
      return t('play.domains.policy', '政策');
    }
    return raw;
  }

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
          ? `${normalizeDomainForUpgradeLabel(selectedCoreCard.upgradeRequirement.reqDomain1)}>=${Number(selectedCoreCard.upgradeRequirement.reqDomain1MinPct ?? 0)}%`
          : '',
        selectedCoreCard.upgradeRequirement.reqDomain2
          ? `${normalizeDomainForUpgradeLabel(selectedCoreCard.upgradeRequirement.reqDomain2)}>=${Number(selectedCoreCard.upgradeRequirement.reqDomain2MinPct ?? 0)}%`
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

  function resolveEventImageKey(eventType: string): string {
    const imageMap: Record<string, string> = {
      flood: 'events/内涝.webp',
      sea_level_rise: 'events/海平面上升.webp',
      citizen_protest: 'events/市民抗议.webp',
      negative_ecology_warning: 'events/生态破坏预警.jpg',
      negative_high_carbon_industry: 'events/工业碳排放异常.jpg',
    };
    imageMap.negative_industrial_carbon_abnormal = imageMap.negative_high_carbon_industry;
    return imageMap[eventType] || '';
  }

  const endingTitle = pickLocalizedText(ending?.endingName || '');
  const endingReason = pickLocalizedText(ending?.reason || '');
  const endingImageUrl = resolveImageUrl(ending?.imageKey);
  const scoreLabel = (zh: string, en: string) => (locale === 'zh' ? zh : en);
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
  const quotaValue = Math.max(0, Math.round(Number(tradeQuota || 0)));
  const carbonValue = Math.max(0, Math.round(Number(metrics.carbon || 0)));
  const quotaDeductionStreak = Math.max(0, Math.floor(Number(tradeQuotaDeductionStreak || 0)));
  const lastQuotaConsumed = Math.max(0, Math.floor(Number(tradeLastQuotaConsumed || 0)));
  const lastQuotaShortage = Math.max(0, Math.floor(Number(tradeLastQuotaShortage || 0)));
  const quotaAlertLevel: 'warning' | 'low' | 'exhausted' | null = useMemo(() => {
    if (quotaValue <= 0) {
      if (carbonValue <= 90) return null;
      return 'exhausted';
    }
    if (quotaValue < 20 && carbonValue > 90) {
      return 'low';
    }
    // warning: deduction streak >= 2 AND quota just crossed below a multiple of 10 (50, 40, 30)
    if (quotaDeductionStreak >= 2 && carbonValue > 90) {
      const prevQuota = quotaValue + lastQuotaConsumed;
      const crossedThreshold = [50, 40, 30].some(
        (threshold) => prevQuota >= threshold && quotaValue < threshold
      );
      if (crossedThreshold) {
        return 'warning';
      }
    }
    return null;
  }, [quotaValue, carbonValue, quotaDeductionStreak, lastQuotaConsumed]);
  const quotaAlertToken = useMemo(() => {
    if (!quotaAlertLevel) {
      return '';
    }
    return [
      quotaAlertLevel,
      turn,
      quotaValue,
      carbonValue,
      quotaDeductionStreak,
      lastQuotaConsumed,
      lastQuotaShortage
    ].join('|');
  }, [quotaAlertLevel, turn, quotaValue, carbonValue, quotaDeductionStreak, lastQuotaConsumed, lastQuotaShortage]);
  const showQuotaAlertModal = Boolean(
    quotaAlertLevel
    && quotaAlertToken
    && !transitionNotice
    && !showOnboarding
    && !ending
    && quotaAlertToken !== dismissedQuotaAlertToken
  );

  function openTradePanelFromAlert() {
    if (typeof document === 'undefined') {
      return;
    }
    const tradeButton = document.querySelector('[data-tutorial-id="trade-button"]');
    if (tradeButton instanceof HTMLButtonElement) {
      tradeButton.click();
    }
  }

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
                const eventImageUrl = resolveImageUrl(resolveEventImageKey(eventType));
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
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-black text-rose-800">
                            {resolveEventLabel(eventType) || t('play.events.title', 'Event')}
                          </div>
                          <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                            {t('play.events.remainingTurns', '剩余 {count} 回合', { count: Number(event.remainingTurns || 0) })}
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

                      <div className="overflow-hidden rounded-xl border border-rose-200 bg-white/85">
                        {eventImageUrl ? (
                          <img
                            src={eventImageUrl}
                            alt={resolveEventLabel(eventType) || t('play.events.title', 'Event')}
                            className="h-full min-h-[132px] w-full object-cover"
                          />
                        ) : (
                          <div className="flex min-h-[132px] items-center justify-center px-3 text-center text-xs font-semibold text-slate-500">
                            {t('play.events.imageMissing', 'Event image unavailable')}
                          </div>
                        )}
                      </div>
                    </div>
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

      {showQuotaAlertModal && quotaAlertLevel && (
        <div className="fixed inset-0 z-[365] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl rounded-[1.75rem] border p-5 shadow-[0_24px_70px_rgba(15,23,42,0.35)] ${
              quotaAlertLevel === 'exhausted'
                ? 'border-rose-300 bg-white'
                : quotaAlertLevel === 'low'
                  ? 'border-amber-300 bg-white'
                  : 'border-orange-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-rose-700">
                  {t('play.quotaAlert.badge', 'Carbon Quota Alert')}
                </div>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {t(`play.quotaAlert.${quotaAlertLevel}.title`, 'Carbon Quota Alert')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDismissedQuotaAlertToken(quotaAlertToken)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-600"
              >
                {t('play.actions.close', 'Close')}
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {t(`play.quotaAlert.${quotaAlertLevel}.content`, 'Carbon quota alert.')}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <div className="text-slate-500">{t('play.stats.currentEmission', 'Emission')}</div>
                <div className="font-black text-slate-800">{carbonValue}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <div className="text-slate-500">{t('play.stats.currentQuota', 'Quota')}</div>
                <div className="font-black text-slate-800">{quotaValue}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <div className="text-slate-500">{t('play.quotaAlert.thisTurnDeduct', 'Quota deducted')}</div>
                <div className="font-black text-slate-800">-{lastQuotaConsumed}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDismissedQuotaAlertToken(quotaAlertToken);
                  openTradePanelFromAlert();
                }}
                className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-emerald-800"
              >
                {t(`play.quotaAlert.${quotaAlertLevel}.primary`, 'Go to Trade')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDismissedQuotaAlertToken(quotaAlertToken);
                  if (quotaAlertLevel === 'exhausted') {
                    setLastMessage(
                      t(
                        'play.quotaAlert.exhausted.adjustHint',
                        'Reduce high-emission industry cards and place more ecology/low-carbon cards before ending turn.'
                      )
                    );
                  }
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-700 hover:bg-slate-50"
              >
                {t(`play.quotaAlert.${quotaAlertLevel}.secondary`, 'Later')}
              </button>
            </div>
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
                {t('play.guided.activeMission', 'Active Mission')}
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
                {t('play.guided.overlayInProgress', 'In Progress')}
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

      {skipPlacementConfirmOpen && !showOnboarding && !ending && (
        <div className="fixed inset-0 z-[460] flex items-center justify-center bg-slate-900/45 p-5 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[2rem] border border-amber-200 bg-white p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.32)] animate-in zoom-in-95 duration-200 sm:p-7">
            <div className="mb-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              {t('play.endTurnConfirm.badge', 'Turn Reminder')}
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {t('play.endTurnConfirm.title', '本回合还没有放置核心卡')}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t(
                'play.endTurnConfirm.description',
                '你将直接结束当前回合，并失去这回合的放置机会。建议先检查右侧手牌与棋盘高亮格，确认没有想放的卡后再继续。'
              )}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEndTurnWithoutPlacement}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {t('play.endTurnConfirm.cancel', '返回继续操作')}
              </button>
              <button
                type="button"
                onClick={confirmEndTurnWithoutPlacement}
                className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400"
              >
                {t('play.endTurnConfirm.confirm', '仍然结束回合')}
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
              {isConnectionIssue
                ? t('play.errors.connectionTitle', 'Connection Lost')
                : t('play.errors.systemAlert', 'System Alert')}
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
                {t('play.guided.acknowledge', 'Acknowledge')}
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
                <div className="text-[11px] font-semibold text-slate-700">{t('play.cardDetails.upgradeRequirement', 'Upgrade Requirement')}</div>
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
                <div className="text-[11px] font-semibold text-slate-700">{t('play.cardDetails.upgradeEffect', 'Upgrade Effect')}</div>
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_200px] lg:grid-cols-[1fr_220px]">

              {/* Left: title + stats */}
              <div className="flex flex-col gap-3 overflow-y-auto p-4 md:max-h-[88vh] md:p-5">
                {/* Header */}
                <div className="space-y-2">
                  <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {t('play.ending.badge', 'Ending Result')}
                  </div>
                  <div className="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">{endingTitle || ending.endingName}</div>
                  <div className="text-[15px] leading-6 text-slate-900 dark:text-slate-100">{endingReason || ending.reason}</div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>{t('play.ending.reachedTurn', 'Reached at turn: {turn}', { turn: ending.turn })}</span>
                    {isLoggedIn && (
                      <button
                        onClick={handleOpenArchive}
                        className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        {t('play.ending.viewArchive', '进入档案页')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Core metrics */}
                <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="mb-2 text-xs font-semibold text-slate-900 dark:text-slate-100">{scoreLabel('核心指标', 'Key Metrics')}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: scoreLabel('低碳总分', 'Low Carbon'), value: endingLowCarbonTotal, sub: `${scoreLabel('目标', 'Target')} ${endingLowCarbonTarget}` },
                      { label: scoreLabel('碳排放', 'Carbon'), value: Math.round(Number(metrics.carbon ?? 0)), sub: '' },
                      { label: scoreLabel('绿建度', 'Green'), value: Math.round(Number(metrics.green ?? 0)), sub: '' },
                      { label: scoreLabel('满意度', 'Satisfaction'), value: Math.round(Number(metrics.satisfaction ?? 0)), sub: '' },
                      { label: scoreLabel('交易收益', 'Trade Profit'), value: tradeProfit.toFixed(1), sub: '' },
                      { label: scoreLabel('化解率', 'Resolve Rate'), value: `${Number(eventStats.resolveRate ?? 0).toFixed(0)}%`, sub: `${Number(eventStats.negativeTriggered || 0)}${scoreLabel('次事件', ' events')}` },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.label}</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.value}</div>
                        {item.sub ? <div className="text-[10px] text-slate-400 dark:text-slate-500">{item.sub}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score breakdown - simplified */}
                {!!lowCarbonScoreBreakdown && (
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="mb-2 text-xs font-semibold text-slate-900 dark:text-slate-100">{scoreLabel('低碳得分构成', 'Low-Carbon Score Breakdown')}</div>
                    <div className="space-y-1">
                      {(() => {
                        const fmt = (v: number) => v >= 0 ? `+${v}` : `${v}`;
                        const carbonTrade = Number(lowCarbonScoreBreakdown.carbonTierScore ?? 0) + Number(lowCarbonScoreBreakdown.tradeProfitScore ?? 0);
                        const overLimit = Number(lowCarbonScoreBreakdown.overLimitPenalty ?? 0);
                        const otherPenalty = Number(lowCarbonScoreBreakdown.quotaPenalty ?? 0) + Number(lowCarbonScoreBreakdown.invalidPenalty ?? 0);
                        const items = [
                          { label: scoreLabel('基础卡 + 阶段加成', 'Base Cards + Phase Bonus'), value: `+${Number(lowCarbonScoreBreakdown.baseCards ?? 0) + Number(lowCarbonScoreBreakdown.latePhaseBonus ?? 0) + Number(lowCarbonScoreBreakdown.domainBonus ?? 0)}`, neg: false },
                          { label: scoreLabel('政策解锁', 'Policy Unlock'), value: `+${Number(lowCarbonScoreBreakdown.policyUnlockScore ?? 0) + Number(lowCarbonScoreBreakdown.policyUnlockAllBonus ?? 0)}`, neg: false },
                          { label: scoreLabel('事件化解', 'Event Resolve'), value: `+${Number(lowCarbonScoreBreakdown.eventResolveScore ?? 0)}`, neg: false },
                          { label: scoreLabel('未化解事件扣分', 'Unresolved Penalty'), value: `-${Number(lowCarbonScoreBreakdown.eventUnresolvedPenalty ?? 0)}`, neg: Number(lowCarbonScoreBreakdown.eventUnresolvedPenalty ?? 0) > 0 },
                          { label: scoreLabel('碳排 + 交易得分', 'Carbon + Trade Score'), value: fmt(carbonTrade), neg: carbonTrade < 0 },
                          ...(overLimit > 0 ? [{ label: scoreLabel('连续超标扣分', 'Over-limit Penalty'), value: `-${overLimit}`, neg: true }] : []),
                          ...(otherPenalty > 0 ? [{ label: scoreLabel('其他扣分', 'Other Penalty'), value: `-${otherPenalty}`, neg: true }] : []),
                          { label: scoreLabel('结算加成', 'Settlement Bonus'), value: `+${Number(lowCarbonScoreBreakdown.settlementBonus ?? 0) + Number(lowCarbonScoreBreakdown.phaseMatchBonus ?? 0)}`, neg: false },
                          { label: scoreLabel('最终低碳总分', 'Final Total'), value: String(Number(lowCarbonScoreBreakdown.finalTotal ?? 0)), bold: true, neg: false },
                        ];
                        return items.map((item) => (
                          <div key={item.label} className={`flex items-center justify-between text-[11px] ${item.bold ? 'border-t border-slate-200 pt-1 font-bold text-slate-900 dark:border-slate-600 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                            <span>{item.label}</span>
                            <span className={item.neg ? 'text-rose-600' : item.bold ? '' : 'text-emerald-700 dark:text-emerald-400'}>{item.value}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: image + actions */}
              <div className="flex flex-col gap-3 border-t border-slate-200/60 p-4 dark:border-slate-700 md:border-l md:border-t-0 md:p-5">
                {/* Ending image 3:4 */}
                {ending.imageKey && (
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {t('play.ending.snapshotTitle', 'Final Board Snapshot')}
                    </div>
                    <div className="h-[260px] w-full overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-100 to-emerald-100/60 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                      {endingImageUrl ? (
                        <img
                          src={endingImageUrl}
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
                      ) : null}
                    </div>
                    <div
                      data-ending-image-fallback
                      className="hidden h-[260px] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
                    >
                      {t('play.ending.snapshotMissing', 'Ending image not found in storage')}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  {isLoggedIn ? null : (
                    <button
                      onClick={handleLoginToSave}
                      className="rounded border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/45"
                    >
                      {t('play.ending.loginToSave', 'Login to Save')}
                    </button>
                  )}
                  <button
                    onClick={() => { void handleRestartSession(); }}
                    className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    {t('play.ending.restart', 'Restart')}
                  </button>
                  <button
                    onClick={() => { void handleExitSession(); }}
                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {t('play.ending.backHome', 'Back to Game Home')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
