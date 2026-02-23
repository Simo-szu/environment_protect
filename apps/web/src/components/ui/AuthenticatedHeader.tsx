'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { Menu, Search, Bell, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface AuthenticatedHeaderProps {
    showSearch?: boolean;
}

export default function AuthenticatedHeader({ showSearch = true }: AuthenticatedHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const { user, logout, isLoggedIn } = useAuth();
    const { unreadCount } = useNotifications();
    const { t } = useSafeTranslation('navigation');

    // 获取当前语言
    const locale = params?.locale as string || 'zh';

    // 导航项目
    const navigationItems = [
        { href: `/${locale}`, label: t('home', '首页'), color: '#30499B' },
        { href: `/${locale}/science`, label: t('science', '科普'), color: '#F0A32F' },
        { href: `/${locale}/activities`, label: t('activities', '活动'), color: '#30499B' },
        { href: `/${locale}/game`, label: t('game', '游戏'), color: '#56B949' },
        { href: `/${locale}/points`, label: t('points', '积分'), color: '#EE4035' }
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

    const handleLogout = () => {
        logout();
        router.push(`/${locale}`);
    };

    // 检查用户角色
    const userRole = user?.role || 1; // 默认为普通用户
    const isHost = userRole >= 2; // HOST(2) 或 ADMIN(3)
    const isAdmin = userRole === 3; // ADMIN(3)

    return (
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-white/20 dark:border-slate-700/20 px-8 py-4 rounded-b-[2rem] shadow-2xl shadow-black/5 transition-all duration-500 ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-[#56B949]/20 transform rotate-3 group-hover:rotate-6 transition-transform">
                        YL
                    </div>
                    <span className="text-[#30499B] dark:text-white font-bold text-lg sm:text-xl tracking-tight">
                        YouthLoop
                    </span>
                </Link>

                {/* 移动端汉堡菜单按钮 */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 text-[#30499B] focus:outline-none ml-auto"
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
                    w-[92%] md:w-auto max-w-sm md:max-w-none
                    ${isMobileMenuOpen
                        ? 'flex flex-col bg-white/98 dark:bg-slate-900/98 p-6 shadow-2xl rounded-[2.5rem] border border-white/20 dark:border-slate-700/50 scale-100 opacity-100'
                        : 'hidden md:flex flex-row bg-transparent p-0 shadow-none border-none scale-95 opacity-0 md:opacity-100 md:scale-100'}
                    transition-all duration-300 z-50
                `}>
                    {/* 移动端关闭按钮 */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {/* 移动端用户信息头部 */}
                    {user && isLoggedIn && (
                        <div className="md:hidden w-full flex items-center gap-4 p-5 mb-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100/50 dark:border-slate-700/30">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#56B949] to-[#30499B] flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 transform -rotate-3">
                                {user.nickname?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-bold text-lg text-slate-800 dark:text-white truncate tracking-tight">{user.nickname || '用户'}</div>
                                <div className="text-sm text-[#F0A32F] font-semibold flex items-center gap-1.5 opacity-90">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F0A32F]"></span>
                                    积分: 0
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 导航网格 (移动端 1列, 桌面端 1行) */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-12 w-full md:w-auto">
                        {navigationItems.map((item) => {
                            const isActive = isActivePage(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        relative flex items-center justify-center md:justify-start px-6 py-4 md:px-0 md:py-2 rounded-2xl md:rounded-none text-base md:text-sm font-bold transition-all duration-300 group
                                        ${isActive
                                            ? 'bg-[#56B949]/10 md:bg-transparent text-[#56B949] md:text-slate-900 md:dark:text-white shadow-sm md:shadow-none'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 md:hover:bg-transparent'}
                                    `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span>{item.label}</span>
                                    <span className={`
                                        hidden md:block absolute bottom-0 left-0 h-[2.5px] bg-[#56B949] rounded-full transition-all duration-300
                                        ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}
                                    `}></span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* 移动端操作区 (主办方/开发者入口) */}
                    <div className="md:hidden flex flex-col gap-3 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800">
                        {(isHost || isAdmin) && (
                            <div className="flex flex-col gap-2">
                                <Link href={`/${locale}/host/activities`} className="flex items-center justify-center px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-2xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t('hostManagement', '活动管理')}
                                </Link>
                                {isAdmin && (
                                    <Link href={`/${locale}/admin`} className="flex items-center justify-center px-4 py-3 bg-purple-50/50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 rounded-2xl text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        {t('adminPanel', '开发者后台')}
                                    </Link>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 px-1 mt-2">
                            <LanguageSwitcher />
                            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-sm font-bold text-red-500/80 hover:text-red-600 px-4 py-2 transition-colors">
                                退出登录
                            </button>
                        </div>
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

                    {/* 用户区域 */}
                    {user && isLoggedIn ? (
                        <div className="relative group">
                            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}</span>
                            </button>

                            {/* 悬停下拉菜单 */}
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 dark:border-slate-700 py-4 opacity-0 invisible transform scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-300 z-50">
                                {/* 用户信息头部 */}
                                <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-bold text-lg">
                                            <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{user.nickname || '用户'}</div>
                                            <div className="text-sm text-[#F0A32F] font-medium">
                                                <span>积分: </span><span>0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 菜单项 */}
                                <div className="py-2">
                                    <Link href={`/${locale}/profile`} className="flex items-center gap-3 px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#30499B] dark:hover:text-white transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">👤</div>
                                        <span className="font-medium">{t('profile', '个人资料')}</span>
                                    </Link>
                                    <Link href={`/${locale}/my-activities`} className="flex items-center gap-3 px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#30499B] dark:hover:text-white transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">📅</div>
                                        <span className="font-medium">{t('myActivities', '我的活动')}</span>
                                    </Link>

                                    {/* 主办方/管理员入口 - 根据用户角色显示 */}
                                    {(isHost || isAdmin) && (
                                        <>
                                            <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>

                                            <Link href={`/${locale}/host/activities`} className="flex items-center gap-3 px-6 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                                <div className="w-5 h-5 flex items-center justify-center">📋</div>
                                                <span className="font-medium">{t('hostManagement', '活动管理')}</span>
                                            </Link>
                                            <Link href={`/${locale}/host/verification`} className="flex items-center gap-3 px-6 py-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                <div className="w-5 h-5 flex items-center justify-center">🧾</div>
                                                <span className="font-medium">{t('hostVerification', '主办方认证')}</span>
                                            </Link>
                                        </>
                                    )}

                                    {/* 管理员后台 - 仅管理员可见 */}
                                    {isAdmin && (
                                        <Link href={`/${locale}/admin`} className="flex items-center gap-3 px-6 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
                                            <div className="w-5 h-5 flex items-center justify-center">🛡️</div>
                                            <span className="font-medium">{t('adminPanel', '开发者后台')}</span>
                                        </Link>
                                    )}

                                    <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>

                                    <Link href={`/${locale}/points`} className="flex items-center gap-3 px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#30499B] dark:hover:text-white transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">🪙</div>
                                        <span className="font-medium">{t('points', '积分')}</span>
                                    </Link>
                                    <Link href={`/${locale}/notifications`} className="flex items-center gap-3 px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#30499B] dark:hover:text-white transition-colors">
                                        <Bell className="w-5 h-5" />
                                        <span className="font-medium">{t('notifications', '消息通知')}</span>
                                        {unreadCount > 0 && (
                                            <span className="ml-auto bg-[#EE4035] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                                        )}
                                    </Link>
                                </div>

                                {/* 退出登录 */}
                                <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-6 py-3 text-[#EE4035] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">🚪</div>
                                        <span className="font-medium">{t('logout', '退出登录')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/${locale}/login`}
                                className="text-sm font-semibold text-[#30499B] hover:text-[#56B949] transition-colors"
                            >
                                {t('login', '登录')}
                            </Link>
                            <Link
                                href={`/${locale}/register`}
                                className="text-sm px-4 py-1.5 rounded-full bg-[#30499B] text-white font-medium shadow-md shadow-[#30499B]/20 hover:bg-[#253a7a] hover:scale-105 transition-all"
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
