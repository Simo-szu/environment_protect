import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { hoverLift } from '@/lib/animations';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface QuickActionCardProps {
    href: string;
    icon: LucideIcon;
    title: string;
}

export default function QuickActionCard({
    href,
    icon: Icon,
    title
}: QuickActionCardProps) {
    const { t } = useSafeTranslation('profile');

    const type = href.includes('/likes') ? 'likes' :
        href.includes('/favorites') ? 'favorites' :
            href.includes('/my-activities') ? 'activities' :
                href.includes('/points') ? 'points' : 'default';

    const getIconColors = (type: string) => {
        switch (type) {
            case 'likes':
                return 'bg-gradient-to-br from-[#EE4035]/20 to-[#F0A32F]/20 text-[#EE4035] dark:from-[#EE4035]/30 dark:to-[#F0A32F]/30 dark:text-[#FF6B6B]';
            case 'favorites':
                return 'bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 text-[#56B949] dark:from-[#56B949]/30 dark:to-[#30499B]/30 dark:text-[#6BD95C]';
            case 'activities':
                return 'bg-gradient-to-br from-[#F0A32F]/20 to-[#56B949]/20 text-[#F0A32F] dark:from-[#F0A32F]/30 dark:to-[#56B949]/30 dark:text-[#FBBF54]';
            case 'points':
                return 'bg-gradient-to-br from-[#30499B]/20 to-[#EE4035]/20 text-[#30499B] dark:from-[#30499B]/30 dark:to-[#EE4035]/30 dark:text-[#507EE8]';
            default:
                return 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-400';
        }
    };

    const getDescription = (type: string) => {
        switch (type) {
            case 'likes':
                return t('quickActions.descLikes', '查看点赞的内容');
            case 'favorites':
                return t('quickActions.descFavorites', '查看收藏的内容');
            case 'activities':
                return t('quickActions.descActivities', '查看参与的活动');
            case 'points':
                return t('quickActions.descPoints', '查看环保积分');
            default:
                return '';
        }
    };

    return (
        <motion.div
            whileHover={hoverLift}
            transition={{ type: 'spring', stiffness: 300 }}
            className="h-full"
        >
            <Link
                href={href}
                className="block h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 dark:border-slate-700 shadow-lg hover:shadow-xl dark:shadow-slate-900/50 transition-all duration-300 text-center"
            >
                <div className={`w-12 h-12 ${getIconColors(type)} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{getDescription(type)}</p>
            </Link>
        </motion.div>
    );
}