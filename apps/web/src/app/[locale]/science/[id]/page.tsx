'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
    ArrowLeft,
    Calendar,
    User,
    Clock,
    Eye,
    Heart,
    Share2,
    BookmarkPlus,
    TreePine,
    Recycle,
    Droplets,
    Sun,
    Leaf,
    MessageCircle
} from 'lucide-react';
import { staggerContainer, staggerItem, pageEnter } from '@/lib/animations';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

export default function ScienceArticleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const locale = params.locale as string || 'zh';
    const { t } = useSafeTranslation('article');
    const { user, isLoggedIn } = useAuth();

    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [comment, setComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

    // 模拟文章数据 - 根据语言返回不同内容
    const getMockArticles = () => {
        if (locale === 'en') {
            return {
                'article-001': {
                    id: 'article-001',
                    title: 'Impact of Climate Change on Biodiversity',
                    subtitle: 'Exploring how global warming is changing our ecosystems',
                    category: 'climate',
                    author: 'Environmental Science Institute',
                    authorAvatar: 'E',
                    publishDate: 'January 15, 2024',
                    readTime: '8 min read',
                    views: 1234,
                    likes: 89,
                    favorites: 45,
                    comments: 23,
                    tags: ['Climate Change', 'Biodiversity', 'Ecosystems', 'Global Warming'],
                    coverImage: '/assets/svg/plant-01.svg',
                    content: `Climate change is one of the most serious challenges facing the world today. It not only affects human society, but also has a profound impact on biodiversity on Earth. As global average temperatures continue to rise, many species are facing unprecedented survival pressures.

## Main Manifestations of Climate Change

Global climate change is mainly manifested in the following aspects:

- **Temperature Rise:** Global average temperature has risen by about 1.1°C over the past century
- **Extreme Weather:** Heat waves, droughts, floods and other extreme weather events occur frequently
- **Sea Level Rise:** Due to glacier melting and thermal expansion of seawater, global sea levels continue to rise
- **Precipitation Pattern Changes:** Some regions become more arid while others face more precipitation

## Specific Impacts on Biodiversity

### 1. Habitat Loss
Climate change causes fundamental changes in the habitats of many species. For example, polar bears lose hunting grounds due to reduced sea ice area; alpine plants lose suitable growing environments due to rising snow lines.

### 2. Changes in Species Distribution
Many species are forced to change their distribution ranges to adapt to climate change. Some species migrate to polar or high-altitude areas in search of more suitable climate conditions. However, not all species have this migration capability.

### 3. Ecosystem Function Disruption
Climate change disrupts the original balance in ecosystems. For example, early flowering may lead to temporal mismatches between pollinators and plants, affecting plant reproductive success.

## Protection Measures and Actions

### 1. Establish Protected Area Networks
By establishing connected protected area networks, provide migration corridors for species to help them adapt to climate change.

### 2. Ecosystem Restoration
Restore degraded ecosystems to enhance their resilience to climate change. For example, reforestation, wetland restoration, etc.

### 3. Climate Change Mitigation
Fundamentally solving the problem requires reducing greenhouse gas emissions, which requires global cooperation and a shift to sustainable development models.

## What Individuals Can Do

As individuals, we can also contribute to biodiversity conservation:
- Reduce carbon footprint and choose low-carbon lifestyles
- Support sustainable products and services
- Participate in environmental volunteer activities
- Pay attention to and support biodiversity conservation projects
- Raise environmental awareness and influence people around you

## Conclusion

The impact of climate change on biodiversity is multifaceted and deep-seated. Protecting biodiversity is not only to maintain the integrity of Earth's ecosystems, but also for humanity's own sustainable development. Each of us has a responsibility to take action and contribute to protecting our common Earth home.`
                },
                'article-002': {
                    id: 'article-002',
                    title: 'Future Trends in Renewable Energy',
                    subtitle: 'Latest developments in solar, wind and clean energy technologies',
                    category: 'energy',
                    author: 'Clean Energy Research Center',
                    authorAvatar: 'C',
                    publishDate: 'January 20, 2024',
                    readTime: '6 min read',
                    views: 987,
                    likes: 67,
                    favorites: 32,
                    comments: 18,
                    tags: ['Renewable Energy', 'Solar Power', 'Wind Energy', 'Clean Technology'],
                    coverImage: '/assets/svg/aerator-bubbles.svg',
                    content: `With growing global concern about climate change, renewable energy has become a key pathway to achieving carbon neutrality goals. Renewable energy not only helps reduce greenhouse gas emissions but also provides sustainable energy supply.

## Major Renewable Energy Technologies

### Solar Energy
Solar technology has made significant progress over the past decade, with costs dropping dramatically and efficiency continuously improving.

### Wind Energy
Wind power generation technology is becoming increasingly mature, with offshore wind power becoming a new growth point.

### Hydropower
Hydropower remains an important renewable energy source, with small-scale hydropower and pumped storage technologies developing rapidly.`
                }
            };
        } else {
            return {
                'article-001': {
                    id: 'article-001',
                    title: '气候变化对生物多样性的影响',
                    subtitle: '探索全球变暖如何改变我们的生态系统',
                    category: 'climate',
                    author: '环保科学研究院',
                    authorAvatar: '环',
                    publishDate: '2024年1月15日',
                    readTime: '8分钟阅读',
                    views: 1234,
                    likes: 89,
                    favorites: 45,
                    comments: 23,
                    tags: ['气候变化', '生物多样性', '生态系统', '全球变暖'],
                    coverImage: '/assets/svg/plant-01.svg',
                    content: `气候变化是当今世界面临的最严峻挑战之一，它不仅影响着人类社会，更对地球上的生物多样性造成了深远的影响。随着全球平均气温的持续上升，许多物种正面临着前所未有的生存压力。

## 气候变化的主要表现

全球气候变化主要表现为以下几个方面：

- **温度上升：** 全球平均气温在过去一个世纪中上升了约1.1°C
- **极端天气：** 热浪、干旱、洪水等极端天气事件频发
- **海平面上升：** 由于冰川融化和海水热膨胀，全球海平面持续上升
- **降水模式改变：** 一些地区变得更加干旱，而另一些地区则面临更多降水

## 对生物多样性的具体影响

### 1. 栖息地丧失
气候变化导致许多物种的栖息地发生根本性改变。例如，北极熊因为海冰面积减少而失去狩猎场所；高山植物因为雪线上移而失去适宜的生长环境。

### 2. 物种分布范围变化
许多物种为了适应气候变化，被迫改变其分布范围。一些物种向极地或高海拔地区迁移，寻找更适宜的气候条件。然而，并非所有物种都具备这种迁移能力。

### 3. 生态系统功能紊乱
气候变化打破了生态系统中原有的平衡关系。例如，花期提前可能导致传粉者与植物之间的时间不匹配，影响植物的繁殖成功率。

## 保护措施与行动

### 1. 建立保护区网络
通过建立连通的保护区网络，为物种提供迁移走廊，帮助它们适应气候变化。

### 2. 生态系统恢复
恢复退化的生态系统，增强其抵御气候变化的能力。例如，重新造林、湿地恢复等。

### 3. 减缓气候变化
从根本上解决问题需要减少温室气体排放，这需要全球共同努力，转向可持续的发展模式。

## 个人可以做什么

作为个人，我们也可以为保护生物多样性贡献力量：
- 减少碳足迹，选择低碳生活方式
- 支持可持续产品和服务
- 参与环保志愿活动
- 关注和支持生物多样性保护项目
- 提高环保意识，影响身边的人

## 结论

气候变化对生物多样性的影响是多方面和深层次的。保护生物多样性不仅是为了维护地球生态系统的完整性，更是为了人类自身的可持续发展。我们每个人都有责任采取行动，为保护我们共同的地球家园贡献力量。`
                },
                'article-002': {
                    id: 'article-002',
                    title: '可再生能源的未来发展趋势',
                    subtitle: '太阳能、风能等清洁能源技术的最新进展',
                    category: 'energy',
                    author: '清洁能源研究中心',
                    authorAvatar: '清',
                    publishDate: '2024年1月20日',
                    readTime: '6分钟阅读',
                    views: 987,
                    likes: 67,
                    favorites: 32,
                    comments: 18,
                    tags: ['可再生能源', '太阳能', '风能', '清洁技术'],
                    coverImage: '/assets/svg/aerator-bubbles.svg',
                    content: `随着全球对气候变化问题的日益关注，可再生能源已成为实现碳中和目标的关键途径。可再生能源不仅有助于减少温室气体排放，还能提供可持续的能源供应。

## 主要可再生能源技术

### 太阳能
太阳能技术在过去十年中取得了显著进步，成本大幅下降，效率不断提高。

### 风能
风能发电技术日趋成熟，海上风电成为新的增长点。

### 水能
水力发电仍是重要的可再生能源，小型水电和抽水蓄能技术发展迅速。`
                }
            };
        }
    };

    const mockArticles = getMockArticles();
    const article = mockArticles[articleId as keyof typeof mockArticles] || mockArticles['article-001'];

    // 模拟评论数据
    const getMockComments = () => {
        if (locale === 'en') {
            return [
                {
                    id: 1,
                    author: 'John Smith',
                    avatar: 'J',
                    content: 'Very meaningful article! I have started using reusable shopping bags and hope more people can pay attention to environmental protection.',
                    time: '2 days ago',
                    likes: 12,
                    replies: [
                        {
                            id: 11,
                            author: 'Alice Green',
                            avatar: 'A',
                            content: 'I totally agree! Small actions can make a big difference.',
                            time: '1 day ago',
                            likes: 5
                        }
                    ]
                },
                {
                    id: 2,
                    author: 'Sarah Green',
                    avatar: 'S',
                    content: 'Our school is also organizing beach cleanup activities. Everyone should contribute to protecting the environment!',
                    time: '1 day ago',
                    likes: 8,
                    replies: []
                }
            ];
        } else {
            return [
                {
                    id: 1,
                    author: '张小明',
                    avatar: '张',
                    content: '非常有意义的文章！我已经开始使用可重复使用的购物袋了，希望更多人能够关注环保。',
                    time: '2天前',
                    likes: 12,
                    replies: [
                        {
                            id: 11,
                            author: '李环保',
                            avatar: '李',
                            content: '我完全同意！小小的行动可以产生巨大的影响。',
                            time: '1天前',
                            likes: 5
                        }
                    ]
                },
                {
                    id: 2,
                    author: '王绿色',
                    avatar: '王',
                    content: '我们学校也在组织环保活动，每个人都应该为保护环境贡献自己的力量！',
                    time: '1天前',
                    likes: 8,
                    replies: []
                }
            ];
        }
    };

    const mockComments = getMockComments();

    const handleBack = () => {
        router.push(`/${locale}/science`);
    };

    const handleLike = () => {
        if (!isLoggedIn) {
            router.push(`/${locale}/login`);
            return;
        }
        setIsLiked(!isLiked);
    };

    const handleFavorite = () => {
        if (!isLoggedIn) {
            router.push(`/${locale}/login`);
            return;
        }
        setIsFavorited(!isFavorited);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.subtitle,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('content.linkCopied', '链接已复制到剪贴板'));
        }
    };

    const handleCommentSubmit = () => {
        if (!comment.trim()) return;
        // 这里可以添加提交评论的逻辑
        console.log('提交评论:', comment);
        setComment('');
    };

    const handleCommentLike = (commentId: number) => {
        if (!isLoggedIn) {
            router.push(`/${locale}/login`);
            return;
        }

        const newLikedComments = new Set(likedComments);
        if (likedComments.has(commentId)) {
            newLikedComments.delete(commentId);
        } else {
            newLikedComments.add(commentId);
        }
        setLikedComments(newLikedComments);
    };

    const handleReplyClick = (commentId: number) => {
        if (!isLoggedIn) {
            router.push(`/${locale}/login`);
            return;
        }
        setReplyingTo(replyingTo === commentId ? null : commentId);
        setReplyText('');
    };

    const handleReplySubmit = (commentId: number) => {
        if (!replyText.trim()) return;
        // 这里可以添加提交回复的逻辑
        console.log('回复评论:', commentId, replyText);
        setReplyText('');
        setReplyingTo(null);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'climate': return <TreePine className="w-5 h-5 text-[#56B949]" />;
            case 'energy': return <Sun className="w-5 h-5 text-[#F0A32F]" />;
            case 'water': return <Droplets className="w-5 h-5 text-[#30499B]" />;
            case 'waste': return <Recycle className="w-5 h-5 text-[#EE4035]" />;
            default: return <Leaf className="w-5 h-5 text-[#56B949]" />;
        }
    };

    const getCategoryName = (category: string) => {
        return t(`categories.${category}`, category);
    };

    return (
        <Layout>
            {/* Header */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {getCategoryIcon(article.category)}
                                <span className="text-sm text-[#30499B] font-medium">{getCategoryName(article.category)}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#30499B] leading-tight">
                                {article.title}
                            </h1>
                        </div>
                    </div>

                    {/* Article Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold text-sm">
                                {article.authorAvatar}
                            </div>
                            <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{article.publishDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.views} {locale === 'zh' ? '阅读' : 'views'}</span>
                        </div>
                        <span>{article.readTime}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isLiked
                                ? 'border-[#EE4035] bg-[#EE4035]/10 text-[#EE4035]'
                                : 'border-slate-200 hover:border-[#EE4035] hover:text-[#EE4035]'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{article.likes}</span>
                        </button>
                        <button
                            onClick={handleFavorite}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isFavorited
                                ? 'border-[#56B949] bg-[#56B949]/10 text-[#56B949]'
                                : 'border-slate-200 hover:border-[#56B949] hover:text-[#56B949]'
                                }`}
                        >
                            <BookmarkPlus className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                            <span>{t('actions.favorite', '收藏')}</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-[#30499B] hover:text-[#30499B] transition-all"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>{t('actions.share', '分享')}</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Article Content */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg mb-8"
                >
                    {/* Featured Image */}
                    <div className="aspect-video bg-gradient-to-br from-[#30499B]/20 to-[#56B949]/20 rounded-xl mb-8 flex items-center justify-center">
                        {getCategoryIcon(article.category)}
                        <div className="ml-4">
                            {article.category === 'climate' && <TreePine className="w-16 h-16 text-[#56B949]" />}
                            {article.category === 'energy' && <Sun className="w-16 h-16 text-[#F0A32F]" />}
                            {article.category === 'water' && <Droplets className="w-16 h-16 text-[#30499B]" />}
                            {article.category === 'waste' && <Recycle className="w-16 h-16 text-[#EE4035]" />}
                            {!['climate', 'energy', 'water', 'waste'].includes(article.category) && <Leaf className="w-16 h-16 text-[#56B949]" />}
                        </div>
                    </div>

                    {/* Article Body */}
                    <div className="prose prose-slate max-w-none">
                        {article.content.split('\n').map((paragraph, index) => {
                            if (paragraph.startsWith('## ')) {
                                return (
                                    <h2 key={index} className="text-2xl font-serif font-semibold text-[#30499B] mt-8 mb-4">
                                        {paragraph.replace('## ', '')}
                                    </h2>
                                );
                            } else if (paragraph.startsWith('### ')) {
                                return (
                                    <h3 key={index} className="text-xl font-semibold text-[#30499B] mt-6 mb-3">
                                        {paragraph.replace('### ', '')}
                                    </h3>
                                );
                            } else if (paragraph.startsWith('- ')) {
                                return (
                                    <li key={index} className="text-slate-600 leading-relaxed ml-4">
                                        {paragraph.replace('- ', '')}
                                    </li>
                                );
                            } else if (paragraph.match(/^\d+\. /)) {
                                return (
                                    <li key={index} className="text-slate-600 leading-relaxed ml-4">
                                        {paragraph.replace(/^\d+\. /, '')}
                                    </li>
                                );
                            } else if (paragraph.trim()) {
                                return (
                                    <p key={index} className="text-slate-600 leading-relaxed mb-4">
                                        {paragraph}
                                    </p>
                                );
                            }
                            return null;
                        })}
                    </div>
                </motion.div>

                {/* Tags */}
                <motion.div
                    variants={staggerItem}
                    className="flex flex-wrap gap-2 mb-8"
                >
                    {article.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-[#30499B]/10 text-[#30499B] rounded-full text-sm font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </motion.div>

                {/* Comments Section */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg mb-8"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <MessageCircle className="w-5 h-5 text-[#30499B]" />
                        <h3 className="text-xl font-semibold text-[#30499B]">
                            {t('content.comments', '评论')} ({article.comments})
                        </h3>
                    </div>

                    {/* Comment Form */}
                    {isLoggedIn ? (
                        <div className="mb-6">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#30499B] focus:outline-none transition-colors resize-none"
                                rows={3}
                                placeholder={t('content.writeComment', '写下你的想法...')}
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={handleCommentSubmit}
                                    className="px-6 py-2 bg-[#30499B] text-white rounded-lg font-medium hover:bg-[#253a7a] transition-colors"
                                >
                                    {t('content.postComment', '发表评论')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-slate-50 rounded-lg text-center">
                            <p className="text-slate-600 mb-3">{t('content.loginToComment', '登录后可以发表评论')}</p>
                            <button
                                onClick={() => router.push(`/${locale}/login`)}
                                className="px-6 py-2 bg-[#30499B] text-white rounded-lg font-medium hover:bg-[#253a7a] transition-colors"
                            >
                                {t('content.loginNow', '立即登录')}
                            </button>
                        </div>
                    )}

                    {/* Sample Comments */}
                    <div className="space-y-4">
                        {mockComments.map((comment) => (
                            <div key={comment.id} className="space-y-3">
                                {/* Main Comment */}
                                <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold text-sm">
                                        {comment.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-slate-800">{comment.author}</span>
                                            <span className="text-xs text-slate-500">{comment.time}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-3">
                                            {comment.content}
                                        </p>
                                        {/* Comment Actions */}
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleCommentLike(comment.id)}
                                                className={`flex items-center gap-1 text-xs transition-colors ${likedComments.has(comment.id)
                                                    ? 'text-[#EE4035]'
                                                    : 'text-slate-500 hover:text-[#EE4035]'
                                                    }`}
                                            >
                                                <Heart className={`w-3 h-3 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
                                                <span>{t('actions.like', '点赞')}</span>
                                                <span className="text-slate-400">({comment.likes + (likedComments.has(comment.id) ? 1 : 0)})</span>
                                            </button>
                                            <button
                                                onClick={() => handleReplyClick(comment.id)}
                                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#30499B] transition-colors"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                <span>{t('actions.reply', '回复')}</span>
                                            </button>
                                        </div>

                                        {/* Reply Form */}
                                        {replyingTo === comment.id && (
                                            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#30499B] focus:outline-none transition-colors resize-none text-sm"
                                                    rows={2}
                                                    placeholder={`${t('actions.reply', '回复')} @${comment.author}...`}
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                                                    >
                                                        {locale === 'zh' ? '取消' : 'Cancel'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReplySubmit(comment.id)}
                                                        className="px-3 py-1 bg-[#30499B] text-white text-xs rounded-lg hover:bg-[#253a7a] transition-colors"
                                                    >
                                                        {t('content.postComment', '发表评论')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-8 space-y-3">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#d9901e] flex items-center justify-center text-white font-semibold text-xs">
                                                    {reply.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-slate-800 text-sm">{reply.author}</span>
                                                        <span className="text-xs text-slate-500">{reply.time}</span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm mb-2">
                                                        {reply.content}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleCommentLike(reply.id)}
                                                            className={`flex items-center gap-1 text-xs transition-colors ${likedComments.has(reply.id)
                                                                ? 'text-[#EE4035]'
                                                                : 'text-slate-500 hover:text-[#EE4035]'
                                                                }`}
                                                        >
                                                            <Heart className={`w-3 h-3 ${likedComments.has(reply.id) ? 'fill-current' : ''}`} />
                                                            <span>{t('actions.like', '点赞')}</span>
                                                            <span className="text-slate-400">({reply.likes + (likedComments.has(reply.id) ? 1 : 0)})</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReplyClick(reply.id)}
                                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#30499B] transition-colors"
                                                        >
                                                            <MessageCircle className="w-3 h-3" />
                                                            <span>{t('actions.reply', '回复')}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Related Articles */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
                >
                    <h3 className="text-xl font-semibold text-[#30499B] mb-6">
                        {t('content.relatedArticles', '相关文章')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.values(mockArticles)
                            .filter(a => a.id !== article.id)
                            .slice(0, 2)
                            .map((relatedArticle) => (
                                <div
                                    key={relatedArticle.id}
                                    onClick={() => router.push(`/${locale}/science/${relatedArticle.id}`)}
                                    className="p-4 border border-slate-200 rounded-lg hover:border-[#56B949] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {getCategoryIcon(relatedArticle.category)}
                                        <span className="text-sm text-slate-600 capitalize">
                                            {getCategoryName(relatedArticle.category)}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2 line-clamp-2">
                                        {relatedArticle.title}
                                    </h4>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                        {relatedArticle.subtitle}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>{relatedArticle.readTime}</span>
                                        <span>{relatedArticle.views} {locale === 'zh' ? '阅读' : 'views'}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </motion.div>
            </motion.div>
        </Layout>
    );
}