'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Coins,
    TrendingUp,
    TrendingDown,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { pointsApi } from '@/lib/api';
import type { PointsLedger } from '@/lib/api/points';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function PointsHistoryPage() {
    const { t, locale } = useSafeTranslation('points');
    const router = useRouter();
    const params = useParams();

    const [history, setHistory] = useState<PointsLedger[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const size = 20;

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                const response = await pointsApi.getPointsLedger({ page, size });
                setHistory(response.items);
                setTotal(response.total);
            } catch (error) {
                console.error('Failed to load points history:', error);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [page]);

    const getReasonIcon = (amount: number) => {
        return amount > 0 ? (
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <TrendingUp className="w-5 h-5" />
            </div>
        ) : (
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <TrendingDown className="w-5 h-5" />
            </div>
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#30499B] font-serif">
                                    {t('history.title', '积分记录')}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {t('history.subtitle', '查看您的积分获取与消耗明细')}
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F0A32F]/10 text-[#F0A32F] rounded-xl border border-[#F0A32F]/20">
                            <Coins className="w-5 h-5" />
                            <span className="font-bold">Total: {total}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-4"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12 border-4 border-[#30499B]/20 border-t-[#30499B] rounded-full animate-spin"></div>
                                <p className="text-slate-400 text-sm animate-pulse">{t('common.loading', '加载中...')}</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <TrendingUp className="w-10 h-10" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-400">{t('history.empty', '暂无记录')}</h3>
                                <Link href={`/${locale}/points`}>
                                    <button className="mt-4 px-6 py-2 bg-[#30499B] text-white rounded-full text-sm font-semibold hover:bg-[#253a7a] transition-all">
                                        {t('subtitle.earnPoints', '去赚积分')}
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="divide-y divide-slate-50">
                                    {history.map((record) => (
                                        <motion.div
                                            key={record.id}
                                            variants={staggerItem}
                                            className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getReasonIcon(record.amount)}
                                                <div>
                                                    <div className="font-semibold text-[#30499B]">
                                                        {record.reason || t('history.type.other', '其他')}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(record.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-bold flex items-center justify-end gap-1 ${record.amount > 0 ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                                    {record.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                    {record.amount > 0 ? '+' : ''}{record.amount}
                                                </div>
                                                {record.balance !== undefined && (
                                                    <div className="text-[10px] text-slate-300 mt-1">
                                                        {t('history.balance', '余额')}: {record.balance}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {total > size && (
                                    <div className="p-4 border-t border-slate-50 flex items-center justify-center gap-4">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-all"
                                        >
                                            {t('pagination.previous', '上一页')}
                                        </button>
                                        <span className="text-sm text-slate-500 font-medium">
                                            {page} / {Math.ceil(total / size)}
                                        </span>
                                        <button
                                            disabled={page * size >= total}
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-all"
                                        >
                                            {t('pagination.next', '下一页')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
