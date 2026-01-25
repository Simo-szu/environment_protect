'use client';

import { useState, useEffect } from 'react';

/**
 * 确保组件只在客户端挂载后才渲染动画
 * 解决 framer-motion hydration 不匹配问题
 */
export function useClientMounted() {
    // 使用函数初始化来避免 hydration 问题
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}