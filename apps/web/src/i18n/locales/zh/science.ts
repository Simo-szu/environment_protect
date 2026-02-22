const science = {
    title: '科普中心',
    subtitle: '权威环保知识',
    description: '探索最新的环境科学研究和数据',
    categories: {
        all: '全部分类',
        climate: '气候变化',
        energy: '可再生能源',
        waste: '废物管理',
        biodiversity: '生物多样性',
    },
    hero: {
        badge: '环境科学知识库',
        title: '科学环保',
        subtitle: '以科学为指导，让环保更有效',
    },
    tips: {
        title: '环保小贴士',
        subtitle: 'ECO TIPS',
        waterSaving: {
            title: '节水小窍门',
            description: '洗菜水可以浇花，洗衣水可以拖地。每一滴水的多重利用，最大化水资源价值。',
        },
        wasteSorting: {
            title: '垃圾分类指南',
            description: '正确的垃圾分类不仅能减少环境污染，还能实现资源的有效回收利用。',
        },
        energySaving: {
            title: '节能小技巧',
            description: '随手关灯、使用节能电器、选择公共交通。小行动，大影响。',
        },
    },
    news: {
        title: '环保资讯',
        subtitle: '环保资讯',
        articles: {
            greenTech: {
                title: '绿色科技：未来城市的可持续能源解决方案',
                description: '随着全球变暖加剧，如何将更多绿色科技融入城市发展成为关键议题。本文探讨最新太阳能板技术、风能利用以及智能电网在现代城市中的应用...',
            },
            oceanPlastic: {
                title: '海洋塑料污染：不仅仅是吸管的问题',
                description: '每年有数百万吨塑料垃圾流入海洋，威胁海洋生物。这份深度报告将帮助您了解微塑料的危害，以及各国正在采取的清理行动和减塑政策...',
            },
            evBattery: {
                title: '电动汽车：您需要了解的电池回收知识',
                description: '随着电动汽车的普及，废旧电池的处理成为新的环保挑战。如果处理不当，电池中的重金属将造成严重污染。了解正确的回收渠道和再生技术...',
            },
        },
    },
    actions: {
        learnMore: '了解更多',
        viewAll: '查看全部',
        readFull: '阅读全文',
    },
    types: {
        NEWS: '环保新闻',
        DYNAMIC: '活动动态',
        POLICY: '政策法规',
        WIKI: '环保百科',
    },
} as const;

export default science;
export type ScienceMessages = typeof science;
