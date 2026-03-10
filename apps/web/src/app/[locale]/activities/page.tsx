'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    CalendarHeart,
    Flame,
    CalendarCheck,
    PlusCircle,
    Calendar,
    Star,
    ThumbsUp,
    Trees,
    Sun,
    Waves,
    Recycle,
    Heart,
    Users,
    Music,
    Trophy,
    Cpu,
    Palette,
    Leaf
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter, hoverLift } from '@/lib/animations';
import { activityApi } from '@/lib/api';
import type { ActivityItem } from '@/lib/api/activity';
import ActivityStatsSidebar from '@/components/activity/ActivityStatsSidebar';
import AuthPromptModal from '@/components/auth/AuthPromptModal';

function ActivitiesPageContent() {
    const { user, isLoggedIn } = useAuth();
    const { t } = useSafeTranslation('activities');
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as string) || 'zh';
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // 每页显示4个活动

    // 状态管理
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // 加载活动数据
    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoading(true);
                const result = await activityApi.getActivities({
                    page: currentPage,
                    size: itemsPerPage,
                    sort: 'hot',
                    category: selectedCategory
                });
                setActivities(result.items);
                setTotalPages(Math.ceil(result.total / itemsPerPage));
            } catch (error) {
                console.error('Failed to load activities:', error);
                // 失败时使用空数组
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, [currentPage, selectedCategory]);



    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        scrollToActivities();
    };

    const handleCategoryChange = (category: number | undefined) => {
        setSelectedCategory(category);
        setCurrentPage(1); // 切换分类时重置到第一页
        scrollToActivities();
    };

    const scrollToActivities = () => {
        const activitiesSection = document.getElementById('activities-section');
        if (activitiesSection) {
            activitiesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const goToMyActivities = () => {
        if (!user || !isLoggedIn) {
            setIsAuthModalOpen(true);
        } else {
            router.push(`/${locale}/my-activities`);
        }
    };

    const checkLoginAndRedirect = () => {
        if (!user || !isLoggedIn) {
            setIsAuthModalOpen(true);
        } else {
            router.push(`/${locale}/activities/create`);
        }
    };

    const registerActivity = (activityId: string) => {
        if (!user || !isLoggedIn) {
            setIsAuthModalOpen(true);
        } else {
            router.push(`/${locale}/activities/register?id=${activityId}`);
        }
    };

    const viewActivityDetails = (activityId: string) => {
        router.push(`/${locale}/activities/${activityId}`);
    };

    return (
        <Layout>
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,251,246,0.84))] px-4 py-12 text-center shadow-[0_30px_100px_-60px_rgba(67,121,74,0.45)] ring-1 ring-[#56B949]/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.68))] dark:ring-white/10 sm:py-14"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-10 top-0 h-44 w-44 rounded-full bg-[#EAF5DD] blur-3xl dark:bg-[#56B949]/15" />
                    <div className="absolute right-[-8%] top-8 h-56 w-56 rounded-full bg-[#DCF5E6] blur-3xl dark:bg-[#34D399]/12" />
                </div>
                <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-[#56B949]/20 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2F8F43] shadow-[0_10px_30px_-18px_rgba(86,185,73,0.42)] backdrop-blur-md dark:border-[#56B949]/20 dark:bg-white/10 dark:text-[#56B949]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#56B949] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#56B949]"></span>
                    </span>
                    {t('subtitle', '参与绿色行动')}
                </div>
                <h1 className="relative mx-auto mb-6 max-w-3xl text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#173325] drop-shadow-sm dark:text-[#E9FBE9] sm:text-[3.3rem] md:text-[4.2rem]">
                    {t('title', '环保活动')}
                </h1>
                <div className="relative mx-auto flex max-w-2xl flex-col items-center justify-center gap-3 px-4 text-base font-normal leading-relaxed text-[#5F7387] dark:text-slate-300 sm:text-lg">
                    <div className="yl-chip">
                        <CalendarHeart className="w-5 h-5 text-[#30499B]" />
                        <span>{t('description', '参与各种环保活动，为可持续未来贡献力量')}</span>
                    </div>
                </div>
                <div className="relative mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                    <span className="yl-chip">Eco community</span>
                    <span className="yl-chip">Youth actions</span>
                    <span className="yl-chip">Local impact</span>
                </div>
            </motion.section>

            {/* Interactive Carousel Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="mx-auto max-w-6xl px-4 py-6 pb-12 sm:px-6"
            >
                <div className="flex justify-center">
                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
                        {/* Card 1: 热门活动 */}
                        <motion.div
                            onClick={scrollToActivities}
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="flex-1 group relative rounded-2xl transition-all duration-500 cursor-pointer"
                        >
                            <div className="relative bg-white dark:bg-slate-800 h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-[#EE4035]/5 border border-[#EE4035]/20 dark:border-slate-700 dark:shadow-none">
                                <div className="w-12 h-12 rounded-full bg-[#EE4035]/10 dark:bg-[#EE4035]/20 flex items-center justify-center text-[#EE4035] mb-4 group-hover:bg-[#EE4035] group-hover:text-white transition-colors">
                                    <Flame className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl text-[#30499B] dark:text-slate-200 font-serif font-semibold mb-1">
                                    {t('cards.popular.title', '热门活动')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('cards.popular.subtitle', '最受欢迎的环保行动')}
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 2: 我的活动 */}
                        <motion.div
                            onClick={goToMyActivities}
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="flex-1 group relative rounded-2xl transition-all duration-500 cursor-pointer"
                        >
                            <div className="relative bg-gradient-to-br from-[#56B949] to-[#4aa840] dark:from-slate-800 dark:to-slate-900 border border-transparent dark:border-[#56B949]/30 h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
                                <CalendarCheck className="w-10 h-10 text-white dark:text-[#56B949] mb-3 opacity-90" />
                                <h3 className="text-2xl text-white dark:text-[#56B949] font-serif font-semibold leading-tight mb-4">
                                    {t('cards.myActivities.title', '我的活动')}<br />
                                    {t('cards.myActivities.center', '中心')}
                                </h3>
                                <div>
                                    <span className="px-4 py-1.5 bg-white/20 dark:bg-[#56B949]/10 text-white dark:text-[#56B949] text-xs font-medium rounded-full backdrop-blur-sm border border-white/30 dark:border-[#56B949]/30">
                                        {t('cards.myActivities.action', '查看报名')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3: 发布活动 */}
                        <motion.div
                            onClick={checkLoginAndRedirect}
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="flex-1 group relative rounded-2xl transition-all duration-500 cursor-pointer"
                        >
                            <div className="relative bg-white dark:bg-slate-800 h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-[#F0A32F]/5 border border-[#F0A32F]/20 dark:border-slate-700 dark:shadow-none">
                                <div className="w-12 h-12 rounded-full bg-[#F0A32F]/10 dark:bg-[#F0A32F]/20 flex items-center justify-center text-[#F0A32F] mb-4 group-hover:bg-[#F0A32F] group-hover:text-white transition-colors">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl text-[#30499B] dark:text-slate-200 font-serif font-semibold mb-1">
                                    {t('cards.create.title', '发布活动')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('cards.create.subtitle', '组织你的环保活动')}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content Grid */}
            <motion.div
                id="activities-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="bg-white dark:bg-slate-900 px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100 dark:border-slate-800"
            >
                <motion.div
                    variants={staggerItem}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative"
                >
                    {/* Left Column: Categories & Feed */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-8 space-y-6"
                    >
                        {/* Categories Filter */}
                        <div className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60 dark:border-slate-700">
                            <div className="flex flex-col gap-4">
                                <h2 className="text-lg font-serif font-bold text-[#30499B] dark:text-[#56B949]">
                                    {t('filters.title', '分类')}
                                </h2>
                                <div className="flex flex-wrap gap-x-2 gap-y-3">
                                    <button
                                        onClick={() => handleCategoryChange(undefined)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${selectedCategory === undefined
                                            ? 'bg-[#30499B] dark:bg-[#56B949] text-white shadow-md shadow-[#30499B]/20 dark:shadow-[#56B949]/20'
                                            : 'bg-white/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600 hover:bg-[#30499B]/10 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {t('filters.all', '全部')}
                                    </button>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((catId) => (
                                        <button
                                            key={catId}
                                            onClick={() => handleCategoryChange(catId)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${selectedCategory === catId
                                                ? 'bg-[#56B949] text-white shadow-md shadow-[#56B949]/20'
                                                : 'bg-white/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600 hover:bg-[#56B949] hover:text-white hover:border-[#56B949] dark:hover:text-white dark:hover:border-[#56B949]'
                                                }`}
                                        >
                                            {t(`categories.${activityApi.mapCategory(catId)}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Activity List Container */}
                        <div className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-white/60 dark:border-slate-700 min-h-[600px] flex flex-col gap-6">
                            {loading ? (
                                // 加载骨架屏
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl animate-pulse">
                                        <div className="w-full sm:w-48 h-32 rounded-lg bg-slate-200"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-200 rounded"></div>
                                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                            <div className="h-8 bg-slate-200 rounded w-24 mt-4"></div>
                                        </div>
                                    </div>
                                ))
                            ) : activities.length > 0 ? (
                                // 真实数据
                                activities.map((activity) => {
                                    // 根据活动类型确定图标和颜色
                                    const getIcon = () => {
                                        switch (activity.category) {
                                            case 'environmental': return <Trees className="w-8 h-8" />;
                                            case 'volunteer': return <Heart className="w-8 h-8" />;
                                            case 'community': return <Users className="w-8 h-8" />;
                                            case 'culture': return <Music className="w-8 h-8" />;
                                            case 'sports': return <Trophy className="w-8 h-8" />;
                                            case 'tech': return <Cpu className="w-8 h-8" />;
                                            case 'art': return <Palette className="w-8 h-8" />;
                                            default: return <Sun className="w-8 h-8" />;
                                        }
                                    };

                                    const getGradient = () => {
                                        switch (activity.category) {
                                            case 'environmental': return 'from-[#56B949]/20 to-[#30499B]/20';
                                            case 'volunteer': return 'from-[#EE4035]/20 to-[#F0A32F]/20';
                                            case 'community': return 'from-[#30499B]/20 to-[#56B949]/20';
                                            case 'culture': return 'from-[#F0A32F]/20 to-[#EE4035]/20';
                                            case 'tech': return 'from-[#30499B]/20 to-[#4aa840]/20';
                                            default: return 'from-slate-100 to-slate-200';
                                        }
                                    };

                                    // 根据报名策略确定状态
                                    const getStatusText = () => {
                                        if (activity.signupPolicy === 'CLOSED') return t('status.ended', '报名结束');
                                        if (activity.signupPolicy === 'APPROVAL_REQUIRED') return t('status.approvalRequired', '需审核');
                                        if (activity.status === 'COMPLETED') return t('status.completed', '已结束');
                                        if (activity.status === 'ONGOING') return t('status.ongoing', '进行中');
                                        return t('status.registering', '正在报名');
                                    };

                                    const getStatusColor = () => {
                                        if (activity.signupPolicy === 'CLOSED' || activity.status === 'COMPLETED') {
                                            return 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300';
                                        }
                                        if (activity.status === 'ONGOING') return 'text-[#56B949] bg-[#56B949]/10 dark:bg-[#56B949]/20';
                                        return 'text-[#30499B] bg-[#30499B]/10 dark:bg-slate-700 dark:text-slate-100';
                                    };

                                    const canSignup = activity.signupPolicy !== 'CLOSED' && activity.status !== 'COMPLETED';

                                    return (
                                        <div key={activity.id} className="group flex flex-col sm:flex-row gap-6 p-4 rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:shadow-[#56B949]/5 dark:hover:shadow-none hover:border-[#56B949]/20 dark:hover:border-slate-600">
                                            <div className={`w-full sm:w-48 h-32 rounded-lg bg-gradient-to-br ${getGradient()} overflow-hidden relative flex-shrink-0`}>
                                                {activity.coverImageUrl ? (
                                                    <img src={activity.coverImageUrl} alt={activity.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <div className={`absolute top-2 left-2 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${getStatusColor()}`}>
                                                            {getStatusText()}
                                                        </div>
                                                        <div className="w-full h-full flex items-center justify-center text-current opacity-40">
                                                            {getIcon()}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3
                                                        onClick={() => viewActivityDetails(activity.id)}
                                                        className="text-lg font-serif font-semibold text-[#30499B] dark:text-slate-200 transition-colors tracking-tight mb-2 cursor-pointer hover:underline"
                                                    >
                                                        {activity.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                        {activity.summary || '点击查看详情...'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 border-t border-slate-100/50 dark:border-slate-700/50 pt-4 gap-4 sm:gap-3">
                                                    <div className="flex items-center justify-between w-full sm:w-auto text-xs text-slate-400 dark:text-slate-500">
                                                        <span className="flex items-center gap-1 whitespace-nowrap">
                                                            <Calendar className="w-3 h-3" /> {new Date(activity.startTime).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric' })}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1 hover:text-[#F0A32F] transition-colors cursor-pointer whitespace-nowrap">
                                                                <Star className="w-3 h-3" /> {activity.viewCount}
                                                            </span>
                                                            <span className="flex items-center gap-1 hover:text-[#EE4035] transition-colors cursor-pointer whitespace-nowrap">
                                                                <ThumbsUp className="w-3 h-3" /> {activity.likeCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => canSignup ? registerActivity(activity.id) : viewActivityDetails(activity.id)}
                                                        className={`w-full sm:w-auto flex justify-center items-center whitespace-nowrap px-4 py-2 sm:py-1.5 rounded-lg text-sm sm:text-xs font-semibold transition-all ${canSignup
                                                            ? 'bg-[#56B949] text-white shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] hover:-translate-y-0.5'
                                                            : 'bg-white dark:bg-slate-700 border border-[#30499B] dark:border-slate-600 text-[#30499B] dark:text-slate-300 hover:bg-[#30499B] hover:text-white dark:hover:bg-slate-600'
                                                            }`}
                                                    >
                                                        {canSignup ? t('actions.register', '一键报名') : t('actions.viewDetails', '了解详情')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                // 空状态
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <CalendarHeart className="w-16 h-16 text-slate-300 mb-4" />
                                    <p className="text-slate-500 mb-2">{t('empty.title', '暂无活动')}</p>
                                    <p className="text-xs text-slate-400">{t('empty.subtitle', '请稍后再来查看')}</p>
                                </div>
                            )}
                        </div>

                        {/* 分页组件 */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </motion.div>

                    {/* Right Sidebar */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-4 space-y-6"
                    >
                        <ActivityStatsSidebar onCategorySelect={handleCategoryChange} />
                    </motion.div>
                </motion.div>
            </motion.div >
            {/* Auth Prompt Modal */}
            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </Layout >
    );
}

export default function ActivitiesPage() {
    return (
        <Suspense fallback={
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">加载中...</p>
                    </div>
                </div>
            </Layout>
        }>
            <ActivitiesPageContent />
        </Suspense>
    );
}
