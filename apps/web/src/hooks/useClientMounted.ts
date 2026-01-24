'use client';

import { useState } from 'react';

/**
 * 确保组件只在客户端挂载后才渲染动画
 * 解决 framer-motion hydration 不匹配问题
 */
export function useClientMounted() {
    // 使用函数初始化来避免 hydration 问题
    const [mounted, setMounted] = useState(() => {
        // 在服务端渲染时返回 false
        if (typeof window === 'undefined') return false;
        // 在客户端首次渲染时返回 true
        return true;
    });

    return mounted;
}