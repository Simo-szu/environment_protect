'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // 避免hydration不匹配
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const themes = [
        { key: 'light', icon: Sun, label: '浅色模式', color: 'text-yellow-500' },
        { key: 'dark', icon: Moon, label: '深色模式', color: 'text-blue-400' },
        { key: 'system', icon: Monitor, label: '跟随系统', color: 'text-slate-600 dark:text-slate-400' }
    ];

    const currentTheme = themes.find(t => t.key === theme) || themes[0];
    const CurrentIcon = currentTheme.icon;

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        setIsExpanded(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="relative">
                {/* 展开的选项 */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute bottom-16 right-0 flex flex-col gap-2"
                        >
                            {themes.map((themeOption) => {
                                const Icon = themeOption.icon;
                                const isActive = theme === themeOption.key;

                                return (
                                    <motion.button
                                        key={themeOption.key}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: themes.indexOf(themeOption) * 0.05 }}
                                        onClick={() => handleThemeChange(themeOption.key)}
                                        className={`
                      group relative p-3 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-110
                      ${isActive
                                                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-lg'
                                                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800'
                                            }
                    `}
                                        title={themeOption.label}
                                    >
                                        <Icon className={`w-5 h-5 ${themeOption.color} transition-transform duration-300 group-hover:rotate-12`} />

                                        {/* 标签 */}
                                        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                            {themeOption.label}
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45 -translate-x-1"></div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 主按钮 */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative group p-4 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300"
                >
                    {/* 背景光效 */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#56B949]/20 to-[#30499B]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* 图标 */}
                    <div className="relative z-10">
                        <CurrentIcon className={`w-6 h-6 ${currentTheme.color} transition-all duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:rotate-12'}`} />
                    </div>

                    {/* 状态指示器 */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#56B949] border-2 border-white dark:border-slate-800 animate-pulse"></div>
                </motion.button>

                {/* 点击外部关闭 */}
                {isExpanded && (
                    <div
                        className="fixed inset-0 z-[-1]"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </div>
        </div>
    );
}