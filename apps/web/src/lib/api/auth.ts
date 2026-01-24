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
  phone?: string;
}

// 注册请求
export interface RegisterRequest {
  email?: string;
  phone?: string;
  password?: string;
  otpCode?: string;
  nickname?: string;
  agreedToTerms: boolean;
}

// 登录请求
export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
  otpCode?: string;
}

/**
 * 发送邮箱 OTP
 */
export async function sendEmailOtp(email: string): Promise<void> {
  return apiPost<void>('/api/v1/auth/otp/email', { email });
}

/**
 * 发送手机 OTP
 */
export async function sendPhoneOtp(phone: string): Promise<void> {
  return apiPost<void>('/api/v1/auth/otp/phone', { phone });
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
 * 手机注册
 */
export async function registerWithPhone(
  data: RegisterRequest
): Promise<AuthResponse> {
  const result = await apiPost<AuthResponse>(
    '/api/v1/auth/register/phone',
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
  const result = await apiPost<AuthResponse>(
    '/api/v1/auth/login/password',
    data
  );
  authStore.setTokens(result);
  return result;
}

/**
 * OTP 登录
 */
export async function loginWithOtp(data: LoginRequest): Promise<AuthResponse> {
  const result = await apiPost<AuthResponse>('/api/v1/auth/login/otp', data);
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
