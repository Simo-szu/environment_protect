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
    ArrowRight,
    X
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

interface ShippingInfo {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingNote: string;
}

export default function ExchangeStorePage() {
    const { t, locale } = useSafeTranslation('points');
    const router = useRouter();
    const params = useParams();

    const [goods, setGoods] = useState<Good[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPoints, setUserPoints] = useState(0);
    const [exchanging, setExchanging] = useState(false);
    const [selectedGood, setSelectedGood] = useState<Good | null>(null);
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        recipientName: '',
        recipientPhone: '',
        shippingAddress: '',
        shippingNote: ''
    });
    const [formErrors, setFormErrors] = useState<Partial<ShippingInfo>>({});
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
                setUserPoints(accountData.balance);
            } catch (error) {
                console.error('Failed to load store data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleOpenExchangeForm = (good: Good) => {
        if (userPoints < good.pointsCost) {
            setModal({ type: 'error', message: t('exchange.insufficient', '积分不足') });
            return;
        }
        setSelectedGood(good);
        setShippingInfo({
            recipientName: '',
            recipientPhone: '',
            shippingAddress: '',
            shippingNote: ''
        });
        setFormErrors({});
    };

    const validateForm = (): boolean => {
        const errors: Partial<ShippingInfo> = {};
        
        if (!shippingInfo.recipientName.trim()) {
            errors.recipientName = '请输入收货人姓名';
        }
        
        if (!shippingInfo.recipientPhone.trim()) {
            errors.recipientPhone = '请输入手机号';
        } else if (!/^1[3-9]\d{9}$/.test(shippingInfo.recipientPhone)) {
            errors.recipientPhone = '手机号格式不正确';
        }
        
        if (!shippingInfo.shippingAddress.trim()) {
            errors.shippingAddress = '请输入收货地址';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfirmExchange = async () => {
        if (!selectedGood || !validateForm()) {
            return;
        }

        try {
            setExchanging(true);
            await pointsApi.exchangeGood(selectedGood.id, shippingInfo);
            setModal({ type: 'success', message: t('exchange.success', '兑换成功！我们会尽快为您发货') });
            setSelectedGood(null);

            // Refresh account balance
            const accountData = await pointsApi.getPointsAccount();
            setUserPoints(accountData.balance);

            // Update stock locally
            setGoods(prev => prev.map(g => g.id === selectedGood.id ? { ...g, stock: g.stock - 1 } : g));

        } catch (error: any) {
            setModal({ type: 'error', message: error.message || t('exchange.failed', '兑换失败') });
        } finally {
            setExchanging(false);
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
                                            onClick={() => handleOpenExchangeForm(good)}
                                            disabled={good.stock === 0}
                                            className={`
                                                w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                                                ${good.stock > 0
                                                    ? 'bg-[#56B949] text-white shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] hover:-translate-y-1 active:scale-95'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                            {t('exchange.exchange', '立即兑换')}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Shipping Info Form Modal */}
                <AnimatePresence>
                    {selectedGood && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedGood(null)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedGood(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>

                                {/* Header */}
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-[#30499B] mb-2">填写收货信息</h2>
                                    <p className="text-slate-500 text-sm">兑换商品：{selectedGood.title}</p>
                                    <p className="text-[#F0A32F] font-bold text-sm mt-1">消耗积分：{selectedGood.pointsCost}</p>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            收货人姓名 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={shippingInfo.recipientName}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, recipientName: e.target.value })}
                                            placeholder="请输入收货人姓名"
                                            className={`w-full px-4 py-3 rounded-xl border ${formErrors.recipientName ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949]`}
                                        />
                                        {formErrors.recipientName && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.recipientName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            手机号 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={shippingInfo.recipientPhone}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, recipientPhone: e.target.value })}
                                            placeholder="请输入手机号"
                                            className={`w-full px-4 py-3 rounded-xl border ${formErrors.recipientPhone ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949]`}
                                        />
                                        {formErrors.recipientPhone && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.recipientPhone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            收货地址 <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={shippingInfo.shippingAddress}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, shippingAddress: e.target.value })}
                                            placeholder="请输入详细收货地址"
                                            rows={3}
                                            className={`w-full px-4 py-3 rounded-xl border ${formErrors.shippingAddress ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949] resize-none`}
                                        />
                                        {formErrors.shippingAddress && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.shippingAddress}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            备注信息（选填）
                                        </label>
                                        <textarea
                                            value={shippingInfo.shippingNote}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, shippingNote: e.target.value })}
                                            placeholder="如有特殊要求请在此填写"
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949] resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() => setSelectedGood(null)}
                                        disabled={exchanging}
                                        className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleConfirmExchange}
                                        disabled={exchanging}
                                        className="flex-1 py-3.5 rounded-2xl bg-[#56B949] text-white font-bold hover:bg-[#4aa840] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {exchanging ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                确认兑换
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Result Modal */}
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
