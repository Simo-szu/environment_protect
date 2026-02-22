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
    AdminGameCardItem,
    AdminIngestionSettings,
    AdminHomeBannerItem,
    AdminHostVerificationItem,
} from '@/lib/api/admin';

type AdminTab = 'verifications' | 'banners' | 'gameCards' | 'contents';

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

type IngestionSettingsFormState = {
    cron: string;
    zone: string;
    enabled: boolean;
    publishStatus: number;
    requestTimeoutMs: number;
    requestIntervalMs: number;
    earthEnabled: boolean;
    earthMaxPages: number;
    earthMaxArticles: number;
    ecoepnEnabled: boolean;
    ecoepnMaxPages: number;
    ecoepnMaxArticles: number;
};

type IngestionSettingsFormErrors = Partial<Record<keyof IngestionSettingsFormState, string>>;

type GameCardFormState = {
    cardId: string;
    cardNo: number;
    chineseName: string;
    englishName: string;
    cardType: 'core' | 'policy';
    domain: 'industry' | 'ecology' | 'science' | 'society' | 'policy';
    star: number;
    phaseBucket: 'early' | 'mid' | 'late' | 'policy';
    unlockCostIndustry: number;
    unlockCostTech: number;
    unlockCostPopulation: number;
    unlockCostGreen: number;
    imageKey: string;
    advancedImageKey: string;
    isEnabled: boolean;
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

const defaultIngestionSettingsForm: IngestionSettingsFormState = {
    cron: '',
    zone: '',
    enabled: true,
    publishStatus: 1,
    requestTimeoutMs: 10000,
    requestIntervalMs: 300,
    earthEnabled: true,
    earthMaxPages: 2,
    earthMaxArticles: 30,
    ecoepnEnabled: true,
    ecoepnMaxPages: 2,
    ecoepnMaxArticles: 30,
};

const defaultGameCardForm: GameCardFormState = {
    cardId: '',
    cardNo: 1,
    chineseName: '',
    englishName: '',
    cardType: 'core',
    domain: 'industry',
    star: 1,
    phaseBucket: 'early',
    unlockCostIndustry: 0,
    unlockCostTech: 0,
    unlockCostPopulation: 0,
    unlockCostGreen: 0,
    imageKey: '',
    advancedImageKey: '',
    isEnabled: true,
};

const validateIngestionSettings = (
    form: IngestionSettingsFormState,
    t: (key: string, fallback?: string, values?: Record<string, string | number>) => string
): IngestionSettingsFormErrors => {
    const errors: IngestionSettingsFormErrors = {};
    const cronParts = form.cron.trim().split(/\s+/);

    if (!form.cron.trim()) errors.cron = t('contents.validation.cronRequired');
    else if (cronParts.length < 6 || cronParts.length > 7) errors.cron = t('contents.validation.cronInvalid');

    if (!form.zone.trim()) errors.zone = t('contents.validation.zoneRequired');

    if (form.publishStatus < 0) errors.publishStatus = t('contents.validation.publishStatusInvalid');
    if (form.requestTimeoutMs <= 0) errors.requestTimeoutMs = t('contents.validation.timeoutInvalid');
    if (form.requestIntervalMs < 0) errors.requestIntervalMs = t('contents.validation.intervalInvalid');
    if (form.earthMaxPages <= 0) errors.earthMaxPages = t('contents.validation.maxPagesInvalid');
    if (form.earthMaxArticles <= 0) errors.earthMaxArticles = t('contents.validation.maxArticlesInvalid');
    if (form.ecoepnMaxPages <= 0) errors.ecoepnMaxPages = t('contents.validation.maxPagesInvalid');
    if (form.ecoepnMaxArticles <= 0) errors.ecoepnMaxArticles = t('contents.validation.maxArticlesInvalid');

    return errors;
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
    const [gameCards, setGameCards] = useState<AdminGameCardItem[]>([]);
    const [newGameCard, setNewGameCard] = useState<GameCardFormState>(defaultGameCardForm);
    const [editingGameCardId, setEditingGameCardId] = useState<string | null>(null);
    const [editingGameCard, setEditingGameCard] = useState<GameCardFormState>(defaultGameCardForm);
    const [creatingGameCard, setCreatingGameCard] = useState(false);
    const [updatingGameCard, setUpdatingGameCard] = useState(false);

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
    const [ingestionSettings, setIngestionSettings] = useState<IngestionSettingsFormState>(defaultIngestionSettingsForm);
    const [contentError, setContentError] = useState('');
    const [contentSuccess, setContentSuccess] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingContents, setLoadingContents] = useState(false);
    const [creatingBanner, setCreatingBanner] = useState(false);
    const [creatingContent, setCreatingContent] = useState(false);
    const [updatingContent, setUpdatingContent] = useState(false);
    const [triggeringIngestion, setTriggeringIngestion] = useState(false);
    const [loadingIngestionSettings, setLoadingIngestionSettings] = useState(false);
    const [savingIngestionSettings, setSavingIngestionSettings] = useState(false);

    const contentSize = 20;
    const totalPages = useMemo(() => Math.max(1, Math.ceil(contentTotal / contentSize)), [contentTotal]);
    const visiblePages = useMemo(() => pageNumbers(contentPage, totalPages), [contentPage, totalPages]);
    const ingestionSettingsErrors = useMemo(
        () => validateIngestionSettings(ingestionSettings, t),
        [ingestionSettings, t]
    );
    const getFieldClassName = (hasError: boolean): string =>
        `px-3 py-2 border rounded-lg ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`;

    const loadVerifications = useCallback(async () => {
        const r = await adminApi.getAdminHostVerifications(verificationStatus);
        setVerifications(r.items);
    }, [verificationStatus]);

    const loadBanners = useCallback(async () => {
        const r = await adminApi.getAdminHomeBanners();
        setBanners(r.items);
    }, []);

    const mapGameCardToForm = useCallback((card: AdminGameCardItem): GameCardFormState => ({
        cardId: card.cardId,
        cardNo: card.cardNo,
        chineseName: card.chineseName,
        englishName: card.englishName,
        cardType: card.cardType,
        domain: card.domain,
        star: card.star,
        phaseBucket: card.phaseBucket,
        unlockCostIndustry: card.unlockCost?.industry ?? 0,
        unlockCostTech: card.unlockCost?.tech ?? 0,
        unlockCostPopulation: card.unlockCost?.population ?? 0,
        unlockCostGreen: card.unlockCost?.green ?? 0,
        imageKey: card.imageKey || '',
        advancedImageKey: card.advancedImageKey || '',
        isEnabled: true,
    }), []);

    const loadGameCards = useCallback(async () => {
        const r = await adminApi.getAdminGameCards();
        setGameCards(r.items);
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

    const mapIngestionSettingsToForm = (s: AdminIngestionSettings): IngestionSettingsFormState => ({
        cron: s.cron,
        zone: s.zone,
        enabled: s.enabled,
        publishStatus: s.publishStatus,
        requestTimeoutMs: s.requestTimeoutMs,
        requestIntervalMs: s.requestIntervalMs,
        earthEnabled: s.earth.enabled,
        earthMaxPages: s.earth.maxPages,
        earthMaxArticles: s.earth.maxArticles,
        ecoepnEnabled: s.ecoepn.enabled,
        ecoepnMaxPages: s.ecoepn.maxPages,
        ecoepnMaxArticles: s.ecoepn.maxArticles,
    });

    const loadIngestionSettings = useCallback(async () => {
        try {
            setLoadingIngestionSettings(true);
            const settings = await adminApi.getAdminIngestionSettings();
            setIngestionSettings(mapIngestionSettingsToForm(settings));
        } catch (error) {
            console.error('Failed to load ingestion settings:', error);
            setContentError(t('contents.loadIngestionSettingsFailed'));
        } finally {
            setLoadingIngestionSettings(false);
        }
    }, [t]);

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
        if (activeTab !== 'contents') return;
        const run = async () => {
            await Promise.all([loadContents(), loadIngestionSettings()]);
        };
        run();
    }, [activeTab, loadContents, loadIngestionSettings]);

    useEffect(() => {
        if (activeTab !== 'gameCards') return;
        loadGameCards();
    }, [activeTab, loadGameCards]);

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

    const saveIngestionSettings = async () => {
        const errors = validateIngestionSettings(ingestionSettings, t);
        if (Object.keys(errors).length > 0) {
            setMessage('', t('contents.validation.fixErrors'));
            return;
        }

        try {
            setSavingIngestionSettings(true);
            const updated = await adminApi.updateAdminIngestionSettings({
                cron: ingestionSettings.cron.trim(),
                zone: ingestionSettings.zone.trim(),
                enabled: ingestionSettings.enabled,
                publishStatus: ingestionSettings.publishStatus,
                requestTimeoutMs: ingestionSettings.requestTimeoutMs,
                requestIntervalMs: ingestionSettings.requestIntervalMs,
                earth: {
                    enabled: ingestionSettings.earthEnabled,
                    maxPages: ingestionSettings.earthMaxPages,
                    maxArticles: ingestionSettings.earthMaxArticles,
                },
                ecoepn: {
                    enabled: ingestionSettings.ecoepnEnabled,
                    maxPages: ingestionSettings.ecoepnMaxPages,
                    maxArticles: ingestionSettings.ecoepnMaxArticles,
                },
            });
            setIngestionSettings(mapIngestionSettingsToForm(updated));
            setMessage(t('contents.ingestionSettingsSaved'));
        } catch (error) {
            console.error('Failed to update ingestion settings:', error);
            setMessage('', t('contents.ingestionSettingsSaveFailed'));
        } finally {
            setSavingIngestionSettings(false);
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

    const createGameCard = async () => {
        if (!newGameCard.cardId.trim() || !newGameCard.chineseName.trim() || !newGameCard.englishName.trim()) {
            alert(t('gameCards.required', 'Card ID/Chinese Name/English Name are required'));
            return;
        }
        try {
            setCreatingGameCard(true);
            await adminApi.createAdminGameCard({
                ...newGameCard,
                cardId: newGameCard.cardId.trim(),
                chineseName: newGameCard.chineseName.trim(),
                englishName: newGameCard.englishName.trim(),
                imageKey: newGameCard.imageKey.trim() || undefined,
                advancedImageKey: newGameCard.advancedImageKey.trim() || undefined,
            });
            setNewGameCard(defaultGameCardForm);
            await loadGameCards();
        } catch (error) {
            console.error('Failed to create game card:', error);
            alert(t('gameCards.createFailed', 'Failed to create game card'));
        } finally {
            setCreatingGameCard(false);
        }
    };

    const startEditGameCard = async (cardId: string) => {
        try {
            const card = await adminApi.getAdminGameCardById(cardId);
            setEditingGameCardId(cardId);
            setEditingGameCard(mapGameCardToForm(card));
        } catch (error) {
            console.error('Failed to load game card detail:', error);
            alert(t('gameCards.loadDetailFailed', 'Failed to load game card detail'));
        }
    };

    const saveGameCard = async () => {
        if (!editingGameCardId) return;
        try {
            setUpdatingGameCard(true);
            await adminApi.updateAdminGameCard(editingGameCardId, {
                cardNo: editingGameCard.cardNo,
                chineseName: editingGameCard.chineseName,
                englishName: editingGameCard.englishName,
                cardType: editingGameCard.cardType,
                domain: editingGameCard.domain,
                star: editingGameCard.star,
                phaseBucket: editingGameCard.phaseBucket,
                unlockCostIndustry: editingGameCard.unlockCostIndustry,
                unlockCostTech: editingGameCard.unlockCostTech,
                unlockCostPopulation: editingGameCard.unlockCostPopulation,
                unlockCostGreen: editingGameCard.unlockCostGreen,
                imageKey: editingGameCard.imageKey.trim() || undefined,
                advancedImageKey: editingGameCard.advancedImageKey.trim() || undefined,
                isEnabled: editingGameCard.isEnabled,
            });
            setEditingGameCardId(null);
            setEditingGameCard(defaultGameCardForm);
            await loadGameCards();
        } catch (error) {
            console.error('Failed to update game card:', error);
            alert(t('gameCards.updateFailed', 'Failed to update game card'));
        } finally {
            setUpdatingGameCard(false);
        }
    };

    const deleteGameCard = async (cardId: string) => {
        if (!window.confirm(t('gameCards.confirmDelete', 'Delete this game card?'))) return;
        try {
            await adminApi.deleteAdminGameCard(cardId);
            if (editingGameCardId === cardId) {
                setEditingGameCardId(null);
                setEditingGameCard(defaultGameCardForm);
            }
            await loadGameCards();
        } catch (error) {
            console.error('Failed to delete game card:', error);
            alert(t('gameCards.deleteFailed', 'Failed to delete game card'));
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
                    <button onClick={() => setActiveTab('gameCards')} className={`px-4 py-2 rounded-lg ${activeTab === 'gameCards' ? 'bg-[#30499B] text-white' : 'border border-slate-200'}`}>{t('tabs.gameCards', 'Game Cards')}</button>
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

                {!loading && activeTab === 'gameCards' && (
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="text-sm font-medium text-slate-700 mb-3">{t('gameCards.create', 'Create Game Card')}</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input value={newGameCard.cardId} onChange={(e) => setNewGameCard((p) => ({ ...p, cardId: e.target.value }))} placeholder="card069" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input type="number" value={newGameCard.cardNo} onChange={(e) => setNewGameCard((p) => ({ ...p, cardNo: Number(e.target.value) || 1 }))} placeholder="cardNo" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newGameCard.chineseName} onChange={(e) => setNewGameCard((p) => ({ ...p, chineseName: e.target.value }))} placeholder={t('gameCards.chineseName', 'Chinese Name')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newGameCard.englishName} onChange={(e) => setNewGameCard((p) => ({ ...p, englishName: e.target.value }))} placeholder={t('gameCards.englishName', 'English Name')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <select value={newGameCard.cardType} onChange={(e) => setNewGameCard((p) => ({ ...p, cardType: e.target.value as GameCardFormState['cardType'] }))} className="px-3 py-2 border border-slate-200 rounded-lg">
                                    <option value="core">core</option>
                                    <option value="policy">policy</option>
                                </select>
                                <select value={newGameCard.domain} onChange={(e) => setNewGameCard((p) => ({ ...p, domain: e.target.value as GameCardFormState['domain'] }))} className="px-3 py-2 border border-slate-200 rounded-lg">
                                    <option value="industry">industry</option>
                                    <option value="ecology">ecology</option>
                                    <option value="science">science</option>
                                    <option value="society">society</option>
                                    <option value="policy">policy</option>
                                </select>
                                <select value={newGameCard.phaseBucket} onChange={(e) => setNewGameCard((p) => ({ ...p, phaseBucket: e.target.value as GameCardFormState['phaseBucket'] }))} className="px-3 py-2 border border-slate-200 rounded-lg">
                                    <option value="early">early</option>
                                    <option value="mid">mid</option>
                                    <option value="late">late</option>
                                    <option value="policy">policy</option>
                                </select>
                                <input type="number" value={newGameCard.star} onChange={(e) => setNewGameCard((p) => ({ ...p, star: Number(e.target.value) || 1 }))} placeholder="star" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input type="number" value={newGameCard.unlockCostIndustry} onChange={(e) => setNewGameCard((p) => ({ ...p, unlockCostIndustry: Number(e.target.value) || 0 }))} placeholder="industry cost" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input type="number" value={newGameCard.unlockCostTech} onChange={(e) => setNewGameCard((p) => ({ ...p, unlockCostTech: Number(e.target.value) || 0 }))} placeholder="tech cost" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input type="number" value={newGameCard.unlockCostPopulation} onChange={(e) => setNewGameCard((p) => ({ ...p, unlockCostPopulation: Number(e.target.value) || 0 }))} placeholder="population cost" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input type="number" value={newGameCard.unlockCostGreen} onChange={(e) => setNewGameCard((p) => ({ ...p, unlockCostGreen: Number(e.target.value) || 0 }))} placeholder="green cost" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newGameCard.imageKey} onChange={(e) => setNewGameCard((p) => ({ ...p, imageKey: e.target.value }))} placeholder="image key" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                <input value={newGameCard.advancedImageKey} onChange={(e) => setNewGameCard((p) => ({ ...p, advancedImageKey: e.target.value }))} placeholder="advanced image key" className="px-3 py-2 border border-slate-200 rounded-lg" />
                            </div>
                            <button onClick={createGameCard} disabled={creatingGameCard} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">
                                {creatingGameCard ? t('gameCards.creating', 'Creating...') : t('gameCards.createSubmit', 'Create')}
                            </button>
                        </div>

                        {editingGameCardId && (
                            <div className="p-4 border border-slate-200 rounded-xl bg-white">
                                <div className="text-sm font-medium text-slate-700 mb-3">
                                    {t('gameCards.editing', 'Editing')} {editingGameCardId}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <input type="number" value={editingGameCard.cardNo} onChange={(e) => setEditingGameCard((p) => ({ ...p, cardNo: Number(e.target.value) || 1 }))} placeholder="cardNo" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                    <input value={editingGameCard.chineseName} onChange={(e) => setEditingGameCard((p) => ({ ...p, chineseName: e.target.value }))} placeholder={t('gameCards.chineseName', 'Chinese Name')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                    <input value={editingGameCard.englishName} onChange={(e) => setEditingGameCard((p) => ({ ...p, englishName: e.target.value }))} placeholder={t('gameCards.englishName', 'English Name')} className="px-3 py-2 border border-slate-200 rounded-lg" />
                                    <input type="number" value={editingGameCard.star} onChange={(e) => setEditingGameCard((p) => ({ ...p, star: Number(e.target.value) || 1 }))} placeholder="star" className="px-3 py-2 border border-slate-200 rounded-lg" />
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={saveGameCard} disabled={updatingGameCard} className="px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">
                                        {updatingGameCard ? t('gameCards.saving', 'Saving...') : t('save', 'Save')}
                                    </button>
                                    <button onClick={() => setEditingGameCardId(null)} className="px-3 py-2 border border-slate-200 rounded-lg">{t('cancel', 'Cancel')}</button>
                                </div>
                            </div>
                        )}

                        {gameCards.map((card) => (
                            <div key={card.cardId} className="p-4 border border-slate-200 rounded-xl">
                                <div className="font-medium text-slate-800">{card.cardId} / {card.chineseName}</div>
                                <div className="text-sm text-slate-600 mt-1">
                                    #{card.cardNo} {card.cardType} {card.domain} {card.phaseBucket} star={card.star}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    cost(i/t/p/g)={card.unlockCost.industry}/{card.unlockCost.tech}/{card.unlockCost.population}/{card.unlockCost.green}
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => startEditGameCard(card.cardId)} className="px-3 py-1.5 border border-slate-200 rounded-lg">{t('edit', 'Edit')}</button>
                                    <button onClick={() => deleteGameCard(card.cardId)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">{t('delete', 'Delete')}</button>
                                </div>
                            </div>
                        ))}
                        {gameCards.length === 0 && <div className="text-slate-500">{t('gameCards.empty', 'No game cards')}</div>}
                    </div>
                )}

                {!loading && activeTab === 'contents' && (
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="text-sm font-medium text-slate-700">{t('contents.ingestionControl')}</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={loadIngestionSettings} disabled={loadingIngestionSettings} className="px-3 py-2 border border-slate-200 rounded-lg disabled:opacity-60">
                                        {loadingIngestionSettings ? t('contents.loading') : t('refresh')}
                                    </button>
                                    <button
                                        onClick={saveIngestionSettings}
                                        disabled={savingIngestionSettings || loadingIngestionSettings || Object.keys(ingestionSettingsErrors).length > 0}
                                        className="px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60"
                                    >
                                        {savingIngestionSettings ? t('contents.saving') : t('contents.saveIngestionSettings')}
                                    </button>
                                </div>
                            </div>
                            {Object.keys(ingestionSettingsErrors).length > 0 && (
                                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    {t('contents.validation.fixErrors')}
                                </div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                    <div className="text-xs font-semibold text-slate-700">{t('contents.scheduleConfig')}</div>
                                    <input
                                        value={ingestionSettings.cron}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, cron: e.target.value }))}
                                        placeholder={t('contents.ingestionCron')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.cron))}
                                    />
                                    {ingestionSettingsErrors.cron && <div className="text-xs text-red-600">{ingestionSettingsErrors.cron}</div>}
                                    <input
                                        value={ingestionSettings.zone}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, zone: e.target.value }))}
                                        placeholder={t('contents.ingestionZone')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.zone))}
                                    />
                                    {ingestionSettingsErrors.zone && <div className="text-xs text-red-600">{ingestionSettingsErrors.zone}</div>}
                                    <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={ingestionSettings.enabled}
                                            onChange={(e) => setIngestionSettings((p) => ({ ...p, enabled: e.target.checked }))}
                                        />
                                        {t('contents.ingestionEnabled')}
                                    </label>
                                </div>
                                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                    <div className="text-xs font-semibold text-slate-700">{t('contents.globalConfig')}</div>
                                    <input
                                        type="number"
                                        value={ingestionSettings.publishStatus}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, publishStatus: Number(e.target.value) }))}
                                        placeholder={t('contents.publishStatus')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.publishStatus))}
                                    />
                                    {ingestionSettingsErrors.publishStatus && <div className="text-xs text-red-600">{ingestionSettingsErrors.publishStatus}</div>}
                                    <input
                                        type="number"
                                        value={ingestionSettings.requestTimeoutMs}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, requestTimeoutMs: Number(e.target.value) }))}
                                        placeholder={t('contents.requestTimeoutMs')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.requestTimeoutMs))}
                                    />
                                    {ingestionSettingsErrors.requestTimeoutMs && <div className="text-xs text-red-600">{ingestionSettingsErrors.requestTimeoutMs}</div>}
                                    <input
                                        type="number"
                                        value={ingestionSettings.requestIntervalMs}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, requestIntervalMs: Number(e.target.value) }))}
                                        placeholder={t('contents.requestIntervalMs')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.requestIntervalMs))}
                                    />
                                    {ingestionSettingsErrors.requestIntervalMs && <div className="text-xs text-red-600">{ingestionSettingsErrors.requestIntervalMs}</div>}
                                </div>
                                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                    <div className="text-xs font-semibold text-slate-700">{t('contents.sourceConfig')}</div>
                                    <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={ingestionSettings.earthEnabled}
                                            onChange={(e) => setIngestionSettings((p) => ({ ...p, earthEnabled: e.target.checked }))}
                                        />
                                        {t('contents.earthEnabled')}
                                    </label>
                                    <input
                                        type="number"
                                        value={ingestionSettings.earthMaxPages}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, earthMaxPages: Number(e.target.value) }))}
                                        placeholder={t('contents.earthMaxPages')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.earthMaxPages))}
                                    />
                                    {ingestionSettingsErrors.earthMaxPages && <div className="text-xs text-red-600">{ingestionSettingsErrors.earthMaxPages}</div>}
                                    <input
                                        type="number"
                                        value={ingestionSettings.earthMaxArticles}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, earthMaxArticles: Number(e.target.value) }))}
                                        placeholder={t('contents.earthMaxArticles')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.earthMaxArticles))}
                                    />
                                    {ingestionSettingsErrors.earthMaxArticles && <div className="text-xs text-red-600">{ingestionSettingsErrors.earthMaxArticles}</div>}
                                    <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={ingestionSettings.ecoepnEnabled}
                                            onChange={(e) => setIngestionSettings((p) => ({ ...p, ecoepnEnabled: e.target.checked }))}
                                        />
                                        {t('contents.ecoepnEnabled')}
                                    </label>
                                    <input
                                        type="number"
                                        value={ingestionSettings.ecoepnMaxPages}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, ecoepnMaxPages: Number(e.target.value) }))}
                                        placeholder={t('contents.ecoepnMaxPages')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.ecoepnMaxPages))}
                                    />
                                    {ingestionSettingsErrors.ecoepnMaxPages && <div className="text-xs text-red-600">{ingestionSettingsErrors.ecoepnMaxPages}</div>}
                                    <input
                                        type="number"
                                        value={ingestionSettings.ecoepnMaxArticles}
                                        onChange={(e) => setIngestionSettings((p) => ({ ...p, ecoepnMaxArticles: Number(e.target.value) }))}
                                        placeholder={t('contents.ecoepnMaxArticles')}
                                        className={getFieldClassName(Boolean(ingestionSettingsErrors.ecoepnMaxArticles))}
                                    />
                                    {ingestionSettingsErrors.ecoepnMaxArticles && <div className="text-xs text-red-600">{ingestionSettingsErrors.ecoepnMaxArticles}</div>}
                                </div>
                            </div>
                            <button onClick={triggerIngestion} disabled={triggeringIngestion} className="mt-3 px-3 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60">{triggeringIngestion ? t('contents.triggering') : t('contents.triggerIngestion')}</button>
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
