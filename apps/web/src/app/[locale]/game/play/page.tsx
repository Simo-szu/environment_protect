'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    Calendar,
    BarChart3,
    Building2,
    Users,
    Lightbulb,
    Leaf,
    Trees,
    Settings,
    HelpCircle,
    TrendingUp,
    Plus,
    Factory,
    FlaskConical,
    Zap,
    Trash2,
    Archive,
    Network,
    Globe,
    ArrowRight,
    ArrowLeft,
    Cloud,
    CloudOff,
    Smile
} from 'lucide-react';

// 卡牌类型定义
interface Card {
    id: string;
    name: string;
    category: 'industry' | 'social' | 'tech' | 'green';
    cost: { industry?: number; population?: number; tech?: number };
    effect: { industry?: number; population?: number; tech?: number; green?: number; satisfaction?: number };
    perTurn?: { industry?: number; carbon?: number };
    cooldown: number;
    description: string;
    imageUrl: string;
}

// 初始卡牌池
const CARD_POOL: Card[] = [
    {
        id: 'traditional-manufacturing',
        name: '传统制造业升级',
        category: 'industry',
        cost: {},
        effect: {},
        perTurn: { industry: 15, carbon: 20 },
        cooldown: 0,
        description: '深圳龙华工厂区试点。每回合 +15 产业值，+20 碳排放。',
        imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'talent-introduction',
        name: '人才引进计划',
        category: 'social',
        cost: { industry: 3 },
        effect: { population: 2 },
        perTurn: { industry: 3 },
        cooldown: 0,
        description: '深圳孔雀计划。+2 市民数，每回合 +3 产业值。',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'community-covenant',
        name: '社区低碳公约',
        category: 'social',
        cost: { population: 2 },
        effect: { satisfaction: 2 },
        perTurn: { carbon: -3 },
        cooldown: 0,
        description: '深圳高桥社区版。+2 满意度，每回合 -3 碳排放。',
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'mangrove-restoration',
        name: '深圳湾红树林修复',
        category: 'green',
        cost: { industry: 4 },
        effect: { green: 12 },
        perTurn: {},
        cooldown: 0,
        description: '+12 绿建度，提升抗灾能力。',
        imageUrl: 'https://images.unsplash.com/photo-1518005052357-e98470471929?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'green-roof',
        name: '天台绿化倡议',
        category: 'green',
        cost: { industry: 5 },
        effect: { green: 8, satisfaction: 2 },
        perTurn: {},
        cooldown: 0,
        description: '+8 绿建度，+2 满意度。降低建筑物能耗。',
        imageUrl: 'https://images.unsplash.com/photo-1518005052357-e98470471929?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'high-tech-industry',
        name: '高新产业集群',
        category: 'industry',
        cost: { industry: 8 },
        effect: { tech: 3 },
        perTurn: { industry: 10, carbon: 5 },
        cooldown: 1,
        description: '华为/腾讯低碳示范。每回合 +10 产业值，+1 科创点，+5 碳排放。',
        imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400'
    }
];

export default function GamePlayPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

    // 游戏状态 - 根据文档调整为15回合制
    const [currentTurn, setCurrentTurn] = useState(1);
    const [carbonEmission, setCarbonEmission] = useState(50);
    const [industryValue, setIndustryValue] = useState(0);
    const [population, setPopulation] = useState(3);
    const [techPoints, setTechPoints] = useState(0);
    const [greenBuilding, setGreenBuilding] = useState(10);
    const [satisfaction, setSatisfaction] = useState(70);

    // 卡牌状态
    const [handCards, setHandCards] = useState<Card[]>([]);
    const [deployedCards, setDeployedCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    const maxTurns = 15; // 根据文档改为15回合
    const carbonTarget = 100; // 根据文档改为100
    const industryTarget = 50;
    const greenTarget = 30;

    const turnProgress = (currentTurn / maxTurns) * 100;
    const carbonProgress = (carbonEmission / 300) * 100;

    // 初始化手牌
    useEffect(() => {
        dealCards();
    }, []);

    // 发牌
    const dealCards = () => {
        const shuffled = [...CARD_POOL].sort(() => Math.random() - 0.5);
        setHandCards(shuffled.slice(0, 4));
    };

    // 部署卡牌
    const deployCard = (card: Card) => {
        // 检查资源
        if (card.cost.industry && industryValue < card.cost.industry) {
            alert('产业值不足！');
            return;
        }
        if (card.cost.population && population < card.cost.population) {
            alert('市民数不足！');
            return;
        }
        if (card.cost.tech && techPoints < card.cost.tech) {
            alert('科创点不足！');
            return;
        }

        // 扣除资源并应用效果
        let newIndustry = industryValue - (card.cost.industry || 0);
        let newPopulation = population - (card.cost.population || 0);
        let newTech = techPoints - (card.cost.tech || 0);
        let newGreen = greenBuilding + (card.effect.green || 0);
        let newSatisfaction = satisfaction + (card.effect.satisfaction || 0);

        if (card.effect.industry) newIndustry += card.effect.industry;
        if (card.effect.population) newPopulation += card.effect.population;
        if (card.effect.tech) newTech += card.effect.tech;

        setIndustryValue(newIndustry);
        setPopulation(newPopulation);
        setTechPoints(newTech);
        setGreenBuilding(newGreen);
        setSatisfaction(Math.max(0, Math.min(100, newSatisfaction)));

        setDeployedCards([...deployedCards, card]);
        setHandCards(handCards.filter(c => c.id !== card.id));
        setSelectedCard(null);
    };

    // 回收卡牌
    const recycleCard = (card: Card) => {
        if (card.category === 'industry') {
            setIndustryValue(industryValue + 2);
            setHandCards(handCards.filter(c => c.id !== card.id));
            setSelectedCard(null);
        }
    };

    // 结束回合
    const endTurn = () => {
        let newIndustry = industryValue;
        let newCarbon = carbonEmission;
        let newSatisfaction = satisfaction;

        // 计算已部署卡牌的持续效果
        deployedCards.forEach(card => {
            if (card.perTurn?.industry) newIndustry += card.perTurn.industry;
            if (card.perTurn?.carbon) newCarbon += card.perTurn.carbon;
        });

        // 绿建度减碳效果（每10点减5碳排放）
        const greenReduction = Math.floor(greenBuilding / 10) * 5;
        newCarbon -= greenReduction;

        // 市民消耗产业值（每人1产业值）
        newIndustry -= population;

        // 更新满意度
        if (newCarbon <= 50) newSatisfaction += 5;
        if (newCarbon > 100) newSatisfaction -= Math.floor((newCarbon - 100) / 10) * 2;
        if (greenBuilding >= 10) newSatisfaction += Math.floor(greenBuilding / 10) * 3;
        if (newIndustry >= population * 5) newSatisfaction += 2;
        if (newIndustry < population * 3) newSatisfaction -= 3;

        newSatisfaction = Math.max(0, Math.min(100, newSatisfaction));

        setIndustryValue(Math.max(0, newIndustry));
        setCarbonEmission(Math.max(0, newCarbon));
        setSatisfaction(newSatisfaction);

        // 检查失败条件
        if (newCarbon >= 300) {
            alert('游戏失败：碳排放失控！');
            router.push(`/${locale}/game`);
            return;
        }

        // 检查游戏结束
        if (currentTurn >= maxTurns) {
            checkGameEnd(newCarbon, newIndustry, greenBuilding);
            return;
        }

        setCurrentTurn(currentTurn + 1);
        dealCards(); // 发放新卡牌
    };

    // 检查游戏结束
    const checkGameEnd = (finalCarbon: number, finalIndustry: number, finalGreen: number) => {
        if (finalCarbon <= carbonTarget && finalIndustry >= industryTarget && finalGreen >= greenTarget) {
            alert(`恭喜！达成优质结局！\n碳排放: ${finalCarbon.toFixed(1)} (目标: ≤${carbonTarget})\n产业值: ${finalIndustry.toFixed(1)} (目标: ≥${industryTarget})\n绿建度: ${finalGreen.toFixed(1)} (目标: ≥${greenTarget})`);
        } else {
            alert(`游戏结束\n碳排放: ${finalCarbon.toFixed(1)} (目标: ≤${carbonTarget})\n产业值: ${finalIndustry.toFixed(1)} (目标: ≥${industryTarget})\n绿建度: ${finalGreen.toFixed(1)} (目标: ≥${greenTarget})`);
        }
        router.push(`/${locale}/game`);
    };

    const handleBack = () => {
        if (confirm('确定要退出游戏吗？当前进度将不会保存。')) {
            router.push(`/${locale}/game`);
        }
    };

    return (
        <div className="bg-[#FAFAF9] h-screen flex flex-col text-slate-600 overflow-hidden font-sans">
            {/* 顶部状态栏 - 缩小高度 */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm relative">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-1.5 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-base font-semibold tracking-tight text-slate-800">
                        <span className="text-[#30499b]">深圳</span>低碳规划师
                        <span className="text-[10px] font-medium text-slate-400 ml-1 px-1.5 py-0.5 bg-slate-100 rounded-md">
                            PROTOTYPE v1.0
                        </span>
                    </h1>
                </div>

                {/* 中央仪表板指标 - 缩小尺寸 */}
                <div className="flex items-center gap-4 flex-1 justify-center max-w-3xl mx-auto">
                    {/* 日期/回合 */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-mono font-medium text-slate-600">
                            {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                        </span>
                    </div>

                    {/* 回合进度 */}
                    <div className="flex flex-col w-36 gap-1">
                        <div className="flex justify-between text-[9px] font-medium text-slate-500">
                            <span>回合: {currentTurn}/{maxTurns}</span>
                            <span>{turnProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                            <div
                                className="h-full bg-[#30499b] rounded-full"
                                style={{ width: `${turnProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 碳排放目标 */}
                    <div className="flex flex-col w-48 gap-1">
                        <div className="flex justify-between text-[9px] font-medium text-slate-500">
                            <span>碳排放: {carbonEmission} Mt</span>
                            <span className="text-[#56b949]">目标: &lt;{carbonTarget}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 relative">
                            <div className="h-full bg-slate-800 w-[60%] absolute left-0 top-0 rounded-l-full"></div>
                            <div className="h-full w-0.5 bg-[#56b949] absolute left-[45%] top-0 z-10"></div>
                            <div className="h-full bg-[#ee4035] w-[15%] absolute left-[45%] top-0 opacity-50"></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors">
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* 主工作区 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 左侧边栏：城市资源 - 进一步缩小 */}
                <aside className="w-48 bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0 z-10">
                    <div className="p-3 border-b border-slate-100">
                        <h2 className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                            <BarChart3 className="w-3 h-3 text-[#30499b]" />
                            城市资源
                        </h2>
                    </div>

                    <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                        {/* 统计：产业值 */}
                        <div className="relative group">
                            <div className="flex items-center gap-1.5 mb-0.5 text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                                <Building2 className="w-3 h-3" /> 产业值
                            </div>
                            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
                                {industryValue.toFixed(0)}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                                目标: ≥ {industryTarget}
                            </div>
                            <div className="mt-3 border-b border-dashed border-slate-200"></div>
                        </div>

                        {/* 统计：市民数 */}
                        <div className="relative group">
                            <div className="flex items-center gap-1.5 mb-0.5 text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                                <Users className="w-3 h-3" /> 市民数
                            </div>
                            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
                                {population.toFixed(1)}<span className="text-sm text-slate-400 ml-0.5">M</span>
                            </div>
                            <div className="text-[10px] font-medium mt-0.5 flex items-center gap-1.5">
                                <Smile className="w-2.5 h-2.5 text-amber-500" />
                                <span className={satisfaction >= 60 ? 'text-green-600' : 'text-red-600'}>
                                    满意度: {satisfaction}%
                                </span>
                            </div>
                            <div className="mt-3 border-b border-dashed border-slate-200"></div>
                        </div>

                        {/* 统计：科创点 */}
                        <div className="relative group">
                            <div className="flex items-center gap-1.5 mb-0.5 text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                                <Lightbulb className="w-3 h-3" /> 科创点
                            </div>
                            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
                                {techPoints}
                            </div>
                            <div className="text-[10px] font-medium text-[#30499b] mt-0.5">
                                解锁高端技术
                            </div>
                            <div className="mt-3 border-b border-dashed border-slate-200"></div>
                        </div>

                        {/* 统计：绿建度 */}
                        <div className="relative group">
                            <div className="flex items-center gap-1.5 mb-0.5 text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                                <Leaf className="w-3 h-3" /> 绿建度
                            </div>
                            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
                                {greenBuilding.toFixed(1)}<span className="text-sm text-slate-400 ml-0.5">%</span>
                            </div>
                            <div className="text-[10px] font-medium text-[#56b949] mt-0.5">
                                目标: ≥ {greenTarget}%
                            </div>
                        </div>
                    </div>

                    <div className="p-3 border-t border-slate-100">
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-2.5 border border-slate-200">
                            <h3 className="text-[10px] font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3" />
                                胜利目标
                            </h3>
                            <div className="space-y-1.5 text-[10px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">碳排放</span>
                                    <span className={carbonEmission <= carbonTarget ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                        {carbonEmission.toFixed(1)} / ≤{carbonTarget}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">产业值</span>
                                    <span className={industryValue >= industryTarget ? 'text-green-600 font-semibold' : 'text-slate-600'}>
                                        {industryValue.toFixed(0)} / ≥{industryTarget}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">绿建度</span>
                                    <span className={greenBuilding >= greenTarget ? 'text-green-600 font-semibold' : 'text-slate-600'}>
                                        {greenBuilding.toFixed(1)} / ≥{greenTarget}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* 中心：游戏板块（4个区域） */}
                <main className="flex-1 bg-slate-50/50 p-4 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full max-w-5xl mx-auto">
                        {/* 区域：工业 */}
                        <SectorCard
                            title="工业"
                            sectorId="01"
                            color="slate-800"
                            imageUrl="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&q=80&w=800"
                            emission={20}
                            emissionType="positive"
                            hasBuilding={true}
                            buildingIcon={<Factory className="w-8 h-8 text-slate-700 mb-2" />}
                            buildingName="芯片厂"
                        />

                        {/* 区域：生态系统 */}
                        <SectorCard
                            title="生态系统"
                            sectorId="02"
                            color="#56b949"
                            imageUrl="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
                            emission={-5}
                            emissionType="negative"
                        />

                        {/* 区域：科学 */}
                        <SectorCard
                            title="科学"
                            sectorId="03"
                            color="#30499b"
                            imageUrl="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=800"
                            emission={20}
                            emissionType="positive"
                            hasBuilding={true}
                            buildingIcon={<FlaskConical className="w-8 h-8 text-[#30499b] mb-2" />}
                            buildingName="研究所"
                            buildingColor="#f0a32f"
                        />

                        {/* 区域：人与社会 */}
                        <SectorCard
                            title="人与社会"
                            sectorId="04"
                            color="#f0a32f"
                            imageUrl="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
                            emission={0}
                            emissionType="neutral"
                        />
                    </div>
                </main>

                {/* 右侧边栏：策略卡牌 */}
                <aside className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-slate-800">策略卡牌手卡</h2>
                        <span className="text-[10px] text-slate-500">{handCards.length} 张</span>
                    </div>

                    <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-slate-50/30">
                        {handCards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                                className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${selectedCard?.id === card.id ? 'border-[#30499b] ring-2 ring-[#30499b]/20' : 'border-slate-200 hover:border-[#30499b]/50'
                                    }`}
                            >
                                <div className="h-0.5 w-full" style={{
                                    backgroundColor: card.category === 'industry' ? '#30499b' :
                                        card.category === 'social' ? '#f0a32f' :
                                            card.category === 'tech' ? '#00C087' : '#56b949'
                                }}></div>
                                <div className="p-2">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="text-[9px] font-semibold px-1 py-0.5 rounded" style={{
                                            color: card.category === 'industry' ? '#30499b' :
                                                card.category === 'social' ? '#f0a32f' :
                                                    card.category === 'tech' ? '#00C087' : '#56b949',
                                            backgroundColor: card.category === 'industry' ? '#30499b1a' :
                                                card.category === 'social' ? '#f0a32f1a' :
                                                    card.category === 'tech' ? '#00C0871a' : '#56b9491a'
                                        }}>
                                            {card.category === 'industry' ? '产业类' :
                                                card.category === 'social' ? '社会类' :
                                                    card.category === 'tech' ? '科创类' : '绿建类'}
                                        </span>
                                        {Object.keys(card.cost).length > 0 && (
                                            <div className="flex items-center gap-0.5 text-[10px] text-slate-600">
                                                {card.cost.industry && <span>💰{card.cost.industry}</span>}
                                                {card.cost.population && <span>👥{card.cost.population}</span>}
                                                {card.cost.tech && <span>💡{card.cost.tech}</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="aspect-video bg-slate-100 rounded-md mb-2 overflow-hidden">
                                        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="text-xs font-semibold text-slate-800 mb-0.5">{card.name}</h4>
                                    <p className="text-[9px] text-slate-500 leading-relaxed line-clamp-2">{card.description}</p>

                                    {selectedCard?.id === card.id && (
                                        <div className="mt-2 flex gap-1.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deployCard(card);
                                                }}
                                                className="flex-1 px-2 py-1.5 bg-[#30499b] text-white text-[10px] font-semibold rounded-md hover:bg-[#2a4086] transition-colors"
                                            >
                                                部署
                                            </button>
                                            {card.category === 'industry' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        recycleCard(card);
                                                    }}
                                                    className="px-2 py-1.5 bg-amber-500 text-white text-[10px] font-semibold rounded-md hover:bg-amber-600 transition-colors flex items-center gap-0.5"
                                                >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                    回收
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {handCards.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-xs">暂无卡牌</p>
                                <p className="text-[10px] mt-0.5">点击"下一回合"获取新卡牌</p>
                            </div>
                        )}

                        {/* 已部署卡牌提示 */}
                        {deployedCards.length > 0 && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <div className="text-[10px] font-semibold text-green-800 mb-0.5">已部署 {deployedCards.length} 张卡牌</div>
                                <div className="text-[9px] text-green-600">持续效果将在回合结算时生效</div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* 底部操作栏 - 缩小高度 */}
            <footer className="h-14 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between px-4 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/${locale}/game/archive`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 hover:border-slate-400 transition-all"
                    >
                        <Archive className="w-3 h-3" />
                        规划档案
                    </button>
                    <button
                        onClick={() => router.push(`/${locale}/game/tech-tree`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 hover:border-slate-400 transition-all"
                    >
                        <Network className="w-3 h-3" />
                        科技树
                    </button>
                    <button
                        onClick={() => router.push(`/${locale}/game/leaderboard`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 hover:border-slate-400 transition-all"
                    >
                        <Globe className="w-3 h-3" />
                        世界排名
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            Next Turn Cost
                        </div>
                        <div className="text-[10px] font-medium text-slate-600">1,200 产业值</div>
                    </div>
                    <button
                        onClick={endTurn}
                        className="group bg-slate-900 hover:bg-[#30499b] text-white pl-4 pr-3 py-2 rounded-lg shadow-lg shadow-slate-900/10 flex items-center gap-2 transition-all duration-300 transform active:scale-95"
                    >
                        <span className="font-bold tracking-wide text-sm">下一回合</span>
                        <div className="bg-white/10 rounded-md p-0.5 group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </footer>
        </div>
    );
}

// 区域卡片组件
function SectorCard({
    title,
    sectorId,
    color,
    imageUrl,
    emission,
    emissionType,
    hasBuilding = false,
    buildingIcon,
    buildingName,
    buildingColor = '#30499b'
}: {
    title: string;
    sectorId: string;
    color: string;
    imageUrl: string;
    emission: number;
    emissionType: 'positive' | 'negative' | 'neutral';
    hasBuilding?: boolean;
    buildingIcon?: React.ReactNode;
    buildingName?: string;
    buildingColor?: string;
}) {
    const emissionProgress = emissionType === 'positive' ? 70 : emissionType === 'negative' ? 10 : 10;
    const emissionColor = emissionType === 'positive' ? '#ee4035' : 'white';

    return (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                    {title}
                </h3>
                <span className="text-[9px] font-mono text-slate-400">SECTOR-{sectorId}</span>
            </div>

            <div className="bg-slate-100 rounded-lg h-28 w-full mb-2 overflow-hidden relative group">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
                <div
                    className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t to-transparent flex items-end p-2"
                    style={{ backgroundColor: `${color}cc` }}
                >
                    <div className="flex items-center gap-2 text-white text-[10px] w-full">
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{ backgroundColor: emissionColor, width: `${emissionProgress}%` }}
                            ></div>
                        </div>
                        <span className="font-mono flex items-center gap-0.5">
                            {emissionType === 'negative' ? <CloudOff className="w-2.5 h-2.5" /> : <Cloud className="w-2.5 h-2.5" />}
                            {emission > 0 ? '+' : ''}{emission}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 flex-1">
                {hasBuilding ? (
                    <>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col items-center justify-center p-1.5 relative overflow-hidden group">
                            <div
                                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: buildingColor }}
                            ></div>
                            <div className="scale-75">{buildingIcon}</div>
                            <span className="text-[9px] text-slate-500 font-medium">{buildingName}</span>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-4 h-4 text-slate-300" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-4 h-4 text-slate-300" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// 策略卡片组件
function StrategyCard({
    type,
    typeColor,
    cost,
    imageUrl,
    title,
    description
}: {
    type: string;
    typeColor: string;
    cost: number;
    imageUrl: string;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#30499b]/50 transition-all cursor-pointer group relative overflow-hidden">
            <div className="h-1 w-full" style={{ backgroundColor: typeColor }}></div>
            <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                    <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ color: typeColor, backgroundColor: `${typeColor}1a` }}
                    >
                        {type}
                    </span>
                    <div className="flex items-center text-[#f0a32f]">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold ml-0.5">{cost}</span>
                    </div>
                </div>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
