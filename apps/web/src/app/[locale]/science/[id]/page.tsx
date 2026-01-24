'use client';

import { useState, useEffect } from 'react';
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
    Leaf
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

export default function ScienceArticleDetailPage() {
    const { user, isLoggedIn } = useAuth();
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const locale = params.locale as string;

    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    // 模拟文章数据
    const mockArticles = {
        'article-001': {
            id: 'article-001',
            title: '气候变化对生物多样性的影响',
            subtitle: '探索全球变暖如何改变我们的生态系统',
            category: 'climate',
            author: '环保科学研究院',
            publishDate: '2024年1月15日',
            readTime: '8分钟',
            views: 1234,
            likes: 89,
            favorites: 45,
            tags: ['气候变化', '生物多样性', '生态系统', '全球变暖'],
            coverImage: '/assets/svg/plant-01.svg',
            content: `
        <h2>引言</h2>
        <p>气候变化是当今世界面临的最严峻挑战之一，它不仅影响着人类社会，更对地球上的生物多样性造成了深远的影响。随着全球平均气温的持续上升，许多物种正面临着前所未有的生存压力。</p>
        
        <h2>气候变化的主要表现</h2>
        <p>全球气候变化主要表现为以下几个方面：</p>
        <ul>
          <li><strong>温度上升：</strong>全球平均气温在过去一个世纪中上升了约1.1°C</li>
          <li><strong>极端天气：</strong>热浪、干旱、洪水等极端天气事件频发</li>
          <li><strong>海平面上升：</strong>由于冰川融化和海水热膨胀，全球海平面持续上升</li>
          <li><strong>降水模式改变：</strong>一些地区变得更加干旱，而另一些地区则面临更多降水</li>
        </ul>
        
        <h2>对生物多样性的具体影响</h2>
        
        <h3>1. 栖息地丧失</h3>
        <p>气候变化导致许多物种的栖息地发生根本性改变。例如，北极熊因为海冰面积减少而失去狩猎场所；高山植物因为雪线上移而失去适宜的生长环境。</p>
        
        <h3>2. 物种分布范围变化</h3>
        <p>许多物种为了适应气候变化，被迫改变其分布范围。一些物种向极地或高海拔地区迁移，寻找更适宜的气候条件。然而，并非所有物种都具备这种迁移能力。</p>
        
        <h3>3. 生态系统功能紊乱</h3>
        <p>气候变化打破了生态系统中原有的平衡关系。例如，花期提前可能导致传粉者与植物之间的时间不匹配，影响植物的繁殖成功率。</p>
        
        <h3>4. 海洋生态系统的变化</h3>
        <p>海洋温度上升和酸化对海洋生物造成严重威胁。珊瑚礁大规模白化，海洋食物链受到冲击，许多海洋物种面临生存危机。</p>
        
        <h2>保护措施与行动</h2>
        
        <h3>1. 建立保护区网络</h3>
        <p>通过建立连通的保护区网络，为物种提供迁移走廊，帮助它们适应气候变化。</p>
        
        <h3>2. 生态系统恢复</h3>
        <p>恢复退化的生态系统，增强其抵御气候变化的能力。例如，重新造林、湿地恢复等。</p>
        
        <h3>3. 减缓气候变化</h3>
        <p>从根本上解决问题需要减少温室气体排放，这需要全球共同努力，转向可持续的发展模式。</p>
        
        <h3>4. 科学研究与监测</h3>
        <p>加强对气候变化影响的科学研究，建立长期监测体系，为保护决策提供科学依据。</p>
        
        <h2>个人可以做什么</h2>
        <p>作为个人，我们也可以为保护生物多样性贡献力量：</p>
        <ul>
          <li>减少碳足迹，选择低碳生活方式</li>
          <li>支持可持续产品和服务</li>
          <li>参与环保志愿活动</li>
          <li>关注和支持生物多样性保护项目</li>
          <li>提高环保意识，影响身边的人</li>
        </ul>
        
        <h2>结论</h2>
        <p>气候变化对生物多样性的影响是多方面和深层次的。保护生物多样性不仅是为了维护地球生态系统的完整性，更是为了人类自身的可持续发展。我们每个人都有责任采取行动，为保护我们共同的地球家园贡献力量。</p>
      `
        },
        'article-002': {
            id: 'article-002',
            title: '可再生能源的未来发展趋势',
            subtitle: '太阳能、风能等清洁能源技术的最新进展',
            category: 'energy',
            author: '清洁能源研究中心',
            publishDate: '2024年1月20日',
            readTime: '6分钟',
            views: 987,
            likes: 67,
            favorites: 32,
            tags: ['可再生能源', '太阳能', '风能', '清洁技术'],
            coverImage: '/assets/svg/aerator-bubbles.svg',
            content: `
        <h2>可再生能源的重要性</h2>
        <p>随着全球对气候变化问题的日益关注，可再生能源已成为实现碳中和目标的关键途径。可再生能源不仅有助于减少温室气体排放，还能提供可持续的能源供应。</p>
        
        <h2>主要可再生能源技术</h2>
        
        <h3>太阳能</h3>
        <p>太阳能技术在过去十年中取得了显著进步，成本大幅下降，效率不断提高。</p>
        
        <h3>风能</h3>
        <p>风能发电技术日趋成熟，海上风电成为新的增长点。</p>
        
        <h3>水能</h3>
        <p>水力发电仍是重要的可再生能源，小型水电和抽水蓄能技术发展迅速。</p>
      `
        }
    };

    const article = mockArticles[articleId as keyof typeof mockArticles] || mockArticles['article-001'];

    const handleBack = () => {
        router.push(`/${locale}/science`);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleFavorite = () => {
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
            alert('链接已复制到剪贴板');
        }
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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'climate': return 'from-[#56B949] to-[#4aa840]';
            case 'energy': return 'from-[#F0A32F] to-[#e8941a]';
            case 'water': return 'from-[#30499B] to-[#2a4086]';
            case 'waste': return 'from-[#EE4035] to-[#d63529]';
            default: return 'from-[#56B949] to-[#4aa840]';
        }
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-serif font-semibold text-[#30499B]">环保科普</h1>
                            <p className="text-slate-600">深入了解环保知识</p>
                        </div>
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
                {/* Article Header */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg mb-8"
                >
                    <div className="flex items-center gap-2 mb-4">
                        {getCategoryIcon(article.category)}
                        <span className="text-sm font-medium text-slate-600 capitalize">
                            {article.category}
                        </span>
                    </div>

                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-3">
                        {article.title}
                    </h1>

                    <p className="text-lg text-slate-600 mb-6">
                        {article.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {article.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{article.publishDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{article.readTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span>{article.views}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors ${isLiked
                                    ? 'border-red-200 bg-red-50 text-red-500'
                                    : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-sm">{article.likes}</span>
                            </button>
                            <button
                                onClick={handleFavorite}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors ${isFavorited
                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-600'
                                    : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <BookmarkPlus className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                                <span className="text-sm">{article.favorites}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Article Content */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg mb-8"
                >
                    <div
                        className="prose prose-slate prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </motion.div>

                {/* Related Articles */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
                >
                    <h3 className="text-xl font-semibold text-[#30499B] mb-6">相关文章</h3>
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
                                            {relatedArticle.category}
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
                                        <span>{relatedArticle.views} 阅读</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </motion.div>
            </motion.div>
        </Layout>
    );
}