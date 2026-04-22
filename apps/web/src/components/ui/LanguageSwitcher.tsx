'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Check, ChevronDown, Globe } from 'lucide-react';

interface LanguageSwitcherProps {
    direction?: 'up' | 'down';
}

export function LanguageSwitcher({ direction = 'down' }: LanguageSwitcherProps) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const currentLocale = params?.locale as string || 'zh';

    const switchLanguage = (newLocale: string) => {
        const pathWithoutLocale = pathname.replace(/^\/(zh|en)(?=\/|$)/, '');
        const newPath = `/${newLocale}${pathWithoutLocale || ''}`;
        setIsOpen(false);
        router.push(newPath);
    };

    useEffect(() => {
        const handlePressOutside = (event: Event) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (typeof window !== 'undefined' && 'PointerEvent' in window) {
            document.addEventListener('pointerdown', handlePressOutside);
            return () => {
                document.removeEventListener('pointerdown', handlePressOutside);
            };
        }

        document.addEventListener('mousedown', handlePressOutside);
        document.addEventListener('touchstart', handlePressOutside);
        return () => {
            document.removeEventListener('mousedown', handlePressOutside);
            document.removeEventListener('touchstart', handlePressOutside);
        };
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex touch-manipulation items-center gap-2 rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 transition-all hover:bg-white dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {currentLocale === 'zh' ? '中文' : 'English'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
                className={`absolute right-0 z-50 w-36 rounded-lg border border-slate-200 bg-white py-2 shadow-lg transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 ${direction === 'up' ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'} ${isOpen ? 'visible scale-100 opacity-100' : 'invisible pointer-events-none scale-95 opacity-0'}`}
                role="menu"
            >
                <button
                    type="button"
                    onClick={() => switchLanguage('zh')}
                    className={`flex w-full touch-manipulation items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${currentLocale === 'zh' ? 'font-medium text-[#30499B] dark:text-[#56B949]' : 'text-slate-600 dark:text-slate-400'}`}
                    role="menuitem"
                >
                    <span>中文</span>
                    {currentLocale === 'zh' ? <Check className="w-4 h-4" /> : null}
                </button>
                <button
                    type="button"
                    onClick={() => switchLanguage('en')}
                    className={`flex w-full touch-manipulation items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${currentLocale === 'en' ? 'font-medium text-[#30499B] dark:text-[#56B949]' : 'text-slate-600 dark:text-slate-400'}`}
                    role="menuitem"
                >
                    <span>English</span>
                    {currentLocale === 'en' ? <Check className="w-4 h-4" /> : null}
                </button>
            </div>
        </div>
    );
}
