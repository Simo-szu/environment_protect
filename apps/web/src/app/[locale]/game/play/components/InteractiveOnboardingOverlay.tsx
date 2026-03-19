'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type StepPlacement = 'center' | 'top' | 'bottom' | 'left' | 'right';
type StepAction = 'select_core' | 'select_tile' | 'place_core' | 'end_turn';

interface TutorialStep {
  id: string;
  title: string;
  body: string;
  placement: StepPlacement;
  targetSelectors?: string[];
  action?: StepAction;
  autoAdvance?: boolean;
}

interface InteractiveOnboardingOverlayProps {
  t: (key: string, fallback?: string, values?: Record<string, unknown>) => string;
  locale: string;
  onboardingStep: number;
  setOnboardingStep: (updater: (prev: number) => number) => void;
  closeOnboarding: (markSeen: boolean, keepGuidedActive: boolean) => void;
  selectedCoreId: string;
  selectedTile: string;
  corePlacedThisTurn: boolean;
  turn: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function renderRichText(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, lineIndex) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={`line-${lineIndex}`} className={lineIndex === 0 ? '' : 'mt-1.5'}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
              return (
                <strong key={`part-${lineIndex}-${partIndex}`} className="font-black text-slate-800">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={`part-${lineIndex}-${partIndex}`}>{part}</span>;
          })}
        </p>
      );
    });
}

export default function InteractiveOnboardingOverlay(props: InteractiveOnboardingOverlayProps) {
  const {
    t,
    locale,
    onboardingStep,
    setOnboardingStep,
    closeOnboarding,
    selectedCoreId,
    selectedTile,
    corePlacedThisTurn,
    turn
  } = props;

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; transform?: string }>({
    top: 0,
    left: 0,
    transform: 'translate(-50%, -50%)'
  });

  const steps = useMemo<TutorialStep[]>(
    () => {
      const zh = locale === 'zh';
      const txt = (zhText: string, enText: string) => (zh ? zhText : enText);
      return [
      {
        id: 'welcome',
        title: txt('欢迎来到深圳，新晋低碳规划师！', 'Welcome, new low-carbon planner of Shenzhen!'),
        body: txt(
          '欢迎来到深圳！恭喜你成为我们特聘的低碳规划师！\n你的核心任务是：为深圳制定低碳发展规划，既要让城市的工业、科技、民生稳步发展，又要控制碳排放，实现“绿色发展”。\n你将通过**卡牌布局**、**政策运用**和**碳交易**，带领这座城市走向可持续发展的未来。\n准备好了吗？先跟着教程熟悉你的工作内容吧～',
          'Welcome to Shenzhen, and congratulations on becoming our specially appointed low-carbon planner!\nYour core mission is to design a low-carbon development plan for Shenzhen: keep industry, technology, and livelihood growing steadily while controlling emissions for green development.\nYou will lead the city toward a sustainable future through **card placement**, **policy usage**, and **carbon trading**.\nReady? Let us walk through your core tasks in this tutorial.'
        ),
        placement: 'center'
      },
      {
        id: 'console.resources',
        title: txt('这是你的规划控制台', 'This is your planning console'),
        body: txt(
          '左侧是资源状态栏：\n产业值、市民数、科创点、绿建度，这些是你放置卡牌进行规划的“资金”；\n低碳总分是你的“成绩单”，是游戏最终结局的核心判定标准。\n产业值代表城市的工业发展水平。\n市民数量和满意度体现民生水平。\n科创点代表低碳技术的研发能力。\n绿建度是城市绿化、低碳建筑的覆盖程度。',
          'The left side is your resource status panel:\nIndustry, Population, Tech, and Green are your planning capital for card placement.\nLow-Carbon Score is your report card and a core factor for final ending evaluation.\nIndustry reflects industrial development.\nPopulation and Satisfaction reflect livelihood conditions.\nTech reflects low-carbon R&D capability.\nGreen reflects city greening and low-carbon building coverage.'
        ),
        placement: 'right',
        targetSelectors: ['[data-tutorial-id="resources-panel"]']
      },
      {
        id: 'console.planning',
        title: txt('这是你的规划控制台', 'This is your planning console'),
        body: txt('中间是四大建设板块：工业、生态系统、科学、人与社会。', 'Center panel is the 4-domain planning area.'),
        placement: 'right',
        targetSelectors: ['[data-tutorial-id="planning-panel"]']
      },
      {
        id: 'console.hand',
        title: txt('这是你的规划控制台', 'This is your planning console'),
        body: txt('右侧是手牌区：核心卡用于放置，政策卡用于即时生效。', 'Right panel is your hand: core cards for placement, policy cards for instant effects.'),
        placement: 'left',
        targetSelectors: ['[data-tutorial-id="hand-panel"]']
      },
      {
        id: 'turn.select_core',
        title: txt('第一回合：第 1 步', 'Turn 1: Step 1'),
        body: txt('请先点击一张核心卡牌。', 'Select one core card from your hand.'),
        placement: 'left',
        targetSelectors: ['[data-tutorial-role="core-card"]', '[data-tutorial-id="hand-panel"]'],
        action: 'select_core',
        autoAdvance: true
      },
      {
        id: 'turn.select_tile',
        title: txt('第一回合：第 2 步', 'Turn 1: Step 2'),
        body: txt('请在中间板块选择一个可放置的格子。', 'Select a valid slot in the planning area.'),
        placement: 'right',
        targetSelectors: ['[data-tutorial-role="planning-slot"][data-tutorial-placeable="1"]', '[data-tutorial-id="planning-panel"]'],
        action: 'select_tile',
        autoAdvance: true
      },
      {
        id: 'turn.deploy',
        title: txt('第一回合：第 3 步', 'Turn 1: Step 3'),
        body: txt('点击右下角 DEPLOY 完成放置。', 'Click DEPLOY to confirm card placement.'),
        placement: 'top',
        targetSelectors: ['[data-tutorial-id="deploy-button"]', '[data-tutorial-id="action-bar"]'],
        action: 'place_core',
        autoAdvance: true
      },
      {
        id: 'turn.end_turn',
        title: txt('第一回合：第 4 步', 'Turn 1: Step 4'),
        body: txt('点击“结束回合”推进时间并观察结算变化。', 'Click End Turn to progress and watch settlement results.'),
        placement: 'top',
        targetSelectors: ['[data-tutorial-id="end-turn-button"]'],
        action: 'end_turn',
        autoAdvance: true
      },
      {
        id: 'feature.trade',
        title: txt('特色玩法 1：碳交易', 'Feature 1: Carbon Trading'),
        body: txt(
          '碳交易区：碳排放的“买卖超市”\n碳交易是全球通用的低碳手段，每个城市有碳排放配额，富余可卖、不足需买，用市场力量倒逼环保。\n【游戏玩法】卖出：配额富余时交易赚盈利，获得更高的低碳总分；\n买入：配额不足时买入碳排放额度可以避免超标惩罚，保住低碳总分。',
          'Carbon Trading Zone: your emission quota marketplace.\nCarbon trading is a global low-carbon mechanism. Every city has an emission quota: sell surplus, buy when short, and use market forces to push greener decisions.\n[Gameplay] Sell: when quota is surplus, trade for profit and gain higher low-carbon score;\nBuy: when quota is insufficient, buy quota to avoid over-limit penalties and protect your low-carbon score.'
        ),
        placement: 'top',
        targetSelectors: ['[data-tutorial-id="trade-button"]']
      },
      {
        id: 'feature.policy',
        title: txt('特色玩法 2：政策卡', 'Feature 2: Policy Cards'),
        body: txt(
          '【科普小知识】深圳作为低碳先锋，出台了红树林保护、低碳产业补贴、市民低碳激励等领先政策。\n【游戏玩法】政策卡可**点击直接生效**（无需部署），用于化解负向事件、提升低碳总分，是平衡发展的“救命符”。',
          '[Knowledge] Shenzhen, as a low-carbon pioneer, has launched leading policies such as mangrove protection, low-carbon industry subsidies, and citizen incentives.\n[Gameplay] Policy cards can **take effect on click** (no deployment needed). They help resolve negative events and boost low-carbon score.'
        ),
        placement: 'left',
        targetSelectors: ['[data-tutorial-role="policy-card"]', '[data-tutorial-id="hand-panel"]']
      },
      {
        id: 'feature.combo',
        title: txt('特色玩法 3：组合技', 'Feature 3: Combo Synergy'),
        body: txt(
          '【科普小知识】真正的低碳城市，不是单靠一个板块，而是工业、生态、科技、民生协同发展。 【游戏玩法】带「low-carbon/shenzhen」标签的卡牌相邻布局可触发组合技，大幅提升低碳总分，体现“平衡发展更环保”的核心逻辑。',
          'A real low-carbon city depends on coordinated industry, ecology, science and society. In-game, adjacent cards with low-carbon/shenzhen tags can trigger combo synergy and significantly increase low-carbon score.'
        ),
        placement: 'right',
        targetSelectors: ['[data-tutorial-id="planning-panel"]']
      },
      {
        id: 'finish',
        title: txt('准备完成，开始规划', 'You are ready to plan'),
        body: txt('你已掌握核心操作。点击“开始规划”进入正式对局。', 'You now know the core flow. Click Start Planning to begin.'),
        placement: 'center'
      }
    ];
    },
    [locale]
  );

  const safeStepIndex = Math.min(Math.max(0, onboardingStep), steps.length - 1);
  const step = steps[safeStepIndex];
  const localeIsZh = locale === 'zh';

  const stepActionCompleted = useMemo(() => {
    if (!step.action) {
      return true;
    }
    if (step.action === 'select_core') {
      return Boolean(selectedCoreId);
    }
    if (step.action === 'place_core') {
      return corePlacedThisTurn;
    }
    if (step.action === 'select_tile') {
      return Boolean(selectedTile);
    }
    if (step.action === 'end_turn') {
      return turn > 1;
    }
    return true;
  }, [step.action, selectedCoreId, selectedTile, corePlacedThisTurn, turn]);

  useEffect(() => {
    function resolveTargetRect() {
      if (!step.targetSelectors || step.targetSelectors.length === 0) {
        setTargetRect(null);
        return;
      }
      const element = step.targetSelectors
        .map((selector) => document.querySelector(selector) as HTMLElement | null)
        .find((node) => node && node.offsetParent !== null);

      if (!element) {
        setTargetRect(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        setTargetRect(null);
        return;
      }
      setTargetRect(rect);
    }

    resolveTargetRect();
    window.addEventListener('resize', resolveTargetRect);
    window.addEventListener('scroll', resolveTargetRect, true);

    return () => {
      window.removeEventListener('resize', resolveTargetRect);
      window.removeEventListener('scroll', resolveTargetRect, true);
    };
  }, [step.id, step.targetSelectors]);

  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) {
      return;
    }
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    if (!targetRect || step.placement === 'center') {
      setTooltipPosition({
        top: viewHeight / 2,
        left: viewWidth / 2,
        transform: 'translate(-50%, -50%)'
      });
      return;
    }

    const margin = 16;
    let top = viewHeight / 2 - tooltipHeight / 2;
    let left = viewWidth / 2 - tooltipWidth / 2;

    if (step.placement === 'top') {
      top = targetRect.top - tooltipHeight - 14;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    } else if (step.placement === 'bottom') {
      top = targetRect.bottom + 14;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    } else if (step.placement === 'left') {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - 14;
    } else if (step.placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + 14;
    }

    setTooltipPosition({
      top: clamp(top, margin, viewHeight - tooltipHeight - margin),
      left: clamp(left, margin, viewWidth - tooltipWidth - margin)
    });
  }, [step.id, step.placement, targetRect]);

  useEffect(() => {
    if (!step.autoAdvance || !stepActionCompleted) {
      return;
    }
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      setOnboardingStep((prev) => Math.min(steps.length - 1, prev + 1));
      autoAdvanceTimerRef.current = null;
    }, 380);
    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [step.id, step.autoAdvance, stepActionCompleted, setOnboardingStep, steps.length]);

  function renderArrow() {
    if (!targetRect || step.placement === 'center') {
      return null;
    }
    const baseClass = 'absolute h-3.5 w-3.5 rotate-45 border-slate-200 bg-white';
    if (step.placement === 'top') {
      return <div className={`${baseClass} -bottom-2 left-1/2 -translate-x-1/2 border-r border-b`} />;
    }
    if (step.placement === 'bottom') {
      return <div className={`${baseClass} -top-2 left-1/2 -translate-x-1/2 border-l border-t`} />;
    }
    if (step.placement === 'left') {
      return <div className={`${baseClass} -right-2 top-1/2 -translate-y-1/2 border-r border-t`} />;
    }
    return <div className={`${baseClass} -left-2 top-1/2 -translate-y-1/2 border-l border-b`} />;
  }

  const canGoNext = stepActionCompleted;
  const isLastStep = safeStepIndex >= steps.length - 1;

  return (
    <div className="fixed inset-0 z-[160] pointer-events-none">
      {targetRect ? (
        <>
          <div className="fixed left-0 top-0 bg-black/45 pointer-events-auto" style={{ width: '100vw', height: Math.max(0, targetRect.top - 10) }} />
          <div className="fixed left-0 bg-black/45 pointer-events-auto" style={{ width: Math.max(0, targetRect.left - 10), top: Math.max(0, targetRect.top - 10), height: targetRect.height + 20 }} />
          <div
            className="fixed right-0 bg-black/45 pointer-events-auto"
            style={{
              left: Math.max(0, targetRect.right + 10),
              top: Math.max(0, targetRect.top - 10),
              height: targetRect.height + 20
            }}
          />
          <div className="fixed left-0 bottom-0 bg-black/45 pointer-events-auto" style={{ width: '100vw', top: Math.max(0, targetRect.bottom + 10) }} />
          <div
            className="pointer-events-none fixed rounded-2xl border-2 border-emerald-300/85 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] transition-all duration-300"
            style={{
              top: Math.max(0, targetRect.top - 6),
              left: Math.max(0, targetRect.left - 6),
              width: targetRect.width + 12,
              height: targetRect.height + 12
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-black/45 pointer-events-auto" />
      )}

      <div
        ref={tooltipRef}
        className="pointer-events-auto fixed z-[170] w-[min(90vw,420px)] animate-in fade-in duration-200"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: tooltipPosition.transform
        }}
      >
        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
          {renderArrow()}
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {t('play.onboarding.progress', 'Quick Start')} {safeStepIndex + 1}/{steps.length}
          </div>
          <h3 className="mt-2 text-base font-black leading-tight text-slate-800 sm:text-lg">{step.title}</h3>
          <div className="mt-2 text-sm leading-6 text-slate-600">{renderRichText(step.body)}</div>

          {step.action && !stepActionCompleted && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              {localeIsZh
                ? '请先完成高亮区域操作，再进入下一步。'
                : 'Complete the highlighted action before continuing.'}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => closeOnboarding(true, false)}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              {t('play.onboarding.skip', 'Skip')}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnboardingStep((prev) => Math.max(0, prev - 1))}
                disabled={safeStepIndex <= 0}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
              >
                {t('play.onboarding.prev', 'Previous')}
              </button>
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  disabled={!canGoNext}
                  className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                >
                  {t('play.onboarding.next', 'Next')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => closeOnboarding(true, false)}
                  className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white"
                >
                  {localeIsZh ? '开始规划' : 'Start Planning'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
