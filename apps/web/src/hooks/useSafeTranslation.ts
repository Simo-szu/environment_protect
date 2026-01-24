'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

// 安全的翻译hook，带有fallback
export function useSafeTranslation(namespace: string = 'home') {
    const params = useParams();
    const locale = params?.locale as string || 'zh';

    // 检查是否在正确的 next-intl 上下文中
    let t: any = null;
    let hasContext = false;

    try {
        t = useTranslations(namespace);
        hasContext = true;
    } catch (error) {
        console.warn(`Translation namespace ${namespace} failed:`, error);
        hasContext = false;
    }

    // 创建一个安全的翻译函数，支持参数
    const safeT = (key: string, fallback?: string, values?: Record<string, any>) => {
        if (hasContext && t) {
            try {
                const translation = t(key, values);

                // 如果翻译存在且不等于key本身，返回翻译
                if (translation && translation !== key) {
                    return translation;
                }
            } catch (error) {
                console.warn(`Translation failed for key: ${key}`, error);
            }
        }

        // 如果没有上下文或翻译失败，使用fallback
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

    return { t: safeT, locale };
}