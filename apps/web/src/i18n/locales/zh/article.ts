const article = {
    article: {
        anonymous: '匿名用户',
    },
    meta: {
        author: '作者',
        publishDate: '发布日期',
        readTime: '阅读时间',
        views: '阅读量',
        category: '分类',
    },
    actions: {
        back: '返回',
        like: '点赞',
        favorite: '收藏',
        share: '分享',
        comment: '评论',
        login: '登录',
        reply: '回复',
    },
    content: {
        relatedArticles: '相关文章',
        comments: '评论',
        writeComment: '写下你的想法...',
        postComment: '发表评论',
        loginToComment: '登录后可以发表评论',
        loginNow: '立即登录',
        linkCopied: '链接已复制到剪贴板',
    },
    comments: {
        title: '评论',
        placeholder: '写下你的评论...',
        replyPlaceholder: '写下你的回复...',
        submit: '发表评论',
        submitting: '发表中...',
        success: '评论发表成功',
        error: '评论发表失败，请重试',
        emptyError: '评论内容不能为空',
        loginRequired: '登录后可以发表评论',
        login: '立即登录',
        reply: '回复',
        empty: '暂无评论，快来发表第一条评论吧！',
    },
    error: {
        notFound: '文章不存在',
        operationFailed: '操作失败，请重试',
    },
    categories: {
        climate: '气候变化',
        energy: '可再生能源',
        water: '水资源保护',
        waste: '废物管理',
        biodiversity: '生物多样性',
    },
} as const;

export default article;
export type ArticleMessages = typeof article;
