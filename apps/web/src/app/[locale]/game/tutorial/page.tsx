'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import BackButton from '@/components/ui/BackButton';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { BookOpen, Target, MousePointer, RotateCcw, Flag } from 'lucide-react';

export default function GameTutorialPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <BackButton fallbackUrl={`/${locale}/game`} />
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C087]/10 text-[#00C087] text-xs font-semibold mb-4 border border-[#00C087]/20">
                        <BookOpen className="w-3 h-3" />
                        {t('tutorial.badge', '游戏教程')}
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">
                        {t('tutorial.title', '新手教程')}
                    </h1>
                    <p className="text-slate-600">
                        {t('tutorial.subtitle', '深圳低碳规划师游戏指南')}
                    </p>
                </div>

                {/* 教程内容 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                    <div className="prose prose-slate max-w-none">
                        {/* 游戏目标 */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#00C087]/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-[#00C087]" />
                                </div>
                                <h2 className="text-xl font-semibold text-[#30499B] m-0">
                                    {t('tutorial.objective.title', '游戏目标')}
                                </h2>
                            </div>
                            <div className="bg-blue-50 border-l-4 border-[#30499B] p-4 rounded-r-lg">
                                <p className="text-slate-700 leading-relaxed m-0">
                                    {t('tutorial.objective.content', '你将扮演深圳低碳城市规划师，在 15 个回合内（每回合 = 1 年），平衡"产业发展、市民需求、科技创新、生态保护"四大维度，达成核心目标：')}
                                </p>
                                <ul className="mt-3 space-y-2 text-slate-700">
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#00C087]"></span>
                                        <strong>碳排放 &lt; 100</strong>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#00C087]"></span>
                                        <strong>产业值 &gt; 50</strong>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#00C087]"></span>
                                        <strong>绿建度 &gt; 30</strong>
                                    </li>
                                </ul>
                                <p className="text-slate-600 text-sm mt-3 m-0">
                                    {t('tutorial.objective.note', '解锁优质结局；满足特定条件可冲击完美结局。')}
                                </p>
                            </div>
                        </div>

                        {/* 核心操作指南 */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#56B949]/10 flex items-center justify-center">
                                    <MousePointer className="w-5 h-5 text-[#56B949]" />
                                </div>
                                <h2 className="text-xl font-semibold text-[#30499B] m-0">
                                    {t('tutorial.operations.title', '核心操作指南')}
                                </h2>
                            </div>

                            {/* 1. 卡牌部署 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-[#30499B] mb-3">
                                    1. {t('tutorial.operations.deploy.title', '卡牌部署')}
                                </h3>
                                <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#56B949] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">●</span>
                                        <p className="text-slate-700 m-0">
                                            {t('tutorial.operations.deploy.step1', '点击卡牌可放大查看完整详情（消耗资源、效果、碳排放影响）')}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#56B949] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">●</span>
                                        <p className="text-slate-700 m-0">
                                            {t('tutorial.operations.deploy.step2', '若资源满足要求，可点击"部署"消耗资源激活，激活后卡牌会亮起，直接将卡牌拖动到对应区域即可生效')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. 卡牌回收 / 丢弃 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-[#30499B] mb-3">
                                    2. {t('tutorial.operations.recycle.title', '卡牌回收 / 丢弃')}
                                </h3>
                                <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#F0A32F] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">●</span>
                                        <p className="text-slate-700 m-0">
                                            <strong>{t('tutorial.operations.recycle.recycle', '回收：')}</strong>
                                            {t('tutorial.operations.recycle.recycleDesc', '点击底部"卡牌回收"按钮，再点击任意产业类卡牌，即可转化为 2 产业值（循环经济机制）')}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#F0A32F] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">●</span>
                                        <p className="text-slate-700 m-0">
                                            <strong>{t('tutorial.operations.recycle.discard', '丢弃：')}</strong>
                                            {t('tutorial.operations.recycle.discardDesc', '长按卡牌拖拽至屏幕边缘，松开后确认即可')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 3. 结束回合 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-[#30499B] mb-3">
                                    3. {t('tutorial.operations.endTurn.title', '结束回合')}
                                </h3>
                                <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#30499B] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">●</span>
                                        <p className="text-slate-700 m-0">
                                            {t('tutorial.operations.endTurn.step1', '部署完卡牌后，点击"下一回合"，系统会自动结算本回合资源（持续产出 / 消耗）')}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#30499B] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">●</span>
                                        <p className="text-slate-700 m-0">
                                            {t('tutorial.operations.endTurn.step2', '结算后发放下回合新卡牌，进度条同步推进')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 关键提示 */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#EE4035]/10 flex items-center justify-center">
                                    <Flag className="w-5 h-5 text-[#EE4035]" />
                                </div>
                                <h2 className="text-xl font-semibold text-[#30499B] m-0">
                                    {t('tutorial.tips.title', '关键提示')}
                                </h2>
                            </div>
                            <div className="bg-amber-50 border-l-4 border-[#F0A32F] p-4 rounded-r-lg">
                                <ul className="space-y-2 text-slate-700 m-0">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0A32F] font-bold">•</span>
                                        <span>{t('tutorial.tips.tip1', '每个回合都要关注碳排放指标，避免超标')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0A32F] font-bold">•</span>
                                        <span>{t('tutorial.tips.tip2', '平衡四大维度发展，不要过度偏重某一方面')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0A32F] font-bold">•</span>
                                        <span>{t('tutorial.tips.tip3', '合理利用卡牌回收机制，转化不需要的卡牌为资源')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0A32F] font-bold">•</span>
                                        <span>{t('tutorial.tips.tip4', '科技创新卡牌可以解锁更高效的发展路径')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0A32F] font-bold">•</span>
                                        <span>{t('tutorial.tips.tip5', '生态保护投入虽然短期成本高，但长期收益显著')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 开始游戏 */}
                        <div className="text-center pt-6 border-t border-slate-200">
                            <p className="text-slate-600 mb-4">
                                {t('tutorial.ready', '准备好开始你的低碳规划之旅了吗？')}
                            </p>
                            <a
                                href={`/${locale}/game/play`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00C087] hover:bg-[#00a870] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <RotateCcw className="w-4 h-4" />
                                {t('tutorial.startGame', '开始游戏')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
