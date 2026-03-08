/**
 * Shared API client.
 */

import { BaseResponse, ApiError, UnifiedRequest } from './api-types';
import { authStore } from './auth-store';

const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const RETRY_DELAYS_MS = [250, 600, 1200];

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
  const method = String(options.method || 'GET').toUpperCase();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept-Language': getCurrentLocale(),
    ...options.headers,
  };

  // Pre-emptively refresh if logged in and token is expiring soon
  if (authStore.isAuthenticated() && authStore.isTokenExpiringSoon()) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    try {
      await refreshPromise;
    } catch {
      authStore.clear();
    }
  }

  const accessToken = authStore.getAccessToken();
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchWithRetry = async (): Promise<Response> => {
    const maxAttempts = method === 'GET' || method === 'HEAD' ? 3 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });
        if (attempt < maxAttempts - 1 && RETRYABLE_STATUSES.has(response.status)) {
          await wait(RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]);
          continue;
        }
        return response;
      } catch (error) {
        if (attempt < maxAttempts - 1 && isNetworkFailure(error)) {
          await wait(RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]);
          continue;
        }
        throw new ApiError('Connection to game service failed. Please retry in a moment.');
      }
    }

    throw new ApiError('Connection to game service failed. Please retry in a moment.');
  };

  let response = await fetchWithRetry();

  if (response.status === 401 && authStore.isAuthenticated()) {
    // Logged-in user got 401: try to refresh once
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

      response = await fetchWithRetry();
    } catch (error) {
      authStore.clear();
      if (typeof window !== 'undefined') {
        const locale = getCurrentLocale();
        window.location.href = `/${locale}/login`;
      }
      throw error;
    }
  }

  let result: BaseResponse<T> | null = null;
  try {
    result = await response.json() as BaseResponse<T>;
  } catch {
    if (!response.ok) {
      throw new ApiError(`HTTP_${response.status}`);
    }
    throw new ApiError('Invalid server response');
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      authStore.clear();
      if (typeof window !== 'undefined') {
        const locale = getCurrentLocale();
        window.location.href = `/${locale}/login`;
      }
    }
    throw new ApiError(result?.message || `HTTP_${response.status}`, result?.traceId, result?.errors);
  }

  if (!result || !result.success) {
    if (response.status === 401 || response.status === 403) {
      authStore.clear();
      if (typeof window !== 'undefined') {
        const locale = getCurrentLocale();
        window.location.href = `/${locale}/login`;
      }
    }
    throw new ApiError(result?.message || 'Request failed', result?.traceId, result?.errors);
  }

  return result.data;
}

function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return message.includes('failed to fetch')
    || message.includes('networkerror')
    || message.includes('fetch failed')
    || message.includes('network request failed')
    || message.includes('econnrefused')
    || message.includes('err_connection_refused');
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
