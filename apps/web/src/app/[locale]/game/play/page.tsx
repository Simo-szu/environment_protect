'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    Calendar,
    Users,
    Lightbulb,
    Leaf,
    Factory,
    TrendingUp,
    ArrowLeft,
    Cloud,
    Smile,
    AlertTriangle,
    RotateCcw,
    Archive,
    HelpCircle
} from 'lucide-react';

// 卡牌类型定义
interface Card {
    id: string;
    name: string;
    category: 'industry' | 'social' | 'tech' | 'green';
    cost: {
        industry?: number;
        population?: number;
        tech?: number;
    };
    effect: {
        industry?: number;
        population?: number;
        tech?: number;
        green?: number;
        satisfaction?: number;
        carbon?: number;
    };
    perTurn?: {
        industry?: number;
        carbon?: number;
    };
    cooldown: number;
    unlocked: boolean;
    description: string;
}

// 初始卡牌数据
const INITIAL_CARDS: Card[] = [
    {
        id: 'traditional-manufacturing',
        name: '传统制造业',
        category: 'industry',
        cost: {},
        effect: {},
        perTurn: { industry: 15, carbon: 20 },
        cooldown: 0,
        unlocked: true,
        description: '深圳龙华工厂版 - 快速积累产业值'
    },
    {
        id: 'talent-introduction',
        name: '人才引进',
        category: 'social',
        cost: { industry: 3 },
        effect: { population: 2 },
        perTurn: { industry: 3 },
        cooldown: 0,
        unlocked: true,
        description: '深圳孔雀计划 - 增加市民数'
    },
    {
        id: 'community-covenant',
        name: '社区低碳公约',
        category: 'social',
        cost: { population: 2 },
        effect: { satisfaction: 2 },
        perTurn: { carbon: -3 },
        cooldown: 0,
        unlocked: true,
        description: '深圳高桥社区版 - 基础减碳'
    },
    {
        id: 'mangrove-restoration',
        name: '深圳湾红树林修复',
        category: 'green',
        cost: { industry: 4 },
        effect: { green: 12 },
        perTurn: {},
        cooldown: 0,
        unlocked: true,
        description: '提升绿建度和抗灾能力'
    }
];

export default function GamePlayPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

    // 游戏状态
    const [currentTurn, setCurrentTurn] = useState(1);
    const [resources, setResources] = useState({
        industry: 0,
        population: 3,
        tech: 0,
        green: 10,
        satisfaction: 70,
        carbon: 50
    });

    // 卡牌状态
    const [handCards, setHandCards] = useState<Card[]>([]);
    const [deployedCards, setDeployedCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    // 游戏常量
    const MAX_TURNS = 15;
    const CARBON_TARGET = 100;
    const INDUSTRY_TARGET = 50;
    const GREEN_TARGET = 30;

    // 初始化手牌
    useEffect(() => {
        setHandCards(INITIAL_CARDS.slice(0, 4));
    }, []);

    // 计算进度
    const turnProgress = (currentTurn / MAX_TURNS) * 100;
    const carbonProgress = Math.min((resources.carbon / 300) * 100, 100);
    const carbonStatus = resources.carbon <= CARBON_TARGET ? 'safe' : resources.carbon <= 200 ? 'warning' : 'danger';

    // 部署卡牌
    const deployCard = (card: Card) => {
        // 检查资源是否足够
        if (card.cost.industry && resources.industry < card.cost.industry) return;
        if (card.cost.population && resources.population < card.cost.population) return;
        if (card.cost.tech && resources.tech < card.cost.tech) return;

        // 扣除资源
        const newResources = { ...resources };
        if (card.cost.industry) newResources.industry -= card.cost.industry;
        if (card.cost.population) newResources.population -= card.cost.population;
        if (card.cost.tech) newResources.tech -= card.cost.tech;

        // 应用即时效果
        if (card.effect.industry) newResources.industry += card.effect.industry;
        if (card.effect.population) newResources.population += card.effect.population;
        if (card.effect.tech) newResources.tech += card.effect.tech;
        if (card.effect.green) newResources.green += card.effect.green;
        if (card.effect.satisfaction) newResources.satisfaction += card.effect.satisfaction;
        if (card.effect.carbon) newResources.carbon += card.effect.carbon;

        setResources(newResources);
        setDeployedCards([...deployedCards, card]);
        setHandCards(handCards.filter(c => c.id !== card.id));
        setSelectedCard(null);
    };

    // 回收卡牌
    const recycleCard = (card: Card) => {
        if (card.category === 'industry') {
            setResources({ ...resources, industry: resources.industry + 2 });
            setHandCards(handCards.filter(c => c.id !== card.id));
        }
    };

    // 结束回合
    const endTurn = () => {
        const newResources = { ...resources };

        // 计算持续效果
        deployedCards.forEach(card => {
            if (card.perTurn?.industry) newResources.industry += card.perTurn.industry;
            if (card.perTurn?.carbon) newResources.carbon += card.perTurn.carbon;
        });

        // 绿建度减碳效果
        const greenReduction = Math.floor(newResources.green / 10) * 5;
        newResources.carbon -= greenReduction;

        // 市民消耗产业值
        newResources.industry -= newResources.population;

        // 更新满意度
        if (newResources.carbon <= 50) newResources.satisfaction += 5;
        if (newResources.carbon > 100) newResources.satisfaction -= Math.floor((newResources.carbon - 100) / 10) * 2;
        if (newResources.green >= 10) newResources.satisfaction += Math.floor(newResources.green / 10) * 3;

        newResources.satisfaction = Math.max(0, Math.min(100, newResources.satisfaction));

        setResources(newResources);
        setCurrentTurn(currentTurn + 1);

        // 发放新卡牌（简化版）
        const newCards = INITIAL_CARDS.filter(() => Math.random() > 0.5).slice(0, 3);
        setHandCards(newCards);

        // 检查游戏结束
        if (currentTurn >= MAX_TURNS) {
            checkGameEnd(newResources);
        }
    };

    // 检查游戏结束
    const checkGameEnd = (finalResources: typeof resources) => {
        if (finalResources.carbon <= CARBON_TARGET &&
            finalResources.industry >= INDUSTRY_TARGET &&
            finalResources.green >= GREEN_TARGET) {
            alert('恭喜！达成优质结局！');
        } else if (finalResources.carbon >= 300) {
            alert('游戏失败：碳排放失控');
        } else {
            alert('游戏结束');
        }
    };

    const handleBack = () => {
        router.push(`/${locale}/game`);
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex flex-col text-slate-600 overflow-hidden font-sans">
            {/* 顶部状态栏 */}
            <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                        <span className="text-[#30499b]">深圳</span>低碳规划师
                    </h1>
                </div>

                {/* 回合进度 */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">第 {currentTurn} / {MAX_TURNS} 回合</span>
                    </div>
                    <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#30499b] transition-all duration-500"
                            style={{ width: `${turnProgress}%` }}
                        />
                    </div>
                </div>

                {/* 碳排放指标 */}
                <div className="flex items-center gap-3">
                    <Cloud className={`w-5 h-5 ${carbonStatus === 'safe' ? 'text-green-500' : carbonStatus === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">碳排放</span>
                        <span className={`text-sm font-bold ${carbonStatus === 'safe' ? 'text-green-600' : carbonStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {resources.carbon} Mt
                        </span>
                    </div>
                    <div className="text-xs text-slate-400">目标: &lt; {CARBON_TARGET}</div>
                </div>
            </header>

            {/* 主游戏区域 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 左侧资源面板 */}
                <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 p-4 overflow-y-auto">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        城市资源
                    </h2>
                    <div className="space-y-3">
                        {/* 产业值 */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Factory className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-medium text-blue-900">产业值</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{resources.industry}</span>
                            </div>
                            <div className="text-[10px] text-blue-700">核心货币资源</div>
                        </div>

                        {/* 市民数 */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-medium text-purple-900">市民数</span>
                                </div>
                                <span className="text-lg font-bold text-purple-600">{resources.population}M</span>
                            </div>
                            <div className="text-[10px] text-purple-700">解锁社会类卡牌</div>
                        </div>

                        {/* 科创点 */}
                        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 rounded-lg border border-cyan-200">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-cyan-600" />
                                    <span className="text-xs font-medium text-cyan-900">科创点</span>
                                </div>
                                <span className="text-lg font-bold text-cyan-600">{resources.tech}</span>
                            </div>
                            <div className="text-[10px] text-cyan-700">解锁高端技术</div>
                        </div>

                        {/* 绿建度 */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-medium text-green-900">绿建度</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">{resources.green.toFixed(1)}</span>
                            </div>
                            <div className="text-[10px] text-green-700">每10点减5碳排放</div>
                        </div>

                        {/* 市民满意度 */}
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Smile className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs font-medium text-amber-900">市民满意度</span>
                                </div>
                                <span className="text-lg font-bold text-amber-600">{resources.satisfaction}</span>
                            </div>
                            <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-500"
                                    style={{ width: `${resources.satisfaction}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 目标提示 */}
                    <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-xs font-semibold text-slate-700 mb-2">胜利目标</h3>
                        <div className="space-y-1 text-[10px] text-slate-600">
                            <div className="flex justify-between">
                                <span>碳排放</span>
                                <span className={resources.carbon <= CARBON_TARGET ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                    ≤ {CARBON_TARGET}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>产业值</span>
                                <span className={resources.industry >= INDUSTRY_TARGET ? 'text-green-600 font-semibold' : 'text-slate-600'}>
                                    ≥ {INDUSTRY_TARGET}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>绿建度</span>
                                <span className={resources.green >= GREEN_TARGET ? 'text-green-600 font-semibold' : 'text-slate-600'}>
                                    ≥ {GREEN_TARGET}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* 中间游戏区域 */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* 深圳地图可视化区 */}
                    <div className="flex-1 relative bg-gradient-to-br from-blue-100 to-green-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🏙️</div>
                                <h3 className="text-2xl font-bold text-slate-700 mb-2">深圳市</h3>
                                <p className="text-sm text-slate-600">绿建度: {resources.green.toFixed(1)}%</p>
                                <div className="mt-4 flex gap-4 justify-center">
                                    <div className="text-center">
                                        <div className="text-3xl">🌳</div>
                                        <div className="text-xs text-slate-600 mt-1">生态保护</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl">🏭</div>
                                        <div className="text-xs text-slate-600 mt-1">产业发展</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl">💡</div>
                                        <div className="text-xs text-slate-600 mt-1">科技创新</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 碳排放警示 */}
                        {carbonStatus === 'danger' && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-semibold">碳排放严重超标！</span>
                            </div>
                        )}
                    </div>

                    {/* 底部操作栏 */}
                    <div className="h-16 bg-white/90 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between px-6">
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
                                <Archive className="w-4 h-4" />
                                规划档案
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                帮助
                            </button>
                        </div>

                        <button
                            onClick={endTurn}
                            className="px-6 py-2.5 bg-gradient-to-r from-[#30499b] to-[#4a6bc7] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                            下一回合
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </main>

                {/* 右侧卡牌区 */}
                <aside className="w-80 bg-white/80 backdrop-blur-sm border-l border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-200">
                        <h2 className="text-sm font-semibold text-slate-700">策略卡牌</h2>
                        <p className="text-xs text-slate-500 mt-1">点击卡牌查看详情并部署</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {handCards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => setSelectedCard(card)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedCard?.id === card.id
                                        ? 'border-[#30499b] bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-slate-800">{card.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${card.category === 'industry' ? 'bg-blue-100 text-blue-700' :
                                            card.category === 'social' ? 'bg-purple-100 text-purple-700' :
                                                card.category === 'tech' ? 'bg-cyan-100 text-cyan-700' :
                                                    'bg-green-100 text-green-700'
                                        }`}>
                                        {card.category === 'industry' ? '产业' :
                                            card.category === 'social' ? '社会' :
                                                card.category === 'tech' ? '科创' : '绿建'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{card.description}</p>

                                {/* 消耗 */}
                                {Object.keys(card.cost).length > 0 && (
                                    <div className="text-xs text-slate-500 mb-1">
                                        消耗: {Object.entries(card.cost).map(([key, value]) => `${key}:${value}`).join(', ')}
                                    </div>
                                )}

                                {/* 效果 */}
                                {card.perTurn && (
                                    <div className="text-xs text-green-600">
                                        每回合: {Object.entries(card.perTurn).map(([key, value]) => `${key}:${value > 0 ? '+' : ''}${value}`).join(', ')}
                                    </div>
                                )}

                                {selectedCard?.id === card.id && (
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deployCard(card);
                                            }}
                                            className="flex-1 px-3 py-1.5 bg-[#30499b] text-white text-xs font-semibold rounded hover:bg-[#2a4086] transition-colors"
                                        >
                                            部署
                                        </button>
                                        {card.category === 'industry' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    recycleCard(card);
                                                }}
                                                className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600 transition-colors"
                                            >
                                                回收
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {handCards.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">暂无卡牌</p>
                                <p className="text-xs mt-1">点击"下一回合"获取新卡牌</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
