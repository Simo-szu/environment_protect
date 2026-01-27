'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Leaf, BarChart3, Trash2, ArrowRight, Trees, Waves, PlayCircle, Coins, Footprints, Trash, Recycle } from 'lucide-react';
import { useAuth, showLoginPrompt } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useClientMounted } from '@/hooks/useClientMounted';
import { homeApi, contentApi, activityApi } from '@/lib/api';
import type { ContentItem } from '@/lib/api/content';
import type { ActivityItem } from '@/lib/api/activity';
import AuthPromptModal from '@/components/auth/AuthPromptModal';

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
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as string) || 'zh';
    const [activeIndex, setActiveIndex] = useState(1);
    const mounted = useClientMounted();
    const { t } = useSafeTranslation('home');

    // 状态管理
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // 加载首页数据
    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);

                // 并行加载科普内容和活动
                const [contentsRes, activitiesRes] = await Promise.all([
                    contentApi.getContents({ page: 1, size: 3, sort: 'latest' }),
                    activityApi.getActivities({ page: 1, size: 3, sort: 'hot' })
                ]);

                setContents(contentsRes.items);
                setActivities(activitiesRes.items);
            } catch (error) {
                console.error('Failed to load home data:', error);
                // 失败时使用空数组，页面仍可正常显示
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, []);

    const cardsData: CardData[] = [
        {
            id: 'points',
            title: t('cards.points.title', '积分·兑换'),
            sub: t('cards.points.subtitle', '累积环保值'),
            color: '#F0A32F',
            icon: Coins,
            link: `/${locale}/points`
        },

        {
            id: 'science',
            title: t('cards.science.title', '权威科普'),
            sub: t('cards.science.subtitle', '科学数据'),
            color: '#30499B',
            icon: Leaf,
            link: `/${locale}/science`
        },
        {
            id: 'activity',
            title: t('cards.activity.title', '环保活动'),
            sub: t('cards.activity.subtitle', '参与行动'),
            color: '#EE4035',
            icon: Trees,
            link: `/${locale}/activities`
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
                setIsAuthModalOpen(true);
            } else {
                router.push(data.link);
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
            setIsAuthModalOpen(true);
        } else {
            router.push(`/${locale}/points`);
        }
    };

    return (
        <Layout>
            {/* Hero Section */}
            <AnimatedSection
                useInView={false}
                className="relative text-center pt-8 pb-16 px-4 overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#56B949]/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#30499B]/5 rounded-full blur-3xl -z-10 animate-pulse [animation-delay:2s]"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-[#F0A32F] text-xs font-bold mb-8 border border-[#F0A32F]/20 shadow-sm shadow-[#F0A32F]/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A32F] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0A32F]"></span>
                        </span>
                        {t('slogan', '全民环保行动季')}
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 transition-colors duration-300">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#30499B] via-[#56B949] to-[#30499B] bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">
                            {t('title', 'YOUTHLOOP')}
                        </span>
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed px-4 transition-colors duration-300">
                        <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm">
                            <Recycle className="w-6 h-6 text-[#56B949]" />
                            <span>{t('subtitle', '让绿色循环，用行动改变未来')}</span>
                        </div>
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
                                className={`carousel-item rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${positionClass}`}
                                style={{
                                    ...getCardStyle(index),
                                    borderWidth: '1px'
                                }}
                                onClick={() => handleCardClick(index, data)}
                            >
                                {/* Active Content */}
                                <div className={`card-content-active flex flex-col items-center justify-center text-center w-full h-full relative overflow-hidden p-8 z-20 ${isActive ? 'flex opacity-100' : 'hidden opacity-0'}`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-inner ring-1 ring-white/30">
                                        <Icon className="w-12 h-12 text-white stroke-[2]" />
                                    </div>
                                    <h3 className="text-3xl text-white font-black leading-tight mb-6 text-center px-2 drop-shadow-md">
                                        {data.title}
                                    </h3>
                                    <button className="glass-btn px-8 py-2.5 rounded-full text-white text-sm font-bold hover:bg-white hover:text-slate-900 transition-all duration-300 shadow-xl active:scale-95">
                                        {t('enter', '进入')}
                                    </button>
                                </div>

                                {/* Inactive Content */}
                                <div className={`card-content-inactive flex flex-col items-center justify-center text-center w-full h-full relative overflow-hidden p-6 z-10 ${!isActive ? 'flex opacity-100' : 'hidden opacity-0'}`}>
                                    <div
                                        className="w-16 h-16 rounded-[2rem] flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 shadow-lg ring-1 ring-black/5"
                                        style={{ backgroundColor: `${data.color}15` }}
                                    >
                                        <Icon className="w-7 h-7" style={{ color: data.color }} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 text-center px-2">
                                        {data.title.replace('\n', '')}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">{data.sub}</p>
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></div>
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
            <div className="relative mt-20 px-4 sm:px-6 lg:px-8 py-24 space-y-32">
                {/* Section: Science Materials */}
                <AnimatedSection delay={0.1}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div className="flex items-center gap-6">
                            <div className="w-2 h-16 bg-gradient-to-b from-[#30499B] to-[#56B949] rounded-full shadow-lg shadow-[#30499B]/20"></div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic underline decoration-[#56B949]/30 underline-offset-8">
                                    {t('sections.science.title', '科普资料')}
                                </h2>
                                <p className="text-sm font-bold text-[#30499B]/60 dark:text-[#56B949]/60 mt-3 tracking-[0.2em] uppercase">
                                    {t('sections.science.subtitle', 'TRUSTWORTHY KNOWLEDGE')}
                                </p>
                            </div>
                        </div>
                        <Link href={`/${locale}/science`} className="group flex items-center gap-2 text-sm font-bold text-[#30499B] dark:text-[#56B949] hover:opacity-70 transition-all">
                            <span className="border-b-2 border-current pb-0.5">{t('viewAll', '查看全部')}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loading ? (
                            // 加载骨架屏
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
                                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                                </div>
                            ))
                        ) : contents.length > 0 ? (
                            // 真实数据
                            contents.map((content, index) => (
                                <AnimatedSection key={content.id} delay={0.2 + index * 0.1}>
                                    <Link href={`/${locale}/science/${content.id}`} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer block h-full">
                                        {mounted && (
                                            <motion.div whileHover={{ y: -4 }} className="h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] shadow-sm ring-1 ring-[#30499B]/10">
                                                        <Leaf className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">
                                                        {content.type}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2 line-clamp-2">
                                                    {content.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                                                    {content.summary || t('viewContent', '点击查看详情')}
                                                </p>
                                                <div className="mt-auto">
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                                            {t('readMore', '阅读详情')} <ArrowRight className="w-3 h-3" />
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <span>{content.viewCount} {t('views', '阅读')}</span>
                                                            <span>·</span>
                                                            <span>{content.likeCount} {t('likes', '点赞')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </Link>
                                </AnimatedSection>
                            ))
                        ) : (
                            // 降级显示静态内容
                            <>
                                <AnimatedSection delay={0.2}>
                                    <Link href={`/${locale}/science`} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer block h-full">
                                        {mounted && (
                                            <motion.div whileHover={{ y: -4 }} className="h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] shadow-sm ring-1 ring-[#30499B]/10">
                                                        <Leaf className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">GUIDE</span>
                                                </div>
                                                <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2 line-clamp-2">
                                                    {t('sections.science.items.guide.title', '2024 可持续生活指南')}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                                                    {t('sections.science.items.guide.description', '涵盖衣食住行各个方面的减碳小技巧，附带详细数据支持。')}
                                                </p>
                                                <div className="mt-auto">
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                                    <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                                        {t('readReport', '阅读报告')} <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </Link>
                                </AnimatedSection>

                                <AnimatedSection delay={0.3}>
                                    <Link href={`/${locale}/science`} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer block h-full">
                                        {mounted && (
                                            <motion.div whileHover={{ y: -4 }} className="h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] shadow-sm ring-1 ring-[#30499B]/10">
                                                        <BarChart3 className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">DATA</span>
                                                </div>
                                                <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2 line-clamp-2">
                                                    {t('sections.science.items.data.title', '全球碳排放最新数据')}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                                                    {t('sections.science.items.data.description', '实时更新的全球环境监测数据，可视化图表分析。')}
                                                </p>
                                                <div className="mt-auto">
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                                    <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                                        {t('viewDetails', '查看详情')} <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </Link>
                                </AnimatedSection>

                                <AnimatedSection delay={0.4}>
                                    <Link href={`/${locale}/science`} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer block h-full">
                                        {mounted && (
                                            <motion.div whileHover={{ y: -4 }} className="h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] shadow-sm ring-1 ring-[#30499B]/10">
                                                        <Trash2 className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">TIPS</span>
                                                </div>
                                                <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2 line-clamp-2">
                                                    {t('sections.science.items.tips.title', '高效废弃物回收术')}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                                                    {t('sections.science.items.tips.description', '如何正确分类？哪些可以变废为宝？专家视频讲解。')}
                                                </p>
                                                <div className="mt-auto">
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                                    <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                                        {t('learnNow', '立即学习')} <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </Link>
                                </AnimatedSection>
                            </>
                        )}
                    </div>
                </AnimatedSection>

                {/* Section: Popular Activities */}
                <AnimatedSection delay={0.5}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div className="flex items-center gap-6">
                            <div className="w-2 h-16 bg-gradient-to-b from-[#EE4035] to-[#F0A32F] rounded-full shadow-lg shadow-[#EE4035]/20"></div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic underline decoration-[#EE4035]/30 underline-offset-8">
                                    {t('sections.activities.title', '热门活动')}
                                </h2>
                                <p className="text-sm font-bold text-[#EE4035]/60 dark:text-[#F0A32F]/60 mt-3 tracking-[0.2em] uppercase">
                                    {t('sections.activities.subtitle', 'JOIN THE ACTION')}
                                </p>
                            </div>
                        </div>
                        <Link href={`/${locale}/activities`} className="group flex items-center gap-2 text-sm font-bold text-[#30499B] dark:text-[#56B949] hover:opacity-70 transition-all">
                            <span className="border-b-2 border-current pb-0.5">{t('viewAll', '查看全部')}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loading ? (
                            // 加载骨架屏
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="rounded-xl overflow-hidden shadow-md animate-pulse">
                                    <div className="h-32 bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="bg-white dark:bg-slate-800 p-5">
                                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-32"></div>
                                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    </div>
                                </div>
                            ))
                        ) : activities.length > 0 ? (
                            // 真实数据
                            activities.map((activity, index) => (
                                <AnimatedSection key={activity.id} delay={0.6 + index * 0.1}>
                                    <div className="relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300">
                                        {mounted && (
                                            <motion.div whileHover={{ y: -4 }}>
                                                {index === 0 && (
                                                    <div className="absolute top-3 left-3 z-10 bg-[#EE4035] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">HOT</div>
                                                )}
                                                <div className="h-32 bg-[#F0A32F]/10 dark:bg-[#F0A32F]/20 flex items-center justify-center relative overflow-hidden">
                                                    {activity.coverImageUrl ? (
                                                        <img src={activity.coverImageUrl} alt={activity.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#EE4035]/10 rounded-full"></div>
                                                            <Trees className="w-12 h-12 text-[#F0A32F]/60 transform group-hover:scale-110 transition-transform duration-500" />
                                                        </>
                                                    )}
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-5 border-x border-b border-slate-100 dark:border-slate-700 rounded-b-xl">
                                                    <h3 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949] mb-1 line-clamp-1">{activity.title}</h3>
                                                    <p className="text-xs text-slate-400 mb-4">
                                                        {new Date(activity.startTime).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')} · {activity.location || t('pending', '待定')}
                                                    </p>
                                                    <Link href={`/${locale}/activities/${activity.id}`}>
                                                        <button className={`w-full py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${activity.signupPolicy === 'OPEN'
                                                            ? 'bg-[#EE4035] text-white hover:bg-[#d63730] shadow-lg shadow-[#EE4035]/20'
                                                            : 'bg-white dark:bg-slate-700 border border-[#30499B] text-[#30499B] hover:bg-[#30499B] hover:text-white'
                                                            }`}>
                                                            {activity.signupPolicy === 'OPEN' ? t('signUpNow', '立即报名') : t('viewDetails', '查看详情')}
                                                        </button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </AnimatedSection>
                            ))
                        ) : (
                            // 降级显示静态内容
                            <>
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
                                                    <Link href={`/${locale}/activities`}>
                                                        <button className="w-full py-2 rounded-lg bg-white dark:bg-slate-700 border border-[#EE4035] text-[#EE4035] text-sm font-medium hover:bg-[#EE4035] hover:text-white transition-all active:scale-95">{t('signUpNow', '立即报名')}</button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </AnimatedSection>

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
                                                    <Link href={`/${locale}/activities`}>
                                                        <button className="w-full py-2 rounded-lg bg-[#30499B] text-white text-sm font-medium hover:bg-[#253a7a] transition-all shadow-lg shadow-[#30499B]/20 active:scale-95">{t('joinNow', '一键参加')}</button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </AnimatedSection>

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
                                                    <Link href={`/${locale}/activities`}>
                                                        <button className="w-full py-2 rounded-lg bg-white dark:bg-slate-700 border border-[#56B949] text-[#56B949] text-sm font-medium hover:bg-[#56B949] hover:text-white transition-all active:scale-95">{t('viewDetails', '查看详情')}</button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </AnimatedSection>
                            </>
                        )}
                    </div>
                </AnimatedSection>



                {/* Section: Points Park */}
                <AnimatedSection delay={0.8}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div className="flex items-center gap-6">
                            <div className="w-2 h-16 bg-gradient-to-b from-[#F0A32F] to-[#EE4035] rounded-full shadow-lg shadow-[#F0A32F]/20"></div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic underline decoration-[#F0A32F]/30 underline-offset-8">
                                    {t('sections.points.title', '积分乐园')}
                                </h2>
                                <p className="text-sm font-bold text-[#F0A32F]/60 dark:text-[#EE4035]/60 mt-3 tracking-[0.2em] uppercase">
                                    {t('sections.points.subtitle', 'REWARDS & POINTS')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={handlePointsClick}
                        className="group relative w-full p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-[#F0A32F]/10 transition-all duration-500"
                    >
                        {/* Decorative bg */}
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#F0A32F]/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#56B949]/5 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>

                        <div className="flex items-center gap-8 relative z-10 w-full md:w-auto">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-[#F0A32F] to-[#EE4035] flex items-center justify-center text-white shadow-xl shadow-[#F0A32F]/40 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                                <Coins className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">{t('sections.points.dailyTask', '完成每日任务')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-lg mt-2 font-medium">
                                    {t('sections.points.pointsNeeded', '今天还需 {points} 积分即可升级勋章', { points: 50 })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full md:w-auto">
                            <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-700/50 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 hover:scale-105 transition-transform">
                                <div className="w-10 h-10 rounded-full bg-[#56B949]/10 flex items-center justify-center">
                                    <Footprints className="w-6 h-6 text-[#56B949]" />
                                </div>
                                <div className="pr-4">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('sections.points.tasks.walking', '步行打卡')}</div>
                                    <div className="text-lg font-black text-[#F0A32F] mt-1">{t('sections.points.tasks.walkingPoints', '+10 积分')}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-700/50 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 hover:scale-105 transition-transform">
                                <div className="w-10 h-10 rounded-full bg-[#30499B]/10 flex items-center justify-center">
                                    <Trash className="w-6 h-6 text-[#30499B]" />
                                </div>
                                <div className="pr-4">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('sections.points.tasks.sorting', '垃圾分类')}</div>
                                    <div className="text-lg font-black text-[#F0A32F] mt-1">{t('sections.points.tasks.sortingPoints', '+20 积分')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div >

            <style jsx>{`
        @keyframes gradient {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
        }

        /* 轮播样式核心 */
        .carousel-container {
          perspective: 1000px;
          overflow: hidden; 
        }
        
        .carousel-item {
          position: absolute;
          top: 50%;
          width: 260px; 
          height: 340px;
          transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
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
          left: 20%;
          opacity: 0.7;
          z-index: 20;
          transform: translateY(-50%) translateX(-50%) scale(0.85) rotateY(15deg);
          filter: blur(1px);
        }
        
        .carousel-item.pos-1 { /* 中间 (Active) */
          left: 50%;
          opacity: 1;
          z-index: 30;
          transform: translateY(-50%) translateX(-50%) scale(1.1);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .carousel-item.pos-2 { /* 右侧 */
          left: 80%;
          opacity: 0.7;
          z-index: 20;
          transform: translateY(-50%) translateX(-50%) scale(0.85) rotateY(-15deg);
          filter: blur(1px);
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
            width: 180px; 
            height: 240px; 
          }
          .carousel-item.pos-0 { 
            left: 5%; 
            opacity: 0.4; 
            transform: translateY(-50%) translateX(-50%) scale(0.75); 
          }
          .carousel-item.pos-1 { 
            left: 50%; 
            transform: translateY(-50%) translateX(-50%) scale(1.0); 
          }
          .carousel-item.pos-2 { 
            left: 95%; 
            opacity: 0.4; 
            transform: translateY(-50%) translateX(-50%) scale(0.75); 
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

            {/* Auth Prompt Modal */}
            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </Layout >
    );
}