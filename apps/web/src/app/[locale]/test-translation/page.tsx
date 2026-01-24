'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { useTranslations } from 'next-intl';

export default function TestTranslationPage() {
    const params = useParams();
    const currentLocale = params.locale as string;

    // 直接使用 next-intl 的 useTranslations
    const t = useTranslations('home');

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Translation Test - Direct</h1>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <h2 className="font-semibold mb-2">Current Locale: {currentLocale}</h2>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-semibold mb-2">Direct Translation Tests:</h3>
                        <div className="space-y-2">
                            <p><strong>Raw t('title'):</strong> "{t('title')}"</p>
                            <p><strong>Raw t('subtitle'):</strong> "{t('subtitle')}"</p>
                            <p><strong>Raw t('slogan'):</strong> "{t('slogan')}"</p>
                            <p><strong>Raw t('cards.points.title'):</strong> "{t('cards.points.title')}"</p>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h3 className="font-semibold mb-2">Expected Results:</h3>
                        <div className="space-y-2">
                            <p><strong>Chinese (zh):</strong> YOUTHLOOP, 让绿色循环，用行动改变未来, 全民环保行动季</p>
                            <p><strong>English (en):</strong> YOUTHLOOP, Let Green Cycle, Change the Future with Action, National Environmental Action Season</p>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h3 className="font-semibold mb-2">Debug Info:</h3>
                        <div className="space-y-2">
                            <p><strong>Locale from params:</strong> {currentLocale}</p>
                            <p><strong>Translation function type:</strong> {typeof t}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}