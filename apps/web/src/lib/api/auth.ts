/**
 * 认证相关 API
 */

import { apiPost } from '../api-client';
import { authStore } from '../auth-store';

// 认证响应
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 发送 OTP 请求
export interface SendOtpRequest {
  email?: string;

  purpose: 'register' | 'login' | 'reset_password';
}

// 注册请求
export interface RegisterRequest {
  email?: string;

  password?: string;
  otpCode?: string;
  nickname?: string;
  agreedToTerms: boolean;
}

// 登录请求
export interface LoginRequest {
  email?: string;

  password?: string;
  otpCode?: string;
}

/**
 * 发送邮箱 OTP
 */
export async function sendEmailOtp(email: string, purpose: 'register' | 'login' | 'reset_password' = 'register'): Promise<void> {
  return apiPost<void>('/api/v1/auth/otp/email', { email, purpose });
}



/**
 * 邮箱注册
 */
export async function registerWithEmail(
  data: RegisterRequest
): Promise<AuthResponse> {
  const result = await apiPost<AuthResponse>(
    '/api/v1/auth/register/email',
    data
  );
  authStore.setTokens(result);
  return result;
}



/**
 * 密码登录
 */
export async function loginWithPassword(
  data: LoginRequest
): Promise<AuthResponse> {
  const account = data.email || '';
  const result = await apiPost<AuthResponse>(
    '/api/v1/auth/login/password',
    {
      account,
      password: data.password
    }
  );
  authStore.setTokens(result);
  return result;
}

/**
 * Google 登录 (Exchange ID Token)
 */
export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const result = await apiPost<AuthResponse>('/api/v1/auth/login/google', { idToken });
  authStore.setTokens(result);
  return result;
}


/**
 * OTP 登录（邮箱）
 */
export async function loginWithEmailOtp(data: LoginRequest): Promise<AuthResponse> {
  const result = await apiPost<AuthResponse>('/api/v1/auth/login/otp/email', {
    email: data.email,
    otp: data.otpCode,
  });
  authStore.setTokens(result);
  return result;
}



/**
 * 登出
 */
export async function logout(): Promise<void> {
  authStore.clear();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
