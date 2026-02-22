const navigation = {
    home: '首页',
    activities: '活动',
    science: '科普',
    game: '游戏',
    points: '积分',
    profile: '个人资料',
    notifications: '消息通知',
    myActivities: '我的活动',
    favorites: '我的收藏',
    likes: '我的点赞',
    login: '登录',
    register: '注册',
    logout: '退出登录',
    toggleMenu: '切换菜单',
    searchPlaceholder: '搜索...',
    userId: '用户ID',
    hostManagement: '活动管理',
    adminPanel: '开发者后台',
    hostVerification: '主办方认证',
} as const;

export default navigation;
export type NavigationMessages = typeof navigation;
