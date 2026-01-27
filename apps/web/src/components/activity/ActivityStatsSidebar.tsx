'use client';

import { useState, useEffect } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { activityApi } from '@/lib/api';
import type { ActivitySummaryDTO, ActivityCategoryCountDTO } from '@/lib/api/activity';
import { Trees, TreePine, Leaf, Sprout } from 'lucide-react';

export default function ActivityStatsSidebar() {
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
                    activityApi.getPopularActivityCategories(month, 3)
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
                <h3 className="text-lg font-serif font-bold text-[#30499B] mb-4">
                    {t('stats.title', '活动统计')}
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            {t('stats.monthlyActivities', '本月活动')}
                        </span>
                        <span className="text-lg font-bold text-[#56B949]">
                            {loading ? '...' : (summary?.monthlyActivityCount?.toLocaleString() ?? '-')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            {t('stats.participants', '参与人数')}
                        </span>
                        <span className="text-lg font-bold text-[#30499B]">
                            {loading ? '...' : (summary?.monthlyParticipantCount?.toLocaleString() ?? '-')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            {t('stats.myRegistrations', '我的报名')}
                        </span>
                        <span className="text-lg font-bold text-[#F0A32F]">
                            {loading ? '...' : (summary?.myRegistrationCount?.toLocaleString() ?? '-')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
                <h3 className="text-lg font-serif font-bold text-[#30499B] mb-4">
                    {t('categories.title', '热门分类')}
                </h3>
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-sm text-slate-400">Loading...</div>
                    ) : categories.length > 0 ? (
                        categories.map((cat, index) => (
                            <div key={cat.category} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    {/* Rotate icons for variety */}
                                    {index % 3 === 0 && <Trees className="w-4 h-4 text-[#56B949]" />}
                                    {index % 3 === 1 && <Leaf className="w-4 h-4 text-[#30499B]" />}
                                    {index % 3 === 2 && <Sprout className="w-4 h-4 text-[#F0A32F]" />}
                                </div>
                                <span className="text-sm text-slate-600">
                                    {t(`categories.${activityApi.mapCategory(cat.category)}`)}
                                </span>
                                <span className="ml-auto text-xs text-slate-400">{cat.activityCount}</span>
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
