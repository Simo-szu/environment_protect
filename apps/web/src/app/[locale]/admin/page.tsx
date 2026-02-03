'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    Shield,
    FileText,
    Calendar,
    MessageSquare,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    ArrowLeft
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function AdminPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('admin');

    const [activeTab, setActiveTab] = useState<'activities' | 'contents' | 'comments'>('activities');

    // 模拟待审核数据
    const pendingActivities = [
        {
            id: '1',
            title: '深圳湾红树林生态保护志愿活动',
            author: '张三',
            authorId: 'user123',
            submittedAt: '2026-02-03 10:30',
            category: '环保活动',
            status: 'pending'
        },
        {
            id: '2',
            title: '社区垃圾分类宣传活动',
            author: '李四',
            authorId: 'user456',
            submittedAt: '2026-02-03 09:15',
            category: '社区活动',
            status: 'pending'
        }
    ];

    const pendingContents = [
        {
            id: '1',
            title: '碳中和目标下的城市绿色转型',
            author: '王五',
            authorId: 'user789',
            submittedAt: '2026-02-03 11:20',
            type: '科普文章',
            status: 'pending'
        }
    ];

    const pendingComments = [
        {
            id: '1',
            content: '这个活动很有意义，我想参加！',
            author: '赵六',
            authorId: 'user101',
            targetTitle: '深圳湾红树林生态保护志愿活动',
            submittedAt: '2026-02-03 12:00',
            status: 'pending'
        }
    ];

    const handleApprove = (type: string, id: string) => {
        console.log(`Approving ${type} with id: ${id}`);
        // TODO: 调用后端 API 审核通过
    };

    const handleReject = (type: string, id: string) => {
        console.log(`Rejecting ${type} with id: ${id}`);
        // TODO: 调用后端 API 审核拒绝
    };

    const handleView = (type: string, id: string) => {
        console.log(`Viewing ${type} with id: ${id}`);
        // TODO: 跳转到详情页面
    };

    return (
        <Layout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* 页面头部 */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push(`/${locale}/profile`)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-[#30499B]">
                                {t('title', '开发者后台管理')}
                            </h1>
                            <p className="text-slate-600">
                                {t('subtitle', '审核和管理平台内容')}
                            </p>
                        </div>
                    </div>
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
                            <span className="text-2xl font-bold text-blue-600">{pendingActivities.length}</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">{t('pendingActivities', '待审核活动')}</h3>
                    </motion.div>

                    <motion.div variants={staggerItem} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold text-green-600">{pendingContents.length}</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">{t('pendingContents', '待审核文章')}</h3>
                    </motion.div>

                    <motion.div variants={staggerItem} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-2xl font-bold text-orange-600">{pendingComments.length}</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">{t('pendingComments', '待审核评论')}</h3>
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
                        {t('activities', '活动审核')}
                    </button>
                    <button
                        onClick={() => setActiveTab('contents')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'contents'
                                ? 'bg-[#30499B] text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        {t('contents', '文章审核')}
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'comments'
                                ? 'bg-[#30499B] text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        {t('comments', '评论审核')}
                    </button>
                </div>

                {/* 内容区域 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    {/* 活动审核 */}
                    {activeTab === 'activities' && (
                        <div className="divide-y divide-slate-200">
                            {pendingActivities.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('noActivities', '暂无待审核活动')}</p>
                                </div>
                            ) : (
                                pendingActivities.map((activity) => (
                                    <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                                    {activity.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {activity.author}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {activity.submittedAt}
                                                    </span>
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                                                        {activity.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView('activity', activity.id)}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title={t('view', '查看详情')}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove('activity', activity.id)}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {t('approve', '通过')}
                                                </button>
                                                <button
                                                    onClick={() => handleReject('activity', activity.id)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {t('reject', '拒绝')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 文章审核 */}
                    {activeTab === 'contents' && (
                        <div className="divide-y divide-slate-200">
                            {pendingContents.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('noContents', '暂无待审核文章')}</p>
                                </div>
                            ) : (
                                pendingContents.map((content) => (
                                    <div key={content.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                                    {content.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {content.author}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {content.submittedAt}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
                                                        {content.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView('content', content.id)}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title={t('view', '查看详情')}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove('content', content.id)}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {t('approve', '通过')}
                                                </button>
                                                <button
                                                    onClick={() => handleReject('content', content.id)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {t('reject', '拒绝')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 评论审核 */}
                    {activeTab === 'comments' && (
                        <div className="divide-y divide-slate-200">
                            {pendingComments.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('noComments', '暂无待审核评论')}</p>
                                </div>
                            ) : (
                                pendingComments.map((comment) => (
                                    <div key={comment.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-slate-800 mb-2">{comment.content}</p>
                                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {comment.author}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {comment.submittedAt}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    评论于: {comment.targetTitle}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove('comment', comment.id)}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {t('approve', '通过')}
                                                </button>
                                                <button
                                                    onClick={() => handleReject('comment', comment.id)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {t('reject', '拒绝')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </Layout>
    );
}
