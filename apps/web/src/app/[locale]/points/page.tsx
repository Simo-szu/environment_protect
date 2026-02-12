'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
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
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter } from '@/lib/animations';
import { pointsApi, userApi } from '@/lib/api';
import type { PointsAccount, DailyTask, DailyQuiz, SigninRecord } from '@/lib/api/points';

function PointsPageContent() {
    const { user, isLoggedIn } = useAuth();
    const { t, locale } = useSafeTranslation('points');

    // 积分账户数据
    const [pointsAccount, setPointsAccount] = useState<PointsAccount | null>(null);
    const [loadingAccount, setLoadingAccount] = useState(false);
    
    // 积分动画状态
    const [displayPoints, setDisplayPoints] = useState(0);
    const [pointsIncrement, setPointsIncrement] = useState<number | null>(null);

    // 签到数据
    const [todaySignin, setTodaySignin] = useState<SigninRecord | null>(null);
    const [loadingSignin, setLoadingSignin] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
    const [showCheckInAnimation, setShowCheckInAnimation] = useState(false);

    // 每日任务数据 - 添加默认模拟数据
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
        {
            id: '1',
            name: 'readArticle',
            code: 'READ_ARTICLE',
            points: 10,
            target: 1,
            progress: 0,
            status: 1
        },
        {
            id: '2',
            name: 'shareKnowledge',
            code: 'SHARE_CONTENT',
            points: 20,
            target: 1,
            progress: 0,
            status: 1
        }
    ]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const [claimingTask, setClaimingTask] = useState<string | null>(null);

    // 每日问答数据
    const [todayQuiz, setTodayQuiz] = useState<DailyQuiz | null>(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResult, setQuizResult] = useState<{ correct: boolean; earnedPoints: number; explanation?: string } | null>(null);

    const [quizStates, setQuizStates] = useState<{ [key: number]: { answered: boolean; correct: boolean } }>({
        1: { answered: false, correct: false },
        2: { answered: false, correct: false },
        3: { answered: false, correct: false }
    });

    // 签到日历状态 - 动态计算本周日期
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // 1 (Mon) - 7 (Sun)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    // 加载积分账户
    useEffect(() => {
        const loadPointsAccount = async () => {
            try {
                const account = await userApi.getMyPoints();
                setPointsAccount(account);
                setDisplayPoints(account.availablePoints);
            } catch (error) {
                console.error('Failed to load points account:', error);
                // 失败时不设置 loading 状态，让页面继续显示
            }
        };

        if (isLoggedIn) {
            loadPointsAccount();
        }
    }, [isLoggedIn]);
    
    // 积分数字动画效果
    useEffect(() => {
        if (!pointsAccount) return;
        
        const targetPoints = pointsAccount.availablePoints;
        if (displayPoints === targetPoints) return;
        
        const diff = targetPoints - displayPoints;
        const duration = 1000; // 1秒动画
        const steps = 30;
        const increment = diff / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setDisplayPoints(targetPoints);
                clearInterval(timer);
            } else {
                setDisplayPoints(prev => Math.round(prev + increment));
            }
        }, stepDuration);
        
        return () => clearInterval(timer);
    }, [displayPoints, pointsAccount]);

    // 加载签到状态
    useEffect(() => {
        const loadSigninStatus = async () => {
            try {
                const signin = await pointsApi.getTodaySignin();
                setTodaySignin(signin);
            } catch (error) {
                console.error('Failed to load signin status:', error);
                // 失败时不设置 loading 状态
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
                const tasks = await pointsApi.getDailyTasks();
                setDailyTasks(tasks);
            } catch (error) {
                console.error('Failed to load daily tasks:', error);
                // 失败时不设置 loading 状态
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
                const quiz = await pointsApi.getTodayQuiz();
                setTodayQuiz(quiz);
            } catch (error) {
                console.error('Failed to load today quiz:', error);
                // 失败时不设置 loading 状态
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

            // 显示增加的积分动画
            setPointsIncrement(result.points);
            setTimeout(() => setPointsIncrement(null), 2000);

            // 重新加载积分账户以获取最新的等级和进度信息
            const updatedAccount = await userApi.getMyPoints();
            setPointsAccount(updatedAccount);

            alert(t('alerts.signInSuccess', '签到成功！获得 {points} 积分', { points: result.points }));

            // 动画结束后重置
            setTimeout(() => {
                setShowCheckInAnimation(false);
            }, 1000);
        } catch (error: any) {
            console.error('Failed to signin:', error);
            alert(error.message || t('alerts.signInFailed', '签到失败'));
            setShowCheckInAnimation(false);
        } finally {
            setSigningIn(false);
        }
    };

    // 领取任务奖励
    const handleClaimTask = async (taskId: string) => {
        try {
            setClaimingTask(taskId);
            
            // 找到任务的积分奖励
            const task = dailyTasks.find(t => t.id === taskId);
            const taskPoints = task?.points || 0;
            
            await pointsApi.claimTaskReward(taskId);

            // 更新任务列表
            setDailyTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, status: 3 } : task
            ));

            // 显示增加的积分动画
            setPointsIncrement(taskPoints);
            setTimeout(() => setPointsIncrement(null), 2000);

            // 重新加载积分账户
            const account = await userApi.getMyPoints();
            setPointsAccount(account);

            alert(t('alerts.claimSuccess', '领取成功！'));
        } catch (error: any) {
            console.error('Failed to claim task:', error);
            alert(error.message || t('alerts.claimFailed', '领取失败'));
        } finally {
            setClaimingTask(null);
        }
    };

    // 提交问答答案
    const handleSubmitQuiz = async () => {
        if (!todayQuiz || quizAnswer === null || quizSubmitted) return;

        try {
            const result = await pointsApi.submitQuizAnswer({
                quizDate: todayQuiz.quizDate,
                userAnswer: quizAnswer
            });

            setQuizResult(result);
            setQuizSubmitted(true);

            // 如果答对了，重新加载积分账户
            if (result.correct) {
                // 显示增加的积分动画
                setPointsIncrement(result.earnedPoints);
                setTimeout(() => setPointsIncrement(null), 2000);
                
                // 重新加载积分账户以获取最新数据
                const updatedAccount = await userApi.getMyPoints();
                setPointsAccount(updatedAccount);
            }
        } catch (error: any) {
            console.error('Failed to submit quiz:', error);
            alert(error.message || t('alerts.submitFailed', '提交失败'));
        }
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
                    {t('badge', '积分奖励系统')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] mb-6 drop-shadow-sm leading-tight">
                    {t('title', '积分')}<span className="text-[#F0A32F]">{t('paradise', '乐园')}</span>
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 font-normal max-w-lg mx-auto leading-relaxed px-4">
                    <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-[#F0A32F]" />
                        <span>{t('subtitle.complete', '完成')}<span className="text-[#F0A32F] font-medium border-b-2 border-[#F0A32F]/30">{t('subtitle.tasks', '任务')}</span>{t('subtitle.earnPoints', '赚积分，')}</span>
                    </div>
                    <span>{t('subtitle.use', '用')}<span className="text-[#56B949] font-medium border-b-2 border-[#56B949]/30">{t('subtitle.action', '行动')}</span>{t('subtitle.getRewards', '换奖励')}</span>
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
                                    Lv.{pointsAccount?.level || 1}
                                </span>
                            </div>

                            {/* 积分与进度 */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex items-baseline gap-2 relative">
                                    <span className="text-4xl md:text-5xl font-serif font-bold text-[#30499B] transition-all duration-300">
                                        {displayPoints}
                                    </span>
                                    <div className="px-2 py-0.5 rounded bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-bold border border-[#F0A32F]/20 flex items-center gap-1">
                                        <Coins className="w-3 h-3" /> {t('points', '积分')}
                                    </div>
                                    {pointsIncrement && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 0, scale: 1 }}
                                            animate={{ opacity: [0, 1, 1, 0], y: -30, scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2 }}
                                            className="absolute left-0 top-0 text-2xl font-bold text-[#56B949]"
                                        >
                                            +{pointsIncrement}
                                        </motion.span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-[#30499B]/70 font-medium">
                                        <span>{t('progress.current', '当前进度')}</span>
                                        <span>{t('progress.nextLevel', '距离下一级还需')} <span className="text-[#F0A32F] font-bold">{pointsAccount?.pointsToNextLevel || 0}</span> {t('points', '积分')}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        {(() => {
                                            const current = pointsAccount?.totalPoints || 0;
                                            const nextMin = pointsAccount?.nextLevelMinPoints || 100;
                                            const pointsToNext = pointsAccount?.pointsToNextLevel || 0;
                                            
                                            // 如果已是最高级（pointsToNextLevel为0且current > 0）
                                            if (pointsToNext === 0 && current > 0) {
                                                return (
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-[#56B949] to-[#30499B] rounded-full relative transition-all duration-500"
                                                        style={{ width: '100%' }}
                                                    >
                                                        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                                                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] skew-x-12 translate-x-[-100%]"></div>
                                                    </div>
                                                );
                                            }
                                            
                                            // 计算当前等级的起始积分（下一级最低积分 - 距离下一级所需积分 = 当前等级起始积分）
                                            const currentMin = nextMin - pointsToNext - (current - (nextMin - pointsToNext));
                                            // 简化：当前等级起始积分 = 当前积分 - (下一级所需 - 已有到下一级的进度)
                                            // 更简单的算法：当前等级范围内的进度 = (当前积分 - 当前等级起始) / (下一级起始 - 当前等级起始)
                                            // 由于 pointsToNext = nextMin - current，所以 current = nextMin - pointsToNext
                                            // 当前等级起始 = nextMin - (nextMin - currentMin) = currentMin
                                            // 实际上我们需要：当前等级最低积分
                                            // 根据等级规则，如果 level=1 对应 0-99，level=2 对应 100-199
                                            // 那么 currentMin = (level - 1) * 100
                                            const level = pointsAccount?.level || 1;
                                            const actualCurrentMin = (level - 1) * 100;
                                            
                                            // 计算进度百分比
                                            const progress = nextMin > actualCurrentMin 
                                                ? ((current - actualCurrentMin) / (nextMin - actualCurrentMin)) * 100 
                                                : 0;
                                            
                                            // 设置最小宽度为3%，确保有积分时至少能看到一点进度
                                            const displayProgress = current > 0 ? Math.max(3, Math.min(100, progress)) : 0;
                                            
                                            return (
                                                <div 
                                                    className="h-full bg-gradient-to-r from-[#56B949] to-[#30499B] rounded-full relative transition-all duration-500"
                                                    style={{ width: `${displayProgress}%` }}
                                                >
                                                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] skew-x-[-100%]"></div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Lv.{pointsAccount?.level || 1}</span>
                                        <span>Lv.{(pointsAccount?.level || 1) + 1}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 右侧按钮 */}
                            <div className="flex-shrink-0 flex md:flex-col gap-3">
                                <Link href={`/${locale}/points/exchange`}>
                                    <button className="w-full px-6 py-2.5 rounded-xl bg-[#56B949] text-white text-sm font-semibold shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] transition-all hover:-translate-y-0.5 whitespace-nowrap">
                                        {t('exchangeStore', '兑换商城')}
                                    </button>
                                </Link>
                                <Link href={`/${locale}/points/history`}>
                                    <button className="w-full px-6 py-2.5 rounded-xl bg-white text-[#30499B] border border-slate-200 text-sm font-semibold hover:border-[#30499B]/30 transition-all hover:bg-slate-50 whitespace-nowrap">
                                        {t('pointsHistory', '积分记录')}
                                    </button>
                                </Link>
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
                            <h3 className="text-xl font-bold text-[#30499B] font-serif">
                                {t('signInCalendar', '签到日历')}
                            </h3>
                            <div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                {t('currentMonth', 'May 2024', { month: new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'long' }) })}
                            </div>
                        </div>

                        {/* 日历可视区域 */}
                        <div className="bg-slate-50 rounded-xl p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden border border-slate-100">
                            {/* 装饰背景 */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#56B949]/20 via-[#F0A32F]/20 to-[#30499B]/20"></div>

                            <div className="grid grid-cols-7 gap-2 sm:gap-4 w-full text-center">
                                {/* 星期头 */}
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="text-xs text-slate-400 pb-2">{day}</div>
                                ))}

                                {/* 日期格子 */}
                                {weekDays.map((date, index) => {
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    const isFuture = date > new Date() && !isToday;
                                    const dayNum = date.getDate();

                                    // 简单的模拟状态逻辑
                                    // 如果是今天，根据 todaySignin 判断
                                    // 如果是过去，假设前几天已签到 (根据 consecutiveDays 推断)
                                    const consecutiveDays = todaySignin?.consecutiveDays || 0;
                                    // 今天的 index 是 index. index < (今天index) 的是从周一开始的天数
                                    // 简单起见，我们只处理今天和未来，过去的日子显示为"漏签"或者随机，
                                    // 但为了展示"连续签到"，我们可以倒推：
                                    // 如果今天已签到(consecutiveDays >= 1)，那今天亮。
                                    // 昨天(index-1) 如果 consecutiveDays >= 2，那昨天亮...

                                    const todayIndex = (new Date().getDay() || 7) - 1;
                                    const distFromToday = todayIndex - index; // 0 for today, 1 for yesterday

                                    const isSigned = (isToday && !!todaySignin) ||
                                        (distFromToday > 0 && todaySignin && distFromToday < todaySignin.consecutiveDays);

                                    // 过去且未签到 -> 漏签
                                    const isMissed = !isFuture && !isToday && !isSigned;

                                    if (isFuture) {
                                        return (
                                            <div key={index} className="aspect-square rounded-lg bg-white border border-transparent flex flex-col items-center justify-center text-slate-300">
                                                {dayNum}
                                            </div>
                                        );
                                    }

                                    if (isToday) {
                                        return (
                                            <div
                                                key={index}
                                                onClick={handleCheckIn}
                                                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-300 ${todaySignin
                                                    ? 'bg-white border border-[#56B949]/30 hover:shadow-md cursor-default'
                                                    : 'bg-[#56B949]/5 border-2 border-[#56B949] hover:bg-[#56B949]/10 hover:scale-105 cursor-pointer'
                                                    }`}
                                            >
                                                <span className={`text-[10px] font-bold absolute top-1 left-1 ${todaySignin ? 'text-slate-400' : 'text-[#56B949]'}`}>
                                                    {dayNum}
                                                </span>

                                                {todaySignin ? (
                                                    <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" />
                                                ) : (
                                                    <div className="text-xs font-bold text-[#56B949]">{signingIn ? '...' : t('calendar.signIn', '签到')}</div>
                                                )}

                                                {showCheckInAnimation && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-8 rounded-full bg-[#56B949]/20 animate-ping"></div>
                                                        <Sprout className="w-6 h-6 text-[#56B949] absolute animate-bounce" />
                                                    </div>
                                                )}

                                                <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">
                                                    {todaySignin ? `${t('calendar.signedIn', '已签到')} +${todaySignin.points}` : t('calendar.clickToSignIn', '点击签到')}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isSigned) {
                                        return (
                                            <div key={index} className="aspect-square rounded-lg bg-white border border-[#56B949]/30 flex flex-col items-center justify-center relative group hover:shadow-md transition-shadow">
                                                <span className="text-[10px] text-slate-400 absolute top-1 left-1">{dayNum}</span>
                                                <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" style={{ animationDelay: `${index * 0.1}s` }} />
                                                <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">{t('status.signedIn', '已签到')}</div>
                                            </div>
                                        );
                                    }

                                    // Missed
                                    return (
                                        <div key={index} className="aspect-square rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center relative group grayscale">
                                            <span className="text-[10px] text-slate-400 absolute top-1 left-1">{dayNum}</span>
                                            <Leaf className="w-5 h-5 text-[#8b5a2b] rotate-45 opacity-60" />
                                            <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">{t('status.missed', '漏签')}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-xs sm:text-sm text-slate-500 font-medium px-2">
                            <span>{t('calendar.signedDays', '已签到')} <b className="text-[#30499B]">{todaySignin ? todaySignin.consecutiveDays : 0}</b> {t('calendar.days', '天')}</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>{t('calendar.consecutiveDays', '连续签到')} <b className="text-[#30499B]">{todaySignin ? todaySignin.consecutiveDays : 0}</b> {t('calendar.days', '天')}</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>{t('calendar.missedDays', '已漏签')} <b className="text-[#EE4035]">2</b> {t('calendar.days', '天')}</span>
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
                            <h3 className="text-xl font-bold text-[#30499B] font-serif">{t('dailyTasks', '每日任务')}</h3>
                            <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">
                                {t('tasksRemaining', '今日剩余')} {dailyTasks.filter(t => t.status !== 3).length}
                            </span>
                        </div>

                        {loadingTasks ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#30499B]/20 border-t-[#30499B] rounded-full animate-spin"></div>
                            </div>
                        ) : dailyTasks.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                {t('tasks.noTasks', '暂无任务')}
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1">
                                {dailyTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-colors border ${task.status === 3
                                            ? 'bg-slate-50 border-transparent'
                                            : task.progress >= task.target
                                                ? 'bg-[#F0A32F]/5 border-[#F0A32F]/20 relative overflow-hidden'
                                                : 'bg-slate-50 hover:bg-[#30499B]/5 group border-transparent hover:border-[#30499B]/10'
                                            }`}
                                    >
                                        {task.progress >= task.target && task.status !== 3 && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                        )}

                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${task.status === 3
                                                ? 'bg-[#56B949]/10 text-[#56B949]'
                                                : 'bg-white text-[#30499B]'
                                                }`}>
                                                {task.status === 3 ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <BookOpen className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${task.status === 3 ? 'text-slate-400 line-through' : 'text-[#30499B]'
                                                    }`}>
                                                    {task.name === 'readArticle' ? t('mockTasks.readArticle', '阅读环保文章') : task.name === 'shareKnowledge' ? t('mockTasks.shareKnowledge', '分享环保知识') : task.name}
                                                </div>
                                                <div className={`text-xs font-medium ${task.status === 3 ? 'text-slate-400' : 'text-[#F0A32F]'
                                                    }`}>
                                                    {task.status === 3 ? t('tasks.completed', '已完成') : `+${task.points} ${t('points', '积分')}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className={`text-xs font-medium ${task.status === 3
                                                ? 'text-[#56B949]'
                                                : task.progress >= task.target
                                                    ? 'text-[#F0A32F]'
                                                    : 'text-slate-400 group-hover:text-[#30499B]'
                                                }`}>
                                                {task.progress}/{task.target}
                                            </span>

                                            {task.status === 3 ? (
                                                <button className="px-3 py-1.5 bg-slate-100 text-xs font-medium text-slate-400 rounded-lg cursor-not-allowed">
                                                    {t('tasks.completed', '已完成')}
                                                </button>
                                            ) : task.progress >= task.target ? (
                                                <button
                                                    onClick={() => handleClaimTask(task.id)}
                                                    disabled={claimingTask === task.id}
                                                    className="px-3 py-1.5 bg-[#F0A32F] text-xs font-medium text-white rounded-lg shadow-md shadow-[#F0A32F]/30 hover:bg-[#d9901e] transition-all animate-pulse disabled:opacity-50"
                                                >
                                                    {claimingTask === task.id ? t('tasks.claiming', '领取中...') : t('tasks.claim', '领取')}
                                                </button>
                                            ) : (
                                                <button className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-600 rounded-lg hover:border-[#30499B] hover:text-[#30499B] transition-all">
                                                    {t('tasks.goComplete', '去完成')}
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
                        <h3 className="text-xl font-bold text-[#30499B] font-serif">
                            {t('dailyQuiz', '每日问答')}
                        </h3>


                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Backend Daily Quiz */}
                        {true && (
                            <motion.div
                                variants={staggerItem}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden md:col-span-2 lg:col-span-3"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#56B949]/5 rounded-bl-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-[#30499B] text-white text-xs font-bold flex items-center justify-center">Q</div>
                                            <span className="text-xs text-[#30499B] font-medium">
                                                +{todayQuiz?.points ?? 0} 积分
                                            </span>
                                        </div>

                                        {todayQuiz?.answered && (
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${todayQuiz?.isCorrect ? 'bg-[#56B949]/10 text-[#56B949]' : 'bg-[#EE4035]/10 text-[#EE4035]'}`}>
                                                {todayQuiz?.isCorrect ? t('status.correct', '已答对') : t('status.answered', '已答过')}
                                            </span>
                                        )}
                                    </div>

                                    {!todayQuiz ? (
                                        <div className="text-sm text-slate-500">
                                            {t('quiz.noQuizToday', '今天暂无问答')}
                                        </div>
                                    ) : todayQuiz && (
                                        <>
                                            <h4 className="text-sm font-semibold text-[#30499B] mb-3">
                                                {(todayQuiz!.question as any)?.title ?? (todayQuiz!.question as any)?.question ?? t('quiz.title', 'Daily Quiz')}
                                            </h4>

                                            {Array.isArray((todayQuiz!.question as any)?.options) ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                                    {((todayQuiz!.question as any).options as any[]).map((option, index) => {
                                                        const optionId = typeof option?.id === 'number' ? option.id : index + 1;
                                                        const selected = quizAnswer === optionId;
                                                        return (
                                                            <button
                                                                key={optionId}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (todayQuiz!.answered || quizSubmitted) return;
                                                                    setQuizAnswer(optionId);
                                                                    setQuizResult(null);
                                                                    setQuizSubmitted(false);
                                                                }}
                                                                className={`w-full text-left p-3 rounded-xl text-xs transition-all border ${selected
                                                                    ? 'border-[#56B949] bg-[#56B949]/10'
                                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                                                    } ${todayQuiz!.answered ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                                disabled={todayQuiz!.answered}
                                                            >
                                                                {option?.text ?? option?.label ?? String(optionId)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="mb-4">
                                                    <input
                                                        type="number"
                                                        placeholder={t('quiz.enterNumber', '请输入数字')}
                                                        className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:border-[#56B949] focus:outline-none"
                                                        value={quizAnswer ?? ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setQuizAnswer(v === '' ? null : Number(v));
                                                            setQuizResult(null);
                                                            setQuizSubmitted(false);
                                                        }}
                                                        disabled={todayQuiz!.answered}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleSubmitQuiz}
                                                    disabled={!todayQuiz || todayQuiz!.answered || quizSubmitted || quizAnswer === null}
                                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#30499B] text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                                                >
                                                    {t('quiz.submit', '提交')}
                                                </button>

                                                {quizResult && (
                                                    <div className={`text-xs font-medium ${quizResult!.correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                                        {quizResult!.correct ? t('quiz.correctAnswer', '✓ 回答正确！') : t('quiz.wrongAnswer', '✗ 回答错误')}
                                                        {quizResult!.correct && quizResult!.earnedPoints ? ` +${quizResult!.earnedPoints}` : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}


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
    const { t } = useSafeTranslation('common');
    return (
        <ProtectedRoute>
            <Suspense fallback={
                <Layout>
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#d9901e] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                                YL
                            </div>
                            <p className="text-slate-600">{t('loading', '加载中...')}</p>
                        </div>
                    </div>
                </Layout>
            }>
                <PointsPageContent />
            </Suspense>
        </ProtectedRoute>
    );
}
