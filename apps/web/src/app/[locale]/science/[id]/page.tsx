'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
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
import AuthPromptModal from '@/components/auth/AuthPromptModal';
import { formatDate, formatShortDate } from '@/lib/date-utils';

export default function ScienceArticleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const locale = (params.locale as string) || 'zh';
    const { t } = useSafeTranslation('article');
    const { user, isLoggedIn } = useAuth();

    // 状态管理
    const [article, setArticle] = useState<ContentDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [relatedArticles, setRelatedArticles] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    // 加载文章数据
    useEffect(() => {
        const loadArticleData = async () => {
            try {
                setLoading(true);

                // 加载文章详情
                const articleData = await contentApi.getContentDetail(articleId).catch(() => null);

                if (articleData) {
                    setArticle(articleData);

                    // 设置用户状态
                    if (articleData.userState) {
                        setIsLiked(articleData.userState.liked);
                        setIsFavorited(articleData.userState.favorited);
                    }
                    setLikeCount(articleData.likeCount);
                    setFavoriteCount(articleData.favoriteCount);
                }

                // 静默加载评论（失败不影响页面）
                contentApi.getContentComments(articleId, { page: 1, size: 10, sort: 'latest' })
                    .then(commentsData => setComments(commentsData.items))
                    .catch(() => { });

                // 静默加载相关文章（失败不影响页面）
                contentApi.getContents({ page: 1, size: 3, sort: 'latest' })
                    .then(relatedData => {
                        setRelatedArticles(relatedData.items.filter(item => item.id !== articleId).slice(0, 2));
                    })
                    .catch(() => { });

            } catch (error) {
                // 完全静默处理错误
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
            setIsAuthModalOpen(true);
            return;
        }

        try {
            if (isLiked) {
                await interactionApi.deleteReaction(1, articleId, 'LIKE');
                setLikeCount(prev => prev - 1);
                setIsLiked(false);
            } else {
                await interactionApi.createReaction(1, articleId, 'LIKE');
                setLikeCount(prev => prev + 1);
                setIsLiked(true);
            }
        } catch (error: any) {
            console.error('Failed to toggle like:', error);
            // 如果失败，恢复原状态
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
            alert(error.message || t('error.operationFailed', '操作失败，请重试'));
        }
    };

    const handleFavorite = async () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        try {
            if (isFavorited) {
                await interactionApi.deleteReaction(1, articleId, 'FAVORITE');
                setFavoriteCount(prev => prev - 1);
                setIsFavorited(false);
            } else {
                await interactionApi.createReaction(1, articleId, 'FAVORITE');
                setFavoriteCount(prev => prev + 1);
                setIsFavorited(true);
            }
        } catch (error: any) {
            console.error('Failed to toggle favorite:', error);
            // 如果失败，恢复原状态
            setIsFavorited(!isFavorited);
            setFavoriteCount(prev => isFavorited ? prev + 1 : prev - 1);
            alert(error.message || t('error.operationFailed', '操作失败，请重试'));
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

    const handleSubmitComment = async () => {
        if (!commentText.trim()) {
            alert(t('comments.emptyError', '评论内容不能为空'));
            return;
        }

        try {
            setIsSubmittingComment(true);
            await interactionApi.createComment({
                targetType: 1, // 1=CONTENT
                targetId: articleId,
                body: commentText.trim()
            });

            // 清空输入框
            setCommentText('');

            // 重新加载评论列表
            const commentsData = await contentApi.getContentComments(articleId, { page: 1, size: 10, sort: 'latest' });
            setComments(commentsData.items);

            alert(t('comments.success', '评论发表成功'));
        } catch (error: any) {
            console.error('Failed to submit comment:', error);
            alert(error.message || t('comments.error', '评论发表失败，请重试'));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleLikeComment = async (commentId: string, isLiked: boolean) => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        try {
            if (isLiked) {
                await interactionApi.deleteReaction(3, commentId, 'LIKE');
            } else {
                await interactionApi.createReaction(3, commentId, 'LIKE');
            }

            // 重新加载评论列表以更新点赞数
            const commentsData = await contentApi.getContentComments(articleId, { page: 1, size: 10, sort: 'latest' });
            setComments(commentsData.items);
        } catch (error: any) {
            console.error('Failed to toggle comment like:', error);
            alert(error.message || t('error.operationFailed', '操作失败，请重试'));
        }
    };

    const handleReplyComment = (commentId: string) => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }
        setReplyingTo(commentId);
        setReplyText('');
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!replyText.trim()) {
            alert(t('comments.emptyError', '回复内容不能为空'));
            return;
        }

        try {
            await interactionApi.createComment({
                targetType: 1, // 1=CONTENT
                targetId: articleId,
                body: replyText.trim(),
                parentId: parentId
            });

            // 清空回复状态
            setReplyingTo(null);
            setReplyText('');

            // 重新加载评论列表
            const commentsData = await contentApi.getContentComments(articleId, { page: 1, size: 10, sort: 'latest' });
            setComments(commentsData.items);

            alert(t('comments.success', '回复发表成功'));
        } catch (error: any) {
            console.error('Failed to submit reply:', error);
            alert(error.message || t('comments.error', '回复发表失败，请重试'));
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
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                        {t('error.notFound', '文章不存在')}
                    </h2>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#2a4086] transition-colors"
                    >
                        {t('actions.back', '返回列表')}
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
                            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#30499B] leading-tight">
                                {article.title}
                            </h1>
                        </div>
                    </div>

                    {/* Article Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold text-sm">
                                {article.authorName?.charAt(0) || 'A'}
                            </div>
                            <span>{article.authorName || t('article.anonymous', '匿名作者')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.viewCount} {locale === 'zh' ? '阅读' : 'views'}</span>
                        </div>
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
                            <span>{likeCount}</span>
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
                    {/* 文章分类标签 */}
                    <div className="flex items-center gap-2 mb-6">
                        {getCategoryIcon(article.type)}
                        <span className="text-sm font-medium text-slate-600 capitalize">
                            {article.type}
                        </span>
                    </div>

                    {/* 文章摘要 */}
                    {article.summary && (
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            {article.summary}
                        </p>
                    )}

                    {/* 文章正文 */}
                    {article.content && (
                        <div className="prose prose-slate prose-lg max-w-none mb-8
                            prose-headings:text-[#30499B] prose-headings:font-serif
                            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:my-4
                            prose-a:text-[#56B949] prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-slate-800 prose-strong:font-semibold
                            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-6
                            prose-blockquote:border-l-4 prose-blockquote:border-[#56B949] prose-blockquote:pl-4 prose-blockquote:italic
                            prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:text-slate-700 prose-li:my-1">
                            <div
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </div>
                    )}

                    {/* 文章标签 */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200">
                            {article.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Comments Section */}
                <motion.div
                    variants={staggerItem}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <MessageCircle className="w-5 h-5 text-[#30499B]" />
                        <h3 className="text-xl font-semibold text-[#30499B]">
                            {t('comments.title', '评论')} ({comments.length})
                        </h3>
                    </div>

                    {/* Comment Input */}
                    {isLoggedIn ? (
                        <div className="mb-8">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {user?.nickname?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder={t('comments.placeholder', '写下你的评论...')}
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none resize-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            onClick={handleSubmitComment}
                                            disabled={isSubmittingComment || !commentText.trim()}
                                            className="px-4 py-2 bg-[#56B949] text-white rounded-lg hover:bg-[#4aa840] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmittingComment ? t('comments.submitting', '发表中...') : t('comments.submit', '发表评论')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-4 bg-slate-50 rounded-lg text-center">
                            <p className="text-slate-600 mb-3">{t('comments.loginRequired', '登录后可以发表评论')}</p>
                            <button
                                onClick={() => router.push(`/${locale}/login`)}
                                className="px-4 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors text-sm font-medium"
                            >
                                {t('comments.login', '立即登录')}
                            </button>
                        </div>
                    )}

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#30499B] to-[#253a7a] flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {comment.userName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-slate-800">{comment.userName}</span>
                                            <span className="text-xs text-slate-400">
                                                {formatShortDate(comment.createdAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 mb-2">{comment.content}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <button 
                                                onClick={() => handleLikeComment(comment.id, comment.liked || false)}
                                                className={`flex items-center gap-1 transition-colors ${
                                                    comment.liked 
                                                        ? 'text-[#EE4035]' 
                                                        : 'text-slate-500 hover:text-[#EE4035]'
                                                }`}
                                            >
                                                <Heart className={`w-4 h-4 ${comment.liked ? 'fill-current' : ''}`} />
                                                <span>{comment.likeCount || 0}</span>
                                            </button>
                                            <button 
                                                onClick={() => handleReplyComment(comment.id)}
                                                className="text-slate-500 hover:text-[#30499B] transition-colors"
                                            >
                                                {t('comments.reply', '回复')}
                                            </button>
                                        </div>

                                        {/* Reply Input */}
                                        {replyingTo === comment.id && (
                                            <div className="mt-3 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder={t('comments.replyPlaceholder', '写下你的回复...')}
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none text-sm"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSubmitReply(comment.id);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleSubmitReply(comment.id)}
                                                    className="px-3 py-2 bg-[#56B949] text-white rounded-lg hover:bg-[#4aa840] transition-colors text-sm"
                                                >
                                                    {t('comments.submit', '发表')}
                                                </button>
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                                                >
                                                    {t('common.cancel', '取消')}
                                                </button>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="mt-4 space-y-4 pl-4 border-l-2 border-slate-100">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#e8941a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                            {reply.userName?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-slate-800 text-sm">{reply.userName}</span>
                                                                <span className="text-xs text-slate-400">
                                                                    {formatShortDate(reply.createdAt, locale === 'zh' ? 'zh-CN' : 'en-US')}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-700 text-sm">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            {t('comments.empty', '暂无评论，快来发表第一条评论吧！')}
                        </div>
                    )}
                </motion.div>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <motion.div
                        variants={staggerItem}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
                    >
                        <h3 className="text-xl font-semibold text-[#30499B] mb-6">
                            {t('content.relatedArticles', '相关文章')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relatedArticles.map((relatedArticle) => (
                                <div
                                    key={relatedArticle.id}
                                    onClick={() => router.push(`/${locale}/science/${relatedArticle.id}`)}
                                    className="p-4 border border-slate-200 rounded-lg hover:border-[#56B949] transition-colors cursor-pointer flex flex-col h-full"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {getCategoryIcon(relatedArticle.type)}
                                        <span className="text-sm text-slate-600 capitalize">
                                            {relatedArticle.type}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">
                                        {relatedArticle.title}
                                    </h4>
                                    {relatedArticle.summary && (
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-1">
                                            {relatedArticle.summary}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto">
                                        <span>{relatedArticle.viewCount} {locale === 'zh' ? '阅读' : 'views'}</span>
                                        <span>{relatedArticle.likeCount} {locale === 'zh' ? '点赞' : 'likes'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
            {/* Auth Prompt Modal */}
            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </Layout>
    );
}