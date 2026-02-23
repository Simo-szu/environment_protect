'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface UnifiedHeaderProps {
    showSearch?: boolean;
    showAuth?: boolean;
}

export default function UnifiedHeader({
    showSearch = true,
    showAuth = true
}: UnifiedHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const params = useParams();
    const { t } = useSafeTranslation('navigation');

    // 获取当前语言
    const locale = params?.locale as string || 'zh';

    // 导航项目
    const navigationItems = [
        { href: `/${locale}`, label: t('home', '首页') },
        { href: `/${locale}/science`, label: t('science', '科普') },
        { href: `/${locale}/activities`, label: t('activities', '活动') },
        { href: `/${locale}/game`, label: t('game', '游戏') },
        { href: `/${locale}/points`, label: t('points', '积分') }
    ];

    const isActivePage = (href: string) => {
        if (href === `/${locale}`) {
            return pathname === `/${locale}` || pathname === '/';
        }
        return pathname.startsWith(href);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100/60 dark:border-slate-800/60 px-4 sm:px-8 py-4 -mx-4 sm:-mx-6 md:-mx-12 mb-8 mt-4 transition-colors duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-[#56B949]/20 transform rotate-3 group-hover:rotate-6 transition-transform">
                        YL
                    </div>
                    <span className="text-[#30499B] dark:text-white font-bold text-lg sm:text-xl tracking-tight transition-colors duration-300">
                        YouthLoop
                    </span>
                </Link>

                {/* 移动端汉堡菜单按钮 */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 text-[#30499B] dark:text-[#56B949] focus:outline-none ml-auto transition-colors duration-300"
                    aria-label={t('toggleMenu', '切换菜单')}
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* 移动端菜单遮罩 & 容器 */}
                {isMobileMenuOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div className={`
                    fixed md:static top-[84px] left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0
                    w-[92%] md:w-auto max-w-md md:max-w-none
                    ${isMobileMenuOpen
                        ? 'flex flex-col bg-white/98 dark:bg-slate-900/98 p-5 shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 scale-100 opacity-100'
                        : 'hidden md:flex flex-row bg-transparent p-0 shadow-none border-none scale-95 opacity-0 md:opacity-100 md:scale-100'}
                    transition-all duration-300 z-50
                `}>
                    {/* 导航网格 */}
                    <div className="grid grid-cols-2 md:flex md:flex-row gap-3 md:gap-12 w-full md:w-auto">
                        {navigationItems.map((item) => {
                            const isActive = isActivePage(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        relative flex items-center justify-center md:justify-start px-4 py-3 md:px-0 md:py-2 rounded-xl md:rounded-none text-sm font-bold transition-all duration-300 group whitespace-nowrap
                                        ${isActive
                                            ? 'bg-[#56B949]/10 md:bg-transparent text-[#56B949] md:text-slate-900 md:dark:text-white'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 md:hover:bg-transparent'}
                                    `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span>{item.label}</span>
                                    <span className={`
                                        hidden md:block absolute bottom-0 left-0 h-[2px] bg-[#56B949] rounded-full transition-all duration-300
                                        ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}
                                    `}></span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* 移动端操作区 (语言 & 登录注册) */}
                    <div className="md:hidden flex flex-col gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-center">
                            <LanguageSwitcher />
                        </div>

                        {showAuth && (
                            <div className="mobile-auth-section grid grid-cols-2 gap-3">
                                <Link
                                    href={`/${locale}/login`}
                                    className="flex items-center justify-center text-sm font-bold text-[#30499B] dark:text-[#56B949] py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('login', '登录')}
                                </Link>
                                <Link
                                    href={`/${locale}/register`}
                                    className="flex items-center justify-center text-center text-sm px-4 py-3 rounded-xl bg-[#30499B] dark:bg-[#56B949] text-white font-bold shadow-md active:scale-95 transition-transform"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('register', '注册')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 桌面端右侧操作 */}
                <div className="hidden md:flex items-center gap-4">
                    {showSearch && (
                        <div className="hidden lg:flex items-center rounded-full px-4 py-1.5 border border-slate-200/40 dark:border-slate-700/40 focus-within:border-[#56B949]/50 focus-within:ring-2 focus-within:ring-[#56B949]/10 transition-all w-48 xl:w-64">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder', '搜索...')}
                                className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                    )}

                    {/* 语言切换器 */}
                    <LanguageSwitcher />

                    {showAuth && (
                        <div className="desktop-auth-section flex items-center gap-4">
                            <Link
                                href={`/${locale}/login`}
                                className="text-sm font-semibold text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#30499B] transition-colors"
                            >
                                {t('login', '登录')}
                            </Link>
                            <Link
                                href={`/${locale}/register`}
                                className="text-sm px-4 py-1.5 rounded-full bg-[#30499B] dark:bg-[#56B949] text-white font-medium shadow-md shadow-[#30499B]/20 dark:shadow-[#56B949]/20 hover:bg-[#253a7a] dark:hover:bg-[#4aa840] hover:scale-105 transition-all"
                            >
                                {t('register', '注册')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav >
    );
}