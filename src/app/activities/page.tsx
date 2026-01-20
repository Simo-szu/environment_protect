'use client';

import React from 'react';
import { 
  CalendarHeart, 
  Flame, 
  CalendarCheck, 
  PlusCircle, 
  Calendar, 
  Star, 
  ThumbsUp, 
  Trees,
  Sun,
  Waves,
  Recycle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

export default function ActivitiesPage() {
  const { user, isLoggedIn } = useAuth();

  const scrollToActivities = () => {
    const activitiesSection = document.getElementById('activities-section');
    if (activitiesSection) {
      activitiesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const goToMyActivities = () => {
    if (!user || !isLoggedIn) {
      window.location.href = '/login';
    } else {
      window.location.href = '/my-activities';
    }
  };

  const checkLoginAndRedirect = () => {
    if (!user || !isLoggedIn) {
      window.location.href = '/login';
    } else {
      window.location.href = '/activities/create';
    }
  };

  const registerActivity = (activityId: string) => {
    if (!user || !isLoggedIn) {
      window.location.href = '/login';
    } else {
      window.location.href = `/activities/register?id=${activityId}`;
    }
  };

  const viewActivityDetails = (activityId: string) => {
    window.location.href = `/activities/${activityId}`;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white via-[#30499B]/5 to-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30499B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30499B]"></span>
          </span>
          环保活动招募
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] mb-6 drop-shadow-sm leading-tight">
          活动<span className="text-[#30499B]">广场</span>
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 font-normal max-w-lg mx-auto leading-relaxed px-4">
          <div className="flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-[#30499B]" />
            <span>参与<span className="text-[#30499B] font-medium border-b-2 border-[#30499B]/30">活动</span>，</span>
          </div>
          <span>用<span className="text-[#F0A32F] font-medium border-b-2 border-[#F0A32F]/30">行动</span>改变世界</span>
        </div>
      </section>

      {/* Interactive Carousel Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-12">
        <div className="flex justify-center">
          <div className="flex gap-6 w-full max-w-4xl">
            {/* Card 1: 热门活动 */}
            <div onClick={scrollToActivities} className="flex-1 group relative rounded-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer">
              <div className="relative bg-white h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-[#EE4035]/5 border border-[#EE4035]/20">
                <div className="w-12 h-12 rounded-full bg-[#EE4035]/10 flex items-center justify-center text-[#EE4035] mb-4 group-hover:bg-[#EE4035] group-hover:text-white transition-colors">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-xl text-[#30499B] font-serif font-semibold mb-1">热门活动</h3>
                <p className="text-sm text-slate-500">最受欢迎的环保行动</p>
              </div>
            </div>

            {/* Card 2: 我的活动 */}
            <div onClick={goToMyActivities} className="flex-1 group relative rounded-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer">
              <div className="relative bg-gradient-to-br from-[#56B949] to-[#4aa840] h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner border border-white/20">
                <CalendarCheck className="w-10 h-10 text-white mb-3 opacity-90" />
                <h3 className="text-2xl text-white font-serif font-semibold leading-tight mb-2">我的活动<br />中心</h3>
                <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm border border-white/30">查看报名</span>
              </div>
            </div>

            {/* Card 3: 发布活动 */}
            <div onClick={checkLoginAndRedirect} className="flex-1 group relative rounded-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer">
              <div className="relative bg-white h-56 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-[#F0A32F]/5 border border-[#F0A32F]/20">
                <div className="w-12 h-12 rounded-full bg-[#F0A32F]/10 flex items-center justify-center text-[#F0A32F] mb-4 group-hover:bg-[#F0A32F] group-hover:text-white transition-colors">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl text-[#30499B] font-serif font-semibold mb-1">发布活动</h3>
                <p className="text-sm text-slate-500">组织你的环保活动</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div id="activities-section" className="bg-white px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* Left Column: Categories & Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Categories Filter */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-baseline">
                <h2 className="text-lg font-serif font-bold text-[#30499B] flex-shrink-0 w-16">分类</h2>
                <div className="flex flex-wrap gap-x-2 gap-y-3">
                  <button className="px-4 py-1.5 rounded-full bg-[#30499B] text-white text-xs font-medium shadow-md shadow-[#30499B]/20 transition-all hover:scale-105">全部</button>
                  <button className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 border border-slate-100 text-xs font-medium hover:bg-[#56B949] hover:text-white hover:border-[#56B949] transition-all duration-300">环保市集</button>
                  <button className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 border border-slate-100 text-xs font-medium hover:bg-[#56B949] hover:text-white hover:border-[#56B949] transition-all duration-300">植树活动</button>
                  <button className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 border border-slate-100 text-xs font-medium hover:bg-[#56B949] hover:text-white hover:border-[#56B949] transition-all duration-300">垃圾分类</button>
                </div>
              </div>
            </div>

            {/* Activity List Container */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-white/60 min-h-[600px] flex flex-col gap-6">
              {/* Activity Card 1 */}
              <div className="group flex flex-col sm:flex-row gap-6 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-[#56B949]/5 border border-transparent hover:border-[#56B949]/20">
                <div className="w-full sm:w-48 h-32 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 overflow-hidden relative flex-shrink-0">
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-[#30499B] shadow-sm">正在报名</div>
                  <div className="w-full h-full flex items-center justify-center text-[#56B949]/40">
                    <Trees className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => viewActivityDetails('activity-001')} 
                      className="text-lg font-serif font-semibold text-[#30499B] group-hover:text-[#56B949] transition-colors tracking-tight mb-2 cursor-pointer hover:underline"
                    >
                      城市绿洲：周末社区花园种植计划
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">加入我们在市中心创建绿色角落的行动。我们将一起种植本土花卉，学习堆肥知识，并为社区创造一个可持续的生态空间...</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-slate-100/50 pt-3">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 5月20日
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 hover:text-[#F0A32F] transition-colors cursor-pointer">
                          <Star className="w-3 h-3" /> 24
                        </span>
                        <span className="flex items-center gap-1 hover:text-[#EE4035] transition-colors cursor-pointer">
                          <ThumbsUp className="w-3 h-3" /> 156
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => registerActivity('activity-001')} 
                      className="px-4 py-1.5 rounded-lg bg-[#56B949] text-white text-xs font-semibold shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] hover:-translate-y-0.5 transition-all"
                    >
                      一键报名
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Card 2 */}
              <div className="group flex flex-col sm:flex-row gap-6 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-[#F0A32F]/5 border border-transparent hover:border-[#F0A32F]/20">
                <div className="w-full sm:w-48 h-32 rounded-lg bg-gradient-to-br from-[#F0A32F]/20 to-[#EE4035]/20 overflow-hidden relative flex-shrink-0">
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-[#F0A32F] shadow-sm">即将开始</div>
                  <div className="w-full h-full flex items-center justify-center text-[#F0A32F]/40">
                    <Sun className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => viewActivityDetails('activity-002')} 
                      className="text-lg font-serif font-semibold text-[#30499B] group-hover:text-[#F0A32F] transition-colors tracking-tight mb-2 cursor-pointer hover:underline"
                    >
                      旧物新生：创意环保DIY工作坊
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">不要扔掉你的旧T恤和玻璃瓶！在这个工作坊中，艺术家将教你如何将废弃物品变废为宝...</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-slate-100/50 pt-3">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 5月22日
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 hover:text-[#F0A32F] transition-colors cursor-pointer">
                          <Star className="w-3 h-3" /> 45
                        </span>
                        <span className="flex items-center gap-1 hover:text-[#EE4035] transition-colors cursor-pointer">
                          <ThumbsUp className="w-3 h-3" /> 89
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => viewActivityDetails('activity-002')} 
                      className="px-4 py-1.5 rounded-lg bg-white border border-[#30499B] text-[#30499B] text-xs font-semibold hover:bg-[#30499B] hover:text-white transition-all"
                    >
                      了解详情
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
              <h3 className="text-lg font-serif font-bold text-[#30499B] mb-4">活动统计</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">本月活动</span>
                  <span className="text-lg font-bold text-[#56B949]">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">参与人数</span>
                  <span className="text-lg font-bold text-[#30499B]">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">我的报名</span>
                  <span className="text-lg font-bold text-[#F0A32F]">3</span>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
              <h3 className="text-lg font-serif font-bold text-[#30499B] mb-4">热门分类</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <Trees className="w-5 h-5 text-[#56B949]" />
                  <span className="text-sm text-slate-600">植树活动</span>
                  <span className="ml-auto text-xs text-slate-400">8</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <Waves className="w-5 h-5 text-[#30499B]" />
                  <span className="text-sm text-slate-600">净滩行动</span>
                  <span className="ml-auto text-xs text-slate-400">5</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <Recycle className="w-5 h-5 text-[#F0A32F]" />
                  <span className="text-sm text-slate-600">回收利用</span>
                  <span className="ml-auto text-xs text-slate-400">7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
