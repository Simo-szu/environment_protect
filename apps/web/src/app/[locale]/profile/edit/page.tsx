'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import {
    User,
    Save,
    ArrowLeft,
    MapPin,
    FileText,
    Camera
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

import { updateMyProfile } from '@/lib/api/user';

export default function ProfileEditPage() {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = params?.locale as string || 'zh';
    const { t } = useSafeTranslation('profile');
    const [submitting, setSubmitting] = useState(false);

    const mapGenderToString = (gender?: number): 'male' | 'female' | 'other' => {
        if (gender === 1) return 'male';
        if (gender === 2) return 'female';
        return 'other';
    };

    // 使用 user 数据初始化 formData，避免在 effect 中 setState
    const [formData, setFormData] = useState(() => ({
        nickname: user?.nickname || '',
        gender: mapGenderToString(user?.gender),
        hometown: user?.hometown || t('edit.defaultHometown', '广东省'),
        bio: user?.bio || t('edit.defaultBio', '热爱环保，致力于可持续生活方式的实践者。通过日常行动为地球环境保护贡献自己的力量。')
    }));

    // 当 user 变化时更新 formData（使用 render 阶段更新）
    const [prevUser, setPrevUser] = useState(user);
    if (user !== prevUser) {
        setPrevUser(user);
        if (user) {
            setFormData({
                nickname: user.nickname || '',
                gender: mapGenderToString(user.gender),
                hometown: user.hometown || t('edit.defaultHometown', '广东省'),
                bio: user.bio || t('edit.defaultBio', '热爱环保，致力于可持续生活方式的实践者。通过日常行动为地球环境保护贡献自己的力量。')
            });
        }
    }

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace(`/${locale}/login`);
        }
    }, [loading, isLoggedIn, router, locale]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);

            // Map gender string to integer
            let genderInt = 0; // Unknown
            if (formData.gender === 'male') genderInt = 1;
            else if (formData.gender === 'female') genderInt = 2;

            await updateMyProfile({
                nickname: formData.nickname,
                gender: genderInt,
                hometown: formData.hometown,
                bio: formData.bio
            });
            // 保存成功后返回个人资料页
            router.push(`/${locale}/profile`);
        } catch (error) {
            console.error('更新资料失败:', error);
            alert(t('edit.updateFailed', '更新资料失败，请重试'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${locale}/profile`);
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
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">{t('edit.title', '编辑资料')}</h1>
                            <p className="text-slate-600">{t('edit.subtitle', '更新你的个人信息')}</p>
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
                {/* Edit Form */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
                >
                    <div className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-3xl shadow-2xl">
                                    {formData.nickname ? formData.nickname.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#56B949] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#4aa840] transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500">{t('edit.changeAvatar', '点击更换头像')}</p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 昵称 */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    {t('edit.nickname', '昵称')}
                                </label>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                    placeholder={t('edit.nicknamePlaceholder', '请输入昵称')}
                                />
                            </div>

                            {/* 性别 */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    {t('edit.gender', '性别')}
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                >
                                    <option value="female">{t('edit.genderFemale', '女')}</option>
                                    <option value="male">{t('edit.genderMale', '男')}</option>
                                    <option value="other">{t('edit.genderOther', '其他')}</option>
                                </select>
                            </div>

                            {/* 家乡 */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    {t('edit.hometown', '家乡')}
                                </label>
                                <input
                                    type="text"
                                    name="hometown"
                                    value={formData.hometown}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                    placeholder={t('edit.hometownPlaceholder', '请输入家乡')}
                                />
                            </div>
                        </div>

                        {/* 个人简介 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                {t('edit.bio', '个人简介')}
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                placeholder={t('edit.bioPlaceholder', '介绍一下你自己...')}
                            />
                            <p className="text-xs text-slate-500 mt-2">{t('edit.bioLimit', '最多200个字符')}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-slate-200">
                            <button
                                onClick={handleSave}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {submitting ? t('edit.saving', '保存中...') : t('edit.save', '保存更改')}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={submitting}
                                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('edit.cancel', '取消')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </Layout>
    );
}
