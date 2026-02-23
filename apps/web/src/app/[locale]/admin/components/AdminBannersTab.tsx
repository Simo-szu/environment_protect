'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import type { AdminHomeBannerItem } from '@/lib/api/admin';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

const PAGE_SIZE = 20;

export function AdminBannersTab() {
    const { t } = useSafeTranslation('admin');

    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState<AdminHomeBannerItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Drawer/Dialog state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '', linkType: 1, linkTarget: '' });
    const [creatingBanner, setCreatingBanner] = useState(false);

    const loadBanners = useCallback(async (p: number = page) => {
        try {
            setLoading(true);
            const r = await adminApi.getAdminHomeBanners({ page: p, size: PAGE_SIZE });
            setBanners(r.items);
            setTotal(r.total);
        } catch (error) {
            console.error('Failed to load banners:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadBanners(page);
    }, [page]);

    const handlePageChange = (p: number) => {
        setPage(p);
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
            setIsCreateOpen(false);
            await loadBanners(page);
        } catch (error) {
            console.error('Failed to create banner:', error);
            alert(t('banners.createFailed'));
        } finally {
            setCreatingBanner(false);
        }
    };

    const deleteBanner = async (id: string) => {
        if (window.confirm(t('banners.confirmDelete', '确认删除横幅？'))) {
            try {
                await adminApi.deleteAdminHomeBanner(id);
                await loadBanners(page);
            } catch (error) {
                console.error('Failed to delete banner:', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 tracking-tight">{t('tabs.banners')}</h2>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#30499B] dark:bg-[#56B949] hover:bg-[#25397a] dark:hover:bg-[#4aa840] text-white font-medium rounded-xl transition-all shadow-md shadow-[#30499B]/20 dark:shadow-[#56B949]/20"
                >
                    <span className="text-lg leading-none">+</span>
                    {t('banners.createBanner', '新建横幅')}
                </button>
            </div>

            {loading && banners.length === 0 && (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">{t('loading')}</div>
            )}

            {!loading && banners.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
                    <div className="text-4xl mb-3 opacity-50">🖼️</div>
                    <p>{t('banners.noBanners', '暂无横幅设置')}</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="group overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                        <div className="aspect-[21/9] w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                            {banner.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={banner.imageUrl} alt={banner.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="text-slate-400">{t('noRecords')}</div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteBanner(banner.id)}
                                    className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm transition-colors"
                                    title={t('banners.delete')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 line-clamp-1">{banner.title || t('banners.untitled', '未命名横幅')}</h3>

                            <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-mono shrink-0">URL</span>
                                    <span className="truncate">{banner.imageUrl}</span>
                                </div>
                                {banner.linkTarget && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-mono shrink-0">LINK</span>
                                        <span className="truncate">{banner.linkTarget}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-mono shrink-0">TYPE</span>
                                    <span>
                                        {banner.linkType === 1 ? t('banners.none') :
                                            banner.linkType === 2 ? t('banners.content') :
                                                banner.linkType === 3 ? t('banners.activity') :
                                                    t('banners.externalUrl')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lsaquo;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border ${p === page ? 'bg-[#30499B] dark:bg-[#56B949] text-white border-[#30499B] dark:border-[#56B949]' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &rsaquo;
                    </button>
                </div>
            )}

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl overflow-hidden p-0 border-none shadow-2xl dark:bg-slate-800">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                        <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                            {t('banners.createBanner', '新建横幅')}
                        </DialogTitle>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('banners.title', '标题')}</label>
                            <input
                                value={newBanner.title}
                                onChange={(e) => setNewBanner(p => ({ ...p, title: e.target.value }))}
                                placeholder={t('banners.title')}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 focus:border-[#30499B]/30 dark:focus:border-[#56B949]/30 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('banners.imageUrl', '图片 URL')} <span className="text-red-500">*</span></label>
                            <input
                                value={newBanner.imageUrl}
                                onChange={(e) => setNewBanner(p => ({ ...p, imageUrl: e.target.value }))}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 focus:border-[#30499B]/30 dark:focus:border-[#56B949]/30 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('banners.linkType', '跳转类型')}</label>
                                <Select
                                    value={newBanner.linkType.toString()}
                                    onValueChange={(v) => setNewBanner(p => ({ ...p, linkType: Number(v) }))}
                                >
                                    <SelectTrigger className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                        <SelectValue placeholder={t('banners.none')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">{t('banners.none')}</SelectItem>
                                        <SelectItem value="2">{t('banners.content')}</SelectItem>
                                        <SelectItem value="3">{t('banners.activity')}</SelectItem>
                                        <SelectItem value="4">{t('banners.externalUrl')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('banners.linkTarget', '跳转目标')}</label>
                                <input
                                    value={newBanner.linkTarget}
                                    onChange={(e) => setNewBanner(p => ({ ...p, linkTarget: e.target.value }))}
                                    placeholder={newBanner.linkType === 4 ? "https://..." : "ID"}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 focus:border-[#30499B]/30 dark:focus:border-[#56B949]/30 transition-all disabled:opacity-50"
                                    disabled={newBanner.linkType === 1}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={() => setIsCreateOpen(false)}
                            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
                        >
                            {t('cancel', '取消')}
                        </button>
                        <button
                            onClick={createBanner}
                            disabled={creatingBanner}
                            className="px-5 py-2.5 rounded-xl text-white font-medium bg-[#30499B] dark:bg-[#56B949] hover:bg-[#25397a] dark:hover:bg-[#4aa840] shadow-sm shadow-[#30499B]/20 dark:shadow-[#56B949]/20 disabled:opacity-60 transition-colors"
                        >
                            {creatingBanner ? t('banners.creating', '创建中...') : t('banners.create', '创建横幅')}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
