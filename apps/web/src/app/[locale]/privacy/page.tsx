'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import BackButton from '@/components/ui/BackButton';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('privacy');

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <BackButton fallbackUrl={`/${locale}`} />
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#56B949]/10 text-[#56B949] text-xs font-semibold mb-4 border border-[#56B949]/20">
                        <Shield className="w-3 h-3" />
                        {t('badge')}
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] dark:text-white mb-4">{t('title')}</h1>
                    <p className="text-slate-600 dark:text-slate-400">{t('lastUpdated')}</p>
                </div>

                {/* 隐私政策内容 */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 dark:border-slate-800 shadow-lg">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-xl font-semibold text-[#30499B] dark:text-blue-400 mb-4">{t('content.section1.title', '1. 引言')}</h2>
                        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                            {t('content.section1.content', 'YouthLoop（以下简称"我们"）非常重视用户的隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策的条款。')}
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] dark:text-blue-400 mb-4">{t('content.section2.title', '2. 我们收集的信息')}</h2>
                        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                            {t('content.section2.content', '我们收集您主动提供的信息以及自动收集的使用数据，以便为您提供更好的服务。')}
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] dark:text-blue-400 mb-4">{t('content.section3.title', '3. 信息使用目的')}</h2>
                        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                            {t('content.section3.content', '我们使用收集的信息来提供、维护和改进我们的服务，处理您的账户管理，组织环保活动等。')}
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] dark:text-blue-400 mb-4">{t('content.section4.title', '4. 联系我们')}</h2>
                        <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                            {t('content.section4.content', '如果您对本隐私政策有任何疑问，请联系我们：')}
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300">
                            <p>{t('content.contact.email', '邮箱：privacy@youthloop.org')}</p>
                            <p>{t('content.contact.phone', '电话：400-123-4567')}</p>
                            <p>{t('content.contact.address', '地址：北京市朝阳区环保大厦')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}