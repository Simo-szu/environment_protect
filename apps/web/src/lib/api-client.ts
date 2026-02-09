/**
 * Shared API client.
 */

import { BaseResponse, ApiError, UnifiedRequest } from './api-types';
import { authStore } from './auth-store';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

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

  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh token');
  }

  authStore.setTokens(result.data);
}

export function getCurrentLocale(): string {
  if (typeof window === 'undefined') {
    return 'zh';
  }

  const pathname = window.location.pathname;
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  return match ? match[1] : 'zh';
}

export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept-Language': getCurrentLocale(),
    ...options.headers,
  };

  const accessToken = authStore.getAccessToken();
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || authStore.isTokenExpiringSoon()) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;

      const newAccessToken = authStore.getAccessToken();
      if (newAccessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
      }

      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      authStore.clear();
      if (typeof window !== 'undefined') {
        const locale = getCurrentLocale();
        window.location.href = `/${locale}/login`;
      }
      throw error;
    }
  }

  const result: BaseResponse<T> = await response.json();

  if (!result.success) {
    if (response.status === 401 || response.status === 403) {
      authStore.clear();
      if (typeof window !== 'undefined') {
        const locale = getCurrentLocale();
        window.location.href = `/${locale}/login`;
      }
    }
    throw new ApiError(result.message || 'Request failed', result.traceId, result.errors);
  }

  return result.data;
}

export function wrapRequest<T>(
  data: T,
  needRequestId: boolean = false
): UnifiedRequest<T> {
  return {
    requestId: needRequestId ? generateUUID() : undefined,
    data,
  };
}

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
