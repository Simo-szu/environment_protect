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
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
        },
    },
};

// 悬浮微动效
export const hoverLift = {
    y: -4,
    transition: { type: "spring" as const, stiffness: 300 }
};

// 页面整体进入动画
export const pageEnter = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
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
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
        },
    },
};