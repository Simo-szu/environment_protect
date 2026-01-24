'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Link from 'next/link';
import QuickActionCard from '@/components/ui/QuickActionCard';
import { userApi } from '@/lib/api';
import type { UserProfile } from '@/lib/api/user';
import {
    User,
    Edit,
    Heart,
    Bookmark,
    Calendar,
    Trophy,
    LogOut,
    ArrowRight,
    TreePine,
    Recycle,
    Droplets,
    MessageCircle,
    MapPin,
    FileText
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter, hoverLift } from '@/lib/animations';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

export default function ProfilePage() {
    const { user, isLoggedIn, loading, logout } = useAuth();
    const { t } = useSafeTranslation('profile');
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // 加载用户资料
    useEffect(() => {
        const loadProfile = async () => {
            if (!isLoggedIn) return;
            
            try {
                setLoadingProfile(true);
                const profileData = await userApi.getMyProfile();
                setProfile(profileData);
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoadingProfile(false);
            }
        };

        if (!loading && isLoggedIn) {
            loadProfile();
        }
    }, [isLoggedIn, loading]);

    // ✅ 只在 loading 完成后再重定向
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace(`/${locale}/login`);
        }
    }, [loading, isLoggedIn, router, locale]);

    const handleLogout = () => {
        logout();
        router.push(`/${locale}`);
    };

    // ✅ loading 阶段只显示 loading
    if (loading || loadingProfile) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">
                            {t('loading', '加载中...')}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    // ✅ 未登录：什么都不渲染（避免闪屏）
    if (!isLoggedIn || !user) {
        return null;
    }

    // ✅ 登录成功后，完整页面才出现
    return (
        <Layout>
            {/* Header */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#56B949]/10 text-[#56B949] text-xs font-semibold mb-4 border border-[#56B949]/20">
                            <User className="w-3 h-3" />
                            {t('badge', '个人资料')}
                        </div>
                        <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">{t('title', '个人资料')}</h1>
                        <p className="text-slate-600">{t('description', '管理你的个人信息和偏好设置')}</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* User Info Card */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg mb-8"
                >
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-3xl shadow-2xl overflow-hidden">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.nickname} className="w-full h-full object-cover" />
                                ) : (
                                    profile?.nickname?.charAt(0).toUpperCase() || user?.nickname?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-[#30499B] mb-2">
                                        {profile?.nickname || user?.nickname || '用户'}
                                    </h2>
                                    <div className="flex items-center gap-4 text-slate-600">
                                        {profile?.gender && (
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span>
                                                    {profile.gender === 'MALE' ? '男' : profile.gender === 'FEMALE' ? '女' : '其他'}
                                                </span>
                                            </div>
                                        )}
                                        {profile?.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <Link
                                    href={`/${locale}/profile/edit`}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-4 md:mt-0"
                                >
                                    <Edit className="w-4 h-4" />
                                    {t('actions.editProfile', '编辑资料')}
                                </Link>
                            </div>

                            {/* User Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 性别 */}
                                {profile?.gender && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">性别</p>
                                            <p className="font-medium text-slate-800">
                                                {profile.gender === 'MALE' ? '男' : profile.gender === 'FEMALE' ? '女' : '其他'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* 位置 */}
                                {profile?.location && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">位置</p>
                                            <p className="font-medium text-slate-800">{profile.location}</p>
                                        </div>
                                    </div>
                                )}

                                {/* 积分 */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">环保积分</p>
                                        <p className="font-medium text-slate-800">0 分</p>
                                    </div>
                                </div>

                                {/* 等级 */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <TreePine className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">{t('info.level', '环保等级')}</p>
                                        <p className="font-medium text-slate-800">
                                            Lv.1 环保达人
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 个人简介 */}
                            {profile?.bio && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-[#56B949]/5 to-[#F0A32F]/5 rounded-lg border border-[#56B949]/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-[#56B949]" />
                                        <span className="text-sm font-medium text-[#30499B]">个人简介</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <QuickActionCard href={`/${locale}/likes`} icon={Heart} title={t('quickActions.likes', '我的点赞')} />
                    <QuickActionCard href={`/${locale}/favorites`} icon={Bookmark} title={t('quickActions.favorites', '我的收藏')} />
                    <QuickActionCard href={`/${locale}/my-activities`} icon={Calendar} title={t('quickActions.activities', '我的活动')} />
                    <QuickActionCard href={`/${locale}/points`} icon={Trophy} title={t('quickActions.points', '我的积分')} />
                </motion.div>

                {/* Recent Activities */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg mb-8"
                >
                    <h3 className="text-lg font-semibold text-[#30499B] mb-6">{t('recentActivities.title', '最近动态')}</h3>

                    <div className="space-y-4">
                        {/* Activity Item 1 */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center flex-shrink-0">
                                <TreePine className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-800 text-sm mb-1">{t('recentActivities.lowCarbonChallenge', '完成了一次「低碳出行」挑战')}</h4>
                                <p className="text-xs text-slate-500">2024-05-11 14:30</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Activity Item 2 */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center flex-shrink-0">
                                <TreePine className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-800 text-sm mb-1">{t('recentActivities.lowCarbonChallenge', '完成了一次「低碳出行」挑战')}</h4>
                                <p className="text-xs text-slate-500">2024-05-12 14:30</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Recent Likes */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-[#30499B] flex items-center gap-2">
                            <Heart className="w-5 h-5 text-[#EE4035]" />
                            {t('recentLikes.title', '最近点赞')}
                        </h3>
                        <Link
                            href={`/${locale}/likes`}
                            className="flex items-center gap-1 text-sm text-[#EE4035] hover:text-[#d63384] transition-colors"
                        >
                            {t('recentLikes.viewAll', '查看全部')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Recent Liked Article */}
                        <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <Droplets className="w-4 h-4 text-[#56B949]" />
                                <span className="text-xs text-slate-500">{t('recentLikes.articleType', '科普文章')}</span>
                            </div>
                            <h4 className="font-medium text-slate-800 text-sm mb-1">{t('recentLikes.articleTitle', '环保小贴士分享')}</h4>
                            <p className="text-xs text-slate-500 mb-2">{t('recentLikes.articleDesc', '分享一些日常生活中的环保小技巧...')}</p>
                            <div className="flex items-center gap-1 text-[#EE4035]">
                                <Heart className="w-3 h-3 fill-current" />
                                <span className="text-xs">{t('recentLikes.likedDaysAgo', '2天前点赞')}</span>
                            </div>
                        </div>

                        {/* Recent Liked Activity */}
                        <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <TreePine className="w-4 h-4 text-[#56B949]" />
                                <span className="text-xs text-slate-500">{t('recentLikes.activityType', '环保活动')}</span>
                            </div>
                            <h4 className="font-medium text-slate-800 text-sm mb-1">{t('recentLikes.activityTitle', '城市绿洲种植计划')}</h4>
                            <p className="text-xs text-slate-500 mb-2">{t('recentLikes.activityDesc', '加入我们在市中心创建绿色角落...')}</p>
                            <div className="flex items-center gap-1 text-[#EE4035]">
                                <Heart className="w-3 h-3 fill-current" />
                                <span className="text-xs">{t('recentLikes.liked5DaysAgo', '5天前点赞')}</span>
                            </div>
                        </div>

                        {/* Recent Liked Comment */}
                        <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="w-4 h-4 text-[#F0A32F]" />
                                <span className="text-xs text-slate-500">{t('recentLikes.commentType', '评论互动')}</span>
                            </div>
                            <h4 className="font-medium text-slate-800 text-sm mb-1">{t('recentLikes.commentTitle', '张小明的评论')}</h4>
                            <p className="text-xs text-slate-500 mb-2">{t('recentLikes.commentDesc', '非常赞同你的观点！环保确实需要...')}</p>
                            <div className="flex items-center gap-1 text-[#EE4035]">
                                <Heart className="w-3 h-3 fill-current" />
                                <span className="text-xs">{t('recentLikes.liked1WeekAgo', '1周前点赞')}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Favorites */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-[#30499B] flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-[#56B949]" />
                            {t('recentFavorites.title', '最近收藏')}
                        </h3>
                        <Link
                            href={`/${locale}/favorites`}
                            className="flex items-center gap-1 text-sm text-[#56B949] hover:text-[#4aa840] transition-colors"
                        >
                            {t('recentFavorites.viewAll', '查看全部')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recent Favorited Article */}
                        <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <Droplets className="w-4 h-4 text-[#56B949]" />
                                <span className="text-xs text-slate-500">{t('recentFavorites.articleType', '科普文章')}</span>
                            </div>
                            <h4 className="font-medium text-slate-800 text-sm mb-1">{t('recentFavorites.articleTitle', '节约用水小妙招')}</h4>
                            <p className="text-xs text-slate-500 mb-2">{t('recentFavorites.articleDesc', '洗菜水可以浇花，洗衣水可以拖地，一水多用...')}</p>
                            <div className="flex items-center gap-1 text-[#56B949]">
                                <Bookmark className="w-3 h-3 fill-current" />
                                <span className="text-xs">{t('recentFavorites.favorited3DaysAgo', '3天前收藏')}</span>
                            </div>
                        </div>

                        {/* Recent Favorited Activity */}
                        <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <Recycle className="w-4 h-4 text-[#F0A32F]" />
                                <span className="text-xs text-slate-500">{t('recentFavorites.activityType', '环保活动')}</span>
                            </div>
                            <h4 className="font-medium text-slate-800 text-sm mb-1">{t('recentFavorites.activityTitle', '旧物新生DIY工作坊')}</h4>
                            <p className="text-xs text-slate-500 mb-2">{t('recentFavorites.activityDesc', '学习如何将废弃物品变废为宝...')}</p>
                            <div className="flex items-center gap-1 text-[#56B949]">
                                <Bookmark className="w-3 h-3 fill-current" />
                                <span className="text-xs">{t('recentFavorites.favorited1WeekAgo', '1周前收藏')}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Logout */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg"
                >
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('actions.logout', '退出登录')}
                    </button>
                </motion.div>
            </motion.div>
        </Layout>
    );
}