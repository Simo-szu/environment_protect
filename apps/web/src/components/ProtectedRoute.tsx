'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import AuthPromptModal from './auth/AuthPromptModal';

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

  // 如果还在加载中，显示加载状态
  if (loading) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-white/40 backdrop-blur-md">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 mx-4 max-w-sm w-full border border-white/40 text-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#30499B] to-[#56B949] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-8 h-8 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-[#30499B] mb-2">{t('loading', '加载中...')}</h2>
          <p className="text-slate-500 font-medium">{t('verifyingAuth', '正在验证登录状态')}</p>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录提示
  if (!isLoggedIn) {
    return (
      <>
        {/* 背景依然显示原本的 Layout 结构，但被模态框遮盖 */}
        <div className="opacity-50 pointer-events-none filter blur-[2px]">
          {children}
        </div>
        <AuthPromptModal
          isOpen={true}
          message={message}
          redirectTo={redirectTo}
        />
      </>
    );
  }

  // 如果已登录，显示受保护的内容
  return <>{children}</>;
}