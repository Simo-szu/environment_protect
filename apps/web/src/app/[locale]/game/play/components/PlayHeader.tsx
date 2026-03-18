'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GamePlayController, GuidedTask, TurnFlowStep } from '../hooks/useGamePlayController';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface PlayHeaderProps {
  t: GamePlayController['t'];
  turn: number;
  maxTurn: number;
  phase: string;
  carbon: number;
  carbonQuota: number;
  maxCarbonQuota: number;
  turnFlowSteps: TurnFlowStep[];
  strictGuideMode: boolean;
  handleBack: () => Promise<void>;
  handleOpenArchive: () => void;
  refreshSession: () => Promise<void>;
  handleRestartSession: () => Promise<void>;
  handleExitSession: () => Promise<void>;
  sessionControlLoading: boolean;
  onOpenGuide: () => void;
  transitionAnimationEnabled: boolean;
  onToggleTransitionAnimation: (checked: boolean) => void;
  onEndTurn: () => void;
  endTurnDisabled: boolean;
  endTurnBlockedReason: string;
  guidedTutorialActive: boolean;
  currentGuidedTaskId?: GuidedTask['id'];
  boardViewMode: GamePlayController['boardViewMode'];
  setBoardViewMode: GamePlayController['setBoardViewMode'];
  locale: string;
}

export default function PlayHeader(props: PlayHeaderProps) {
  const {
    t,
    turn,
    maxTurn,
    phase,
    carbon,
    carbonQuota,
    maxCarbonQuota,
    turnFlowSteps,
    handleBack,
    handleOpenArchive,
    handleRestartSession,
    handleExitSession,
    sessionControlLoading,
    onOpenGuide,
    transitionAnimationEnabled,
    onToggleTransitionAnimation,
    onEndTurn,
    endTurnDisabled,
    endTurnBlockedReason,
    boardViewMode,
    setBoardViewMode,
    locale
  } = props;
  const [manualOpen, setManualOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const manualSections = useMemo(() => {
    if (locale === 'zh') {
      return [
        {
          title: '总目标（先看这个）',
          bullets: [
            '你是深圳低碳规划师：在最多 30 回合内，平衡产业、生态、科创、民生四大板块。',
            '核心方向：稳住碳排放、避免配额耗尽、提升低碳总分，并争取更高等级结局。',
            '每回合最多放置 1 张核心卡、最多使用 1 张政策卡。'
          ]
        },
        {
          title: '开局基线',
          bullets: [
            '核心资源：产业值 30 / 科创点 20 / 人口 25。',
            '关键指标：绿建度 50 / 碳排放 80 / 市民满意度 60。',
            '碳交易：初始配额 50；首轮会从前期卡池发 4 张核心卡。'
          ]
        },
        {
          title: '每回合流程（简版）',
          bullets: [
            '抽牌 -> 选 1 张核心卡放置 -> 触发组合与结算 -> 事件判定 -> 政策卡使用 -> 结局校验。',
            '手牌超上限时需要弃牌：核心手牌上限 6，政策手牌上限 2。',
            '如果“结束回合”被阻塞，优先检查：是否有待弃牌、是否已放核心卡、是否有引导任务未完成。'
          ]
        },
        {
          title: '碳交易规则与建议',
          bullets: [
            '碳交易用于买卖配额：配额富余可卖出增利，配额不足可买入止损。',
            '碳排放过高会持续侵蚀分数，配额耗尽会拖慢结局质量。',
            '实战建议：碳排放接近高风险时优先补配额；碳排放稳定且配额富余时再考虑卖出。'
          ]
        },
        {
          title: '政策卡与结局方向',
          bullets: [
            '政策卡需先满足解锁条件；解锁后才会抽到并可使用。',
            '同一回合最多 1 张；持续型常见为 3 回合，同类效果后用会覆盖前者。',
            '想冲高结局：保持板块均衡布局 + 控碳 + 做好碳交易盈利 + 及时化解负面事件。'
          ]
        },
        {
          title: '卡关时怎么做',
          bullets: [
            '先点右上角“教程”重开引导，再按右下角提示完成当回合目标。',
            '若资源不足：先放低消耗卡稳住基础产出，下一回合再上高阶卡。',
            '若频繁触发负面事件：提高生态/科创投入，并预留政策卡应急。'
          ]
        }
      ] as Array<{ title: string; bullets: string[] }>;
    }

    return [
      {
        title: 'Main Objective',
        bullets: [
          'You are Shenzhen’s low-carbon planner. Balance Industry, Ecology, Science, and Society within up to 30 turns.',
          'Keep emissions controlled, avoid quota depletion, and push for stronger ending tiers.',
          'Per turn: deploy up to 1 core card and use up to 1 policy card.'
        ]
      },
      {
        title: 'Starting Baseline',
        bullets: [
          'Core resources: Industry 30 / Tech 20 / Population 25.',
          'Key metrics: Green 50 / Carbon 80 / Satisfaction 60.',
          'Carbon trade starts with quota 50; opening hand draws 4 early-stage core cards.'
        ]
      },
      {
        title: 'Turn Loop (Quick)',
        bullets: [
          'Draw -> deploy 1 core card -> combos/settlement -> event check -> policy use -> ending check.',
          'Hand limits: Core 6, Policy 2. Over-limit requires discard.',
          'If End Turn is blocked, check pending discard, placement requirement, or guided task gating.'
        ]
      },
      {
        title: 'Carbon Trading',
        bullets: [
          'Trade buys/sells emission quota: sell surplus for profit, buy deficit to prevent penalties.',
          'High carbon and quota depletion hurt your ending potential.',
          'Practical rule: buy near risk thresholds; sell only when carbon is stable and quota is clearly surplus.'
        ]
      },
      {
        title: 'Policy Cards and Ending Path',
        bullets: [
          'Policy cards must be unlocked before they can be drawn and used.',
          'Only 1 policy card per turn; continuous effects commonly last 3 turns and same-type effects overwrite.',
          'For better endings: balanced sectors + carbon control + positive trade profit + event mitigation.'
        ]
      },
      {
        title: 'If You Get Stuck',
        bullets: [
          'Use the Tutorial button in this menu and follow the active mission prompt.',
          'When resources are tight, place low-cost cards first to stabilize income.',
          'If negative events stack up, increase ecology/science investment and keep policy cards for response.'
        ]
      }
    ] as Array<{ title: string; bullets: string[] }>;
  }, [locale]);

  const carbonValue = Math.max(0, Math.round(Number(carbon) || 0));
  const carbonQuotaValue = Math.max(0, Math.round(Number(carbonQuota) || 0));
  const effectiveQuotaForPct = Math.max(1, carbonQuotaValue);
  const carbonPct = clampPct((carbonValue / effectiveQuotaForPct) * 100);
  const carbonOverLimit = carbonValue > carbonQuotaValue;
  const carbonHighRisk = carbonOverLimit || carbonPct >= 85;
  const carbonRemaining = carbonQuotaValue - carbonValue;
  const carbonToneClass = carbonHighRisk
    ? 'text-rose-600 dark:text-rose-300'
    : 'text-emerald-600 dark:text-emerald-300';
  const carbonBarClass = carbonHighRisk ? 'bg-rose-500' : 'bg-emerald-500';
  const carbonStatusLabel = carbonHighRisk
    ? t('play.stats.carbonStatusAlert', 'Alert')
    : t('play.stats.carbonStatusGood', 'Good');
  const activeTurnStep = useMemo(
    () => turnFlowSteps.find((step) => step.active) || turnFlowSteps.find((step) => !step.done) || null,
    [turnFlowSteps]
  );
  const closeSettingsDropdown = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const details = target.closest('details');
    if (details) {
      details.removeAttribute('open');
    }
  };

  return (
    <header className="relative border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-3 sm:px-4 py-2 z-[120] flex flex-wrap items-center justify-between gap-3 overflow-visible">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all active:scale-95"
          title={t('play.actions.back', 'Back')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-sm sm:text-base font-black tracking-tight text-emerald-950 dark:text-emerald-200">
            {t('play.title', 'Low Carbon City')}
          </h1>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
            <span>T <span className="text-slate-900 dark:text-slate-100">{turn}</span></span>
            <span className="opacity-30">/</span>
            <span>{maxTurn}</span>
            <span className="opacity-30">·</span>
            <span>{phase}</span>
          </div>
          {activeTurnStep && (
            <div className="mt-1 md:hidden inline-flex w-max max-w-full items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black tracking-wide text-emerald-700">
              <span className="truncate">{activeTurnStep.label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-center overflow-visible">
        <details className="relative group w-full max-w-[430px]">
          <summary className={`list-none cursor-pointer px-3 py-2 rounded-2xl border-2 ${carbonHighRisk ? 'border-rose-300 bg-rose-50/90 dark:border-rose-700/70 dark:bg-rose-950/20' : 'border-emerald-300 bg-emerald-50/90 dark:border-emerald-700/70 dark:bg-emerald-950/25'} text-slate-700 dark:text-slate-100 flex flex-col gap-1 shadow-sm`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('play.stats.carbonProgress', 'Carbon Emission Cap')}</span>
                <span className="rounded-full border border-emerald-400/60 bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-300/50 dark:bg-emerald-300/10 dark:text-emerald-200">
                  {t('play.stats.carbonQuotaTag', 'Quota')}
                </span>
              </div>
              <div className="flex shrink-0 items-end gap-1">
                <span className={`text-[20px] leading-none font-black ${carbonToneClass}`}>{carbonValue}/{carbonQuotaValue}</span>
                <span className={`pb-0.5 text-[12px] leading-none font-black ${carbonToneClass}`}>{carbonPct}%</span>
                <span className={`pb-0.5 text-[11px] leading-none font-black ${carbonToneClass}`}>{carbonStatusLabel}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/80 dark:bg-slate-900/70 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${carbonBarClass}`} style={{ width: `${Math.min(100, carbonPct)}%` }} />
            </div>
          </summary>
          <div className="absolute top-full left-0 mt-2 w-[min(92vw,360px)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl z-[130]">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              {t('play.stats.carbonProgress', 'Carbon Emission Cap')}
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>{t('play.stats.emissionQuotaRatio', 'Emission / Quota')}</span>
                  <span className={carbonToneClass}>{carbonValue}/{carbonQuotaValue} ({carbonPct}%)</span>
                </div>
                <div className="h-2 mt-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${carbonBarClass}`} style={{ width: `${Math.min(100, carbonPct)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">{t('play.stats.currentEmission', 'Emission')}</div>
                  <div className="font-black text-slate-800 dark:text-slate-100">{carbonValue}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">{t('play.stats.currentQuota', 'Quota')}</div>
                  <div className="font-black text-slate-800 dark:text-slate-100">{carbonQuotaValue}</div>
                </div>
                <div className={`rounded-lg border px-2 py-1.5 text-[10px] ${carbonRemaining < 0 ? 'border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/20' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20'}`}>
                  <div className={carbonRemaining < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}>
                    {t('play.stats.remainingQuota', 'Remaining')}
                  </div>
                  <div className={`font-black ${carbonRemaining < 0 ? 'text-rose-700 dark:text-rose-200' : 'text-emerald-700 dark:text-emerald-200'}`}>{carbonRemaining}</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {t('play.stats.quotaCapHint', 'Trade quota cap')}: {maxCarbonQuota}
              </div>
              <div className={`text-[11px] font-semibold ${carbonToneClass}`}>
                {carbonHighRisk
                  ? t('play.stats.carbonWarning', 'Red alert: emissions are near or above the cap.')
                  : t('play.stats.carbonHealthy', 'Green status: emissions are within quota.')}
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="flex w-full sm:w-auto items-center justify-end gap-2 shrink-0">
        <LanguageSwitcher />
        <ThemeToggle />

        <details className="relative">
          <summary className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all cursor-pointer list-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /></svg>
          </summary>
          <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-xl z-[130] flex flex-col gap-1 overflow-hidden">
            <div className="px-3 py-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                {t('play.actions.turnAnimation', 'Turn Animation')}
              </div>
              <button
                onClick={() => onToggleTransitionAnimation(!transitionAnimationEnabled)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-black transition-colors ${transitionAnimationEnabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}
              >
                {transitionAnimationEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                {t('play.flow.title', 'Board View')}
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setBoardViewMode('smart')}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-colors ${boardViewMode === 'smart' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  {t('play.board.viewMode.smart', 'S')}
                </button>
                <button
                  onClick={() => setBoardViewMode('adjacency')}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-colors ${boardViewMode === 'adjacency' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  {t('play.board.viewMode.adjacency', 'A')}
                </button>
                <button
                  onClick={() => setBoardViewMode('placeable')}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-colors ${boardViewMode === 'placeable' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  {t('play.board.viewMode.placeable', 'P')}
                </button>
              </div>
            </div>
            <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
            <button
              onClick={(event) => {
                closeSettingsDropdown(event.currentTarget);
                setManualOpen(true);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-100 text-[11px] font-black transition-colors"
            >
              {locale === 'zh' ? '游戏说明书' : 'Game Manual'}
            </button>
            <button
              onClick={(event) => {
                closeSettingsDropdown(event.currentTarget);
                onOpenGuide();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-700 dark:text-sky-300 text-[11px] font-black transition-colors"
            >
              {locale === 'zh' ? '教程引导' : 'Tutorial Guide'}
            </button>
            <button onClick={handleOpenArchive} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200 text-[11px] font-bold transition-colors">
              {t('play.actions.archive', 'Archive')}
            </button>
            <button
              onClick={() => { void handleRestartSession(); }}
              disabled={sessionControlLoading}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-black transition-colors"
            >
              {t('play.actions.restartSession', 'Restart')}
            </button>
            <button
              onClick={() => { void handleExitSession(); }}
              disabled={sessionControlLoading}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-300 text-[11px] font-black transition-colors"
            >
              {t('play.actions.exitSession', 'Exit')}
            </button>
          </div>
        </details>

        <button
          onClick={onEndTurn}
          disabled={endTurnDisabled}
          title={endTurnDisabled && endTurnBlockedReason ? endTurnBlockedReason : t('play.actions.endTurn', 'End Turn')}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-30"
        >
          <span>{t('play.actions.endTurn', 'End Turn')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      {manualOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[560] overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setManualOpen(false)}
        >
          <div
            className="mx-auto mt-2 flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95 sm:mt-6 sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {locale === 'zh' ? '《深圳低碳规划师》游戏说明书' : 'Shenzhen Low-Carbon Planner Manual'}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {locale === 'zh' ? '来自需求文档的实战要点（精简版）' : 'Practical quick guide distilled from the requirement spec'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-[11px] font-black text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {locale === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {manualSections.map((section) => (
                <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/70">
                  <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-300">{section.title}</h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-700 dark:text-slate-200">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[2px] text-emerald-600 dark:text-emerald-300">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="w-full rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-emerald-600"
              >
                {locale === 'zh' ? '退出说明书' : 'Exit Manual'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}
