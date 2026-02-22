const home = {
    title: 'YOUTHLOOP',
    subtitle: '让绿色循环，用行动改变未来',
    slogan: '全民环保行动季',
    enter: '进入',
    viewAll: '查看全部',
    readReport: '阅读报告',
    viewDetails: '查看详情',
    learnNow: '立即学习',
    signUpNow: '立即报名',
    joinNow: '一键参加',
    viewContent: '查看详情',
    readMore: '阅读详情',
    views: '阅读',
    likes: '点赞',
    pending: '待定',
    cards: {
        points: { title: '积分·兑换', subtitle: '累积环保值，兑换好礼' },
        game: { title: '绿色游戏世界', subtitle: '立即探索' },
        science: { title: '权威科普', subtitle: '科学数据，值得信赖' },
        activity: { title: '环保活动', subtitle: '参与行动' },
    },
    sections: {
        homeBanners: {
            title: '首页横幅',
            subtitle: 'HOME BANNERS',
            empty: '暂无横幅数据',
        },
        homeData: {
            available: '首页数据已连接',
            unavailable: '首页数据未连接',
        },
        recommendation: {
            title: '推荐内容',
            subtitle: 'RECOMMENDED FOR YOU',
            empty: '暂无推荐内容',
            source: '来源: {source}',
            unavailable: '推荐服务暂时不可用',
            weeklySource: '每周推荐来源: {source}',
            weeklyUnavailable: '每周推荐暂时不可用',
            explore: '探索更多',
        },
        science: {
            title: '科普资料',
            subtitle: 'TRUSTWORTHY KNOWLEDGE',
            items: {
                guide: {
                    title: '2024 可持续生活指南',
                    description: '涵盖衣食住行各个方面的减碳小技巧，附带详细数据支持。',
                    badge: 'GUIDE',
                },
                data: {
                    title: '全球碳排放最新数据',
                    description: '实时更新的全球环境监测数据，可视化图表分析。',
                    badge: 'DATA',
                },
                tips: {
                    title: '高效废弃物回收术',
                    description: '如何正确分类？哪些可以变废为宝？专家视频讲解。',
                    badge: 'TIPS',
                },
            },
        },
        activities: {
            title: '热门活动',
            subtitle: 'JOIN THE ACTION',
            items: {
                treePlanting: { title: '城市植树节', date: '2024.05.12 · 城市公园', badge: 'HOT' },
                beachCleanup: { title: '海滩净滩行动', date: '2024.06.05 · 阳光海滩' },
                communityExchange: { title: '社区旧物交换', date: '每周六 · 社区中心' },
            },
        },
        game: {
            title: '开启你的绿色探索之旅',
            subtitle: '在虚拟世界中种植树木，我们在现实世界为您种下真树。让游戏变得有意义。',
            button: '开始游戏',
            badge: 'INTERACTIVE GAME',
        },
        points: {
            title: '积分乐园',
            subtitle: 'REWARDS & POINTS',
            dailyTask: '完成每日任务',
            pointsNeeded: '今天还需 {points} 积分即可升级勋章',
            tasks: {
                walking: '步行打卡',
                walkingPoints: '+10 积分',
                sorting: '垃圾分类',
                sortingPoints: '+20 积分',
            },
        },
    },
} as const;

export default home;
export type HomeMessages = typeof home;
