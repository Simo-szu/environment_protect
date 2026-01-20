'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  points?: number;
  level?: number;
  contact?: string;
  gender?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的用户信息
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
  };

  const isLoggedIn = !!user;

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
  
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// 显示登录提示的工具函数
export function showLoginPrompt(message: string = '请先登录再查看此内容') {
  if (typeof window === 'undefined') return;
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
      <h3 class="text-lg font-semibold mb-4">需要登录</h3>
      <p class="text-gray-600 mb-6">${message}</p>
      <div class="flex space-x-3">
        <button id="cancel-btn" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          取消
        </button>
        <button id="login-btn" class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          去登录
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
    window.location.href = '/login';
  });

  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}