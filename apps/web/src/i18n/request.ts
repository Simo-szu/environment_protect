import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 支持的语言列表
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'zh';

export default getRequestConfig(async ({ locale }) => {
    // 确保locale存在
    if (!locale) {
        notFound();
    }

    // 验证传入的语言是否支持
    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    return {
        messages: (await import(`./messages/${locale}.json`)).default,
        locale: locale as string
    };
});