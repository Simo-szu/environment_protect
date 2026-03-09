'use client';
/* eslint-disable @next/next/no-img-element */

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
import { homeApi, contentApi, activityApi, recommendationApi } from '@/lib/api';
import type { ContentItem } from '@/lib/api/content';
import type { ActivityItem } from '@/lib/api/activity';
import type { HomeBanner } from '@/lib/api/home';
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
    const [homeBanners, setHomeBanners] = useState<HomeBanner[]>([]);
    const [homeDataAvailable, setHomeDataAvailable] = useState(false);
    const [latestRecommendationSource, setLatestRecommendationSource] = useState<string | null>(null);
    const [weeklyRecommendationSource, setWeeklyRecommendationSource] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // 加载首页数据
    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);

                // 并行加载科普内容和活动
                const [homeData, banners, contentsRes, activitiesRes, latestRecommendation, weeklyRecommendation] = await Promise.all([
                    homeApi.getHomeData().catch(() => null),
                    homeApi.getHomeBanners().catch(() => []),
                    contentApi.getContents({ page: 1, size: 3, sort: 'latest' }),
                    activityApi.getActivities({ page: 1, size: 3, sort: 'hot' }),
                    recommendationApi.getLatestRecommendation().catch(() => null),
                    recommendationApi.getWeeklyRecommendation().catch(() => null)
                ]);

                setHomeDataAvailable(!!homeData);
                setHomeBanners(banners);
                setContents(contentsRes.items);
                setActivities(activitiesRes.items);
                setLatestRecommendationSource(latestRecommendation?.source || null);
                setWeeklyRecommendationSource(weeklyRecommendation?.source || null);
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
            id: 'game',
            title: t('cards.game.title', '绿色游戏'),
            sub: t('cards.game.subtitle', '虚拟种植'),
            color: '#56B949',
            icon: PlayCircle,
            link: `/${locale}/game`
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
            ...(isActive ? { backgroundColor: cardsData[index].color } : {}),
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
                className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white dark:from-slate-900 via-[#56B949]/5 dark:via-[#56B949]/10 to-white dark:to-slate-900 transition-colors duration-300"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-semibold mb-4 border border-[#F0A32F]/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A32F] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0A32F]"></span>
                    </span>
                    {t('slogan', '全民环保行动季')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] dark:text-[#56B949] mb-6 drop-shadow-sm leading-tight font-serif transition-colors duration-300">
                    {t('title', 'YOUTHLOOP')}
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 dark:text-slate-300 font-normal max-w-lg mx-auto leading-relaxed px-4 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                        <Recycle className="w-5 h-5 text-[#56B949] dark:text-[#56B949]" />
                        <span>{t('subtitle', '让绿色循环，用行动改变未来')}</span>
                    </div>
                </div>
            </AnimatedSection>

            {/* Interactive Carousel Section */}
            <section className="relative w-full max-w-4xl mx-auto h-[360px] flex items-center justify-center my-4">
                {/* Prev Button */}
                <button
                    onClick={() => moveCarousel(-1)}
                    className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-300 dark:text-slate-500 hover:text-[#30499B] dark:hover:text-[#56B949] transition-all duration-300 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 group"
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
                                className={`carousel-item rounded-2xl shadow-sm transition-all duration-500 ${positionClass} bg-white dark:bg-slate-800`}
                                style={getCardStyle(index)}
                                onClick={() => handleCardClick(index, data)}
                            >
                                {/* Active Content */}
                                <div className={`card-content-active flex flex-col items-center justify-center text-center w-full h-full relative overflow-hidden p-4 z-20 ${isActive ? 'flex opacity-100' : 'hidden opacity-0'}`}>
                                    <Icon className="w-10 h-10 text-white mb-3 stroke-[1.5]" />
                                    <h3 className="text-xl md:text-2xl text-white font-serif font-medium leading-tight mb-4 px-2 line-clamp-2 md:whitespace-nowrap text-balance">
                                        {data.title}
                                    </h3>
                                    <button className="glass-btn px-4 py-1.5 rounded-full text-white text-xs font-medium hover:bg-white/30 transition-colors">
                                        {t('enter', '进入')}
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
                                    <h3 className="text-base md:text-lg font-serif font-bold mb-1 px-1 line-clamp-2 leading-tight md:whitespace-nowrap text-[#30499B] dark:text-slate-200">
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
                    className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-300 dark:text-slate-500 hover:text-[#30499B] dark:hover:text-[#56B949] transition-all duration-300 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 group"
                >
                    <ChevronRight className="w-5 h-5 stroke-[2.5px] group-hover:translate-x-0.5 transition-transform" />
                </button>
            </section>

            {/* Main Content Grid */}
            <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <AnimatedSection delay={0.02}>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 p-4 md:p-5">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <h2 className="text-base md:text-lg font-semibold text-[#30499B] dark:text-[#56B949]">
                                {t('sections.homeBanners.title', 'Home Banners')}
                            </h2>
                            <span className="text-xs text-slate-500">
                                {homeDataAvailable
                                    ? t('sections.homeData.available', 'Home aggregate API connected')
                                    : t('sections.homeData.unavailable', 'Home aggregate API unavailable')}
                            </span>
                        </div>
                        {homeBanners.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {homeBanners.slice(0, 3).map((banner) => (
                                    <Link
                                        key={banner.id}
                                        href={banner.linkUrl ? (banner.linkUrl.startsWith('/') ? `/${locale}${banner.linkUrl}` : banner.linkUrl) : `/${locale}`}
                                        className="relative block h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity"
                                    >
                                        <img src={banner.imageUrl} alt={banner.title || 'banner'} className="w-full h-full object-cover" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">
                                {t('sections.homeBanners.empty', 'No active banners at the moment')}
                            </p>
                        )}
                    </div>
                </AnimatedSection>

                {/* Section: Science Materials */}
                <AnimatedSection delay={0.05}>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 p-4 md:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base md:text-lg font-semibold text-[#30499B] dark:text-[#56B949]">
                                    {t('sections.recommendation.title', 'Latest Recommendation')}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {latestRecommendationSource
                                        ? t('sections.recommendation.source', 'Source: {source}', { source: latestRecommendationSource })
                                        : t('sections.recommendation.unavailable', 'Recommendation service is temporarily unavailable')}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {weeklyRecommendationSource
                                        ? t('sections.recommendation.weeklySource', 'Weekly source: {source}', { source: weeklyRecommendationSource })
                                        : t('sections.recommendation.weeklyUnavailable', 'Weekly recommendation is temporarily unavailable')}
                                </p>
                            </div>
                            <Link
                                href={`/${locale}/search`}
                                className="text-sm text-[#30499B] dark:text-[#56B949] hover:underline underline-offset-4"
                            >
                                {t('sections.recommendation.explore', 'Explore')}
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Section: Science Materials */}
                <AnimatedSection delay={0.1}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#30499B] dark:bg-[#56B949] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">{t('sections.science.title', '科普资料')}</h2>
                                <p className="text-xs text-slate-400 mt-1">{t('sections.science.subtitle', 'TRUSTWORTHY KNOWLEDGE')}</p>
                            </div>
                        </div>
                        <Link href={`/${locale}/science`} className="text-sm text-[#30499B] dark:text-[#56B949] hover:underline decoration-[#30499B]/50 dark:decoration-[#56B949]/50 underline-offset-4">
                            {t('viewAll', '查看全部')} -&gt;
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
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] dark:text-[#56B949] shadow-sm ring-1 ring-[#30499B]/10 dark:ring-[#56B949]/20">
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
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 dark:bg-slate-700 mb-3"></div>
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
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] dark:text-[#56B949] shadow-sm ring-1 ring-[#30499B]/10 dark:ring-[#56B949]/20">
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
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 dark:bg-slate-700 mb-3"></div>
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
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] dark:text-[#56B949] shadow-sm ring-1 ring-[#30499B]/10 dark:ring-[#56B949]/20">
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
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 dark:bg-slate-700 mb-3"></div>
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
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-[#30499B] dark:text-[#56B949] shadow-sm ring-1 ring-[#30499B]/10 dark:ring-[#56B949]/20">
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
                                                    <div className="w-full h-[1px] bg-[#30499B]/10 dark:bg-slate-700 mb-3"></div>
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
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#EE4035] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">{t('sections.activities.title', '热门活动')}</h2>
                                <p className="text-xs text-slate-400 mt-1">{t('sections.activities.subtitle', 'JOIN THE ACTION')}</p>
                            </div>
                        </div>
                        <Link href={`/${locale}/activities`} className="text-sm text-[#30499B] dark:text-[#56B949] hover:underline decoration-[#30499B]/50 dark:decoration-[#56B949]/50 underline-offset-4">
                            {t('viewAll', '查看全部')} -&gt;
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
                                                            : 'bg-white dark:bg-slate-700 border border-[#30499B] dark:border-[#56B949] text-[#30499B] dark:text-[#56B949] hover:bg-[#30499B] dark:hover:bg-[#56B949] hover:text-white'
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
                                                    <h3 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949] mb-1">{t('sections.activities.items.treePlanting.title', '城市植树节')}</h3>
                                                    <p className="text-xs text-slate-400 mb-4">{t('sections.activities.items.treePlanting.date', '2024.05.12 · 城市公园')}</p>
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
                                                    <h3 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949] mb-1">{t('sections.activities.items.beachCleanup.title', '海滩净滩行动')}</h3>
                                                    <p className="text-xs text-slate-400 mb-4">{t('sections.activities.items.beachCleanup.date', '2024.06.05 · 阳光海滩')}</p>
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
                                                    <h3 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949] mb-1">{t('sections.activities.items.communityExchange.title', '社区旧物交换')}</h3>
                                                    <p className="text-xs text-slate-400 mb-4">{t('sections.activities.items.communityExchange.date', '每周六 · 社区中心')}</p>
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

                {/* Section: Eco Game */}
                <AnimatedSection delay={0.9}>
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-[#56B949]/20">
                        {mounted && (
                            <motion.div whileHover={{ y: -4 }}>
                                {/* Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#56B949] to-[#30499B] opacity-90 dark:from-[#2e6d23] dark:to-[#17275c] dark:opacity-80"></div>
                                <div className="absolute inset-0 bg-[url('https://api.iconify.design/lucide/sprout.svg?color=%23ffffff&opacity=0.2')] bg-repeat bg-[length:120px_120px] opacity-10"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
                                    <div className="text-center md:text-left">
                                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium mb-4 border border-white/30">
                                            {t('sections.game.badge', 'INTERACTIVE GAME')}
                                        </span>
                                        <h3 className="text-3xl md:text-4xl text-white font-serif font-medium mb-3">
                                            {t('sections.game.title', '开启你的绿色探索之旅')}
                                        </h3>
                                        <p className="text-white/80 text-sm md:text-base max-w-md mx-auto md:mx-0">
                                            {t('sections.game.subtitle', '在虚拟世界中种植树木，我们在现实世界为您种下真树。让游戏变得有意义。')}
                                        </p>
                                    </div>

                                    {/* Main Button */}
                                    <Link href={`/${locale}/game`}>
                                        <button className="flex-shrink-0 relative overflow-hidden bg-white text-[#56B949] hover:text-[#30499B] px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95">
                                            <span className="flex items-center gap-2">
                                                {t('sections.game.button', '开始游戏')}
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
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">{t('sections.points.title', '积分乐园')}</h2>
                                <p className="text-xs text-slate-400 mt-1">{t('sections.points.subtitle', 'REWARDS & POINTS')}</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={handlePointsClick}
                        className="relative w-full p-6 md:p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-slate-800/30 border border-[#F0A32F]/20 dark:border-[#F0A32F]/30 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden cursor-pointer hover:from-amber-100 hover:to-orange-100 dark:hover:from-slate-800 dark:hover:to-slate-800/60 transition-colors"
                    >
                        {/* Decorative bg */}
                        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#F0A32F]/5 rounded-full blur-3xl"></div>

                        <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F0A32F]/10 flex items-center justify-center text-[#F0A32F] border-2 border-[#F0A32F]/20 shadow-[0_0_15px_rgba(240,163,47,0.3)] shrink-0">
                                <Coins className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-[#30499B] dark:text-[#56B949]">{t('sections.points.dailyTask', '完成每日任务')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    {t('sections.points.pointsNeeded', '今天还需 {points} 积分即可升级勋章', { points: 50 })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
                            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-[#F0A32F]/20 active:bg-slate-50 dark:active:bg-slate-600 transition-colors cursor-pointer">
                                <Footprints className="w-5 h-5 text-[#56B949]" />
                                <div>
                                    <div className="text-xs text-slate-400">{t('sections.points.tasks.walking', '步行打卡')}</div>
                                    <div className="text-sm font-bold text-[#F0A32F]">{t('sections.points.tasks.walkingPoints', '+10 积分')}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-[#F0A32F]/20 active:bg-slate-50 dark:active:bg-slate-600 transition-colors cursor-pointer">
                                <Trash className="w-5 h-5 text-[#30499B]" />
                                <div>
                                    <div className="text-xs text-slate-400">{t('sections.points.tasks.sorting', '垃圾分类')}</div>
                                    <div className="text-sm font-bold text-[#F0A32F]">{t('sections.points.tasks.sortingPoints', '+20 积分')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div >

            <style jsx>{`
        /* 轮播样式核心 */
        .carousel-container {
          perspective: 1000px;
          overflow: hidden; 
        }
        
        .carousel-item {
          position: absolute;
          top: 50%;
          width: 240px; 
          height: 280px;
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
          border: 2px solid rgba(0, 0, 0, 0.08);
          border-radius: 1rem;
        }
        
        /* 状态位置定义 - 确保三个卡片可见 */
        .carousel-item.pos-0 { /* 左侧 */
          left: 20%;
          opacity: 0.85;
          z-index: 20;
          transform: translateY(-50%) translateX(-50%) scale(0.92);
          filter: blur(0px);
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
        }
        
        .carousel-item.pos-1 { /* 中间 (Active) */
          left: 50%;
          opacity: 1;
          z-index: 30;
          transform: translateY(-50%) translateX(-50%) scale(1.08);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
          border-radius: 1rem;
          border: 2px solid rgba(0, 0, 0, 0.08);
        }
        
        .carousel-item.pos-2 { /* 右侧 */
          left: 80%;
          opacity: 0.85;
          z-index: 20;
          transform: translateY(-50%) translateX(-50%) scale(0.92);
          filter: blur(0px);
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
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
            width: 200px; 
            height: 260px; 
          }
          .carousel-item.pos-0 { 
            left: -5%; 
            opacity: 0.4; 
            transform: translateY(-50%) translateX(-50%) scale(0.8); 
          }
          .carousel-item.pos-1 { 
            left: 50%; 
            transform: translateY(-50%) translateX(-50%) scale(1.05); 
          }
          .carousel-item.pos-2 { 
            left: 105%; 
            opacity: 0.4; 
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

            {/* Auth Prompt Modal */}
            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </Layout >
    );
}
