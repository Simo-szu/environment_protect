'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    ArrowLeft,
    Globe,
    Trophy,
    Medal,
    Award,
    TrendingUp,
    Users,
    Building2,
    Leaf,
    Cloud,
    Star,
    Crown,
    Target
} from 'lucide-react';

interface Player {
    rank: number;
    name: string;
    city: string;
    country: string;
    score: number;
    carbon: number;
    industry: number;
    green: number;
    turns: number;
    achievement: string;
}

export default function LeaderboardPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

    const [selectedTab, setSelectedTab] = useState<'global' | 'regional' | 'friends'>('global');

    // 模拟排行榜数据
    const leaderboardData: Player[] = [
        {
            rank: 1,
            name: '深圳规划师',
            city: '深圳',
            country: '中国',
            score: 9850,
            carbon: 45,
            industry: 85,
            green: 65,
            turns: 15,
            achievement: '甜甜圈模范城市'
        },
        {
            rank: 2,
            name: 'EcoMaster',
            city: '旧金山',
            country: '美国',
            score: 9720,
            carbon: 52,
            industry: 78,
            green: 72,
            turns: 15,
            achievement: '科创减排先锋'
        },
        {
            rank: 3,
            name: 'GreenCity',
            city: '哥本哈根',
            country: '丹麦',
            score: 9680,
            carbon: 38,
            industry: 65,
            green: 88,
            turns: 15,
            achievement: '生态优先城市'
        },
        {
            rank: 4,
            name: '碳中和达人',
            city: '上海',
            country: '中国',
            score: 9550,
            carbon: 48,
            industry: 82,
            green: 58,
            turns: 15,
            achievement: '科创减排先锋'
        },
        {
            rank: 5,
            name: 'ClimateHero',
            city: '柏林',
            country: '德国',
            score: 9480,
            carbon: 55,
            industry: 75,
            green: 62,
            turns: 15,
            achievement: '科创减排先锋'
        },
        {
            rank: 6,
            name: '环保先锋',
            city: '北京',
            country: '中国',
            score: 9320,
            carbon: 62,
            industry: 88,
            green: 48,
            turns: 15,
            achievement: '产业转型典范'
        },
        {
            rank: 7,
            name: 'SustainPro',
            city: '东京',
            country: '日本',
            score: 9180,
            carbon: 58,
            industry: 72,
            green: 55,
            turns: 15,
            achievement: '科创减排先锋'
        },
        {
            rank: 8,
            name: '低碳城市',
            city: '广州',
            country: '中国',
            score: 9050,
            carbon: 65,
            industry: 68,
            green: 52,
            turns: 15,
            achievement: '生态优先城市'
        },
    ];

    // 当前玩家（你）
    const currentPlayer: Player = {
        rank: 42,
        name: '你',
        city: '深圳',
        country: '中国',
        score: 7850,
        carbon: 78,
        industry: 45,
        green: 30,
        turns: 5,
        achievement: '进行中'
    };

    const handleBack = () => {
        router.push(`/${locale}/game/play`);
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-sm font-bold text-slate-600">#{rank}</span>;
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
                        <div className="p-2 bg-[#f0a32f]/10 rounded-lg">
                            <Globe className="w-5 h-5 text-[#f0a32f]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                                世界排名
                            </h1>
                            <p className="text-xs text-slate-500">全球低碳规划师排行榜</p>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">LEADERBOARD v1.0</div>
            </header>

            {/* 主内容区 */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* 标签切换 */}
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 flex gap-2">
                        <button
                            onClick={() => setSelectedTab('global')}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedTab === 'global'
                                    ? 'bg-[#30499b] text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Globe className="w-4 h-4 inline mr-2" />
                            全球排名
                        </button>
                        <button
                            onClick={() => setSelectedTab('regional')}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedTab === 'regional'
                                    ? 'bg-[#30499b] text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Target className="w-4 h-4 inline mr-2" />
                            区域排名
                        </button>
                        <button
                            onClick={() => setSelectedTab('friends')}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedTab === 'friends'
                                    ? 'bg-[#30499b] text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            好友排名
                        </button>
                    </div>

                    {/* 前三名展示 */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* 第二名 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <Medal className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-800 mb-1">2nd</div>
                            <div className="font-semibold text-slate-800 mb-1">{leaderboardData[1].name}</div>
                            <div className="text-xs text-slate-500 mb-3">{leaderboardData[1].city}</div>
                            <div className="flex items-center gap-1 text-[#f0a32f]">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold">{leaderboardData[1].score}</span>
                            </div>
                        </div>

                        {/* 第一名 */}
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 shadow-lg border-2 border-yellow-300 flex flex-col items-center transform scale-105">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
                                <Crown className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-amber-600 mb-1">1st</div>
                            <div className="font-semibold text-slate-800 mb-1">{leaderboardData[0].name}</div>
                            <div className="text-xs text-slate-500 mb-3">{leaderboardData[0].city}</div>
                            <div className="flex items-center gap-1 text-amber-600">
                                <Trophy className="w-5 h-5 fill-current" />
                                <span className="font-bold text-lg">{leaderboardData[0].score}</span>
                            </div>
                        </div>

                        {/* 第三名 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                <Medal className="w-8 h-8 text-amber-600" />
                            </div>
                            <div className="text-2xl font-bold text-slate-800 mb-1">3rd</div>
                            <div className="font-semibold text-slate-800 mb-1">{leaderboardData[2].name}</div>
                            <div className="text-xs text-slate-500 mb-3">{leaderboardData[2].city}</div>
                            <div className="flex items-center gap-1 text-[#f0a32f]">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold">{leaderboardData[2].score}</span>
                            </div>
                        </div>
                    </div>

                    {/* 排行榜列表 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-600">
                                <div className="col-span-1">排名</div>
                                <div className="col-span-3">玩家</div>
                                <div className="col-span-2">分数</div>
                                <div className="col-span-2">碳排放</div>
                                <div className="col-span-2">产业值</div>
                                <div className="col-span-2">绿建度</div>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {leaderboardData.slice(3).map((player) => (
                                <PlayerRow key={player.rank} player={player} getRankIcon={getRankIcon} />
                            ))}
                            {/* 当前玩家 */}
                            <div className="bg-blue-50 border-t-2 border-[#30499b]">
                                <PlayerRow player={currentPlayer} getRankIcon={getRankIcon} isCurrentPlayer />
                            </div>
                        </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#30499b]/10 rounded-lg">
                                    <Users className="w-4 h-4 text-[#30499b]" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">总玩家数</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">12,458</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#56b949]/10 rounded-lg">
                                    <TrendingUp className="w-4 h-4 text-[#56b949]" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">平均分数</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">7,234</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#f0a32f]/10 rounded-lg">
                                    <Award className="w-4 h-4 text-[#f0a32f]" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">你的排名</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">#{currentPlayer.rank}</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// 玩家行组件
function PlayerRow({
    player,
    getRankIcon,
    isCurrentPlayer = false
}: {
    player: Player;
    getRankIcon: (rank: number) => React.ReactNode;
    isCurrentPlayer?: boolean;
}) {
    return (
        <div className={`px-6 py-4 hover:bg-slate-50 transition-colors ${isCurrentPlayer ? 'bg-blue-50' : ''}`}>
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1 flex items-center justify-center">
                    {getRankIcon(player.rank)}
                </div>
                <div className="col-span-3">
                    <div className="font-semibold text-sm text-slate-800">
                        {player.name}
                        {isCurrentPlayer && (
                            <span className="ml-2 text-xs bg-[#30499b] text-white px-2 py-0.5 rounded">你</span>
                        )}
                    </div>
                    <div className="text-xs text-slate-500">{player.city}, {player.country}</div>
                </div>
                <div className="col-span-2">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#f0a32f] fill-current" />
                        <span className="font-bold text-sm text-slate-800">{player.score}</span>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex items-center gap-1 text-xs">
                        <Cloud className="w-3 h-3 text-slate-500" />
                        <span className={player.carbon <= 100 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {player.carbon}
                        </span>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex items-center gap-1 text-xs">
                        <Building2 className="w-3 h-3 text-[#30499b]" />
                        <span className="text-slate-700 font-medium">{player.industry}</span>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex items-center gap-1 text-xs">
                        <Leaf className="w-3 h-3 text-[#56b949]" />
                        <span className="text-slate-700 font-medium">{player.green}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
