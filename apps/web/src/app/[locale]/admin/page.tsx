'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { AdminVerificationsTab } from './components/AdminVerificationsTab';
import { AdminBannersTab } from './components/AdminBannersTab';
import { AdminGameCardsTab } from './components/AdminGameCardsTab';
import { AdminContentsTab } from './components/AdminContentsTab';
import { AdminGameRulesTab } from './components/AdminGameRulesTab';

type AdminTab = 'verifications' | 'banners' | 'gameCards' | 'gameRules' | 'contents';

const VALID_TABS: AdminTab[] = ['verifications', 'banners', 'gameCards', 'contents', 'gameRules'];

export default function AdminPage({ params }: { params: { locale: string } }) {
    const router = useRouter();
    const { t } = useSafeTranslation('admin');

    // SSR 初始值固定为 'verifications'，避免水合不匹配
    const [activeTab, setActiveTab] = useState<AdminTab>('verifications');

    // 纯客户端：挂载后从 URL hash 恢复 tab
    useEffect(() => {
        const hash = window.location.hash.replace('#', '') as AdminTab;
        if (VALID_TABS.includes(hash)) {
            setActiveTab(hash);
        }
    }, []);

    const switchTab = (tab: AdminTab) => {
        setActiveTab(tab);
        window.location.hash = tab;
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#30499B] to-[#516ac2] dark:from-[#56B949] dark:to-[#4aa840] tracking-tight">
                            {t('console', '开发者中台')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t('subtitle', '系统功能管理与内容审核站')}</p>
                    </div>
                    <button
                        onClick={() => router.push(`/${params.locale}/profile`)}
                        className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl shadow-sm transition-all flex items-center gap-2 w-fit"
                    >
                        <span className="text-lg leading-none">←</span>
                        {t('back', '返回个人中心')}
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="relative mb-8">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200 dark:bg-slate-700" />

                    <div className="flex flex-wrap gap-x-6 gap-y-2 relative z-10">
                        <button
                            onClick={() => switchTab('verifications')}
                            className={`pb-3 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'verifications'
                                ? 'border-[#30499B] dark:border-[#56B949] text-[#30499B] dark:text-[#56B949]'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('tabs.verifications', '主办方认证')}
                        </button>
                        <button
                            onClick={() => switchTab('banners')}
                            className={`pb-3 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'banners'
                                ? 'border-[#30499B] dark:border-[#56B949] text-[#30499B] dark:text-[#56B949]'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('tabs.banners', '首页横幅')}
                        </button>
                        <button
                            onClick={() => switchTab('gameCards')}
                            className={`pb-3 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'gameCards'
                                ? 'border-[#30499B] dark:border-[#56B949] text-[#30499B] dark:text-[#56B949]'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('tabs.gameCards', '游戏卡牌')}
                        </button>
                        <button
                            onClick={() => switchTab('contents')}
                            className={`pb-3 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'contents'
                                ? 'border-[#30499B] dark:border-[#56B949] text-[#30499B] dark:text-[#56B949]'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('tabs.contents', '内容管理')}
                        </button>
                        <button
                            onClick={() => switchTab('gameRules')}
                            className={`pb-3 px-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'gameRules'
                                ? 'border-[#30499B] dark:border-[#56B949] text-[#30499B] dark:text-[#56B949]'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('tabs.gameRules', '游戏配置')}
                        </button>
                    </div>
                </div>

                {/* Tab Render Area */}
                <div className="relative min-h-[500px]">
                    {activeTab === 'verifications' && <AdminVerificationsTab />}
                    {activeTab === 'banners' && <AdminBannersTab />}
                    {activeTab === 'gameCards' && <AdminGameCardsTab />}
                    {activeTab === 'gameRules' && <AdminGameRulesTab />}
                    {activeTab === 'contents' && <AdminContentsTab />}
                </div>

            </div>
        </Layout>
    );
}
