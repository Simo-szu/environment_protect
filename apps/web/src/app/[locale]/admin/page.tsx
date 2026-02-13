'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { adminApi } from '@/lib/api';
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
            setContentError('Failed to load contents');
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
                alert('Failed to load admin data');
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
        if (!newContent.title.trim() || !newContent.body.trim()) return setMessage('', 'Title and body are required');
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
            setMessage('Content created');
            await loadContents();
        } catch (error) {
            console.error('Failed to create content:', error);
            setMessage('', 'Failed to create content');
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
            setMessage('', 'Failed to load content detail');
        }
    };

    const saveEditContent = async () => {
        if (!editingContentId) return;
        if (!editContent.title.trim() || !editContent.body.trim()) return setMessage('', 'Title and body are required');
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
            setMessage('Content updated');
            await loadContents();
        } catch (error) {
            console.error('Failed to update content:', error);
            setMessage('', 'Failed to update content');
        } finally {
            setUpdatingContent(false);
        }
    };

    const publishContent = async (id: string) => {
        try {
            await adminApi.publishAdminContent(id);
            setMessage('Content published');
            await loadContents();
        } catch (error) {
            console.error('Failed to publish content:', error);
            setMessage('', 'Failed to publish content');
        }
    };

    const deleteContent = async (id: string) => {
        if (!window.confirm('Delete this content?')) return;
        try {
            await adminApi.deleteAdminContent(id);
            if (editingContentId === id) setEditingContentId(null);
            setMessage('Content deleted');
            await loadContents();
        } catch (error) {
            console.error('Failed to delete content:', error);
            setMessage('', 'Failed to delete content');
        }
    };

    const triggerIngestion = async () => {
        try {
            setTriggeringIngestion(true);
            const s = await adminApi.triggerAdminIngestion();
            setIngestionSummary(s);
            setMessage('Ingestion completed');
            await loadContents();
        } catch (error) {
            console.error('Failed to trigger ingestion:', error);
            setMessage('', 'Failed to trigger ingestion');
        } finally {
            setTriggeringIngestion(false);
        }
    };

    const reviewHost = async (userId: string, status: 2 | 3) => {
        try {
            const note = window.prompt(status === 2 ? 'Approval note (optional)' : 'Reject reason (optional)', '') || undefined;
            await adminApi.reviewAdminHostVerification(userId, { status, reviewNote: note });
            await loadVerifications();
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review');
        }
    };

    const createBanner = async () => {
        if (!newBanner.imageUrl.trim()) return alert('Image URL is required');
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
            alert('Failed to create banner');
        } finally {
            setCreatingBanner(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-[#30499B]">Admin Console</h1>
                    <button onClick={() => router.push(`/${locale}/profile`)} className="px-3 py-2 border border-slate-200 rounded-lg">Back</button>
                </div>
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setActiveTab('verifications')} className={`px-4 py-2 rounded-lg ${activeTab === 'verifications' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}>Host Verifications</button>
                    <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 rounded-lg ${activeTab === 'banners' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}>Home Banners</button>
                    <button onClick={() => setActiveTab('contents')} className={`px-4 py-2 rounded-lg ${activeTab === 'contents' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}>Contents</button>
                </div>

                {loading && <div className="text-slate-500">Loading...</div>}

                {!loading && activeTab === 'verifications' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600">Status</span>
                            <select value={verificationStatus ?? ''} onChange={(e) => setVerificationStatus(e.target.value ? Number(e.target.value) : undefined)} className="px-3 py-2 border border-slate-200 rounded-lg">
                                <option value="">All</option><option value={1}>Pending</option><option value={2}>Approved</option><option value={3}>Rejected</option><option value={4}>Revoked</option>
                            </select>
                            <button onClick={loadVerifications} className="px-3 py-2 border border-slate-200 rounded-lg">Refresh</button>
                        </div>
                        {verifications.map((item) => (
                            <div key={item.userId} className="p-4 border border-slate-200 rounded-xl">
                                <div className="font-medium text-slate-800">{item.orgName}</div>
                                <div className="text-sm text-slate-600 mt-1">{item.contactName} / {item.contactPhone}</div>
                                <div className="text-xs text-slate-500 mt-1">status={item.status} submittedAt={item.submittedAt || '-'}</div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => reviewHost(item.userId, 2)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg disabled:opacity-60" disabled={item.status !== 1}>Approve</button>
                                    <button onClick={() => reviewHost(item.userId, 3)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg disabled:opacity-60" disabled={item.status !== 1}>Reject</button>
                                </div>
                            </div>
                        ))}
                        {verifications.length === 0 && <div className="text-slate-500">No records.</div>}
                    </div>
                )}

                {!loading && activeTab === 'banners' && (
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="text-sm font-medium text-slate-700 mb-3">Create Banner</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input value={newBanner.title} onChange={(e) => setNewBanner((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newBanner.imageUrl} onChange={(e) => setNewBanner((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="Image URL *" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <select value={newBanner.linkType} onChange={(e) => setNewBanner((p) => ({ ...p, linkType: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg">
                                    <option value={1}>None</option><option value={2}>Content</option><option value={3}>Activity</option><option value={4}>External URL</option>
                                </select>
                                <input value={newBanner.linkTarget} onChange={(e) => setNewBanner((p) => ({ ...p, linkTarget: e.target.value }))} placeholder="Link target" className="px-3 py-2 border border-slate-200 rounded-lg" />
                            </div>
                            <button onClick={createBanner} disabled={creatingBanner} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{creatingBanner ? 'Creating...' : 'Create'}</button>
                        </div>
                        {banners.map((banner) => (
                            <div key={banner.id} className="p-4 border border-slate-200 rounded-xl">
                                <div className="font-medium text-slate-800">{banner.title || '(untitled)'}</div>
                                <div className="text-sm text-slate-600 break-all mt-1">{banner.imageUrl}</div>
                                <div className="text-xs text-slate-500 mt-1">linkType={banner.linkType} target={banner.linkTarget || '-'}</div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={async () => window.alert(JSON.stringify(await adminApi.getAdminHomeBannerById(banner.id), null, 2))} className="px-3 py-1.5 border border-slate-200 rounded-lg">View</button>
                                    <button onClick={async () => { const t = window.prompt('Update title', banner.title || ''); if (t !== null) { await adminApi.updateAdminHomeBanner(banner.id, { title: t }); await loadBanners(); } }} className="px-3 py-1.5 border border-slate-200 rounded-lg">Edit Title</button>
                                    <button onClick={async () => { if (window.confirm('Delete this banner?')) { await adminApi.deleteAdminHomeBanner(banner.id); await loadBanners(); } }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">Delete</button>
                                </div>
                            </div>
                        ))}
                        {banners.length === 0 && <div className="text-slate-500">No banners.</div>}
                    </div>
                )}

                {!loading && activeTab === 'contents' && (
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="text-sm font-medium text-slate-700 mb-3">Ingestion Control</div>
                            <button onClick={triggerIngestion} disabled={triggeringIngestion} className="px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{triggeringIngestion ? 'Triggering...' : 'Trigger Daily Ingestion'}</button>
                            {ingestionSummary && (
                                <div className="mt-3 text-xs text-slate-700 space-y-1">
                                    <div>startedAt={ingestionSummary.startedAt} finishedAt={ingestionSummary.finishedAt}</div>
                                    {ingestionSummary.reports.map((r) => <div key={r.sourceKey}>{r.sourceKey}: fetched={r.fetched} created={r.created} skipped={r.skipped} failed={r.failed}</div>)}
                                </div>
                            )}
                        </div>

                        {(contentError || contentSuccess) && <div className={`p-3 rounded-lg text-sm ${contentError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{contentError || contentSuccess}</div>}

                        {editingContentId && (
                            <div className="p-4 border border-slate-200 rounded-xl">
                                <div className="flex items-center justify-between mb-3"><div className="text-sm font-medium text-slate-700">Edit Content</div><button onClick={() => setEditingContentId(null)} className="px-3 py-1.5 border border-slate-200 rounded-lg">Cancel</button></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <select value={editContent.type} onChange={(e) => setEditContent((p) => ({ ...p, type: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>News</option><option value={2}>Policy</option><option value={3}>Encyclopedia</option></select>
                                    <select value={editContent.status} onChange={(e) => setEditContent((p) => ({ ...p, status: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>Draft</option><option value={2}>Published</option><option value={3}>Archived</option></select>
                                    <input value={editContent.coverUrl} onChange={(e) => setEditContent((p) => ({ ...p, coverUrl: e.target.value }))} placeholder="Cover URL" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                    <input value={editContent.title} onChange={(e) => setEditContent((p) => ({ ...p, title: e.target.value }))} placeholder="Title *" className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-2" />
                                    <input value={editContent.summary} onChange={(e) => setEditContent((p) => ({ ...p, summary: e.target.value }))} placeholder="Summary" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                    <textarea value={editContent.body} onChange={(e) => setEditContent((p) => ({ ...p, body: e.target.value }))} placeholder="Body *" className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-3 min-h-32" />
                                </div>
                                <button onClick={saveEditContent} disabled={updatingContent} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{updatingContent ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        )}

                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="text-sm font-medium text-slate-700 mb-3">Create Content</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select value={newContent.type} onChange={(e) => setNewContent((p) => ({ ...p, type: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>News</option><option value={2}>Policy</option><option value={3}>Encyclopedia</option></select>
                                <input value={newContent.title} onChange={(e) => setNewContent((p) => ({ ...p, title: e.target.value }))} placeholder="Title *" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newContent.coverUrl} onChange={(e) => setNewContent((p) => ({ ...p, coverUrl: e.target.value }))} placeholder="Cover URL" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newContent.summary} onChange={(e) => setNewContent((p) => ({ ...p, summary: e.target.value }))} placeholder="Summary" className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-2" />
                                <input value={newContent.sourceUrl} onChange={(e) => setNewContent((p) => ({ ...p, sourceUrl: e.target.value }))} placeholder="Source URL" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <select value={newContent.sourceType} onChange={(e) => setNewContent((p) => ({ ...p, sourceType: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>Original</option><option value={2}>Crawled</option></select>
                                <select value={newContent.status} onChange={(e) => setNewContent((p) => ({ ...p, status: Number(e.target.value) }))} className="px-3 py-2 border border-slate-200 rounded-lg"><option value={1}>Draft</option><option value={2}>Published</option></select>
                                <textarea value={newContent.body} onChange={(e) => setNewContent((p) => ({ ...p, body: e.target.value }))} placeholder="Body *" className="px-3 py-2 border border-slate-200 rounded-lg md:col-span-3 min-h-28" />
                            </div>
                            <button onClick={createContent} disabled={creatingContent} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{creatingContent ? 'Creating...' : 'Create Content'}</button>
                        </div>

                        <div className="p-4 border border-slate-200 rounded-xl">
                            <div className="flex flex-wrap gap-3 items-center mb-3">
                                <span className="text-sm text-slate-600">Filter</span>
                                <select value={contentTypeFilter ?? ''} onChange={(e) => setContentTypeFilter(e.target.value ? Number(e.target.value) : undefined)} className="px-3 py-2 border border-slate-200 rounded-lg"><option value="">All Types</option><option value={1}>News</option><option value={2}>Policy</option><option value={3}>Encyclopedia</option></select>
                                <select value={contentStatusFilter ?? ''} onChange={(e) => setContentStatusFilter(e.target.value ? Number(e.target.value) : undefined)} className="px-3 py-2 border border-slate-200 rounded-lg"><option value="">All Status</option><option value={1}>Draft</option><option value={2}>Published</option><option value={3}>Archived</option></select>
                                <input value={contentKeywordInput} onChange={(e) => setContentKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setContentPage(1); setContentKeyword(contentKeywordInput.trim()); } }} placeholder="Search title/summary/body" className="px-3 py-2 border border-slate-200 rounded-lg min-w-64" />
                                <button onClick={() => { setContentPage(1); setContentKeyword(contentKeywordInput.trim()); }} className="px-3 py-2 border border-slate-200 rounded-lg">Apply</button>
                            </div>
                            {loadingContents ? <div className="text-slate-500">Loading contents...</div> : (
                                <div className="space-y-3">
                                    {contents.map((item) => (
                                        <div key={item.id} className="p-4 border border-slate-200 rounded-xl">
                                            <div className="font-medium text-slate-800">{item.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">id={item.id} type={item.type} status={item.status} publishedAt={item.publishedAt || '-'}</div>
                                            <div className="text-sm text-slate-600 mt-1 line-clamp-2">{item.summary || '-'}</div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <button onClick={() => startEditContent(item.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg">Edit</button>
                                                <button onClick={() => publishContent(item.id)} disabled={item.status === 2} className="px-3 py-1.5 bg-green-600 text-white rounded-lg disabled:opacity-60">Publish</button>
                                                <button onClick={() => deleteContent(item.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                    {contents.length === 0 && <div className="text-slate-500">No contents.</div>}
                                </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                                <div className="text-sm text-slate-500">Total {contentTotal} records, page {contentPage} / {totalPages}</div>
                                <div className="flex gap-2 items-center">
                                    <button onClick={() => setContentPage((p) => Math.max(1, p - 1))} disabled={contentPage <= 1} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50">Prev</button>
                                    {visiblePages.map((n) => <button key={n} onClick={() => setContentPage(n)} className={`px-3 py-1.5 rounded-lg border ${n === contentPage ? 'bg-[#30499B] text-white border-[#30499B]' : 'border-slate-200'}`}>{n}</button>)}
                                    <button onClick={() => setContentPage((p) => Math.min(totalPages, p + 1))} disabled={contentPage >= totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
