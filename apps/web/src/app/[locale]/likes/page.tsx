'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import { userApi } from '@/lib/api';
import type { ReactionItem } from '@/lib/api/user';
import {
    Heart,
    ThumbsUp,
    MapPin,
    Eye,
    ArrowRight,
    TreePine,
    Recycle,
    Droplets,
    MessageCircle
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter, hoverLift } from '@/lib/animations';

export default function LikesPage() {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('articles');
    const [likes, setLikes] = useState<ReactionItem[]>([]);
    const [loadingLikes, setLoadingLikes] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 6;

    // 加载点赞
    useEffect(() => {
        const loadLikes = async () => {
            if (!isLoggedIn) return;

            try {
                setLoadingLikes(true);
                const targetType = activeTab === 'articles' ? 'CONTENT' : activeTab === 'activities' ? 'ACTIVITY' : 'COMMENT';
                const result = await userApi.getMyReactions({
                    reactionType: 'LIKE',
                    targetType: targetType as 'CONTENT' | 'ACTIVITY',
                    page: currentPage,
                    size: itemsPerPage
                });
                setLikes(result.items);
                setTotalPages(Math.ceil(result.total / itemsPerPage));
            } catch (error) {
                console.error('Failed to load likes:', error);
            } finally {
                setLoadingLikes(false);
            }
        };

        if (!loading && isLoggedIn) {
            loadLikes();
        }
    }, [isLoggedIn, loading, activeTab, currentPage, itemsPerPage]);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace('/login');
        }
    }, [loading, isLoggedIn, router]);

    if (loading || loadingLikes) {
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

    if (!isLoggedIn || !user) {
        return null;
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const articlesCount = likes.filter(l => l.targetType === 'CONTENT').length;
    const activitiesCount = likes.filter(l => l.targetType === 'ACTIVITY').length;
    const commentsCount = 0; // 评论点赞暂不支持

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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE4035]/10 text-[#EE4035] text-xs font-semibold mb-4 border border-[#EE4035]/20">
                            <Heart className="w-3 h-3" />
                            我的点赞
                        </div>
                        <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">我的点赞</h1>
                        <p className="text-slate-600">这里记录了你点赞过的所有内容</p>
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
                {/* Tabs */}
                <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
                    <button
                        onClick={() => handleTabChange('articles')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'articles'
                            ? 'bg-[#EE4035] text-white'
                            : 'text-slate-600 hover:text-[#EE4035]'
                            }`}
                    >
                        <Heart className="w-4 h-4" />
                        科普文章 ({articlesCount})
                    </button>
                    <button
                        onClick={() => handleTabChange('activities')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'activities'
                            ? 'bg-[#EE4035] text-white'
                            : 'text-slate-600 hover:text-[#EE4035]'
                            }`}
                    >
                        <ThumbsUp className="w-4 h-4" />
                        环保活动 ({activitiesCount})
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'articles' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {likes.filter(l => l.targetType === 'CONTENT').map((item) => (
                                    <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="aspect-video bg-gradient-to-br from-[#56B949]/10 to-[#30499B]/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                            {item.targetCoverUrl ? (
                                                <img src={item.targetCoverUrl} alt={item.targetTitle} className="w-full h-full object-cover" />
                                            ) : (
                                                <Droplets className="w-12 h-12 text-[#56B949]" />
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-800 mb-2">{item.targetTitle || '科普文章'}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[#EE4035]">
                                                <Heart className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium">已点赞</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {likes.filter(l => l.targetType === 'CONTENT').length === 0 && (
                                <div className="text-center py-12">
                                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">暂无点赞的文章</p>
                                </div>
                            )}

                            {likes.filter(l => l.targetType === 'CONTENT').length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div>
                            <div className="space-y-4">
                                {likes.filter(l => l.targetType === 'ACTIVITY').map((item) => (
                                    <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {item.targetCoverUrl ? (
                                                    <img src={item.targetCoverUrl} alt={item.targetTitle} className="w-full h-full object-cover" />
                                                ) : (
                                                    <TreePine className="w-8 h-8 text-[#56B949]" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                                                </div>
                                                <h3 className="font-semibold text-slate-800 mb-2">{item.targetTitle || '环保活动'}</h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-[#EE4035]">
                                                        <ThumbsUp className="w-4 h-4 fill-current" />
                                                        <span className="text-sm font-medium">已点赞</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {likes.filter(l => l.targetType === 'ACTIVITY').length === 0 && (
                                <div className="text-center py-12">
                                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">暂无点赞的活动</p>
                                </div>
                            )}

                            {likes.filter(l => l.targetType === 'ACTIVITY').length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </Layout>
    );
}