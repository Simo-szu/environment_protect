'use client';

import { useState } from 'react';
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
    CloudOff
} from 'lucide-react';

export default function GamePlayPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

    const [currentTurn, setCurrentTurn] = useState(12);
    const [carbonEmission, setCarbonEmission] = useState(420);
    const [industryValue, setIndustryValue] = useState(12450);
    const [population, setPopulation] = useState(17.6);
    const [techPoints, setTechPoints] = useState(890);
    const [greenBuilding, setGreenBuilding] = useState(45.2);

    const maxTurns = 50;
    const carbonTarget = 300;
    const turnProgress = (currentTurn / maxTurns) * 100;
    const carbonProgress = (carbonEmission / 700) * 100;

    const handleBack = () => {
        router.push(`/${locale}/game`);
    };

    return (
        <div className="bg-[#FAFAF9] h-screen flex flex-col text-slate-600 overflow-hidden font-sans">
            {/* 顶部状态栏 */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                        <span className="text-[#30499b]">深圳</span>低碳规划师
                        <span className="text-xs font-medium text-slate-400 ml-1 px-2 py-0.5 bg-slate-100 rounded-md">
                            PROTOTYPE v1.0
                        </span>
                    </h1>
                </div>

                {/* 中央仪表板指标 */}
                <div className="flex items-center gap-8 flex-1 justify-center max-w-4xl mx-auto">
                    {/* 日期/回合 */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-mono font-medium text-slate-600">
                            {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                        </span>
                    </div>

                    {/* 回合进度 */}
                    <div className="flex flex-col w-48 gap-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-slate-500">
                            <span>当前回合: {currentTurn} / {maxTurns}</span>
                            <span>进度: {turnProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                            <div
                                className="h-full bg-[#30499b] rounded-full shadow-[0_0_10px_rgba(48,73,155,0.3)]"
                                style={{ width: `${turnProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 碳排放目标 */}
                    <div className="flex flex-col w-64 gap-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-slate-500">
                            <span>当前碳排放量: {carbonEmission} Mt</span>
                            <span className="text-[#56b949]">目标: &lt; {carbonTarget} Mt</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100 relative">
                            <div className="h-full bg-slate-800 w-[60%] absolute left-0 top-0 rounded-l-full"></div>
                            <div className="h-full w-0.5 bg-[#56b949] absolute left-[45%] top-0 z-10 shadow-[0_0_5px_#56b949]"></div>
                            <div className="h-full bg-[#ee4035] w-[15%] absolute left-[45%] top-0 opacity-50"></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* 主工作区 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 左侧边栏：城市资源 */}
                <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0 z-10">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#30499b]" />
                            城市资源状态
                        </h2>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* 统计：产业值 */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-medium uppercase tracking-wider">
                                <Building2 className="w-3.5 h-3.5" /> 产业值
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight font-sans">
                                {industryValue.toLocaleString()}
                            </div>
                            <div className="text-xs font-medium text-[#56b949] mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +120/回合
                            </div>
                            <div className="mt-6 border-b border-dashed border-slate-200"></div>
                        </div>

                        {/* 统计：市民数 */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-medium uppercase tracking-wider">
                                <Users className="w-3.5 h-3.5" /> 市民数
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight font-sans">
                                {population}<span className="text-lg text-slate-400 ml-1">M</span>
                            </div>
                            <div className="text-xs font-medium text-[#ee4035] mt-1 flex items-center gap-1">
                                满意度: 78% <span className="text-slate-300 mx-1">|</span> <span className="text-slate-400">稳定</span>
                            </div>
                            <div className="mt-6 border-b border-dashed border-slate-200"></div>
                        </div>

                        {/* 统计：科创点 */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-medium uppercase tracking-wider">
                                <Lightbulb className="w-3.5 h-3.5" /> 科创点
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight font-sans">
                                {techPoints}
                            </div>
                            <div className="text-xs font-medium text-[#30499b] mt-1 cursor-pointer hover:underline">
                                可解锁新政策
                            </div>
                            <div className="mt-6 border-b border-dashed border-slate-200"></div>
                        </div>

                        {/* 统计：绿建度 */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-medium uppercase tracking-wider">
                                <Leaf className="w-3.5 h-3.5" /> 绿建度
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight font-sans">
                                {greenBuilding}<span className="text-lg text-slate-400 ml-1">%</span>
                            </div>
                            <div className="text-xs font-medium text-[#56b949] mt-1">低碳指标: 优</div>
                            <div className="mt-6 border-b border-dashed border-slate-200"></div>
                        </div>
                    </div>

                    <div className="mt-auto p-6">
                        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="w-8 h-8 rounded-full bg-[#f0a32f]/10 flex items-center justify-center mb-1 group-hover:bg-[#f0a32f]/20 transition-colors">
                                <Trees className="w-4 h-4 text-[#f0a32f]" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">溢伐森林</span>
                            <span className="text-[10px] text-slate-400">特殊生态区域 (已解锁)</span>
                        </div>
                    </div>
                </aside>

                {/* 中心：游戏板块（4个区域） */}
                <main className="flex-1 bg-slate-50/50 p-6 md:p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-6xl mx-auto">
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
                <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-800">策略卡牌手卡</h2>
                        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#ee4035]/10 hover:text-[#ee4035] text-xs font-medium text-slate-500 transition-colors">
                            <Trash2 className="w-3 h-3" /> 弃牌区
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50/30">
                        <StrategyCard
                            type="产业类"
                            typeColor="#30499b"
                            cost={3}
                            imageUrl="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=400"
                            title="传统制造业升级"
                            description="深圳龙华工厂区试点。每回合 +15 产业值，+20 碳排放。"
                        />

                        <StrategyCard
                            type="绿建类"
                            typeColor="#56b949"
                            cost={5}
                            imageUrl="https://images.unsplash.com/photo-1518005052357-e98470471929?auto=format&fit=crop&q=80&w=400"
                            title="天台绿化倡议"
                            description="降低建筑物能耗 5%，提升市民满意度 2 点。"
                        />

                        <StrategyCard
                            type="产业类"
                            typeColor="#30499b"
                            cost={8}
                            imageUrl="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400"
                            title="高新产业集群"
                            description="华为/腾讯低碳示范项目。大幅提升科创点。"
                        />

                        {/* 锁定槽位 */}
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 min-h-[140px] flex flex-col items-center justify-center text-slate-300 gap-2">
                            <i data-lucide="lock" className="w-5 h-5"></i>
                            <span className="text-xs font-medium">待解锁</span>
                        </div>
                    </div>
                </aside>
            </div>

            {/* 底部操作栏 */}
            <footer className="h-20 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between px-6 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all">
                        <Archive className="w-4 h-4" />
                        规划档案
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all">
                        <Network className="w-4 h-4" />
                        科技树
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all">
                        <Globe className="w-4 h-4" />
                        世界排名
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Next Turn Cost
                        </div>
                        <div className="text-xs font-medium text-slate-600">1,200 产业值</div>
                        <div className="text-[10px] text-[#f0a32f] font-mono animate-pulse">
                            Awaiting Command...
                        </div>
                    </div>
                    <button
                        onClick={() => setCurrentTurn(currentTurn + 1)}
                        className="group bg-slate-900 hover:bg-[#30499b] text-white pl-6 pr-4 py-3 rounded-xl shadow-xl shadow-slate-900/10 flex items-center gap-3 transition-all duration-300 transform active:scale-95"
                    >
                        <span className="font-bold tracking-wide text-lg">下一回合</span>
                        <div className="bg-white/10 rounded-lg p-1 group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-5 h-5" />
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
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    {title}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">SECTOR-{sectorId}</span>
            </div>

            <div className="bg-slate-100 rounded-xl h-40 w-full mb-3 overflow-hidden relative group">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
                <div
                    className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t to-transparent flex items-end p-3"
                    style={{ backgroundColor: `${color}cc` }}
                >
                    <div className="flex items-center gap-3 text-white text-xs w-full">
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{ backgroundColor: emissionColor, width: `${emissionProgress}%` }}
                            ></div>
                        </div>
                        <span className="font-mono flex items-center gap-1">
                            {emissionType === 'negative' ? <CloudOff className="w-3 h-3" /> : <Cloud className="w-3 h-3" />}
                            {emission > 0 ? '+' : ''}{emission}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 flex-1">
                {hasBuilding ? (
                    <>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-6 h-6 text-slate-300" />
                        </div>
                        <div className="border border-slate-100 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center p-2 relative overflow-hidden group">
                            <div
                                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: buildingColor }}
                            ></div>
                            {buildingIcon}
                            <span className="text-[10px] text-slate-500 font-medium">{buildingName}</span>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-6 h-6 text-slate-300" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-6 h-6 text-slate-300" />
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-6 h-6 text-slate-300" />
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center hover:border-[#30499b]/30 hover:bg-[#30499b]/5 transition-all cursor-pointer">
                            <Plus className="w-6 h-6 text-slate-300" />
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
