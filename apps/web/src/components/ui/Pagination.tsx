'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const { t } = useSafeTranslation('common');
    const getVisiblePages = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="mt-10 flex items-center justify-center gap-2">
            {/* 上一页 */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="yl-panel-soft flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#56B949] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-slate-600 dark:text-slate-300 dark:disabled:hover:text-slate-300"
            >
                <ChevronLeft className="w-4 h-4" />
                {t('previousPage', '上一页')}
            </button>

            {/* 页码 */}
            {getVisiblePages().map((page, index) => (
                <div key={index}>
                    {page === '...' ? (
                        <span className="px-3 py-2 text-slate-400 dark:text-slate-500">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page as number)}
                            className={`h-10 w-10 text-sm font-medium rounded-full transition-all duration-300 ${currentPage === page
                                ? 'bg-gradient-to-r from-[#56B949] to-[#4aa840] text-white shadow-lg shadow-[#56B949]/20'
                                : 'yl-panel-soft text-slate-600 hover:text-[#56B949] dark:text-slate-300'
                                }`}
                        >
                            {page}
                        </button>
                    )}
                </div>
            ))}

            {/* 下一页 */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="yl-panel-soft flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#56B949] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-slate-600 dark:text-slate-300 dark:disabled:hover:text-slate-300"
            >
                {t('nextPage', '下一页')}
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
