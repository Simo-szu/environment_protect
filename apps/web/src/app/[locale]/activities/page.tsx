'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
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
    Recycle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter, hoverLift } from '@/lib/animations';
import { activityApi } from '@/lib/api';
import type { ActivityItem } from '@/lib/api/activity';

function ActivitiesPageContent() {
    const { user, isLoggedIn } = useAuth();
    const { t } = useSafeTranslation('activities');
    const params = useParams();
    const locale = (params?.locale as string) || 'zh';
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // 每页显示4个活动

    // 状态管理
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    // 加载活动数据
    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoading(true);
                const result = await activityApi.getActivities({
                    page: currentPage,
                    size: itemsPerPage,
                    sort: 'hot'
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
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // 滚动到活动列表顶部
        const activitiesSection = document.getElementById('activities-section');
        if (activitiesSection) {
            activitiesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
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
            window.location.href = `/${locale}/login`;
        } else {
            window.location.href = `/${locale}/my-activities`;
        }
    };

    const checkLoginAndRedirect = () => {
        if (!user || !isLoggedIn) {
            window.location.href = `/${locale}/login`;
        } else {
            window.location.href = `/${locale}/activities/create`;
        }
    };

    const registerActivity = (activityId: string) => {
        if (!user || !isLoggedIn) {
            window.location.href = `/${locale}/login`;
        } else {
            window.location.href = `/${locale}/activities/register?id=${activityId}`;
        }
    };

    const viewActivityDetails = (activityId: string) => {
        window.location.href = `/${locale}/activities/${activityId}`;
    };

    return (
        <Layout>
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white via-[#30499B]/5 to-white"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30499B] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30499B]"></span>
                    </span>
                    {t('subtitle', '参与绿色行动')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] mb-6 drop-shadow-sm leading-tight">
                    {t('title', '环保活动')}
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 font-normal max-w-lg mx-auto leading-relaxed px-4">
                    <div className="flex items-center gap-2">
                        <CalendarHeart className="w-5 h-5 text-[#30499B]" />
                        <span>{t('description', '参与各种环保活动，为可持续未来贡献力量')}</span>
                    </div>
                </div>
            </motion.section>

            {/* Interactive Carousel Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-12"
            >
                <div className="flex justify-center">
                    <div className="flex gap-6 w-full max-w-4xl">
                        {/* Card 1: 热门活动 */}
                        <motion.div
                            onClick={scrollToActivities}
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="flex-1 group relative rounded-2xl transition-all duration-500 cursor-pointer"
                        >
                            <div className="relative bg-white h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-[#EE4035]/5 border border-[#EE4035]/20">
                                <div className="w-12 h-12 rounded-full bg-[#EE4035]/10 flex items-center justify-center text-[#EE4035] mb-4 group-hover:bg-[#EE4035] group-hover:text-white transition-colors">
                                    <Flame className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl text-[#30499B] font-serif font-semibold mb-1">
                                    {t('cards.popular.title', '热门活动')}
                                </h3>
                                <p className="text-sm text-slate-500">
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
                            <div className="relative bg-gradient-to-br from-[#56B949] to-[#4aa840] h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner border border-white/20">
                                <CalendarCheck className="w-10 h-10 text-white mb-3 opacity-90" />
                                <h3 className="text-2xl text-white font-serif font-semibold leading-tight mb-2">
                                    {t('cards.myActivities.title', '我的活动')}<br />
                                    {t('cards.myActivities.center', '中心')}
                                </h3>
                                <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm border border-white/30">
                                    {t('cards.myActivities.action', '查看报名')}
                                </span>
                            </div>
                        </motion.div>

                        {/* Card 3: 发布活动 */}
                        <motion.div
                            onClick={checkLoginAndRedirect}
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="flex-1 group relative rounded-2xl transition-all duration-500 cursor-pointer"
                        >
                            <div className="relative bg-white h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-[#F0A32F]/5 border border-[#F0A32F]/20">
                                <div className="w-12 h-12 rounded-full bg-[#F0A32F]/10 flex items-center justify-center text-[#F0A32F] mb-4 group-hover:bg-[#F0A32F] group-hover:text-white transition-colors">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl text-[#30499B] font-serif font-semibold mb-1">
                                    {t('cards.create.title', '发布活动')}
                                </h3>
                                <p className="text-sm text-slate-500">
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
                className="bg-white px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100"
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
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-baseline">
                                <h2 className="text-lg font-serif font-bold text-[#30499B] flex-shrink-0 w-16">
                                    {t('filters.title', '分类')}
                                </h2>
                                <div className="flex flex-wrap gap-x-2 gap-y-3">
                                    <button className="px-4 py-1.5 rounded-full bg-[#30499B] text-white text-xs font-medium shadow-md shadow-[#30499B]/20 transition-all hover:scale-105">
                                        {t('filters.all', '全部')}
                                    </button>
                                    <button className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 border border-slate-100 text-xs font-medium hover:bg-[#56B949] hover:text-white hover:border-[#56B949] transition-all duration-300">
                                        {t('filters.market', '环保市集')}
                                    </button>
                                    <button className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 border border-slate-100 text-xs font-medium hover:bg-[#56B949] hover:text-white hover:border-[#56B949] transition-all duration-300">
                                        {t('filters.planting', '植树活动')}
                                    </button>
                                    <button className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 border border-slate-100 text-xs font-medium hover:bg-[#56B949] hover:text-white hover:border-[#56B949] transition-all duration-300">
                                        {t('filters.sorting', '垃圾分类')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Activity List Container */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-white/60 min-h-[600px] flex flex-col gap-6">
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
                                    const getIcon = () => <Trees className="w-8 h-8" />;
                                    const getGradient = () => 'from-[#56B949]/20 to-[#30499B]/20';
                                    
                                    // 根据报名策略确定状态
                                    const getStatusText = () => {
                                        if (activity.signupPolicy === 'CLOSED') return '报名结束';
                                        if (activity.signupPolicy === 'APPROVAL_REQUIRED') return '需审核';
                                        if (activity.status === 'COMPLETED') return '已结束';
                                        if (activity.status === 'ONGOING') return '进行中';
                                        return '正在报名';
                                    };

                                    const getStatusColor = () => {
                                        if (activity.signupPolicy === 'CLOSED' || activity.status === 'COMPLETED') {
                                            return 'text-slate-500 bg-slate-100';
                                        }
                                        if (activity.status === 'ONGOING') return 'text-[#56B949] bg-[#56B949]/10';
                                        return 'text-[#30499B] bg-[#30499B]/10';
                                    };

                                    const canSignup = activity.signupPolicy !== 'CLOSED' && activity.status !== 'COMPLETED';

                                    return (
                                        <div key={activity.id} className="group flex flex-col sm:flex-row gap-6 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg border border-transparent hover:shadow-[#56B949]/5 hover:border-[#56B949]/20">
                                            <div className={`w-full sm:w-48 h-32 rounded-lg bg-gradient-to-br ${getGradient()} overflow-hidden relative flex-shrink-0`}>
                                                {activity.coverImageUrl ? (
                                                    <img src={activity.coverImageUrl} alt={activity.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <div className={`absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${getStatusColor()}`}>
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
                                                        className="text-lg font-serif font-semibold text-[#30499B] transition-colors tracking-tight mb-2 cursor-pointer hover:underline"
                                                    >
                                                        {activity.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        {activity.summary || '点击查看详情...'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-4 border-t border-slate-100/50 pt-3">
                                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {new Date(activity.startTime).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1 hover:text-[#F0A32F] transition-colors cursor-pointer">
                                                                <Star className="w-3 h-3" /> {activity.viewCount}
                                                            </span>
                                                            <span className="flex items-center gap-1 hover:text-[#EE4035] transition-colors cursor-pointer">
                                                                <ThumbsUp className="w-3 h-3" /> {activity.likeCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => canSignup ? registerActivity(activity.id) : viewActivityDetails(activity.id)}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                            canSignup
                                                                ? 'bg-[#56B949] text-white shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] hover:-translate-y-0.5'
                                                                : 'bg-white border border-[#30499B] text-[#30499B] hover:bg-[#30499B] hover:text-white'
                                                        }`}
                                                    >
                                                        {canSignup ? '一键报名' : '了解详情'}
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
                                    <p className="text-slate-500 mb-2">暂无活动</p>
                                    <p className="text-xs text-slate-400">请稍后再来查看</p>
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
                        {/* Quick Stats */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
                            <h3 className="text-lg font-serif font-bold text-[#30499B] mb-4">
                                {t('stats.title', '活动统计')}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">
                                        {t('stats.monthlyActivities', '本月活动')}
                                    </span>
                                    <span className="text-lg font-bold text-[#56B949]">12</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">
                                        {t('stats.participants', '参与人数')}
                                    </span>
                                    <span className="text-lg font-bold text-[#30499B]">1,234</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">
                                        {t('stats.myRegistrations', '我的报名')}
                                    </span>
                                    <span className="text-lg font-bold text-[#F0A32F]">3</span>
                                </div>
                            </div>
                        </div>

                        {/* Popular Categories */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
                            <h3 className="text-lg font-serif font-bold text-[#30499B] mb-4">
                                {t('categories.title', '热门分类')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                                    <Trees className="w-5 h-5 text-[#56B949]" />
                                    <span className="text-sm text-slate-600">
                                        {t('categories.planting', '植树活动')}
                                    </span>
                                    <span className="ml-auto text-xs text-slate-400">8</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                                    <Waves className="w-5 h-5 text-[#30499B]" />
                                    <span className="text-sm text-slate-600">
                                        {t('categories.beachCleanup', '净滩行动')}
                                    </span>
                                    <span className="ml-auto text-xs text-slate-400">5</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                                    <Recycle className="w-5 h-5 text-[#F0A32F]" />
                                    <span className="text-sm text-slate-600">
                                        {t('categories.recycling', '回收利用')}
                                    </span>
                                    <span className="ml-auto text-xs text-slate-400">7</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div >
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