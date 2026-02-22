const contact = {
    title: '联系我们',
    badge: '联系我们',
    description: '有任何问题或建议？我们很乐意听到您的声音。选择最适合您的联系方式，我们会尽快回复。',
    success: {
        title: '消息发送成功！',
        message: '感谢您的联系，我们会在24小时内回复您的消息。',
        backHome: '返回首页',
        continueContact: '继续联系',
    },
    contactInfo: {
        title: '联系方式',
        phone: {
            title: '客服热线',
            number: '400-123-4567',
            hours: '工作日 9:00-18:00',
        },
        email: {
            title: '邮箱地址',
            address: 'contact@youthloop.org',
            response: '24小时内回复',
        },
        address: {
            title: '办公地址',
            location: '北京市朝阳区环保大厦',
            postal: '邮编：100020',
        },
        hours: {
            title: '服务时间',
            days: '周一至周日',
            support: '7×24小时在线支持',
        },
    },
    about: {
        slogan: '让绿色循环，用行动改变未来',
        users: '10万+用户',
        coverage: '全国服务',
        mission: '环保使命',
    },
    form: {
        title: '发送消息',
        name: { label: '姓名', placeholder: '请输入您的姓名' },
        email: { label: '邮箱', placeholder: '请输入您的邮箱' },
        phone: { label: '电话', placeholder: '请输入您的电话' },
        subject: {
            label: '主题',
            placeholder: '请选择主题',
            options: {
                general: '一般咨询',
                activity: '活动相关',
                technical: '技术支持',
                partnership: '合作洽谈',
                feedback: '意见反馈',
                other: '其他',
            },
        },
        message: { label: '消息内容', placeholder: '请详细描述您的问题或需求...' },
        submit: '发送消息',
        cancel: '取消',
    },
    quickLinks: {
        help: { title: '帮助中心', description: '常见问题解答' },
        feedback: { title: '意见反馈', description: '提交建议' },
        emergency: { title: '紧急联系', phone: '400-123-4567' },
    },
} as const;

export default contact;
export type ContactMessages = typeof contact;
