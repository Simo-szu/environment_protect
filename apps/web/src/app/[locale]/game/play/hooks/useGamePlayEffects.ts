'use client';

import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react';
import { GameCardMeta, listCards, startSession } from '@/lib/api/game';

interface TransitionNoticeBase {
  kind: string;
  title: string;
  subtitle: string;
  toneClass: string;
}

interface EndingState {
  endingId: string;
}

interface UseGamePlayEffectsParams {
  t: (key: string, defaultValue?: string, values?: Record<string, unknown>) => string;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setCatalog: Dispatch<SetStateAction<Map<string, GameCardMeta>>>;
  setSessionId: Dispatch<SetStateAction<string>>;
  setPondState: Dispatch<SetStateAction<Record<string, unknown> | null>>;
  setShowOnboarding: Dispatch<SetStateAction<boolean>>;
  setOnboardingStep: Dispatch<SetStateAction<number>>;
  setGuidedTutorialActive: Dispatch<SetStateAction<boolean>>;
  setEnding: Dispatch<SetStateAction<any>>;
  setEndingCountdown: Dispatch<SetStateAction<number>>;
  setTransitionAnimationEnabled: Dispatch<SetStateAction<boolean>>;
  setTransitionNotice: Dispatch<SetStateAction<any>>;
  setLastMessage: Dispatch<SetStateAction<string>>;
  turnTransitionAnimationDefault: boolean;
  ending: EndingState | null;
  endingDisplaySeconds: number;
  endingTimerRef: MutableRefObject<number | null>;
  transitionTimerRef: MutableRefObject<number | null>;
  previousSettlementLengthRef: MutableRefObject<number>;
  settlementHistory: Array<Record<string, unknown>>;
  transitionAnimationEnabled: boolean;
  activeNegativeEvents: Array<Record<string, unknown>>;
  turnTransitionAnimationSeconds: number;
  turn: number;
  guidedTutorialActive: boolean;
  guidedTutorialCompleted: boolean;
  onEndingTimeout: () => void;
  resolveTransitionNotice: (
    settlement: Record<string, unknown> | undefined,
    activeEvents: Array<Record<string, unknown>>
  ) => TransitionNoticeBase;
  getErrorMessage: (error: unknown) => string | null;
  onboardingStorageKey: string;
  animationStorageKey: string;
}

export function useGamePlayEffects(params: UseGamePlayEffectsParams) {
  const {
    t,
    setLoading,
    setError,
    setCatalog,
    setSessionId,
    setPondState,
    setShowOnboarding,
    setOnboardingStep,
    setGuidedTutorialActive,
    setEnding,
    setEndingCountdown,
    setTransitionAnimationEnabled,
    setTransitionNotice,
    setLastMessage,
    turnTransitionAnimationDefault,
    ending,
    endingDisplaySeconds,
    endingTimerRef,
    transitionTimerRef,
    previousSettlementLengthRef,
    settlementHistory,
    transitionAnimationEnabled,
    activeNegativeEvents,
    turnTransitionAnimationSeconds,
    turn,
    guidedTutorialActive,
    guidedTutorialCompleted,
    onEndingTimeout,
    resolveTransitionNotice,
    getErrorMessage,
    onboardingStorageKey,
    animationStorageKey
  } = params;

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [cardsRes, sessionRes] = await Promise.all([listCards(true), startSession()]);
        if (cancelled) {
          return;
        }
        const nextMap = new Map<string, GameCardMeta>();
        cardsRes.items.forEach((card) => nextMap.set(card.cardId, card));
        setCatalog(nextMap);
        setSessionId(sessionRes.id);
        window.sessionStorage.setItem('game:lastSessionId', sessionRes.id);
        setPondState((sessionRes.pondState || {}) as Record<string, unknown>);
        const guideSeen = window.localStorage.getItem(onboardingStorageKey);
        if (!guideSeen) {
          setShowOnboarding(true);
          setOnboardingStep(0);
          setGuidedTutorialActive(true);
        }
        const endingNode = ((sessionRes.pondState as Record<string, unknown>)?.ending || null) as any;
        if (endingNode?.endingId) {
          setEnding(endingNode);
        }
      } catch (e: unknown) {
        setError(getErrorMessage(e) || t('play.errors.initFailed', '初始化游戏失败'));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(animationStorageKey);
    if (stored === null) {
      setTransitionAnimationEnabled(turnTransitionAnimationDefault);
      return;
    }
    setTransitionAnimationEnabled(stored === '1');
  }, [turnTransitionAnimationDefault]);

  useEffect(() => {
    if (!ending) {
      setEndingCountdown(0);
      if (endingTimerRef.current !== null) {
        window.clearInterval(endingTimerRef.current);
        endingTimerRef.current = null;
      }
      return;
    }
    setEndingCountdown(endingDisplaySeconds);
    endingTimerRef.current = window.setInterval(() => {
      setEndingCountdown((current) => {
        if (current <= 1) {
          if (endingTimerRef.current !== null) {
            window.clearInterval(endingTimerRef.current);
            endingTimerRef.current = null;
          }
          onEndingTimeout();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (endingTimerRef.current !== null) {
        window.clearInterval(endingTimerRef.current);
        endingTimerRef.current = null;
      }
    };
  }, [ending, endingDisplaySeconds, onEndingTimeout]);

  useEffect(() => {
    const currentLength = settlementHistory.length;
    if (currentLength <= previousSettlementLengthRef.current) {
      previousSettlementLengthRef.current = currentLength;
      return;
    }
    previousSettlementLengthRef.current = currentLength;
    if (!transitionAnimationEnabled || ending) {
      return;
    }
    const latest = settlementHistory[currentLength - 1];
    const turnValue = Number(latest?.turn ?? turn);
    const notice = resolveTransitionNotice(latest, activeNegativeEvents);
    setTransitionNotice({
      token: Date.now(),
      kind: notice.kind,
      title: notice.title,
      subtitle: notice.subtitle,
      toneClass: notice.toneClass,
      turn: turnValue
    });
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      setTransitionNotice(null);
      transitionTimerRef.current = null;
    }, turnTransitionAnimationSeconds * 1000);
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [settlementHistory, activeNegativeEvents, transitionAnimationEnabled, turnTransitionAnimationSeconds, ending, turn]);

  useEffect(() => {
    if (!guidedTutorialActive || !guidedTutorialCompleted) {
      return;
    }
    setGuidedTutorialActive(false);
    setLastMessage(t('play.guided.completed', '新手引导已完成：你已经掌握一个完整回合。接下来重点关注碳排放、配额与事件化解。'));
  }, [guidedTutorialActive, guidedTutorialCompleted, t]);
}
