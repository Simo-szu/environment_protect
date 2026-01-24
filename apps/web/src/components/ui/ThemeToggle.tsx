'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // 避免hydration不匹配
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse" />
        );
    }

    const cycleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="w-5 h-5 text-yellow-500" />;
            case 'dark':
                return <Moon className="w-5 h-5 text-blue-400" />;
            default:
                return <Monitor className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
        }
    };

    const getTooltip = () => {
        switch (theme) {
            case 'light':
                return '浅色模式';
            case 'dark':
                return '深色模式';
            default:
                return '跟随系统';
        }
    };

    return (
        <button
            onClick={cycleTheme}
            className="relative group p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:scale-105"
            title={getTooltip()}
        >
            <div className="transition-transform duration-300 group-hover:rotate-12">
                {getIcon()}
            </div>

            {/* Tooltip */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {getTooltip()}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
            </div>
        </button>
    );
}