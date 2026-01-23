'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Recycle,
    Droplets,
    Zap,
    Eye,
    Heart,
    ArrowRight,
    BookOpen,
    BatteryCharging,
    Waves
} from 'lucide-react';
import Layout from '@/components/Layout';
import { fadeUp, staggerContainer, staggerItem, pageEnter, hoverLift } from '@/lib/animations';

export default function SciencePage() {
    useEffect(() => {
        // 创建落叶动画
        const createLeaf = () => {
            const leaf = document.createElement('div');
            leaf.className = 'leaf-container';
            leaf.style.left = Math.random() * 100 + '%';
            leaf.style.animationDuration = (Math.random() * 8 + 12) + 's';
            leaf.style.animationDelay = Math.random() * 5 + 's';
            leaf.innerHTML = `
        <svg class="leaf-svg w-full h-full" viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path d="M2,21c0-8.8,3.3-16.1,10-19c0,0-1.6,7.7,2,11c-2,0-5,0-5,8C9,21,2,21,2,21z M12,2c0,0,1,6,0,10"></path>
        </svg>
      `;
            document.querySelector('.falling-leaves')?.appendChild(leaf);

            setTimeout(() => {
                leaf.remove();
            }, 20000);
        };

        const leafInterval = setInterval(createLeaf, 3000);
        return () => clearInterval(leafInterval);
    }, []);

    const viewArticle = (articleId: string) => {
        window.location.href = `/science/${articleId}`;
    };

    return (
        <Layout>
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white dark:from-slate-900 via-[#30499B]/5 dark:via-[#30499B]/10 to-white dark:to-slate-900 transition-colors duration-300"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30499B] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30499B]"></span>
                    </span>
                    环保科普知识库
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] dark:text-[#56B949] mb-6 drop-shadow-sm leading-tight font-serif transition-colors duration-300">
                    科学<span className="text-[#56B949] dark:text-[#F0A32F]">环保</span>
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 dark:text-slate-300 font-normal max-w-lg mx-auto leading-relaxed px-4 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#30499B]" />
                        <span>用<span className="text-[#30499B] font-medium border-b-2 border-[#30499B]/30">科学</span>指导，</span>
                    </div>
                    <span>让<span className="text-[#56B949] font-medium border-b-2 border-[#56B949]/30">环保</span>更有效</span>
                </div>
            </motion.section>

            {/* 环保小贴士 Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="mb-16"
            >
                {/* Section Header */}
                <motion.div variants={staggerItem} className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-1.5 h-8 bg-[#56B949] rounded-full"></div>
                    <div>
                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] tracking-tight">环保小贴士</h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">ECO TIPS</p>
                    </div>
                </motion.div>

                {/* Tips Cards Grid */}
                <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Card 1: Water Saving (Green Theme) */}
                    <motion.div variants={staggerItem}>
                        <motion.div
                            whileHover={hoverLift}
                            className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-[#56B949]/30 hover:bg-white/80 hover:shadow-xl hover:shadow-[#56B949]/5 transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#56B949] shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Droplets className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 rounded bg-[#56B949]/10 text-[#56B949] text-[10px] font-bold tracking-wider uppercase">TIP</span>
                            </div>
                            <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-3 tracking-tight group-hover:text-[#56B949] transition-colors">节约用水小妙招</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3">洗菜水可以浇花，洗衣水可以拖地，一水多用让每一滴水都发挥最大价值。</p>
                            <button
                                onClick={() => viewArticle('article-004')}
                                className="text-xs font-medium text-[#56B949] flex items-center gap-1 group/link mt-auto cursor-pointer hover:underline"
                            >
                                了解更多 <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Card 2: Waste Sorting (Orange Theme) */}
                    <motion.div variants={staggerItem}>
                        <motion.div
                            whileHover={hoverLift}
                            className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-[#F0A32F]/30 hover:bg-white/80 hover:shadow-xl hover:shadow-[#F0A32F]/5 transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#F0A32F] shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Recycle className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 rounded bg-[#F0A32F]/10 text-[#F0A32F] text-[10px] font-bold tracking-wider uppercase">TIP</span>
                            </div>
                            <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-3 tracking-tight group-hover:text-[#F0A32F] transition-colors">垃圾分类指南</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3">正确分类垃圾不仅能减少环境污染，还能让资源得到有效回收利用。</p>
                            <button
                                onClick={() => viewArticle('article-005')}
                                className="text-xs font-medium text-[#30499B] hover:text-[#F0A32F] flex items-center gap-1 group/link mt-auto transition-colors cursor-pointer hover:underline"
                            >
                                了解更多 <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Card 3: Energy Saving (Blue Theme) */}
                    <motion.div variants={staggerItem}>
                        <motion.div
                            whileHover={hoverLift}
                            className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-[#30499B]/30 hover:bg-white/80 hover:shadow-xl hover:shadow-[#30499B]/5 transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#30499B] shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 rounded bg-[#30499B]/10 text-[#30499B] text-[10px] font-bold tracking-wider uppercase">TIP</span>
                            </div>
                            <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-3 tracking-tight group-hover:text-[#30499B]/80 transition-colors">节能减排妙招</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3">随手关灯、使用节能电器、选择公共交通，小行动大影响。</p>
                            <button
                                onClick={() => viewArticle('article-006')}
                                className="text-xs font-medium text-[#30499B] hover:text-[#30499B]/80 flex items-center gap-1 group/link mt-auto transition-colors cursor-pointer hover:underline"
                            >
                                了解更多 <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Main Content Grid */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative"
            >
                {/* Main Column */}
                <div className="lg:col-span-12 space-y-8">
                    {/* Section Header */}
                    <motion.div variants={staggerItem} className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-[#30499B] rounded-full"></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#30499B] tracking-tight">环保新闻</h2>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Environmental News</p>
                            </div>
                        </div>
                        <button className="text-xs font-medium text-[#30499B] hover:text-[#56B949] transition-colors flex items-center gap-1 group">
                            查看全部 <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    {/* News List Container */}
                    <motion.div
                        variants={staggerItem}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-white/60 flex flex-col gap-6"
                    >
                        {/* News Item 1 */}
                        <motion.div
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="group flex flex-col sm:flex-row gap-6 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-[#56B949]/5 border border-transparent hover:border-[#56B949]/20 relative"
                        >
                            {/* Image Placeholder */}
                            <div className="w-full sm:w-56 h-36 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 overflow-hidden relative flex-shrink-0">
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-[#30499B] shadow-sm">NEWS</div>
                                <div className="w-full h-full flex items-center justify-center text-[#56B949]/40">
                                    <Zap className="w-8 h-8" />
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#30499B]/5 text-[#30499B] border border-[#30499B]/10">NEWS</span>
                                        <span className="text-[10px] text-slate-400 font-medium">2026.01.06</span>
                                    </div>
                                    <h3
                                        onClick={() => viewArticle('article-001')}
                                        className="text-lg font-serif font-semibold text-[#30499B] group-hover:text-[#56B949] transition-colors tracking-tight mb-2 cursor-pointer leading-tight"
                                    >
                                        绿色科技：未来城市的可持续能源解决方案
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pr-4">随着全球气候变暖的加剧，如何在城市发展中融入更多的绿色科技成为了关键议题。本文将探讨最新的太阳能板技术、风能利用以及智能电网在现代都市中的应用案例...</p>
                                </div>
                                <div className="flex items-center justify-between mt-4 border-t border-slate-100/50 pt-3">
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1 hover:text-[#F0A32F] transition-colors cursor-pointer">
                                            <Eye className="w-3 h-3" /> 1.2k
                                        </div>
                                        <div className="flex items-center gap-1 hover:text-[#EE4035] transition-colors cursor-pointer">
                                            <Heart className="w-3 h-3" /> 452
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => viewArticle('article-001')}
                                        className="text-xs font-medium text-[#30499B] hover:underline decoration-dotted underline-offset-4"
                                    >
                                        阅读全文
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* News Item 2 */}
                        <motion.div
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="group flex flex-col sm:flex-row gap-6 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-[#F0A32F]/5 border border-transparent hover:border-[#F0A32F]/20 relative"
                        >
                            {/* Image Placeholder */}
                            <div className="w-full sm:w-56 h-36 rounded-lg bg-gradient-to-br from-[#F0A32F]/20 to-[#EE4035]/20 overflow-hidden relative flex-shrink-0">
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-[#F0A32F] shadow-sm">REPORT</div>
                                <div className="w-full h-full flex items-center justify-center text-[#F0A32F]/40">
                                    <Waves className="w-8 h-8" />
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0A32F]/5 text-[#F0A32F] border border-[#F0A32F]/10">REPORT</span>
                                        <span className="text-[10px] text-slate-400 font-medium">2026.01.06</span>
                                    </div>
                                    <h3
                                        onClick={() => viewArticle('article-002')}
                                        className="text-lg font-serif font-semibold text-[#30499B] group-hover:text-[#F0A32F] transition-colors tracking-tight mb-2 cursor-pointer leading-tight"
                                    >
                                        海洋塑料污染：不仅仅是吸管的问题
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pr-4">每年有数百万吨塑料垃圾流入海洋，威胁着海洋生物的生存。这篇深度报道将带你了解微塑料的危害，以及各国正在采取的清理行动和减塑政策...</p>
                                </div>
                                <div className="flex items-center justify-between mt-4 border-t border-slate-100/50 pt-3">
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1 hover:text-[#F0A32F] transition-colors cursor-pointer">
                                            <Eye className="w-3 h-3" /> 856
                                        </div>
                                        <div className="flex items-center gap-1 hover:text-[#EE4035] transition-colors cursor-pointer">
                                            <Heart className="w-3 h-3" /> 210
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => viewArticle('article-002')}
                                        className="text-xs font-medium text-[#30499B] hover:underline decoration-dotted underline-offset-4"
                                    >
                                        阅读全文
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* News Item 3 */}
                        <motion.div
                            variants={staggerItem}
                            whileHover={hoverLift}
                            className="group flex flex-col sm:flex-row gap-6 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-[#56B949]/5 border border-transparent hover:border-[#56B949]/20 relative"
                        >
                            {/* Image Placeholder */}
                            <div className="w-full sm:w-56 h-36 rounded-lg bg-gradient-to-br from-[#30499B]/20 to-[#56B949]/20 overflow-hidden relative flex-shrink-0">
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-[#56B949] shadow-sm">TECH</div>
                                <div className="w-full h-full flex items-center justify-center text-[#56B949]/40">
                                    <BatteryCharging className="w-8 h-8" />
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#56B949]/5 text-[#56B949] border border-[#56B949]/10">TECH</span>
                                        <span className="text-[10px] text-slate-400 font-medium">2026.01.06</span>
                                    </div>
                                    <h3
                                        onClick={() => viewArticle('article-003')}
                                        className="text-lg font-serif font-semibold text-[#30499B] group-hover:text-[#56B949] transition-colors tracking-tight mb-2 cursor-pointer leading-tight"
                                    >
                                        电动汽车：你需要知道的电池回收知识
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pr-4">随着电动汽车的普及，废旧电池的处理成为了一个新的环保挑战。如果处理不当，电池中的重金属将造成严重污染。了解正确的回收渠道和再生技术...</p>
                                </div>
                                <div className="flex items-center justify-between mt-4 border-t border-slate-100/50 pt-3">
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1 hover:text-[#F0A32F] transition-colors cursor-pointer">
                                            <Eye className="w-3 h-3" /> 2.1k
                                        </div>
                                        <div className="flex items-center gap-1 hover:text-[#EE4035] transition-colors cursor-pointer">
                                            <Heart className="w-3 h-3" /> 134
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => viewArticle('article-003')}
                                        className="text-xs font-medium text-[#30499B] hover:underline decoration-dotted underline-offset-4"
                                    >
                                        阅读全文
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Pagination */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                className="flex justify-center items-center gap-4 py-8"
            >
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    上一页
                </button>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-[#30499B] text-white text-sm font-medium">1</button>
                    <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">2</button>
                    <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">3</button>
                    <span className="text-slate-400 px-2">...</span>
                    <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">10</button>
                </div>
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                    下一页
                </button>
            </motion.div>
        </Layout>
    );
}