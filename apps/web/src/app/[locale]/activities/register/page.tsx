'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
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
import { activityApi } from '@/lib/api';
import type { ActivityDetail, ActivitySession } from '@/lib/api/activity';

function RegisterActivityContent() {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('activities');
    const { t: tCommon } = useSafeTranslation('common');
    const activityId = searchParams.get('id');

    // 状态管理
    const [activity, setActivity] = useState<ActivityDetail | null>(null);
    const [sessions, setSessions] = useState<ActivitySession[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        remarks: '',
        agreement: false
    });

    // 加载活动数据
    useEffect(() => {
        if (!activityId) {
            router.push(`/${locale}/activities`);
            return;
        }

        const loadActivityData = async () => {
            try {
                setLoadingActivity(true);
                const [activityData, sessionsData] = await Promise.all([
                    activityApi.getActivityDetail(activityId),
                    activityApi.getActivitySessions(activityId).catch(() => [])
                ]);

                setActivity(activityData);
                setSessions(sessionsData);
                
                // 如果只有一个场次，自动选中
                if (sessionsData.length === 1) {
                    setSelectedSession(sessionsData[0].id);
                }
            } catch (error) {
                console.error('Failed to load activity:', error);
                alert('加载活动信息失败');
                router.push(`/${locale}/activities`);
            } finally {
                setLoadingActivity(false);
            }
        };

        loadActivityData();
    }, [activityId, router, locale]);

    // 自动填充用户信息
    useEffect(() => {
        if (user && isLoggedIn) {
            setFormData(prev => ({
                ...prev,
                name: user.nickname || ''
                // email 和 phone 需要用户手动填写
            }));
        }
    }, [user, isLoggedIn]);

    if (loading || loadingActivity) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">{t('register.loading', '加载中...')}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!activity) {
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

    const handleSubmit = async () => {
        // 验证必填字段
        if (!formData.name.trim()) {
            alert('请填写姓名');
            return;
        }

        if (!formData.phone.trim()) {
            alert('请填写手机号');
            return;
        }

        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert('请填写正确的手机号');
            return;
        }

        // 如果是游客，必须填写邮箱
        if (!isLoggedIn && !formData.email.trim()) {
            alert('游客报名需要填写邮箱');
            return;
        }

        // 如果有场次，必须选择场次
        if (sessions.length > 0 && !selectedSession) {
            alert('请选择活动场次');
            return;
        }

        if (!formData.agreement) {
            alert(t('register.form.agreementRequired', '请先同意活动协议'));
            return;
        }

        try {
            setSubmitting(true);

            // 调用报名 API
            const result = await activityApi.signupActivity(activityId!, {
                sessionId: selectedSession || undefined,
                realName: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                guestEmail: !isLoggedIn ? formData.email : undefined, // 游客使用邮箱
            });

            alert('报名成功！');
            
            // 跳转到我的活动页面或活动详情页
            if (isLoggedIn) {
                router.push(`/${locale}/my-activities`);
            } else {
                router.push(`/${locale}/activities/${activityId}`);
            }
        } catch (error: any) {
            console.error('Failed to signup:', error);
            alert(error.message || '报名失败，请重试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${locale}/activities/${activityId}`);
    };

    const getTypeIcon = (type?: string) => {
        return <TreePine className="w-6 h-6 text-[#56B949]" />;
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
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">{t('register.title', '活动报名')}</h1>
                            <p className="text-slate-600">{t('register.subtitle', '填写报名信息参与活动')}</p>
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
                                {getTypeIcon(activity.type)}
                                <h3 className="font-semibold text-[#30499B]">活动信息</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">{activity.title}</h4>
                                    <p className="text-sm text-slate-600 line-clamp-3">{activity.summary || activity.description}</p>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(activity.startTime).toLocaleString('zh-CN')}</span>
                                    </div>
                                    {activity.location && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{activity.location}</span>
                                        </div>
                                    )}
                                    {activity.maxParticipants && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Users className="w-4 h-4" />
                                            <span>{activity.currentParticipants}/{activity.maxParticipants} 人</span>
                                        </div>
                                    )}
                                </div>

                                {activity.organizerName && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-xs text-slate-500 mb-2">主办方</p>
                                        <p className="text-sm font-medium text-slate-700">{activity.organizerName}</p>
                                    </div>
                                )}

                                {/* 场次选择 */}
                                {sessions.length > 0 && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-xs text-slate-500 mb-2">选择场次 *</p>
                                        <div className="space-y-2">
                                            {sessions.map((session) => (
                                                <label
                                                    key={session.id}
                                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                                        selectedSession === session.id
                                                            ? 'border-[#56B949] bg-[#56B949]/5'
                                                            : 'border-slate-200 hover:border-[#56B949]/50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="session"
                                                        value={session.id}
                                                        checked={selectedSession === session.id}
                                                        onChange={(e) => setSelectedSession(e.target.value)}
                                                        className="mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-slate-800">{session.sessionName}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {new Date(session.startTime).toLocaleString('zh-CN')}
                                                        </p>
                                                        {session.maxParticipants && (
                                                            <p className="text-xs text-slate-500">
                                                                {session.currentParticipants}/{session.maxParticipants} 人
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Registration Form */}
                    <motion.div
                        variants={staggerItem}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                            <h3 className="text-xl font-semibold text-[#30499B] mb-6">{t('register.form.title', '报名信息')}</h3>

                            <div className="space-y-6">
                                {/* 基本信息 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            {t('register.form.name', '姓名')} *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder={t('register.form.namePlaceholder', '请输入真实姓名')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            {t('register.form.phone', '联系电话')} *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder={t('register.form.phonePlaceholder', '请输入手机号码')}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 邮箱 */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        邮箱地址 {!isLoggedIn && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                        placeholder={isLoggedIn ? "选填" : "游客报名必填邮箱"}
                                        required={!isLoggedIn}
                                    />
                                    {!isLoggedIn && (
                                        <p className="text-xs text-slate-500 mt-1">游客报名需要提供邮箱以接收活动通知</p>
                                    )}
                                </div>

                                {/* 备注 */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        备注信息
                                    </label>
                                    <textarea
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                        placeholder={t('register.form.specialRequirementsPlaceholder', '如有特殊需求或其他需要说明的情况，请在此填写...')}
                                    />
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
                                            {t('register.form.agreementText', '我已阅读并同意活动相关协议，了解活动风险，自愿参与此次环保活动。')}
                                        </p>
                                        <p className="text-slate-500 mt-1">
                                            {t('register.form.agreementNote', '参与活动期间请遵守组织方安排，注意人身安全。')}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6 border-t border-slate-200">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!formData.agreement || submitting}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                提交中...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                确认报名
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={submitting}
                                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {tCommon('cancel', '取消')}
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
