const likes = {
    loading: '加载中...',
    badge: '我的点赞',
    title: '我的点赞',
    subtitle: '点赞内容',
    description: '这里记录了你点赞过的所有内容',
    tabs: {
        articles: '科普文章',
        activities: '环保活动',
        comments: '评论互动',
    },
    empty: {
        articles: '暂无点赞文章',
        activities: '暂无点赞活动',
        comments: '暂无点赞评论',
    },
    content: {
        articles: {
            title: '点赞文章',
            description: '这是一篇很棒的环保文章，获得了很多点赞...',
            likedDaysAgo: '天前点赞',
        },
        activities: {
            title: '点赞活动',
            description: '这是一个很受欢迎的环保活动，获得了很多支持...',
            location: '市中心公园',
            likedDaysAgo: '天前点赞',
            treeActivity: '植树活动',
            ecoActivity: '环保DIY',
        },
        comments: {
            author: '用户',
            content: '这是一条很有见地的评论，值得点赞支持...',
            likedDaysAgo: '天前点赞',
            youLiked: '你点赞了这条评论',
        },
    },
} as const;

export default likes;
export type LikesMessages = typeof likes;
