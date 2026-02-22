const notifications = {
    badge: '消息通知',
    title: '消息中心',
    subtitle: '回复和互动',
    description: '查看其他用户对您内容的回复和互动',
    stats: {
        unread: '未读消息',
        todayReplies: '今日回复',
        totalLikes: '总点赞',
        totalReplies: '总回复',
        totalRead: '已读消息',
    },
    filters: {
        all: '全部消息',
        unread: '未读消息',
        replies: '回复',
        likes: '点赞',
    },
    empty: {
        message: '暂无{filter}消息',
        unread: '未读',
    },
    actions: {
        reply: '回复',
        like: '点赞',
        liked: '已点赞',
        follow: '回关',
        followed: '已关注',
        viewContent: '查看内容',
        viewProfile: '查看资料',
        markAsRead: '标记为已读',
    },
    types: {
        comment: '{actor} 评论了你',
        reply: '{actor} 回复了你',
        like: '{actor} 点赞了你',
        system: '系统通知',
    },
    badges: {
        read: '已读',
        unread: '未读',
        newReply: '新回复',
        newLike: '新点赞',
        newFollow: '新关注',
    },
    replyPlaceholder: '输入你的回复...',
    replySupport: '支持表情和@提醒',
    sendReply: '发送回复',
    messages: {
        markAsReadAlert: '标记为已读功能需要后端支持',
        replyEmptyAlert: '请输入回复内容',
        replySuccessAlert: '回复发送成功！',
        likeAlert: '点赞功能需要后端支持',
        followAlert: '关注功能需要后端支持',
        loginRequired: '请先登录查看消息通知',
        goLogin: '去登录',
        loading: '加载中...',
        originalComment: '你的原评论：',
        originalShare: '你的原分享：',
    },
} as const;

export default notifications;
export type NotificationsMessages = typeof notifications;
