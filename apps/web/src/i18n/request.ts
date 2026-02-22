import { getRequestConfig } from 'next-intl/server';

// 支持的语言列表
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'zh';

export default getRequestConfig(async ({ requestLocale }) => {
    // requestLocale 是一个异步函数，需要 await
    const locale = await requestLocale;

    // 如果没有locale或者locale不在支持列表中，使用默认语言
    const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

    try {
        const messages = (await import(`./locales/${validLocale}/index`)).default;

        return {
            messages,
            locale: validLocale as string
        };
    } catch (error) {
        console.error(`Failed to load messages for locale: ${validLocale}`, error);
        // Fallback to default locale
        return {
            messages: (await import(`./locales/${defaultLocale}/index`)).default,
            locale: defaultLocale as string
        };
    }
});