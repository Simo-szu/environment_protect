'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Clock,
    User,
    Phone,
    Mail,
    TreePine,
    Recycle,
    Droplets,
    Sun,
    Heart,
    Share2,
    BookmarkPlus
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';
import { activityApi, interactionApi } from '@/lib/api';
import type { ActivityDetail, ActivitySession } from '@/lib/api/activity';
import ActivityStatsSidebar from '@/components/activity/ActivityStatsSidebar';
import AuthPromptModal from '@/components/auth/AuthPromptModal';

export default function ActivityDetailPage() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const params = useParams();
    const activityId = params.id as string;
    const locale = params.locale as string;
    const { t } = useSafeTranslation('activities');

    // 状态管理
    const [activity, setActivity] = useState<ActivityDetail | null>(null);
    const [sessions, setSessions] = useState<ActivitySession[]>([]);
    const [loading, setLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // 加载活动数据
    useEffect(() => {
        const loadActivityData = async () => {
            try {
                setLoading(true);

                // 并行加载活动详情和场次
                const [activityData, sessionsData] = await Promise.all([
                    activityApi.getActivityDetail(activityId),
                    activityApi.getActivitySessions(activityId).catch(() => []) // 场次可能为空
                ]);

                setActivity(activityData);
                setSessions(sessionsData);

                // 设置用户状态
                if (activityData.userState) {
                    setIsLiked(activityData.userState.liked);
                    setIsFavorited(activityData.userState.favorited);
                }
                setLikeCount(activityData.likeCount);
            } catch (error) {
                console.error('Failed to load activity:', error);
            } finally {
                setLoading(false);
            }
        };

        loadActivityData();
    }, [activityId]);

    const handleBack = () => {
        router.push(`/${locale}/activities`);
    };

    const handleRegister = () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }
        router.push(`/${locale}/activities/register?id=${activityId}`);
    };

    const handleLike = async () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        try {
            if (isLiked) {
                await interactionApi.deleteReaction(2, activityId, 'LIKE');
                setLikeCount(prev => prev - 1);
                setIsLiked(false);
            } else {
                await interactionApi.createReaction(2, activityId, 'LIKE');
                setLikeCount(prev => prev + 1);
                setIsLiked(true);
            }
        } catch (error: any) {
            console.error('Failed to toggle like:', error);
            // 如果失败，恢复原状态
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
            alert(error.message || t('operationFailed', '操作失败，请重试'));
        }
    };

    const handleFavorite = async () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        try {
            if (isFavorited) {
                await interactionApi.deleteReaction(2, activityId, 'FAVORITE');
                setIsFavorited(false);
            } else {
                await interactionApi.createReaction(2, activityId, 'FAVORITE');
                setIsFavorited(true);
            }
        } catch (error: any) {
            console.error('Failed to toggle favorite:', error);
            // 如果失败，恢复原状态
            setIsFavorited(!isFavorited);
            alert(error.message || t('operationFailed', '操作失败，请重试'));
        }
    };

    const handleShare = () => {
        if (!activity) return;

        if (navigator.share) {
            navigator.share({
                title: activity.title,
                text: activity.description,
                url: window.location.href,
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href);
            alert(t('linkCopied', '链接已复制到剪贴板'));
        }
    };

    const getTypeIcon = (type: string) => {
        return <TreePine className="w-6 h-6 text-[#56B949]" />;
    };

    const getTypeColor = (type: string) => {
        return 'from-[#56B949] to-[#4aa840]';
    };

    // 加载中状态
    if (loading) {
        return (
            <Layout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white/80 rounded-xl p-8 space-y-4">
                                    <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-32 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/80 rounded-xl p-6 space-y-4">
                                    <div className="h-6 bg-slate-200 rounded"></div>
                                    <div className="h-10 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // 活动不存在
    if (!activity) {
        return (
            <Layout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">{t('notFound', '活动不存在')}</h2>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#2a4086] transition-colors"
                    >
                        {t('backToList', '返回列表')}
                    </button>
                </div>
            </Layout>
        );
    }

    // 判断是否可以报名
    const canSignup = activity.signupPolicy !== 'CLOSED' && activity.status !== 'COMPLETED';

    return (
        <Layout>
            {/* Header */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm"
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">
                                {t('title', '活动详情')}
                            </h1>
                            <p className="text-slate-600">
                                {t('subtitle', '了解活动详细信息并报名参与')}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Activity Header */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    {getTypeIcon(activity.type || 'tree')}
                                    <div>
                                        <h2 className="text-2xl font-serif font-semibold text-[#30499B]">
                                            {activity.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleLike}
                                        className={`p-2 rounded-lg border transition-colors ${isLiked
                                            ? 'border-red-200 bg-red-50 text-red-500'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleFavorite}
                                        className={`p-2 rounded-lg border transition-colors ${isFavorited
                                            ? 'border-yellow-200 bg-yellow-50 text-yellow-600'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <BookmarkPlus className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-600 mb-6 leading-relaxed">
                                {activity.summary || activity.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-[#30499B]" />
                                    <div>
                                        <p className="text-xs text-slate-500">{t('activityTime', '活动时间')}</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {new Date(activity.startTime).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                                        </p>
                                    </div>
                                </div>

                                {activity.location && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-[#30499B]" />
                                        <div>
                                            <p className="text-xs text-slate-500">{t('location', '活动地点')}</p>
                                            <p className="text-sm font-medium text-slate-800">{activity.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 场次列表 */}
                            {sessions.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-[#30499B] mb-4">{t('sessions', '活动场次')}</h3>
                                    <div className="space-y-3">
                                        {sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="p-4 border border-slate-200 rounded-lg hover:border-[#56B949] transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-800">{session.sessionName}</p>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            {new Date(session.startTime).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                                                        </p>
                                                        {session.location && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                <MapPin className="w-3 h-3 inline mr-1" />
                                                                {session.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {session.maxParticipants && (
                                                        <div className="text-right">
                                                            <p className="text-sm text-slate-600">
                                                                {session.currentParticipants} / {session.maxParticipants}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{t('registered', '已报名')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 详细描述 */}
                            {activity.description && (
                                <div className="prose prose-slate max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: activity.description }} />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Registration Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg sticky top-8">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4">
                                    YL
                                </div>
                                <h4 className="font-semibold text-[#30499B] mb-2">{t('registerNow', '立即报名参与')}</h4>
                                <p className="text-sm text-slate-600">
                                    {t('currentParticipants', '已有 {count} 人报名', {
                                        count: activity.currentParticipants
                                    })}
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">{t('registered', '已报名')}</span>
                                    <span className="font-medium">{activity.currentParticipants} {locale === 'zh' ? '人' : 'people'}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleRegister}
                                className={`w-full py-3 rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r ${getTypeColor(activity.type)} text-white`}
                            >
                                {isLoggedIn ? t('registerButton', '立即报名') : t('loginToRegister', '登录后报名')}
                            </button>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {activity.likeCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BookmarkPlus className="w-4 h-4" />
                                        {activity.commentCount}
                                    </span>
                                </div>
                                {activity.readingTime && (
                                    <div className="flex items-center justify-center text-xs text-slate-500 mt-2">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {t('readingTime', '预计阅读时间')}: {activity.readingTime} {t('minutes', '分钟')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Sidebar */}
                        <ActivityStatsSidebar />
                    </motion.div>
                </div>
            </motion.div>
            {/* Auth Prompt Modal */}
            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </Layout>
    );
}