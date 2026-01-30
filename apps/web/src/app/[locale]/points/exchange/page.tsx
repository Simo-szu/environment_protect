'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Coins,
    ShoppingBag,
    Star,
    CheckCircle2,
    XCircle,
    Info,
    ArrowRight
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { pointsApi } from '@/lib/api';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

interface Good {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    pointsCost: number;
    stock: number;
    status: number;
}

export default function ExchangeStorePage() {
    const { t, locale } = useSafeTranslation('points');
    const router = useRouter();
    const params = useParams();

    const [goods, setGoods] = useState<Good[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPoints, setUserPoints] = useState(0);
    const [exchanging, setExchanging] = useState<string | null>(null);
    const [modal, setModal] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [goodsData, accountData] = await Promise.all([
                    pointsApi.getExchangeGoods(),
                    pointsApi.getPointsAccount()
                ]);
                setGoods(goodsData);
                setUserPoints(accountData.availablePoints);
            } catch (error) {
                console.error('Failed to load store data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleExchange = async (good: Good) => {
        if (userPoints < good.pointsCost) {
            setModal({ type: 'error', message: t('exchange.insufficient', '积分不足') });
            return;
        }

        try {
            setExchanging(good.id);
            await pointsApi.exchangeGood(good.id);
            setModal({ type: 'success', message: t('exchange.success', '兑换成功！') });

            // Refresh account balance
            const accountData = await pointsApi.getPointsAccount();
            setUserPoints(accountData.availablePoints);

            // Update stock locally
            setGoods(prev => prev.map(g => g.id === good.id ? { ...g, stock: g.stock - 1 } : g));

        } catch (error: any) {
            setModal({ type: 'error', message: error.message || t('exchange.failed', '兑换失败') });
        } finally {
            setExchanging(null);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push(`/${locale}/points`)}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-[#30499B] font-serif">
                                    {t('exchange.title', '兑换商城')}
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    {t('exchange.subtitle', '用您的积分换取精美环保礼品')}
                                </p>
                            </div>
                        </div>

                        {/* Points Display Card */}
                        <div className="bg-gradient-to-br from-[#F0A32F] to-[#ee9511] p-0.5 rounded-2xl shadow-lg shadow-[#F0A32F]/20 self-start md:self-auto">
                            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-[0.9rem] flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#F0A32F]/10 flex items-center justify-center text-[#F0A32F]">
                                    <Coins className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{t('exchange.availablePoints', '可用积分')}</div>
                                    <div className="text-2xl font-black text-[#F0A32F] tabular-nums">{userPoints}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-3xl border border-slate-100 p-4 h-80 animate-pulse">
                                    <div className="bg-slate-100 rounded-2xl h-40 mb-4" />
                                    <div className="h-6 bg-slate-100 rounded w-2/3 mb-2" />
                                    <div className="h-4 bg-slate-100 rounded w-full mb-4" />
                                    <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {goods.map((good) => (
                                <motion.div
                                    key={good.id}
                                    variants={staggerItem}
                                    className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#30499B]/5 transition-all duration-500 overflow-hidden flex flex-col"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={good.imageUrl || 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=400'}
                                            alt={good.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#F0A32F] flex items-center gap-1.5 shadow-sm">
                                                <Coins className="w-3.5 h-3.5" />
                                                {good.pointsCost}
                                            </div>
                                        </div>
                                        {good.stock <= 5 && good.stock > 0 && (
                                            <div className="absolute top-4 right-4 animate-bounce">
                                                <div className="bg-[#EE4035] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase ring-4 ring-[#EE4035]/20">
                                                    Limited
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-[#30499B] mb-2 group-hover:text-[#56B949] transition-colors">
                                            {good.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-grow">
                                            {good.description}
                                        </p>

                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold text-slate-400">
                                                {t('exchange.stock', '库存: {count}', { count: good.stock })}
                                            </span>
                                            {good.stock === 0 && (
                                                <span className="text-xs font-bold text-[#EE4035] uppercase italic">Sold Out</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleExchange(good)}
                                            disabled={good.stock === 0 || exchanging !== null}
                                            className={`
                                                w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                                                ${good.stock > 0
                                                    ? 'bg-[#56B949] text-white shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] hover:-translate-y-1 active:scale-95'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            {exchanging === good.id ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <ShoppingBag className="w-5 h-5" />
                                                    {t('exchange.exchange', '立即兑换')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Modal Overlay */}
                <AnimatePresence>
                    {modal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setModal(null)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 text-center overflow-hidden"
                            >
                                {/* Modal Background Decoration */}
                                <div className={`absolute top-0 left-0 w-full h-2 ${modal.type === 'success' ? 'bg-[#56B949]' : 'bg-[#EE4035]'}`} />

                                <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${modal.type === 'success' ? 'bg-green-50 text-[#56B949]' : 'bg-red-50 text-[#EE4035]'}`}>
                                    {modal.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                    {modal.type === 'success' ? t('exchange.success', '兑换成功！') : t('exchange.failed', '兑换失败')}
                                </h3>
                                <p className="text-slate-500 mb-8">
                                    {modal.message}
                                </p>
                                <button
                                    onClick={() => setModal(null)}
                                    className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    {t('common.confirm', '我知道了')}
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Layout>
        </ProtectedRoute>
    );
}
