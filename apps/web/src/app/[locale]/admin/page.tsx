'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { adminApi } from '@/lib/api';
import type { AdminHomeBannerItem, AdminHostVerificationItem } from '@/lib/api/admin';

type AdminTab = 'verifications' | 'banners';

export default function AdminPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;

    const [activeTab, setActiveTab] = useState<AdminTab>('verifications');
    const [verificationStatus, setVerificationStatus] = useState<number | undefined>(1);
    const [verifications, setVerifications] = useState<AdminHostVerificationItem[]>([]);
    const [banners, setBanners] = useState<AdminHomeBannerItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [creatingBanner, setCreatingBanner] = useState(false);
    const [newBanner, setNewBanner] = useState({
        title: '',
        imageUrl: '',
        linkType: 1,
        linkTarget: '',
    });

    const loadVerifications = useCallback(async () => {
        const response = await adminApi.getAdminHostVerifications(verificationStatus);
        setVerifications(response.items);
    }, [verificationStatus]);

    const loadBanners = useCallback(async () => {
        const response = await adminApi.getAdminHomeBanners();
        setBanners(response.items);
    }, []);

    const loadAll = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.all([loadVerifications(), loadBanners()]);
        } catch (error) {
            console.error('Failed to load admin data:', error);
            alert('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    }, [loadVerifications, loadBanners]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleReview = async (userId: string, status: 2 | 3) => {
        try {
            const reviewNote = window.prompt(status === 2 ? 'Approval note (optional)' : 'Reject reason (optional)', '') || undefined;
            await adminApi.reviewAdminHostVerification(userId, { status, reviewNote });
            await loadVerifications();
        } catch (error) {
            console.error('Failed to review host verification:', error);
            alert('Failed to submit review');
        }
    };

    const handleCreateBanner = async () => {
        if (!newBanner.imageUrl.trim()) {
            alert('Image URL is required');
            return;
        }
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

    const handleViewBanner = async (id: string) => {
        try {
            const detail = await adminApi.getAdminHomeBannerById(id);
            window.alert(JSON.stringify(detail, null, 2));
        } catch (error) {
            console.error('Failed to fetch banner detail:', error);
            alert('Failed to fetch banner detail');
        }
    };

    const handleUpdateBanner = async (banner: AdminHomeBannerItem) => {
        const newTitle = window.prompt('Update title', banner.title || '');
        if (newTitle === null) return;
        try {
            await adminApi.updateAdminHomeBanner(banner.id, { title: newTitle });
            await loadBanners();
        } catch (error) {
            console.error('Failed to update banner:', error);
            alert('Failed to update banner');
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await adminApi.deleteAdminHomeBanner(id);
            await loadBanners();
        } catch (error) {
            console.error('Failed to delete banner:', error);
            alert('Failed to delete banner');
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-[#30499B]">Admin Console</h1>
                    <button
                        onClick={() => router.push(`/${locale}/profile`)}
                        className="px-3 py-2 border border-slate-200 rounded-lg"
                    >
                        Back
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('verifications')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'verifications' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}
                    >
                        Host Verifications
                    </button>
                    <button
                        onClick={() => setActiveTab('banners')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'banners' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}
                    >
                        Home Banners
                    </button>
                </div>

                {loading ? (
                    <div className="text-slate-500">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'verifications' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-600">Status</span>
                                    <select
                                        value={verificationStatus ?? ''}
                                        onChange={(e) => setVerificationStatus(e.target.value ? Number(e.target.value) : undefined)}
                                        className="px-3 py-2 border border-slate-200 rounded-lg"
                                    >
                                        <option value="">All</option>
                                        <option value={1}>Pending</option>
                                        <option value={2}>Approved</option>
                                        <option value={3}>Rejected</option>
                                        <option value={4}>Revoked</option>
                                    </select>
                                    <button
                                        onClick={loadVerifications}
                                        className="px-3 py-2 border border-slate-200 rounded-lg"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {verifications.map((item) => (
                                    <div key={item.userId} className="p-4 border border-slate-200 rounded-xl">
                                        <div className="font-medium text-slate-800">{item.orgName}</div>
                                        <div className="text-sm text-slate-600 mt-1">
                                            {item.contactName} / {item.contactPhone}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            status={item.status} submittedAt={item.submittedAt || '-'}
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleReview(item.userId, 2)}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg disabled:opacity-60"
                                                disabled={item.status !== 1}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReview(item.userId, 3)}
                                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg disabled:opacity-60"
                                                disabled={item.status !== 1}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {verifications.length === 0 && <div className="text-slate-500">No records.</div>}
                            </div>
                        )}

                        {activeTab === 'banners' && (
                            <div className="space-y-4">
                                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                    <div className="text-sm font-medium text-slate-700 mb-3">Create Banner</div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input
                                            value={newBanner.title}
                                            onChange={(e) => setNewBanner((prev) => ({ ...prev, title: e.target.value }))}
                                            placeholder="Title"
                                            className="px-3 py-2 border border-slate-200 rounded-lg"
                                        />
                                        <input
                                            value={newBanner.imageUrl}
                                            onChange={(e) => setNewBanner((prev) => ({ ...prev, imageUrl: e.target.value }))}
                                            placeholder="Image URL *"
                                            className="px-3 py-2 border border-slate-200 rounded-lg"
                                        />
                                        <select
                                            value={newBanner.linkType}
                                            onChange={(e) => setNewBanner((prev) => ({ ...prev, linkType: Number(e.target.value) }))}
                                            className="px-3 py-2 border border-slate-200 rounded-lg"
                                        >
                                            <option value={1}>None</option>
                                            <option value={2}>Content</option>
                                            <option value={3}>Activity</option>
                                            <option value={4}>External URL</option>
                                        </select>
                                        <input
                                            value={newBanner.linkTarget}
                                            onChange={(e) => setNewBanner((prev) => ({ ...prev, linkTarget: e.target.value }))}
                                            placeholder="Link target"
                                            className="px-3 py-2 border border-slate-200 rounded-lg"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateBanner}
                                        disabled={creatingBanner}
                                        className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60"
                                    >
                                        {creatingBanner ? 'Creating...' : 'Create'}
                                    </button>
                                </div>

                                {banners.map((banner) => (
                                    <div key={banner.id} className="p-4 border border-slate-200 rounded-xl">
                                        <div className="font-medium text-slate-800">{banner.title || '(untitled)'}</div>
                                        <div className="text-sm text-slate-600 break-all mt-1">{banner.imageUrl}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            linkType={banner.linkType} target={banner.linkTarget || '-'}
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => handleViewBanner(banner.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg">
                                                View
                                            </button>
                                            <button onClick={() => handleUpdateBanner(banner)} className="px-3 py-1.5 border border-slate-200 rounded-lg">
                                                Edit Title
                                            </button>
                                            <button onClick={() => handleDeleteBanner(banner.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {banners.length === 0 && <div className="text-slate-500">No banners.</div>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}

