'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, BarChart3, Factory, Scale } from 'lucide-react';
import Layout from '@/components/Layout';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { contentApi } from '@/lib/api';
import type { ContentItem } from '@/lib/api/content';
import { formatShortDate } from '@/lib/date-utils';

export default function HomePage() {
    const params = useParams();
    const locale = (params?.locale as string) || 'zh';
    const isZh = locale === 'zh';

    const [dataNews, setDataNews] = useState<ContentItem[]>([]);
    const [caseItems, setCaseItems] = useState<ContentItem[]>([]);
    const [policyItems, setPolicyItems] = useState<ContentItem[]>([]);
    const [contentLoading, setContentLoading] = useState(false);

    const [companyAEmission, setCompanyAEmission] = useState(140);
    const [companyAQuota, setCompanyAQuota] = useState(100);
    const [companyBEmission, setCompanyBEmission] = useState(70);
    const [companyBQuota, setCompanyBQuota] = useState(100);

    const tradeDemand = Math.max(0, companyAEmission - companyAQuota);
    const tradeSupply = Math.max(0, companyBQuota - companyBEmission);
    const tradedQuota = Math.min(tradeDemand, tradeSupply);
    const scarcityIndex = tradeDemand > 0 ? Math.max(0, (tradeDemand - tradeSupply) / tradeDemand) : 0;
    const carbonPrice = Math.round((68 * (1 + scarcityIndex * 0.8)) * 10) / 10;

    useEffect(() => {
        const loadHomeContents = async () => {
            try {
                setContentLoading(true);
                const [dataNewsPage, casesPage, policiesPage] = await Promise.all([
                    contentApi.getDataNewsContents({ size: 3, sort: 'latest' }),
                    contentApi.getContents({ type: 'DYNAMIC', size: 3, sort: 'latest' }),
                    contentApi.getContents({ type: 'POLICY', size: 3, sort: 'latest' })
                ]);

                setDataNews(dataNewsPage.items);
                setCaseItems(casesPage.items);
                setPolicyItems(policiesPage.items);
            } catch (error) {
                console.error('Failed to load homepage content:', error);
            } finally {
                setContentLoading(false);
            }
        };

        loadHomeContents();
    }, []);

    return (
        <Layout>
            <AnimatedSection
                useInView={false}
                className="relative -mx-2 flex min-h-[68vh] items-center justify-center overflow-hidden rounded-[2rem] sm:-mx-4 md:-mx-8 md:rounded-[2.5rem]"
            >
                <Image
                    src="/assets/branding/youthloop-banner.jpg"
                    alt="YouthLoop banner"
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-slate-900/20" />
                <div className="absolute inset-0 ring-1 ring-white/20" />
                <div className="relative z-20 px-6 text-center text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">{isZh ? 'Carbon Knowledge Hub' : 'Carbon Knowledge Hub'}</p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                        {isZh ? '碳交易与碳中和资讯平台' : 'Carbon Trading & Neutrality'}
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-white/90 md:text-base">
                        {isZh ? '首页内容将随每日抓取自动更新，覆盖数据新闻、案例与政策。' : 'Homepage content refreshes daily from ingestion sources.'}
                    </p>
                    <div className="mt-6">
                        <Link href={`/${locale}/science`} className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur-md hover:bg-white/25">
                            {isZh ? '进入 Science' : 'Open Science'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </AnimatedSection>

            <div className="px-4 py-12 sm:px-6 md:px-12">
                <div className="mx-auto max-w-6xl space-y-14">
                    <AnimatedSection delay={0.05}>
                        <section className="rounded-[2rem] border border-slate-200/80 bg-white/70 p-6 shadow-[0_26px_70px_-45px_rgba(48,73,155,0.35)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/40 md:p-8">
                            <header className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                                <BarChart3 className="h-6 w-6 text-[#30499B]" />
                                <div>
                                    <h2 className="text-2xl font-semibold text-[#30499B] dark:text-slate-100">{isZh ? '数据新闻' : 'Data News'}</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                                        {isZh ? '聚焦 OWID / Pudding 等数据叙事来源。' : 'Focused on OWID / Pudding style data stories.'}
                                    </p>
                                </div>
                            </header>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                {dataNews.map((item) => (
                                    <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/30">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#30499B]">Data Insight</p>
                                        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                                        <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                                            {item.summary || (isZh ? '点击查看详情。' : 'Open to read details.')}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatShortDate(item.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                            </span>
                                            <Link href={`/${locale}/science/${item.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#30499B] hover:underline">
                                                {isZh ? '阅读全文' : 'Read'}
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                                {!contentLoading && dataNews.length === 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
                                        {isZh ? '暂无数据新闻，稍后会自动更新。' : 'No data news yet. It will update automatically.'}
                                    </div>
                                )}
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection delay={0.08}>
                        <section className="rounded-[2rem] border border-slate-200/80 bg-white/70 p-6 shadow-[0_26px_70px_-45px_rgba(186,133,54,0.28)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/40 md:p-8">
                            <h2 className="text-2xl font-semibold text-[#30499B] dark:text-slate-100">
                                {isZh ? '碳交易模拟' : 'Carbon Trading Simulator'}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                {isZh ? '拖动排放与配额，观察成交量与价格变化。' : 'Adjust emissions and quotas to see volume and price shifts.'}
                            </p>
                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{isZh ? '企业 A' : 'Company A'}</p>
                                    <label className="mt-3 block text-xs text-slate-500">{isZh ? `排放量: ${companyAEmission}` : `Emission: ${companyAEmission}`}</label>
                                    <input type="range" min={40} max={200} value={companyAEmission} onChange={(e) => setCompanyAEmission(Number(e.target.value))} className="mt-1 w-full accent-[#EE4035]" />
                                    <label className="mt-3 block text-xs text-slate-500">{isZh ? `配额: ${companyAQuota}` : `Quota: ${companyAQuota}`}</label>
                                    <input type="range" min={40} max={180} value={companyAQuota} onChange={(e) => setCompanyAQuota(Number(e.target.value))} className="mt-1 w-full accent-[#30499B]" />
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{isZh ? '企业 B' : 'Company B'}</p>
                                    <label className="mt-3 block text-xs text-slate-500">{isZh ? `排放量: ${companyBEmission}` : `Emission: ${companyBEmission}`}</label>
                                    <input type="range" min={20} max={180} value={companyBEmission} onChange={(e) => setCompanyBEmission(Number(e.target.value))} className="mt-1 w-full accent-[#56B949]" />
                                    <label className="mt-3 block text-xs text-slate-500">{isZh ? `配额: ${companyBQuota}` : `Quota: ${companyBQuota}`}</label>
                                    <input type="range" min={40} max={180} value={companyBQuota} onChange={(e) => setCompanyBQuota(Number(e.target.value))} className="mt-1 w-full accent-[#F0A32F]" />
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-[#EE4035]/20 bg-[#EE4035]/5 p-3">
                                    <p className="text-xs text-slate-500">{isZh ? 'A 需求配额' : 'A Demand'}</p>
                                    <p className="mt-1 text-lg font-semibold text-[#EE4035]">{tradeDemand}</p>
                                </div>
                                <div className="rounded-xl border border-[#56B949]/20 bg-[#56B949]/5 p-3">
                                    <p className="text-xs text-slate-500">{isZh ? 'B 可售配额' : 'B Supply'}</p>
                                    <p className="mt-1 text-lg font-semibold text-[#56B949]">{tradeSupply}</p>
                                </div>
                                <div className="rounded-xl border border-[#30499B]/20 bg-[#30499B]/5 p-3">
                                    <p className="text-xs text-slate-500">{isZh ? '模拟价格 (CNY/t)' : 'Simulated Price (CNY/t)'}</p>
                                    <p className="mt-1 text-lg font-semibold text-[#30499B]">{carbonPrice}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                {isZh
                                    ? `当前可成交配额：${tradedQuota}。当供给小于需求时，价格会上升。`
                                    : `Tradable volume: ${tradedQuota}. Price rises when supply is below demand.`}
                            </p>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection delay={0.11}>
                        <section className="rounded-[2rem] border border-slate-200/80 bg-white/70 p-6 shadow-[0_26px_70px_-45px_rgba(51,130,78,0.36)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/40 md:p-8">
                            <header className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                                <Factory className="h-6 w-6 text-[#56B949]" />
                                <h2 className="text-2xl font-semibold text-[#30499B] dark:text-slate-100">{isZh ? '案例' : 'Cases'}</h2>
                            </header>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                {caseItems.map((item) => (
                                    <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/30">
                                        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                                        <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                                            {item.summary || (isZh ? '点击查看案例详情。' : 'Open to read case details.')}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatShortDate(item.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                            </span>
                                            <Link href={`/${locale}/science/${item.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#56B949] hover:underline">
                                                {isZh ? '查看' : 'Open'}
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection delay={0.14}>
                        <section className="rounded-[2rem] border border-slate-200/80 bg-white/70 p-6 shadow-[0_26px_70px_-45px_rgba(48,73,155,0.35)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/40 md:p-8">
                            <header className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                                <Scale className="h-6 w-6 text-[#F0A32F]" />
                                <h2 className="text-2xl font-semibold text-[#30499B] dark:text-slate-100">{isZh ? '法律政策' : 'Policy & Laws'}</h2>
                            </header>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                {policyItems.map((item) => (
                                    <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/30">
                                        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                                        <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                                            {item.summary || (isZh ? '点击查看政策详情。' : 'Open to read policy details.')}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatShortDate(item.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                            </span>
                                            <Link href={`/${locale}/science/${item.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#30499B] hover:underline">
                                                {isZh ? '查看' : 'Open'}
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </AnimatedSection>
                </div>
            </div>
        </Layout>
    );
}
