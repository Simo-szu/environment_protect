'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Edit,
    Trash2,
    ArrowLeft,
    Plus,
    MapPin,
    UserCheck
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function HostActivitiesPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('host');

    const [activeTab, setActiveTab] = useState<'activities' | 'signups'>('activities');
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

    // 模拟我发布的活动数据
    const myActivities = [
        {
            id: '1',
            title: '深圳湾红树林生态保护志愿活动',
            startTime: '2026-02-10 09:00',
            location: '深圳湾公园',
            status: 'published',
            signupCount: 15,
            maxParticipants: 30,
            pendingSignups: 5
        },
        {
            id: '2',
            title: '社区垃圾分类宣传活动',
            startTime: '2026-02-15 14:00',
            location: '南山区科技园社区',
            status: 'pending',
            signupCount: 0,
            maxParticipants: 20,
            pendingSignups: 0
        }
    ];

    // 模拟报名数据
    const signups = [
        {
            id: '1',
            activityId: '1',
            activityTitle: '深圳湾红树林生态保护志愿活动',
            userName: '张三',
            userId: 'user123',
            phone: '138****5678',
            email: 'zhang***@example.com',
            appliedAt: '2026-02-03 10:30',
            status: 'pending',
            note: '我对环保很感兴趣，希望能参加这次活动'
        },
        {
            id: '2',
            activityId: '1',
            activityTitle: '深圳湾红树林生态保护志愿活动',
            userName: '李四',
            userId: 'user456',
            phone: '139****1234',
            email: 'li***@example.com',
            appliedAt: '2026-02-03 11:15',
            status: 'pending',
            note: ''
        },
        {
            id: '3',
            activityId: '1',
            activityTitle: '深圳湾红树林生态保护志愿活动',
            userName: '王五',
            userId: 'user789',
            phone: '136****9876',
            email: 'wang***@example.com',
            appliedAt: '2026-02-03 09:45',
            status: 'approved',
            note: '有过类似活动经验'
        }
    ];

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            published: { text: t('published', '已发布'), color: 'bg-green-50 text-green-600' },
            pending: { text: t('pending', '审核中'), color: 'bg-yellow-50 text-yellow-600' },
            rejected: { text: t('rejected', '已拒绝'), color: 'bg-red-50 text-red-600' },
            approved: { text: t('approved', '已通过'), color: 'bg-blue-50 text-blue-600' }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{config.text}</span>;
    };

    const handleApproveSignup = (signupId: string) => {
        console.log(`Approving signup: ${signupId}`);
        // TODO: 调用后端 API 审核通过报名
    };

    const handleRejectSignup = (signupId: string) => {
        console.log(`Rejecting signup: ${signupId}`);
        // TODO: 调用后端 API 拒绝报名
    };

    const handleEditActivity = (activityId: string) => {
        router.push(`/${locale}/activities/${activityId}/edit`);
    };

    const handleDeleteActivity = (activityId: string) => {
        if (confirm(t('confirmDelete', '确定要删除这个活动吗？'))) {
            console.log(`Deleting activity: ${activityId}`);
            // TODO: 调用后端 API 删除活动
        }
    };

    const handleViewActivity = (activityId: string) => {
        router.push(`/${locale}/activities/${activityId}`);
    };

    const filteredSignups = selectedActivity
        ? signups.filter(s => s.activityId === selectedActivity)
        : signups;

    return (
        <Layout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* 页面头部 */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/${locale}/profile`)}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-[#30499B]">
                                    {t('title', '活动管理')}
                                </h1>
                                <p className="text-slate-600">
                                    {t('subtitle', '管理我发布的活动和报名审批')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/${locale}/activities/create`)}
                        className="px-4 py-2 bg-[#30499B] hover:bg-[#253a7a] text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {t('createActivity', '发布新活动')}
                    </button>
                </div>

                {/* 统计卡片 */}
                <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <motion.div variants={staggerItem} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{myActivities.length}</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">{t('totalActivities', '发布的活动')}</h3>
                    </motion.div>

                    <motion.div variants={staggerItem} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold text-green-600">
                                {myActivities.reduce((sum, a) => sum + a.signupCount, 0)}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">{t('totalSignups', '总报名人数')}</h3>
                    </motion.div>

                    <motion.div variants={staggerItem} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-2xl font-bold text-orange-600">
                                {signups.filter(s => s.status === 'pending').length}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">{t('pendingSignups', '待审核报名')}</h3>
                    </motion.div>
                </motion.div>

                {/* 标签切换 */}
                <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm mb-6 flex gap-2">
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'activities'
                                ? 'bg-[#30499B] text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {t('myActivities', '我的活动')}
                    </button>
                    <button
                        onClick={() => setActiveTab('signups')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'signups'
                                ? 'bg-[#30499B] text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <UserCheck className="w-4 h-4 inline mr-2" />
                        {t('signupManagement', '报名管理')}
                    </button>
                </div>

                {/* 内容区域 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    {/* 我的活动 */}
                    {activeTab === 'activities' && (
                        <div className="divide-y divide-slate-200">
                            {myActivities.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('noActivities', '还没有发布活动')}</p>
                                    <button
                                        onClick={() => router.push(`/${locale}/activities/create`)}
                                        className="mt-4 px-4 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors"
                                    >
                                        {t('createFirst', '发布第一个活动')}
                                    </button>
                                </div>
                            ) : (
                                myActivities.map((activity) => (
                                    <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-slate-800">
                                                        {activity.title}
                                                    </h3>
                                                    {getStatusBadge(activity.status)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {activity.startTime}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {activity.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {activity.signupCount} / {activity.maxParticipants}
                                                    </span>
                                                    {activity.pendingSignups > 0 && (
                                                        <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-full text-xs">
                                                            {activity.pendingSignups} 人待审核
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewActivity(activity.id)}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title={t('view', '查看')}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditActivity(activity.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={t('edit', '编辑')}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteActivity(activity.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={t('delete', '删除')}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 报名管理 */}
                    {activeTab === 'signups' && (
                        <div>
                            {/* 活动筛选 */}
                            <div className="p-4 border-b border-slate-200">
                                <select
                                    value={selectedActivity || ''}
                                    onChange={(e) => setSelectedActivity(e.target.value || null)}
                                    className="w-full md:w-auto px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30499B]/20"
                                >
                                    <option value="">{t('allActivities', '全部活动')}</option>
                                    {myActivities.map((activity) => (
                                        <option key={activity.id} value={activity.id}>
                                            {activity.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="divide-y divide-slate-200">
                                {filteredSignups.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>{t('noSignups', '暂无报名记录')}</p>
                                    </div>
                                ) : (
                                    filteredSignups.map((signup) => (
                                        <div key={signup.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-slate-800">{signup.userName}</h4>
                                                        {getStatusBadge(signup.status)}
                                                    </div>
                                                    <div className="text-sm text-slate-600 space-y-1 mb-2">
                                                        <p>活动: {signup.activityTitle}</p>
                                                        <p>联系方式: {signup.phone} / {signup.email}</p>
                                                        <p>申请时间: {signup.appliedAt}</p>
                                                        {signup.note && (
                                                            <p className="text-slate-500">备注: {signup.note}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {signup.status === 'pending' && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApproveSignup(signup.id)}
                                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            {t('approve', '通过')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectSignup(signup.id)}
                                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            {t('reject', '拒绝')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </Layout>
    );
}
