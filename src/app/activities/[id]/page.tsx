'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Heart,
  Share2,
  MessageCircle,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

export default function ActivityDetailPage() {
  const { user, isLoggedIn } = useAuth();
  const params = useParams();
  const activityId = params.id as string;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(156);

  // 模拟活动数据
  const activityData = {
    id: activityId,
    title: '城市绿洲：周末社区花园种植计划',
    description: '加入我们在市中心创建绿色角落的行动。我们将一起种植本土花卉，学习堆肥知识，并为社区创造一个可持续的生态空间。这不仅是一次环保活动，更是一次社区团结的体验。我们会提供所有必要的工具和材料，您只需要带着热情和环保的心来参与。',
    organizer: '绿色生活志愿者协会',
    startTime: '2024年5月20日 09:00',
    endTime: '2024年5月20日 17:00',
    location: '市中心社区花园（地铁2号线人民广场站A出口步行5分钟）',
    participants: 24,
    maxParticipants: 50,
    status: '正在报名',
    category: '植树活动',
    requirements: [
      '年满18周岁，身体健康',
      '请穿着适合户外活动的服装',
      '建议携带水杯和防晒用品',
      '活动全程约8小时，请合理安排时间'
    ],
    schedule: [
      { time: '09:00-09:30', activity: '签到集合，分发工具' },
      { time: '09:30-11:30', activity: '土壤准备和花卉种植' },
      { time: '11:30-13:00', activity: '午餐休息' },
      { time: '13:00-15:30', activity: '堆肥制作学习' },
      { time: '15:30-16:30', activity: '花园维护技巧分享' },
      { time: '16:30-17:00', activity: '总结分享，合影留念' }
    ]
  };

  const handleLike = () => {
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleRegister = () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    } else {
      window.location.href = `/activities/register?id=${activityId}`;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activityData.title,
        text: activityData.description,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto">

          {/* Activity Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden mb-8">
            {/* Activity Image */}
            <div className="h-64 bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/80 text-sm">活动海报</p>
              </div>
            </div>

            {/* Activity Info */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#56B949]/10 text-[#56B949] text-xs rounded-full font-medium">
                      {activityData.category}
                    </span>
                    <span className="px-3 py-1 bg-[#F0A32F]/10 text-[#F0A32F] text-xs rounded-full font-medium">
                      {activityData.status}
                    </span>
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-[#30499B] mb-4">{activityData.title}</h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-[#30499B]" />
                      <span>{activityData.startTime} - {activityData.endTime.split(' ')[1]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-[#EE4035]" />
                      <span>{activityData.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-[#56B949]" />
                      <span>{activityData.participants}/{activityData.maxParticipants} 人已报名</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-[#F0A32F]" />
                      <span>主办方：{activityData.organizer}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-full transition-all ${isLiked
                        ? 'bg-[#F0A32F] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-[#F0A32F] hover:border-[#F0A32F]'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <span className="text-xs text-center text-slate-500">{likeCount}</span>

                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#30499B] hover:border-[#30499B] transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>报名进度</span>
                  <span>{Math.round((activityData.participants / activityData.maxParticipants) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#56B949] to-[#F0A32F] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(activityData.participants / activityData.maxParticipants) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                className="w-full py-4 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                立即报名参加
              </button>
            </div>
          </div>

          {/* Activity Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
                <h2 className="text-xl font-serif font-semibold text-[#30499B] mb-4">活动介绍</h2>
                <p className="text-slate-700 leading-relaxed">{activityData.description}</p>
              </div>

              {/* Schedule */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
                <h2 className="text-xl font-serif font-semibold text-[#30499B] mb-6">活动安排</h2>
                <div className="space-y-4">
                  {activityData.schedule.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#56B949] text-white rounded-full text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-[#F0A32F]" />
                          <span className="text-sm font-medium text-[#F0A32F]">{item.time}</span>
                        </div>
                        <p className="text-slate-700">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Requirements */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-4">参与要求</h3>
                <ul className="space-y-3">
                  {activityData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 bg-[#56B949] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-4">联系方式</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#56B949]" />
                    <span className="text-slate-700">主办方：{activityData.organizer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#F0A32F]" />
                    <span className="text-slate-700">客服电话：400-123-4567</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-4">快速操作</h3>
                <div className="space-y-3">
                  <Link
                    href="/activities"
                    className="block w-full py-2 px-4 border border-slate-200 rounded-lg text-center text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                  >
                    浏览更多活动
                  </Link>
                  <Link
                    href="/my-activities"
                    className="block w-full py-2 px-4 border border-slate-200 rounded-lg text-center text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                  >
                    我的活动中心
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}