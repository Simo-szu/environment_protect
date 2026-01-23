import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { hoverLift } from '@/lib/animations';

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
    // 根据不同的标题设置不同的颜色
    const getIconColors = (title: string) => {
        switch (title) {
            case '我的点赞':
                return 'bg-gradient-to-br from-[#EE4035]/20 to-[#F0A32F]/20 text-[#EE4035]';
            case '我的收藏':
                return 'bg-gradient-to-br from-[#56B949]/20 to-[#30499B]/20 text-[#56B949]';
            case '我的活动':
                return 'bg-gradient-to-br from-[#F0A32F]/20 to-[#56B949]/20 text-[#F0A32F]';
            case '我的积分':
                return 'bg-gradient-to-br from-[#30499B]/20 to-[#EE4035]/20 text-[#30499B]';
            default:
                return 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600';
        }
    };

    const getDescription = (title: string) => {
        switch (title) {
            case '我的点赞':
                return '查看点赞的内容';
            case '我的收藏':
                return '查看收藏的内容';
            case '我的活动':
                return '查看参与的活动';
            case '我的积分':
                return '查看环保积分';
            default:
                return '';
        }
    };

    return (
        <motion.div
            whileHover={hoverLift}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Link
                href={href}
                className="block bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
            >
                <div className={`w-12 h-12 ${getIconColors(title)} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                <p className="text-sm text-slate-500">{getDescription(title)}</p>
            </Link>
        </motion.div>
    );
}