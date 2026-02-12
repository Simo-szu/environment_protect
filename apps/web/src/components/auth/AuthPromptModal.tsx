'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useClientMounted } from '@/hooks/useClientMounted';

interface AuthPromptModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    message?: string;
    redirectTo?: string;
}

export default function AuthPromptModal({
    isOpen,
    onClose,
    title,
    message,
    redirectTo = '/login'
}: AuthPromptModalProps) {
    const params = useParams();
    const router = useRouter();
    const locale = params?.locale || 'zh';
    const { t } = useSafeTranslation('common');
    const mounted = useClientMounted();

    const getLocalizedPath = (path: string) => {
        if (path.startsWith(`/${locale}/`)) return path;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `/${locale}/${cleanPath}`;
    };

    const handleLogin = () => {
        router.push(getLocalizedPath(redirectTo));
        onClose?.();
    };

    const handleBack = () => {
        router.back();
        onClose?.();
    };

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    {/* Backdrop with enhanced blur and semi-transparency */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-all duration-500"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-slate-800/40 p-8 sm:p-10 max-w-md w-full text-center overflow-hidden group"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#56B949] via-[#F0A32F] to-[#30499B] opacity-50"></div>
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F0A32F]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F0A32F]/20 transition-colors duration-700"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#56B949]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#56B949]/20 transition-colors duration-700"></div>

                        {/* Close button if onClose is provided */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {/* Icon with animated border */}
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#F0A32F]/20 to-[#F0A32F]/5 rounded-full animate-pulse"></div>
                            <div className="absolute inset-2 border-2 border-dashed border-[#F0A32F]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="relative w-full h-full rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center">
                                <Lock className="w-10 h-10 text-[#F0A32F]" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <h2 className="text-3xl font-bold text-[#30499B] dark:text-white mb-4 tracking-tight">
                            {title || t('needLogin', '需要登录访问')}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xs mx-auto text-lg font-medium">
                            {message || t('loginRequired', '请先登录再查看此内容')}
                        </p>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={handleBack}
                                className="w-full py-4 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-bold text-lg hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {t('back', '返回')}
                            </button>
                            <button
                                onClick={handleLogin}
                                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#30499B] to-[#253a7a] text-white shadow-xl shadow-[#30499B]/30 hover:shadow-[#30499B]/40 hover:-translate-y-1 transition-all font-bold text-lg active:scale-[0.98]"
                            >
                                {t('loginNow', '立即登录')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
