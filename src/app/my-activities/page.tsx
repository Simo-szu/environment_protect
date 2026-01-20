'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
  CalendarCheck,
  CalendarHeart,
  Trophy,
  Clock,
  Star,
  Calendar,
  MapPin,
  Monitor,
  Leaf,
  Recycle,
  Droplets,
  CalendarPlus,
  CheckCircle
} from 'lucide-react';

export default function MyActivitiesPage() {
  const { user, logout, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!loading && (!user || !isLoggedIn)) {
      window.location.href = '/login';
      return;
    }
  }, [user, isLoggedIn, loading]);

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const viewActivityDetails = (activityId: string) => {
    console.log('查看活动详情:', activityId);
  };

  const cancelRegistration = (activityId: string) => {
    if (confirm('确定要取消报名吗？')) {
      console.log('取消报名:', activityId);
      alert('报名已取消');
    }
  };

  const rateActivity = (activityId: string) => {
    alert('评价功能开发中...');
  };

  const downloadCertificate = (activityId: string) => {
    alert('证书下载功能开发中...');
  };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 text-[#30499B] rounded-full text-sm font-semibold mb-4 border border-[#56B949]/20">
            <CalendarHeart className="w-4 h-4" />
            活动管理
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">我的活动中心</h2>
          <p className="text-slate-500">管理您参与的所有环保活动</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#56B949] to-[#4aa840] rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#56B949] mb-1">3</div>
            <div className="text-sm text-slate-500">已报名活动</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F0A32F] to-[#e67e22] rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#F0A32F] mb-1">2</div>
            <div className="text-sm text-slate-500">已完成活动</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#30499B] to-[#253a7a] rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#30499B] mb-1">1</div>
            <div className="text-sm text-slate-500">进行中活动</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#EE4035] to-[#d63031] rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#EE4035] mb-1">328</div>
            <div className="text-sm text-slate-500">获得积分</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden mb-8">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => switchTab('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'all'
                  ? 'text-[#30499B] bg-slate-50'
                  : 'text-slate-600 hover:text-[#30499B]'
                }`}
            >
              全部活动
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
              )}
            </button>
            <button
              onClick={() => switchTab('registered')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'registered'
                  ? 'text-[#30499B] bg-slate-50'
                  : 'text-slate-600 hover:text-[#30499B]'
                }`}
            >
              已报名
              {activeTab === 'registered' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
              )}
            </button>
            <button
              onClick={() => switchTab('ongoing')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'ongoing'
                  ? 'text-[#30499B] bg-slate-50'
                  : 'text-slate-600 hover:text-[#30499B]'
                }`}
            >
              进行中
              {activeTab === 'ongoing' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
              )}
            </button>
            <button
              onClick={() => switchTab('completed')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'completed'
                  ? 'text-[#30499B] bg-slate-50'
                  : 'text-slate-600 hover:text-[#30499B]'
                }`}
            >
              已完成
              {activeTab === 'completed' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* All Activities Tab */}
            {activeTab === 'all' && (
              <div className="space-y-6">
                {/* Activity Card 1 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Activity Image */}
                    <div className="w-full md:w-48 h-32 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-12 h-12 text-[#56B949]/40" />
                    </div>
                    {/* Activity Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-2">城市绿洲：周末社区花园种植计划</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              2024年5月20日 09:00-17:00
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              市中心社区公园
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#56B949] to-[#4aa840] text-white">已报名</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">加入我们在市中心创建绿色角落的行动。我们将一起种植本土花卉，学习堆肥知识...</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>报名时间: 2024-05-15</span>
                          <span>状态: 待参与</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewActivityDetails('activity-001')}
                            className="px-4 py-2 text-[#30499B] border border-[#30499B] rounded-lg hover:bg-[#30499B] hover:text-white transition-colors text-sm"
                          >
                            查看详情
                          </button>
                          <button
                            onClick={() => cancelRegistration('activity-001')}
                            className="px-4 py-2 text-[#EE4035] border border-[#EE4035] rounded-lg hover:bg-[#EE4035] hover:text-white transition-colors text-sm"
                          >
                            取消报名
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Card 2 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-32 rounded-lg bg-gradient-to-br from-[#F0A32F]/20 to-[#EE4035]/20 flex items-center justify-center flex-shrink-0">
                      <Recycle className="w-12 h-12 text-[#F0A32F]/40" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-2">旧物新生：创意环保DIY工作坊</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              2024年5月22日 14:00-17:00
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              创意工作室
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#30499B] to-[#253a7a] text-white">已完成</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">不要扔掉你的旧T恤和玻璃瓶！在这个工作坊中，艺术家将教你如何将废弃物品变废为宝...</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>完成时间: 2024-05-22</span>
                          <span className="text-[#F0A32F]">获得积分: +50</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewActivityDetails('activity-002')}
                            className="px-4 py-2 text-[#30499B] border border-[#30499B] rounded-lg hover:bg-[#30499B] hover:text-white transition-colors text-sm"
                          >
                            查看详情
                          </button>
                          <button
                            onClick={() => rateActivity('activity-002')}
                            className="px-4 py-2 bg-[#F0A32F] text-white rounded-lg hover:bg-[#e67e22] transition-colors text-sm"
                          >
                            评价活动
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content */}
            {activeTab === 'registered' && (
              <div className="text-center py-12">
                <CalendarPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">已报名活动</h3>
                <p className="text-slate-400">显示您已报名但尚未开始的活动</p>
              </div>
            )}

            {activeTab === 'ongoing' && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">进行中活动</h3>
                <p className="text-slate-400">显示正在进行的活动</p>
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">已完成活动</h3>
                <p className="text-slate-400">显示您已完成的活动和获得的积分</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}