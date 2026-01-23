'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    FileText,
    Image,
    Save,
    TreePine,
    Recycle,
    Droplets,
    Sun
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

export default function CreateActivityPage() {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'tree',
        date: '',
        time: '',
        location: '',
        maxParticipants: '',
        requirements: '',
        contactInfo: ''
    });

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
                        <p className="text-slate-600">加载中...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!isLoggedIn || !user) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        // 这里应该调用API创建活动
        console.log('创建活动:', formData);
        // 创建成功后返回活动列表页
        router.push('/activities');
    };

    const handleCancel = () => {
        router.push('/activities');
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'tree': return <TreePine className="w-5 h-5" />;
            case 'recycle': return <Recycle className="w-5 h-5" />;
            case 'water': return <Droplets className="w-5 h-5" />;
            case 'sun': return <Sun className="w-5 h-5" />;
            default: return <TreePine className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'tree': return 'text-[#56B949] bg-[#56B949]/10 border-[#56B949]/20';
            case 'recycle': return 'text-[#F0A32F] bg-[#F0A32F]/10 border-[#F0A32F]/20';
            case 'water': return 'text-[#30499B] bg-[#30499B]/10 border-[#30499B]/20';
            case 'sun': return 'text-[#EE4035] bg-[#EE4035]/10 border-[#EE4035]/20';
            default: return 'text-[#56B949] bg-[#56B949]/10 border-[#56B949]/20';
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
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">发起活动</h1>
                            <p className="text-slate-600">创建一个新的环保活动</p>
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
                {/* Create Form */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
                >
                    <div className="space-y-8">
                        {/* 活动标题 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                活动标题 *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder="请输入活动标题"
                                required
                            />
                        </div>

                        {/* 活动类型 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                活动类型 *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { value: 'tree', label: '植树活动' },
                                    { value: 'recycle', label: '回收利用' },
                                    { value: 'water', label: '水资源保护' },
                                    { value: 'sun', label: '清洁能源' }
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.type === type.value
                                                ? getTypeColor(type.value)
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            {getTypeIcon(type.value)}
                                            <span className="text-sm font-medium">{type.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 活动描述 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                活动描述 *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                placeholder="详细描述活动内容、目标和意义..."
                                required
                            />
                        </div>

                        {/* 时间和地点 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    活动日期 *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    活动时间 *
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Users className="w-4 h-4 inline mr-2" />
                                    最大人数
                                </label>
                                <input
                                    type="number"
                                    name="maxParticipants"
                                    value={formData.maxParticipants}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                    placeholder="不限制可留空"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* 活动地点 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                活动地点 *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder="请输入详细地址"
                                required
                            />
                        </div>

                        {/* 参与要求 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                参与要求
                            </label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                placeholder="请说明参与者需要准备的物品或满足的条件..."
                            />
                        </div>

                        {/* 联系方式 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                联系方式 *
                            </label>
                            <input
                                type="text"
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder="请输入联系电话或微信号"
                                required
                            />
                        </div>

                        {/* 活动图片 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Image className="w-4 h-4 inline mr-2" />
                                活动图片
                            </label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#56B949] transition-colors cursor-pointer">
                                <Image className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-500">点击上传活动图片</p>
                                <p className="text-xs text-slate-400 mt-2">支持 JPG、PNG 格式，最大 5MB</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-slate-200">
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Save className="w-4 h-4" />
                                发布活动
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </Layout>
    );
}