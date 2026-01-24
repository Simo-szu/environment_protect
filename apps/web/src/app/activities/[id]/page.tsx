'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Phone,
  User,
  Heart,
  Share2,
  TreePine,
  Recycle,
  Droplets,
  Sun,
  Clock,
  CheckCircle,
  Star
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

export default function ActivityDetailPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;

  const [isLiked, setIsLiked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // 模拟活动数据
  const mockActivity = {
    id: activityId,
    title: '城市绿洲：周末社区花园种植计划',
    description: '加入我们在市中心创建绿色角落的行动！这是一个充满意义的环保活动，我们将一起种植本土花卉，学习堆肥知识，并为社区创造一个可持续的生态空间。\n\n通过这次活动，你将学到：\n• 本土植物的种植技巧\n• 有机堆肥的制作方法\n• 城市园艺的基本知识\n• 生态系统的重要性\n\n我们相信，每一个小小的绿色行动都能为地球带来积极的改变。让我们一起用双手创造更美好的环境！',
    type: 'tree',
    date: '2024年5月20日',
    time: '09:00-17:00',
    location: '市中心公园东门集合',
    detailedLocation: '广州市天河区天河公园东门广场（地铁3号线天河客运站A出口步行5分钟）',
    maxParticipants: 30,
    currentParticipants: 18,
    organizer: '绿色生活协会',
    organizerAvatar: 'GL',
    requirements: '请穿着适合户外活动的服装，自备水杯和防晒用品。建议穿运动鞋，避免穿白色衣物。',
    contactInfo: '联系人：张老师 13800138000',
    likes: 156,
    views: 892,
    tags: ['植树', '环保', '社区活动', '周末'],
    images: [],
    status: '正在报名'
  };

  const handleBack = () => {
    router.push('/activities');
  };

  const handleRegister = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    router.push(`/activities/register?id=${activityId}`);
  };

  const handleLike = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    // 实现分享功能
    if (navigator.share) {
      navigator.share({
        title: mockActivity.title,
        text: mockActivity.description,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tree': return <TreePine className="w-6 h-6 text-[#56B949]" />;
      case 'recycle': return <Recycle className="w-6 h-6 text-[#F0A32F]" />;
      case 'water': return <Droplets className="w-6 h-6 text-[#30499B]" />;
      case 'sun': return <Sun className="w-6 h-6 text-[#EE4035]" />;
      default: return <TreePine className="w-6 h-6 text-[#56B949]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '正在报名': return 'text-[#30499B] bg-[#30499B]/10 border-[#30499B]/20';
      case '即将开始': return 'text-[#F0A32F] bg-[#F0A32F]/10 border-[#F0A32F]/20';
      case '报名结束': return 'text-slate-500 bg-slate-100 border-slate-200';
      default: return 'text-[#30499B] bg-[#30499B]/10 border-[#30499B]/20';
    }
  };

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageEnter}
        className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getTypeIcon(mockActivity.type)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(mockActivity.status)}`}>
                  {mockActivity.status}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#30499B]">
                {mockActivity.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`p-3 rounded-lg border transition-all ${isLiked
                  ? 'border-[#EE4035] bg-[#EE4035]/10 text-[#EE4035]'
                  : 'border-slate-200 hover:border-[#EE4035] hover:text-[#EE4035]'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-lg border border-slate-200 hover:border-[#30499B] hover:text-[#30499B] transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            variants={staggerItem}
            className="lg:col-span-2 space-y-8"
          >
            {/* Activity Image */}
            <div className="aspect-video bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 rounded-2xl flex items-center justify-center">
              {getTypeIcon(mockActivity.type)}
            </div>

            {/* Activity Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
              <h3 className="text-xl font-semibold text-[#30499B] mb-4">活动详情</h3>
              <div className="prose prose-slate max-w-none">
                {mockActivity.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-slate-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Activity Requirements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
              <h3 className="text-xl font-semibold text-[#30499B] mb-4">参与要求</h3>
              <p className="text-slate-600 leading-relaxed">{mockActivity.requirements}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {mockActivity.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#56B949]/10 text-[#56B949] rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            variants={staggerItem}
            className="lg:col-span-1 space-y-6"
          >
            {/* Activity Info Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg sticky top-8">
              <div className="space-y-6">
                {/* Time & Location */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#30499B] mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">{mockActivity.date}</p>
                      <p className="text-sm text-slate-600">{mockActivity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#30499B] mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">{mockActivity.location}</p>
                      <p className="text-sm text-slate-600">{mockActivity.detailedLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#30499B]" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {mockActivity.currentParticipants}/{mockActivity.maxParticipants} 人
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-[#56B949] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(mockActivity.currentParticipants / mockActivity.maxParticipants) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-3">主办方</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold text-sm">
                      {mockActivity.organizerAvatar}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{mockActivity.organizer}</p>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Star className="w-3 h-3 fill-current text-[#F0A32F]" />
                        <span>4.8 评分</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[#EE4035]">{mockActivity.likes}</p>
                      <p className="text-sm text-slate-500">点赞</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#30499B]">{mockActivity.views}</p>
                      <p className="text-sm text-slate-500">浏览</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{mockActivity.contactInfo}</span>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  disabled={mockActivity.status === '报名结束'}
                  className="w-full py-4 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {mockActivity.status === '报名结束' ? '报名已结束' : '立即报名'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}