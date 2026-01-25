'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { MessageCircle, Clock, Heart, UserPlus, Reply, Check, ExternalLink, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import { userApi } from '@/lib/api';
import type { NotificationItem } from '@/lib/api/user';

interface Message {
    id: string;
    type: 'replies' | 'likes' | 'follows';
    isRead: boolean;
    user: {
        name: string;
        avatar: string;
    };
    content: string;
    originalContent?: string;
    timestamp: string;
    isLiked?: boolean;
    isFollowedBack?: boolean;
}

// 扩展模拟数据到更多消息
const generateMockMessages = (t: any, locale: string): Message[] => {
    const baseMessages = [
        {
            id: '1',
            type: 'replies' as const,
            isRead: false,
            user: { name: t('mockData.users.user1', '李环保达人'), avatar: t('mockData.users.user1', '李环保达人').charAt(0) },
            content: t('mockData.contents.content1', '非常赞同你的观点！环保确实需要从每个人做起，我也会在日常生活中更加注意节能减排。你提到的那些小贴士很实用，已经开始实践了。'),
            originalContent: t('mockData.originalContents.original1', '我们每个人都应该为环保贡献自己的力量，从日常的小事做起，比如节约用水、垃圾分类、绿色出行等...'),
            timestamp: `2${t('mockData.timestamps.hoursAgo', '小时前')}`
        },
        {
            id: '2',
            type: 'likes' as const,
            isRead: false,
            user: { name: t('mockData.users.user2', '王小绿'), avatar: t('mockData.users.user2', '王小绿').charAt(0) },
            content: t('mockData.contents.content2', '你分享的垃圾分类方法很实用，已经收藏了！希望能看到更多这样的环保小贴士。'),
            originalContent: t('mockData.originalContents.original2', '垃圾分类小知识 - 让环保从细节做起'),
            timestamp: `4${t('mockData.timestamps.hoursAgo', '小时前')}`
        },
        {
            id: '3',
            type: 'follows' as const,
            isRead: false,
            user: { name: t('mockData.users.user3', '张环保志愿者'), avatar: t('mockData.users.user3', '张环保志愿者').charAt(0) },
            content: t('mockData.contents.content3', '看到你在环保方面的分享很有价值，希望能互相学习交流！'),
            timestamp: `1${t('mockData.timestamps.daysAgo', '天前')}`
        },
        {
            id: '4',
            type: 'replies' as const,
            isRead: true,
            user: { name: t('mockData.users.user4', '陈小环'), avatar: t('mockData.users.user4', '陈小环').charAt(0) },
            content: t('mockData.contents.content4', '感谢分享这么详细的节能小贴士！我已经开始在家里实践了，效果很不错。'),
            originalContent: t('mockData.originalContents.original3', '家庭节能其实很简单，比如使用LED灯泡、及时关闭电器、合理设置空调温度等...'),
            timestamp: `2${t('mockData.timestamps.daysAgo', '天前')}`,
            isLiked: true
        },
        {
            id: '5',
            type: 'likes' as const,
            isRead: true,
            user: { name: t('mockData.users.user5', '刘绿色生活'), avatar: t('mockData.users.user5', '刘绿色生活').charAt(0) },
            content: t('mockData.contents.content5', '很棒的环保活动分享！希望有机会也能参与这样的活动。'),
            originalContent: t('mockData.originalContents.original4', '参与社区植树活动的感想'),
            timestamp: `3${t('mockData.timestamps.daysAgo', '天前')}`
        }
    ];

    // 生成更多模拟数据
    const additionalMessages: Message[] = [];
    // 根据语言环境使用不同的数组
    const names = locale === 'en' ?
        ['Zhao Eco', 'Qian Green', 'Sun Energy', 'Li Reduce', 'Zhou Cycle', 'Wu LowCarbon', 'Zheng Clean', 'Wang Sustain', 'Feng Eco', 'Chen Green'] :
        ['赵环保', '钱绿色', '孙节能', '李减排', '周循环', '吴低碳', '郑清洁', '王可持续', '冯生态', '陈绿化'];

    const types: ('replies' | 'likes' | 'follows')[] = ['replies', 'likes', 'follows'];

    const contents = locale === 'en' ? [
        'Your environmental philosophy is great, learned a lot!',
        'I\'ve tried this method, it\'s really effective.',
        'Thank you for sharing, very inspiring to me.',
        'Hope to participate in more environmental activities with you.',
        'Your sharing gave me a new understanding of environmental protection.',
        'These tips are so practical, I\'ve started practicing them.',
        'I totally agree with your point, environmental protection needs everyone\'s effort.',
        'Your experience sharing is very valuable, thank you!'
    ] : [
        '你的环保理念很棒，学到了很多！',
        '这个方法我试过，确实很有效果。',
        '感谢分享，对我很有启发。',
        '希望能和你一起参与更多环保活动。',
        '你的分享让我对环保有了新的认识。',
        '这些小贴士太实用了，已经开始实践。',
        '非常认同你的观点，环保需要大家一起努力。',
        '你的经验分享很有价值，谢谢！'
    ];

    for (let i = 6; i <= 42; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const content = contents[Math.floor(Math.random() * contents.length)];

        additionalMessages.push({
            id: i.toString(),
            type,
            isRead: Math.random() > 0.3, // 70% 已读
            user: { name, avatar: name.charAt(0) },
            content,
            originalContent: type !== 'follows' ? t('mockData.originalContents.original5', '环保相关的原始内容...') : undefined,
            timestamp: `${Math.floor(Math.random() * 7) + 1}${t('mockData.timestamps.daysAgo', '天前')}`,
            isLiked: Math.random() > 0.5,
            isFollowedBack: type === 'follows' ? Math.random() > 0.5 : undefined
        });
    }

    return [...baseMessages, ...additionalMessages];
};

export default function NotificationsPage() {
    const { isLoggedIn, loading } = useAuth();
    const params = useParams();
    const locale = (params?.locale as string) || 'zh';
    const { t } = useSafeTranslation('notifications');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [messagesPerPage] = useState(10);

    // 加载通知
    useEffect(() => {
        const loadNotifications = async () => {
            if (!isLoggedIn) return;

            try {
                setLoadingNotifications(true);
                const result = await userApi.getMyNotifications({
                    page: currentPage,
                    size: messagesPerPage
                });
                setNotifications(result.items);
                setTotalPages(Math.ceil(result.total / messagesPerPage));
            } catch (error) {
                console.error('Failed to load notifications:', error);
            } finally {
                setLoadingNotifications(false);
            }
        };

        if (!loading && isLoggedIn) {
            loadNotifications();
        }
    }, [isLoggedIn, loading, currentPage, messagesPerPage]);

    // 如果未登录，重定向到登录页
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            window.location.href = `/${locale}/login`;
        }
    }, [isLoggedIn, loading, locale]);

    // 显示加载状态
    if (loading || loadingNotifications) {
        return (
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
        );
    }

    if (!isLoggedIn) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg text-slate-600 mb-4">请先登录查看消息通知</div>
                        <Link href="/zh/login" className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors">
                            去登录
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
            await userApi.markNotificationsRead({
                notificationIds,
                markAllAsRead: !notificationIds
            });
            
            // 重新加载通知
            const result = await userApi.getMyNotifications({
                page: currentPage,
                size: messagesPerPage
            });
            setNotifications(result.items);
        } catch (error: any) {
            console.error('Failed to mark as read:', error);
            alert(error.message || '操作失败');
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
                            <div className="text-sm text-slate-500">总消息数</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#56B949] mb-1">{notifications.filter(n => n.isRead).length}</div>
                            <div className="text-sm text-slate-500">已读消息</div>
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
                                全部标记已读
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
                                            <h3 className="font-semibold text-slate-800">{notification.title}</h3>
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-[#EE4035]/10 text-[#EE4035]">
                                                        未读
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(notification.createdAt).toLocaleString('zh-CN')}
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
                                                    查看详情
                                                </a>
                                            )}
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead([notification.id])}
                                                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#30499B] transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    标记已读
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
                                <p className="text-slate-500">暂无{activeFilter === 'unread' ? '未读' : ''}消息</p>
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