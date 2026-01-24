'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import { useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { ArrowLeft, MessageSquare, Star, Send, CheckCircle } from 'lucide-react';

export default function FeedbackPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('feedback');

    const [formData, setFormData] = useState({
        type: 'suggestion',
        rating: 5,
        title: '',
        content: '',
        contact: '',
        anonymous: false
    });
    const [submitted, setSubmitted] = useState(false);

    const feedbackTypes = [
        { value: 'suggestion', label: t('form.type.options.suggestion'), color: 'text-[#56B949]' },
        { value: 'bug', label: t('form.type.options.bug'), color: 'text-[#EE4035]' },
        { value: 'praise', label: t('form.type.options.praise'), color: 'text-[#F0A32F]' },
        { value: 'other', label: t('form.type.options.other'), color: 'text-[#30499B]' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({
            ...prev,
            rating
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 这里应该调用API提交反馈
        console.log('提交反馈:', formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white mx-auto mb-6">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-4">
                            {t('success.title')}
                        </h2>
                        <p className="text-slate-600 mb-8">
                            {t('success.description')}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href={`/${locale}`}
                                className="px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                            >
                                {t('success.backHome')}
                            </Link>
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setFormData({
                                        type: 'suggestion',
                                        rating: 5,
                                        title: '',
                                        content: '',
                                        contact: '',
                                        anonymous: false
                                    });
                                }}
                                className="px-6 py-3 border border-[#56B949] text-[#56B949] rounded-lg font-medium hover:bg-[#56B949] hover:text-white transition-all duration-300"
                            >
                                {t('success.continueFeedback')}
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <BackButton fallbackUrl={`/${locale}`} />
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-semibold mb-4 border border-[#F0A32F]/20">
                        <MessageSquare className="w-3 h-3" />
                        {t('badge')}
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">{t('title')}</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                {/* 反馈表单 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 反馈类型 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                {t('form.type.label')}
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {feedbackTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${formData.type === type.value
                                            ? 'border-[#56B949] bg-[#56B949]/5'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type.value}
                                            checked={formData.type === type.value}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <span className={`text-sm font-medium ${formData.type === type.value ? type.color : 'text-slate-600'
                                            }`}>
                                            {type.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 满意度评分 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                {t('form.rating.label')}
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingChange(star)}
                                        className={`p-1 transition-colors ${star <= formData.rating
                                            ? 'text-[#F0A32F]'
                                            : 'text-slate-300 hover:text-slate-400'
                                            }`}
                                    >
                                        <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-slate-600">
                                    {formData.rating} {t('form.rating.stars')}
                                </span>
                            </div>
                        </div>

                        {/* 反馈标题 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('form.title.label')}
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder={t('form.title.placeholder')}
                                required
                            />
                        </div>

                        {/* 详细内容 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('form.content.label')}
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                placeholder={t('form.content.placeholder')}
                                required
                            />
                        </div>

                        {/* 联系方式 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('form.contact.label')}
                            </label>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                placeholder={t('form.contact.placeholder')}
                            />
                        </div>

                        {/* 匿名选项 */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="anonymous"
                                checked={formData.anonymous}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#56B949] border-slate-300 rounded focus:ring-[#56B949]"
                            />
                            <label className="text-sm text-slate-700">
                                {t('form.anonymous')}
                            </label>
                        </div>

                        {/* 提交按钮 */}
                        <div className="flex gap-4 pt-6 border-t border-slate-200">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Send className="w-4 h-4" />
                                {t('form.submit')}
                            </button>
                            <Link
                                href={`/${locale}`}
                                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                {t('form.cancel')}
                            </Link>
                        </div>
                    </form>
                </div>

                {/* 其他联系方式 */}
                <div className="mt-8 bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 rounded-xl p-6 border border-[#56B949]/20">
                    <h3 className="text-lg font-semibold text-[#30499B] mb-4">{t('otherContact.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <p className="font-medium text-slate-800 mb-1">{t('otherContact.email.title')}</p>
                            <p className="text-slate-600">{t('otherContact.email.address')}</p>
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-slate-800 mb-1">{t('otherContact.phone.title')}</p>
                            <p className="text-slate-600">{t('otherContact.phone.number')}</p>
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-slate-800 mb-1">{t('otherContact.hours.title')}</p>
                            <p className="text-slate-600">{t('otherContact.hours.schedule')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}