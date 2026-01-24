'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Clock, Heart, UserPlus, Reply, Check, ExternalLink, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';

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
const generateMockMessages = (): Message[] => {
    const baseMessages = [
        {
            id: '1',
            type: 'replies' as const,
            isRead: false,
            user: { name: '李环保达人', avatar: '李' },
            content: '非常赞同你的观点！环保确实需要从每个人做起，我也会在日常生活中更加注意节能减排。你提到的那些小贴士很实用，已经开始实践了。',
            originalContent: '我们每个人都应该为环保贡献自己的力量，从日常的小事做起，比如节约用水、垃圾分类、绿色出行等...',
            timestamp: '2小时前'
        },
        {
            id: '2',
            type: 'likes' as const,
            isRead: false,
            user: { name: '王小绿', avatar: '王' },
            content: '你分享的垃圾分类方法很实用，已经收藏了！希望能看到更多这样的环保小贴士。',
            originalContent: '垃圾分类小知识 - 让环保从细节做起',
            timestamp: '4小时前'
        },
        {
            id: '3',
            type: 'follows' as const,
            isRead: false,
            user: { name: '张环保志愿者', avatar: '张' },
            content: '看到你在环保方面的分享很有价值，希望能互相学习交流！',
            timestamp: '1天前'
        },
        {
            id: '4',
            type: 'replies' as const,
            isRead: true,
            user: { name: '陈小环', avatar: '陈' },
            content: '感谢分享这么详细的节能小贴士！我已经开始在家里实践了，效果很不错。',
            originalContent: '家庭节能其实很简单，比如使用LED灯泡、及时关闭电器、合理设置空调温度等...',
            timestamp: '2天前',
            isLiked: true
        },
        {
            id: '5',
            type: 'likes' as const,
            isRead: true,
            user: { name: '刘绿色生活', avatar: '刘' },
            content: '很棒的环保活动分享！希望有机会也能参与这样的活动。',
            originalContent: '参与社区植树活动的感想',
            timestamp: '3天前'
        }
    ];

    // 生成更多模拟数据
    const additionalMessages: Message[] = [];
    const names = ['赵环保', '钱绿色', '孙节能', '李减排', '周循环', '吴低碳', '郑清洁', '王可持续', '冯生态', '陈绿化'];
    const types: ('replies' | 'likes' | 'follows')[] = ['replies', 'likes', 'follows'];
    const contents = [
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
            originalContent: type !== 'follows' ? '环保相关的原始内容...' : undefined,
            timestamp: `${Math.floor(Math.random() * 7) + 1}天前`,
            isLiked: Math.random() > 0.5,
            isFollowedBack: type === 'follows' ? Math.random() > 0.5 : undefined
        });
    }

    return [...baseMessages, ...additionalMessages];
};

export default function NotificationsPage() {
    const { isLoggedIn, loading } = useAuth();
    const [allMessages] = useState<Message[]>(generateMockMessages());
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'replies' | 'likes'>('all');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [messagesPerPage] = useState(6); // 每页显示6条消息

    // 如果未登录，重定向到登录页
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            window.location.href = '/zh/login';
        }
    }, [isLoggedIn, loading]);

    // 显示加载状态
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-slate-600 mb-4">加载中...</div>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-slate-600 mb-4">请先登录查看消息通知</div>
                    <Link href="/zh/login" className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors">
                        去登录
                    </Link>
                </div>
            </div>
        );
    }

    // 过滤消息
    const filteredMessages = allMessages.filter(message => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !message.isRead;
        return message.type === activeFilter;
    });

    // 分页逻辑
    const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    const currentMessages = filteredMessages.slice(startIndex, endIndex);

    // 重置页码当过滤器改变时
    const handleFilterChange = (filter: 'all' | 'unread' | 'replies' | 'likes') => {
        setActiveFilter(filter);
        setCurrentPage(1); // 重置到第一页
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const unreadCount = allMessages.filter(m => !m.isRead).length;
    const todayReplies = 12;
    const totalLikes = 45;
    const totalReplies = 28;

    const handleMarkAsRead = () => {
        alert('标记为已读功能需要后端支持');
    };

    const handleReply = (messageId: string) => {
        if (replyingTo === messageId) {
            setReplyingTo(null);
            setReplyContent('');
        } else {
            setReplyingTo(messageId);
            setReplyContent('');
        }
    };

    const handleSendReply = () => {
        if (!replyContent.trim()) {
            alert('请输入回复内容');
            return;
        }

        alert('回复发送成功！');
        setReplyingTo(null);
        setReplyContent('');
    };

    const handleLikeMessage = () => {
        alert('点赞功能需要后端支持');
    };

    const handleFollowBack = () => {
        alert('关注功能需要后端支持');
    };

    const getMessageIcon = (type: string) => {
        switch (type) {
            case 'replies': return <MessageCircle className="w-4 h-4 text-[#30499B]" />;
            case 'likes': return <Heart className="w-4 h-4 text-[#F0A32F]" />;
            case 'follows': return <UserPlus className="w-4 h-4 text-[#56B949]" />;
            default: return <MessageCircle className="w-4 h-4 text-[#30499B]" />;
        }
    };

    const getMessageTypeText = (type: string) => {
        switch (type) {
            case 'replies': return '回复了你的内容';
            case 'likes': return '点赞了你的内容';
            case 'follows': return '关注了你';
            default: return '互动了你的内容';
        }
    };

    const getBadgeColor = (type: string, isRead: boolean) => {
        if (isRead) return 'bg-slate-100 text-slate-500';

        switch (type) {
            case 'replies': return 'bg-[#EE4035]/10 text-[#EE4035]';
            case 'likes': return 'bg-[#F0A32F]/10 text-[#F0A32F]';
            case 'follows': return 'bg-[#56B949]/10 text-[#56B949]';
            default: return 'bg-[#30499B]/10 text-[#30499B]';
        }
    };

    const getBadgeText = (type: string, isRead: boolean) => {
        if (isRead) return '已读';

        switch (type) {
            case 'replies': return '新回复';
            case 'likes': return '新点赞';
            case 'follows': return '新关注';
            default: return '新消息';
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
                            消息通知
                        </div>
                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">消息中心</h2>
                        <p className="text-slate-500">查看所有互动消息和通知</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#EE4035] mb-1">{unreadCount}</div>
                            <div className="text-sm text-slate-500">未读消息</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#F0A32F] mb-1">{todayReplies}</div>
                            <div className="text-sm text-slate-500">今日回复</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#56B949] mb-1">{totalLikes}</div>
                            <div className="text-sm text-slate-500">总点赞数</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 text-center">
                            <div className="text-2xl font-bold text-[#30499B] mb-1">{totalReplies}</div>
                            <div className="text-sm text-slate-500">总回复数</div>
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
                            全部
                        </button>
                        <button
                            onClick={() => handleFilterChange('unread')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'unread'
                                ? 'bg-[#30499B] text-white'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                未读
                                {unreadCount > 0 && <span className="w-2 h-2 bg-[#EE4035] rounded-full"></span>}
                            </span>
                        </button>
                        <button
                            onClick={() => handleFilterChange('replies')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'replies'
                                ? 'bg-[#30499B] text-white'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            回复
                        </button>
                        <button
                            onClick={() => handleFilterChange('likes')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'likes'
                                ? 'bg-[#30499B] text-white'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            点赞
                        </button>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4">
                        {currentMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`card-hover bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg ${!message.isRead ? 'new-message' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#EE4035] flex items-center justify-center text-white font-semibold shadow-lg">
                                        {message.user.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-800">{message.user.name}</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(message.type, message.isRead)}`}>
                                                    {getBadgeText(message.type, message.isRead)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{message.timestamp}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            {getMessageIcon(message.type)}
                                            <span className="text-sm text-slate-500">{getMessageTypeText(message.type)}</span>
                                        </div>
                                        <p className="text-slate-700 mb-3 leading-relaxed">{message.content}</p>

                                        {message.originalContent && (
                                            <div className="bg-slate-50 rounded-lg p-3 mb-4 border-l-4 border-[#56B949]">
                                                <div className="text-xs text-slate-500 mb-1">你的原{message.type === 'replies' ? '评论' : '分享'}：</div>
                                                <p className="text-sm text-slate-600">{message.originalContent}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {message.type === 'replies' && (
                                                <button
                                                    onClick={() => handleReply(message.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors text-sm"
                                                >
                                                    <Reply className="w-4 h-4" />
                                                    回复
                                                </button>
                                            )}

                                            {message.type === 'likes' && (
                                                <button
                                                    onClick={() => alert('跳转到原内容页面...')}
                                                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:text-[#30499B] hover:border-[#30499B] transition-colors text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    查看内容
                                                </button>
                                            )}

                                            {message.type === 'follows' && !message.isFollowedBack && (
                                                <>
                                                    <button
                                                        onClick={() => handleFollowBack()}
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#56B949] text-white rounded-lg hover:bg-[#4aa840] transition-colors text-sm"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                        回关
                                                    </button>
                                                    <button
                                                        onClick={() => alert('跳转到用户资料页面...')}
                                                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:text-[#30499B] hover:border-[#30499B] transition-colors text-sm"
                                                    >
                                                        <User className="w-4 h-4" />
                                                        查看资料
                                                    </button>
                                                </>
                                            )}

                                            {message.type === 'follows' && message.isFollowedBack && (
                                                <button
                                                    disabled
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm cursor-not-allowed"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    已关注
                                                </button>
                                            )}

                                            {(message.type === 'replies' || message.type === 'likes') && (
                                                <button
                                                    onClick={() => handleLikeMessage()}
                                                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${message.isLiked
                                                        ? 'text-[#F0A32F] border-[#F0A32F] bg-[#F0A32F]/5'
                                                        : 'border-slate-200 text-slate-600 hover:text-[#F0A32F] hover:border-[#F0A32F]'
                                                        }`}
                                                >
                                                    <Heart className={`w-4 h-4 ${message.isLiked ? 'fill-current' : ''}`} />
                                                    {message.isLiked ? '已点赞' : '点赞'}
                                                </button>
                                            )}

                                            {!message.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead()}
                                                    className="text-slate-400 hover:text-[#30499B] transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Reply Area */}
                                        {replyingTo === message.id && (
                                            <div className="reply-area mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 reply-animation">
                                                <textarea
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="输入你的回复..."
                                                    className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B] outline-none"
                                                    rows={3}
                                                />
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <span>💭</span>
                                                        <span>支持 Markdown 格式</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleReply(message.id)}
                                                            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                                                        >
                                                            取消
                                                        </button>
                                                        <button
                                                            onClick={() => handleSendReply()}
                                                            className="px-4 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors text-sm"
                                                        >
                                                            发送回复
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
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