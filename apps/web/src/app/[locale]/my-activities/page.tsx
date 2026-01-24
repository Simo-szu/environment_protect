'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import Layout from '@/components/Layout';
import Pagination from '@/components/ui/Pagination';
import {
    CalendarCheck,
    CalendarHeart,
    Trophy,
    Clock,
    Star,
    Calendar,
    MapPin,
    Leaf,
    Recycle,
    Droplets,
    CalendarPlus,
    CheckCircle,
    Trees,
    Wind
} from 'lucide-react';

interface Activity {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    status: 'registered' | 'ongoing' | 'completed';
    points?: number;
    registrationDate?: string;
    completionDate?: string;
    icon: React.ComponentType<any>;
    category: string;
}

// 生成模拟活动数据
const generateMockActivities = (): Activity[] => {
    const activities: Activity[] = [
        {
            id: 'activity-001',
            title: '城市绿洲：周末社区花园种植计划',
            description: '加入我们在市中心创建绿色角落的行动。我们将一起种植本土花卉，学习堆肥知识...',
            date: '2024年5月20日',
            time: '09:00-17:00',
            location: '市中心社区公园',
            status: 'registered',
            registrationDate: '2024-05-15',
            icon: Leaf,
            category: '植树造林'
        },
        {
            id: 'activity-002',
            title: '旧物新生：创意环保DIY工作坊',
            description: '不要扔掉你的旧T恤和玻璃瓶！在这个工作坊中，艺术家将教你如何将废弃物品变废为宝...',
            date: '2024年5月22日',
            time: '14:00-17:00',
            location: '创意工作室',
            status: 'completed',
            points: 50,
            completionDate: '2024-05-22',
            icon: Recycle,
            category: '废物利用'
        },
        {
            id: 'activity-003',
            title: '海洋守护者：海滩清洁行动',
            description: '保护我们的海洋环境，清理海滩垃圾，了解海洋污染的危害...',
            date: '2024年6月1日',
            time: '08:00-12:00',
            location: '阳光海滩',
            status: 'ongoing',
            registrationDate: '2024-05-25',
            icon: Droplets,
            category: '环境清洁'
        }
    ];

    // 生成更多模拟数据
    const additionalActivities: Activity[] = [];
    const titles = [
        '绿色出行：自行车环城骑行',
        '节能减排：家庭节能讲座',
        '垃圾分类：社区分类指导',
        '生态保护：湿地观鸟活动',
        '清洁能源：太阳能体验',
        '有机农业：城市农场参观',
        '环保手工：废纸制作艺术品',
        '绿色建筑：可持续建筑参观',
        '水资源保护：节水技术展示',
        '空气质量：植物净化空气实验'
    ];

    const locations = ['市中心公园', '社区活动中心', '环保教育基地', '科技馆', '大学校园', '生态园区'];
    const icons = [Leaf, Recycle, Droplets, Trees, Wind, CalendarCheck];
    const categories = ['植树造林', '废物利用', '环境清洁', '节能减排', '生态保护', '环保教育'];
    const statuses: ('registered' | 'ongoing' | 'completed')[] = ['registered', 'ongoing', 'completed'];

    for (let i = 4; i <= 28; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const title = titles[Math.floor(Math.random() * titles.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const icon = icons[Math.floor(Math.random() * icons.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];

        additionalActivities.push({
            id: `activity-${i.toString().padStart(3, '0')}`,
            title,
            description: `${title}的详细描述，包含活动内容、目标和预期效果...`,
            date: `2024年${Math.floor(Math.random() * 6) + 5}月${Math.floor(Math.random() * 28) + 1}日`,
            time: `${Math.floor(Math.random() * 12) + 8}:00-${Math.floor(Math.random() * 6) + 15}:00`,
            location,
            status,
            points: status === 'completed' ? Math.floor(Math.random() * 80) + 20 : undefined,
            registrationDate: `2024-0${Math.floor(Math.random() * 2) + 4}-${Math.floor(Math.random() * 28) + 1}`,
            completionDate: status === 'completed' ? `2024-0${Math.floor(Math.random() * 2) + 5}-${Math.floor(Math.random() * 28) + 1}` : undefined,
            icon,
            category
        });
    }

    return [...activities, ...additionalActivities];
};

export default function MyActivitiesPage() {
    const { user, isLoggedIn, loading } = useAuth();
    const { t } = useSafeTranslation('myActivities');
    const params = useParams();
    const locale = params?.locale as string || 'zh';
    const [activeTab, setActiveTab] = useState('all');
    const [allActivities] = useState<Activity[]>(generateMockActivities());
    const [currentPage, setCurrentPage] = useState(1);
    const [activitiesPerPage] = useState(4); // 每页显示4个活动

    useEffect(() => {
        if (!loading && (!user || !isLoggedIn)) {
            window.location.href = `/${locale}/login`;
            return;
        }
    }, [user, isLoggedIn, loading, locale]);

    const switchTab = (tabName: string) => {
        setActiveTab(tabName);
        setCurrentPage(1); // 重置到第一页
    };

    // 过滤活动
    const filteredActivities = allActivities.filter(activity => {
        if (activeTab === 'all') return true;
        return activity.status === activeTab;
    });

    // 分页逻辑
    const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
    const startIndex = (currentPage - 1) * activitiesPerPage;
    const endIndex = startIndex + activitiesPerPage;
    const currentActivities = filteredActivities.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // 滚动到内容区域
        document.querySelector('.tab-content')?.scrollIntoView({ behavior: 'smooth' });
    };

    // 统计数据
    const registeredCount = allActivities.filter(a => a.status === 'registered').length;
    const ongoingCount = allActivities.filter(a => a.status === 'ongoing').length;
    const completedCount = allActivities.filter(a => a.status === 'completed').length;
    const totalPoints = allActivities.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.points || 0), 0);

    const viewActivityDetails = () => {
        console.log('查看活动详情');
    };

    const cancelRegistration = () => {
        if (confirm('确定要取消报名吗？')) {
            console.log('取消报名');
            alert('报名已取消');
        }
    };

    const rateActivity = () => {
        alert('评价功能开发中...');
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">加载中...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user || !isLoggedIn) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                            YL
                        </div>
                        <p className="text-slate-600">跳转到登录页面...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 text-[#30499B] rounded-full text-sm font-semibold mb-4 border border-[#56B949]/20">
                        <CalendarHeart className="w-4 h-4" />
                        {t('badge', '活动管理')}
                    </div>
                    <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">{t('title', '我的活动中心')}</h2>
                    <p className="text-slate-500">{t('description', '管理您参与的所有环保活动')}</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#56B949] to-[#4aa840] rounded-full flex items-center justify-center mx-auto mb-3">
                            <CalendarCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-[#56B949] mb-1">{registeredCount}</div>
                        <div className="text-sm text-slate-500">{t('stats.registered', '已报名活动')}</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#F0A32F] to-[#e67e22] rounded-full flex items-center justify-center mx-auto mb-3">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-[#F0A32F] mb-1">{completedCount}</div>
                        <div className="text-sm text-slate-500">{t('stats.completed', '已完成活动')}</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#30499B] to-[#253a7a] rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-[#30499B] mb-1">{ongoingCount}</div>
                        <div className="text-sm text-slate-500">{t('stats.ongoing', '进行中活动')}</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#EE4035] to-[#d63031] rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-[#EE4035] mb-1">{totalPoints}</div>
                        <div className="text-sm text-slate-500">{t('stats.points', '获得积分')}</div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden mb-8">
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => switchTab('all')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'all'
                                ? 'text-[#30499B] bg-slate-50'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            {t('tabs.all', '全部活动')}
                            {activeTab === 'all' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                            )}
                        </button>
                        <button
                            onClick={() => switchTab('registered')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'registered'
                                ? 'text-[#30499B] bg-slate-50'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            {t('tabs.registered', '已报名')}
                            {activeTab === 'registered' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                            )}
                        </button>
                        <button
                            onClick={() => switchTab('ongoing')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'ongoing'
                                ? 'text-[#30499B] bg-slate-50'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            {t('tabs.ongoing', '进行中')}
                            {activeTab === 'ongoing' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                            )}
                        </button>
                        <button
                            onClick={() => switchTab('completed')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'completed'
                                ? 'text-[#30499B] bg-slate-50'
                                : 'text-slate-600 hover:text-[#30499B]'
                                }`}
                        >
                            {t('tabs.completed', '已完成')}
                            {activeTab === 'completed' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#F0A32F]"></div>
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 tab-content">
                        <div className="space-y-6">
                            {currentActivities.map((activity) => {
                                const IconComponent = activity.icon;
                                return (
                                    <div key={activity.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Activity Image */}
                                            <div className="w-full md:w-48 h-32 rounded-lg bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 flex items-center justify-center flex-shrink-0">
                                                <IconComponent className="w-12 h-12 text-[#56B949]/40" />
                                            </div>
                                            {/* Activity Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-serif font-semibold text-[#30499B] dark:text-[#56B949] mb-2">{activity.title}</h3>
                                                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {activity.date} {activity.time}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {activity.location}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.status === 'registered' ? 'bg-gradient-to-r from-[#56B949] to-[#4aa840] text-white' :
                                                        activity.status === 'ongoing' ? 'bg-gradient-to-r from-[#F0A32F] to-[#e67e22] text-white' :
                                                            'bg-gradient-to-r from-[#30499B] to-[#253a7a] text-white'
                                                        }`}>
                                                        {activity.status === 'registered' ? '已报名' :
                                                            activity.status === 'ongoing' ? '进行中' : '已完成'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{activity.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                                        {activity.registrationDate && <span>报名时间: {activity.registrationDate}</span>}
                                                        {activity.completionDate && <span>完成时间: {activity.completionDate}</span>}
                                                        {activity.points && <span className="text-[#F0A32F]">获得积分: +{activity.points}</span>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => viewActivityDetails()}
                                                            className="px-4 py-2 text-[#30499B] dark:text-[#56B949] border border-[#30499B] dark:border-[#56B949] rounded-lg hover:bg-[#30499B] dark:hover:bg-[#56B949] hover:text-white transition-colors text-sm"
                                                        >
                                                            查看详情
                                                        </button>
                                                        {activity.status === 'registered' && (
                                                            <button
                                                                onClick={() => cancelRegistration()}
                                                                className="px-4 py-2 text-[#EE4035] border border-[#EE4035] rounded-lg hover:bg-[#EE4035] hover:text-white transition-colors text-sm"
                                                            >
                                                                取消报名
                                                            </button>
                                                        )}
                                                        {activity.status === 'completed' && (
                                                            <button
                                                                onClick={() => rateActivity()}
                                                                className="px-4 py-2 bg-[#F0A32F] text-white rounded-lg hover:bg-[#e67e22] transition-colors text-sm"
                                                            >
                                                                评价活动
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty State */}
                            {currentActivities.length === 0 && (
                                <div className="text-center py-12">
                                    <CalendarPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                                        {activeTab === 'registered' ? '暂无已报名活动' :
                                            activeTab === 'ongoing' ? '暂无进行中活动' :
                                                activeTab === 'completed' ? '暂无已完成活动' : '暂无活动'}
                                    </h3>
                                    <p className="text-slate-400">
                                        {activeTab === 'registered' ? '您还没有报名任何活动' :
                                            activeTab === 'ongoing' ? '您目前没有正在进行的活动' :
                                                activeTab === 'completed' ? '您还没有完成任何活动' : '暂无相关活动'}
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {currentActivities.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}