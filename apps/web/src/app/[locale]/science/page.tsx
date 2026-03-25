'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BarChart3, BookOpen, Calendar, ChevronRight, Clock, Eye, Factory, Heart, Leaf, Newspaper, Scale } from 'lucide-react';
import Layout from '@/components/Layout';
import { pageEnter } from '@/lib/animations';
import { contentApi } from '@/lib/api';
import type { ContentItem, ContentType } from '@/lib/api/content';
import { formatShortDate } from '@/lib/date-utils';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

type TabKey = 'data' | 'news' | 'cases' | 'policy' | 'wiki';

interface TabConfig {
    key: TabKey;
    labelZh: string;
    labelEn: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    textColor: string;
    fetchType?: ContentType;
    isDataNews?: boolean;
}

const TABS: TabConfig[] = [
    { key: 'data', labelZh: '数据洞察', labelEn: 'Data', icon: BarChart3, color: '#30499B', gradient: 'from-blue-500/20 to-indigo-500/20', textColor: 'text-blue-600 dark:text-blue-400', isDataNews: true },
    { key: 'news', labelZh: '新闻资讯', labelEn: 'News', icon: Newspaper, color: '#2563eb', gradient: 'from-sky-500/20 to-blue-500/20', textColor: 'text-sky-600 dark:text-sky-400', fetchType: 'NEWS' },
    { key: 'cases', labelZh: '案例动态', labelEn: 'Cases', icon: Factory, color: '#56B949', gradient: 'from-green-500/20 to-emerald-500/20', textColor: 'text-green-600 dark:text-green-400', fetchType: 'DYNAMIC' },
    { key: 'policy', labelZh: '政策法规', labelEn: 'Policy', icon: Scale, color: '#F0A32F', gradient: 'from-amber-500/20 to-orange-500/20', textColor: 'text-amber-600 dark:text-amber-400', fetchType: 'POLICY' },
    { key: 'wiki', labelZh: '环保百科', labelEn: 'Wiki', icon: BookOpen, color: '#8b5cf6', gradient: 'from-purple-500/20 to-pink-500/20', textColor: 'text-purple-600 dark:text-purple-400', fetchType: 'WIKI' },
];

export default function SciencePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = (params?.locale as string) || 'zh';
    const isZh = locale === 'zh';
    const { t } = useSafeTranslation('science');
    const { t: tCommon } = useSafeTranslation('common');

    const initialTab = (searchParams.get('tab') as TabKey) || 'data';
    const [activeTab, setActiveTab] = useState<TabKey>(TABS.some(t => t.key === initialTab) ? initialTab : 'data');
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const listRef = useRef<HTMLDivElement>(null);
    const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';

    const activeTabConfig = TABS.find(t => t.key === activeTab) || TABS[0];

    const loadContents = useCallback(async (tab: TabKey, page: number) => {
        const tabConfig = TABS.find(t => t.key === tab) || TABS[0];
        try {
            setLoading(true);
            let result;
            if (tabConfig.isDataNews) {
                result = await contentApi.getDataNewsContents({ page, size: pageSize, sort: 'latest' });
            } else {
                result = await contentApi.getContents({ type: tabConfig.fetchType, page, size: pageSize, sort: 'latest' });
            }
            setContents(result.items);
            setTotalPages(Math.max(1, Math.ceil(result.total / pageSize)));
        } catch (error) {
            console.error('Failed to load science contents:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        loadContents(activeTab, 1);
    }, [activeTab, loadContents]);

    useEffect(() => {
        if (currentPage > 1) {
            loadContents(activeTab, currentPage);
        }
    }, [currentPage, activeTab, loadContents]);

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        router.replace(`/${locale}/science?tab=${tab}`, { scroll: false });
    };

    const viewArticle = (articleId: string) => {
        router.push(`/${locale}/science/${articleId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (listRef.current) {
            const headerOffset = 120;
            const top = listRef.current.getBoundingClientRect().top + window.pageYOffset - headerOffset;
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
                    {t('hero.badge', '环境科学知识库')}
                </div>
                <h1 className="relative mx-auto max-w-2xl text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#30499B] dark:text-[#56B949] sm:text-[3.35rem] md:text-[4.25rem]">
                    {t('hero.title', '科学环保')}
                </h1>
                <div className="relative mx-auto mt-8 flex max-w-xl items-center justify-center px-4 text-base font-normal leading-relaxed text-[#30499B]/78 dark:text-slate-300 sm:text-lg">
                    <div className="yl-chip">
                        <Leaf className="h-5 w-5 text-[#30499B] dark:text-[#56B949]" />
                        <span>{t('hero.subtitle', '以科学为指导，让环保更有效')}</span>
                    </div>
                </div>
            </motion.section>

            <div className="yl-page-surface px-4 py-12 sm:px-6 md:px-12">
                {/* Tab Bar */}
                <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                                    isActive
                                        ? 'text-white shadow-lg'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                                style={isActive ? { backgroundColor: tab.color, boxShadow: `0 8px 24px -8px ${tab.color}60` } : undefined}
                            >
                                <Icon className="h-4 w-4" />
                                {isZh ? tab.labelZh : tab.labelEn}
                            </button>
                        );
                    })}
                </div>

                {/* Content List */}
                <div ref={listRef} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex animate-pulse flex-col gap-8 rounded-3xl border border-slate-100 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 md:flex-row">
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
                            contents.map((content) => (
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
                                                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${activeTabConfig.gradient} opacity-80 transition-opacity group-hover:opacity-100`}>
                                                    <activeTabConfig.icon className={`h-12 w-12 ${activeTabConfig.textColor} opacity-20`} />
                                                </div>
                                            )}
                                            <div className="absolute left-4 top-4">
                                                <span
                                                    className="rounded-lg border border-white/20 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-tighter shadow-sm backdrop-blur-md dark:bg-slate-800/90"
                                                    style={{ color: activeTabConfig.color }}
                                                >
                                                    {isZh ? activeTabConfig.labelZh : activeTabConfig.labelEn}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-2">
                                            <div>
                                                <div className="mb-3 flex items-center gap-4 text-xs font-bold text-slate-400">
                                                    <div className="flex items-center gap-1.5 uppercase tracking-wider">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatShortDate(content.publishedAt, dateLocale)}
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
                                                    {content.summary || (isZh ? '点击查看详情' : 'Open to read details')}
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
                                                    className="inline-flex items-center gap-2 text-sm font-black underline decoration-2 underline-offset-8 hover:opacity-85"
                                                    style={{ color: activeTabConfig.color }}
                                                >
                                                    {t('actions.readFull', '阅读全文')}
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-slate-500 dark:text-slate-400">{tCommon('noData', '暂无内容')}</p>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {totalPages > 1 && (
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
                                                    ? 'text-white shadow-lg'
                                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#30499B]/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                style={currentPage === pageNum ? { backgroundColor: activeTabConfig.color, boxShadow: `0 6px 16px -4px ${activeTabConfig.color}50` } : undefined}
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
