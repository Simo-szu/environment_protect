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

    // 暂时不使用翻译，直接返回children
    return <>{children}</>;
}