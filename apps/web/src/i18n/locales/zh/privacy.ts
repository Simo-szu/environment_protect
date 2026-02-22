const privacy = {
    title: '隐私政策',
    badge: '隐私保护',
    lastUpdated: '最后更新时间：2024年1月',
    content: {
        section1: {
            title: '1. 引言',
            content: 'YouthLoop（以下简称"我们"）非常重视用户的隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策的条款。',
        },
        section2: {
            title: '2. 我们收集的信息',
            content: '我们收集您主动提供的信息以及自动收集的使用数据，以便为您提供更好的服务。',
        },
        section3: {
            title: '3. 信息使用目的',
            content: '我们使用收集的信息来提供、维护和改进我们的服务，处理您的账户管理，组织环保活动等。',
        },
        section4: {
            title: '4. 联系我们',
            content: '如果您对本隐私政策有任何疑问，请联系我们：',
        },
        contact: {
            email: '邮箱：privacy@youthloop.org',
            phone: '电话：400-123-4567',
            address: '地址：北京市朝阳区环保大厦',
        },
    },
} as const;

export default privacy;
export type PrivacyMessages = typeof privacy;
