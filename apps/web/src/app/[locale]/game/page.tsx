'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    Zap,
    ArrowRight,
    FileText,
    Leaf,
    Trophy
} from 'lucide-react';
import { staggerContainer, staggerItem, pageEnter } from '@/lib/animations';
import { readStoredGameSessionId } from './play/hooks/gamePlay.shared';

export default function GamePage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');
    const [hasSavedProgress, setHasSavedProgress] = useState(false);

    useEffect(() => {
        setHasSavedProgress(Boolean(readStoredGameSessionId()));
    }, []);

    return (
        <Layout>
            {/* 全局背景氛围 */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#56B949]/10 dark:bg-[#56B949]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '20s' }}></div>
                <div className="absolute bottom-[-20%] right-[10%] w-[80%] h-[60%] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '25s', animationDelay: '-5s' }}></div>
            </div>

            <div className="relative z-10">
                {/* 深圳低碳规划师主要区域 */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={pageEnter}
                    className="yl-panel flex min-h-[640px] w-full flex-col overflow-hidden rounded-[2rem] mb-16 lg:flex-row"
                >
                    {/* 左侧内容面板 */}
                    <div className="relative flex w-full flex-col justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(240,248,255,0.88))] p-8 md:p-14 dark:bg-slate-900 lg:w-1/2">
                        {/* 头部图标和日期 */}
                        <div className="flex items-center gap-4 mb-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#56B949]/30 bg-white dark:bg-slate-800">
                                <Zap className="w-5 h-5 fill-current text-[#56B949]" />
                            </div>
                            <span className="text-xs font-mono text-slate-400 tracking-wider">
                                {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                            </span>
                        </div>

                        {/* 主标题 */}
                        <div className="space-y-2 mb-8">
                            <h1 className="text-5xl font-bold tracking-tight text-[#1E293B] dark:text-white md:text-6xl">
                                {t('cover.city', '深圳')}
                            </h1>
                            <h1 className="text-5xl font-bold tracking-tight text-[#56B949] md:text-6xl">
                                {t('cover.title', '低碳规划师')}
                            </h1>
                        </div>

                        {/* 描述 */}
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-[15px] leading-7 max-w-md mb-12 font-medium">
                            {t('cover.description', '构建可持续发展的未来。通过科学决策平衡工业增长与环境保护，在这座科创之都谱写绿色篇章。')}
                        </p>

                        {/* 操作按钮 */}
                        <div className="flex flex-col gap-4 max-w-xs w-full">
                            <button
                                onClick={() => router.push(`/${locale}/game/play`)}
                                className="group flex w-full items-center justify-between rounded-2xl bg-[#30499B] px-6 py-4 text-white shadow-xl shadow-[#30499B]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#253a7a]"
                            >
                                <span className="font-semibold text-sm tracking-wide">
                                    {t('cover.startPlanning', '开始规划')}
                                </span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => router.push(`/${locale}/game/play?new=1`)}
                                className="group flex w-full items-center justify-between rounded-2xl border border-white/80 bg-white/85 px-6 py-4 text-[#0F172A] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                                <span className="font-bold text-sm tracking-wide">
                                    {t('cover.newGame', '新开一局')}
                                </span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            {hasSavedProgress && (
                                <button
                                    onClick={() => router.push(`/${locale}/game/play`)}
                                    className="group flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-4 text-emerald-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15"
                                >
                                    <span className="font-bold text-sm tracking-wide">
                                        {t('cover.continueGame', '继续上次进度')}
                                    </span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                            <button
                                onClick={() => router.push(`/${locale}/game/play?tutorial=1`)}
                                className="group flex w-full items-center justify-between rounded-2xl border border-white/80 bg-white/85 px-6 py-4 text-[#0F172A] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                                <span className="font-bold text-sm tracking-wide">
                                    {t('cover.tutorial', '新手教程')}
                                </span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* 底部注释 */}
                        <div className="mt-12 lg:absolute lg:bottom-10 lg:left-14">
                            <p className="text-[10px] text-slate-400 font-medium">
                                {t('cover.footer', '深圳市低碳办公室 © 2026 基于真实城市数据模拟')}
                            </p>
                        </div>
                    </div>

                    {/* 右侧视觉面板 */}
                    <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full overflow-hidden group">
                        {/* 城市背景图片 */}
                        <img
                            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80"
                            alt="Shenzhen City"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* 绿色叠加渐变 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#56B949]/60 via-[#56B949]/18 to-transparent mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f172a]/30"></div>

                        {/* 玻璃态统计卡片 */}
                        <div className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] text-white/70 mb-0.5">当前目标</p>
                                    <p className="text-[10px] text-white/50 scale-90 origin-left">碳排放总量目标</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-[#56B949] shadow-[0_0_10px_#56B949]"></div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold font-sans tracking-tight">300</span>
                                    <span className="text-lg font-medium text-white/80">Mt</span>
                                </div>
                                {/* 进度条 */}
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[65%] rounded-full bg-[#56B949] shadow-[0_0_10px_rgba(86,185,73,0.5)]"></div>
                                </div>
                            </div>

                            {/* 次要统计网格 */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <div className="text-[20px] font-bold text-[#56B949]">17.6M</div>
                                    <div className="text-[9px] text-white/50 uppercase tracking-wider">市民总数</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[20px] font-bold text-[#56B949]">45.2%</div>
                                    <div className="text-[9px] text-white/50 uppercase tracking-wider">绿建覆盖</div>
                                </div>
                            </div>

                            {/* 浮动标签 */}
                            <div className="absolute -top-10 right-0 bg-white/10 backdrop-blur-sm px-3 py-1 rounded text-[10px] text-white/80 border border-white/10">
                                实时检测
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </Layout>
    );
}
