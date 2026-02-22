
const notifications = {
    badge: 'Message Notifications',
    title: 'Message Center',
    subtitle: 'Replies and Interactions',
    description: 'View replies and interactions from other users on your content',
    stats: {
        unread: 'Unread Messages',
        todayReplies: "Today's Replies",
        totalLikes: 'Total Likes',
        totalReplies: 'Total Replies',
        totalRead: 'Read Messages',
    },
    filters: {
        all: 'All Messages',
        unread: 'Unread Messages',
        replies: 'Replies',
        likes: 'Likes',
    },
    empty: {
        message: 'No {filter}messages',
        unread: 'unread ',
    },
    actions: {
        reply: 'Reply',
        like: 'Like',
        liked: 'Liked',
        follow: 'Follow Back',
        followed: 'Followed',
        viewContent: 'View Content',
        viewProfile: 'View Profile',
        markAsRead: 'Mark as Read',
    },
    types: {
        comment: '{actor} commented on your post',
        reply: '{actor} replied to you',
        like: '{actor} liked your post',
        system: 'System Notification',
    },
    badges: {
        read: 'Read',
        unread: 'Unread',
        newReply: 'New Reply',
        newLike: 'New Like',
        newFollow: 'New Follow',
    },
    replyPlaceholder: 'Enter your reply...',
    replySupport: 'Support emoji and @mentions',
    sendReply: 'Send Reply',
    messages: {
        markAsReadAlert: 'Mark as read function requires backend support',
        replyEmptyAlert: 'Please enter reply content',
        replySuccessAlert: 'Reply sent successfully!',
        likeAlert: 'Like function requires backend support',
        followAlert: 'Follow function requires backend support',
        loginRequired: 'Please login first to view message notifications',
        goLogin: 'Go to Login',
        loading: 'Loading...',
        originalComment: 'Your original comment:',
        originalShare: 'Your original share:',
    },
};

export default notifications;
