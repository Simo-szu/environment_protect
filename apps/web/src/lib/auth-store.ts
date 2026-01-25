/**
 * 认证状态管理
 */

import { AuthState, AuthTokens } from './api-types';

const TOKEN_KEY = 'auth_tokens';

class AuthStore {
  private state: AuthState = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  // 从 localStorage 加载
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load auth tokens:', error);
      this.clear();
    }
  }

  // 保存到 localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
    }
  }

  // 设置 tokens
  setTokens(tokens: AuthTokens) {
    const now = Date.now();
    this.state = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: now + tokens.expiresIn * 1000, // 转换为毫秒
    };
    this.saveToStorage();
  }

  // 获取 accessToken
  getAccessToken(): string | null {
    return this.state.accessToken;
  }

  // 获取 refreshToken
  getRefreshToken(): string | null {
    return this.state.refreshToken;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.state.accessToken;
  }

  // 检查 token 是否即将过期（提前 5 分钟）
  isTokenExpiringSoon(): boolean {
    if (!this.state.expiresAt) return false;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return this.state.expiresAt - now < fiveMinutes;
  }

  // 清除 tokens
  clear() {
    this.state = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}

// 单例
export const authStore = new AuthStore();
