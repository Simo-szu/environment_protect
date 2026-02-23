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
  tradeType: 'buy' | 'sell';
  setTradeType: (value: 'buy' | 'sell') => void;
  tradeAmount: number;
  setTradeAmount: (value: number) => void;
  runTradeAction: () => Promise<void>;
  tradeActionDisabled: boolean;
  tradeActionBlockedReason: string;
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
    tradeType,
    setTradeType,
    tradeAmount,
    setTradeAmount,
    runTradeAction,
    tradeActionDisabled,
    tradeActionBlockedReason
  } = props;

  const [tradeOpen, setTradeOpen] = useState(false);

  return (
    <header className="border-b bg-white px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleBack} className="px-2.5 py-1 rounded border border-slate-300 text-xs">
            {t('play.actions.back', '返回')}
          </button>
          <div className="font-semibold text-sm">{t('play.title', '低碳城市卡牌游戏')}</div>
          <div className="text-xs text-slate-500">{t('play.turn', '回合')} {turn}/{maxTurn}</div>
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap pr-2">
            {turnFlowSteps.map((step) => (
              <div
                key={step.id}
                className={`rounded border px-2 py-0.5 text-[11px] ${step.done
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : step.active
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
              >
                {step.done ? '✓ ' : ''}{step.label}
              </div>
            ))}
            {strictGuideMode && (
              <div className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                {t('play.guideMode.message', '强引导模式（前3回合）：先完成核心卡放置与结束回合，政策与交易暂时锁定。')}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={handleOpenArchive} className="px-2.5 py-1 rounded border border-slate-300 text-xs">
            {t('play.actions.archive', '档案')}
          </button>
          <button onClick={refreshSession} className="px-2.5 py-1 rounded border border-slate-300 text-xs">
            {t('play.actions.refresh', '刷新')}
          </button>
          <button
            onClick={() => {
              void handleRestartSession();
            }}
            disabled={sessionControlLoading}
            className="px-2.5 py-1 rounded border border-emerald-300 text-emerald-700 text-xs disabled:opacity-50"
          >
            {t('play.actions.restartSession', '再玩一次')}
          </button>
          <button
            onClick={() => {
              void handleExitSession();
            }}
            disabled={sessionControlLoading}
            className="px-2.5 py-1 rounded border border-rose-300 text-rose-700 text-xs disabled:opacity-50"
          >
            {t('play.actions.exitSession', '退出对局')}
          </button>
          <button
            onClick={() => setTradeOpen((prev) => !prev)}
            className={`px-2.5 py-1 rounded border text-xs ${tradeOpen ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-300'}`}
          >
            {t('play.trade.actionTitle', '交易操作')}
          </button>
          <button
            onClick={onOpenGuide}
            className="px-2.5 py-1 rounded border border-slate-300 text-xs"
          >
            {t('play.actions.guide', '引导')}
          </button>
          <label className="flex items-center gap-1 px-2 py-1 text-[11px] border border-slate-300 rounded">
            <input
              type="checkbox"
              checked={transitionAnimationEnabled}
              onChange={(e) => onToggleTransitionAnimation(e.target.checked)}
            />
            {t('play.actions.turnAnimation', '回合动效')}
          </label>
          <button
            onClick={onEndTurn}
            disabled={endTurnDisabled}
            className={`px-2.5 py-1 rounded bg-slate-900 text-white text-xs disabled:opacity-50 ${guidedTutorialActive && currentGuidedTaskId === 'end_turn'
              ? 'ring-2 ring-amber-300 ring-offset-2'
              : ''
              }`}
          >
            {t('play.actions.endTurn', '结束回合')}
          </button>
        </div>
      </div>
      {tradeOpen && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-2 items-center">
            <select
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm bg-white"
            >
              <option value="buy">{t('play.trade.buy', '买入配额')}</option>
              <option value="sell">{t('play.trade.sell', '卖出配额')}</option>
            </select>
            <input
              type="number"
              min={1}
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value) || 1)}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
              placeholder={t('play.trade.amount', '数量')}
            />
            <button
              onClick={runTradeAction}
              disabled={tradeActionDisabled}
              className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm disabled:opacity-50"
            >
              {t('play.trade.execute', '执行交易')}
            </button>
          </div>
          {tradeActionBlockedReason && (
            <div className="mt-2 text-xs text-amber-700">{tradeActionBlockedReason}</div>
          )}
        </div>
      )}
    </header>
  );
}
