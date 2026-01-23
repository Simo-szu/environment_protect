'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();

    const currentLocale = params?.locale as string || 'zh';

    const switchLanguage = (newLocale: string) => {
        // 替换当前路径中的语言代码
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        router.push(newPath);
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 transition-all">
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {currentLocale === 'zh' ? '中文' : 'English'}
                </span>
            </button>

            {/* 下拉菜单 */}
            <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 opacity-0 invisible transform scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-200 z-50">
                <button
                    onClick={() => switchLanguage('zh')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${currentLocale === 'zh' ? 'text-[#30499B] dark:text-[#56B949] font-medium' : 'text-slate-600 dark:text-slate-400'
                        }`}
                >
                    中文
                </button>
                <button
                    onClick={() => switchLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${currentLocale === 'en' ? 'text-[#30499B] dark:text-[#56B949] font-medium' : 'text-slate-600 dark:text-slate-400'
                        }`}
                >
                    English
                </button>
            </div>
        </div>
    );
}