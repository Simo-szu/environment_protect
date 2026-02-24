import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import GoogleProvider from '@/components/GoogleProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { getPublicSystemConfigServer } from '@/lib/api/system';

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

const locales = ['zh', 'en'];

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
    children,
    params
}: LocaleLayoutProps) {
    const { locale } = await params;

    if (!locales.includes(locale)) {
        notFound();
    }

    let messages;
    try {
        messages = await getMessages();
    } catch (error) {
        console.error('Failed to load messages in LocaleLayout:', error);
        messages = {};
    }

    let googleClientId = '';

    const configData = await getPublicSystemConfigServer(process.env.SOCIAL_API_ORIGIN);
    if (configData?.googleClientId) {
        googleClientId = configData.googleClientId;
    }

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <GoogleProvider clientId={googleClientId}>
                <AuthProvider>
                    <NotificationProvider>
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
                    </NotificationProvider>
                </AuthProvider>
            </GoogleProvider>
        </NextIntlClientProvider>
    );
}
