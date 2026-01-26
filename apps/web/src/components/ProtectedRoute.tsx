'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  message?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  message
}: ProtectedRouteProps) {
  const { isLoggedIn, loading } = useAuth();
  const params = useParams();
  const locale = params?.locale || 'zh';
  const { t } = useSafeTranslation('common');

  // 构建带 locale 的跳转路径
  const getLocalizedPath = (path: string) => {
    // 如果路径已经包含 locale，直接返回
    if (path.startsWith(`/${locale}/`)) {
      return path;
    }
    // 移除开头的斜杠（如果有）
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/${locale}/${cleanPath}`;
  };

  // 如果还在加载中，显示加载状态
  if (loading) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full border border-white/60 text-center">
          <div className="w-20 h-20 rounded-full bg-[#30499B]/10 flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#30499B]"></div>
          </div>
          <h2 className="text-2xl font-bold text-[#30499B] mb-4">{t('loading', '加载中...')}</h2>
          <p className="text-slate-600">{t('verifyingAuth', '正在验证登录状态')}</p>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录提示
  if (!isLoggedIn) {
    const defaultMessage = t('loginRequired', '请先登录再查看此内容');

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full border border-white/60 text-center">
          <div className="w-20 h-20 rounded-full bg-[#F0A32F]/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-[#F0A32F]" />
          </div>
          <h2 className="text-2xl font-bold text-[#30499B] mb-4">{t('needLogin', '需要登录访问')}</h2>
          <p className="text-slate-600 mb-6">{message || defaultMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = getLocalizedPath('/')}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              {t('backToHome', '返回首页')}
            </button>
            <button
              onClick={() => window.location.href = getLocalizedPath(redirectTo)}
              className="flex-1 py-3 px-4 rounded-lg bg-[#30499B] text-white hover:bg-[#253a7a] transition-colors font-medium"
            >
              {t('loginNow', '立即登录')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果已登录，显示受保护的内容
  return <>{children}</>;
}