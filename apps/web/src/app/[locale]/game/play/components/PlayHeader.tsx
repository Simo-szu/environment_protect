'use client';

import { useMemo } from 'react';
import type { GamePlayController, GuidedTask, TurnFlowStep } from '../hooks/useGamePlayController';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface PlayHeaderProps {
  t: GamePlayController['t'];
  turn: number;
  maxTurn: number;
  phase: string;
  domainProgress: GamePlayController['domainProgress'];
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
  guidedTutorialActive: boolean;
  currentGuidedTaskId?: GuidedTask['id'];
  boardViewMode: GamePlayController['boardViewMode'];
  setBoardViewMode: GamePlayController['setBoardViewMode'];
}

export default function PlayHeader(props: PlayHeaderProps) {
  const {
    t,
    turn,
    maxTurn,
    phase,
    domainProgress,
    turnFlowSteps,
    handleBack,
    handleOpenArchive,
    handleRestartSession,
    handleExitSession,
    sessionControlLoading,
    transitionAnimationEnabled,
    onToggleTransitionAnimation,
    onEndTurn,
    endTurnDisabled,
    boardViewMode,
    setBoardViewMode
  } = props;

  const domainRows = useMemo(
    () => [
      { key: 'industry', label: t('play.domains.industry', 'Industry') },
      { key: 'ecology', label: t('play.domains.ecology', 'Ecology') },
      { key: 'science', label: t('play.domains.science', 'Science') },
      { key: 'society', label: t('play.domains.society', 'Society') }
    ],
    [t]
  );

  return (
    <header className="relative border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 py-2 z-[120] flex items-center justify-between gap-3 overflow-visible">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleBack}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all active:scale-95"
          title={t('play.actions.back', 'Back')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight text-emerald-950 dark:text-emerald-200">
            {t('play.title', 'Low Carbon City')}
          </h1>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
            <span>T <span className="text-slate-900 dark:text-slate-100">{turn}</span></span>
            <span className="opacity-30">/</span>
            <span>{maxTurn}</span>
            <span className="opacity-30">·</span>
            <span>{phase}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-center gap-3 overflow-visible">
        <details className="relative group">
          <summary className="list-none cursor-pointer px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-[10px] font-black tracking-wide text-slate-600 dark:text-slate-200 flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500">{t('play.stats.domainProgress', 'Domain')}</span>
            <span>{Math.round(Number(domainProgress.industry ?? 0))}%</span>
            <span>{Math.round(Number(domainProgress.ecology ?? 0))}%</span>
            <span>{Math.round(Number(domainProgress.science ?? 0))}%</span>
            <span>{Math.round(Number(domainProgress.society ?? 0))}%</span>
          </summary>
          <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl z-[130]">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('play.stats.domainProgress', 'Domain Progress')}</div>
            <div className="space-y-2">
              {domainRows.map((row) => {
                const pct = clampPct(Number(domainProgress[row.key] ?? 0));
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <span>{row.label}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 mt-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        <div className="w-[min(28vw,320px)] flex items-center justify-center">
          <div className="w-full flex items-center gap-1 px-2.5 py-1.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-visible">
            {turnFlowSteps.map((step, idx) => (
              <div key={step.id} className="flex-1 flex items-center group/step relative justify-center">
                {idx > 0 && (
                  <div className={`absolute left-[-50%] top-1/2 -translate-y-1/2 w-full h-[2px] rounded-full ${step.active || step.done ? 'bg-emerald-500/40' : 'bg-slate-300 dark:bg-slate-700'}`} />
                )}
                <div
                  title={step.label}
                  className={`relative z-10 w-2.5 h-2.5 rounded-full transition-all duration-500 ${step.done
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : step.active
                      ? 'bg-emerald-400 ring-4 ring-emerald-400/25 scale-110'
                      : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                />
                <span className="pointer-events-none absolute top-full mt-2 px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/step:opacity-100 transition-opacity z-[130]">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-30"
        >
          <span>{t('play.actions.endTurn', 'End Turn')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </header>
  );
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}
