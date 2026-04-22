'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowRight, BarChart3, BookOpen, Factory, Newspaper, Scale } from 'lucide-react';
import Layout from '@/components/Layout';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { contentApi, homeApi } from '@/lib/api';
import type { ContentItem } from '@/lib/api/content';
import type { CarbonMarketSnapshot, CarbonMarketTrendPoint } from '@/lib/api/home';
import { ApiError } from '@/lib/api-types';
import { formatShortDate } from '@/lib/date-utils';

export default function HomePage() {
    const params = useParams();
    const locale = (params?.locale as string) || 'zh';
    const isZh = locale === 'zh';

    const [dataNews, setDataNews] = useState<ContentItem[]>([]);
    const [newsItems, setNewsItems] = useState<ContentItem[]>([]);
    const [caseItems, setCaseItems] = useState<ContentItem[]>([]);
    const [policyItems, setPolicyItems] = useState<ContentItem[]>([]);
    const [wikiItems, setWikiItems] = useState<ContentItem[]>([]);
    const [contentLoading, setContentLoading] = useState(false);
    const [marketSnapshot, setMarketSnapshot] = useState<CarbonMarketSnapshot | null>(null);

    const [companyAEmission, setCompanyAEmission] = useState(140);
    const [companyAQuota, setCompanyAQuota] = useState(100);
    const [companyBEmission, setCompanyBEmission] = useState(70);
    const [companyBQuota, setCompanyBQuota] = useState(100);

    const tradeDemand = Math.max(0, companyAEmission - companyAQuota);
    const tradeSupply = Math.max(0, companyBQuota - companyBEmission);
    const tradedQuota = Math.min(tradeDemand, tradeSupply);
    const scarcityIndex = tradeDemand > 0 ? Math.max(0, (tradeDemand - tradeSupply) / tradeDemand) : 0;
    const carbonPrice = Math.round((68 * (1 + scarcityIndex * 0.8)) * 10) / 10;

    function isBackendUnavailableError(error: unknown): boolean {
        if (!(error instanceof ApiError)) {
            return false;
        }
        const normalized = (error.message || '').toLowerCase();
        return normalized.includes('http_500')
            || normalized.includes('connection to game service failed')
            || normalized.includes('failed to fetch')
            || normalized.includes('networkerror');
    }

    useEffect(() => {
        let cancelled = false;

        const loadContentData = async () => {
            try {
                setContentLoading(true);
                const [dataNewsPage, newsPage, casesPage, policiesPage, wikiPage] = await Promise.all([
                    contentApi.getDataNewsContents({ size: 3, sort: 'latest' }),
                    contentApi.getContents({ type: 'NEWS', size: 3, sort: 'latest' }),
                    contentApi.getContents({ type: 'DYNAMIC', size: 3, sort: 'latest' }),
                    contentApi.getContents({ type: 'POLICY', size: 3, sort: 'latest' }),
                    contentApi.getContents({ type: 'WIKI', size: 3, sort: 'latest' })
                ]);

                if (!cancelled) {
                    setDataNews(dataNewsPage.items);
                    setNewsItems(newsPage.items);
                    setCaseItems(casesPage.items);
                    setPolicyItems(policiesPage.items);
                    setWikiItems(wikiPage.items);
                }
            } catch (error) {
                if (!isBackendUnavailableError(error)) {
                    console.error('Failed to load homepage content:', error);
                } else {
                    console.warn(
                        isZh
                            ? '首页内容服务暂不可用，已使用空内容兜底。'
                            : 'Homepage content service is temporarily unavailable. Using empty fallback.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setContentLoading(false);
                }
            }
        };

        const loadMarketSnapshot = async () => {
            try {
                const snapshot = await homeApi.getCarbonMarketSnapshot();
                if (!cancelled) {
                    setMarketSnapshot(snapshot);
                }
            } catch (error) {
                if (!isBackendUnavailableError(error)) {
                    console.error('Failed to load carbon market snapshot:', error);
                }
            }
        };

        loadContentData();
        loadMarketSnapshot();

        const timer = window.setInterval(() => {
            loadMarketSnapshot();
        }, 60000);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [isZh]);

    const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
    const tradeDateText = marketSnapshot?.tradeDate
        ? new Date(`${marketSnapshot.tradeDate}T00:00:00`).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-CA')
        : null;
    const quoteTimeText = marketSnapshot?.quoteTime ? String(marketSnapshot.quoteTime).slice(0, 5) : null;
    const syncedAtText = marketSnapshot?.syncedAt
        ? new Date(marketSnapshot.syncedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', { hour12: false })
        : null;
    const isTrading = marketSnapshot?.marketStatus === 'TRADING';
    const syncedAtDate = marketSnapshot?.syncedAt ? new Date(marketSnapshot.syncedAt) : null;
    const isFreshSnapshot = syncedAtDate && Number.isFinite(syncedAtDate.getTime())
        ? Math.abs(Date.now() - syncedAtDate.getTime()) <= 3 * 60 * 1000
        : false;
    const isLiveSnapshot = isTrading;
    const marketCardTitle = isZh
        ? (isLiveSnapshot ? '全国碳市场实时行情' : '全国碳市场最新快照')
        : (isLiveSnapshot ? 'National Carbon Market Live Snapshot' : 'National Carbon Market Latest Snapshot');
    const marketCardMetaText = tradeDateText
        ? `${isZh ? '最新报价 ' : 'Latest Quote '}${tradeDateText}${quoteTimeText ? ` ${quoteTimeText}` : ''}`
        : (isZh ? '官方行情数据' : 'Official market data');
    const marketSyncText = syncedAtText
        ? `${isZh ? (isLiveSnapshot ? '实时同步至 ' : '最近同步 ') : (isLiveSnapshot ? 'Live synced ' : 'Last synced ')}${syncedAtText}`
        : (isZh ? '等待同步' : 'Pending sync');
    const liveMarketRows = marketSnapshot
        ? [
            {
                key: 'lastPrice',
                labelZh: '最新价',
                labelEn: 'Latest Price',
                value: formatPrice(marketSnapshot.closingPrice),
                delta: marketSnapshot.closingChangePercent,
            },
            {
                key: 'openPrice',
                labelZh: '开盘价',
                labelEn: 'Open Price',
                value: formatPrice(marketSnapshot.openPrice),
                delta: undefined,
            },
            {
                key: 'highPrice',
                labelZh: '最高价',
                labelEn: 'High Price',
                value: formatPrice(marketSnapshot.highPrice),
                delta: undefined,
            },
            {
                key: 'lowPrice',
                labelZh: '最低价',
                labelEn: 'Low Price',
                value: formatPrice(marketSnapshot.lowPrice),
                delta: undefined,
            },
        ]
        : [];
    return (
        <Layout>
            <AnimatedSection
                useInView={false}
                className="group relative -mx-2 flex min-h-[72vh] items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-[#3c8e57] sm:-mx-4 md:-mx-8 md:rounded-[2.5rem]"
            >
                <Image
                    src="/assets/branding/youthloop-banner.png"
                    alt="YouthLoop banner"
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-12 top-10 h-56 w-56 rounded-full bg-[#8ce3ba]/22 blur-3xl" />
                    <div className="absolute left-[40%] top-[26%] h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffb44d]/24 blur-[95px]" />
                    <div className="absolute right-[-6%] top-[12%] h-64 w-64 rounded-full bg-[#9fd5c2]/18 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_50%,rgba(255,178,72,0.22),rgba(255,178,72,0)_46%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0)_42%,rgba(6,18,24,0.28))]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,17,20,0.18),rgba(5,17,20,0.34))]" />
                    <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.45)_0.7px,transparent_0.7px)] [background-size:4px_4px]" />
                </div>
                <div className="relative z-20 w-full px-6 py-10 md:py-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 items-center gap-5 min-[980px]:grid-cols-[minmax(0,520px)_1fr_minmax(0,520px)] min-[1280px]:grid-cols-[minmax(0,560px)_1fr_minmax(0,560px)]">
                            <div className="min-[980px]:max-w-[520px] min-[980px]:justify-self-start min-[1280px]:max-w-[560px]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d7efe5]/95">
                                    AWARD-WINNING DESIGN
                                </p>
                                <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.08em] text-[#f4fbff] [text-shadow:0_2px_14px_rgba(2,6,23,0.72)] min-[980px]:text-6xl min-[1280px]:text-7xl">
                                    YOUTHLOOP
                                </h1>
                                <h2 className="mt-3 max-w-[18ch] text-2xl font-semibold leading-tight tracking-tight text-[#e3f3ee] min-[980px]:text-4xl min-[1280px]:text-[2.8rem]">
                                    {isZh ? '碳交易与碳中和资讯平台' : 'Carbon Trading & Neutrality Information Hub'}
                                </h2>
                                <p className="mt-5 max-w-[48ch] text-sm leading-relaxed text-[#d3e8df] min-[980px]:text-[1.08rem]">
                                    {isZh
                                        ? '连接碳市场数据、政策解读与低碳行动，帮助青年用户理解并参与碳交易生态。'
                                        : 'Connecting market data, policy interpretation, and low-carbon actions for young users.'}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={`/${locale}/science`}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)] transition-all hover:translate-y-[-1px] hover:bg-white/95"
                                    >
                                        {isZh ? '进入科普' : 'Explore Science'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={`/${locale}/game`}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/8 px-6 py-2.5 text-sm font-semibold text-[#e6f6f0] backdrop-blur-md transition-all hover:translate-y-[-1px] hover:bg-white/14"
                                    >
                                        {isZh ? '体验游戏' : 'Play Game'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="relative hidden h-full items-center justify-center px-6 min-[980px]:flex min-[1280px]:px-10">
                                <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                            </div>

                            <div className="space-y-4 min-[980px]:max-w-[520px] min-[980px]:justify-self-end min-[1280px]:max-w-[560px]">
                                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[linear-gradient(180deg,rgba(10,28,36,0.56),rgba(10,28,36,0.42))] p-5 shadow-[0_24px_65px_-35px_rgba(2,6,23,0.75)] backdrop-blur-[8px]">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#cfe4f3]">{marketCardTitle}</p>
                                        <span className="text-[11px] text-[#b9d3e7]">
                                            {marketCardMetaText}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden rounded-2xl border border-white/12">
                                        <table className="w-full text-left text-sm text-[#e8f1f8]">
                                            <tbody>
                                                {liveMarketRows.map((row) => (
                                                    <tr key={row.key} className="border-b border-white/10 last:border-b-0">
                                                        <td className="px-3 py-3 text-[#d6e7f4]">{isZh ? row.labelZh : row.labelEn}</td>
                                                        <td className="px-3 py-3 text-right font-semibold">{row.value}</td>
                                                        <td
                                                            className={`px-3 py-3 text-right text-xs font-semibold ${
                                                                typeof row.delta === 'number'
                                                                    ? row.delta >= 0 ? 'text-[#7de2a0]' : 'text-[#ffb3b3]'
                                                                    : 'text-[#8db9a7]'
                                                            }`}
                                                        >
                                                            {typeof row.delta === 'number'
                                                                ? `${row.delta >= 0 ? '+' : ''}${row.delta.toFixed(2)}%`
                                                                : '\u00A0'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {liveMarketRows.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-3 py-4 text-center text-[#d6e7f4]">
                                                            {isZh ? '官方行情数据暂不可用' : 'Official market data is temporarily unavailable'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#b9d3e7]">
                                        <span>
                                            {marketSyncText}
                                        </span>
                                        {marketSnapshot?.sourceUrl && (
                                            <a
                                                href={marketSnapshot.sourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="underline decoration-white/30 underline-offset-4 hover:text-white"
                                            >
                                                {isZh ? '查看官方来源' : 'View source'}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <TrendPanel snapshot={marketSnapshot} isZh={isZh} />
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            <div className="px-4 py-12 sm:px-6 md:px-12">
                <div className="mx-auto max-w-6xl space-y-14">
                    <AnimatedSection delay={0.05}>
                        <ContentPreviewSection
                            id="data-news"
                            icon={<BarChart3 className="h-5 w-5 text-[#30499B]" />}
                            badge={isZh ? '数据洞察' : 'Data Insights'}
                            title={isZh ? '用数据看懂碳问题' : 'Understand Carbon Through Data'}
                            subtitle={isZh ? '聚焦 OWID / Pudding 等数据叙事来源，围绕趋势、机制和行为影响展开。' : 'Centered around OWID and Pudding-style narratives across trends, mechanisms, and behavior impact.'}
                            items={dataNews}
                            loading={contentLoading}
                            emptyText={isZh ? '暂无数据新闻' : 'No data news yet'}
                            moreHref={`/${locale}/science?tab=data`}
                            moreText={isZh ? '查看全部数据洞察' : 'View all data insights'}
                            accentColor="#30499B"
                            shadowColor="rgba(48,73,155,0.4)"
                            locale={locale}
                            dateLocale={dateLocale}
                            tagLabel="Data Insight"
                        />
                    </AnimatedSection>

                    <AnimatedSection delay={0.08}>
                        <ContentPreviewSection
                            icon={<Newspaper className="h-5 w-5 text-[#2563eb]" />}
                            badge={isZh ? '新闻资讯' : 'News'}
                            title={isZh ? '环保新闻速递' : 'Environmental News'}
                            subtitle={isZh ? '追踪全球气候变化、碳排放与可持续发展领域的最新报道。' : 'Track the latest coverage on climate change, carbon emissions, and sustainability.'}
                            items={newsItems}
                            loading={contentLoading}
                            emptyText={isZh ? '暂无新闻' : 'No news yet'}
                            moreHref={`/${locale}/science?tab=news`}
                            moreText={isZh ? '查看全部新闻' : 'View all news'}
                            accentColor="#2563eb"
                            shadowColor="rgba(37,99,235,0.35)"
                            locale={locale}
                            dateLocale={dateLocale}
                            tagLabel="NEWS"
                        />
                    </AnimatedSection>

                    <AnimatedSection delay={0.10}>
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
                                    ? `当前可成交配额：${tradedQuota}。当供给小于需求时，价格会升高。`
                                    : `Tradable volume: ${tradedQuota}. Price rises when supply is below demand.`}
                            </p>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection delay={0.12}>
                        <ContentPreviewSection
                            icon={<Factory className="h-5 w-5 text-[#56B949]" />}
                            badge={isZh ? '案例动态' : 'Cases'}
                            title={isZh ? '真实市场案例' : 'Real Carbon Market Cases'}
                            subtitle={isZh ? '从试点实践到校园应用，观察碳交易如何在真实场景落地。' : 'From pilot markets to campus practice, see how carbon trading works in real scenarios.'}
                            items={caseItems}
                            loading={contentLoading}
                            emptyText={isZh ? '暂无案例' : 'No cases yet'}
                            moreHref={`/${locale}/science?tab=cases`}
                            moreText={isZh ? '查看全部案例' : 'View all cases'}
                            accentColor="#56B949"
                            shadowColor="rgba(86,185,73,0.45)"
                            locale={locale}
                            dateLocale={dateLocale}
                        />
                    </AnimatedSection>

                    <AnimatedSection delay={0.14}>
                        <ContentPreviewSection
                            icon={<Scale className="h-5 w-5 text-[#F0A32F]" />}
                            badge={isZh ? '政策法规' : 'Policy & Laws'}
                            title={isZh ? '政策与合规框架' : 'Policy & Compliance Framework'}
                            subtitle={isZh ? '从国际协定到本地监管，梳理碳交易的法规与执行路径。' : 'From global agreements to local regulation, map the legal path of carbon trading.'}
                            items={policyItems}
                            loading={contentLoading}
                            emptyText={isZh ? '暂无政策' : 'No policies yet'}
                            moreHref={`/${locale}/science?tab=policy`}
                            moreText={isZh ? '查看全部政策' : 'View all policies'}
                            accentColor="#F0A32F"
                            shadowColor="rgba(240,163,47,0.4)"
                            locale={locale}
                            dateLocale={dateLocale}
                        />
                    </AnimatedSection>

                    <AnimatedSection delay={0.16}>
                        <ContentPreviewSection
                            icon={<BookOpen className="h-5 w-5 text-[#8b5cf6]" />}
                            badge={isZh ? '环保百科' : 'Wiki'}
                            title={isZh ? '环保知识库' : 'Environmental Knowledge Base'}
                            subtitle={isZh ? '从节水节能到垃圾分类，掌握日常环保实用知识。' : 'From water and energy saving to waste sorting, learn practical eco-friendly knowledge.'}
                            items={wikiItems}
                            loading={contentLoading}
                            emptyText={isZh ? '暂无百科内容' : 'No wiki content yet'}
                            moreHref={`/${locale}/science?tab=wiki`}
                            moreText={isZh ? '查看全部百科' : 'View all wiki'}
                            accentColor="#8b5cf6"
                            shadowColor="rgba(139,92,246,0.35)"
                            locale={locale}
                            dateLocale={dateLocale}
                        />
                    </AnimatedSection>
                </div>
            </div>
        </Layout>
    );
}

function TrendPanel({
    snapshot,
    isZh,
}: {
    snapshot: CarbonMarketSnapshot | null;
    isZh: boolean;
}) {
    const trendPoints = snapshot?.trendPoints || [];
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const chartData = buildTrendSeries(trendPoints);
    const latestPrice = trendPoints.length > 0 ? trendPoints[trendPoints.length - 1]?.closingPrice : snapshot?.closingPrice;
    const minPrice = trendPoints.length > 0 ? Math.min(...trendPoints.map((point) => point.closingPrice)) : null;
    const maxPrice = trendPoints.length > 0 ? Math.max(...trendPoints.map((point) => point.closingPrice)) : null;
    const hoveredPoint = hoveredIndex !== null ? chartData?.points[hoveredIndex] : null;
    const tooltipStyle = hoveredPoint
        ? {
            left: hoveredPoint.x > 220 ? `${((hoveredPoint.x - 12) / 320) * 100}%` : `${((hoveredPoint.x + 12) / 320) * 100}%`,
            top: hoveredPoint.y < 42 ? `${((hoveredPoint.y + 18) / 120) * 100}%` : `${((hoveredPoint.y - 10) / 120) * 100}%`,
            transform: hoveredPoint.x > 220
                ? (hoveredPoint.y < 42 ? 'translate(-100%, 0%)' : 'translate(-100%, -100%)')
                : (hoveredPoint.y < 42 ? 'translate(0%, 0%)' : 'translate(0%, -100%)'),
        }
        : null;

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/16 bg-[linear-gradient(180deg,rgba(10,28,36,0.48),rgba(10,28,36,0.34))] p-5 backdrop-blur-[8px]">
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#d3e9de]">{isZh ? '量价走势' : 'Price Trend'}</p>
                <span className="text-[11px] uppercase tracking-[0.14em] text-[#b8d9ca]">
                    {trendPoints.length > 0 ? (isZh ? `近 ${trendPoints.length} 个交易日` : `Last ${trendPoints.length} Sessions`) : '--'}
                </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                {chartData ? (
                    <div className="relative">
                        <svg
                            viewBox="0 0 320 120"
                            className="h-32 w-full"
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <defs>
                                <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(125,226,160,0.55)" />
                                    <stop offset="100%" stopColor="rgba(125,226,160,0.02)" />
                                </linearGradient>
                            </defs>
                            <path d={chartData.areaPath} fill="url(#trendFill)" />
                            <path d={chartData.path} fill="none" stroke="#7de2a0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            {chartData.points.map((point, index) => (
                                <g key={point.tradeDate}>
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="10"
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredIndex(index)}
                                    />
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={hoveredIndex === index ? 4.5 : 2.8}
                                        fill="#d7ffe4"
                                        opacity={hoveredIndex === index ? '1' : '0.82'}
                                        className="pointer-events-none"
                                    />
                                </g>
                            ))}
                        </svg>
                        {hoveredPoint && (
                            <div
                                className="pointer-events-none absolute z-10 min-w-[160px] rounded-xl border border-white/15 bg-[#0e2530]/92 px-3 py-2 text-xs text-[#e8f1f8] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.75)]"
                                style={tooltipStyle || undefined}
                            >
                                <p className="font-semibold text-white">
                                    {formatTrendTradeDate(hoveredPoint.tradeDate, isZh)}
                                </p>
                                <p className="mt-1">
                                    {isZh ? '收盘价' : 'Close'}: {hoveredPoint.closingPrice.toFixed(2)} CNY/t
                                </p>
                                <p>
                                    {isZh ? '区间低点' : 'Low'}: {typeof hoveredPoint.lowPrice === 'number' ? hoveredPoint.lowPrice.toFixed(2) : '--'}
                                </p>
                                <p>
                                    {isZh ? '区间高点' : 'High'}: {typeof hoveredPoint.highPrice === 'number' ? hoveredPoint.highPrice.toFixed(2) : '--'}
                                </p>
                                <p>
                                    {isZh ? '成交量' : 'Volume'}: {formatTrendVolume(hoveredPoint.volume, isZh)}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-[#d6e7f4]">
                        {isZh ? '走势数据暂不可用' : 'Trend data is temporarily unavailable'}
                    </div>
                )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-2xl font-semibold text-[#f3fbf7]">
                        {typeof latestPrice === 'number' ? latestPrice.toFixed(2) : '--'}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#b8d9ca]">{isZh ? '最新收盘价' : 'Latest Close'}</p>
                </div>
                <div>
                    <p className="text-2xl font-semibold text-[#f3fbf7]">
                        {typeof minPrice === 'number' ? minPrice.toFixed(2) : '--'}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#b8d9ca]">{isZh ? '区间最低' : 'Range Low'}</p>
                </div>
                <div>
                    <p className="text-2xl font-semibold text-[#f3fbf7]">
                        {typeof maxPrice === 'number' ? maxPrice.toFixed(2) : '--'}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#b8d9ca]">{isZh ? '区间最高' : 'Range High'}</p>
                </div>
            </div>
        </div>
    );
}

function buildTrendSeries(points: CarbonMarketTrendPoint[]): {
    path: string;
    areaPath: string;
    points: Array<CarbonMarketTrendPoint & { x: number; y: number }>;
} | null {
    if (points.length < 2) {
        return null;
    }

    const width = 280;
    const height = 80;
    const left = 20;
    const top = 20;
    const prices = points.map((point) => point.closingPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    const coordinates = points.map((point, index) => {
        const x = left + (width * index) / Math.max(points.length - 1, 1);
        const y = top + height - ((point.closingPrice - minPrice) / range) * height;
        return {
            ...point,
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2)),
        };
    });

    const path = coordinates.map((point, index) => {
        return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }).join(' ');

    return {
        path,
        areaPath: `${path} L ${(left + width).toFixed(2)} ${(top + height).toFixed(2)} L ${left.toFixed(2)} ${(top + height).toFixed(2)} Z`,
        points: coordinates,
    };
}

function formatTrendTradeDate(value: string, isZh: boolean): string {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString(isZh ? 'zh-CN' : 'en-CA');
}

function formatTrendVolume(value?: number, isZh?: boolean): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '--';
    }

    if (isZh) {
        if (value >= 100000000) {
            return `${(value / 100000000).toFixed(2)}亿吨`;
        }
        if (value >= 10000) {
            return `${(value / 10000).toFixed(2)}万吨`;
        }
        return `${value.toLocaleString('zh-CN')}吨`;
    }

    return `${value.toLocaleString('en-US')} tons`;
}

function formatPrice(value?: number): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '-- CNY/t';
    }
    return `${value.toFixed(2)} CNY/t`;
}

function formatCurrency(value?: number, isZh?: boolean): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return isZh ? '-- 元' : '-- CNY';
    }
    return new Intl.NumberFormat(isZh ? 'zh-CN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value) + (isZh ? ' 元' : ' CNY');
}

function formatTonnage(value?: number, isZh?: boolean): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return isZh ? '-- 吨' : '-- tons';
    }
    return new Intl.NumberFormat(isZh ? 'zh-CN' : 'en-US', {
        maximumFractionDigits: 0,
    }).format(value) + (isZh ? ' 吨' : ' tons');
}

function ContentPreviewSection({
    id,
    icon,
    badge,
    title,
    subtitle,
    items,
    loading,
    emptyText,
    moreHref,
    moreText,
    accentColor,
    shadowColor,
    locale,
    dateLocale,
    tagLabel,
}: {
    id?: string;
    icon: ReactNode;
    badge: string;
    title: string;
    subtitle: string;
    items: ContentItem[];
    loading: boolean;
    emptyText: string;
    moreHref: string;
    moreText: string;
    accentColor: string;
    shadowColor: string;
    locale: string;
    dateLocale: string;
    tagLabel?: string;
}) {
    const isZh = locale === 'zh';
    const displayItems = [...items].sort((a, b) => {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bTime - aTime;
    });

    return (
        <section id={id} className="rounded-[2rem] border border-white/20 bg-transparent p-6 shadow-none md:p-8">
            <header className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/35 px-4 py-2 backdrop-blur-sm dark:bg-slate-800/35">
                    {icon}
                    <span className="text-sm font-semibold text-[#30499B] dark:text-slate-100">{badge}</span>
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#30499B] dark:text-slate-100 md:text-4xl">
                    {title}
                </h2>
                <p className="mx-auto mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
                    {subtitle}
                </p>
            </header>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {displayItems.map((item) => (
                    <article key={item.id} className="flex h-full flex-col rounded-2xl border border-white/35 bg-white/45 p-5 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/35" style={{ boxShadow: `0 18px 45px -34px ${shadowColor}` }}>
                        <div className="min-h-[1rem]">
                            {tagLabel && (
                                <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: accentColor }}>{tagLabel}</p>
                            )}
                        </div>
                        <div className="mt-2 flex flex-1 flex-col">
                            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                            <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                                {item.summary || (isZh ? '点击查看详情。' : 'Open to read details.')}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatShortDate(item.publishedAt, dateLocale)}
                            </span>
                            <Link href={`/${locale}/science/${item.id}`} className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: accentColor }}>
                                {isZh ? '阅读' : 'Read'}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </article>
                ))}
                {!loading && items.length === 0 && (
                    <div className="rounded-2xl border border-white/35 bg-white/45 p-5 text-sm text-slate-500 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/35 dark:text-slate-300">
                        {emptyText}
                    </div>
                )}
            </div>
            {displayItems.length > 0 && (
                <div className="mt-6 text-center">
                    <Link
                        href={moreHref}
                        className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all hover:translate-y-[-1px]"
                        style={{ borderColor: `${accentColor}30`, color: accentColor }}
                    >
                        {moreText}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </section>
    );
}
