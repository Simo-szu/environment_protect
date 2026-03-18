'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Coins,
    User,
    CheckCircle,
    BookOpen,
    Footprints
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter } from '@/lib/animations';
import { pointsApi, userApi } from '@/lib/api';
import type { PointsAccount, DailyTask } from '@/lib/api/points';

const taskCodeToI18nKey: Record<string, string> = {
    read_content: 'taskNames.readContent',
    post_comment: 'taskNames.postComment',
    join_activity: 'taskNames.joinActivity',
    like_content: 'taskNames.likeContent',
    share_content: 'taskNames.shareContent',
    complete_quiz: 'taskNames.completeQuiz',
};

function PointsPageContent() {
    const { user, isLoggedIn } = useAuth();
    const { t, locale } = useSafeTranslation('points');

    // 积分账户数据
    const [pointsAccount, setPointsAccount] = useState<PointsAccount | null>(null);
    const [loadingAccount, setLoadingAccount] = useState(false);

    // 积分动画状态
    const [displayPoints, setDisplayPoints] = useState(0);
    const [pointsIncrement, setPointsIncrement] = useState<number | null>(null);
    const [walkingSteps, setWalkingSteps] = useState(0);
    const [walkingClaimed, setWalkingClaimed] = useState(false);
    const [syncingSteps, setSyncingSteps] = useState(false);
    const WALKING_DAILY_TARGET = 5000;
    const WALKING_REWARD_POINTS = 10;

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

    const getTaskDisplayName = (task: DailyTask) => {
        const normalizedCode = task.code?.toLowerCase();
        const i18nKey = normalizedCode ? taskCodeToI18nKey[normalizedCode] : undefined;
        if (i18nKey) return t(i18nKey, task.name);

        if (task.name === 'readArticle') return t('mockTasks.readArticle', '阅读环保文章');
        if (task.name === 'shareKnowledge') return t('mockTasks.shareKnowledge', '分享环保知识');
        return task.name;
    };

    const todayKey = new Date().toISOString().slice(0, 10);
    const walkingStorageKey = `points-walking-${todayKey}`;

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

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const raw = window.localStorage.getItem(walkingStorageKey);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as { steps?: number; claimed?: boolean };
            setWalkingSteps(parsed.steps ?? 0);
            setWalkingClaimed(Boolean(parsed.claimed));
        } catch {
            window.localStorage.removeItem(walkingStorageKey);
        }
    }, [walkingStorageKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(
            walkingStorageKey,
            JSON.stringify({ steps: walkingSteps, claimed: walkingClaimed })
        );
    }, [walkingSteps, walkingClaimed, walkingStorageKey]);

    // 加载每日任务
    useEffect(() => {
        const loadDailyTasks = async () => {
            try {
                const response = await pointsApi.getDailyTasks();
                setDailyTasks(response.items || []);
            } catch (error) {
                console.error('Failed to load daily tasks:', error);
                // 失败时不设置 loading 状态
            }
        };

        if (isLoggedIn) {
            loadDailyTasks();
        }
    }, [isLoggedIn]);

    const handleSyncWalkingSteps = async () => {
        if (walkingClaimed) return;
        try {
            setSyncingSteps(true);
            const simulatedSteps = Math.floor(3000 + Math.random() * 5000);
            setWalkingSteps(simulatedSteps);
        } finally {
            setSyncingSteps(false);
        }
    };

    const handleClaimWalkingReward = () => {
        if (walkingClaimed || walkingSteps < WALKING_DAILY_TARGET) return;

        setWalkingClaimed(true);
        setPointsIncrement(WALKING_REWARD_POINTS);
        setTimeout(() => setPointsIncrement(null), 2000);
        setPointsAccount((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                availablePoints: prev.availablePoints + WALKING_REWARD_POINTS,
                totalPoints: prev.totalPoints + WALKING_REWARD_POINTS,
                pointsToNextLevel: Math.max(0, (prev.pointsToNextLevel ?? 0) - WALKING_REWARD_POINTS),
            };
        });
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

    return (
        <Layout>
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,251,244,0.82))] px-4 py-12 text-center shadow-[0_30px_100px_-60px_rgba(67,121,74,0.58)] ring-1 ring-[#56B949]/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.68))] dark:ring-white/10 sm:py-14"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-10 top-0 h-44 w-44 rounded-full bg-[#EAF5DD] blur-3xl dark:bg-[#56B949]/15" />
                    <div className="absolute right-[-8%] top-8 h-56 w-56 rounded-full bg-[#F9EFD6] blur-3xl dark:bg-[#F0A32F]/12" />
                </div>
                <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-[#F0A32F]/15 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D18A1D] shadow-[0_10px_30px_-18px_rgba(240,163,47,0.72)] backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A32F] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0A32F]"></span>
                    </span>
                    {t('badge', '积分奖励系统')}
                </div>
                <h1 className="relative mx-auto mb-6 max-w-3xl text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1D3B2A] drop-shadow-sm dark:text-[#E9FBE9] sm:text-[3.3rem] md:text-[4.2rem]">
                    {t('title', '积分')}<span className="text-[#F0A32F]">{t('paradise', '乐园')}</span>
                </h1>
                <div className="relative mx-auto flex max-w-3xl flex-wrap items-stretch justify-center gap-2 px-4 text-base font-normal text-[#456252] dark:text-slate-300 sm:flex-nowrap sm:text-lg">
                    <div className="yl-chip flex h-14 items-center whitespace-nowrap px-5 leading-none">
                        <Coins className="h-5 w-5 shrink-0 self-center text-[#F0A32F]" />
                        <span className="flex h-full items-center leading-none">
                            {t('subtitle.complete', '完成')}
                            <span className="text-[#F0A32F] font-medium border-b-2 border-[#F0A32F]/30">{t('subtitle.tasks', '任务')}</span>
                            {t('subtitle.earnPoints', '赚积分，')}
                        </span>
                    </div>
                    <div className="yl-chip flex h-14 items-center whitespace-nowrap px-5 leading-none">
                        <span className="flex h-full items-center leading-none">
                            {t('subtitle.use', '用')}
                            <span className="text-[#56B949] font-medium border-b-2 border-[#56B949]/30">{t('subtitle.action', '行动')}</span>
                            {t('subtitle.getRewards', '换奖励')}
                        </span>
                    </div>
                </div>
            </motion.section>

            {/* 积分中心主体内容 */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="yl-page-surface px-4 py-12 space-y-16 sm:px-6 md:px-12"
            >

                {/* 1. 用户积分概览 User Overview */}
                <motion.section
                    variants={staggerItem}
                    className="yl-panel relative overflow-hidden p-6 md:p-8"
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
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center overflow-hidden">
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
                                    <span className="text-4xl md:text-5xl font-serif font-bold text-[#30499B] dark:text-[#56B949] transition-all duration-300">
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
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
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
                            <div className="flex-shrink-0 flex w-full md:w-auto flex-row md:flex-col gap-3 mt-2 md:mt-0">
                                <Link href={`/${locale}/points/exchange`} className="flex-1 w-full">
                                    <button className="w-full px-2 sm:px-6 py-3 md:py-2.5 rounded-xl bg-[#56B949] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] transition-all hover:-translate-y-0.5 truncate">
                                        {t('exchangeStore', '兑换商城')}
                                    </button>
                                </Link>
                                <Link href={`/${locale}/points/history`} className="flex-1 w-full">
                                    <button className="w-full px-2 sm:px-6 py-3 md:py-2.5 rounded-xl bg-white dark:bg-slate-800 text-[#30499B] dark:text-[#56B949] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold hover:border-[#30499B]/30 dark:hover:border-[#56B949]/50 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 truncate">
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
                    <motion.section
                        variants={cardEnter}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#30499B] dark:text-[#56B949] font-serif">
                                {t('walking.title', '步行记录')}
                            </h3>
                            <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">
                                +{WALKING_REWARD_POINTS} {t('points', '积分')}
                            </span>
                        </div>

                        <div className="flex-1 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#56B949]/10 text-[#56B949] flex items-center justify-center">
                                    <Footprints className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">{t('walking.todaySteps', '今日步数')}</p>
                                    <p className="text-2xl font-bold text-[#30499B] dark:text-slate-100">{walkingSteps.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>{t('walking.target', '目标')} {WALKING_DAILY_TARGET.toLocaleString()}</span>
                                    <span>{Math.min(100, Math.floor((walkingSteps / WALKING_DAILY_TARGET) * 100))}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#56B949] to-[#30499B] transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.floor((walkingSteps / WALKING_DAILY_TARGET) * 100))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={handleSyncWalkingSteps}
                                    disabled={syncingSteps || walkingClaimed}
                                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-[#30499B] dark:hover:border-[#56B949] transition disabled:opacity-50"
                                >
                                    {syncingSteps ? t('walking.syncing', '同步中...') : t('walking.sync', '同步步行记录')}
                                </button>
                                <button
                                    onClick={handleClaimWalkingReward}
                                    disabled={walkingClaimed || walkingSteps < WALKING_DAILY_TARGET}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#56B949] text-white hover:bg-[#4aa840] transition disabled:opacity-50"
                                >
                                    {walkingClaimed
                                        ? t('walking.claimed', '今日已领取')
                                        : t('walking.claim', '领取步行积分')}
                                </button>
                            </div>

                            <p className="mt-4 text-xs text-slate-500">
                                {t('walking.tip', '每日步数达到目标后可领取积分奖励，每天仅可领取一次。')}
                            </p>
                        </div>
                    </motion.section>

                    {/* 3. 每日任务 Daily Tasks */}
                    <motion.section
                        variants={cardEnter}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#30499B] dark:text-[#56B949] font-serif">{t('dailyTasks', '每日任务')}</h3>
                            <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">
                                {t('tasksRemaining', '今日剩余')} {Array.isArray(dailyTasks) ? dailyTasks.filter(t => t.status !== 3).length : 0}
                            </span>
                        </div>

                        {loadingTasks ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#30499B]/20 border-t-[#30499B] rounded-full animate-spin"></div>
                            </div>
                        ) : !Array.isArray(dailyTasks) || dailyTasks.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                {t('tasks.noTasks', '暂无任务')}
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1">
                                {dailyTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-colors border ${task.status === 3
                                            ? 'bg-slate-50 dark:bg-slate-700/50 border-transparent'
                                            : task.progress >= task.target
                                                ? 'bg-[#F0A32F]/5 border-[#F0A32F]/20 relative overflow-hidden'
                                                : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-[#30499B]/5 dark:hover:bg-slate-600 group border-transparent hover:border-[#30499B]/10 dark:hover:border-slate-500'
                                            }`}
                                    >
                                        {task.progress >= task.target && task.status !== 3 && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                        )}

                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${task.status === 3
                                                ? 'bg-[#56B949]/10 text-[#56B949]'
                                                : 'bg-white dark:bg-slate-800 text-[#30499B] dark:text-[#56B949]'
                                                }`}>
                                                {task.status === 3 ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <BookOpen className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${task.status === 3 ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-[#30499B] dark:text-slate-200'
                                                    }`}>
                                                    {getTaskDisplayName(task)}
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
                                                <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:border-[#30499B] dark:hover:border-[#56B949] hover:text-[#30499B] dark:hover:text-[#56B949] transition-all">
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
