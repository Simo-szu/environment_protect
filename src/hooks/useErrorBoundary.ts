'use client';

import { useState, useCallback } from 'react';

interface ErrorInfo {
    message: string;
    stack?: string;
    timestamp: Date;
}

export function useErrorBoundary() {
    const [error, setError] = useState<ErrorInfo | null>(null);

    const captureError = useCallback((error: Error | string, context?: string) => {
        const errorInfo: ErrorInfo = {
            message: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'object' ? error.stack : undefined,
            timestamp: new Date()
        };

        setError(errorInfo);

        // 在开发环境中打印错误
        if (process.env.NODE_ENV === 'development') {
            console.error(`[${context || 'Error'}]`, errorInfo);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const withErrorBoundary = useCallback(<T extends any[], R>(
        fn: (...args: T) => R,
        context?: string
    ) => {
        return (...args: T): R | null => {
            try {
                return fn(...args);
            } catch (error) {
                captureError(error as Error, context);
                return null;
            }
        };
    }, [captureError]);

    return {
        error,
        captureError,
        clearError,
        withErrorBoundary,
        hasError: !!error
    };
}

// 全局错误处理工具
export function setupGlobalErrorHandling() {
    if (typeof window === 'undefined') return;

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // 可以在这里添加错误上报逻辑
    });

    // 捕获JavaScript错误
    window.addEventListener('error', (event) => {
        console.error('JavaScript error:', event.error);
        // 可以在这里添加错误上报逻辑
    });
}