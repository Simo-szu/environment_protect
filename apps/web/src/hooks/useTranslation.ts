'use client';

import { useTranslations } from 'next-intl';

// 通用翻译 Hook
export function useCommonTranslation() {
    return useTranslations('common');
}

// 导航翻译 Hook
export function useNavigationTranslation() {
    return useTranslations('navigation');
}

// 首页翻译 Hook
export function useHomeTranslation() {
    return useTranslations('home');
}

// 消息通知翻译 Hook
export function useNotificationsTranslation() {
    return useTranslations('notifications');
}

// 我的活动翻译 Hook
export function useMyActivitiesTranslation() {
    return useTranslations('myActivities');
}

// 分页翻译 Hook
export function usePaginationTranslation() {
    return useTranslations('pagination');
}