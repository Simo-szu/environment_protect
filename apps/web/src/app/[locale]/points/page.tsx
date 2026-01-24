'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter } from '@/lib/animations';
import { pointsApi } from '@/lib/api';
import type { PointsAccount, DailyTask, DailyQuiz, SigninRecord } from '@/lib/api/points';

function PointsPageContent() {
    const { user, isLoggedIn } = useAuth();
    
    // 积分账户数据
    const [pointsAccount, setPointsAccount] = useState<PointsAccount | null>(null);
    const [loadingAccount, setLoadingAccount] = useState(true);
    
    // 签到数据
    const [todaySignin, setTodaySignin] = useState<SigninRecord | null>(null);
    const [loadingSignin, setLoadingSignin] = useState(true);
    const [signingIn, setSigningIn] = useState(false);
    const [showCheckInAnimation, setShowCheckInAnimation] = useState(false);
    
    // 每日任务数据
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [claimingTask, setClaimingTask] = useState<string | null>(null);
    
    // 每日问答数据
    const [todayQuiz, setTodayQuiz] = useState<DailyQuiz | null>(null);
    const [loadingQuiz, setLoadingQuiz] = useState(true);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResult, setQuizResult] = useState<{ correct: boolean; earnedPoints: number; explanation?: string } | null>(null);
    
    const [quizStates, setQuizStates] = useState<{ [key: number]: { answered: boolean; correct: boolean } }>({
        1: { answered: false, correct: false },
        2: { answered: false, correct: false },
        3: { answered: false, correct: false }
    });

    // 签到日历状态（简化版，实际应该从后端获取）
    const [checkedInDays, setCheckedInDays] = useState<number[]>([1, 2]);
    const currentDay = 5;

    // 加载积分账户
    useEffect(() => {
        const loadPointsAccount = async () => {
            try {
                setLoadingAccount(true);
                const account = await pointsApi.getPointsAccount();
                setPointsAccount(account);
            } catch (error) {
                console.error('Failed to load points account:', error);
            } finally {
                setLoadingAccount(false);
            }
        };

        if (isLoggedIn) {
            loadPointsAccount();
        }
    }, [isLoggedIn]);

    // 加载签到状态
    useEffect(() => {
        const loadSigninStatus = async () => {
            try {
                setLoadingSignin(true);
                const signin = await pointsApi.getTodaySignin();
                setTodaySignin(signin);
            } catch (error) {
                console.error('Failed to load signin status:', error);
            } finally {
                setLoadingSignin(false);
            }
        };

        if (isLoggedIn) {
            loadSigninStatus();
        }
    }, [isLoggedIn]);

    // 加载每日任务
    useEffect(() => {
        const loadDailyTasks = async () => {
            try {
                setLoadingTasks(true);
                const tasks = await pointsApi.getDailyTasks();
                setDailyTasks(tasks);
            } catch (error) {
                console.error('Failed to load daily tasks:', error);
            } finally {
                setLoadingTasks(false);
            }
        };

        if (isLoggedIn) {
            loadDailyTasks();
        }
    }, [isLoggedIn]);

    // 加载每日问答
    useEffect(() => {
        const loadTodayQuiz = async () => {
            try {
                setLoadingQuiz(true);
                const quiz = await pointsApi.getTodayQuiz();
                setTodayQuiz(quiz);
            } catch (error) {
                console.error('Failed to load today quiz:', error);
            } finally {
                setLoadingQuiz(false);
            }
        };

        if (isLoggedIn) {
            loadTodayQuiz();
        }
    }, [isLoggedIn]);

    // 处理签到
    const handleCheckIn = async () => {
        if (todaySignin || signingIn) return;

        try {
            setSigningIn(true);
            setShowCheckInAnimation(true);
            
            const result = await pointsApi.signin();
            setTodaySignin(result);
            
            // 更新积分账户
            if (pointsAccount) {
                setPointsAccount({
                    ...pointsAccount,
                    totalPoints: pointsAccount.totalPoints + result.points,
                    availablePoints: pointsAccount.availablePoints + result.points
                });
            }

            alert(`签到成功！获得 ${result.points} 积分`);
            
            // 动画结束后重置
            setTimeout(() => {
                setShowCheckInAnimation(false);
            }, 1000);
        } catch (error: any) {
            console.error('Failed to signin:', error);
            alert(error.message || '签到失败');
            setShowCheckInAnimation(false);
        } finally {
            setSigningIn(false);
        }
    };

    // 领取任务奖励
    const handleClaimTask = async (taskId: string) => {
        try {
            setClaimingTask(taskId);
            await pointsApi.claimTaskReward(taskId);
            
            // 更新任务列表
            setDailyTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, completed: true } : task
            ));
            
            // 重新加载积分账户
            const account = await pointsApi.getPointsAccount();
            setPointsAccount(account);
            
            alert('领取成功！');
        } catch (error: any) {
            console.error('Failed to claim task:', error);
            alert(error.message || '领取失败');
        } finally {
            setClaimingTask(null);
        }
    };

    // 提交问答答案
    const handleSubmitQuiz = async () => {
        if (!todayQuiz || quizAnswer === null || quizSubmitted) return;

        try {
            const result = await pointsApi.submitQuizAnswer({
                quizId: todayQuiz.id,
                answer: quizAnswer
            });
            
            setQuizResult(result);
            setQuizSubmitted(true);
            
            // 更新积分账户
            if (result.correct && pointsAccount) {
                setPointsAccount({
                    ...pointsAccount,
                    totalPoints: pointsAccount.totalPoints + result.earnedPoints,
                    availablePoints: pointsAccount.availablePoints + result.earnedPoints
                });
            }
        } catch (error: any) {
            console.error('Failed to submit quiz:', error);
            alert(error.message || '提交失败');
        }
    };

    // 每日问答刷新状态管理（保留原有逻辑用于演示）
    const [refreshCount, setRefreshCount] = useState(0);
    const maxRefreshCount = 5;
    const [currentQuizSet, setCurrentQuizSet] = useState(0);

    // 题库 - 多套环保知识问答
    const quizSets = [
        // 第一套题目（默认）
        {
            quiz1: {
                question: "哪种垃圾属于可回收垃圾？",
                options: [
                    { text: "A. 废纸", correct: true },
                    { text: "B. 电池", correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: "一个塑料瓶完全分解需要多少年？",
                type: "fill",
                answer: "450",
                points: 10
            },
            quiz3: {
                question: "以下哪项不是节能减排的方法？",
                options: [
                    { text: "A. 使用LED灯泡", correct: false },
                    { text: "B. 长时间开空调", correct: true }
                ],
                points: 15
            }
        },
        // 第二套题目
        {
            quiz1: {
                question: "微塑料污染主要来源于哪里？",
                options: [
                    { text: "A. 轮胎磨损颗粒", correct: true },
                    { text: "B. 天然橡胶", correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: "生活垃圾可分为几大类？",
                type: "fill",
                answer: "4",
                points: 10
            },
            quiz3: {
                question: "哪种能源属于可再生能源？",
                options: [
                    { text: "A. 煤炭", correct: false },
                    { text: "B. 太阳能", correct: true }
                ],
                points: 15
            }
        },
        // 第三套题目
        {
            quiz1: {
                question: "以下哪项是造成温室效应的主要气体？",
                options: [
                    { text: "A. 二氧化碳", correct: true },
                    { text: "B. 氧气", correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: "一棵成年树每年能吸收多少公斤二氧化碳？（约数）",
                type: "fill",
                answer: "22",
                points: 10
            },
            quiz3: {
                question: "生物多样性保护最重要的措施是？",
                options: [
                    { text: "A. 建设更多城市", correct: false },
                    { text: "B. 保护自然栖息地", correct: true }
                ],
                points: 15
            }
        },
        // 第四套题目
        {
            quiz1: {
                question: "海洋塑料垃圾的主要危害是？",
                options: [
                    { text: "A. 影响海洋生物生存", correct: true },
                    { text: "B. 增加海水盐分", correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: "节约用水，每次刷牙时关闭水龙头可节约多少升水？",
                type: "fill",
                answer: "6",
                points: 10
            },
            quiz3: {
                question: "以下哪种交通方式最环保？",
                options: [
                    { text: "A. 私家车", correct: false },
                    { text: "B. 自行车", correct: true }
                ],
                points: 15
            }
        },
        // 第五套题目
        {
            quiz1: {
                question: "森林砍伐的主要环境影响是？",
                options: [
                    { text: "A. 加剧气候变化", correct: true },
                    { text: "B. 增加降雨量", correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: "全球每年产生多少亿吨塑料垃圾？（约数）",
                type: "fill",
                answer: "3",
                points: 10
            },
            quiz3: {
                question: "哪种做法有助于减少碳足迹？",
                options: [
                    { text: "A. 增加肉类消费", correct: false },
                    { text: "B. 选择本地食材", correct: true }
                ],
                points: 15
            }
        }
    ];

    // 处理问答刷新
    const handleRefreshQuiz = () => {
        if (refreshCount >= maxRefreshCount) return; // 达到最大刷新次数

        setRefreshCount(prev => prev + 1);
        // 随机选择新的题目集
        const newQuizSet = Math.floor(Math.random() * quizSets.length);
        setCurrentQuizSet(newQuizSet);
        // 重置所有问答状态
        setQuizStates({
            1: { answered: false, correct: false },
            2: { answered: false, correct: false },
            3: { answered: false, correct: false }
        });

        console.log('问答已刷新，当前题目集：', newQuizSet + 1, '剩余次数：', maxRefreshCount - refreshCount - 1);
    };

    // 获取当前题目集
    const getCurrentQuiz = (quizId: number): any => {
        return quizSets[currentQuizSet][`quiz${quizId}` as keyof typeof quizSets[0]];
    };

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
        const currentQuiz = getCurrentQuiz(quizId);
        const isCorrect = value.trim() === currentQuiz.answer;
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
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white via-[#F0A32F]/5 to-white"
            >
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
            </motion.section>

            {/* 积分中心主体内容 */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="bg-white px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100"
            >

                {/* 1. 用户积分概览 User Overview */}
                <motion.section
                    variants={staggerItem}
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0A32F]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    {loadingAccount ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-[#30499B]/20 border-t-[#30499B] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            {/* 头像区 */}
                            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg shadow-slate-200 flex items-center justify-center overflow-hidden">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-slate-400" />
                                    )}
                                </div>
                                <span className="px-3 py-1 rounded-full bg-[#30499B] text-white text-xs font-bold shadow-md shadow-[#30499B]/20">
                                    Lv.{pointsAccount?.level || 1} {pointsAccount?.levelName || '绿色见习者'}
                                </span>
                            </div>

                            {/* 积分与进度 */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-serif font-bold text-[#30499B]">
                                        {pointsAccount?.availablePoints || 0}
                                    </span>
                                    <div className="px-2 py-0.5 rounded bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-bold border border-[#F0A32F]/20 flex items-center gap-1">
                                        <Coins className="w-3 h-3" /> 积分
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-[#30499B]/70 font-medium">
                                        <span>当前进度</span>
                                        <span>总积分 <span className="text-[#30499B]">{pointsAccount?.totalPoints || 0}</span></span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-[#56B949] to-[#30499B] rounded-full relative w-2/3">
                                            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] skew-x-12 translate-x-[-100%]"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Lv.{pointsAccount?.level || 1}</span>
                                        <span>Lv.{(pointsAccount?.level || 1) + 1}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 右侧按钮 */}
                            <div className="flex-shrink-0 flex md:flex-col gap-3">
                                <button className="px-6 py-2.5 rounded-xl bg-[#56B949] text-white text-sm font-semibold shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] transition-all hover:-translate-y-0.5">兑换商城</button>
                                <button className="px-6 py-2.5 rounded-xl bg-white text-[#30499B] border border-slate-200 text-sm font-semibold hover:border-[#30499B]/30 transition-all hover:bg-slate-50">积分记录</button>
                            </div>
                        </div>
                    )}
                </motion.section>

                <motion.div
                    variants={staggerItem}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* 2. 签到日历 Check-in Calendar */}
                    <motion.section
                        variants={cardEnter}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full"
                    >
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
                                    <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" style={{ animationDelay: '0.5s' }} />
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">已签到 +5</div>
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
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">漏签</div>
                                </div>

                                {/* 5号：今日 (可签到或已签到) */}
                                <div
                                    onClick={handleCheckIn}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-300 ${todaySignin
                                        ? 'bg-white border border-[#56B949]/30 hover:shadow-md cursor-default'
                                        : 'bg-[#56B949]/5 border-2 border-[#56B949] hover:bg-[#56B949]/10 hover:scale-105 cursor-pointer'
                                        }`}
                                >
                                    <span className={`text-[10px] font-bold absolute top-1 left-1 ${todaySignin ? 'text-slate-400' : 'text-[#56B949]'
                                        }`}>5</span>

                                    {todaySignin ? (
                                        <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" />
                                    ) : (
                                        <div className="text-xs font-bold text-[#56B949]">{signingIn ? '...' : '签到'}</div>
                                    )}

                                    {/* 签到成功动画 */}
                                    {showCheckInAnimation && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-[#56B949]/20 animate-ping"></div>
                                            <Sprout className="w-6 h-6 text-[#56B949] absolute animate-bounce" />
                                        </div>
                                    )}

                                    {/* 提示文字 */}
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">
                                        {todaySignin ? `已签到 +${todaySignin.points}` : '点击签到'}
                                    </div>
                                </div>

                                {/* 6号：未来 */}
                                <div className="aspect-square rounded-lg bg-white border border-transparent flex flex-col items-center justify-center text-slate-300">6</div>
                                {/* 7号：未来 */}
                                <div className="aspect-square rounded-lg bg-white border border-transparent flex flex-col items-center justify-center text-slate-300">7</div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-xs sm:text-sm text-slate-500 font-medium px-2">
                            <span>已签到 <b className="text-[#30499B]">{todaySignin ? todaySignin.consecutiveDays : checkedInDays.length}</b> 天</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>连续签到 <b className="text-[#30499B]">{todaySignin ? todaySignin.consecutiveDays : checkedInDays.length}</b> 天</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>已漏签 <b className="text-[#EE4035]">2</b> 天</span>
                        </div>
                    </motion.section>

                    {/* 3. 每日任务 Daily Tasks */}
                    <motion.section
                        variants={cardEnter}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#30499B] font-serif">每日任务</h3>
                            <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">
                                今日剩余 {dailyTasks.filter(t => !t.completed).length}
                            </span>
                        </div>

                        {loadingTasks ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#30499B]/20 border-t-[#30499B] rounded-full animate-spin"></div>
                            </div>
                        ) : dailyTasks.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                暂无任务
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1">
                                {dailyTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-colors border ${
                                            task.completed
                                                ? 'bg-slate-50 border-transparent'
                                                : task.currentCompletions >= task.maxCompletions
                                                ? 'bg-[#F0A32F]/5 border-[#F0A32F]/20 relative overflow-hidden'
                                                : 'bg-slate-50 hover:bg-[#30499B]/5 group border-transparent hover:border-[#30499B]/10'
                                        }`}
                                    >
                                        {task.currentCompletions >= task.maxCompletions && !task.completed && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                        )}
                                        
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                                                task.completed
                                                    ? 'bg-[#56B949]/10 text-[#56B949]'
                                                    : 'bg-white text-[#30499B]'
                                            }`}>
                                                {task.completed ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <BookOpen className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${
                                                    task.completed ? 'text-slate-400 line-through' : 'text-[#30499B]'
                                                }`}>
                                                    {task.taskName}
                                                </div>
                                                <div className={`text-xs font-medium ${
                                                    task.completed ? 'text-slate-400' : 'text-[#F0A32F]'
                                                }`}>
                                                    {task.completed ? '已完成' : `+${task.points} 积分`}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className={`text-xs font-medium ${
                                                task.completed
                                                    ? 'text-[#56B949]'
                                                    : task.currentCompletions >= task.maxCompletions
                                                    ? 'text-[#F0A32F]'
                                                    : 'text-slate-400 group-hover:text-[#30499B]'
                                            }`}>
                                                {task.currentCompletions}/{task.maxCompletions}
                                            </span>
                                            
                                            {task.completed ? (
                                                <button className="px-3 py-1.5 bg-slate-100 text-xs font-medium text-slate-400 rounded-lg cursor-not-allowed">
                                                    已完成
                                                </button>
                                            ) : task.currentCompletions >= task.maxCompletions ? (
                                                <button
                                                    onClick={() => handleClaimTask(task.id)}
                                                    disabled={claimingTask === task.id}
                                                    className="px-3 py-1.5 bg-[#F0A32F] text-xs font-medium text-white rounded-lg shadow-md shadow-[#F0A32F]/30 hover:bg-[#d9901e] transition-all animate-pulse disabled:opacity-50"
                                                >
                                                    {claimingTask === task.id ? '领取中...' : '领取'}
                                                </button>
                                            ) : (
                                                <button className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-600 rounded-lg hover:border-[#30499B] hover:text-[#30499B] transition-all">
                                                    去完成
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </motion.div>

                {/* 4. 每日问答 Daily Quiz */}
                <motion.section
                    variants={staggerItem}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-xl font-bold text-[#30499B] font-serif">每日问答</h3>

                        {/* 刷新按钮 */}
                        <button
                            onClick={handleRefreshQuiz}
                            disabled={refreshCount >= maxRefreshCount}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${refreshCount >= maxRefreshCount
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-[#30499B]/10 text-[#30499B] hover:bg-[#30499B]/20 hover:scale-110'
                                }`}
                            title={refreshCount >= maxRefreshCount ? '今日刷新次数已用完' : `刷新问答 (剩余${maxRefreshCount - refreshCount}次)`}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshCount >= maxRefreshCount ? '' : 'hover:rotate-180 transition-transform duration-300'}`} />
                        </button>

                        <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">答对得积分</span>

                        {/* 刷新次数提示 */}
                        <span className="text-[10px] text-slate-400 ml-auto">
                            每日可刷新{maxRefreshCount}次 ({maxRefreshCount - refreshCount}次剩余)
                        </span>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Quiz 1 */}
                        <motion.div
                            variants={staggerItem}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#56B949]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#56B949] text-white text-xs font-bold flex items-center justify-center">1</div>
                                    <span className="text-xs text-[#56B949] font-medium">+{getCurrentQuiz(1).points} 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">{getCurrentQuiz(1).question}</h4>
                                <div className="space-y-2 mb-4">
                                    {getCurrentQuiz(1).options.map((option: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuizAnswer(1, option.correct ? 'correct' : 'wrong')}
                                            className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[1].answered
                                                ? (quizStates[1].correct && option.correct ? 'bg-[#56B949] text-white' : 'bg-slate-100 text-slate-400')
                                                : 'bg-slate-50 hover:bg-slate-100'
                                                }`}
                                            disabled={quizStates[1].answered}
                                        >
                                            {option.text}
                                        </button>
                                    ))}
                                </div>
                                {quizStates[1].answered && (
                                    <div className={`text-xs font-medium ${quizStates[1].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[1].correct ? '✓ 回答正确！' : '✗ 回答错误'}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quiz 2 */}
                        <motion.div
                            variants={staggerItem}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F0A32F]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#F0A32F] text-white text-xs font-bold flex items-center justify-center">2</div>
                                    <span className="text-xs text-[#F0A32F] font-medium">+{getCurrentQuiz(2).points} 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">{getCurrentQuiz(2).question}</h4>
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
                                        {quizStates[2].correct ? '✓ 回答正确！' : `✗ 回答错误，正确答案是${getCurrentQuiz(2).answer}`}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quiz 3 */}
                        <motion.div
                            variants={staggerItem}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#30499B]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#30499B] text-white text-xs font-bold flex items-center justify-center">3</div>
                                    <span className="text-xs text-[#30499B] font-medium">+{getCurrentQuiz(3).points} 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">{getCurrentQuiz(3).question}</h4>
                                <div className="space-y-2 mb-4">
                                    {getCurrentQuiz(3).options.map((option: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuizAnswer(3, option.correct ? 'correct' : 'wrong')}
                                            className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[3].answered
                                                ? (quizStates[3].correct && option.correct ? 'bg-[#56B949] text-white' : 'bg-slate-100 text-slate-400')
                                                : 'bg-slate-50 hover:bg-slate-100'
                                                }`}
                                            disabled={quizStates[3].answered}
                                        >
                                            {option.text}
                                        </button>
                                    ))}
                                </div>
                                {quizStates[3].answered && (
                                    <div className={`text-xs font-medium ${quizStates[3].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[3].correct ? '✓ 回答正确！' : '✗ 回答错误'}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.section>
            </motion.div>

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