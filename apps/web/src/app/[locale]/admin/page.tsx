'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { adminApi } from '@/lib/api';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import type {
    AdminContentDetail,
    AdminContentItem,
    AdminDailyIngestionSummary,
    AdminHomeBannerItem,
    AdminHostVerificationItem,
} from '@/lib/api/admin';

type AdminTab = 'verifications' | 'banners' | 'contents';

type ContentFormState = {
    type: number;
    title: string;
    summary: string;
    coverUrl: string;
    body: string;
    sourceType: number;
    sourceUrl: string;
    status: number;
};

const defaultContentForm: ContentFormState = {
    type: 1,
    title: '',
    summary: '',
    coverUrl: '',
    body: '',
    sourceType: 2,
    sourceUrl: '',
    status: 1,
};

const pageNumbers = (current: number, total: number): number[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, total];
    if (current >= total - 3) return [1, total - 4, total - 3, total - 2, total - 1, total];
    return [1, current - 1, current, current + 1, total];
};

export default function AdminPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('admin');

    const [activeTab, setActiveTab] = useState<AdminTab>('verifications');
    const [verificationStatus, setVerificationStatus] = useState<number | undefined>(1);
    const [verifications, setVerifications] = useState<AdminHostVerificationItem[]>([]);
    const [banners, setBanners] = useState<AdminHomeBannerItem[]>([]);
    const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '', linkType: 1, linkTarget: '' });

    const [contents, setContents] = useState<AdminContentItem[]>([]);
    const [contentTotal, setContentTotal] = useState(0);
    const [contentPage, setContentPage] = useState(1);
    const [contentTypeFilter, setContentTypeFilter] = useState<number | undefined>();
    const [contentStatusFilter, setContentStatusFilter] = useState<number | undefined>();
    const [contentKeywordInput, setContentKeywordInput] = useState('');
    const [contentKeyword, setContentKeyword] = useState('');
    const [newContent, setNewContent] = useState<ContentFormState>(defaultContentForm);
    const [editingContentId, setEditingContentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<ContentFormState>(defaultContentForm);
    const [ingestionSummary, setIngestionSummary] = useState<AdminDailyIngestionSummary | null>(null);
    const [contentError, setContentError] = useState('');
    const [contentSuccess, setContentSuccess] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingContents, setLoadingContents] = useState(false);
    const [creatingBanner, setCreatingBanner] = useState(false);
    const [creatingContent, setCreatingContent] = useState(false);
    const [updatingContent, setUpdatingContent] = useState(false);
    const [triggeringIngestion, setTriggeringIngestion] = useState(false);

    const contentSize = 20;
    const totalPages = useMemo(() => Math.max(1, Math.ceil(contentTotal / contentSize)), [contentTotal]);
    const visiblePages = useMemo(() => pageNumbers(contentPage, totalPages), [contentPage, totalPages]);

    const loadVerifications = useCallback(async () => {
        const r = await adminApi.getAdminHostVerifications(verificationStatus);
        setVerifications(r.items);
    }, [verificationStatus]);

    const loadBanners = useCallback(async () => {
        const r = await adminApi.getAdminHomeBanners();
        setBanners(r.items);
    }, []);

    const loadContents = useCallback(async () => {
        try {
            setLoadingContents(true);
            setContentError('');
            const r = await adminApi.getAdminContents({
                page: contentPage,
                size: contentSize,
                type: contentTypeFilter,
                status: contentStatusFilter,
                keyword: contentKeyword || undefined,
            });
            setContents(r.items);
            setContentTotal(r.total);
        } catch (error) {
            console.error('Failed to load contents:', error);
            setContentError(t('contents.loadFailed'));
        } finally {
            setLoadingContents(false);
        }
    }, [contentKeyword, contentPage, contentStatusFilter, contentTypeFilter]);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                await Promise.all([loadVerifications(), loadBanners()]);
            } catch (error) {
                console.error('Failed to load admin data:', error);
                alert(t('loadFailed', 'Failed to load admin data'));
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [loadBanners, loadVerifications]);

    useEffect(() => {
        if (activeTab === 'contents') loadContents();
    }, [activeTab, loadContents]);

    const mapDetailToForm = (d: AdminContentDetail): ContentFormState => ({
        type: d.type,
        title: d.title || '',
        summary: d.summary || '',
        coverUrl: d.coverUrl || '',
        body: d.body || '',
        sourceType: d.sourceType || 2,
        sourceUrl: d.sourceUrl || '',
        status: d.status,
    });

    const setMessage = (ok: string, err = '') => {
        setContentSuccess(ok);
        setContentError(err);
    };

    const createContent = async () => {
        if (!newContent.title.trim() || !newContent.body.trim()) return setMessage('', t('contents.titleAndBodyRequired'));
        try {
            setCreatingContent(true);
            await adminApi.createAdminContent({
                type: newContent.type,
                title: newContent.title.trim(),
                summary: newContent.summary.trim() || undefined,
                coverUrl: newContent.coverUrl.trim() || undefined,
                body: newContent.body.trim(),
                sourceType: newContent.sourceType,
                sourceUrl: newContent.sourceUrl.trim() || undefined,
                status: newContent.status,
            });
            setNewContent(defaultContentForm);
            setContentPage(1);
            setMessage(t('contents.contentCreated'));
            await loadContents();
        } catch (error) {
            console.error('Failed to create content:', error);
            setMessage('', t('contents.createFailed'));
        } finally {
            setCreatingContent(false);
        }
    };

    const startEditContent = async (id: string) => {
        try {
            const d = await adminApi.getAdminContentById(id);
            setEditingContentId(id);
            setEditContent(mapDetailToForm(d));
            setMessage('');
        } catch (error) {
            console.error('Failed to load content detail:', error);
            setMessage('', t('contents.loadDetailFailed'));
        }
    };

    const saveEditContent = async () => {
        if (!editingContentId) return;
        if (!editContent.title.trim() || !editContent.body.trim()) return setMessage('', t('contents.titleAndBodyRequired'));
        try {
            setUpdatingContent(true);
            await adminApi.updateAdminContent(editingContentId, {
                type: editContent.type,
                title: editContent.title.trim(),
                summary: editContent.summary.trim() || undefined,
                coverUrl: editContent.coverUrl.trim() || undefined,
                body: editContent.body.trim(),
                status: editContent.status,
            });
            setEditingContentId(null);
            setEditContent(defaultContentForm);
            setMessage(t('contents.contentUpdated'));
            await loadContents();
        } catch (error) {
            console.error('Failed to update content:', error);
            setMessage('', t('contents.updateFailed'));
        } finally {
            setUpdatingContent(false);
        }
    };

    const publishContent = async (id: string) => {
        try {
            await adminApi.publishAdminContent(id);
            setMessage(t('contents.contentPublished'));
            await loadContents();
        } catch (error) {
            console.error('Failed to publish content:', error);
            setMessage('', t('contents.publishFailed'));
        }
    };

    const deleteContent = async (id: string) => {
        if (!window.confirm(t('contents.confirmDelete'))) return;
        try {
            await adminApi.deleteAdminContent(id);
            if (editingContentId === id) setEditingContentId(null);
            setMessage(t('contents.contentDeleted'));
            await loadContents();
        } catch (error) {
            console.error('Failed to delete content:', error);
            setMessage('', t('contents.deleteFailed'));
        }
    };

    const triggerIngestion = async () => {
        try {
            setTriggeringIngestion(true);
            const s = await adminApi.triggerAdminIngestion();
            setIngestionSummary(s);
            setMessage(t('contents.ingestionCompleted'));
            await loadContents();
        } catch (error) {
            console.error('Failed to trigger ingestion:', error);
            setMessage('', t('contents.ingestionFailed'));
        } finally {
            setTriggeringIngestion(false);
        }
    };

    const reviewHost = async (userId: string, status: 2 | 3) => {
        try {
            const note = window.prompt(status === 2 ? t('verifications.approvalNote') : t('verifications.rejectReason'), '') || undefined;
            await adminApi.reviewAdminHostVerification(userId, { status, reviewNote: note });
            await loadVerifications();
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert(t('verifications.reviewFailed'));
        }
    };

    const createBanner = async () => {
        if (!newBanner.imageUrl.trim()) return alert(t('banners.imageUrlRequired'));
        try {
            setCreatingBanner(true);
            await adminApi.createAdminHomeBanner({
                title: newBanner.title.trim() || undefined,
                imageUrl: newBanner.imageUrl.trim(),
                linkType: newBanner.linkType,
                linkTarget: newBanner.linkTarget.trim() || undefined,
                isEnabled: true,
                sortOrder: 0,
            });
            setNewBanner({ title: '', imageUrl: '', linkType: 1, linkTarget: '' });
            await loadBanners();
        } catch (error) {
            console.error('Failed to create banner:', error);
            alert(t('banners.createFailed'));
        } finally {
            setCreatingBanner(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-[#30499B]">{t('console')}</h1>
                    <button onClick={() => router.push(`/${locale}/profile`)} className="px-3 py-2 border border-slate-200 rounded-lg">{t('back')}</button>
                </div>
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setActiveTab('verifications')} className={`px-4 py-2 rounded-lg ${activeTab === 'verifications' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}>{t('tabs.verifications')}</button>
                    <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 rounded-lg ${activeTab === 'banners' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}>{t('tabs.banners')}</button>
                    <button onClick={() => setActiveTab('contents')} className={`px-4 py-2 rounded-lg ${activeTab === 'contents' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}>{t('tabs.contents')}</button>
                </div>

                {loading && <div className="text-slate-500">{t('loading')}</div>}

                {!loading && activeTab === 'verifications' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600">{t('verifications.status')}</span>
                            <select value={verificationStatus ?? ''} onChange={(e) => setVerificationStatus(e.target.value ? Number(e.target.value) : undefined)} className="px-3 py-2 border border-slate-200 rounded-lg">
                                <option value="">{t('verifications.all')}</option><option value={1}>{t('verifications.pending')}</option><option value={2}>{t('verifications.approved')}</option><option value={3}>{t('verifications.rejected')}</option><option value={4}>{t('verifications.revoked')}</option>
                            </select>
                            <button onClick={loadVerifications} className="px-3 py-2 border border-slate-200 rounded-lg">{t('refresh')}</button>
                        </div>
                        {verifications.map((item) => (
                            <div key={item.userId} className="p-4 border border-slate-200 rounded-xl">
                                <div className="font-medium text-slate-800">{item.orgName}</div>
                                <div className="text-sm text-slate-600 mt-1">{item.contactName} / {item.contactPhone}</div>
                                <div className="text-xs text-slate-500 mt-1">status={item.status} submittedAt={item.submittedAt || '-'}</div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => reviewHost(item.userId, 2)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg disabled:opacity-60" disabled={item.status !== 1}>{t('approve')}</button>
                                    <button onClick={() => reviewHost(item.userId, 3)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg disabled:opacity-60" disabled={item.status !== 1}>{t('reject')}</button>
                                </div>
                            </div>
                        ))}
                        {verifications.length === 0 && <div className="text-slate-500">{t('noRecords')}</div>}
                    </div>
                )}

                {!loading && activeTab === 'banners' && (
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="text-sm font-medium text-slate-700 mb-3">{t('banners.createBanner')}</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input value={newBanner.title} onChange={(e) => setNewBanner((p) => ({ ...p, title: e.target.value }))} placeholder={t('banners.title')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newBanner.imageUrl} onChange={(e) => setNewBanner((p) => ({ ...p, imageUrl: e.target.value }))} placeholder={t('banners.imageUrl') + ' *'} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <select value={newBanner.linkType} onChange={(e) => setNewBanner((p) => ({ ...p, linkType: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg">
                                    <option value={1}>{t('banners.none')}</option><option value={2}>{t('banners.content')}</option><option value={3}>{t('banners.activity')}</option><option value={4}>{t('banners.externalUrl')}</option>
                                </select>
                                <input value={newBanner.linkTarget} onChange={(e) => setNewBanner((p) => ({ ...p, linkTarget: e.target.value }))} placeholder={t('banners.linkTarget')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                            </div>
                            <button onClick={createBanner} disabled={creatingBanner} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{creatingBanner ? t('banners.creating') : t('banners.create')}</button>
                        </div>
                        {banners.map((banner) => (
                            <div key={banner.id} className="p-4 border border-slate-200 rounded-xl">
                                <div className="font-medium text-slate-800">{banner.title || t('banners.untitled')}</div>
                                <div className="text-sm text-slate-600 break-all mt-1">{banner.imageUrl}</div>
                                <div className="text-xs text-slate-500 mt-1">linkType={banner.linkType} target={banner.linkTarget || '-'}</div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={async () => window.alert(JSON.stringify(await adminApi.getAdminHomeBannerById(banner.id), null, 2))} className="px-3 py-1.5 border border-slate-200 rounded-lg">{t('banners.viewDetails')}</button>
                                    <button onClick={async () => { const title = window.prompt(t('banners.updateTitle'), banner.title || ''); if (title !== null) { await adminApi.updateAdminHomeBanner(banner.id, { title }); await loadBanners(); } }} className="px-3 py-1.5 border border-slate-200 rounded-lg">{t('banners.editTitle')}</button>
                                    <button onClick={async () => { if (window.confirm(t('banners.confirmDelete'))) { await adminApi.deleteAdminHomeBanner(banner.id); await loadBanners(); } }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">{t('banners.delete')}</button>
                                </div>
                            </div>
                        ))}
                        {banners.length === 0 && <div className="text-slate-500">{t('banners.noBanners')}</div>}
                    </div>
                )}

                {!loading && activeTab === 'contents' && (
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="text-sm font-medium text-slate-700 mb-3">{t('contents.ingestionControl')}</div>
                            <button onClick={triggerIngestion} disabled={triggeringIngestion} className="px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{triggeringIngestion ? t('contents.triggering') : t('contents.triggerIngestion')}</button>
                            {ingestionSummary && (
                                <div className="mt-3 text-xs text-slate-700 space-y-1">
                                    <div>{t('contents.startedAt')}={ingestionSummary.startedAt} {t('contents.finishedAt')}={ingestionSummary.finishedAt}</div>
                                    {ingestionSummary.reports.map((r) => <div key={r.sourceKey}>{r.sourceKey}: fetched={r.fetched} created={r.created} skipped={r.skipped} failed={r.failed}</div>)}
                                </div>
                            )}
                        </div>

                        {(contentError || contentSuccess) && <div className={`p-3 rounded-lg text-sm ${contentError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{contentError || contentSuccess}</div>}

                        {editingContentId && (
                            <div className="p-4 border border-slate-200 rounded-xl">
                                <div className="flex items-center justify-between mb-3"><div className="text-sm font-medium text-slate-700">{t('contents.editContent')}</div><button onClick={() => setEditingContentId(null)} className="px-3 py-1.5 border border-slate-200 rounded-lg">{t('contents.cancel')}</button></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <select value={editContent.type} onChange={(e) => setEditContent((p) => ({ ...p, type: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>{t('contents.news')}</option><option value={2}>{t('contents.policy')}</option><option value={3}>{t('contents.encyclopedia')}</option></select>
                                    <select value={editContent.status} onChange={(e) => setEditContent((p) => ({ ...p, status: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>{t('contents.draft')}</option><option value={2}>{t('contents.published')}</option><option value={3}>{t('contents.archived')}</option></select>
                                    <input value={editContent.coverUrl} onChange={(e) => setEditContent((p) => ({ ...p, coverUrl: e.target.value }))} placeholder={t('contents.coverUrl')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                    <input value={editContent.title} onChange={(e) => setEditContent((p) => ({ ...p, title: e.target.value }))} placeholder={t('contents.titleRequired')} className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-2" />
                                    <input value={editContent.summary} onChange={(e) => setEditContent((p) => ({ ...p, summary: e.target.value }))} placeholder={t('contents.summary')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                    <textarea value={editContent.body} onChange={(e) => setEditContent((p) => ({ ...p, body: e.target.value }))} placeholder={t('contents.bodyRequired')} className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-3 min-h-32" />
                                </div>
                                <button onClick={saveEditContent} disabled={updatingContent} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{updatingContent ? t('contents.saving') : t('contents.saveChanges')}</button>
                            </div>
                        )}

                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="text-sm font-medium text-slate-700 mb-3">{t('contents.createContent')}</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select value={newContent.type} onChange={(e) => setNewContent((p) => ({ ...p, type: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>{t('contents.news')}</option><option value={2}>{t('contents.policy')}</option><option value={3}>{t('contents.encyclopedia')}</option></select>
                                <input value={newContent.title} onChange={(e) => setNewContent((p) => ({ ...p, title: e.target.value }))} placeholder={t('contents.titleRequired')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newContent.coverUrl} onChange={(e) => setNewContent((p) => ({ ...p, coverUrl: e.target.value }))} placeholder={t('contents.coverUrl')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newContent.summary} onChange={(e) => setNewContent((p) => ({ ...p, summary: e.target.value }))} placeholder={t('contents.summary')} className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-2" />
                                <input value={newContent.sourceUrl} onChange={(e) => setNewContent((p) => ({ ...p, sourceUrl: e.target.value }))} placeholder={t('contents.sourceUrl')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <select value={newContent.sourceType} onChange={(e) => setNewContent((p) => ({ ...p, sourceType: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>{t('contents.original')}</option><option value={2}>{t('contents.crawled')}</option></select>
                                <select value={newContent.status} onChange={(e) => setNewContent((p) => ({ ...p, status: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>{t('contents.draft')}</option><option value={2}>{t('contents.published')}</option></select>
                                <textarea value={newContent.body} onChange={(e) => setNewContent((p) => ({ ...p, body: e.target.value }))} placeholder={t('contents.bodyRequired')} className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-3 min-h-28" />
                            </div>
                            <button onClick={createContent} disabled={creatingContent} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{creatingContent ? t('contents.creating') : t('contents.createContent')}</button>
                        </div>

                        <div className="p-4 border border-slate-200 rounded-xl">
                            <div className="flex flex-wrap gap-3 items-center mb-3">
                                <span className="text-sm text-slate-600">{t('contents.filter')}</span>
                                <select value={contentTypeFilter ?? ''} onChange={(e) => setContentTypeFilter(e.target.value ? Number(e.target.value) : undefined)} className="px-3 py-2 border border-slate-200 rounded-lg"><option value="">{t('contents.allTypes')}</option><option value={1}>{t('contents.news')}</option><option value={2}>{t('contents.policy')}</option><option value={3}>{t('contents.encyclopedia')}</option></select>
                                <select value={contentStatusFilter ?? ''} onChange={(e) => setContentStatusFilter(e.target.value ? Number(e.target.value) : undefined)} className="px-3 py-2 border border-slate-200 rounded-lg"><option value="">{t('contents.allStatus')}</option><option value={1}>{t('contents.draft')}</option><option value={2}>{t('contents.published')}</option><option value={3}>{t('contents.archived')}</option></select>
                                <input value={contentKeywordInput} onChange={(e) => setContentKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setContentPage(1); setContentKeyword(contentKeywordInput.trim()); } }} placeholder={t('contents.searchPlaceholder')} className="px-3 py-2 border border-slate-200 rounded-lg min-w-64" />
                                <button onClick={() => { setContentPage(1); setContentKeyword(contentKeywordInput.trim()); }} className="px-3 py-2 border border-slate-200 rounded-lg">{t('contents.apply')}</button>
                            </div>
                            {loadingContents ? <div className="text-slate-500">{t('contents.loadingContents')}</div> : (
                                <div className="space-y-3">
                                    {contents.map((item) => (
                                        <div key={item.id} className="p-4 border border-slate-200 rounded-xl">
                                            <div className="font-medium text-slate-800">{item.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">id={item.id} type={item.type} status={item.status} publishedAt={item.publishedAt || '-'}</div>
                                            <div className="text-sm text-slate-600 mt-1 line-clamp-2">{item.summary || '-'}</div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <button onClick={() => startEditContent(item.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg">{t('contents.edit')}</button>
                                                <button onClick={() => publishContent(item.id)} disabled={item.status === 2} className="px-3 py-1.5 bg-green-600 text-white rounded-lg disabled:opacity-60">{t('contents.publish')}</button>
                                                <button onClick={() => deleteContent(item.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">{t('contents.delete')}</button>
                                            </div>
                                        </div>
                                    ))}
                                    {contents.length === 0 && <div className="text-slate-500">{t('contents.noContents')}</div>}
                                </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                                <div className="text-sm text-slate-500">{t('contents.totalRecords', '', { total: contentTotal })}, {t('contents.pageInfo', '', { page: contentPage, totalPages })}</div>
                                <div className="flex gap-2 items-center">
                                    <button onClick={() => setContentPage((p) => Math.max(1, p - 1))} disabled={contentPage <= 1} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50">{t('contents.prev')}</button>
                                    {visiblePages.map((n) => <button key={n} onClick={() => setContentPage(n)} className={`px-3 py-1.5 rounded-lg border ${n === contentPage ? 'bg-[#30499B] text-white border-[#30499B]' : 'border-slate-200'}`}>{n}</button>)}
                                    <button onClick={() => setContentPage((p) => Math.min(totalPages, p + 1))} disabled={contentPage >= totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50">{t('contents.next')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
