'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
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

export default function LikesPage() {
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE4035]/10 text-[#EE4035] text-xs font-semibold mb-4 border border-[#EE4035]/20">
                            <Heart className="w-3 h-3" />
                            我的点赞
                        </div>
                        <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">我的点赞</h1>
                        <p className="text-slate-600">这里记录了你点赞过的所有内容</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'articles'
                            ? 'bg-[#EE4035] text-white'
                            : 'text-slate-600 hover:text-[#EE4035]'
                            }`}
                    >
                        <Heart className="w-4 h-4" />
                        科普文章
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'activities'
                            ? 'bg-[#EE4035] text-white'
                            : 'text-slate-600 hover:text-[#EE4035]'
                            }`}
                    >
                        <ThumbsUp className="w-4 h-4" />
                        环保活动
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'comments'
                            ? 'bg-[#EE4035] text-white'
                            : 'text-slate-600 hover:text-[#EE4035]'
                            }`}
                    >
                        <MessageCircle className="w-4 h-4" />
                        评论互动
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
                                    <h3 className="font-semibold text-slate-800 mb-2">环保小贴士分享</h3>
                                    <p className="text-sm text-slate-500 mb-3">分享一些日常生活中的环保小技巧，让我们一起为地球贡献力量...</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[#EE4035]">
                                            <Heart className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium">6</span>
                                        </div>
                                        <span className="text-xs text-slate-400">2天前</span>
                                    </div>
                                </div>

                                {/* Article Card 2 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="aspect-video bg-gradient-to-br from-[#F0A32F]/10 to-[#EE4035]/10 rounded-lg mb-4 flex items-center justify-center">
                                        <Recycle className="w-12 h-12 text-[#F0A32F]" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-2">垃圾分类新政策解读</h3>
                                    <p className="text-sm text-slate-500 mb-3">最新的垃圾分类政策出台，让我们一起了解如何更好地进行垃圾分类...</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[#EE4035]">
                                            <Heart className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium">12</span>
                                        </div>
                                        <span className="text-xs text-slate-400">5天前</span>
                                    </div>
                                </div>

                                {/* Article Card 3 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="aspect-video bg-gradient-to-br from-[#30499B]/10 to-[#56B949]/10 rounded-lg mb-4 flex items-center justify-center">
                                        <TreePine className="w-12 h-12 text-[#30499B]" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-2">绿色出行倡议</h3>
                                    <p className="text-sm text-slate-500 mb-3">选择公共交通、骑行或步行，减少碳排放，为环保贡献自己的力量...</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[#EE4035]">
                                            <Heart className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium">8</span>
                                        </div>
                                        <span className="text-xs text-slate-400">1周前</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-600 hover:text-[#EE4035] hover:border-[#EE4035] transition-colors font-medium">
                                    查看全部点赞文章
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
                                            <h3 className="font-semibold text-slate-800 mb-2">城市绿洲：周末社区花园种植计划</h3>
                                            <p className="text-sm text-slate-500 mb-3">加入我们在市中心创建绿色角落的行动。我们将一起种植本土花卉...</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> 市中心公园
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> 156
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[#EE4035]">
                                                    <ThumbsUp className="w-4 h-4 fill-current" />
                                                    <span className="text-sm font-medium">24</span>
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
                                                <div className="flex items-center gap-1 text-[#EE4035]">
                                                    <ThumbsUp className="w-4 h-4 fill-current" />
                                                    <span className="text-sm font-medium">45</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-600 hover:text-[#EE4035] hover:border-[#EE4035] transition-colors font-medium">
                                    查看全部点赞活动
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div>
                            <div className="space-y-4">
                                {/* Comment Card 1 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold text-sm">
                                            张
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-slate-800">张小明</span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-400">2小时前</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">非常赞同你的观点！环保确实需要从每个人做起，从小事做起。</p>
                                            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-2 mb-3">
                                                回复：我们每个人都应该为环保贡献自己的力量...
                                            </div>
                                            <div className="flex items-center gap-1 text-[#EE4035]">
                                                <Heart className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium">你点赞了这条评论</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comment Card 2 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#EE4035] flex items-center justify-center text-white font-semibold text-sm">
                                            李
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-slate-800">李小红</span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-400">1天前</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">这个活动太有意义了！我已经报名参加，希望能和大家一起为环保贡献力量。</p>
                                            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-2 mb-3">
                                                评论于：城市绿洲：周末社区花园种植计划
                                            </div>
                                            <div className="flex items-center gap-1 text-[#EE4035]">
                                                <Heart className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium">你点赞了这条评论</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-600 hover:text-[#EE4035] hover:border-[#EE4035] transition-colors font-medium">
                                    查看全部点赞评论
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