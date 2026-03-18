'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
    ArrowRight,
    BarChart3,
    Coffee,
    Factory,
    FileText,
    Gavel,
    Globe2,
    Landmark,
    Scale
} from 'lucide-react';
import Layout from '@/components/Layout';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function HomePage() {
    const params = useParams();
    const locale = (params?.locale as string) || 'zh';
    const isZh = locale === 'zh';

    const [companyAEmission, setCompanyAEmission] = useState(140);
    const [companyAQuota, setCompanyAQuota] = useState(100);
    const [companyBEmission, setCompanyBEmission] = useState(70);
    const [companyBQuota, setCompanyBQuota] = useState(100);

    const tradeDemand = Math.max(0, companyAEmission - companyAQuota);
    const tradeSupply = Math.max(0, companyBQuota - companyBEmission);
    const tradedQuota = Math.min(tradeDemand, tradeSupply);
    const scarcityIndex = tradeDemand > 0 ? Math.max(0, (tradeDemand - tradeSupply) / tradeDemand) : 0;
    const carbonPrice = Math.round((68 * (1 + scarcityIndex * 0.8)) * 10) / 10;

    return (
        <Layout>
            {/* Hero Section (unchanged) */}
            <AnimatedSection
                useInView={false}
                className="relative -mx-2 flex min-h-[80vh] items-center justify-center overflow-hidden rounded-[2rem] sm:-mx-4 md:-mx-8 md:rounded-[2.5rem]"
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
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,247,246,0.04)_0%,rgba(238,244,239,0.1)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.04)_40%,rgba(245,247,246,0.16)_100%)]" />
                <div className="absolute inset-0 ring-1 ring-white/30" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(245,247,246,0)_0%,rgba(245,247,246,0.72)_100%)]" />
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        boxShadow: 'inset 0 0 64px rgba(245,247,246,0.28), inset 0 -20px 40px rgba(245,247,246,0.18)'
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        WebkitMaskImage: 'radial-gradient(circle at center, black 62%, transparent 100%)',
                        background: 'rgba(255,255,255,0.03)'
                    }}
                />
                <Image
                    src="/assets/branding/youthloop-banner.jpg"
                    alt="YouthLoop banner"
                    width={1600}
                    height={700}
                    className="relative z-10 h-auto max-h-[78vh] w-full object-contain opacity-0"
                    priority
                />

                <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 transform">
                    <Link href={`/${locale}/intro`}>
                        <button className="group flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/20 hover:shadow-xl">
                            <span>{isZh ? '进入有关"碳"的世界' : 'Enter the World of Carbon'}</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                </div>
            </AnimatedSection>

            <div className="border-t border-slate-100/70 bg-transparent px-4 py-12 transition-colors duration-300 dark:border-slate-800/70 sm:px-6 md:px-12">
                <AnimatedSection delay={0.04}>
                    <div className="mx-auto mb-8 max-w-6xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#56B949]">
                            Carbon Trading Focus
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#30499B] dark:text-[#56B949] md:text-3xl">
                            {isZh ? '首页三大内容板块（纵向浏览）' : 'Three Long-Form Sections (Vertical Flow)'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {isZh
                                ? '三个板块分开独立展示，向下滚动依次浏览：数据新闻 → 案例 → 法律。'
                                : 'Each section is independent. Scroll down to move through Data News, Cases, and Laws.'}
                        </p>
                    </div>
                </AnimatedSection>

                <div className="mx-auto max-w-6xl snap-y snap-mandatory space-y-20">
                    <AnimatedSection delay={0.08}>
                        <section id="data-news" className="snap-start rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(245,250,246,0.36))] p-6 shadow-[0_26px_70px_-45px_rgba(48,73,155,0.35)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.38),rgba(15,23,42,0.24))] md:min-h-[92vh] md:p-8">
                            <header className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-700">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#56B949]">DATA STORYTELLING</p>
                                <h3 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#30499B] dark:text-slate-100">
                                    <BarChart3 className="h-6 w-6" />
                                    {isZh ? '数据新闻' : 'Data News'}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                    {isZh ? '副标题：用数据叙事解释碳问题规模、来源与政策机制。' : 'Subtitle: Explain emission scale, sources, and policy mechanics through data storytelling.'}
                                </p>
                            </header>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#30499B]/10 px-3 py-1 text-xs font-semibold text-[#30499B]">
                                        <Globe2 className="h-4 w-4" />
                                        {isZh ? '第一章' : 'Chapter 1'}
                                    </div>
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {isZh ? '碳问题有多大' : 'How Big Is the Carbon Problem'}
                                    </h4>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <li>{isZh ? '全球与中国碳排放趋势对比' : 'Global and China emission trend comparison'}</li>
                                        <li>{isZh ? '行业排放占比与城市来源拆解' : 'Sector share and urban source breakdown'}</li>
                                        <li>{isZh ? '结合 Paris Agreement 的升温目标' : 'Context from Paris Agreement targets'}</li>
                                    </ul>
                                    <a
                                        href="https://ourworldindata.org/co2-and-greenhouse-gas-emissions"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#30499B] hover:underline"
                                    >
                                        {isZh ? '参考数据源' : 'Reference data'}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </article>

                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#56B949]/10 px-3 py-1 text-xs font-semibold text-[#56B949]">
                                        <Coffee className="h-4 w-4" />
                                        {isZh ? '第二章' : 'Chapter 2'}
                                    </div>
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {isZh ? '碳排放从哪里来' : 'Where Emissions Come From'}
                                    </h4>
                                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? '以“一杯咖啡”为例：种植→烘焙→运输→制作→一次性杯子，用流程图展示每一步的碳排放估算。'
                                            : 'Use one cup of coffee to map emissions from farm to disposable cup.'}
                                    </p>
                                </article>

                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0A32F]/15 px-3 py-1 text-xs font-semibold text-[#d18a1d]">
                                        <Landmark className="h-4 w-4" />
                                        {isZh ? '第三章' : 'Chapter 3'}
                                    </div>
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {isZh ? '政府如何解决碳问题' : 'How Governments Act'}
                                    </h4>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <li>{isZh ? '碳达峰与碳中和政策目标' : 'Peak carbon and neutrality targets'}</li>
                                        <li>{isZh ? '全国碳排放权交易市场机制' : 'National carbon market mechanism'}</li>
                                        <li>{isZh ? '企业配额与交易价格联动' : 'Allowance and price linkage'}</li>
                                    </ul>
                                </article>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <h4 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949]">
                                        {isZh ? '碳交易模拟：企业 A 向企业 B 购买配额' : 'Carbon Trading Simulator'}
                                    </h4>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        {isZh ? '拖动排放量和配额，观察可交易配额与碳价变化。' : 'Adjust emissions and quotas to see volume and price changes.'}
                                    </p>

                                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{isZh ? '企业 A（高排放）' : 'Company A (High Emission)'}</p>
                                            <label className="mt-3 block text-xs text-slate-500">{isZh ? `排放量: ${companyAEmission}` : `Emission: ${companyAEmission}`}</label>
                                            <input type="range" min={40} max={200} value={companyAEmission} onChange={(e) => setCompanyAEmission(Number(e.target.value))} className="mt-1 w-full accent-[#EE4035]" />
                                            <label className="mt-3 block text-xs text-slate-500">{isZh ? `配额: ${companyAQuota}` : `Quota: ${companyAQuota}`}</label>
                                            <input type="range" min={40} max={180} value={companyAQuota} onChange={(e) => setCompanyAQuota(Number(e.target.value))} className="mt-1 w-full accent-[#30499B]" />
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{isZh ? '企业 B（低排放）' : 'Company B (Low Emission)'}</p>
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
                                            <p className="text-xs text-slate-500">{isZh ? '模拟成交价 (CNY/t)' : 'Simulated Price (CNY/t)'}</p>
                                            <p className="mt-1 text-lg font-semibold text-[#30499B]">{carbonPrice}</p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? `当前可成交配额：${tradedQuota}。当供给低于需求时，碳价上升。`
                                            : `Tradable volume: ${tradedQuota}. Price rises when supply is below demand.`}
                                    </p>
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <h4 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949]">
                                        {isZh ? '场景故事：大学生的一天碳排放' : 'Story: A Student’s Daily Carbon Footprint'}
                                    </h4>
                                    <ol className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                        <li>{isZh ? '早餐外带咖啡与一次性杯：约 0.18kg CO2e' : 'Takeaway coffee: ~0.18kg CO2e'}</li>
                                        <li>{isZh ? '地铁通勤 12 公里：约 0.5kg CO2e' : 'Metro commute 12km: ~0.5kg CO2e'}</li>
                                        <li>{isZh ? '线上购物一次：约 0.3kg CO2e' : 'One e-commerce delivery: ~0.3kg CO2e'}</li>
                                        <li>{isZh ? '晚间空调 3 小时：约 1.2kg CO2e' : 'Air conditioning 3h: ~1.2kg CO2e'}</li>
                                    </ol>
                                </section>
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection delay={0.12}>
                        <section id="cases" className="snap-start rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(239,247,242,0.35))] p-6 shadow-[0_26px_70px_-45px_rgba(51,130,78,0.36)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.38),rgba(15,23,42,0.24))] md:min-h-[92vh] md:p-8">
                            <header className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-700">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#56B949]">CARBON MARKET CASES</p>
                                <h3 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#30499B] dark:text-slate-100">
                                    <Factory className="h-6 w-6" />
                                    {isZh ? '案例' : 'Cases'}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                    {isZh ? '副标题：从真实市场实践看碳交易机制如何落地。' : 'Subtitle: Learn how market mechanisms are implemented in practice.'}
                                </p>
                            </header>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <h4 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949]">{isZh ? '深圳碳交易试点' : 'Shenzhen ETS Pilot'}</h4>
                                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? '覆盖电力、制造、建筑等重点行业，构建了较完整的配额管理和交易机制。'
                                            : 'Covers power, manufacturing, and buildings with a mature allowance mechanism.'}
                                    </p>
                                </article>

                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <h4 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949]">{isZh ? '全国碳市场电力板块' : 'National ETS Power Sector'}</h4>
                                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? '以发电行业为核心，推动企业通过效率优化和技术改造实现减排。'
                                            : 'Power-sector-first coverage drives abatement through efficiency and retrofit.'}
                                    </p>
                                </article>

                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <h4 className="text-lg font-semibold text-[#30499B] dark:text-[#56B949]">{isZh ? '校园低碳账本实践' : 'Campus Carbon Ledger'}</h4>
                                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? '将通勤、用电、消费行为映射到碳账本，用可视化反馈提升青年参与感。'
                                            : 'Maps student behavior into a visual carbon ledger with instant feedback.'}
                                    </p>
                                </article>
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection delay={0.14}>
                        <section id="laws" className="snap-start rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(251,246,237,0.34))] p-6 shadow-[0_26px_70px_-45px_rgba(186,133,54,0.28)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.38),rgba(15,23,42,0.24))] md:min-h-[92vh] md:p-8">
                            <header className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-700">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d18a1d]">POLICY & COMPLIANCE</p>
                                <h3 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#30499B] dark:text-slate-100">
                                    <Scale className="h-6 w-6" />
                                    {isZh ? '法律' : 'Laws'}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                    {isZh ? '副标题：聚焦国际协定、双碳目标与企业履约规则。' : 'Subtitle: Focus on agreements, dual-carbon targets, and compliance rules.'}
                                </p>
                            </header>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#30499B]/10 px-3 py-1 text-xs font-semibold text-[#30499B]">
                                        <Globe2 className="h-4 w-4" />
                                        Paris Agreement
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? '目标是将全球升温控制在 2°C 以内，并尽力限制在 1.5°C。'
                                            : 'Target: hold warming well below 2°C and pursue 1.5°C.'}
                                    </p>
                                </article>

                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#56B949]/10 px-3 py-1 text-xs font-semibold text-[#56B949]">
                                        <FileText className="h-4 w-4" />
                                        {isZh ? '双碳目标' : 'Dual Carbon Goals'}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? '中国提出“2030年前碳达峰、2060年前碳中和”，并持续完善政策体系。'
                                            : 'China targets peak emissions before 2030 and neutrality before 2060.'}
                                    </p>
                                </article>

                                <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F0A32F]/15 px-3 py-1 text-xs font-semibold text-[#d18a1d]">
                                        <Gavel className="h-4 w-4" />
                                        {isZh ? '碳市场规则' : 'Market Rules'}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {isZh
                                            ? '企业需完成排放核算、报告与履约清缴，超额排放可通过市场购买配额。'
                                            : 'Firms report emissions and settle obligations through allowances.'}
                                    </p>
                                </article>
                            </div>
                        </section>
                    </AnimatedSection>
                </div>
            </div>
        </Layout>
    );
}
