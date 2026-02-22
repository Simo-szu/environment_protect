'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { AdminVerificationsTab } from './components/AdminVerificationsTab';
import { AdminBannersTab } from './components/AdminBannersTab';
import { AdminGameCardsTab } from './components/AdminGameCardsTab';
import { AdminContentsTab } from './components/AdminContentsTab';

type AdminTab = 'verifications' | 'banners' | 'gameCards' | 'contents';

export default function AdminPage({ params }: { params: { locale: string } }) {
    const router = useRouter();
    const { t } = useSafeTranslation('admin');
    const [activeTab, setActiveTab] = useState<AdminTab>('verifications');

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#30499B] to-[#516ac2] tracking-tight">
                            {t('console', '开发者中台')}
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm">{t('subtitle', '系统功能管理与内容审核站')}</p>
                    </div>
                    <button
                        onClick={() => router.push(`/${params.locale}/profile`)}
                        className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">←</span>
                        {t('back', '返回个人中心')}
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="relative mb-8">
                    {/* Background track for tabs */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" />

                    <div className="flex gap-6 overflow-x-auto custom-scrollbar relative z-10">
                        <button
                            onClick={() => setActiveTab('verifications')}
                            className={`pb-4 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'verifications'
                                    ? 'border-[#30499B] text-[#30499B]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {t('tabs.verifications', '主办方认证')}
                        </button>
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={`pb-4 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'banners'
                                    ? 'border-[#30499B] text-[#30499B]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {t('tabs.banners', '首页横幅')}
                        </button>
                        <button
                            onClick={() => setActiveTab('gameCards')}
                            className={`pb-4 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'gameCards'
                                    ? 'border-[#30499B] text-[#30499B]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {t('tabs.gameCards', '游戏卡牌')}
                        </button>
                        <button
                            onClick={() => setActiveTab('contents')}
                            className={`pb-4 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'contents'
                                    ? 'border-[#30499B] text-[#30499B]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {t('tabs.contents', '内容管理')}
                        </button>
                    </div>
                </div>

                {/* Tab Render Area */}
                <div className="relative min-h-[500px]">
                    {activeTab === 'verifications' && <AdminVerificationsTab />}
                    {activeTab === 'banners' && <AdminBannersTab />}
                    {activeTab === 'gameCards' && <AdminGameCardsTab />}
                    {activeTab === 'contents' && <AdminContentsTab />}
                </div>

            </div>
        </Layout>
    );
}
