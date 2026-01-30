'use client';

import { useState, useEffect } from 'react';
import { authStore } from '@/lib/auth-store';
import { userApi } from '@/lib/api';
import type { UserProfile } from '@/lib/api/user';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查是否已登录
    if (authStore.isAuthenticated()) {
      // 获取用户资料
      userApi
        .getMyProfile()
        .then((profile) => {
          setUser(profile);
        })
        .catch((error) => {
          console.error('Failed to load user profile:', error);
          // 如果获取失败，清除认证状态
          authStore.clear();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // 使用 setTimeout 来避免在 effect 中直接 setState
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  const login = (profile: UserProfile) => {
    setUser(profile);
  };

  const logout = () => {
    setUser(null);
    authStore.clear();
    if (typeof window !== 'undefined') {
      // 获取当前语言路径
      const pathname = window.location.pathname;
      const localeMatch = pathname.match(/^\/(zh|en)(\/|$)/);
      const localePrefix = localeMatch ? `/${localeMatch[1]}` : '/zh';
      window.location.href = `${localePrefix}/login`;
    }
  };

  const updateUser = (updatedData: Partial<UserProfile>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
    }
  };

  const isLoggedIn = !!user && authStore.isAuthenticated();

  return {
    user,
    loading,
    isLoggedIn,
    login,
    logout,
    updateUser,
  };
}

// 检查登录状态的工具函数
export function checkLoginAndRedirect(redirectTo: string = '/login') {
  if (typeof window === 'undefined') return false;

  if (!authStore.isAuthenticated()) {
    // 获取当前语言路径
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(zh|en)(\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '/zh';

    // 如果 redirectTo 已经包含语言前缀,直接使用;否则添加前缀
    const finalRedirectTo = redirectTo.match(/^\/(zh|en)\//)
      ? redirectTo
      : `${localePrefix}${redirectTo}`;

    window.location.href = finalRedirectTo;
    return false;
  }
  return true;
}

// 显示登录提示的工具函数
// 显示登录提示的工具函数
export function showLoginPrompt(message?: string) {
  if (typeof window === 'undefined') return;

  // 获取当前语言路径
  const getLocalePrefix = () => {
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(zh|en)(\/|$)/);
    return localeMatch ? `/${localeMatch[1]}` : '/zh';
  };

  const localePrefix = getLocalePrefix();
  const locale = (localePrefix.replace('/', '') || 'zh') as 'zh' | 'en';

  const translations = {
    zh: {
      title: '需要登录',
      cancel: '取消',
      login: '去登录',
      defaultMessage: '请先登录再查看此内容'
    },
    en: {
      title: 'Login Required',
      cancel: 'Cancel',
      login: 'Login',
      defaultMessage: 'Please login first to view this content'
    }
  };

  const t = translations[locale] || translations.zh;
  const finalMessage = message || t.defaultMessage;

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
      <h3 class="text-lg font-semibold mb-4">${t.title}</h3>
      <p class="text-gray-600 mb-6">${finalMessage}</p>
      <div class="flex space-x-3">
        <button id="cancel-btn" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          ${t.cancel}
        </button>
        <button id="login-btn" class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          ${t.login}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cancelBtn = modal.querySelector('#cancel-btn');
  const loginBtn = modal.querySelector('#login-btn');

  cancelBtn?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  loginBtn?.addEventListener('click', () => {
    document.body.removeChild(modal);
    const localePrefix = getLocalePrefix();
    window.location.href = `${localePrefix}/login`;
  });

  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}