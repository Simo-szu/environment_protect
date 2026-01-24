'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import {
    Bookmark,
    Heart,
    Calendar,
    MapPin,
    Eye,
    TreePine,
    Recycle,
    Droplets
} from 'lucide-react';

export default function FavoritesPage() {
    const { user, isLoggedIn, loading } = useAuth();
    const { t } = useSafeTranslation('favorites');
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('articles');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // 每页显示6个项目

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

    // 模拟数据 - 实际项目中这些数据会从API获取
    const mockArticles = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `${t('content.articles.title', '环保文章')} ${i + 1}`,
        description: t('content.articles.description', '这是一篇关于环保的文章，介绍了各种环保知识和技巧...'),
        type: i % 3 === 0 ? 'water' : i % 3 === 1 ? 'recycle' : 'tree',
        date: `${Math.floor(Math.random() * 30) + 1}${t('content.articles.favoritedDaysAgo', '天前收藏')}`
    }));

    const mockActivities = Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        title: `${t('content.activities.title', '环保活动')} ${i + 1}`,
        description: t('content.activities.description', '这是一个很有意义的环保活动，欢迎大家参与...'),
        location: t('content.activities.location', '市中心公园'),
        views: Math.floor(Math.random() * 200) + 50,
        likes: Math.floor(Math.random() * 50) + 10,
        type: i % 2 === 0 ? 'tree' : 'recycle',
        date: `${Math.floor(Math.random() * 30) + 1}${t('content.activities.favoritedDaysAgo', '天前收藏')}`
    }));

    const getCurrentData = () => {
        return activeTab === 'articles' ? mockArticles : mockActivities;
    };

    const currentData = getCurrentData();
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = currentData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1); // 切换标签时重置到第一页
    };

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
                        {t('tabs.articles', '科普文章')} ({mockArticles.length})
                    </button>
                    <button
                        onClick={() => handleTabChange('activities')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'activities'
                            ? 'bg-[#56B949] text-white'
                            : 'text-slate-600 hover:text-[#56B949]'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        {t('tabs.activities', '环保活动')} ({mockActivities.length})
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'articles' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentItems.map((article) => (
                                    <div key={article.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="aspect-video bg-gradient-to-br from-[#56B949]/10 to-[#30499B]/10 rounded-lg mb-4 flex items-center justify-center">
                                            {article.type === 'water' && <Droplets className="w-12 h-12 text-[#56B949]" />}
                                            {article.type === 'recycle' && <Recycle className="w-12 h-12 text-[#F0A32F]" />}
                                            {article.type === 'tree' && <TreePine className="w-12 h-12 text-[#30499B]" />}
                                        </div>
                                        <h3 className="font-semibold text-slate-800 mb-2">{article.title}</h3>
                                        <p className="text-sm text-slate-500 mb-3">{article.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[#56B949]">
                                                <Bookmark className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium">{t('content.favorited', '已收藏')}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{article.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 分页组件 */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div>
                            <div className="space-y-4">
                                {(currentItems as any[]).map((activity) => (
                                    <div key={activity.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center flex-shrink-0">
                                                {activity.type === 'tree' && <TreePine className="w-8 h-8 text-[#56B949]" />}
                                                {activity.type === 'recycle' && <Recycle className="w-8 h-8 text-[#F0A32F]" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#56B949]/10 text-[#56B949] border border-[#56B949]/20">
                                                        {activity.type === 'tree' ? t('content.activities.treeActivity', '植树活动') : t('content.activities.ecoActivity', '环保DIY')}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{activity.date}</span>
                                                </div>
                                                <h3 className="font-semibold text-slate-800 mb-2">{activity.title}</h3>
                                                <p className="text-sm text-slate-500 mb-3">{activity.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {activity.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" /> {activity.views}
                                                        </span>
                                                    </div>
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

                            {/* 分页组件 */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}