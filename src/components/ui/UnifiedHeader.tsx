'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';

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

    const navigationItems = [
        { href: '/', label: '首页', color: '#30499B' },
        { href: '/game', label: '游戏', color: '#56B949' },
        { href: '/science', label: '科普', color: '#F0A32F' },
        { href: '/activities', label: '活动', color: '#30499B' },
        { href: '/points', label: '积分', color: '#EE4035' }
    ];

    const isActivePage = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100/60 px-4 sm:px-8 py-4 -mx-4 sm:-mx-6 md:-mx-12 mb-8 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
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
                    aria-label="切换菜单"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* 导航链接 */}
                <div className={`
          ${isMobileMenuOpen ? 'flex' : 'hidden'} 
          md:flex flex-col md:flex-row absolute md:static top-full left-0 w-full md:w-auto 
          bg-white md:bg-transparent border-b md:border-none border-slate-100 
          p-4 md:p-0 gap-4 md:gap-8 text-sm font-medium text-slate-500 
          shadow-lg md:shadow-none transition-all duration-300 z-50
        `}>
                    {navigationItems.map((item) => {
                        const isActive = isActivePage(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={
                                    isActive
                                        ? `text-[${item.color}] font-semibold bg-[${item.color}]/10 px-3 py-1 rounded-full w-fit`
                                        : `hover:text-[${item.color}] transition-colors py-1`
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* 移动端显示的额外操作 */}
                    {showAuth && (
                        <div className="md:hidden mobile-auth-section flex flex-col gap-2">
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-[#30499B] text-left"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                登录
                            </Link>
                            <Link
                                href="/register"
                                className="text-center text-sm px-4 py-2 rounded-full bg-[#30499B] text-white font-medium shadow-md shadow-[#30499B]/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                注册
                            </Link>
                        </div>
                    )}
                </div>

                {/* 桌面端右侧操作 */}
                <div className="hidden md:flex items-center gap-4">
                    {showSearch && (
                        <div className="hidden lg:flex items-center bg-white/60 rounded-full px-4 py-2 border border-slate-200/60 focus-within:border-[#30499B]/30 focus-within:bg-white transition-all w-48 xl:w-64">
                            <input
                                type="text"
                                placeholder="搜索..."
                                className="bg-transparent border-none outline-none text-xs w-full text-[#30499B] placeholder-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                    )}

                    {showAuth && (
                        <div className="desktop-auth-section flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-[#30499B] hover:text-[#56B949] transition-colors"
                            >
                                登录
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm px-4 py-1.5 rounded-full bg-[#30499B] text-white font-medium shadow-md shadow-[#30499B]/20 hover:bg-[#253a7a] hover:scale-105 transition-all"
                            >
                                注册
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}