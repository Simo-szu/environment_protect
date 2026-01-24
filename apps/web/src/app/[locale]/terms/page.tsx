'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import BackButton from '@/components/ui/BackButton';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { FileText } from 'lucide-react';

export default function TermsPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('terms');

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <BackButton fallbackUrl={`/${locale}`} />
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
                        <FileText className="w-3 h-3" />
                        {t('badge')}
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">{t('title')}</h1>
                    <p className="text-slate-600">{t('lastUpdated')}</p>
                </div>

                {/* 协议内容 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                    <div className="prose prose-slate max-w-none">
                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">{t('content.section1.title', '1. 服务条款的接受')}</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            {t('content.section1.content', '欢迎使用YouthLoop环保平台！当您注册、访问或使用我们的服务时，即表示您同意遵守本用户服务协议的所有条款和条件。')}
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">{t('content.section2.title', '2. 服务描述')}</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            {t('content.section2.content', 'YouthLoop是一个致力于环保教育和行动的在线平台，我们提供环保知识科普、活动组织、用户互动和积分奖励等服务。')}
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">{t('content.section3.title', '3. 用户责任')}</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            {t('content.section3.content', '用户需要提供准确的注册信息，保护账户安全，并遵守平台的使用规范。')}
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">{t('content.section4.title', '4. 联系我们')}</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            {t('content.section4.content', '如果您对本协议有任何疑问，请通过以下方式联系我们：')}
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                            <p>{t('content.contact.email', '邮箱：legal@youthloop.org')}</p>
                            <p>{t('content.contact.phone', '电话：400-123-4567')}</p>
                            <p>{t('content.contact.address', '地址：北京市朝阳区环保大厦')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}