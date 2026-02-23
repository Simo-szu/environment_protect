'use client';
/* eslint-disable @next/next/no-img-element */

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

export default function GamePage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

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
                    className="w-full bg-[#F0F8FF] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row min-h-[640px] mb-16"
                >
                    {/* 左侧内容面板 */}
                    <div className="w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-center relative bg-[#F0F8FF] dark:bg-slate-900">
                        {/* 头部图标和日期 */}
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-full border border-[#00C087]/30 bg-white dark:bg-slate-800 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-[#00C087] fill-current" />
                            </div>
                            <span className="text-xs font-mono text-slate-400 tracking-wider">
                                {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                            </span>
                        </div>

                        {/* 主标题 */}
                        <div className="space-y-2 mb-8">
                            <h1 className="text-5xl md:text-6xl font-bold text-[#1E293B] dark:text-white tracking-tight font-sans">
                                {t('cover.city', '深圳')}
                            </h1>
                            <h1 className="text-5xl md:text-6xl font-bold text-[#00C087] tracking-tight font-sans">
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
                                className="group w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-4 px-6 rounded-xl flex items-center justify-between transition-all duration-300 shadow-xl shadow-slate-900/10"
                            >
                                <span className="font-semibold text-sm tracking-wide">
                                    {t('cover.startPlanning', '开始规划')}
                                </span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => router.push(`/${locale}/game/tutorial`)}
                                className="group w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white py-4 px-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all duration-300"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00C087]/60 via-[#00C087]/20 to-transparent mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f172a]/30"></div>

                        {/* 玻璃态统计卡片 */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 backdrop-blur-md bg-white/10 rounded-2xl p-6 text-white border border-white/20 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] text-white/70 mb-0.5">当前目标</p>
                                    <p className="text-[10px] text-white/50 scale-90 origin-left">碳排放总量目标</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-[#00C087] shadow-[0_0_10px_#00C087]"></div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold font-sans tracking-tight">300</span>
                                    <span className="text-lg font-medium text-white/80">Mt</span>
                                </div>
                                {/* 进度条 */}
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00C087] w-[65%] rounded-full shadow-[0_0_10px_rgba(0,192,135,0.5)]"></div>
                                </div>
                            </div>

                            {/* 次要统计网格 */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <div className="text-[20px] font-bold font-sans text-[#00C087]">17.6M</div>
                                    <div className="text-[9px] text-white/50 uppercase tracking-wider">市民总数</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[20px] font-bold font-sans text-[#00C087]">45.2%</div>
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
