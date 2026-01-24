'use client';

import { motion } from 'framer-motion';
import { useClientMounted } from '@/hooks/useClientMounted';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
    children: ReactNode;
    variants?: any;
    className?: string;
    delay?: number;
    useInView?: boolean;
}

/**
 * 可靠的动画包装组件
 * 解决 hydration 不匹配和动画延迟问题
 */
export function AnimatedSection({
    children,
    variants,
    className = '',
    delay = 0,
    useInView = true
}: AnimatedSectionProps) {
    const mounted = useClientMounted();

    // 如果还没挂载，显示静态内容
    if (!mounted) {
        return <div className={className}>{children}</div>;
    }

    const defaultVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                delay,
                ease: [0.6, -0.05, 0.01, 0.99],
            },
        },
    };

    const animationProps = useInView
        ? {
            initial: "hidden",
            whileInView: "visible",
            viewport: { once: true, margin: '-20px', amount: 0.1 },
        }
        : {
            initial: "hidden",
            animate: "visible",
        };

    return (
        <motion.div
            className={className}
            variants={variants || defaultVariants}
            {...animationProps}
        >
            {children}
        </motion.div>
    );
}