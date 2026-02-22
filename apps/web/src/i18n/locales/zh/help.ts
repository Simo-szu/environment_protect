const help = {
    title: '帮助中心',
    badge: '帮助支持',
    description: '欢迎来到YouthLoop帮助中心！这里有您需要的所有信息和支持。如果找不到答案，请随时联系我们的客服团队。',
    quickContact: {
        title: '快速联系',
        phone: { title: '客服热线', number: '400-123-4567' },
        email: { title: '邮箱支持', address: 'help@youthloop.org' },
        chat: { title: '在线客服', hours: '工作日 9:00-18:00' },
        hours: { title: '服务时间', schedule: '7×24小时' },
        contactUs: '联系我们',
    },
    search: {
        placeholder: '搜索帮助内容...',
    },
    faq: {
        account: {
            title: '账号相关',
            register: {
                q: '如何注册YouthLoop账号？',
                a: '点击首页右上角的"注册"按钮，填写必要信息即可完成注册。您也可以使用第三方账号快速登录。',
            },
            password: {
                q: '忘记密码怎么办？',
                a: '在登录页面点击"忘记密码"，输入您的注册邮箱，我们会发送密码重置链接到您的邮箱。',
            },
            profile: {
                q: '如何修改个人信息？',
                a: '登录后进入"个人中心"，点击"编辑资料"即可修改您的个人信息。',
            },
        },
        activities: {
            title: '活动参与',
            register: {
                q: '如何报名参加环保活动？',
                a: '浏览活动广场，选择您感兴趣的活动，点击"立即报名"并填写相关信息即可。',
            },
            cancel: {
                q: '报名后可以取消吗？',
                a: '可以的。您可以在活动开始前24小时内，在"我的活动"中取消报名。',
            },
            cancelled: {
                q: '活动取消了怎么办？',
                a: '如果活动因故取消，我们会及时通知所有报名用户，并提供替代活动选项。',
            },
        },
        points: {
            title: '积分系统',
            earn: {
                q: '如何获得积分？',
                a: '参与环保活动、完成每日签到、分享环保知识、邀请好友等都可以获得积分奖励。',
            },
            use: {
                q: '积分有什么用？',
                a: '积分可以用来兑换环保礼品、参与特殊活动、提升用户等级等。',
            },
            expire: {
                q: '积分会过期吗？',
                a: '积分有效期为2年，超过有效期的积分将自动清零。',
            },
        },
    },
    moreHelp: {
        title: '还有其他问题？',
        description: '如果您没有找到需要的答案，我们的客服团队随时为您提供帮助。',
        contactService: '联系客服',
        feedback: '意见反馈',
    },
} as const;

export default help;
export type HelpMessages = typeof help;
