'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  endSession,
  GameActionResponse,
  GameCardMeta,
  getSessionById,
  listCards,
  performAction,
  startSession
} from '@/lib/api/game';

type PondState = Record<string, any>;

interface EndingView {
  endingId: string;
  endingName: string;
  imageKey: string;
  reason: string;
  turn: number;
}

const DEFAULT_STORAGE_BASE = process.env.NEXT_PUBLIC_MINIO_PUBLIC_BASE_URL || 'http://127.0.0.1:9000/youthloop';

export default function GamePlayPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'zh';

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string>('');
  const [pondState, setPondState] = useState<PondState | null>(null);
  const [catalog, setCatalog] = useState<Map<string, GameCardMeta>>(new Map());
  const [selectedCoreId, setSelectedCoreId] = useState<string>('');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [ending, setEnding] = useState<EndingView | null>(null);
  const [lastMessage, setLastMessage] = useState<string>('');

  const metrics = pondState?.metrics || {};
  const resources = pondState?.resources || {};
  const handCore: string[] = pondState?.handCore || [];
  const handPolicy: string[] = pondState?.handPolicy || [];
  const placedCore: string[] = pondState?.placedCore || [];
  const turn = pondState?.turn || 1;
  const maxTurn = pondState?.maxTurn || 30;

  const handCoreCards = useMemo(
    () => handCore.map(id => catalog.get(id)).filter(Boolean) as GameCardMeta[],
    [handCore, catalog]
  );
  const handPolicyCards = useMemo(
    () => handPolicy.map(id => catalog.get(id)).filter(Boolean) as GameCardMeta[],
    [handPolicy, catalog]
  );

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
        cardsRes.items.forEach(card => nextMap.set(card.cardId, card));
        setCatalog(nextMap);
        setSessionId(sessionRes.id);
        setPondState((sessionRes.pondState || {}) as PondState);
        const endingState = ((sessionRes.pondState as PondState)?.ending || null) as EndingView | null;
        if (endingState && endingState.endingId) {
          setEnding(endingState);
        }
      } catch (e: any) {
        setError(e?.message || '加载游戏失败');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  function resolveImageUrl(imageKey?: string | null): string {
    if (!imageKey) {
      return '';
    }
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey;
    }
    return `${DEFAULT_STORAGE_BASE}/${imageKey}`;
  }

  async function runAction(actionType: number, actionData?: Record<string, unknown>) {
    if (!sessionId) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const response: GameActionResponse = await performAction({
        sessionId,
        actionType,
        actionData
      });
      const nextState = (response.newPondState || {}) as PondState;
      setPondState(nextState);
      setLastMessage(response.message || '');
      setSelectedCoreId('');
      setSelectedPolicyId('');

      const endingState = (nextState.ending || null) as EndingView | null;
      if (endingState?.endingId) {
        setEnding(endingState);
        return;
      }
      if (response.sessionEnded && response.endingId) {
        setEnding({
          endingId: response.endingId,
          endingName: response.endingName || response.endingId,
          imageKey: response.endingImageKey || '',
          reason: response.message || '',
          turn: nextState.turn || turn
        });
      }
    } catch (e: any) {
      setError(e?.message || '操作失败');
    } finally {
      setActionLoading(false);
    }
  }

  async function refreshSession() {
    if (!sessionId) {
      return;
    }
    try {
      const current = await getSessionById(sessionId);
      setSessionId(current.id);
      setPondState((current.pondState || {}) as PondState);
    } catch (e: any) {
      setError(e?.message || '刷新会话失败');
    }
  }

  async function handleBack() {
    if (!sessionId) {
      router.push(`/${locale}/game`);
      return;
    }
    try {
      await endSession(sessionId);
    } catch {
      // ignore on exit
    } finally {
      router.push(`/${locale}/game`);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">正在加载游戏...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            返回
          </button>
          <div className="font-semibold">低碳城市卡牌</div>
          <div className="text-xs text-slate-500">回合 {turn}/{maxTurn}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshSession} className="px-3 py-1.5 rounded border border-slate-300 text-sm">
            刷新
          </button>
          <button
            onClick={() => runAction(2)}
            disabled={actionLoading || !!ending}
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm disabled:opacity-50"
          >
            结束回合
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-4">
        <section className="col-span-3 bg-white rounded border p-4 space-y-2">
          <div className="font-semibold">资源</div>
          <div className="text-sm">产业值: {resources.industry ?? 0}</div>
          <div className="text-sm">科创点: {resources.tech ?? 0}</div>
          <div className="text-sm">人口: {resources.population ?? 0}</div>
          <div className="pt-3 font-semibold">指标</div>
          <div className="text-sm">绿建度: {metrics.green ?? 0}</div>
          <div className="text-sm">碳排放: {metrics.carbon ?? 0}</div>
          <div className="text-sm">满意度: {metrics.satisfaction ?? 0}</div>
          <div className="text-sm">低碳总分: {metrics.lowCarbonScore ?? 0}</div>
          <div className="pt-2 text-xs text-slate-500">已放置核心卡: {placedCore.length}</div>
        </section>

        <section className="col-span-6 bg-white rounded border p-4">
          <div className="font-semibold mb-3">核心手牌</div>
          <div className="grid grid-cols-3 gap-3">
            {handCoreCards.map(card => (
              <button
                key={card.cardId}
                onClick={() => setSelectedCoreId(card.cardId)}
                className={`text-left border rounded p-2 ${selectedCoreId === card.cardId ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
              >
                <img src={resolveImageUrl(card.imageKey)} alt={card.chineseName} className="w-full h-40 object-cover rounded mb-2" />
                <div className="text-sm font-medium">{card.chineseName}</div>
                <div className="text-xs text-slate-500">{card.cardId}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => selectedCoreId && runAction(1, { cardId: selectedCoreId })}
              disabled={actionLoading || !selectedCoreId || !!ending}
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
            >
              放置核心卡
            </button>
          </div>
        </section>

        <section className="col-span-3 bg-white rounded border p-4">
          <div className="font-semibold mb-3">政策手牌</div>
          <div className="space-y-2">
            {handPolicyCards.map(card => (
              <button
                key={card.cardId}
                onClick={() => setSelectedPolicyId(card.cardId)}
                className={`w-full text-left border rounded p-2 ${selectedPolicyId === card.cardId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
              >
                <div className="text-sm font-medium">{card.chineseName}</div>
                <div className="text-xs text-slate-500">{card.cardId}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => selectedPolicyId && runAction(3, { cardId: selectedPolicyId })}
            disabled={actionLoading || !selectedPolicyId || !!ending}
            className="mt-3 px-3 py-1.5 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
          >
            使用政策卡
          </button>
        </section>
      </main>

      {(error || lastMessage) && (
        <div className="px-6 pb-6 text-sm">
          {error && <div className="text-red-600">{error}</div>}
          {lastMessage && <div className="text-slate-600 mt-1">{lastMessage}</div>}
        </div>
      )}

      {ending && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-white rounded-xl border overflow-hidden">
            {ending.imageKey && (
              <img src={resolveImageUrl(ending.imageKey)} alt={ending.endingName} className="w-full h-72 object-cover" />
            )}
            <div className="p-5 space-y-2">
              <div className="text-xl font-semibold">{ending.endingName}</div>
              <div className="text-sm text-slate-600">{ending.reason}</div>
              <div className="text-xs text-slate-500">达成回合: {ending.turn}</div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
                >
                  重新开始
                </button>
                <button
                  onClick={() => router.push(`/${locale}/game`)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-sm"
                >
                  返回游戏主页
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
