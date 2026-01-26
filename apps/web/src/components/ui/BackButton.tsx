'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface BackButtonProps {
    fallbackUrl?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function BackButton({
    fallbackUrl = '/',
    className = "inline-flex items-center gap-2 text-slate-600 hover:text-[#30499B] transition-colors",
    children
}: BackButtonProps) {
    const router = useRouter();
    const { t } = useSafeTranslation('common');

    const handleGoBack = () => {
        // 检查是否有历史记录可以返回
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            // 如果没有历史记录，使用fallback URL
            router.push(fallbackUrl);
        }
    };

    return (
        <button
            onClick={handleGoBack}
            className={className}
        >
            <ArrowLeft className="w-4 h-4" />
            {children || t('goBack', '返回上一页')}
        </button>
    );
}