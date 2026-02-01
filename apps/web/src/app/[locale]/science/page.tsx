'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Recycle,
    Droplets,
    Zap,
    Eye,
    Heart,
    ArrowRight,
    BookOpen,
    BatteryCharging,
    Waves,
    Leaf,
    Search,
    Calendar,
    Clock,
    ChevronRight
} from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import { fadeUp, staggerContainer, staggerItem, pageEnter, hoverLift } from '@/lib/animations';
import { contentApi } from '@/lib/api';
import type { ContentItem } from '@/lib/api/content';
import { formatDate, formatShortDate } from '@/lib/date-utils';

export default function SciencePage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as string) || 'zh';
    const { t } = useSafeTranslation('science');
    const { t: tCommon } = useSafeTranslation('common');

    // 状态管理
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [tips, setTips] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // 使用 ref 跟踪 tips 是否已加载，避免依赖问题
    const tipsLoadedRef = useRef(false);
    // 引用 News 部分，用于翻页时滚动
    const newsRef = useRef<HTMLDivElement>(null);

    // 加载科普内容
    useEffect(() => {
        const loadContents = async () => {
            try {
                setLoading(true);
                const result = await contentApi.getContents({
                    page: currentPage,
                    size: pageSize,
                    sort: 'latest'
                });
                setContents(result.items);
                setTotalPages(Math.ceil(result.total / pageSize));

                // 专门获取百科作为小贴士 (只在第一次加载时)
                if (currentPage === 1 && !tipsLoadedRef.current) {
                    const tipsResult = await contentApi.getContents({
                        type: 'WIKI',
                        size: 3,
                        sort: 'latest'
                    });
                    // 如果有百科内容，优先使用；否则使用普通内容的前三个
                    const finalTips = tipsResult.items.length > 0 ? tipsResult.items : result.items.slice(0, 3);
                    setTips(finalTips);
                    tipsLoadedRef.current = true; // 标记已加载
                }
            } catch (error) {
                console.error('Failed to load contents:', error);
            } finally {
                setLoading(false);
            }
        };

        loadContents();
    }, [currentPage]);

    const viewArticle = (articleId: string) => {
        router.push(`/${locale}/science/${articleId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // 滚动到 News 部分的顶部（减去 header 高度）
        if (newsRef.current) {
            const headerOffset = 120; // header 高度
            const elementPosition = newsRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Layout>
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white dark:from-slate-900 via-[#30499B]/5 dark:via-[#30499B]/10 to-white dark:to-slate-900"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] dark:text-[#56B949] text-xs font-semibold mb-4 border border-[#30499B]/20 dark:border-[#56B949]/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30499B] dark:bg-[#56B949] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30499B] dark:bg-[#56B949]"></span>
                    </span>
                    {t('hero.badge', '环保科普知识库')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] dark:text-[#56B949] mb-6 drop-shadow-sm leading-tight">
                    {t('hero.title', '科普资料')}
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 dark:text-slate-300 font-normal max-w-lg mx-auto leading-relaxed px-4">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-[#30499B] dark:text-[#56B949]" />
                        <span>{t('hero.subtitle', '用科学指导，让环保更有效')}</span>
                    </div>
                </div>
            </motion.section>

            <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100 dark:border-slate-800">
                {/* 环保小贴士 Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#56B949] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">{t('tips.title', '环保小贴士')}</h2>
                                <p className="text-xs text-slate-400 mt-1">{t('tips.subtitle', 'ECO TIPS FOR DAILY LIFE')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tips.slice(0, 3).map((tip, idx) => {
                            const configs = [
                                { icon: Droplets, color: '#56B949' },
                                { icon: Recycle, color: '#F0A32F' },
                                { icon: Zap, color: '#30499B' }
                            ];
                            const config = configs[idx % configs.length];
                            const Icon = config.icon;

                            return (
                                <div
                                    key={tip.id}
                                    onClick={() => viewArticle(tip.id)}
                                    className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-[#30499B]/30 hover:bg-[#30499B]/5 dark:hover:bg-[#30499B]/10 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm ring-1 ring-black/5" style={{ color: config.color }}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-wider text-[#30499B]/60 bg-[#30499B]/10 px-2 py-1 rounded">TIP</span>
                                    </div>
                                    <h3 className="text-lg text-[#30499B] dark:text-[#56B949] font-medium leading-snug mb-2 line-clamp-2">
                                        {tip.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                        {tip.summary || t('viewContent', '点击查看详情')}
                                    </p>
                                    <div className="w-full h-[1px] bg-[#30499B]/10 mb-3"></div>
                                    <div className="flex items-center gap-2 text-xs text-[#30499B] dark:text-[#56B949] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                        {t('actions.learnMore', '了解更多')} <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Main Content Grid */}
                <div ref={newsRef} className="space-y-8">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#30499B] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#30499B] dark:text-[#56B949] tracking-tight">{t('news.title', '深入科普')}</h2>
                                <p className="text-xs text-slate-400 mt-1">{t('news.subtitle', 'Sustainable Insights')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#30499B] hover:border-[#30499B]/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                </button>
                                <span className="text-xs font-medium text-slate-400">
                                    {currentPage} / {totalPages || 1}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#30499B] hover:border-[#30499B]/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* News List */}
                    <div className="grid grid-cols-1 gap-6">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-8 animate-pulse border border-slate-100 dark:border-slate-700">
                                    <div className="w-full md:w-64 h-44 rounded-2xl bg-slate-100 dark:bg-slate-700"></div>
                                    <div className="flex-1 space-y-4 py-2">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-24"></div>
                                        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded"></div>
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))
                        ) : contents.length > 0 ? (
                            contents.map((content) => {
                                const typeConfig = getTypeConfig(content.type);
                                return (
                                    <div
                                        key={content.id}
                                        className="group relative bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.005]"
                                    >
                                        <div className="flex flex-col md:flex-row p-4 sm:p-6 gap-6 md:gap-8">
                                            {/* Image Section */}
                                            <div className="w-full md:w-72 h-48 md:h-52 rounded-2xl overflow-hidden relative group-hover:shadow-lg transition-all duration-500">
                                                {content.coverImageUrl ? (
                                                    <img
                                                        src={content.coverImageUrl}
                                                        alt={content.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                                                        <typeConfig.icon className={`w-12 h-12 ${typeConfig.text} opacity-20`} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-3 py-1 rounded-lg backdrop-blur-md bg-white/90 dark:bg-slate-800/90 text-[10px] font-black ${typeConfig.text} shadow-sm border border-white/20 uppercase tracking-tighter`}>
                                                        {t(`types.${content.type}`)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info Section */}
                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div>
                                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-3">
                                                        <div className="flex items-center gap-1.5 uppercase tracking-wider">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatShortDate(content.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 uppercase tracking-wider">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {Math.ceil((content.summary?.length || 0) / 100) + 2} MIN READ
                                                        </div>
                                                    </div>

                                                    <h3
                                                        onClick={() => viewArticle(content.id)}
                                                        className="text-xl md:text-2xl font-serif font-bold text-slate-800 dark:text-white group-hover:text-[#30499B] dark:group-hover:text-[#56B949] transition-colors leading-tight mb-4 cursor-pointer"
                                                    >
                                                        {content.title}
                                                    </h3>

                                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 md:line-clamp-3 pr-4">
                                                        {content.summary || '探索更多关于这个话题的深度见解，了解科学环保的前沿动态...'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-700/50">
                                                    <div className="flex items-center gap-5">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#F0A32F] transition-colors cursor-pointer group/stat">
                                                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 group-hover/stat:bg-[#F0A32F]/10 transition-colors">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span>{content.viewCount || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#EE4035] transition-colors cursor-pointer group/stat">
                                                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 group-hover/stat:bg-[#EE4035]/10 transition-colors">
                                                                <Heart className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span>{content.likeCount || 0}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => viewArticle(content.id)}
                                                        className="inline-flex items-center gap-2 text-sm font-black text-[#56B949] dark:text-[#56B949] hover:underline underline-offset-8 decoration-2"
                                                    >
                                                        {t('actions.readFull', '阅读全文')}
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-slate-500 dark:text-slate-400">{tCommon('noData', '暂无内容')}</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <AnimatePresence>
                        {(totalPages >= 1 || loading) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex justify-center items-center gap-3 pt-12"
                            >
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        const pageNum = getPageNum(i, currentPage, totalPages);
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                disabled={loading}
                                                className={`w-11 h-11 rounded-2xl text-sm font-bold transition-all ${currentPage === pageNum
                                                    ? 'bg-[#30499B] text-white shadow-lg shadow-[#30499B]/30'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#30499B]/50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
}

// Helpers
function getTypeConfig(type: string) {
    const configs: Record<string, { gradient: string; text: string; icon: any }> = {
        NEWS: { gradient: 'from-blue-500/20 to-indigo-500/20', text: 'text-blue-600 dark:text-blue-400', icon: Zap },
        DYNAMIC: { gradient: 'from-orange-500/20 to-red-500/20', text: 'text-orange-600 dark:text-orange-400', icon: Waves },
        POLICY: { gradient: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: BatteryCharging },
        WIKI: { gradient: 'from-purple-500/20 to-pink-500/20', text: 'text-purple-600 dark:text-purple-400', icon: BookOpen }
    };
    return configs[type] || configs.NEWS;
}

function getPageNum(i: number, currentPage: number, totalPages: number) {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
}
