'use client';

import { useSyncExternalStore } from 'react';

/**
 * 确保组件只在客户端挂载后才渲染动画
 * 解决 framer-motion hydration 不匹配问题
 */
export function useClientMounted() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
}
