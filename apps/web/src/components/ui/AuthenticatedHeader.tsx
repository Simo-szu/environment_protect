'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { Menu, Search, Bell } from 'lucide-react';
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
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-[#56B949]/20 transform rotate-3">
                        YL
                    </div>
                    <span className="text-[#30499B] font-bold text-lg sm:text-xl tracking-tight">
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

                {/* 导航链接 */}
                <div className={`
          ${isMobileMenuOpen ? 'flex' : 'hidden'} 
          md:flex flex-col md:flex-row absolute md:static top-full left-0 w-full md:w-auto 
          bg-white/95 dark:bg-slate-800/95 md:bg-transparent border-b md:border-none border-slate-100 dark:border-slate-700
          p-6 md:p-0 gap-4 md:gap-8 text-sm font-medium text-slate-500 dark:text-slate-400
          shadow-xl md:shadow-none transition-all duration-300 z-50 rounded-b-2xl md:rounded-none
        `}>
                    {navigationItems.map((item) => {
                        const isActive = isActivePage(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative group py-1 transition-all duration-300 ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span>{item.label}</span>
                                <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#56B949] to-[#30499B] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                            </Link>
                        );
                    })}
                    
                    {/* 移动端显示的额外操作 */}
                    <div className="md:hidden flex flex-col gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {/* 语言切换器 - 移动端 */}
                        <LanguageSwitcher />
                        
                        {/* 用户菜单 - 移动端 */}
                        {user && isLoggedIn ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-bold">
                                        <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800 dark:text-white">{user.nickname || '用户'}</div>
                                        <div className="text-xs text-slate-500">ID: {user.userId || '12345678'}</div>
                                    </div>
                                </div>
                                <Link href={`/${locale}/profile`} className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#30499B] py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    👤 {t('profile', '个人资料')}
                                </Link>
                                <Link href={`/${locale}/my-activities`} className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#30499B] py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    📅 {t('myActivities', '我的活动')}
                                </Link>

                                {/* 主办方/管理员入口 - 根据用户角色显示 */}
                                {(isHost || isAdmin) && (
                                    <>
                                        <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                                        <Link href={`/${locale}/host/activities`} className="text-sm text-blue-600 hover:text-blue-700 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                            📋 {t('hostManagement', '活动管理')}
                                        </Link>
                                        <Link href={`/${locale}/host/verification`} className="text-sm text-indigo-600 hover:text-indigo-700 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                            🧾 {t('hostVerification', '主办方认证')}
                                        </Link>
                                    </>
                                )}

                                {/* 管理员后台 - 仅管理员可见 */}
                                {isAdmin && (
                                    <Link href={`/${locale}/admin`} className="text-sm text-purple-600 hover:text-purple-700 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                        🛡️ {t('adminPanel', '开发者后台')}
                                    </Link>
                                )}

                                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                                
                                <Link href={`/${locale}/points`} className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#30499B] py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    🪙 {t('points', '积分')}
                                </Link>
                                <Link href={`/${locale}/notifications`} className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#30499B] py-2 flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span>🔔 {t('notifications', '消息通知')}</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-[#EE4035] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                                    )}
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="text-sm text-[#EE4035] hover:text-red-600 py-2 text-left"
                                >
                                    🚪 {t('logout', '退出登录')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/${locale}/login`}
                                    className="text-sm font-semibold text-[#30499B] text-left"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('login', '登录')}
                                </Link>
                                <Link
                                    href={`/${locale}/register`}
                                    className="text-center text-sm px-4 py-2 rounded-full bg-[#30499B] text-white font-medium shadow-md shadow-[#30499B]/20"
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
                        <div className="hidden lg:flex items-center bg-white/60 rounded-full px-4 py-2 border border-slate-200/60 focus-within:border-[#30499B]/30 focus-within:bg-white transition-all w-48 xl:w-64">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder', '搜索...')}
                                className="bg-transparent border-none outline-none text-xs w-full text-[#30499B] placeholder-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400" />
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
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 py-4 opacity-0 invisible transform scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-300 z-50">
                                {/* 用户信息头部 */}
                                <div className="px-6 py-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-bold text-lg">
                                            <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800">{user.nickname || '用户'}</div>
                                            <div className="text-sm text-slate-500">
                                                <span>ID: </span><span>{user.userId || '12345678'}</span>
                                            </div>
                                            <div className="text-sm text-[#F0A32F] font-medium">
                                                <span>积分: </span><span>0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 菜单项 */}
                                <div className="py-2">
                                    <Link href={`/${locale}/profile`} className="flex items-center gap-3 px-6 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#30499B] transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">👤</div>
                                        <span className="font-medium">{t('profile', '个人资料')}</span>
                                    </Link>
                                    <Link href={`/${locale}/my-activities`} className="flex items-center gap-3 px-6 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#30499B] transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">📅</div>
                                        <span className="font-medium">{t('myActivities', '我的活动')}</span>
                                    </Link>

                                    {/* 主办方/管理员入口 - 根据用户角色显示 */}
                                    {(isHost || isAdmin) && (
                                        <>
                                            <div className="border-t border-slate-100 my-2"></div>

                                            <Link href={`/${locale}/host/activities`} className="flex items-center gap-3 px-6 py-3 text-blue-600 hover:bg-blue-50 transition-colors">
                                                <div className="w-5 h-5 flex items-center justify-center">📋</div>
                                                <span className="font-medium">{t('hostManagement', '活动管理')}</span>
                                            </Link>
                                            <Link href={`/${locale}/host/verification`} className="flex items-center gap-3 px-6 py-3 text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                <div className="w-5 h-5 flex items-center justify-center">🧾</div>
                                                <span className="font-medium">{t('hostVerification', '主办方认证')}</span>
                                            </Link>
                                        </>
                                    )}

                                    {/* 管理员后台 - 仅管理员可见 */}
                                    {isAdmin && (
                                        <Link href={`/${locale}/admin`} className="flex items-center gap-3 px-6 py-3 text-purple-600 hover:bg-purple-50 transition-colors">
                                            <div className="w-5 h-5 flex items-center justify-center">🛡️</div>
                                            <span className="font-medium">{t('adminPanel', '开发者后台')}</span>
                                        </Link>
                                    )}

                                    <div className="border-t border-slate-100 my-2"></div>
                                    
                                    <Link href={`/${locale}/points`} className="flex items-center gap-3 px-6 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#30499B] transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">🪙</div>
                                        <span className="font-medium">{t('points', '积分')}</span>
                                    </Link>
                                    <Link href={`/${locale}/notifications`} className="flex items-center gap-3 px-6 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#30499B] transition-colors">
                                        <Bell className="w-5 h-5" />
                                        <span className="font-medium">{t('notifications', '消息通知')}</span>
                                        {unreadCount > 0 && (
                                            <span className="ml-auto bg-[#EE4035] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                                        )}
                                    </Link>
                                </div>

                                {/* 退出登录 */}
                                <div className="border-t border-slate-100 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-6 py-3 text-[#EE4035] hover:bg-red-50 transition-colors"
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
        </nav>
    );
}
