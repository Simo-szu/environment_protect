'use client';

import {
    CalendarHeart,
    Flame,
    CalendarCheck,
    PlusCircle,
    Calendar,
    Star,
    ThumbsUp,
    Trees,
    Sun,
    Waves,
    Recycle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ActivitiesTestPage() {
    const { user, isLoggedIn } = useAuth();

    const registerActivity = (activityId: string) => {
        if (!user || !isLoggedIn) {
            window.location.href = '/login';
        } else {
            window.location.href = `/activities/register?id=${activityId}`;
        }
    };

    const viewActivityDetails = (activityId: string) => {
        window.location.href = `/activities/${activityId}`;
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9]">
            {/* Hero Section */}
            <section className="text-center py-12 px-4 bg-gradient-to-b from-white via-[#30499B]/5 to-white">
                <h1 className="text-4xl font-bold text-[#30499B] mb-6">活动广场</h1>
                <p className="text-lg text-[#30499B]/80">参与活动，用行动改变世界</p>
            </section>

            {/* Main Content */}
            <div className="bg-white px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Categories */}
                            <div className="bg-white/60 rounded-2xl p-6 border">
                                <h2 className="text-lg font-bold text-[#30499B] mb-4">分类</h2>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-[#30499B] text-white rounded-full text-sm">全部</button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm">环保市集</button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm">植树活动</button>
                                </div>
                            </div>

                            {/* Activity Cards */}
                            <div className="bg-white/60 rounded-2xl p-6 border space-y-6">
                                <div className="flex gap-6 p-4 border rounded-xl">
                                    <div className="w-48 h-32 bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 rounded-lg flex items-center justify-center">
                                        <Trees className="w-8 h-8 text-[#56B949]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-[#30499B] mb-2">城市绿洲：周末社区花园种植计划</h3>
                                        <p className="text-sm text-gray-500 mb-4">加入我们在市中心创建绿色角落的行动...</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-4 text-sm text-gray-400">
                                                <span>5月20日</span>
                                                <span>👍 156</span>
                                            </div>
                                            <button
                                                onClick={() => registerActivity('activity-001')}
                                                className="px-4 py-2 bg-[#56B949] text-white rounded-lg text-sm"
                                            >
                                                一键报名
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 p-4 border rounded-xl">
                                    <div className="w-48 h-32 bg-gradient-to-br from-[#F0A32F]/20 to-[#EE4035]/20 rounded-lg flex items-center justify-center">
                                        <Sun className="w-8 h-8 text-[#F0A32F]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-[#30499B] mb-2">旧物新生：创意环保DIY工作坊</h3>
                                        <p className="text-sm text-gray-500 mb-4">不要扔掉你的旧T恤和玻璃瓶...</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-4 text-sm text-gray-400">
                                                <span>5月22日</span>
                                                <span>👍 89</span>
                                            </div>
                                            <button
                                                onClick={() => viewActivityDetails('activity-002')}
                                                className="px-4 py-2 border border-[#30499B] text-[#30499B] rounded-lg text-sm"
                                            >
                                                了解详情
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="bg-white/60 rounded-2xl p-6 border">
                                <h3 className="text-lg font-bold text-[#30499B] mb-4">活动统计</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">本月活动</span>
                                        <span className="text-lg font-bold text-[#56B949]">12</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">参与人数</span>
                                        <span className="text-lg font-bold text-[#30499B]">1,234</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">我的报名</span>
                                        <span className="text-lg font-bold text-[#F0A32F]">3</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAGINATION - 红色背景，非常明显 */}
            <div className="w-full bg-red-500 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center items-center gap-4">
                        <button className="px-4 py-2 border border-white bg-white text-gray-600 rounded-lg disabled:opacity-50" disabled>
                            上一页
                        </button>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-lg bg-[#30499B] text-white text-sm font-medium">1</button>
                            <button className="w-8 h-8 rounded-lg bg-white text-gray-600 text-sm">2</button>
                            <button className="w-8 h-8 rounded-lg bg-white text-gray-600 text-sm">3</button>
                            <span className="text-white px-2">...</span>
                            <button className="w-8 h-8 rounded-lg bg-white text-gray-600 text-sm">8</button>
                        </div>
                        <button className="px-4 py-2 bg-white text-gray-600 rounded-lg">
                            下一页
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-100 py-8 text-center">
                <p className="text-gray-600">© 2024 YouthLoop</p>
            </footer>
        </div>
    );
}