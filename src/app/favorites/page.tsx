'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
    Bookmark,
    Heart,
    Calendar,
    MapPin,
    Eye,
    ArrowRight,
    TreePine,
    Recycle,
    Droplets
} from 'lucide-react';

export default function FavoritesPage() {
    const { user, isLoggedIn, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('articles');

    useEffect(() => {
        if (!loading && (!user || !isLoggedIn)) {
            window.location.href = '/login';
            return;
        }
    }, [user, isLoggedIn, loading]);

    if (loading) {
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

    if (!user || !isLoggedIn) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">跳转到登录页面...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header */}
            <div className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#56B949]/10 text-[#56B949] text-xs font-semibold mb-4 border border-[#56B949]/20">
                            <Bookmark className="w-3 h-3" />
                            我的收藏
                        </div>
                        <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">我的收藏</h1>
                        <p className="text-slate-600">这里保存了你收藏的所有内容</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'articles'
                                ? 'bg-[#56B949] text-white'
                                : 'text-slate-600 hover:text-[#56B949]'
                            }`}
                    >
                        <Bookmark className="w-4 h-4" />
                        科普文章
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'activities'
                                ? 'bg-[#56B949] text-white'
                                : 'text-slate-600 hover:text-[#56B949]'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        环保活动
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'articles' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Article Card 1 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="aspect-video bg-gradient-to-br from-[#56B949]/10 to-[#30499B]/10 rounded-lg mb-4 flex items-center justify-center">
                                        <Droplets className="w-12 h-12 text-[#56B949]" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-2">节约用水小妙招</h3>
                                    <p className="text-sm text-slate-500 mb-3">洗菜水可以浇花，洗衣水可以拖地，一水多用让每一滴水都发挥最大价值...</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[#56B949]">
                                            <Bookmark className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium">已收藏</span>
                                        </div>
                                        <span className="text-xs text-slate-400">3天前</span>
                                    </div>
                                </div>

                                {/* Article Card 2 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="aspect-video bg-gradient-to-br from-[#F0A32F]/10 to-[#EE4035]/10 rounded-lg mb-4 flex items-center justify-center">
                                        <Recycle className="w-12 h-12 text-[#F0A32F]" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-2">垃圾分类指南</h3>
                                    <p className="text-sm text-slate-500 mb-3">正确分类垃圾不仅能减少环境污染，还能让资源得到有效回收利用...</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[#56B949]">
                                            <Bookmark className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium">已收藏</span>
                                        </div>
                                        <span className="text-xs text-slate-400">1周前</span>
                                    </div>
                                </div>

                                {/* Article Card 3 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="aspect-video bg-gradient-to-br from-[#30499B]/10 to-[#56B949]/10 rounded-lg mb-4 flex items-center justify-center">
                                        <TreePine className="w-12 h-12 text-[#30499B]" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-2">城市绿化的重要性</h3>
                                    <p className="text-sm text-slate-500 mb-3">城市绿化不仅美化环境，还能净化空气、调节气候，提升居民生活质量...</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[#56B949]">
                                            <Bookmark className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium">已收藏</span>
                                        </div>
                                        <span className="text-xs text-slate-400">2周前</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-600 hover:text-[#56B949] hover:border-[#56B949] transition-colors font-medium">
                                    查看全部收藏文章
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div>
                            <div className="space-y-4">
                                {/* Activity Card 1 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center flex-shrink-0">
                                            <TreePine className="w-8 h-8 text-[#56B949]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#56B949]/10 text-[#56B949] border border-[#56B949]/20">植树活动</span>
                                                <span className="text-xs text-slate-400">5月20日</span>
                                            </div>
                                            <h3 className="font-semibold text-slate-800 mb-2">春季植树活动</h3>
                                            <p className="text-sm text-slate-500 mb-3">参与社区植树活动，为城市增添绿色，改善空气质量...</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> 市中心公园
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> 156
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[#56B949]">
                                                    <Bookmark className="w-4 h-4 fill-current" />
                                                    <span className="text-sm font-medium">已收藏</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Card 2 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#F0A32F]/20 to-[#EE4035]/20 flex items-center justify-center flex-shrink-0">
                                            <Recycle className="w-8 h-8 text-[#F0A32F]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0A32F]/10 text-[#F0A32F] border border-[#F0A32F]/20">环保DIY</span>
                                                <span className="text-xs text-slate-400">5月22日</span>
                                            </div>
                                            <h3 className="font-semibold text-slate-800 mb-2">旧物新生：创意环保DIY工作坊</h3>
                                            <p className="text-sm text-slate-500 mb-3">不要扔掉你的旧T恤和玻璃瓶！学习如何将废弃物品变废为宝...</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> 社区活动中心
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> 89
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[#56B949]">
                                                    <Bookmark className="w-4 h-4 fill-current" />
                                                    <span className="text-sm font-medium">已收藏</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-600 hover:text-[#56B949] hover:border-[#56B949] transition-colors font-medium">
                                    查看全部收藏活动
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}