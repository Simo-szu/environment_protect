'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { Bell, Menu, Search, X } from 'lucide-react';
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

    const locale = params?.locale as string || 'zh';

    const navigationItems = [
        { href: `/${locale}`, label: t('home', 'Home'), color: '#30499B' },
        { href: `/${locale}/game`, label: t('game', 'Game'), color: '#56B949' },
        { href: `/${locale}/science`, label: t('science', 'Science'), color: '#F0A32F' },
        { href: `/${locale}/activities`, label: t('activities', 'Activities'), color: '#30499B' },
        { href: `/${locale}/points`, label: t('points', 'Points'), color: '#EE4035' }
    ];

    const isActivePage = (href: string) => {
        if (href === `/${locale}`) {
            return pathname === `/${locale}` || pathname === '/';
        }

        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        router.push(`/${locale}`);
    };

    const userRole = user?.role || 1;
    const isHost = userRole >= 2;
    const isAdmin = userRole === 3;

    return (
        <nav className="mt-4 rounded-[1.75rem] border border-white/70 bg-white/78 px-5 py-4 shadow-[0_24px_70px_-40px_rgba(22,101,52,0.28)] backdrop-blur-2xl ring-1 ring-[#30499B]/5 transition-all duration-500 dark:border-white/10 dark:bg-slate-900/78 dark:shadow-none dark:ring-white/10 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <Link href={`/${locale}`} className="group flex items-center gap-2">
                    <Image
                        src="/assets/branding/youthloop-logo.jpg"
                        alt="YouthLoop logo"
                        width={44}
                        height={44}
                        className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.03] sm:h-10"
                        priority
                    />
                    <span className="text-lg font-bold tracking-tight text-[#30499B] dark:text-white sm:text-xl">
                        YouthLoop
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="ml-auto p-2 text-[#30499B] focus:outline-none md:hidden"
                    aria-label={t('toggleMenu', 'Toggle Menu')}
                >
                    <Menu className="w-6 h-6" />
                </button>

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div
                    className={`
                    fixed left-1/2 top-[84px] z-50 w-[92%] max-w-sm -translate-x-1/2 transition-all duration-300 md:static md:left-auto md:w-auto md:max-w-none md:translate-x-0
                    ${isMobileMenuOpen
                        ? 'flex flex-col rounded-[2.5rem] border border-white/20 bg-white/98 p-6 opacity-100 shadow-2xl dark:border-slate-700/50 dark:bg-slate-900/98'
                        : 'hidden scale-95 opacity-0 md:flex md:scale-100 md:flex-row md:border-none md:bg-transparent md:p-0 md:opacity-100 md:shadow-none'}
                `}
                >
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute right-4 top-4 p-2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {user && isLoggedIn && (
                        <div className="mb-6 flex w-full items-center gap-4 rounded-3xl border border-slate-100/50 bg-slate-50 p-5 dark:border-slate-700/30 dark:bg-slate-800/40 md:hidden">
                            <div className="flex h-14 w-14 flex-shrink-0 rotate-[-3deg] items-center justify-center rounded-2xl bg-gradient-to-br from-[#56B949] to-[#30499B] text-xl font-bold text-white shadow-lg">
                                {user.nickname?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <div className="truncate text-lg font-bold tracking-tight text-slate-800 dark:text-white">
                                    {user.nickname || 'User'}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F0A32F] opacity-90">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#F0A32F]"></span>
                                    <span>Points: 0</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:gap-12">
                        {navigationItems.map((item) => {
                            const isActive = isActivePage(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        group relative flex items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-300 md:justify-start md:rounded-none md:px-0 md:py-2 md:text-sm
                                        ${isActive
                                            ? 'bg-[#56B949]/10 text-[#30499B] shadow-sm dark:text-white md:bg-transparent md:text-[#30499B] md:shadow-none'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-[#30499B] dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white md:hover:bg-transparent'}
                                    `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span>{item.label}</span>
                                    <span
                                        className={`
                                            absolute bottom-0 left-0 hidden h-[2.5px] rounded-full bg-gradient-to-r from-[#56B949] to-[#30499B] transition-all duration-300 md:block
                                            ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}
                                        `}
                                    ></span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/60 pt-6 dark:border-slate-800 md:hidden">
                        {(isHost || isAdmin) && (
                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/${locale}/host/activities`}
                                    className="flex items-center justify-center rounded-2xl bg-blue-50/50 px-4 py-3 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('hostManagement', 'Activity Management')}
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href={`/${locale}/admin`}
                                        className="flex items-center justify-center rounded-2xl bg-purple-50/50 px-4 py-3 text-sm font-bold text-purple-600 transition-colors hover:bg-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:hover:bg-purple-900/20"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('adminPanel', 'Admin Panel')}
                                    </Link>
                                )}
                            </div>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-3 px-1">
                            <LanguageSwitcher />
                            {isLoggedIn ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-bold text-red-500/80 transition-colors hover:text-red-600"
                                >
                                    {t('logout', 'Logout')}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/${locale}/login`}
                                        className="text-sm font-semibold text-[#30499B] transition-colors hover:text-[#56B949]"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('login', 'Login')}
                                    </Link>
                                    <Link
                                        href={`/${locale}/register`}
                                        className="rounded-full bg-[#30499B] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#30499B]/20 transition-all hover:-translate-y-0.5 hover:bg-[#253a7a]"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('register', 'Register')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="hidden items-center gap-4 md:flex">
                    {showSearch && (
                        <div className="hidden w-48 items-center rounded-full border border-white/80 bg-white/70 px-4 py-2 transition-all focus-within:border-[#56B949]/40 focus-within:ring-2 focus-within:ring-[#56B949]/10 dark:border-white/10 dark:bg-white/5 lg:flex xl:w-64">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder', 'Search...')}
                                className="w-full border-none bg-transparent text-xs text-slate-800 outline-none placeholder-slate-400 dark:text-slate-200 dark:placeholder-slate-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                    )}

                    <LanguageSwitcher />

                    {user && isLoggedIn ? (
                        <div className="group relative">
                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                            >
                                <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}</span>
                            </button>

                            <div className="absolute right-0 top-full z-50 mt-2 invisible w-64 scale-95 rounded-2xl border border-white/40 bg-white/95 py-4 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover:visible group-hover:scale-100 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800/95">
                                <div className="border-b border-slate-100 px-6 py-3 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] text-lg font-bold text-white">
                                            <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{user.nickname || 'User'}</div>
                                            <div className="text-sm font-medium text-[#F0A32F]">
                                                <span>Points: </span>
                                                <span>0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <Link href={`/${locale}/profile`} className="flex items-center gap-3 px-6 py-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#30499B] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                        <div className="w-5 h-5 flex items-center justify-center">馃懁</div>
                                        <span className="font-medium">{t('profile', 'Profile')}</span>
                                    </Link>
                                    <Link href={`/${locale}/my-activities`} className="flex items-center gap-3 px-6 py-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#30499B] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                        <div className="w-5 h-5 flex items-center justify-center">馃搮</div>
                                        <span className="font-medium">{t('myActivities', 'My Activities')}</span>
                                    </Link>

                                    {(isHost || isAdmin) && (
                                        <>
                                            <div className="my-2 border-t border-slate-100 dark:border-slate-700"></div>

                                            <Link href={`/${locale}/host/activities`} className="flex items-center gap-3 px-6 py-3 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                                <div className="w-5 h-5 flex items-center justify-center">馃搵</div>
                                                <span className="font-medium">{t('hostManagement', 'Activity Management')}</span>
                                            </Link>
                                            <Link href={`/${locale}/host/verification`} className="flex items-center gap-3 px-6 py-3 text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                                                <div className="w-5 h-5 flex items-center justify-center">馃Ь</div>
                                                <span className="font-medium">{t('hostVerification', 'Host Verification')}</span>
                                            </Link>
                                        </>
                                    )}

                                    {isAdmin && (
                                        <Link href={`/${locale}/admin`} className="flex items-center gap-3 px-6 py-3 text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30">
                                            <div className="w-5 h-5 flex items-center justify-center">馃洝锔? </div>
                                            <span className="font-medium">{t('adminPanel', 'Admin Panel')}</span>
                                        </Link>
                                    )}

                                    <div className="my-2 border-t border-slate-100 dark:border-slate-700"></div>

                                    <Link href={`/${locale}/points`} className="flex items-center gap-3 px-6 py-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#30499B] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                        <div className="w-5 h-5 flex items-center justify-center">馃獧</div>
                                        <span className="font-medium">{t('points', 'Points')}</span>
                                    </Link>
                                    <Link href={`/${locale}/notifications`} className="flex items-center gap-3 px-6 py-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#30499B] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                        <Bell className="w-5 h-5" />
                                        <span className="font-medium">{t('notifications', 'Notifications')}</span>
                                        {unreadCount > 0 && (
                                            <span className="ml-auto rounded-full bg-[#EE4035] px-2 py-0.5 text-xs text-white">{unreadCount}</span>
                                        )}
                                    </Link>
                                </div>

                                <div className="border-t border-slate-100 pt-2 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-6 py-3 text-[#EE4035] transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">馃毆</div>
                                        <span className="font-medium">{t('logout', 'Logout')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/${locale}/login`}
                                className="text-sm font-semibold text-[#30499B] transition-colors hover:text-[#56B949]"
                            >
                                {t('login', 'Login')}
                            </Link>
                            <Link
                                href={`/${locale}/register`}
                                className="rounded-full bg-[#30499B] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#30499B]/20 transition-all hover:-translate-y-0.5 hover:bg-[#253a7a]"
                            >
                                {t('register', 'Register')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
