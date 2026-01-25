import { NextIntlClientProvider } from 'next-intl';
import GoogleProvider from '@/components/GoogleProvider';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 支持的语言列表
const locales = ['zh', 'en'];

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
    children,
    params
}: LocaleLayoutProps) {
    // 解包 params Promise
    const { locale } = await params;

    // 验证语言是否支持
    if (!locales.includes(locale)) {
        notFound();
    }

    // 安全地获取翻译消息
    let messages;
    try {
        messages = await getMessages();
    } catch (error) {
        console.error('Failed to load messages:', error);
        // 如果翻译加载失败，使用空对象，让组件使用fallback
        messages = {};
    }

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <GoogleProvider>
                {children}
            </GoogleProvider>
        </NextIntlClientProvider>
    );
}