'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { MessageCircle, Clock, Heart, UserPlus, Reply, Check, ExternalLink, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import { userApi, notificationApi } from '@/lib/api';
import type { NotificationItem } from '@/lib/api/user';



export default function NotificationsPage() {
    const { isLoggedIn, loading } = useAuth();
    const params = useParams();
    const locale = (params?.locale as string) || 'zh';
    const { t } = useSafeTranslation('notifications');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false); // 改为 false
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [messagesPerPage] = useState(10);

    // 加载通知
    useEffect(() => {
        const loadNotifications = async () => {
            if (!isLoggedIn) return;

            try {
                const result = await userApi.getMyNotifications({
                    page: currentPage,
                    size: messagesPerPage
                });
                setNotifications(result.items);
                setTotalPages(Math.ceil(result.total / messagesPerPage));
            } catch (error: any) {
                // 完全静默处理所有错误，避免控制台噪音
                // 页面会显示空状态
            }
        };

        if (!loading && isLoggedIn) {
            loadNotifications();
        }
    }, [isLoggedIn, loading, currentPage, messagesPerPage]);



    // 显示加载状态（仅在认证阶段）
    if (loading) {
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

    if (!isLoggedIn) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg text-slate-600 mb-4">{t('loginRequired', '请先登录查看消息通知')}</div>
                        <Link href={`/${locale}/login`} className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors">
                            {t('goLogin', '去登录')}
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    // 过滤通知
    const filteredNotifications = activeFilter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (notificationIds?: string[]) => {
        try {
            if (!notificationIds || notificationIds.length === 0) {
                await notificationApi.markAllNotificationsRead();
            } else {
                await Promise.all(notificationIds.map((id) => notificationApi.markNotificationRead(id)));
            }

            // 重新加载通知
            const result = await userApi.getMyNotifications({
                page: currentPage,
                size: messagesPerPage
            });
            setNotifications(result.items);
        } catch (error: any) {
            // 完全静默处理错误
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (filter: 'all' | 'unread') => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const getNotificationTitle = (notification: NotificationItem) => {
        const actor = notification.actorNickname || 'User';
        switch (Number(notification.type)) {
            case 1:
                return t('types.comment', `${actor} 评论了你`, { actor });
            case 2:
                return t('types.reply', `${actor} 回复了你`, { actor });
            case 3:
                return t('types.like', `${actor} 点赞了你`, { actor });
            case 4:
                return t('types.system', '系统通知');
            default:
                return notification.title;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#30499B]/10 text-[#30499B] rounded-full text-sm font-semibold mb-4">
                            <MessageCircle className="w-4 h-4" />
                            {t('badge', '消息通知')}
                        </div>
                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">{t('title', '消息中心')}</h2>
                        <p className="text-slate-500">{t('description', '查看所有互动消息和通知')}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#EE4035] mb-1">{unreadCount}</div>
                            <div className="text-sm text-slate-500">{t('stats.unread', '未读消息')}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#30499B] mb-1">{notifications.length}</div>
                            <div className="text-sm text-slate-500">{t('stats.totalReplies', '总消息数')}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#56B949] mb-1">{notifications.filter(n => n.isRead).length}</div>
                            <div className="text-sm text-slate-500">{t('stats.totalRead', '已读消息')}</div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'all'
                                ? 'bg-[#30499B] text-white'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            {t('filters.all', '全部')}
                        </button>
                        <button
                            onClick={() => handleFilterChange('unread')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'unread'
                                ? 'bg-[#30499B] text-white'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                {t('filters.unread', '未读')}
                                {unreadCount > 0 && <span className="w-2 h-2 bg-[#EE4035] rounded-full"></span>}
                            </span>
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => handleMarkAsRead()}
                                className="px-4 py-2 rounded-lg font-medium text-[#56B949] hover:bg-[#56B949]/10 transition-colors"
                            >
                                {t('actions.markAsRead', '全部标记已读')}
                            </button>
                        )}
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all ${!notification.isRead ? 'border-l-4 border-l-[#EE4035]' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white flex-shrink-0">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-slate-800">{getNotificationTitle(notification)}</h3>
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-[#EE4035]/10 text-[#EE4035]">
                                                        {t('badges.unread', '未读')}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(notification.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3">{notification.content}</p>
                                        <div className="flex items-center gap-3">
                                            {notification.linkUrl && (
                                                <a
                                                    href={notification.linkUrl}
                                                    className="flex items-center gap-1 text-sm text-[#30499B] hover:text-[#56B949] transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    {t('actions.viewContent', '查看详情')}
                                                </a>
                                            )}
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead([notification.id])}
                                                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#30499B] transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    {t('actions.markAsRead', '标记已读')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredNotifications.length === 0 && (
                            <div className="text-center py-12">
                                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">{t('empty.message', '暂无{filter}消息', { filter: activeFilter === 'unread' ? t('empty.unread', '未读') : '' })}</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredNotifications.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>

            <style jsx>{`
        /* 卡片悬停效果 */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        /* 新消息指示器 */
        .new-message {
          position: relative;
        }
        .new-message::before {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #EE4035;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(238, 64, 53, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(238, 64, 53, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(238, 64, 53, 0); }
        }

        /* 回复动画 */
        @keyframes replySlide {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .reply-animation {
          animation: replySlide 0.3s ease-out;
        }
      `}</style>
        </Layout>
    );
}
