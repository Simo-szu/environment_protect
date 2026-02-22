const game = {
    title: '绿色游戏',
    subtitle: '虚拟种植',
    virtualForest: {
        title: '虚拟森林',
        description: '每种植一棵虚拟树木，我们就在现实中种下一棵真树',
    },
    features: {
        title: '游戏特色',
        realImpact: '真实的环保影响',
        interactiveLearning: '互动式学习体验',
        communityPlanting: '社区协作种植',
        achievementSystem: '成就系统奖励',
    },
    stats: {
        title: '游戏统计',
        treesPlanted: '已种植树木',
        activePlayers: '活跃玩家',
        forestAreas: '森林区域',
    },
    comingSoon: {
        title: '游戏即将上线',
        description: '我们正在开发中，敬请期待！',
    },
    joinWaitlist: '加入等待列表',
    cover: {
        city: '深圳',
        title: '低碳规划师',
        description: '构建可持续发展的未来。通过科学决策平衡工业增长与环境保护，在这座科创之都谱写绿色篇章。',
        startPlanning: '开始规划',
        tutorial: '新手教程',
        footer: '深圳市低碳办公室 © 2026 基于真实城市数据模拟',
    },
    tutorial: {
        badge: '游戏教程',
        title: '新手教程',
        subtitle: '深圳低碳规划师游戏指南',
        objective: {
            title: '游戏目标',
            content: '你将扮演深圳低碳城市规划师，在 15 个回合内（每回合 = 1 年），平衡产业发展、市民需求、科技创新、生态保护四大维度，达成核心目标：',
            note: '解锁优质结局；满足特定条件可冲击完美结局。',
        },
        operations: {
            title: '核心操作指南',
            deploy: {
                title: '卡牌部署',
                step1: '点击卡牌可放大查看完整详情（消耗资源、效果、碳排放影响）',
                step2: '若资源满足要求，可点击部署消耗资源激活，激活后卡牌会亮起，直接将卡牌拖动到对应区域即可生效',
            },
            recycle: {
                title: '卡牌回收 / 丢弃',
                recycle: '回收：',
                recycleDesc: '点击底部卡牌回收按钮，再点击任意产业类卡牌，即可转化为 2 产业值（循环经济机制）',
                discard: '丢弃：',
                discardDesc: '长按卡牌拖拽至屏幕边缘，松开后确认即可',
            },
            endTurn: {
                title: '结束回合',
                step1: '部署完卡牌后，点击下一回合，系统会自动结算本回合资源（持续产出 / 消耗）',
                step2: '结算后发放下回合新卡牌，进度条同步推进',
            },
        },
        tips: {
            title: '关键提示',
            tip1: '每个回合都要关注碳排放指标，避免超标',
            tip2: '平衡四大维度发展，不要过度偏重某一方面',
            tip3: '合理利用卡牌回收机制，转化不需要的卡牌为资源',
            tip4: '科技创新卡牌可以解锁更高效的发展路径',
            tip5: '生态保护投入虽然短期成本高，但长期收益显著',
        },
        ready: '准备好开始你的低碳规划之旅了吗？',
        startGame: '开始游戏',
    },
    // archive / leaderboard / tech-tree pages
    archive: {
        title: '游戏档案',
        subtitle: '查看你的历史游戏记录',
        empty: '暂无游戏记录',
        round: '回合',
        score: '评分',
        date: '日期',
        ending: '结局',
        viewDetail: '查看详情',
    },
    leaderboard: {
        title: '排行榜',
        subtitle: '查看全球玩家排名',
        rank: '排名',
        player: '玩家',
        score: '最高分',
        ending: '最佳结局',
        empty: '暂无排行数据',
    },
    techTree: {
        title: '科技树',
        subtitle: '探索可解锁的科技路径',
        locked: '未解锁',
        unlocked: '已解锁',
        cost: '解锁消耗',
    },
} as const;

export default game;
export type GameMessages = typeof game;
