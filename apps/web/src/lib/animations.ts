// 通用动画配置
export const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
        },
    },
};

// 分段动画配置（用于多个模块依次出现）
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // 减少延迟
            delayChildren: 0.05,   // 减少初始延迟
        },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4, // 缩短动画时间
            ease: [0.6, -0.05, 0.01, 0.99] as const,
        },
    },
};

// 悬浮微动效
export const hoverLift = {
    y: -4,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
};

// 页面整体进入动画 - 更快更可靠
export const pageEnter = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5, // 缩短时间
            ease: [0.6, -0.05, 0.01, 0.99] as const,
        },
    },
};

// 卡片进入动画
export const cardEnter = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4, // 缩短时间
            ease: [0.6, -0.05, 0.01, 0.99] as const,
        },
    },
};

// 快速淡入动画 - 用于解决延迟问题
export const quickFadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut" as const,
        },
    },
};

// 改进的 viewport 配置
export const viewportConfig = {
    once: true,
    margin: '-20px', // 减少边距，更早触发
    amount: 0.1,     // 只需要 10% 可见就触发
};