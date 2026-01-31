'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

export default function GamePage() {
    const params = useParams();
    const locale = params.locale as string || 'zh';
    const { t } = useSafeTranslation('game');

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-green-600 mb-4">
                            {t('title', '绿色游戏')}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {t('subtitle', '在虚拟世界中种植树木，为现实世界贡献力量')}
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-white text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                {t('virtualForest.title', '虚拟森林')}
                            </h2>
                            <p className="text-lg opacity-90">
                                {t('virtualForest.description', '每种植一棵虚拟树木，我们就在现实中种下一棵真树')}
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        {t('features.title', '游戏特色')}
                                    </h3>
                                    <ul className="space-y-3 text-gray-600">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                            {t('features.realImpact', '真实的环保影响')}
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                            {t('features.interactiveLearning', '互动式学习体验')}
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                            {t('features.communityPlanting', '社区协作种植')}
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                            {t('features.achievementSystem', '成就系统奖励')}
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        {t('stats.title', '游戏统计')}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">12,345</div>
                                            <div className="text-sm text-green-700">
                                                {t('stats.treesPlanted', '已种植树木')}
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">8,901</div>
                                            <div className="text-sm text-blue-700">
                                                {t('stats.activePlayers', '活跃玩家')}
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">156</div>
                                            <div className="text-sm text-purple-700">
                                                {t('stats.forestAreas', '森林区域')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <div className="bg-gray-100 rounded-lg p-12 mb-6">
                                    <div className="text-6xl mb-4">🎮</div>
                                    <p className="text-gray-600 mb-4">
                                        {t('comingSoon.title', '游戏即将上线')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('comingSoon.description', '我们正在开发中，敬请期待！')}
                                    </p>
                                </div>

                                <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    {t('joinWaitlist', '加入等待列表')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
