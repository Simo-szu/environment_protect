'use client';

import { useState } from 'react';
import {
    Coins,
    User,
    CheckCircle,
    XCircle,
    RefreshCw,
    BookOpen,
    Share2,
    Gift,
    Star,
    Sprout,
    Leaf
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

function PointsPageContent() {
    const { user, isLoggedIn } = useAuth();
    const [quizStates, setQuizStates] = useState<{ [key: number]: { answered: boolean; correct: boolean } }>({
        1: { answered: false, correct: false },
        2: { answered: false, correct: false },
        3: { answered: false, correct: false }
    });

    // 处理问答答案
    const handleQuizAnswer = (quizId: number, answerType: 'correct' | 'wrong') => {
        const isCorrect = answerType === 'correct';
        setQuizStates(prev => ({
            ...prev,
            [quizId]: { answered: true, correct: isCorrect }
        }));
    };

    // 处理填空题
    const handleFillBlank = (quizId: number, value: string) => {
        const isCorrect = value.trim() === '6';
        setQuizStates(prev => ({
            ...prev,
            [quizId]: { answered: value.length > 0, correct: isCorrect }
        }));
    };

    // 提交问答
    const submitQuiz = (quizId: number) => {
        const state = quizStates[quizId];
        if (!state.answered) return;

        console.log(`Quiz ${quizId} submitted:`, state);
    };

    return (
        <Layout>
            {/* Hero Section */}
            <section className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white via-[#F0A32F]/5 to-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-semibold mb-4 border border-[#F0A32F]/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A32F] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0A32F]"></span>
                    </span>
                    积分奖励系统
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] mb-6 drop-shadow-sm leading-tight">
                    积分<span className="text-[#F0A32F]">乐园</span>
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 font-normal max-w-lg mx-auto leading-relaxed px-4">
                    <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-[#F0A32F]" />
                        <span>完成<span className="text-[#F0A32F] font-medium border-b-2 border-[#F0A32F]/30">任务</span>赚积分，</span>
                    </div>
                    <span>用<span className="text-[#56B949] font-medium border-b-2 border-[#56B949]/30">行动</span>换奖励</span>
                </div>
            </section>

            {/* 积分中心主体内容 */}
            <div className="bg-white px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100">

                {/* 1. 用户积分概览 User Overview */}
                <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0A32F]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* 头像区 */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg shadow-slate-200 flex items-center justify-center overflow-hidden">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[#30499B] text-white text-xs font-bold shadow-md shadow-[#30499B]/20">Lv.3 绿色见习者</span>
                        </div>

                        {/* 积分与进度 */}
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-serif font-bold text-[#30499B]">100</span>
                                <div className="px-2 py-0.5 rounded bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-bold border border-[#F0A32F]/20 flex items-center gap-1">
                                    <Coins className="w-3 h-3" /> 积分
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-[#30499B]/70 font-medium">
                                    <span>当前进度</span>
                                    <span>距离下一个徽章还差 <span className="text-[#EE4035]">50</span> 积分</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-[#56B949] to-[#30499B] rounded-full relative w-2/3">
                                        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                                        {/* 闪光特效 */}
                                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] skew-x-12 translate-x-[-100%]"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Lv.3</span>
                                    <span>Lv.4</span>
                                </div>
                            </div>
                        </div>

                        {/* 右侧按钮 */}
                        <div className="flex-shrink-0 flex md:flex-col gap-3">
                            <button className="px-6 py-2.5 rounded-xl bg-[#56B949] text-white text-sm font-semibold shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] transition-all hover:-translate-y-0.5">兑换商城</button>
                            <button className="px-6 py-2.5 rounded-xl bg-white text-[#30499B] border border-slate-200 text-sm font-semibold hover:border-[#30499B]/30 transition-all hover:bg-slate-50">积分记录</button>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 2. 签到日历 Check-in Calendar */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#30499B] font-serif">签到日历</h3>
                            <div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">2024年5月</div>
                        </div>

                        {/* 日历可视区域 */}
                        <div className="bg-slate-50 rounded-xl p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden border border-slate-100">
                            {/* 装饰背景 */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#56B949]/20 via-[#F0A32F]/20 to-[#30499B]/20"></div>

                            <div className="grid grid-cols-7 gap-2 sm:gap-4 w-full text-center">
                                {/* 星期头 */}
                                <div className="text-xs text-slate-400 pb-2">Mon</div>
                                <div className="text-xs text-slate-400 pb-2">Tue</div>
                                <div className="text-xs text-slate-400 pb-2">Wed</div>
                                <div className="text-xs text-slate-400 pb-2">Thu</div>
                                <div className="text-xs text-slate-400 pb-2">Fri</div>
                                <div className="text-xs text-slate-400 pb-2">Sat</div>
                                <div className="text-xs text-slate-400 pb-2">Sun</div>

                                {/* 日期格子 */}
                                {/* 1号：已签到 (小树苗) */}
                                <div className="aspect-square rounded-lg bg-white border border-[#56B949]/30 flex flex-col items-center justify-center relative group hover:shadow-md transition-shadow">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">1</span>
                                    <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" />
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">已签到 +5</div>
                                </div>

                                {/* 2号：已签到 */}
                                <div className="aspect-square rounded-lg bg-white border border-[#56B949]/30 flex flex-col items-center justify-center relative group hover:shadow-md transition-shadow">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">2</span>
                                    <Sprout className="w-5 h-5 text-[#56B949]" />
                                </div>

                                {/* 3号：漏签 (枯萎) */}
                                <div className="aspect-square rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center relative group grayscale">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">3</span>
                                    <Leaf className="w-5 h-5 text-[#8b5a2b] rotate-45 opacity-60" />
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">漏签</div>
                                </div>

                                {/* 4号：漏签 */}
                                <div className="aspect-square rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center relative group grayscale">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">4</span>
                                    <Leaf className="w-5 h-5 text-[#8b5a2b] rotate-45 opacity-60" />
                                </div>

                                {/* 5号：今日 (高亮) */}
                                <div className="aspect-square rounded-lg bg-[#56B949]/5 border-2 border-[#56B949] flex flex-col items-center justify-center relative cursor-pointer hover:bg-[#56B949]/10 transition-colors">
                                    <span className="text-[10px] text-[#56B949] font-bold absolute top-1 left-1">5</span>
                                    <div className="text-xs font-bold text-[#56B949]">签到</div>
                                </div>

                                {/* 6号：未来 */}
                                <div className="aspect-square rounded-lg bg-white border border-transparent flex flex-col items-center justify-center text-slate-300">6</div>
                                {/* 7号：未来 */}
                                <div className="aspect-square rounded-lg bg-white border border-transparent flex flex-col items-center justify-center text-slate-300">7</div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-xs sm:text-sm text-slate-500 font-medium px-2">
                            <span>已签到 <b className="text-[#30499B]">2</b> 天</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>连续签到 <b className="text-[#30499B]">2</b> 天</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>已漏签 <b className="text-[#EE4035]">2</b> 天</span>
                        </div>
                    </section>

                    {/* 3. 每日任务 Daily Tasks */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#30499B] font-serif">每日任务</h3>
                            <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">今日剩余 2</span>
                        </div>

                        <div className="space-y-3 flex-1">
                            {/* Task 1 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-[#30499B]/5 transition-colors group border border-transparent hover:border-[#30499B]/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#30499B] shadow-sm">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#30499B]">浏览"保护动物"文章</div>
                                        <div className="text-xs text-[#F0A32F] font-medium">+10 积分</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-[#30499B] transition-colors">1/3</span>
                                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-600 rounded-lg hover:border-[#30499B] hover:text-[#30499B] transition-all">去完成</button>
                                </div>
                            </div>

                            {/* Task 2 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl border border-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#56B949]/10 flex items-center justify-center text-[#56B949] shadow-sm">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 line-through">发布"垃圾分类"文章</div>
                                        <div className="text-xs text-slate-400 font-medium">已完成</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-[#56B949]">2/2</span>
                                    <button className="px-3 py-1.5 bg-slate-100 text-xs font-medium text-slate-400 rounded-lg cursor-not-allowed">已完成</button>
                                </div>
                            </div>

                            {/* Task 3 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-[#F0A32F]/5 rounded-xl border border-[#F0A32F]/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-[#F0A32F] flex items-center justify-center text-white shadow-sm">
                                        <Gift className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#30499B]">评论精选文章</div>
                                        <div className="text-xs text-[#F0A32F] font-medium">奖励待领取</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className="text-xs font-medium text-[#F0A32F]">5/5</span>
                                    <button className="px-3 py-1.5 bg-[#F0A32F] text-xs font-medium text-white rounded-lg shadow-md shadow-[#F0A32F]/30 hover:bg-[#d9901e] transition-all animate-pulse">领取</button>
                                </div>
                            </div>

                            {/* Task 4 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-[#30499B]/5 transition-colors group border border-transparent hover:border-[#30499B]/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#30499B] shadow-sm">
                                        <Share2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#30499B]">分享给好友</div>
                                        <div className="text-xs text-[#F0A32F] font-medium">+50 积分</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-[#30499B] transition-colors">0/1</span>
                                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-600 rounded-lg hover:border-[#30499B] hover:text-[#30499B] transition-all">去完成</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 4. 每日问答 Daily Quiz */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-xl font-bold text-[#30499B] font-serif">每日问答</h3>
                        <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">答对得积分</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quiz 1 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#56B949]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#56B949] text-white text-xs font-bold flex items-center justify-center">1</div>
                                    <span className="text-xs text-[#56B949] font-medium">+5 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">哪种垃圾属于可回收垃圾？</h4>
                                <div className="space-y-2 mb-4">
                                    <button
                                        onClick={() => handleQuizAnswer(1, 'correct')}
                                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[1].answered
                                            ? (quizStates[1].correct ? 'bg-[#56B949] text-white' : 'bg-slate-100 text-slate-400')
                                            : 'bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        disabled={quizStates[1].answered}
                                    >
                                        A. 废纸
                                    </button>
                                    <button
                                        onClick={() => handleQuizAnswer(1, 'wrong')}
                                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[1].answered
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        disabled={quizStates[1].answered}
                                    >
                                        B. 电池
                                    </button>
                                </div>
                                {quizStates[1].answered && (
                                    <div className={`text-xs font-medium ${quizStates[1].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[1].correct ? '✓ 回答正确！' : '✗ 回答错误'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quiz 2 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F0A32F]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#F0A32F] text-white text-xs font-bold flex items-center justify-center">2</div>
                                    <span className="text-xs text-[#F0A32F] font-medium">+10 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">一个塑料瓶完全分解需要多少年？</h4>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="请输入数字"
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-[#F0A32F] focus:outline-none"
                                        onChange={(e) => handleFillBlank(2, e.target.value)}
                                        disabled={quizStates[2].answered}
                                    />
                                </div>
                                {quizStates[2].answered && (
                                    <div className={`text-xs font-medium ${quizStates[2].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[2].correct ? '✓ 回答正确！' : '✗ 回答错误，正确答案是450年'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quiz 3 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#30499B]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#30499B] text-white text-xs font-bold flex items-center justify-center">3</div>
                                    <span className="text-xs text-[#30499B] font-medium">+15 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">以下哪项不是节能减排的方法？</h4>
                                <div className="space-y-2 mb-4">
                                    <button
                                        onClick={() => handleQuizAnswer(3, 'wrong')}
                                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[3].answered
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        disabled={quizStates[3].answered}
                                    >
                                        A. 使用LED灯泡
                                    </button>
                                    <button
                                        onClick={() => handleQuizAnswer(3, 'correct')}
                                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[3].answered
                                            ? (quizStates[3].correct ? 'bg-[#56B949] text-white' : 'bg-slate-100 text-slate-400')
                                            : 'bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        disabled={quizStates[3].answered}
                                    >
                                        B. 长时间开空调
                                    </button>
                                </div>
                                {quizStates[3].answered && (
                                    <div className={`text-xs font-medium ${quizStates[3].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[3].correct ? '✓ 回答正确！' : '✗ 回答错误'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </Layout>
    );
}

export default function PointsPage() {
    return (
        <ProtectedRoute>
            <PointsPageContent />
        </ProtectedRoute>
    );
}