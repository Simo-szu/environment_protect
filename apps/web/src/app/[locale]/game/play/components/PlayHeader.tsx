'use client';

import { useState } from 'react';
import type { GamePlayController, GuidedTask, TurnFlowStep } from '../hooks/useGamePlayController';

interface PlayHeaderProps {
  t: GamePlayController['t'];
  turn: number;
  maxTurn: number;
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
  resources: GamePlayController['resources'];
  metrics: GamePlayController['metrics'];
  tradeType: 'buy' | 'sell';
  setTradeType: (value: 'buy' | 'sell') => void;
  tradeAmount: number;
  setTradeAmount: (value: number) => void;
  runTradeAction: () => Promise<void>;
  tradeActionDisabled: boolean;
  tradeActionBlockedReason: string;
  boardViewMode: GamePlayController['boardViewMode'];
  setBoardViewMode: GamePlayController['setBoardViewMode'];
}

export default function PlayHeader(props: PlayHeaderProps) {
  const {
    t,
    turn,
    maxTurn,
    turnFlowSteps,
    strictGuideMode,
    handleBack,
    handleOpenArchive,
    refreshSession,
    handleRestartSession,
    handleExitSession,
    sessionControlLoading,
    onOpenGuide,
    transitionAnimationEnabled,
    onToggleTransitionAnimation,
    onEndTurn,
    endTurnDisabled,
    guidedTutorialActive,
    currentGuidedTaskId,
    resources,
    metrics,
    tradeType,
    setTradeType,
    tradeAmount,
    setTradeAmount,
    runTradeAction,
    tradeActionDisabled,
    tradeActionBlockedReason,
    boardViewMode,
    setBoardViewMode
  } = props;

  const [tradeOpen, setTradeOpen] = useState(false);

  return (
    <header className="border-b border-[#e3e8e3] bg-white/70 backdrop-blur-xl px-6 py-2 z-50 flex items-center justify-between gap-4">
      {/* Left Side: Back & Title */}
      <div className="flex items-center gap-5 shrink-0">
        <button
          onClick={handleBack}
          className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-emerald-700 transition-all active:scale-95"
          title={t('play.actions.back', '返回')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight text-emerald-950">
            {t('play.title', '低碳城市')}
          </h1>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-slate-400">
            <span>T <span className="text-slate-900">{turn}</span></span>
            <span className="opacity-30">/</span>
            <span>{maxTurn}</span>
          </div>
        </div>
      </div>

      {/* Center: Enhanced Step Progress */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-1.5 px-6 py-2 bg-slate-100/40 rounded-[2rem] border border-slate-200 shadow-sm relative group">
          {turnFlowSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center group/step relative">
              {idx > 0 && (
                <div className={`w-8 h-[2px] mx-1 rounded-full transition-all duration-700 ${step.active || step.done ? 'bg-emerald-500/30' : 'bg-slate-200'}`} />
              )}
              <div className="flex flex-col items-center gap-1.5 relative">
                <div
                  title={step.label}
                  className={`w-2 h-2 rounded-full transition-all duration-700 ${step.done
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : step.active
                      ? 'bg-emerald-400 ring-4 ring-emerald-400/20 scale-125'
                      : 'bg-slate-200'
                    }`}
                />
                <span className={`text-[8px] font-black uppercase tracking-tighter absolute top-full mt-2 transition-all duration-500 ${step.active ? 'text-emerald-700 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Quick Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">

          <details className="relative">
            <summary className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-emerald-700 transition-all cursor-pointer list-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /></svg>
            </summary>
            <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl p-2 shadow-xl z-50 flex flex-col gap-1 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-3 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  {t('play.actions.turnAnimation', 'Turn Animation')}
                </div>
                <button
                  onClick={() => onToggleTransitionAnimation(!transitionAnimationEnabled)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-black transition-colors ${transitionAnimationEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {transitionAnimationEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="px-3 py-2 border-t border-slate-200">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  {t('play.flow.title', 'Board View')}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setBoardViewMode('smart')}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-colors ${boardViewMode === 'smart' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {t('play.board.viewMode.smart', 'S')}
                  </button>
                  <button
                    onClick={() => setBoardViewMode('adjacency')}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-colors ${boardViewMode === 'adjacency' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {t('play.board.viewMode.adjacency', 'A')}
                  </button>
                  <button
                    onClick={() => setBoardViewMode('placeable')}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-colors ${boardViewMode === 'placeable' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {t('play.board.viewMode.placeable', 'P')}
                  </button>
                </div>
              </div>
              <div className="my-1 border-t border-slate-200" />
              <button onClick={handleOpenArchive} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 text-[11px] font-bold transition-colors">
                {t('play.actions.archive', '档案')}
              </button>
              <button
                onClick={() => { void handleRestartSession(); }}
                disabled={sessionControlLoading}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-700 text-[11px] font-black transition-colors"
              >
                {t('play.actions.restartSession', '重赛')}
              </button>
              <button
                onClick={() => { void handleExitSession(); }}
                disabled={sessionControlLoading}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-[11px] font-black transition-colors"
              >
                {t('play.actions.exitSession', '退出')}
              </button>
            </div>
          </details>
        </div>

        <button
          onClick={onEndTurn}
          disabled={endTurnDisabled}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-30"
        >
          <span>{t('play.actions.endTurn', '结算')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      {/* Trade Modal */}
      {tradeOpen && (
        <div className="absolute top-full right-6 mt-4 w-64 rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 shadow-2xl z-40 animate-in slide-in-from-top-2 fade-in">
          <h3 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-4">Market</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
              <button onClick={() => setTradeType('buy')} className={`py-2 rounded-lg text-[10px] font-black transition-all ${tradeType === 'buy' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Buy</button>
              <button onClick={() => setTradeType('sell')} className={`py-2 rounded-lg text-[10px] font-black transition-all ${tradeType === 'sell' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Sell</button>
            </div>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
            />
            <button onClick={runTradeAction} disabled={tradeActionDisabled} className="w-full py-3 rounded-2xl bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-600 transition-all">Submit</button>
          </div>
        </div>
      )}
    </header>
  );
}
