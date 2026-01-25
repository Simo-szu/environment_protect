'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Twitter, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface UnifiedFooterProps {
    showFullFooter?: boolean;
}

export default function UnifiedFooter({ showFullFooter = true }: UnifiedFooterProps) {
    const params = useParams();
    const locale = params?.locale as string || 'zh';
    const { t } = useSafeTranslation('footer');
    if (!showFullFooter) {
        return (
            <footer className="mt-16 text-center border-t border-slate-200/50 pt-8 pb-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded bg-[#30499B] text-white flex items-center justify-center text-[10px] font-serif font-bold">
                            YL
                        </div>
                        <span className="text-[#30499B] font-bold tracking-tight text-sm">
                            YouthLoop
                        </span>
                    </div>
                    <div className="flex gap-6 text-xs text-slate-500">
                        <Link href={`/${locale}/terms`} className="hover:text-[#56B949] transition-colors">
                            {t('terms', '服务协议')}
                        </Link>
                        <Link href={`/${locale}/privacy`} className="hover:text-[#56B949] transition-colors">
                            {t('privacy', '隐私政策')}
                        </Link>
                        <Link href={`/${locale}/contact`} className="hover:text-[#56B949] transition-colors">
                            {t('contact', '联系我们')}
                        </Link>
                    </div>
                    <p className="text-slate-400 text-[10px]">
                        {t('copyright', '© 2024 YouthLoop. 让绿色循环，用行动改变未来')}
                    </p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="mt-16 bg-gradient-to-b from-white to-slate-50/50 border-t border-slate-200/50 pt-12 pb-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* 主要内容区 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* 品牌信息 */}
                    <div className="md:col-span-1">
                        <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-sm shadow-lg shadow-[#56B949]/20">
                                YL
                            </div>
                            <span className="text-[#30499B] font-bold text-lg tracking-tight">
                                YouthLoop
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                            {t('description', '让绿色循环，用行动改变未来。加入我们，一起为地球环保贡献力量。')}
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#56B949] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#30499B] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#F0A32F] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* 快速链接 */}
                    <div>
                        <h4 className="text-sm font-semibold text-[#30499B] mb-4">{t('quickNav', '快速导航')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href={`/${locale}`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('home', '首页')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/science`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('science', '环保科普')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/activities`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('activities', '活动广场')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/points`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('points', '积分中心')}
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* 用户服务 */}
                    <div>
                        <h4 className="text-sm font-semibold text-[#30499B] mb-4">{t('userService', '用户服务')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href={`/${locale}/profile`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('profile', '个人中心')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/my-activities`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('myActivities', '我的活动')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/favorites`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('favorites', '我的收藏')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/likes`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('likes', '我的点赞')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/profile/edit`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('editProfile', '修改资料')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 帮助与支持 */}
                    <div>
                        <h4 className="text-sm font-semibold text-[#30499B] mb-4">{t('helpSupport', '帮助与支持')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href={`/${locale}/terms`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('terms', '服务协议')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/privacy`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('privacy', '隐私政策')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/help`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('help', '帮助中心')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/feedback`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('feedback', '意见反馈')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/contact`} className="text-slate-500 hover:text-[#56B949] transition-colors">
                                    {t('contact', '联系我们')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 联系信息 */}
                <div className="border-t border-slate-200/50 pt-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Mail className="w-4 h-4 text-[#56B949]" />
                            <span>contact@youthloop.org</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Phone className="w-4 h-4 text-[#30499B]" />
                            <span>400-123-4567</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-[#F0A32F]" />
                            <span>{t('address', '北京市朝阳区环保大厦')}</span>
                        </div>
                    </div>
                </div>

                {/* 版权信息 */}
                <div className="border-t border-slate-200/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                        <span>{t('copyrightFull', '© 2024 YouthLoop. 保留所有权利')}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{t('slogan', '让绿色循环，用行动改变未来')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>{t('icp', 'ICP备案号：京ICP备2024000001号')}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{t('police', '京公网安备 11010502000001号')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}