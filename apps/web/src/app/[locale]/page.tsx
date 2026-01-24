'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Leaf, BarChart3, Trash2, ArrowRight, Trees, Waves, PlayCircle, Coins, Footprints, Trash, Recycle } from 'lucide-react';
import { useAuth, showLoginPrompt } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useClientMounted } from '@/hooks/useClientMounted';

interface CardData {
    id: string;
    title: string;
    sub: string;
    color: string;
    icon: React.ComponentType<any>;
    link: string;
}

export default function HomePage() {
    const { isLoggedIn } = useAuth();
    const [activeIndex, setActiveIndex] = useState(1);
    const mounted = useClientMounted();
    const t = useTranslations('home');

    const cardsData: CardData[] = [
        {
            id: 'points',
            title: t('cards.points.title'),
            sub: t('cards.points.subtitle'),
            color: '#F0A32F',
            icon: Coins,
            link: '/zh/points'
        },
        {
            id: 'game',
            title: t('cards.game.title'),
            sub: t('cards.game.subtitle'),
            color: '#56B949',
            icon: PlayCircle,
            link: '/zh/game'
        },
        {
            id: 'science',
            title: t('cards.science.title'),
            sub: t('cards.science.subtitle'),
            color: '#30499B',
            icon: Leaf,
            link: '/zh/science'
        },
        {
            id: 'activity',
            title: t('cards.activity.title'),
            sub: t('cards.activity.subtitle'),
            color: '#EE4035',
            icon: Trees,
            link: '/zh/activities'
        }
    ];

    const handleCardClick = (index: number, data: CardData) => {
        if (index !== activeIndex) {
            const diff = index - activeIndex;
            if (diff === 1 || diff === -3) {
                moveCarousel(1);
            } else if (diff === -1 || diff === 3) {
                moveCarousel(-1);
            } else {
                moveCarousel(2);
            }
        } else {
            // 处理点击事件 - 积分需要登录验证
            if (data.id === 'points' && !isLoggedIn) {
                showLoginPrompt('请先登录再查看积分');
            } else {
                window.location.href = data.link;
            }
        }
    };

    const moveCarousel = (direction: number) => {
        const total = cardsData.length;
        setActiveIndex((prev) => (prev + direction + total) % total);
    };

    const getPositionClass = (index: number) => {
        const total = cardsData.length;
        const offset = (index - activeIndex + total) % total;

        if (offset === 0) return 'pos-1'; // Center (Active)
        if (offset === 1) return 'pos-2'; // Right
        if (offset === total - 1) return 'pos-0'; // Left
        return 'pos-3'; // Hidden
    };

    const getCardStyle = (index: number) => {
        const offset = (index - activeIndex + cardsData.length) % cardsData.length;
        const isActive = offset === 0;

        return {
            backgroundColor: isActive ? cardsData[index].color : '#ffffff',
            borderColor: isActive ? 'transparent' : `${cardsData[index].color}20`,
            boxShadow: isActive
                ? `0 15px 30px -8px ${cardsData[index].color}40`
                : '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
        };
    };

    const handlePointsClick = () => {
        if (!isLoggedIn) {
            showLoginPrompt('请先登录再查看积分');
        } else {
            window.location.href = '/zh/points';
        }
    };

    return (
        <Layout>
            {/* Hero Section */}
            <AnimatedSection
                useInView={false}
                className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white dark:from-slate-900 via-[#56B949]/5 dark:via-[#56B949]/10 to-white dark:to-slate-900 transition-colors duration-300"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-semibold mb-4 border border-[#F0A32F]/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A32F] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0A32F]"></span>
                    </span>
                    {t('slogan')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] dark:text-[#56B949] mb-6 drop-shadow-sm leading-tight font-serif transition-colors duration-300">
                    {t('title')}
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 dark:text-slate-300 font-normal max-w-lg mx-auto leading-relaxed px-4 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                        <Recycle className="w-5 h-5 text-[#56B949] dark:text-[#56B949]" />
                        <span>{t('subtitle')}</span>
                    </div>
                </div>
            </AnimatedSection>

            {/* Interactive Carousel Section */}
            <section className="relative w-full max-w-4xl mx-auto h-[360px] flex items-center justify-center my-4">
                {/* Prev Button */}
                <button
                    onClick={() => moveCarousel(-1)}
                    className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white hover:bg-slate-50 text-slate-300 hover:text-[#30499B] transition-all duration-300 border border-slate-100 shadow-sm hover:shadow-md hover:scale-105 group"
                >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5px] group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* Carousel Track */}
                <div className="carousel-container w-full h-full relative" style={{ perspective: '1000px', overflow: 'hidden' }}>
                    {cardsData.map((data, index) => {
                        const Icon = data.icon;
                        const positionClass = getPositionClass(index);
                        const isActive = positionClass === 'pos-1';

                        return (
                            <div
                                key={data.id}
                                className={`carousel-item rounded-[1.5rem] shadow-sm transition-all duration-500 ${positionClass}`}
                                style={getCardStyle(index)}
                                onClick={() => handleCardClick(index, data)}
                            >
                                {/* Active Content */}
                                <div className={`card-content-active flex flex-col items-center justify-center text-center w-full h-full relative overflow-hidden p-4 z-20 ${isActive ? 'flex opacity-100' : 'hidden opacity-0'}`}>
                                    <Icon className="w-10 h-10 text-white mb-3 stroke-[1.5]" />
                                    <h3 className="text-2xl text-white font-serif font-medium leading-tight mb-4 whitespace-nowrap">
                                        {data.title}
                                    </h3>
                                    <button className="glass-btn px-4 py-1.5 rounded-full text-white text-xs font-medium hover:bg-white/30 transition-colors">
                                        进入
                                    </button>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                </div>

                                {/* Inactive Content */}
                                <div className={`card-content-inactive flex flex-col items-center justify-center text-center w-full h-full relative overflow-hidden p-4 z-10 ${!isActive ? 'flex opacity-100' : 'hidden opacity-0'}`}>
                                    <div
                                        className="decor-circle w-16 h-16 absolute opacity-10 transition-all duration-500"
                                        style={{
                                            backgroundColor: data.color,
                                            ...(index % 4 === 0 ? { top: 0, right: 0, borderBottomLeftRadius: '100%' } :
                                                index % 4 === 1 ? { top: 0, left: 0, borderBottomRightRadius: '100%' } :
                                                    index % 4 === 2 ? { bottom: 0, left: 0, borderTopRightRadius: '100%' } :
                                                        { bottom: 0, right: 0, borderTopLeftRadius: '100%' })
                                        }}
                                    ></div>
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: `${data.color}15` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: data.color }} />
                                    </div>
                                    <h3 className="text-lg font-serif font-bold mb-1 whitespace-nowrap text-[#30499B]">
                                        {data.title.replace('\n', '')}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium">{data.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => moveCarousel(1)}
                    className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white hover:bg-slate-50 text-slate-300 hover:text-[#30499B] transition-all duration-300 border border-slate-100 shadow-sm hover:shadow-md hover:scale-105 group"
                >
                    <ChevronRight className="w-5 h-5 stroke-[2.5px] group-hover:translate-x-0.5 transition-transform" />
                </button>
            </section>

            {/* Main Content Grid */}
            <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
                {/* Section: Science Materials */}
                <AnimatedSection delay={0.1}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#30499B] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">科普资料</h2>
                                <p className="text-xs text-slate-400 mt-1">TRUSTWORTHY KNOWLEDGE</p>
                            </div>
                        </div>
                        <Link href="/zh/science" className="text-sm text-[#30499B] dark:text-[#56B949] hover:underline decoration-[#30499B]/50 underline-offset-4">
                            查看全部 -&gt;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Item 1 */}
                        <AnimatedSection delay={0.2}>
                            <Link href="/zh/science" className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer block">
                                {mounted && (
                                    <motion.div whileHover={{ y: -4 }}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] shadow-sm ring-1 ring-[#30499B]/10">
                                                <Leaf className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">GUIDE</span>
                                        </div>
                                        <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2">2024 可持续生活指南</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">涵盖衣食住行各个方面的减碳小技巧，附带详细数据支持。</p>
                                        <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                        <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                            阅读报告 <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </motion.div>
                                )}
                            </Link>
                        </AnimatedSection>

                        {/* Item 2 */}
                        <AnimatedSection delay={0.3}>
                            <Link href="/zh/science" className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer block">
                                {mounted && (
                                    <motion.div whileHover={{ y: -4 }}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] shadow-sm ring-1 ring-[#30499B]/10">
                                                <BarChart3 className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">DATA</span>
                                        </div>
                                        <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2">全球碳排放最新数据</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">实时更新的全球环境监测数据，可视化图表分析。</p>
                                        <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                        <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                            查看详情 <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </motion.div>
                                )}
                            </Link>
                        </AnimatedSection>

                        {/* Item 3 */}
                        <AnimatedSection delay={0.4}>
                            <Link href="/zh/science" className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer block">
                                {mounted && (
                                    <motion.div whileHover={{ y: -4 }}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] shadow-sm ring-1 ring-[#30499B]/10">
                                                <Trash2 className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">TIPS</span>
                                        </div>
                                        <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2">高效废弃物回收术</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">如何正确分类？哪些可以变废为宝？专家视频讲解。</p>
                                        <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                        <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                            立即学习 <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </motion.div>
                                )}
                            </Link>
                        </AnimatedSection>
                    </div>
                </AnimatedSection>

                {/* Section: Popular Activities */}
                <AnimatedSection delay={0.5}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#EE4035] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">热门活动</h2>
                                <p className="text-xs text-slate-400 mt-1">JOIN THE ACTION</p>
                            </div>
                        </div>
                        <Link href="/zh/activities" className="text-sm text-[#30499B] dark:text-[#56B949] hover:underline decoration-[#30499B]/50 underline-offset-4">
                            查看全部 -&gt;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Activity 1 */}
                        <AnimatedSection delay={0.6}>
                            <div className="relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300">
                                {mounted && (
                                    <motion.div whileHover={{ y: -4 }}>
                                        <div className="absolute top-3 left-3 z-10 bg-[#EE4035] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">HOT</div>
                                        <div className="h-32 bg-[#F0A32F]/10 dark:bg-[#F0A32F]/20 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#EE4035]/10 rounded-full"></div>
                                            <Trees className="w-12 h-12 text-[#F0A32F]/60 transform group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-5 border-x border-b border-slate-100 dark:border-slate-700 rounded-b-xl">
                                            <h3 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949] mb-1">城市植树节</h3>
                                            <p className="text-xs text-slate-400 mb-4">2024.05.12 · 城市公园</p>
                                            <Link href="/zh/activities">
                                                <button className="w-full py-2 rounded-lg bg-white dark:bg-slate-700 border border-[#EE4035] text-[#EE4035] text-sm font-medium hover:bg-[#EE4035] hover:text-white transition-all active:scale-95">立即报名</button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </AnimatedSection>

                        {/* Activity 2 */}
                        <AnimatedSection delay={0.7}>
                            <div className="relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300">
                                {mounted && (
                                    <motion.div whileHover={{ y: -4 }}>
                                        <div className="h-32 bg-[#30499B]/10 dark:bg-[#30499B]/20 flex items-center justify-center relative overflow-hidden">
                                            <Waves className="w-12 h-12 text-[#30499B]/60 transform group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-5 border-x border-b border-slate-100 dark:border-slate-700 rounded-b-xl">
                                            <h3 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949] mb-1">海滩净滩行动</h3>
                                            <p className="text-xs text-slate-400 mb-4">2024.06.05 · 阳光海滩</p>
                                            <Link href="/zh/activities">
                                                <button className="w-full py-2 rounded-lg bg-[#30499B] text-white text-sm font-medium hover:bg-[#253a7a] transition-all shadow-lg shadow-[#30499B]/20 active:scale-95">一键参加</button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </AnimatedSection>

                        {/* Activity 3 */}
                        <AnimatedSection delay={0.8}>
                            <div className="relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300">
                                {mounted && (
                                    <motion.div whileHover={{ y: -4 }}>
                                        <div className="h-32 bg-[#56B949]/10 dark:bg-[#56B949]/20 flex items-center justify-center relative overflow-hidden">
                                            <Recycle className="w-12 h-12 text-[#56B949]/60 transform group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-5 border-x border-b border-slate-100 dark:border-slate-700 rounded-b-xl">
                                            <h3 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949] mb-1">社区旧物交换</h3>
                                            <p className="text-xs text-slate-400 mb-4">每周六 · 社区中心</p>
                                            <Link href="/zh/activities">
                                                <button className="w-full py-2 rounded-lg bg-white dark:bg-slate-700 border border-[#56B949] text-[#56B949] text-sm font-medium hover:bg-[#56B949] hover:text-white transition-all active:scale-95">查看详情</button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </AnimatedSection>
                    </div>
                </AnimatedSection>

                {/* Section: Eco Game */}
                <AnimatedSection delay={0.9}>
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-[#56B949]/20">
                        {mounted && (
                            <motion.div whileHover={{ y: -4 }}>
                                {/* Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#56B949] to-[#30499B] opacity-90"></div>
                                <div className="absolute inset-0 bg-[url('https://api.iconify.design/lucide/sprout.svg?color=%23ffffff&opacity=0.2')] bg-repeat bg-[length:120px_120px] opacity-10"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
                                    <div className="text-center md:text-left">
                                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium mb-4 border border-white/30">
                                            INTERACTIVE GAME
                                        </span>
                                        <h3 className="text-3xl md:text-4xl text-white font-serif font-medium mb-3">
                                            开启你的绿色探索之旅
                                        </h3>
                                        <p className="text-white/80 text-sm md:text-base max-w-md mx-auto md:mx-0">
                                            在虚拟世界中种植树木，我们在现实世界为您种下真树。让游戏变得有意义。
                                        </p>
                                    </div>

                                    {/* Main Button */}
                                    <Link href="/zh/game">
                                        <button className="flex-shrink-0 relative overflow-hidden bg-white text-[#56B949] hover:text-[#30499B] px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95">
                                            <span className="flex items-center gap-2">
                                                开始游戏
                                                <PlayCircle className="w-5 h-5" />
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </AnimatedSection>

                {/* Section: Points Park */}
                <AnimatedSection delay={1.0}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#F0A32F] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">积分乐园</h2>
                                <p className="text-xs text-slate-400 mt-1">REWARDS &amp; POINTS</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={handlePointsClick}
                        className="relative w-full p-6 md:p-8 rounded-2xl bg-[#fffcf5] dark:bg-slate-800/50 border border-[#F0A32F]/20 dark:border-[#F0A32F]/30 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden cursor-pointer hover:bg-[#fffbf0] dark:hover:bg-slate-800/70 transition-colors"
                    >
                        {/* Decorative bg */}
                        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#F0A32F]/5 rounded-full blur-3xl"></div>

                        <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F0A32F]/10 flex items-center justify-center text-[#F0A32F] border-2 border-[#F0A32F]/20 shadow-[0_0_15px_rgba(240,163,47,0.3)] shrink-0">
                                <Coins className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-[#30499B] dark:text-[#56B949]">完成每日任务</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    今天还需 <span className="text-[#EE4035] font-bold">50</span> 积分即可升级勋章
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
                            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-[#F0A32F]/20 active:bg-slate-50 dark:active:bg-slate-600 transition-colors cursor-pointer">
                                <Footprints className="w-5 h-5 text-[#56B949]" />
                                <div>
                                    <div className="text-xs text-slate-400">步行打卡</div>
                                    <div className="text-sm font-bold text-[#F0A32F]">+10 积分</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-[#F0A32F]/20 active:bg-slate-50 dark:active:bg-slate-600 transition-colors cursor-pointer">
                                <Trash className="w-5 h-5 text-[#30499B]" />
                                <div>
                                    <div className="text-xs text-slate-400">垃圾分类</div>
                                    <div className="text-sm font-bold text-[#F0A32F]">+20 积分</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>

            <style jsx>{`
        /* 轮播样式核心 */
        .carousel-container {
          perspective: 1000px;
          overflow: hidden; 
        }
        
        .carousel-item {
          position: absolute;
          top: 50%;
          width: 200px; 
          height: 260px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
          opacity: 0;
          z-index: 10;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        
        /* 状态位置定义 - 确保三个卡片可见 */
        .carousel-item.pos-0 { /* 左侧 */
          left: 25%;
          opacity: 1;
          z-index: 20;
          transform: translateY(-50%) translateX(-50%) scale(0.9);
          filter: blur(0px);
        }
        
        .carousel-item.pos-1 { /* 中间 (Active) */
          left: 50%;
          opacity: 1;
          z-index: 30;
          transform: translateY(-50%) translateX(-50%) scale(1.15);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2);
        }
        
        .carousel-item.pos-2 { /* 右侧 */
          left: 75%;
          opacity: 1;
          z-index: 20;
          transform: translateY(-50%) translateX(-50%) scale(0.9);
          filter: blur(0px);
        }
        
        .carousel-item.pos-3, .carousel-item.pos-hidden { /* 隐藏 (循环缓冲) */
          left: 50%;
          opacity: 0;
          z-index: 5;
          transform: translateY(-50%) translateX(-50%) scale(0.5);
          pointer-events: none;
        }
        
        /* 移动端调整 */
        @media (max-width: 768px) {
          .carousel-item { 
            width: 160px; 
            height: 220px; 
          }
          .carousel-item.pos-0 { 
            left: 10%; 
            opacity: 0.6; 
            transform: translateY(-50%) translateX(-50%) scale(0.8); 
          }
          .carousel-item.pos-1 { 
            left: 50%; 
            transform: translateY(-50%) translateX(-50%) scale(1.1); 
          }
          .carousel-item.pos-2 { 
            left: 90%; 
            opacity: 0.6; 
            transform: translateY(-50%) translateX(-50%) scale(0.8); 
          }
        }
        
        /* 装饰圆角 */
        .decor-circle {
          position: absolute;
          border-radius: 999px;
          opacity: 0.1;
          transition: all 0.5s ease;
        }
        
        /* 按钮光效 */
        .glass-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      `}</style>

        </Layout>
    );
}