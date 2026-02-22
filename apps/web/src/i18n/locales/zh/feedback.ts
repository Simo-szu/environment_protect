const feedback = {
    title: '意见反馈',
    badge: '用户反馈',
    description: '您的意见对我们非常重要！请告诉我们您的想法，帮助我们改进YouthLoop，为更多用户提供更好的环保体验。',
    form: {
        type: {
            label: '反馈类型',
            options: {
                suggestion: '功能建议',
                bug: '问题反馈',
                praise: '表扬鼓励',
                other: '其他',
            },
        },
        rating: { label: '满意度评分', stars: '星' },
        title: { label: '反馈标题', placeholder: '请简要描述您的反馈' },
        content: { label: '详细内容', placeholder: '请详细描述您的想法、遇到的问题或建议...' },
        contact: { label: '联系方式（选填）', placeholder: '邮箱或手机号，方便我们与您联系' },
        anonymous: '匿名提交',
        submit: '提交反馈',
        cancel: '取消',
    },
    success: {
        title: '提交成功！',
        description: '感谢您的反馈，我们会认真阅读并持续改进。',
        backHome: '返回首页',
        continueFeedback: '继续反馈',
    },
    otherContact: {
        title: '其他联系方式',
        email: { title: '邮箱反馈', address: 'feedback@youthloop.org' },
        phone: { title: '电话反馈', number: '400-123-4567' },
        hours: { title: '服务时间', schedule: '工作日 9:00-18:00' },
    },
} as const;

export default feedback;
export type FeedbackMessages = typeof feedback;
