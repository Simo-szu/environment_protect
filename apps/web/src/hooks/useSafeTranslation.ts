'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

// 安全的翻译hook，带有fallback
export function useSafeTranslation(namespace: string = 'home') {
    const params = useParams();
    const locale = params?.locale as string || 'zh';

    // Always call useTranslations unconditionally.
    // Cast namespace to `any` so useSafeTranslation can accept dynamic string namespaces.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = useTranslations(namespace as any);

    // 创建一个安全的翻译函数，支持参数
    const safeT = useMemo(() => {
        return (key: string, fallback?: string, values?: Record<string, any>) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const translation = (t as any)(key, values);

                // 如果翻译存在且不等于key本身，返回翻译
                if (translation && translation !== key) {
                    return translation;
                }
            } catch (error) {
                console.warn(`Translation failed for key: ${key}`, error);
            }

            // 如果翻译失败，使用fallback
            if (fallback && values) {
                // 手动替换fallback中的变量
                let result = fallback;
                Object.entries(values).forEach(([k, v]) => {
                    result = result.replace(`{${k}}`, String(v));
                });
                return result;
            }
            return fallback || key;
        };
    }, [t]);

    return { t: safeT, locale };
}