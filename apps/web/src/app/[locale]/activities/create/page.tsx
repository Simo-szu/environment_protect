'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
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
    FileText,
    Image,
    Save,
    TreePine,
    Recycle,
    Droplets,
    Sun
} from 'lucide-react';
import { staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

import { createHostActivity } from '@/lib/api/activity';
import { filesApi } from '@/lib/api';

function CreateActivityContent() {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string || 'zh';
    const { t } = useSafeTranslation('activities');
    const { t: tCommon } = useSafeTranslation('common');

    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [posterUrls, setPosterUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
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
                        <p className="text-slate-600">
                            {t('create.loading', '加载中...')}
                        </p>
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

    const uploadPoster = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('只支持图片文件');
            return;
        }
        const maxBytes = 5 * 1024 * 1024;
        if (file.size > maxBytes) {
            alert('图片最大支持 5MB');
            return;
        }

        setUploading(true);
        try {
            const presign = await filesApi.getUploadPresignUrl({
                fileType: 'poster',
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
            });

            const uploadResp = await fetch(presign.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
                body: file,
            });

            if (!uploadResp.ok) {
                throw new Error(`Upload failed: ${uploadResp.status}`);
            }

            setPosterUrls((prev) => [...prev, presign.fileUrl]);
        } catch (error) {
            console.error('上传图片失败:', error);
            alert('上传图片失败，请重试');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handlePickPoster = () => {
        if (uploading || submitting) return;
        fileInputRef.current?.click();
    };

    const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadPoster(file);
    };

    const removePoster = (url: string) => {
        setPosterUrls((prev) => prev.filter((x) => x !== url));
    };

    const mapTypeToCategory = (type: string): number => {
        switch (type) {
            case 'tree': return 1; // 环保教育 (Example mapping)
            case 'recycle': return 8; // 其他
            case 'water': return 1;
            case 'sun': return 6; // 科技创新
            default: return 8;
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.description) {
            alert('请填写所有必填字段');
            return;
        }

        try {
            setSubmitting(true);
            const startTime = `${formData.date}T${formData.time}:00`;
            // Default EndTime to 2 hours later
            const endDate = new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000);
            const endTime = endDate.toISOString().slice(0, 19);

            // Append extra info to description
            let fullDescription = formData.description;
            if (formData.requirements) {
                fullDescription += `\n\n【参与要求】\n${formData.requirements}`;
            }
            if (formData.contactInfo) {
                fullDescription += `\n\n【联系方式】\n${formData.contactInfo}`;
            }
            if (formData.maxParticipants) {
                fullDescription += `\n\n【人数限制】\n${formData.maxParticipants}人`;
            }

            await createHostActivity({
                title: formData.title,
                category: mapTypeToCategory(formData.type),
                signupPolicy: 1, // 默认自动通过
                startTime,
                endTime,
                location: formData.location,
                description: fullDescription,
                posterUrls
            });

            router.push(`/${locale}/activities`);
        } catch (error) {
            console.error('创建活动失败:', error);
            alert('创建活动失败，请重试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${locale}/activities`);
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
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">
                                {t('create.title', '发起活动')}
                            </h1>
                            <p className="text-slate-600">
                                {t('create.subtitle', '创建一个新的环保活动')}
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
                                {t('create.form.title', '活动标题')} *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder={t('create.form.titlePlaceholder', '请输入活动标题')}
                                required
                            />
                        </div>

                        {/* 活动类型 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                {t('create.form.type', '活动类型')} *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { value: 'tree', label: t('create.form.types.tree', '植树造林') },
                                    { value: 'recycle', label: t('create.form.types.recycle', '回收利用') },
                                    { value: 'water', label: t('create.form.types.water', '节水保护') },
                                    { value: 'sun', label: t('create.form.types.energy', '清洁能源') }
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
                                {t('create.form.description', '活动描述')} *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                placeholder={t('create.form.descriptionPlaceholder', '描述活动内容、目标和意义...')}
                                required
                            />
                        </div>

                        {/* 时间和地点 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    {t('create.form.date', '活动日期')} *
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
                                    {t('create.form.time', '活动时间')} *
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
                                    {t('create.form.maxParticipants', '最大参与人数')}
                                </label>
                                <input
                                    type="number"
                                    name="maxParticipants"
                                    value={formData.maxParticipants}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                    placeholder={t('create.form.maxParticipantsPlaceholder', '留空表示不限制')}
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* 活动地点 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                {t('create.form.location', '活动地点')} *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder={t('create.form.locationPlaceholder', '请输入详细地址')}
                                required
                            />
                        </div>

                        {/* 参与要求 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('create.form.requirements', '参与要求')}
                            </label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                placeholder={t('create.form.requirementsPlaceholder', '描述参与者需要准备什么或满足什么条件...')}
                            />
                        </div>

                        {/* 联系方式 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('create.form.contact', '联系信息')} *
                            </label>
                            <input
                                type="text"
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder={t('create.form.contactPlaceholder', '请输入电话号码或微信号')}
                                required
                            />
                        </div>

                        {/* 活动图片 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Image className="w-4 h-4 inline mr-2" />
                                {t('create.form.image', '活动图片')}
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePosterChange}
                            />

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={handlePickPoster}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') handlePickPoster();
                                }}
                                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#56B949] transition-colors cursor-pointer"
                            >
                                <Image className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-500">
                                    {uploading ? '上传中...' : t('create.form.imageUpload', '点击上传活动图片')}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    {t('create.form.imageSupport', '支持JPG、PNG格式，最大5MB')}
                                </p>
                            </div>

                            {posterUrls.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {posterUrls.map((url) => (
                                        <div key={url} className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="poster" className="w-full h-28 object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePoster(url)}
                                                className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/60 text-white rounded hover:bg-black/70"
                                            >
                                                移除
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-slate-200">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || uploading}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Save className="w-4 h-4" />
                                {uploading ? '图片上传中...' : t('create.form.publish', '发布活动')}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={submitting || uploading}
                                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                {tCommon('cancel', '取消')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </Layout>
    );
}

export default function CreateActivityPage() {
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
            <CreateActivityContent />
        </Suspense>
    );
}
