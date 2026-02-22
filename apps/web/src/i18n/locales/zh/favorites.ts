const favorites = {
    loading: '加载中...',
    badge: '我的收藏',
    title: '我的收藏',
    subtitle: '收藏内容',
    description: '这里保存了你收藏的所有内容',
    tabs: {
        articles: '科普文章',
        activities: '环保活动',
    },
    empty: {
        articles: '暂无收藏文章',
        activities: '暂无收藏活动',
    },
    content: {
        favorited: '已收藏',
        articles: {
            title: '环保文章',
            description: '这是一篇关于环保的文章，介绍了各种环保知识和技巧...',
            favoritedDaysAgo: '天前收藏',
        },
        activities: {
            title: '环保活动',
            description: '这是一个很有意义的环保活动，欢迎大家参与...',
            location: '市中心公园',
            favoritedDaysAgo: '天前收藏',
            treeActivity: '植树活动',
            ecoActivity: '环保DIY',
        },
    },
} as const;

export default favorites;
export type FavoritesMessages = typeof favorites;
