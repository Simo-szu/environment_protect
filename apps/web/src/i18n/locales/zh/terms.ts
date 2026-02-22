const terms = {
    title: '用户服务协议',
    badge: '法律条款',
    lastUpdated: '最后更新时间：2024年1月',
    content: {
        section1: {
            title: '1. 服务条款的接受',
            content: '欢迎使用YouthLoop环保平台！当您注册、访问或使用我们的服务时，即表示您同意遵守本用户服务协议的所有条款和条件。',
        },
        section2: {
            title: '2. 服务描述',
            content: 'YouthLoop是一个致力于环保教育和行动的在线平台，我们提供环保知识科普、活动组织、用户互动和积分奖励等服务。',
        },
        section3: {
            title: '3. 用户责任',
            content: '用户需要提供准确的注册信息，保护账户安全，并遵守平台的使用规范。',
        },
        section4: {
            title: '4. 联系我们',
            content: '如果您对本协议有任何疑问，请通过以下方式联系我们：',
        },
        contact: {
            email: '邮箱：legal@youthloop.org',
            phone: '电话：400-123-4567',
            address: '地址：北京市朝阳区环保大厦',
        },
    },
} as const;

export default terms;
export type TermsMessages = typeof terms;
