'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookmarkPlus, Calendar, Clock, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import Layout from '@/components/Layout';
import AuthPromptModal from '@/components/auth/AuthPromptModal';
import { useAuth } from '@/hooks/useAuth';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { contentApi, interactionApi } from '@/lib/api';
import type { Comment, ContentDetail, ContentItem } from '@/lib/api/content';
import { pageEnter, staggerContainer, staggerItem } from '@/lib/animations';
import { formatDate, formatShortDate } from '@/lib/date-utils';

function norm(v?: string): string {
    if (!v) return '';
    return v.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/[^\w\u4e00-\u9fa5]+/g, '').trim();
}

function nearDuplicate(a?: string, b?: string): boolean {
    const x = norm(a);
    const y = norm(b);
    return x.length > 24 && y.length > 24 && (x.includes(y) || y.includes(x));
}

function splitParagraph(text: string, max = 260): string[] {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean || clean.length <= max) return [clean];
    const segs = clean.split(/(?<=[。！？.!?])\s+/).filter(Boolean);
    if (segs.length < 2) return [clean];
    const out: string[] = [];
    let cur = '';
    for (const seg of segs) {
        const next = cur ? `${cur} ${seg}` : seg;
        if (next.length > max && cur) {
            out.push(cur);
            cur = seg;
        } else {
            cur = next;
        }
    }
    if (cur) out.push(cur);
    return out;
}

function formatReadableHtml(rawHtml?: string, summary?: string): string {
    if (!rawHtml || typeof window === 'undefined') return rawHtml || '';
    try {
        const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
        doc.querySelectorAll('script,style,noscript').forEach(n => n.remove());

        const p0 = doc.querySelector('p');
        if (p0 && nearDuplicate(p0.textContent || '', summary)) p0.remove();

        Array.from(doc.querySelectorAll('p')).forEach(p => {
            const text = (p.textContent || '').trim();
            if (!text || text.length <= 360 || p.querySelector('img,table,ul,ol,pre,blockquote')) return;
            const parts = splitParagraph(text);
            if (parts.length <= 1) return;
            const frag = doc.createDocumentFragment();
            parts.forEach(part => {
                const next = doc.createElement('p');
                next.textContent = part;
                frag.appendChild(next);
            });
            p.replaceWith(frag);
        });

        doc.querySelectorAll('a[href]').forEach(a => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer nofollow');
        });
        doc.querySelectorAll('img').forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
        });

        return doc.body.innerHTML.trim();
    } catch {
        return rawHtml;
    }
}

function readMinutes(html?: string): number {
    if (!html || typeof window === 'undefined') return 1;
    const text = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
    const words = (text.match(/[A-Za-z0-9]+/g) || []).length;
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.max(1, Math.ceil((words + cjk / 2) / 220));
}

export default function ScienceArticleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const locale = (params.locale as string) || 'zh';
    const { t } = useSafeTranslation('article');
    const { user, isLoggedIn } = useAuth();

    const [article, setArticle] = useState<ContentDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [relatedArticles, setRelatedArticles] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');

    const contentHtml = useMemo(() => formatReadableHtml(article?.content, article?.summary), [article?.content, article?.summary]);
    const minutes = useMemo(() => readMinutes(contentHtml), [contentHtml]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await contentApi.getContentDetail(articleId).catch(() => null);
                if (data) {
                    setArticle(data);
                    setIsLiked(Boolean(data.userState?.liked));
                    setIsFavorited(Boolean(data.userState?.favorited));
                    setLikeCount(data.likeCount);
                }
                contentApi.getContentComments(articleId, { page: 1, size: 10, sort: 'latest' }).then(r => setComments(r.items)).catch(() => undefined);
                contentApi.getContents({ page: 1, size: 3, sort: 'latest' }).then(r => setRelatedArticles(r.items.filter(i => i.id !== articleId).slice(0, 2))).catch(() => undefined);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [articleId]);

    const toggleLike = async () => {
        if (!isLoggedIn) return setIsAuthModalOpen(true);
        if (isLiked) await interactionApi.deleteReaction(1, articleId, 'LIKE');
        else await interactionApi.createReaction(1, articleId, 'LIKE');
        setIsLiked(v => !v);
        setLikeCount(v => v + (isLiked ? -1 : 1));
    };

    const toggleFavorite = async () => {
        if (!isLoggedIn) return setIsAuthModalOpen(true);
        if (isFavorited) await interactionApi.deleteReaction(1, articleId, 'FAVORITE');
        else await interactionApi.createReaction(1, articleId, 'FAVORITE');
        setIsFavorited(v => !v);
    };

    const submitComment = async () => {
        if (!isLoggedIn) return setIsAuthModalOpen(true);
        if (!commentText.trim()) return;
        await interactionApi.createComment({ targetType: 1, targetId: articleId, body: commentText.trim() });
        setCommentText('');
        const next = await contentApi.getContentComments(articleId, { page: 1, size: 10, sort: 'latest' });
        setComments(next.items);
    };

    if (loading) return <Layout><div className="max-w-4xl mx-auto px-4 py-10 text-slate-500">Loading...</div></Layout>;
    if (!article) return <Layout><div className="max-w-4xl mx-auto px-4 py-10 text-slate-500">{t('error.notFound', '文章不存在')}</div></Layout>;

    return (
        <Layout>
            <motion.div initial="hidden" animate="visible" variants={pageEnter} className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex items-center gap-4 mb-5">
                        <button onClick={() => router.push(`/${locale}/science`)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700"><ArrowLeft className="w-5 h-5" /></button>
                        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#30499B] dark:text-[#56B949] leading-tight">{article.title}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(article.publishedAt, locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                        <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" />{article.viewCount} {locale === 'zh' ? '阅读' : 'views'}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{minutes} {locale === 'zh' ? '分钟阅读' : 'min read'}</span>
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                        <button onClick={toggleLike} className={`px-3 py-2 rounded-lg border inline-flex items-center gap-2 ${isLiked ? 'text-[#EE4035] border-[#EE4035]' : 'border-slate-200 dark:border-slate-700'}`}><Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />{likeCount}</button>
                        <button onClick={toggleFavorite} className={`px-3 py-2 rounded-lg border inline-flex items-center gap-2 ${isFavorited ? 'text-[#56B949] border-[#56B949]' : 'border-slate-200 dark:border-slate-700'}`}><BookmarkPlus className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />{t('actions.favorite', '收藏')}</button>
                        <button onClick={() => navigator.share ? navigator.share({ title: article.title, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 inline-flex items-center gap-2"><Share2 className="w-4 h-4" />{t('actions.share', '分享')}</button>
                    </div>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer} className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                <motion.article variants={staggerItem} className="rounded-3xl border border-slate-200/70 dark:border-slate-700/60 bg-white/85 dark:bg-slate-800/80 shadow-lg p-7 md:p-10">
                    {article.summary && <p className="mb-8 border-l-4 border-slate-200 dark:border-slate-700 pl-5 italic text-slate-600 dark:text-slate-300">{article.summary}</p>}
                    <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert prose-base md:prose-lg
                        prose-p:leading-8 prose-p:my-5 prose-headings:font-serif prose-headings:text-[#30499B] dark:prose-headings:text-[#56B949]
                        prose-a:text-[#56B949] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md"
                        dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </motion.article>

                <motion.section variants={staggerItem} className="rounded-3xl border border-slate-200/70 dark:border-slate-700/60 bg-white/85 dark:bg-slate-800/80 shadow-lg p-7 md:p-8">
                    <h3 className="text-xl font-bold text-[#30499B] dark:text-[#56B949] inline-flex items-center gap-2 mb-6"><MessageCircle className="w-5 h-5" />{t('comments.title', '评论')} ({comments.length})</h3>
                    <div className="mb-6">
                        {isLoggedIn ? (
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#56B949] text-white flex items-center justify-center text-sm font-bold">{user?.nickname?.charAt(0).toUpperCase() || 'U'}</div>
                                <div className="flex-1 space-y-2">
                                    <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={t('comments.placeholder', '写下你的评论...')} rows={3} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                                    <div className="flex justify-end"><button onClick={submitComment} className="px-4 py-2 rounded-lg bg-[#56B949] text-white">{t('comments.submit', '发表评论')}</button></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-500">{t('comments.loginRequired', '登录后可以发表评论')}</div>
                        )}
                    </div>
                    <div className="space-y-5">
                        {comments.length === 0 && <div className="text-slate-500">{t('comments.empty', '暂无评论，快来发表第一条评论吧')}</div>}
                        {comments.map(comment => (
                            <div key={comment.id} className="border-t border-slate-100 dark:border-slate-700 pt-4">
                                <div className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{comment.userName} <span className="text-xs text-slate-400 font-normal ml-2">{formatShortDate(comment.createdAt, locale === 'zh' ? 'zh-CN' : 'en-US')}</span></div>
                                <p className="mt-2 text-slate-600 dark:text-slate-300 leading-7">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {relatedArticles.length > 0 && (
                    <motion.section variants={staggerItem} className="rounded-3xl border border-slate-200/70 dark:border-slate-700/60 bg-white/85 dark:bg-slate-800/80 shadow-lg p-7 md:p-8">
                        <h3 className="text-xl font-bold text-[#30499B] dark:text-[#56B949] mb-5">{t('content.relatedArticles', '相关文章')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relatedArticles.map(item => (
                                <button key={item.id} onClick={() => router.push(`/${locale}/science/${item.id}`)} className="text-left rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-[#56B949] transition-colors">
                                    <h4 className="font-serif font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{item.title}</h4>
                                    {item.summary && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.summary}</p>}
                                </button>
                            ))}
                        </div>
                    </motion.section>
                )}
            </motion.div>

            <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </Layout>
    );
}
