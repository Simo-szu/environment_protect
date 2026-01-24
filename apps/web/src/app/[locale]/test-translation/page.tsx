'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';

export default function TestTranslationPage() {
    // 暂时移除翻译功能
    // const t = useTranslations('home');
    const params = useParams();
    const locale = params.locale as string;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Translation Test (Disabled)</h1>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <h2 className="font-semibold mb-2">Current Locale: {locale}</h2>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Translation system temporarily disabled</h3>
                        <p>We are working on fixing the translation system.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}