'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    ArrowLeft,
    Archive,
    Calendar,
    TrendingUp,
    TrendingDown,
    Building2,
    Users,
    Lightbulb,
    Leaf,
    Cloud,
    Award,
    Target,
    Clock,
    BarChart3
} from 'lucide-react';

export default function GameArchivePage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

    // 模拟历史数据
    const [selectedTurn, setSelectedTurn] = useState(5);

    const archiveData = [
        { turn: 1, carbon: 50, industry: 0, population: 3, tech: 0, green: 10, satisfaction: 70 },
        { turn: 2, carbon: 67, industry: 15, population: 3, tech: 0, green: 10, satisfaction: 68 },
        { turn: 3, carbon: 79, industry: 28, population: 5, tech: 0, green: 22, satisfaction: 72 },
        { turn: 4, carbon: 86, industry: 38, population: 5, tech: 1, green: 22, satisfaction: 70 },
        { turn: 5, carbon: 78, industry: 45, population: 7, tech: 1, green: 30, satisfaction: 75 },
    ];

    const currentData = archiveData.find(d => d.turn === selectedTurn) || archiveData[0];
    const prevData = archiveData.find(d => d.turn === selectedTurn - 1);

    const getChange = (current: number, prev: number | undefined) => {
        if (!prev) return 0;
        return current - prev;
    };

    const handleBack = () => {
        router.push(`/${locale}/game/play`);
    };

    return (
        <div className="bg-[#FAFAF9] min-h-screen flex flex-col text-slate-600 font-sans">
            {/* 顶部导航栏 */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#30499b]/10 rounded-lg">
                            <Archive className="w-5 h-5 text-[#30499b]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                                规划档案
                            </h1>
                            <p className="text-xs text-slate-500">历史回合数据记录</p>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">ARCHIVE SYSTEM v1.0</div>
            </header>

            {/* 主内容区 */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* 回合选择器 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#30499b]" />
                            选择回合
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            {archiveData.map((data) => (
                                <button
                                    key={data.turn}
                                    onClick={() => setSelectedTurn(data.turn)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedTurn === data.turn
                                            ? 'bg-[#30499b] text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    第 {data.turn} 回合
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 数据概览 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 碳排放 */}
                        <StatCard
                            icon={<Cloud className="w-5 h-5" />}
                            title="碳排放"
                            value={currentData.carbon}
                            unit="Mt"
                            change={getChange(currentData.carbon, prevData?.carbon)}
                            color="text-slate-800"
                            bgColor="bg-slate-100"
                        />

                        {/* 产业值 */}
                        <StatCard
                            icon={<Building2 className="w-5 h-5" />}
                            title="产业值"
                            value={currentData.industry}
                            unit=""
                            change={getChange(currentData.industry, prevData?.industry)}
                            color="text-[#30499b]"
                            bgColor="bg-[#30499b]/10"
                        />

                        {/* 市民数 */}
                        <StatCard
                            icon={<Users className="w-5 h-5" />}
                            title="市民数"
                            value={currentData.population}
                            unit="M"
                            change={getChange(currentData.population, prevData?.population)}
                            color="text-[#f0a32f]"
                            bgColor="bg-[#f0a32f]/10"
                        />

                        {/* 科创点 */}
                        <StatCard
                            icon={<Lightbulb className="w-5 h-5" />}
                            title="科创点"
                            value={currentData.tech}
                            unit=""
                            change={getChange(currentData.tech, prevData?.tech)}
                            color="text-[#00C087]"
                            bgColor="bg-[#00C087]/10"
                        />

                        {/* 绿建度 */}
                        <StatCard
                            icon={<Leaf className="w-5 h-5" />}
                            title="绿建度"
                            value={currentData.green}
                            unit="%"
                            change={getChange(currentData.green, prevData?.green)}
                            color="text-[#56b949]"
                            bgColor="bg-[#56b949]/10"
                        />

                        {/* 满意度 */}
                        <StatCard
                            icon={<Award className="w-5 h-5" />}
                            title="市民满意度"
                            value={currentData.satisfaction}
                            unit="%"
                            change={getChange(currentData.satisfaction, prevData?.satisfaction)}
                            color="text-amber-600"
                            bgColor="bg-amber-100"
                        />
                    </div>

                    {/* 趋势图表 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#30499b]" />
                            数据趋势
                        </h2>
                        <div className="space-y-4">
                            {/* 碳排放趋势 */}
                            <TrendBar
                                label="碳排放"
                                data={archiveData.map(d => d.carbon)}
                                max={100}
                                color="#ee4035"
                            />
                            {/* 产业值趋势 */}
                            <TrendBar
                                label="产业值"
                                data={archiveData.map(d => d.industry)}
                                max={50}
                                color="#30499b"
                            />
                            {/* 绿建度趋势 */}
                            <TrendBar
                                label="绿建度"
                                data={archiveData.map(d => d.green)}
                                max={50}
                                color="#56b949"
                            />
                        </div>
                    </div>

                    {/* 目标达成情况 */}
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-slate-200">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#30499b]" />
                            目标达成情况
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <GoalCard
                                label="碳排放"
                                current={currentData.carbon}
                                target={100}
                                targetType="≤"
                                achieved={currentData.carbon <= 100}
                            />
                            <GoalCard
                                label="产业值"
                                current={currentData.industry}
                                target={50}
                                targetType="≥"
                                achieved={currentData.industry >= 50}
                            />
                            <GoalCard
                                label="绿建度"
                                current={currentData.green}
                                target={30}
                                targetType="≥"
                                achieved={currentData.green >= 30}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// 统计卡片组件
function StatCard({
    icon,
    title,
    value,
    unit,
    change,
    color,
    bgColor
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
    unit: string;
    change: number;
    color: string;
    bgColor: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className={`inline-flex p-2 rounded-lg ${bgColor} mb-3`}>
                <div className={color}>{icon}</div>
            </div>
            <div className="text-xs font-medium text-slate-500 mb-1">{title}</div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{value}</span>
                {unit && <span className="text-sm text-slate-400">{unit}</span>}
            </div>
            {change !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {change > 0 ? '+' : ''}{change}
                </div>
            )}
        </div>
    );
}

// 趋势条组件
function TrendBar({
    label,
    data,
    max,
    color
}: {
    label: string;
    data: number[];
    max: number;
    color: string;
}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-600">{label}</span>
                <span className="text-xs text-slate-400">目标: {max}</span>
            </div>
            <div className="flex items-end gap-1 h-16">
                {data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col justify-end">
                        <div
                            className="rounded-t transition-all"
                            style={{
                                height: `${(value / max) * 100}%`,
                                backgroundColor: color,
                                opacity: 0.7
                            }}
                        ></div>
                        <div className="text-[10px] text-center text-slate-400 mt-1">T{index + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 目标卡片组件
function GoalCard({
    label,
    current,
    target,
    targetType,
    achieved
}: {
    label: string;
    current: number;
    target: number;
    targetType: string;
    achieved: boolean;
}) {
    return (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-xs font-medium text-slate-600 mb-2">{label}</div>
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-2xl font-bold text-slate-800">{current}</span>
                    <span className="text-xs text-slate-400 ml-2">{targetType} {target}</span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achieved ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {achieved ? '✓' : '○'}
                </div>
            </div>
        </div>
    );
}
