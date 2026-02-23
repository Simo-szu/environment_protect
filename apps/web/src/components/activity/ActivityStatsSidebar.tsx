'use client';

import { useState, useEffect } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { activityApi } from '@/lib/api';
import type { ActivitySummaryDTO, ActivityCategoryCountDTO } from '@/lib/api/activity';
import { Trees, TreePine, Leaf, Sprout, Heart, Users, Music, Trophy, Cpu, Palette, Sun } from 'lucide-react';

interface ActivityStatsSidebarProps {
    onCategorySelect?: (categoryId: number) => void;
}

export default function ActivityStatsSidebar({ onCategorySelect }: ActivityStatsSidebarProps) {
    const { t } = useSafeTranslation('activities');
    const [summary, setSummary] = useState<ActivitySummaryDTO | null>(null);
    const [categories, setCategories] = useState<ActivityCategoryCountDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                const now = new Date();
                const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                const [s, c] = await Promise.all([
                    activityApi.getActivitySummary(month),
                    activityApi.getPopularActivityCategories(month, 1, 3)
                ]);
                setSummary(s);
                setCategories(c);
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60 dark:border-slate-700">
                <h3 className="text-lg font-serif font-bold text-[#30499B] dark:text-[#56B949] mb-4">
                    {t('stats.title', '活动统计')}
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {t('stats.monthlyActivities', '本月活动')}
                        </span>
                        <span className="text-lg font-bold text-[#56B949]">
                            {loading ? '...' : (summary?.monthlyActivityCount?.toLocaleString() ?? '-')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {t('stats.participants', '参与人数')}
                        </span>
                        <span className="text-lg font-bold text-[#30499B] dark:text-slate-200">
                            {loading ? '...' : (summary?.monthlyParticipantCount?.toLocaleString() ?? '-')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {t('stats.myRegistrations', '我的报名')}
                        </span>
                        <span className="text-lg font-bold text-[#F0A32F]">
                            {loading ? '...' : (summary?.myRegistrationCount?.toLocaleString() ?? '-')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60 dark:border-slate-700">
                <h3 className="text-lg font-serif font-bold text-[#30499B] dark:text-[#56B949] mb-4">
                    {t('categories.title', '热门分类')}
                </h3>
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-sm text-slate-400">Loading...</div>
                    ) : categories.length > 0 ? (
                        categories.map((cat, index) => (
                            <div
                                key={cat.category}
                                onClick={() => onCategorySelect?.(cat.category)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-600 transition-colors shadow-sm border border-slate-100/50 dark:border-slate-600">
                                    {/* Rotate icons for variety */}
                                    {cat.category === 1 && <Trees className="w-4 h-4 text-[#56B949]" />}
                                    {cat.category === 2 && <Heart className="w-4 h-4 text-[#EE4035]" />}
                                    {cat.category === 3 && <Users className="w-4 h-4 text-[#30499B]" />}
                                    {cat.category === 4 && <Music className="w-4 h-4 text-[#F0A32F]" />}
                                    {cat.category === 5 && <Trophy className="w-4 h-4 text-[#56B949]" />}
                                    {cat.category === 6 && <Cpu className="w-4 h-4 text-[#30499B]" />}
                                    {cat.category === 7 && <Palette className="w-4 h-4 text-[#F0A32F]" />}
                                    {cat.category === 8 && <Sun className="w-4 h-4 text-[#56B949]" />}
                                    {cat.category > 8 && <Leaf className="w-4 h-4 text-slate-400" />}
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    {t(`categories.${activityApi.mapCategory(cat.category)}`)}
                                </span>
                                <span className="ml-auto text-xs text-slate-400 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-700 px-2 py-0.5 rounded-full">{cat.activityCount}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-slate-400">-</div>
                    )}
                </div>
            </div>
        </div>
    );
}
