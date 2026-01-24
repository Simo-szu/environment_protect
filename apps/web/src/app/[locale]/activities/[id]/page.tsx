'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Clock,
    User,
    Phone,
    Mail,
    TreePine,
    Recycle,
    Droplets,
    Sun,
    Heart,
    Share2,
    BookmarkPlus
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

export default function ActivityDetailPage() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const params = useParams();
    const activityId = params.id as string;
    const locale = params.locale as string;
    const { t } = useSafeTranslation('activities');

    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    // 模拟活动数据
    const mockActivities = {
        'activity-001': {
            id: 'activity-001',
            title: '城市绿洲：周末社区花园种植计划',
            description: '加入我们在市中心创建绿色角落的行动。我们将一起种植本土花卉，学习堆肥知识，并为社区创造一个可持续的生态空间。这是一个适合全家参与的环保活动，让我们用双手为城市增添更多绿色。',
            type: 'tree',
            date: '2024年5月20日',
            time: '09:00-17:00',
            location: '市中心公园东门集合',
            maxParticipants: 30,
            currentParticipants: 18,
            organizer: '绿色生活协会',
            organizerAvatar: '/assets/icons/settings.svg',
            requirements: '请穿着适合户外活动的服装，自备水杯和防晒用品',
            contactInfo: '联系人：张老师 13800138000',
            email: 'zhang@greenlife.org',
            tags: ['种植', '社区', '环保', '户外'],
            images: ['/assets/svg/plant-01.svg', '/assets/svg/plant-02.svg'],
            likes: 45,
            favorites: 23,
            detailedDescription: `
        <h3>活动详情</h3>
        <p>本次活动旨在通过社区参与的方式，在城市中心创建一个小型的生态花园。参与者将学习到：</p>
        <ul>
          <li>本土植物的种植技巧</li>
          <li>有机堆肥的制作方法</li>
          <li>可持续园艺的基本原理</li>
          <li>城市生态系统的重要性</li>
        </ul>
        
        <h3>活动流程</h3>
        <p><strong>09:00-09:30</strong> 签到集合，分发工具和材料</p>
        <p><strong>09:30-10:30</strong> 环保知识讲座和种植技巧培训</p>
        <p><strong>10:30-12:00</strong> 土地准备和种植实践</p>
        <p><strong>12:00-13:00</strong> 午餐休息（自备或统一订餐）</p>
        <p><strong>13:00-15:30</strong> 继续种植工作，制作堆肥</p>
        <p><strong>15:30-16:30</strong> 成果展示和经验分享</p>
        <p><strong>16:30-17:00</strong> 清理现场，合影留念</p>
      `
        },
        'activity-002': {
            id: 'activity-002',
            title: '海洋守护者：海滩清洁行动',
            description: '保护海洋生态，从清洁海滩开始。与我们一起清理海滩垃圾，了解海洋污染的危害，学习海洋保护知识。',
            type: 'water',
            date: '2024年5月25日',
            time: '08:00-16:00',
            location: '金沙滩海滨公园',
            maxParticipants: 50,
            currentParticipants: 32,
            organizer: '海洋保护联盟',
            organizerAvatar: '/assets/icons/info.svg',
            requirements: '请穿着防滑鞋，自备防晒用品和充足的饮用水',
            contactInfo: '联系人：李老师 13900139000',
            email: 'li@oceanprotect.org',
            tags: ['海洋', '清洁', '环保', '户外'],
            images: ['/assets/svg/fish-large.svg', '/assets/svg/fish-small.svg'],
            likes: 67,
            favorites: 34,
            detailedDescription: `
        <h3>活动背景</h3>
        <p>海洋污染已成为全球性环境问题，每年有数百万吨塑料垃圾进入海洋。通过海滩清洁行动，我们不仅能直接改善海洋环境，还能提高公众的环保意识。</p>
        
        <h3>活动内容</h3>
        <ul>
          <li>海滩垃圾清理和分类</li>
          <li>海洋污染知识讲座</li>
          <li>海洋生物保护教育</li>
          <li>环保艺术创作工坊</li>
        </ul>
      `
        }
    };

    const activity = mockActivities[activityId as keyof typeof mockActivities] || mockActivities['activity-001'];

    const handleBack = () => {
        router.push(`/${locale}/activities`);
    };

    const handleRegister = () => {
        if (!isLoggedIn) {
            router.push(`/${locale}/login`);
            return;
        }
        router.push(`/${locale}/activities/register?id=${activityId}`);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleFavorite = () => {
        setIsFavorited(!isFavorited);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: activity.title,
                text: activity.description,
                url: window.location.href,
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href);
            alert(t('detail.linkCopied', '链接已复制到剪贴板'));
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'tree': return 'from-[#56B949] to-[#4aa840]';
            case 'recycle': return 'from-[#F0A32F] to-[#e8941a]';
            case 'water': return 'from-[#30499B] to-[#2a4086]';
            case 'sun': return 'from-[#EE4035] to-[#d63529]';
            default: return 'from-[#56B949] to-[#4aa840]';
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">
                                {t('detail.title', '活动详情')}
                            </h1>
                            <p className="text-slate-600">
                                {t('detail.subtitle', '了解活动详细信息并报名参与')}
                            </p>
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
                        {/* Activity Header */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    {getTypeIcon(activity.type)}
                                    <div>
                                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">
                                            {activity.title}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {activity.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleLike}
                                        className={`p-2 rounded-lg border transition-colors ${isLiked
                                            ? 'border-red-200 bg-red-50 text-red-500'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleFavorite}
                                        className={`p-2 rounded-lg border transition-colors ${isFavorited
                                            ? 'border-yellow-200 bg-yellow-50 text-yellow-600'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <BookmarkPlus className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-700 leading-relaxed mb-6">
                                {activity.description}
                            </p>

                            {/* Activity Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-[#30499B] mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">日期</p>
                                    <p className="text-sm font-medium">{activity.date}</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-[#56B949] mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">时间</p>
                                    <p className="text-sm font-medium">{activity.time}</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-[#F0A32F] mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">地点</p>
                                    <p className="text-sm font-medium">{activity.location}</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Users className="w-5 h-5 text-[#EE4035] mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">人数</p>
                                    <p className="text-sm font-medium">{activity.currentParticipants}/{activity.maxParticipants}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Description */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                            <h3 className="text-xl font-semibold text-[#30499B] mb-4">活动详情</h3>
                            <div
                                className="prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: activity.detailedDescription }}
                            />
                        </div>

                        {/* Requirements */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                            <h3 className="text-xl font-semibold text-[#30499B] mb-4">参与要求</h3>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-slate-700">{activity.requirements}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Registration Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg sticky top-8">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4">
                                    YL
                                </div>
                                <h4 className="font-semibold text-[#30499B] mb-2">立即报名参与</h4>
                                <p className="text-sm text-slate-600">还有 {activity.maxParticipants - activity.currentParticipants} 个名额</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">已报名</span>
                                    <span className="font-medium">{activity.currentParticipants} 人</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full bg-gradient-to-r ${getTypeColor(activity.type)}`}
                                        style={{ width: `${(activity.currentParticipants / activity.maxParticipants) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">总名额</span>
                                    <span className="font-medium">{activity.maxParticipants} 人</span>
                                </div>
                            </div>

                            <button
                                onClick={handleRegister}
                                className={`w-full py-3 rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r ${getTypeColor(activity.type)} text-white`}
                            >
                                {isLoggedIn ? '立即报名' : '登录后报名'}
                            </button>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {activity.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BookmarkPlus className="w-4 h-4" />
                                        {activity.favorites}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Organizer Info */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg">
                            <h4 className="font-semibold text-[#30499B] mb-4">主办方信息</h4>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{activity.organizer}</p>
                                    <p className="text-sm text-slate-600">环保组织</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{activity.contactInfo.split('：')[1]}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{activity.email}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </Layout>
    );
}