'use client';

import { useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import Layout from '@/components/Layout';

interface PageGuardProps {
    children: ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
    fallback?: ReactNode;
}

export default function PageGuard({
    children,
    requireAuth = false,
    redirectTo = '/login',
    fallback
}: PageGuardProps) {
    const { user, isLoggedIn, loading } = useAuth();
    const { error, clearError } = useErrorBoundary();
    const params = useParams();
    const locale = params?.locale || 'zh';

    useEffect(() => {
        if (requireAuth && !loading && (!user || !isLoggedIn)) {
            // 确保重定向路径包含语言前缀
            const localizedRedirectTo = redirectTo.startsWith('/') && !redirectTo.startsWith(`/${locale}`)
                ? `/${locale}${redirectTo}`
                : redirectTo;
            window.location.href = localizedRedirectTo;
        }
    }, [user, isLoggedIn, loading, requireAuth, redirectTo, locale]);

    // 显示加载状态
    if (loading) {
        return (
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
        );
    }

    // 显示错误状态
    if (error) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EE4035] to-[#d63384] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4">
                            !
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">出现了一些问题</h2>
                        <p className="text-slate-600 mb-4">{error.message}</p>
                        <button
                            onClick={clearError}
                            className="px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            重试
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // 检查认证要求
    if (requireAuth && (!user || !isLoggedIn)) {
        return fallback || (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">跳转到登录页面...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return <>{children}</>;
}