'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// 全局缓存存储
const globalCache = new Map<string, CacheEntry<any>>();

interface UseApiCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  cacheTime?: number; // 缓存时间（毫秒），默认5分钟
  enabled?: boolean; // 是否启用请求
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useApiCache<T>({
  key,
  fetcher,
  cacheTime = 5 * 60 * 1000, // 默认5分钟
  enabled = true,
  onSuccess,
  onError,
}: UseApiCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);

  // 检查缓存是否有效
  const getCachedData = useCallback((): T | null => {
    const cached = globalCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cacheTime) {
      globalCache.delete(key);
      return null;
    }

    return cached.data;
  }, [key, cacheTime]);

  // 设置缓存
  const setCachedData = useCallback((newData: T) => {
    globalCache.set(key, {
      data: newData,
      timestamp: Date.now(),
    });
  }, [key]);

  // 执行请求
  const execute = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // 如果不是强制刷新，先检查缓存
    if (!forceRefresh) {
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        setError(null);
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fetcher();

      if (isMountedRef.current) {
        setData(result);
        setCachedData(result);
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        onError?.(err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, fetcher, getCachedData, setCachedData, onSuccess, onError]);

  // 初始加载
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, execute]);

  // 手动刷新
  const refresh = useCallback(() => {
    return execute(true);
  }, [execute]);

  // 清除缓存
  const clearCache = useCallback(() => {
    globalCache.delete(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
  };
}

// 清除所有缓存
export function clearAllCache() {
  globalCache.clear();
}

// 清除特定前缀的缓存
export function clearCacheByPrefix(prefix: string) {
  const keys = Array.from(globalCache.keys());
  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      globalCache.delete(key);
    }
  });
}
