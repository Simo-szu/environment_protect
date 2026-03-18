'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BatteryCharging, BookOpen, Calendar, ChevronRight, Clock, Droplets, Eye, Heart, Leaf, Recycle, Waves, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import { pageEnter } from '@/lib/animations';
import { contentApi } from '@/lib/api';
import type { ContentItem } from '@/lib/api/content';
import { formatShortDate } from '@/lib/date-utils';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

export default function SciencePage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as string) || 'zh';
    const { t } = useSafeTranslation('science');
    const { t: tCommon } = useSafeTranslation('common');

    const [contents, setContents] = useState<ContentItem[]>([]);
    const [tips, setTips] = useState<ContentItem[]>([]);
    const [dataNews, setDataNews] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const tipsLoadedRef = useRef(false);
    const dataNewsLoadedRef = useRef(false);
    const newsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadContents = async () => {
            try {
                setLoading(true);
                const result = await contentApi.getContents({
                    type: 'NEWS',
                    page: currentPage,
                    size: pageSize,
                    sort: 'latest'
                });
                setContents(result.items);
                setTotalPages(Math.max(1, Math.ceil(result.total / pageSize)));

                if (currentPage === 1 && (!tipsLoadedRef.current || !dataNewsLoadedRef.current)) {
                    const jobs: Promise<void>[] = [];

                    if (!tipsLoadedRef.current) {
                        jobs.push((async () => {
                            const tipsResult = await contentApi.getContents({
                                type: 'WIKI',
                                size: 3,
                                sort: 'latest'
                            });
                            setTips(tipsResult.items.slice(0, 3));
                            tipsLoadedRef.current = true;
                        })());
                    }

                    if (!dataNewsLoadedRef.current) {
                        jobs.push((async () => {
                            const dataNewsResult = await contentApi.getDataNewsContents({
                                size: 3,
                                sort: 'latest'
                            });
                            setDataNews(dataNewsResult.items.slice(0, 3));
                            dataNewsLoadedRef.current = true;
                        })());
                    }

                    await Promise.all(jobs);
                }
            } catch (error) {
                console.error('Failed to load science contents:', error);
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
        if (newsRef.current) {
            const headerOffset = 120;
            const top = newsRef.current.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <Layout>
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,247,255,0.84))] px-4 py-12 text-center shadow-[0_30px_100px_-60px_rgba(48,73,155,0.38)] ring-1 ring-[#30499B]/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.68))] dark:ring-white/10 sm:py-14"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-10 top-0 h-44 w-44 rounded-full bg-[#DCEBFF] blur-3xl dark:bg-[#30499B]/15" />
                    <div className="absolute right-[-8%] top-8 h-56 w-56 rounded-full bg-[#EAF5DD] blur-3xl dark:bg-[#56B949]/12" />
                </div>
                <div className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-[#30499B]/20 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#30499B] shadow-[0_10px_30px_-18px_rgba(48,73,155,0.4)] backdrop-blur-md dark:border-[#56B949]/20 dark:bg-white/10 dark:text-[#56B949]">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30499B] opacity-75 dark:bg-[#56B949]" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30499B] dark:bg-[#56B949]" />
                    </span>
                    {t('hero.badge', '环保科普知识库')}
                </div>
                <h1 className="relative mx-auto max-w-2xl text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#30499B] dark:text-[#56B949] sm:text-[3.35rem] md:text-[4.25rem]">
                    {t('hero.title', '科普资料')}
                </h1>
                <div className="relative mx-auto mt-8 flex max-w-xl items-center justify-center px-4 text-base font-normal leading-relaxed text-[#30499B]/78 dark:text-slate-300 sm:text-lg">
                    <div className="yl-chip">
                        <Leaf className="h-5 w-5 text-[#30499B] dark:text-[#56B949]" />
                        <span>{t('hero.subtitle', '用科学指导，让环保更有效')}</span>
                    </div>
                </div>
            </motion.section>

            <div className="yl-page-surface space-y-16 px-4 py-12 sm:px-6 md:px-12">
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="h-8 w-1.5 rounded-full bg-[#30499B]" />
                        <div>
                            <h2 className="yl-section-title text-[#30499B] dark:text-[#56B949]">Data News</h2>
                            <p className="mt-1 text-xs text-slate-400">{t('news.subtitle', 'Sustainable Insights')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {dataNews.map((item) => (
                            <article
                                key={item.id}
                                onClick={() => viewArticle(item.id)}
                                className="yl-panel-soft yl-hover-card cursor-pointer p-6 hover:border-[#30499B]/25 hover:bg-[#30499B]/[0.04] dark:hover:bg-[#30499B]/10"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#30499B]/60">Data Insight</p>
                                <h3 className="mt-2 line-clamp-2 text-lg font-medium leading-snug text-[#30499B] dark:text-[#56B949]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                    {item.summary || t('viewContent', '点击查看详情')}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatShortDate(item.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#30499B] dark:text-[#56B949]">
                                        {t('actions.readFull', '阅读全文')}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </article>
                        ))}
                        {!loading && dataNews.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
                                {tCommon('noData', '暂无内容')}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 rounded-full bg-[#56B949]" />
                            <div>
                                <h2 className="yl-section-title text-[#30499B] dark:text-[#56B949]">{t('tips.title', '环保小贴士')}</h2>
                                <p className="mt-1 text-xs text-slate-400">{t('tips.subtitle', 'ECO TIPS FOR DAILY LIFE')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                                    className="yl-panel-soft yl-hover-card group cursor-pointer p-6 hover:border-[#30499B]/25 hover:bg-[#30499B]/[0.04] dark:hover:bg-[#30499B]/10"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-black/5 dark:bg-slate-700" style={{ color: config.color }}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="rounded bg-[#30499B]/10 px-2 py-1 text-[10px] font-bold tracking-wider text-[#30499B]/60">TIP</span>
                                    </div>
                                    <h3 className="mb-2 line-clamp-2 text-lg font-medium leading-snug text-[#30499B] dark:text-[#56B949]">
                                        {tip.title}
                                    </h3>
                                    <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                        {tip.summary || t('viewContent', '点击查看详情')}
                                    </p>
                                    <div className="mb-3 h-[1px] w-full bg-[#30499B]/10" />
                                    <div className="flex items-center gap-2 text-xs font-medium text-[#30499B] transition-transform group-hover:translate-x-1 dark:text-[#56B949]">
                                        {t('actions.learnMore', '了解更多')}
                                        <ArrowRight className="h-3 w-3" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div ref={newsRef} className="space-y-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 rounded-full bg-[#30499B]" />
                            <div>
                                <h2 className="yl-section-title text-[#30499B] dark:text-[#56B949]">{t('news.title', '深入科普')}</h2>
                                <p className="mt-1 text-xs text-slate-400">{t('news.subtitle', 'Sustainable Insights')}</p>
                            </div>
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-[#30499B]/50 hover:text-[#30499B] disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700"
                            >
                                <ChevronRight className="h-4 w-4 rotate-180" />
                            </button>
                            <span className="text-xs font-medium text-slate-400">
                                {currentPage} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                                className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-[#30499B]/50 hover:text-[#30499B] disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-8 rounded-3xl border border-slate-100 bg-white p-6 animate-pulse dark:border-slate-700 dark:bg-slate-800 md:flex-row">
                                    <div className="h-44 w-full rounded-2xl bg-slate-100 dark:bg-slate-700 md:w-64" />
                                    <div className="flex-1 space-y-4 py-2">
                                        <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-700" />
                                        <div className="h-8 w-3/4 rounded bg-slate-100 dark:bg-slate-700" />
                                        <div className="h-4 rounded bg-slate-100 dark:bg-slate-700" />
                                        <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-700" />
                                    </div>
                                </div>
                            ))
                        ) : contents.length > 0 ? (
                            contents.map((content) => {
                                const typeConfig = getTypeConfig(content.type);
                                return (
                                    <div
                                        key={content.id}
                                        className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:scale-[1.005] hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-black/20"
                                    >
                                        <div className="flex flex-col gap-6 p-4 sm:p-6 md:flex-row md:gap-8">
                                            <div className="relative h-48 w-full overflow-hidden rounded-2xl transition-all duration-500 group-hover:shadow-lg md:h-52 md:w-72">
                                                {content.coverImageUrl ? (
                                                    <img
                                                        src={content.coverImageUrl}
                                                        alt={content.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${typeConfig.gradient} opacity-80 transition-opacity group-hover:opacity-100`}>
                                                        <typeConfig.icon className={`h-12 w-12 ${typeConfig.text} opacity-20`} />
                                                    </div>
                                                )}
                                                <div className="absolute left-4 top-4">
                                                    <span className={`rounded-lg border border-white/20 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${typeConfig.text} shadow-sm backdrop-blur-md dark:bg-slate-800/90`}>
                                                        {t(`types.${content.type}`)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between py-2">
                                                <div>
                                                    <div className="mb-3 flex items-center gap-4 text-xs font-bold text-slate-400">
                                                        <div className="flex items-center gap-1.5 uppercase tracking-wider">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {formatShortDate(content.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 uppercase tracking-wider">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {Math.ceil((content.summary?.length || 0) / 100) + 2} MIN READ
                                                        </div>
                                                    </div>

                                                    <h3
                                                        onClick={() => viewArticle(content.id)}
                                                        className="mb-4 cursor-pointer text-xl font-bold leading-tight text-slate-800 transition-colors group-hover:text-[#30499B] dark:text-white dark:group-hover:text-[#56B949] md:text-2xl"
                                                    >
                                                        {content.title}
                                                    </h3>

                                                    <p className="mb-6 line-clamp-2 pr-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 md:line-clamp-3">
                                                        {content.summary || 'Explore more about this topic in the detail page.'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-slate-50 pt-5 dark:border-slate-700/50">
                                                    <div className="flex items-center gap-5">
                                                        <div className="group/stat flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-400 transition-colors hover:text-[#F0A32F]">
                                                            <div className="rounded-lg bg-slate-50 p-1.5 transition-colors group-hover/stat:bg-[#F0A32F]/10 dark:bg-slate-700/50">
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span>{content.viewCount || 0}</span>
                                                        </div>
                                                        <div className="group/stat flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-400 transition-colors hover:text-[#EE4035]">
                                                            <div className="rounded-lg bg-slate-50 p-1.5 transition-colors group-hover/stat:bg-[#EE4035]/10 dark:bg-slate-700/50">
                                                                <Heart className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span>{content.likeCount || 0}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => viewArticle(content.id)}
                                                        className="inline-flex items-center gap-2 text-sm font-black text-[#56B949] underline decoration-2 underline-offset-8 hover:opacity-85"
                                                    >
                                                        {t('actions.readFull', '阅读全文')}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-slate-500 dark:text-slate-400">{tCommon('noData', '暂无内容')}</p>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {(totalPages >= 1 || loading) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex flex-wrap items-center justify-center gap-1.5 pt-12 sm:gap-3"
                            >
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-all hover:bg-white hover:shadow-md disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:rounded-2xl sm:p-3"
                                >
                                    <ChevronRight className="h-4 w-4 rotate-180 sm:h-5 sm:w-5" />
                                </button>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        const pageNum = getPageNum(i, currentPage, totalPages);
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                disabled={loading}
                                                className={`h-9 w-9 rounded-xl text-xs font-bold transition-all sm:h-11 sm:w-11 sm:rounded-2xl sm:text-sm ${currentPage === pageNum
                                                    ? 'bg-[#30499B] text-white shadow-lg shadow-[#30499B]/30'
                                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#30499B]/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
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
                                    className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-all hover:bg-white hover:shadow-md disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:rounded-2xl sm:p-3"
                                >
                                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
}

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
    if (totalPages <= 5) {
        return i + 1;
    }
    if (currentPage <= 3) {
        return i + 1;
    }
    if (currentPage >= totalPages - 2) {
        return totalPages - 4 + i;
    }
    return currentPage - 2 + i;
}
