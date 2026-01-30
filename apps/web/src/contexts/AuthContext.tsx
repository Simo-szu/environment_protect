'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authStore } from '@/lib/auth-store';
import { userApi } from '@/lib/api';
import type { UserProfile } from '@/lib/api/user';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 加载用户资料
  const loadProfile = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      setUser(null);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      const profile = await userApi.getMyProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      authStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // 初始化时加载
  useEffect(() => {
    if (!isInitialized) {
      loadProfile();
    }
  }, [isInitialized, loadProfile]);

  const login = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    authStore.clear();
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const localeMatch = pathname.match(/^\/(zh|en)(\/|$)/);
      const localePrefix = localeMatch ? `/${localeMatch[1]}` : '/zh';
      window.location.href = `${localePrefix}/login`;
    }
  }, []);

  const updateUser = useCallback((updatedData: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authStore.isAuthenticated()) return;
    
    try {
      const profile = await userApi.getMyProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, []);

  const isLoggedIn = !!user && authStore.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        login,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 工具函数保持不变
export function checkLoginAndRedirect(redirectTo: string = '/login') {
  if (typeof window === 'undefined') return false;

  if (!authStore.isAuthenticated()) {
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(zh|en)(\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '/zh';
    const finalRedirectTo = redirectTo.match(/^\/(zh|en)\//)
      ? redirectTo
      : `${localePrefix}${redirectTo}`;
    window.location.href = finalRedirectTo;
    return false;
  }
  return true;
}

export function showLoginPrompt(message?: string) {
  if (typeof window === 'undefined') return;

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

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}
