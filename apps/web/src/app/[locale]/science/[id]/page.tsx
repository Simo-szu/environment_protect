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
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';
import { contentApi, interactionApi } from '@/lib/api';
import type { ContentDetail, ContentItem, Comment } from '@/lib/api/content';

export default function ScienceArticleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const locale = params.locale as string || 'zh';
    const { t } = useSafeTranslation('article');
    const { user, isLoggedIn } = useAuth();

    // 状态管理
    const [article, setArticle] = useState<ContentDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [relatedArticles, setRelatedArticles] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [favoriteCount, setFavoriteCount] = useState(0);

    // 加载文章数据
    useEffect(() => {
        const loadArticleData = async () => {
            try {
                setLoading(true);
                
                // 并行加载文章详情、评论和相关文章
                const [articleData, commentsData, relatedData] = await Promise.all([
                    contentApi.getContentDetail(articleId),
                    contentApi.getContentComments(articleId, { page: 1, size: 10, sort: 'latest' }),
                    contentApi.getContents({ page: 1, size: 3, sort: 'latest' })
                ]);

                setArticle(articleData);
                setComments(commentsData.items);
                setRelatedArticles(relatedData.items.filter(item => item.id !== articleId).slice(0, 2));
                
                // 设置用户状态
                if (articleData.userState) {
                    setIsLiked(articleData.userState.liked);
                    setIsFavorited(articleData.userState.favorited);
                }
                setLikeCount(articleData.likeCount);
                setFavoriteCount(articleData.favoriteCount); // 使用真实的收藏数
            } catch (error) {
                console.error('Failed to load article:', error);
                // 可以显示错误提示或跳转回列表页
            } finally {
                setLoading(false);
            }
        };

        loadArticleData();
    }, [articleId]);

    const handleBack = () => {
        router.push(`/${locale}/science`);
    };

    const handleLike = async () => {
        if (!isLoggedIn) {
            router.push(`/${locale}/login`);
            return;
        }

        try {
            if (isLiked) {
                await interactionApi.deleteReaction({
                    targetType: 'CONTENT',
                    targetId: articleId,
                    reactionType: 'LIKE'
                });
                setLikeCount(prev => prev - 1);
            } else {
                await interactionApi.createReaction({
                    targetType: 'CONTENT',
                    targetId: articleId,
                    reactionType: 'LIKE'
                });
                setLikeCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error: any) {
            console.error('Failed to toggle like:', error);
            alert(error.message || '操作失败，请重试');
        }
    };

    const handleFavorite = async () => {
        if (!isLoggedIn) {
            router.push(`/${locale}/login`);
            return;
        }

        try {
            if (isFavorited) {
                await interactionApi.deleteReaction({
                    targetType: 'CONTENT',
                    targetId: articleId,
                    reactionType: 'FAVORITE'
                });
                setFavoriteCount(prev => prev - 1);
            } else {
                await interactionApi.createReaction({
                    targetType: 'CONTENT',
                    targetId: articleId,
                    reactionType: 'FAVORITE'
                });
                setFavoriteCount(prev => prev + 1);
            }
            setIsFavorited(!isFavorited);
        } catch (error: any) {
            console.error('Failed to toggle favorite:', error);
            alert(error.message || '操作失败，请重试');
        }
    };

    const handleShare = () => {
        if (!article) return;
        
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.summary || article.title,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('content.linkCopied', '链接已复制到剪贴板'));
        }
    };

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'NEWS': return <TreePine className="w-5 h-5 text-[#56B949]" />;
            case 'DYNAMIC': return <Sun className="w-5 h-5 text-[#F0A32F]" />;
            case 'POLICY': return <Droplets className="w-5 h-5 text-[#30499B]" />;
            case 'WIKI': return <Recycle className="w-5 h-5 text-[#EE4035]" />;
            default: return <Leaf className="w-5 h-5 text-[#56B949]" />;
        }
    };

    const getCategoryColor = (type: string) => {
        switch (type) {
            case 'NEWS': return 'from-[#56B949] to-[#4aa840]';
            case 'DYNAMIC': return 'from-[#F0A32F] to-[#e8941a]';
            case 'POLICY': return 'from-[#30499B] to-[#2a4086]';
            case 'WIKI': return 'from-[#EE4035] to-[#d63529]';
            default: return 'from-[#56B949] to-[#4aa840]';
        }
    };

    // 加载中状态
    if (loading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        <div className="bg-white/80 rounded-xl p-8 space-y-4">
                            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                            <div className="h-32 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // 文章不存在
    if (!article) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">文章不存在</h2>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#2a4086] transition-colors"
                    >
                        返回列表
                    </button>
                </div>
            </Layout>
        );
    }

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
                    <div className="flex items-center gap-2 mb-4">
                        {getCategoryIcon(article.type)}
                        <span className="text-sm font-medium text-slate-600 capitalize">
                            {article.type}
                        </span>
                    </div>

                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-3">
                        {article.title}
                    </h1>

                    {article.summary && (
                        <p className="text-lg text-slate-600 mb-6">
                            {article.summary}
                        </p>
                    )}

                    {article.tags && article.tags.length > 0 && (
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
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                            {article.authorName && (
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{article.authorName}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span>{article.viewCount}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-slate-50 rounded-lg text-center">
                            <p className="text-slate-600 mb-3">{t('content.loginToComment', '登录后可以发表评论')}</p>
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors ${isLiked
                                    ? 'border-red-200 bg-red-50 text-red-500'
                                    : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-sm">{likeCount}</span>
                            </button>
                            <button
                                onClick={handleFavorite}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors ${isFavorited
                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-600'
                                    : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <BookmarkPlus className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
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

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <motion.div
                        variants={staggerItem}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
                    >
                        <h3 className="text-xl font-semibold text-[#30499B] mb-6">相关文章</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relatedArticles.map((relatedArticle) => (
                                <div
                                    key={relatedArticle.id}
                                    onClick={() => router.push(`/${locale}/science/${relatedArticle.id}`)}
                                    className="p-4 border border-slate-200 rounded-lg hover:border-[#56B949] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {getCategoryIcon(relatedArticle.type)}
                                        <span className="text-sm text-slate-600 capitalize">
                                            {relatedArticle.type}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2 line-clamp-2">
                                        {relatedArticle.title}
                                    </h4>
                                    {relatedArticle.summary && (
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                            {relatedArticle.summary}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>{relatedArticle.viewCount} 阅读</span>
                                        <span>{relatedArticle.likeCount} 点赞</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </Layout>
    );
}