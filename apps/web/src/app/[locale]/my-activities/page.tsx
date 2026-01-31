'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import ProtectedRoute from '@/components/ProtectedRoute';
import { userApi, activityApi } from '@/lib/api';
import type { MyActivityItem } from '@/lib/api/user';
import {
    CalendarCheck,
    CalendarHeart,
    Trophy,
    Clock,
    Star,
    Calendar,
    MapPin,
    Leaf,
    Recycle,
    Droplets,
    CalendarPlus,
    CheckCircle,
    Trees,
    Wind,
    TreePine
} from 'lucide-react';


export default function MyActivitiesPage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as string) || 'zh';
    const { user, isLoggedIn, loading } = useAuth();
    const { t } = useSafeTranslation('myActivities');
    const [activeTab, setActiveTab] = useState('all');
    const [myActivities, setMyActivities] = useState<MyActivityItem[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activitiesPerPage] = useState(4);

    // 加载我的活动
    useEffect(() => {
        const loadMyActivities = async () => {
            if (!isLoggedIn) return;

            try {
                setLoadingActivities(true);
                const result = await userApi.getMyActivities({
                    page: currentPage,
                    size: activitiesPerPage
                }).catch(() => ({ items: [], total: 0 }));

                setMyActivities(result.items);
                setTotalPages(Math.ceil(result.total / activitiesPerPage));
            } catch (error) {
                // 完全静默处理错误
            } finally {
                setLoadingActivities(false);
            }
        };

        if (!loading && isLoggedIn) {
            loadMyActivities();
        }
    }, [isLoggedIn, loading, currentPage, activitiesPerPage]);

    // 移除这里的手动重定向逻辑，由 ProtectedRoute 处理

    const switchTab = (tabName: string) => {
        setActiveTab(tabName);
        setCurrentPage(1);
    };

    // 过滤活动
    const filteredActivities = myActivities.filter(activity => {
        if (activeTab === 'all') return true;

        const now = new Date();
        const startTime = new Date(activity.startTime);
        const endTime = new Date(activity.endTime);

        // 根据状态和时间筛选
        if (activeTab === 'registered') {
            // 已报名：包括待审核和已通过但还未开始的活动
            return activity.status === 'PENDING' ||
                (activity.status === 'APPROVED' && startTime > now);
        }

        if (activeTab === 'ongoing') {
            // 进行中：已通过且活动时间在进行中
            return activity.status === 'APPROVED' &&
                startTime <= now &&
                endTime >= now;
        }

        if (activeTab === 'completed') {
            // 已完成：已通过且活动已结束
            return activity.status === 'APPROVED' && endTime < now;
        }

        return true;
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        document.querySelector('.tab-content')?.scrollIntoView({ behavior: 'smooth' });
    };

    // 统计数据
    const now = new Date();
    const registeredCount = myActivities.filter(a =>
        a.status === 'PENDING' ||
        (a.status === 'APPROVED' && new Date(a.startTime) > now)
    ).length;
    const ongoingCount = myActivities.filter(a =>
        a.status === 'APPROVED' &&
        new Date(a.startTime) <= now &&
        new Date(a.endTime) >= now
    ).length;
    const completedCount = myActivities.filter(a =>
        a.status === 'APPROVED' &&
        new Date(a.endTime) < now
    ).length;
    const totalPoints = 0; // 从积分系统获取

    const viewActivityDetails = () => {
        console.log('查看活动详情');
    };

    const cancelRegistration = async (signupId: string, activityId: string) => {
        if (confirm(t('confirmCancel', '确定要取消报名吗？'))) {
            try {
                await activityApi.cancelSignup(activityId, signupId);
                alert(t('cancelSuccess', '报名已取消'));
                // Refresh list
                const result = await userApi.getMyActivities({
                    page: currentPage,
                    size: activitiesPerPage
                }).catch(() => ({ items: [], total: 0 }));
                setMyActivities(result.items);
            } catch (error) {
                // 静默处理错误
                alert(t('cancelFailed', '取消失败，请重试'));
            }
        }
    };

    if (loading || loadingActivities) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">{t('loading', '加载中...')}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user || !isLoggedIn) {
        return (
            <ProtectedRoute>
                <div />
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* ... 保持原有内容 ... */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 text-[#30499B] rounded-full text-sm font-semibold mb-4 border border-[#56B949]/20">
                            <CalendarHeart className="w-4 h-4" />
                            {t('badge', '活动管理')}
                        </div>
                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">{t('title', '我的活动中心')}</h2>
                        <p className="text-slate-500">{t('description', '管理您参与的所有环保活动')}</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#56B949] to-[#4aa840] rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#56B949] mb-1">{registeredCount}</div>
                            <div className="text-sm text-slate-500">{t('stats.registered', '已报名活动')}</div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#F0A32F] to-[#e67e22] rounded-full flex items-center justify-center mx-auto mb-3">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#F0A32F] mb-1">{completedCount}</div>
                            <div className="text-sm text-slate-500">{t('stats.completed', '已完成活动')}</div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#30499B] to-[#253a7a] rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#30499B] mb-1">{ongoingCount}</div>
                            <div className="text-sm text-slate-500">{t('stats.ongoing', '进行中活动')}</div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#EE4035] to-[#d63031] rounded-full flex items-center justify-center mx-auto mb-3">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#EE4035] mb-1">{totalPoints}</div>
                            <div className="text-sm text-slate-500">{t('stats.points', '获得积分')}</div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden mb-8">
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => switchTab('all')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'all'
                                    ? 'text-[#30499B] bg-slate-50'
                                    : 'text-slate-600 hover:text-[#30499B]'
                                    }`}
                            >
                                {t('tabs.all', '全部活动')}
                                {activeTab === 'all' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                                )}
                            </button>
                            <button
                                onClick={() => switchTab('registered')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'registered'
                                    ? 'text-[#30499B] bg-slate-50'
                                    : 'text-slate-600 hover:text-[#30499B]'
                                    }`}
                            >
                                {t('tabs.registered', '已报名')}
                                {activeTab === 'registered' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                                )}
                            </button>
                            <button
                                onClick={() => switchTab('ongoing')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'ongoing'
                                    ? 'text-[#30499B] bg-slate-50'
                                    : 'text-slate-600 hover:text-[#30499B]'
                                    }`}
                            >
                                {t('tabs.ongoing', '进行中')}
                                {activeTab === 'ongoing' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                                )}
                            </button>
                            <button
                                onClick={() => switchTab('completed')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'completed'
                                    ? 'text-[#30499B] bg-slate-50'
                                    : 'text-slate-600 hover:text-[#30499B]'
                                    }`}
                            >
                                {t('tabs.completed', '已完成')}
                                {activeTab === 'completed' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                                )}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 tab-content">
                            <div className="space-y-6">
                                {filteredActivities.map((activity) => (
                                    <div key={activity.signupId} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Activity Image */}
                                            <div className="w-full md:w-48 h-32 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {activity.coverImageUrl ? (
                                                    <img src={activity.coverImageUrl} alt={activity.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <TreePine className="w-12 h-12 text-[#56B949]/40" />
                                                )}
                                            </div>
                                            {/* Activity Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-serif font-semibold text-[#30499B] dark:text-[#56B949] mb-2">{activity.title}</h3>
                                                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(activity.startTime).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                                                            </span>
                                                            {activity.sessionId && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {t('sessionLabel', '场次')}: {activity.sessionId.slice(0, 8)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.status === 'PENDING' ? 'bg-gradient-to-r from-[#F0A32F] to-[#e67e22] text-white' :
                                                        activity.status === 'APPROVED' ? 'bg-gradient-to-r from-[#56B949] to-[#4aa840] text-white' :
                                                            activity.status === 'REJECTED' ? 'bg-gradient-to-r from-[#EE4035] to-[#d63031] text-white' :
                                                                'bg-gradient-to-r from-[#30499B] to-[#253a7a] text-white'
                                                        }`}>
                                                        {activity.status === 'PENDING' ? t('status.pending', '待审核') :
                                                            activity.status === 'APPROVED' ? t('status.approved', '已通过') :
                                                                activity.status === 'REJECTED' ? t('status.rejected', '已拒绝') : t('status.cancelled', '已取消')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                                        <span>{t('signupTime', '报名时间')}: {new Date(activity.signedUpAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => router.push(`/${locale}/activities/${activity.activityId}`)}
                                                            className="px-4 py-2 text-[#30499B] dark:text-[#56B949] border border-[#30499B] dark:border-[#56B949] rounded-lg hover:bg-[#30499B] dark:hover:bg-[#56B949] hover:text-white transition-colors text-sm"
                                                        >
                                                            {t('viewDetails', '查看详情')}
                                                        </button>
                                                        {activity.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => cancelRegistration(activity.signupId, activity.activityId)}
                                                                className="px-4 py-2 text-[#EE4035] border border-[#EE4035] rounded-lg hover:bg-[#EE4035] hover:text-white transition-colors text-sm"
                                                            >
                                                                {t('cancelRegistration', '取消报名')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State */}
                                {filteredActivities.length === 0 && (
                                    <div className="text-center py-12">
                                        <CalendarPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                                            {activeTab === 'registered' ? t('empty.registered', '暂无已报名活动') :
                                                activeTab === 'ongoing' ? t('empty.ongoing', '暂无进行中活动') :
                                                    activeTab === 'completed' ? t('empty.completed', '暂无已完成活动') : t('empty.all', '暂无活动')}
                                        </h3>
                                        <p className="text-slate-400">
                                            {activeTab === 'registered' ? t('empty.registeredDesc', '您还没有报名任何活动') :
                                                activeTab === 'ongoing' ? t('empty.ongoingDesc', '您目前没有正在进行的活动') :
                                                    activeTab === 'completed' ? t('empty.completedDesc', '您还没有完成任何活动') : t('empty.allDesc', '暂无相关活动')}
                                        </p>
                                    </div>
                                )}

                                {/* Pagination */}
                                {filteredActivities.length > 0 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}