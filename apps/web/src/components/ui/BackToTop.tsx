'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // 当页面滚动超过300px时显示按钮
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // 使用节流优化性能
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    toggleVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`
        fixed bottom-6 right-24 z-50 w-12 h-12 
        bg-white/90 dark:bg-slate-800/90 backdrop-blur-md 
        border border-slate-200/60 dark:border-slate-700/60
        rounded-full shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
        text-slate-400 dark:text-slate-500 hover:text-[#56B949] dark:hover:text-[#56B949]
        hover:border-[#56B949]/30 hover:bg-white dark:hover:bg-slate-800
        transition-all duration-300 ease-out
        hover:scale-110 hover:-translate-y-1
        active:scale-95
        group
        ${isVisible
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible translate-y-2'
                }
      `}
            aria-label="回到顶部"
        >
            <ArrowUp className="w-5 h-5 mx-auto group-hover:animate-bounce" />
        </button>
    );
}