import { NextIntlClientProvider } from 'next-intl';
import GoogleProvider from '@/components/GoogleProvider';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'metadata' });

    return {
        title: t('title'),
        description: t('description')
    };
}

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
        console.error('Failed to load messages in LocaleLayout:', error);
        messages = {};
    }

    // 从环境变量获取 Google Client ID (作为基准/兜底)
    // 这里的 fallback 是为了在后端还没启动时页面也不会白屏
    const fallbackGoogleClientId = '717732984928-dvcgf1jrukvjnchu33htvog8lnpb2lm5.apps.googleusercontent.com';
    let googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || fallbackGoogleClientId;

    // 尝试从后端获取最新配置（不阻塞关键渲染的逻辑可以考虑放在这里，但 layout 是异步的，所以直接执行）
    try {
        // 使用相对路径尝试（如果是服务器端，需要绝对路径，这里保持 localhost:8080）
        const configRes = await fetch('http://localhost:8080/api/v1/system/config', {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(2000) // 设置 2s 超时，防止后端挂掉导致整个页面卡死
        });
        if (configRes.ok) {
            const configData = await configRes.json();
            if (configData.code === 0 && configData.data?.googleClientId) {
                googleClientId = configData.data.googleClientId;
            }
        }
    } catch (error) {
        console.warn('Backend system config unavailable, using environment/fallback:', error);
    }

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <GoogleProvider clientId={googleClientId}>
                <NextTopLoader
                    color="#56B949"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px #56B949,0 0 5px #56B949"
                />
                {children}
            </GoogleProvider>
        </NextIntlClientProvider>
    );
}