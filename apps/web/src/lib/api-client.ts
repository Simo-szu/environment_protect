/**
 * API 客户端封装
 */

import { BaseResponse, ApiError, UnifiedRequest } from './api-types';
import { authStore } from './auth-store';

// 生成 UUID（用于 requestId）
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 刷新 token 的 Promise（防止并发刷新）
let refreshPromise: Promise<void> | null = null;

// 刷新 token
async function refreshAccessToken(): Promise<void> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch('/api/v1/auth/token/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { refreshToken },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const result: BaseResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message);
    }

    // 更新 tokens
    authStore.setTokens(result.data);
  } catch (error) {
    // 刷新失败，清除 tokens 并跳转登录
    authStore.clear();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  }
}

/**
 * 统一的 API 请求方法
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // 准备请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 如果已登录，添加 Authorization
  const accessToken = authStore.getAccessToken();
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  // 发送请求
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // 处理 401 或 token 过期
  if (response.status === 401 || authStore.isTokenExpiringSoon()) {
    // 尝试刷新 token（防止并发刷新）
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;

      // 重试原请求
      const newAccessToken = authStore.getAccessToken();
      if (newAccessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
      }

      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // 刷新失败，已在 refreshAccessToken 中处理
      throw error;
    }
  }

  // 解析响应
  const result: BaseResponse<T> = await response.json();

  // 检查业务错误码
  if (result.code !== 0) {
    // 特殊处理认证错误
    if (result.code === 2000 || result.code === 2001 || result.code === 2002) {
      authStore.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    throw new ApiError(result.code, result.message, result.traceId);
  }

  return result.data;
}

/**
 * 包装请求体为 UnifiedRequest（用于写接口）
 */
export function wrapRequest<T>(
  data: T,
  needRequestId: boolean = false
): UnifiedRequest<T> {
  return {
    requestId: needRequestId ? generateUUID() : undefined,
    data,
  };
}

/**
 * GET 请求
 */
export async function apiGet<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T> {
  const queryString = params
    ? '?' +
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    : '';

  return apiFetch<T>(url + queryString, {
    method: 'GET',
  });
}

/**
 * POST 请求
 */
export async function apiPost<T = any>(
  url: string,
  data: any,
  needRequestId: boolean = false
): Promise<T> {
  return apiFetch<T>(url, {
    method: 'POST',
    body: JSON.stringify(wrapRequest(data, needRequestId)),
  });
}

/**
 * PUT 请求
 */
export async function apiPut<T = any>(
  url: string,
  data: any,
  needRequestId: boolean = false
): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PUT',
    body: JSON.stringify(wrapRequest(data, needRequestId)),
  });
}

/**
 * PATCH 请求
 */
export async function apiPatch<T = any>(
  url: string,
  data: any,
  needRequestId: boolean = false
): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(wrapRequest(data, needRequestId)),
  });
}

/**
 * DELETE 请求（带 body）
 */
export async function apiDelete<T = any>(
  url: string,
  data?: any,
  needRequestId: boolean = false
): Promise<T> {
  const options: RequestInit = {
    method: 'DELETE',
  };

  if (data) {
    options.body = JSON.stringify(wrapRequest(data, needRequestId));
  }

  return apiFetch<T>(url, options);
}
