'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import { userApi } from '@/lib/api';
import type { ReactionItem } from '@/lib/api/user';
import {
    Bookmark,
    Calendar,
    TreePine,
    Droplets
} from 'lucide-react';

export default function FavoritesPage() {
    const { user, isLoggedIn, loading } = useAuth();
    const { t } = useSafeTranslation('favorites');
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('articles');
    const [favorites, setFavorites] = useState<ReactionItem[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false); // 改为 false
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 6;

    // 加载收藏
    useEffect(() => {
        const loadFavorites = async () => {
            if (!isLoggedIn) return;

            try {
                const targetType = activeTab === 'articles' ? 'CONTENT' : 'ACTIVITY';
                const result = await userApi.getMyReactions('FAVORITE', targetType, currentPage, itemsPerPage);
                setFavorites(result.items);
                setTotalPages(Math.ceil(result.total / itemsPerPage));
            } catch (error) {
                // 完全静默处理错误
            }
        };

        if (!loading && isLoggedIn) {
            loadFavorites();
        }
    }, [isLoggedIn, loading, activeTab, currentPage, itemsPerPage]);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace('/login');
        }
    }, [loading, isLoggedIn, router]);

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

    const articlesCount = favorites.filter(f => f.targetType === 1).length;
    const activitiesCount = favorites.filter(f => f.targetType === 2).length;

    return (
        <Layout>
            {/* Header */}
            <div className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#56B949]/10 text-[#56B949] text-xs font-semibold mb-4 border border-[#56B949]/20">
                            <Bookmark className="w-3 h-3" />
                            {t('badge', '我的收藏')}
                        </div>
                        <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">{t('title', '我的收藏')}</h1>
                        <p className="text-slate-600">{t('description', '这里保存了你收藏的所有内容')}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
                    <button
                        onClick={() => handleTabChange('articles')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'articles'
                            ? 'bg-[#56B949] text-white'
                            : 'text-slate-600 hover:text-[#56B949]'
                            }`}
                    >
                        <Bookmark className="w-4 h-4" />
                        {t('tabs.articles', '科普文章')} ({articlesCount})
                    </button>
                    <button
                        onClick={() => handleTabChange('activities')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'activities'
                            ? 'bg-[#56B949] text-white'
                            : 'text-slate-600 hover:text-[#56B949]'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        {t('tabs.activities', '环保活动')} ({activitiesCount})
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'articles' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.filter(f => f.targetType === 1).map((item) => (
                                    <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="aspect-video bg-gradient-to-br from-[#56B949]/10 to-[#30499B]/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                            {item.contentCoverUrl ? (
                                                <img src={item.contentCoverUrl} alt={item.contentTitle} className="w-full h-full object-cover" />
                                            ) : (
                                                <Droplets className="w-12 h-12 text-[#56B949]" />
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-800 mb-2">{item.contentTitle || '科普文章'}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[#56B949]">
                                                <Bookmark className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium">{t('content.favorited', '已收藏')}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {favorites.filter(f => f.targetType === 1).length === 0 && (
                                <div className="text-center py-12">
                                    <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">{t('empty.articles', '暂无收藏的文章')}</p>
                                </div>
                            )}

                            {favorites.filter(f => f.targetType === 1).length > 0 && (
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
                                {favorites.filter(f => f.targetType === 2).map((item) => (
                                    <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {item.activityPosterUrl ? (
                                                    <img src={item.activityPosterUrl} alt={item.activityTitle} className="w-full h-full object-cover" />
                                                ) : (
                                                    <TreePine className="w-8 h-8 text-[#56B949]" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                                                </div>
                                                <h3 className="font-semibold text-slate-800 mb-2">{item.activityTitle || '环保活动'}</h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-[#56B949]">
                                                        <Bookmark className="w-4 h-4 fill-current" />
                                                        <span className="text-sm font-medium">{t('content.favorited', '已收藏')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {favorites.filter(f => f.targetType === 2).length === 0 && (
                                <div className="text-center py-12">
                                    <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">{t('empty.activities', '暂无收藏的活动')}</p>
                                </div>
                            )}

                            {favorites.filter(f => f.targetType === 2).length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div >
        </Layout >
    );
}