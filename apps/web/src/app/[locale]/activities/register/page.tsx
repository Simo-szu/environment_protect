'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
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
    CheckCircle,
    TreePine,
    Recycle,
    Droplets,
    Sun
} from 'lucide-react';
import { staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

function RegisterActivityContent() {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const locale = params.locale as string;
    const activityId = searchParams.get('id');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        emergencyContact: '',
        emergencyPhone: '',
        specialRequirements: '',
        agreement: false
    });

    // 模拟活动数据
    const mockActivity = {
        id: activityId || 'activity-001',
        title: '城市绿洲：周末社区花园种植计划',
        description: '加入我们在市中心创建绿色角落的行动。我们将一起种植本土花卉，学习堆肥知识，并为社区创造一个可持续的生态空间。',
        type: 'tree',
        date: '2024年5月20日',
        time: '09:00-17:00',
        location: '市中心公园东门集合',
        maxParticipants: 30,
        currentParticipants: 18,
        organizer: '绿色生活协会',
        requirements: '请穿着适合户外活动的服装，自备水杯和防晒用品',
        contactInfo: '联系人：张老师 13800138000'
    };

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace(`/${locale}/login`);
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.nickname || user.username || '',
                email: user.email || ''
            }));
        }
    }, [loading, isLoggedIn, router, user, locale]);

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

    if (!isLoggedIn || !user) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = () => {
        if (!formData.agreement) {
            alert('请先同意活动协议');
            return;
        }

        // 这里应该调用API提交报名
        console.log('提交报名:', formData);
        // 报名成功后跳转到成功页面或返回活动详情
        alert('报名成功！');
        router.push(`/${locale}/my-activities`);
    };

    const handleCancel = () => {
        router.push(`/${locale}/activities`);
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
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">活动报名</h1>
                            <p className="text-slate-600">填写报名信息参与活动</p>
                        </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Info */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg sticky top-8">
                            <div className="flex items-center gap-3 mb-4">
                                {getTypeIcon(mockActivity.type)}
                                <h3 className="font-semibold text-[#30499B]">活动信息</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">{mockActivity.title}</h4>
                                    <p className="text-sm text-slate-600 line-clamp-3">{mockActivity.description}</p>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{mockActivity.date} {mockActivity.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{mockActivity.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Users className="w-4 h-4" />
                                        <span>{mockActivity.currentParticipants}/{mockActivity.maxParticipants} 人</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <p className="text-xs text-slate-500 mb-2">主办方</p>
                                    <p className="text-sm font-medium text-slate-700">{mockActivity.organizer}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Registration Form */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                            <h3 className="text-xl font-semibold text-[#30499B] mb-6">报名信息</h3>

                            <div className="space-y-6">
                                {/* 基本信息 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            姓名 *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder="请输入真实姓名"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            联系电话 *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder="请输入手机号码"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 邮箱 */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        邮箱地址
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                        placeholder="请输入邮箱地址"
                                    />
                                </div>

                                {/* 紧急联系人 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            紧急联系人
                                        </label>
                                        <input
                                            type="text"
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder="紧急联系人姓名"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            紧急联系电话
                                        </label>
                                        <input
                                            type="tel"
                                            name="emergencyPhone"
                                            value={formData.emergencyPhone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder="紧急联系人电话"
                                        />
                                    </div>
                                </div>

                                {/* 特殊需求 */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        特殊需求或备注
                                    </label>
                                    <textarea
                                        name="specialRequirements"
                                        value={formData.specialRequirements}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                        placeholder="如有特殊需求或其他需要说明的情况，请在此填写..."
                                    />
                                </div>

                                {/* 活动要求 */}
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="font-medium text-slate-800 mb-2">活动要求</h4>
                                    <p className="text-sm text-slate-600">{mockActivity.requirements}</p>
                                </div>

                                {/* 协议同意 */}
                                <div className="flex items-start gap-3 p-4 bg-[#56B949]/5 rounded-lg border border-[#56B949]/20">
                                    <input
                                        type="checkbox"
                                        name="agreement"
                                        checked={formData.agreement}
                                        onChange={handleInputChange}
                                        className="mt-1 w-4 h-4 text-[#56B949] border-slate-300 rounded focus:ring-[#56B949]"
                                        required
                                    />
                                    <div className="text-sm">
                                        <p className="text-slate-700">
                                            我已阅读并同意活动相关协议，了解活动风险，自愿参与此次环保活动。
                                        </p>
                                        <p className="text-slate-500 mt-1">
                                            参与活动期间请遵守组织方安排，注意人身安全。
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6 border-t border-slate-200">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!formData.agreement}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        确认报名
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </Layout>
    );
}

export default function RegisterActivityPage() {
    return (
        <Suspense fallback={
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
        }>
            <RegisterActivityContent />
        </Suspense>
    );
}