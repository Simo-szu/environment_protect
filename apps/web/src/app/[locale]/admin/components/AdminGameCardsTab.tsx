'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { adminApi } from '@/lib/api';
import { getPublicSystemConfig } from '@/lib/api/system';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import type { AdminGameCardItem } from '@/lib/api/admin';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function buildImageUrl(imageKey: string | undefined, storageBaseUrl: string): string | null {
    const base = storageBaseUrl.trim().replace(/\/+$/, '');
    if (!imageKey || !base) return null;
    return `${base}/${imageKey.replace(/^\/+/, '')}`;
}

type GameCardFormState = {
    cardId: string;
    cardNo: number | string;
    chineseName: string;
    englishName: string;
    cardType: 'core' | 'policy';
    domain: 'industry' | 'ecology' | 'science' | 'society' | 'policy';
    star: number;
    phaseBucket: 'early' | 'mid' | 'late' | 'policy';
    unlockCostIndustry: number | string;
    unlockCostTech: number | string;
    unlockCostPopulation: number | string;
    unlockCostGreen: number | string;
    imageKey: string;
    advancedImageKey: string;
    upgradeDeltaIndustry: number | string;
    upgradeDeltaTech: number | string;
    upgradeDeltaPopulation: number | string;
    upgradeDeltaGreen: number | string;
    upgradeDeltaCarbon: number | string;
    upgradeDeltaSatisfaction: number | string;
    upgradeReqFromStar: number | string;
    upgradeReqToStar: number | string;
    upgradeReqDomain1: 'industry' | 'ecology' | 'science' | 'society' | 'none';
    upgradeReqDomain1MinPct: number | string;
    upgradeReqDomain2: 'industry' | 'ecology' | 'science' | 'society' | 'none';
    upgradeReqDomain2MinPct: number | string;
    upgradeReqCostIndustry: number | string;
    upgradeReqCostTech: number | string;
    upgradeReqCostPopulation: number | string;
    upgradeReqCostGreen: number | string;
    isEnabled: boolean;
};

const defaultGameCardForm: GameCardFormState = {
    cardId: '', cardNo: 1, chineseName: '', englishName: '',
    cardType: 'core', domain: 'industry', star: 1, phaseBucket: 'early',
    unlockCostIndustry: 0, unlockCostTech: 0, unlockCostPopulation: 0, unlockCostGreen: 0,
    upgradeDeltaIndustry: 0, upgradeDeltaTech: 0, upgradeDeltaPopulation: 0, upgradeDeltaGreen: 0, upgradeDeltaCarbon: 0, upgradeDeltaSatisfaction: 0,
    upgradeReqFromStar: 1, upgradeReqToStar: 2, upgradeReqDomain1: 'none', upgradeReqDomain1MinPct: 0,
    upgradeReqDomain2: 'none', upgradeReqDomain2MinPct: 0, upgradeReqCostIndustry: 0, upgradeReqCostTech: 0, upgradeReqCostPopulation: 0, upgradeReqCostGreen: 0,
    imageKey: '', advancedImageKey: '', isEnabled: true,
};

const PAGE_SIZE = 20;

export function AdminGameCardsTab() {
    const { t } = useSafeTranslation('admin');
    const [loading, setLoading] = useState(false);
    const [gameCards, setGameCards] = useState<AdminGameCardItem[]>([]);
    const [storageBaseUrl, setStorageBaseUrl] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const loadPublicConfig = async () => {
            try {
                const config = await getPublicSystemConfig();
                const nextBase = typeof config?.storageBaseUrl === 'string' ? config.storageBaseUrl.trim() : '';
                if (!cancelled && nextBase) {
                    setStorageBaseUrl(nextBase);
                }
            } catch {
                // Leave storage base empty when public config is unavailable.
            }
        };
        void loadPublicConfig();
        return () => {
            cancelled = true;
        };
    }, []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [formState, setFormState] = useState<GameCardFormState>(defaultGameCardForm);
    const [saving, setSaving] = useState(false);
    const [rawMode, setRawMode] = useState(false);
    const [rawJson, setRawJson] = useState('{}');

    // Filters state
    const [keyword, setKeyword] = useState('');
    const [domainFilter, setDomainFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const loadCards = useCallback(async (p: number = page) => {
        try {
            setLoading(true);
            const r = await adminApi.getAdminGameCards({ page: p, size: PAGE_SIZE });
            setGameCards(r.items);
            setTotal(r.total);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadCards(page);
    }, [page]);

    // Reset to page 1 when filter changes (none here, but keeps pattern consistent)
    const handlePageChange = (p: number) => {
        setPage(p);
    };

    const mapToForm = useCallback((c: AdminGameCardItem): GameCardFormState => ({
        cardId: c.cardId, cardNo: c.cardNo, chineseName: c.chineseName, englishName: c.englishName,
        cardType: c.cardType, domain: c.domain, star: c.star, phaseBucket: c.phaseBucket,
        unlockCostIndustry: c.unlockCost?.industry ?? 0, unlockCostTech: c.unlockCost?.tech ?? 0,
        unlockCostPopulation: c.unlockCost?.population ?? 0, unlockCostGreen: c.unlockCost?.green ?? 0,
        upgradeDeltaIndustry: c.upgradeDeltaIndustry ?? 0,
        upgradeDeltaTech: c.upgradeDeltaTech ?? 0,
        upgradeDeltaPopulation: c.upgradeDeltaPopulation ?? 0,
        upgradeDeltaGreen: c.upgradeDeltaGreen ?? 0,
        upgradeDeltaCarbon: c.upgradeDeltaCarbon ?? 0,
        upgradeDeltaSatisfaction: c.upgradeDeltaSatisfaction ?? 0,
        upgradeReqFromStar: c.upgradeRequirement?.fromStar ?? 1,
        upgradeReqToStar: c.upgradeRequirement?.toStar ?? 2,
        upgradeReqDomain1: c.upgradeRequirement?.reqDomain1 ?? 'none',
        upgradeReqDomain1MinPct: c.upgradeRequirement?.reqDomain1MinPct ?? 0,
        upgradeReqDomain2: c.upgradeRequirement?.reqDomain2 ?? 'none',
        upgradeReqDomain2MinPct: c.upgradeRequirement?.reqDomain2MinPct ?? 0,
        upgradeReqCostIndustry: c.upgradeRequirement?.costIndustry ?? 0,
        upgradeReqCostTech: c.upgradeRequirement?.costTech ?? 0,
        upgradeReqCostPopulation: c.upgradeRequirement?.costPopulation ?? 0,
        upgradeReqCostGreen: c.upgradeRequirement?.costGreen ?? 0,
        imageKey: c.imageKey || '', advancedImageKey: c.advancedImageKey || '', isEnabled: true,
    }), []);

    const openCreate = () => {
        setEditingCardId(null);
        setFormState(defaultGameCardForm);
        setRawMode(false);
        setRawJson(JSON.stringify(defaultGameCardForm, null, 2));
        setIsModalOpen(true);
    };

    const startEdit = async (id: string) => {
        try {
            const card = await adminApi.getAdminGameCardById(id);
            setEditingCardId(id);
            setFormState(mapToForm(card));
            setRawJson(JSON.stringify(card, null, 2));
            setRawMode(false);
            setIsModalOpen(true);
        } catch (e) {
            alert(t('gameCards.loadDetailFailed', '获取详情失败'));
        }
    };

    const save = async () => {
        try {
            setSaving(true);
            let payload: any;
            if (rawMode) {
                payload = JSON.parse(rawJson);
                if (payload.unlockCost) {
                    payload.unlockCostIndustry = payload.unlockCost.industry ?? 0;
                    payload.unlockCostTech = payload.unlockCost.tech ?? 0;
                    payload.unlockCostPopulation = payload.unlockCost.population ?? 0;
                    payload.unlockCostGreen = payload.unlockCost.green ?? 0;
                    delete payload.unlockCost;
                }
                if (payload.imageKey !== undefined && typeof payload.imageKey === 'string') {
                    payload.imageKey = payload.imageKey.trim() || undefined;
                }
                if (payload.advancedImageKey !== undefined && typeof payload.advancedImageKey === 'string') {
                    payload.advancedImageKey = payload.advancedImageKey.trim() || undefined;
                }
            } else {
                if (!formState.cardId.trim() || !formState.chineseName.trim() || !formState.englishName.trim()) {
                    alert(t('gameCards.required', '卡牌 ID、中文名称、英文名称为必填项'));
                    return;
                }
                payload = {
                    ...formState,
                    cardNo: Number(formState.cardNo) || 1,
                    unlockCostIndustry: Number(formState.unlockCostIndustry) || 0,
                    unlockCostTech: Number(formState.unlockCostTech) || 0,
                    unlockCostPopulation: Number(formState.unlockCostPopulation) || 0,
                    unlockCostGreen: Number(formState.unlockCostGreen) || 0,
                    upgradeDeltaIndustry: Number(formState.upgradeDeltaIndustry) || 0,
                    upgradeDeltaTech: Number(formState.upgradeDeltaTech) || 0,
                    upgradeDeltaPopulation: Number(formState.upgradeDeltaPopulation) || 0,
                    upgradeDeltaGreen: Number(formState.upgradeDeltaGreen) || 0,
                    upgradeDeltaCarbon: Number(formState.upgradeDeltaCarbon) || 0,
                    upgradeDeltaSatisfaction: Number(formState.upgradeDeltaSatisfaction) || 0,
                    upgradeReqFromStar: Number(formState.upgradeReqFromStar) || 0,
                    upgradeReqToStar: Number(formState.upgradeReqToStar) || 0,
                    upgradeReqDomain1: formState.upgradeReqDomain1 === 'none' ? undefined : formState.upgradeReqDomain1,
                    upgradeReqDomain1MinPct: Number(formState.upgradeReqDomain1MinPct) || 0,
                    upgradeReqDomain2: formState.upgradeReqDomain2 === 'none' ? undefined : formState.upgradeReqDomain2,
                    upgradeReqDomain2MinPct: Number(formState.upgradeReqDomain2MinPct) || 0,
                    upgradeReqCostIndustry: Number(formState.upgradeReqCostIndustry) || 0,
                    upgradeReqCostTech: Number(formState.upgradeReqCostTech) || 0,
                    upgradeReqCostPopulation: Number(formState.upgradeReqCostPopulation) || 0,
                    upgradeReqCostGreen: Number(formState.upgradeReqCostGreen) || 0,
                };
                payload.imageKey = payload.imageKey.trim() || undefined as any;
                payload.advancedImageKey = payload.advancedImageKey.trim() || undefined as any;
            }
            if (editingCardId) {
                delete payload.cardId;
                await adminApi.updateAdminGameCard(editingCardId, payload as any);
            } else {
                await adminApi.createAdminGameCard(payload as any);
            }
            setIsModalOpen(false);
            await loadCards(page);
        } catch (e: any) {
            alert(e?.message || t('gameCards.saveFailed', '保存失败'));
        } finally {
            setSaving(false);
        }
    };

    const deleteCard = async (id: string) => {
        if (!window.confirm(t('gameCards.confirmDelete', '确认删除此卡牌？'))) return;
        try {
            await adminApi.deleteAdminGameCard(id);
            await loadCards(page);
        } catch {
            // ...
        }
    };

    const filteredCards = gameCards.filter(card => {
        const matchesKeyword = !keyword ||
            card.chineseName.toLowerCase().includes(keyword.toLowerCase()) ||
            card.englishName.toLowerCase().includes(keyword.toLowerCase()) ||
            card.cardId.toLowerCase().includes(keyword.toLowerCase());

        const matchesDomain = domainFilter === 'all' || card.domain === domainFilter;
        const matchesType = typeFilter === 'all' || card.cardType === typeFilter;

        return matchesKeyword && matchesDomain && matchesType;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 tracking-tight">{t('tabs.gameCards', '游戏卡牌')}</h2>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder={t('contents.searchPlaceholder', '搜索标题...')}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/20 outline-none transition-all"
                        />
                    </div>

                    {/* Domain Filter */}
                    <Select value={domainFilter} onValueChange={setDomainFilter}>
                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm">
                            <SelectValue>{domainFilter === 'all' ? t('gameCards.allDomains', '全部领域') : t(`gameCards.domain${domainFilter.charAt(0).toUpperCase() + domainFilter.slice(1)}`, domainFilter)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">{t('gameCards.allDomains', '全部领域')}</SelectItem>
                            <SelectItem value="industry">{t('gameCards.domainIndustry', '工业')}</SelectItem>
                            <SelectItem value="ecology">{t('gameCards.domainEcology', '生态')}</SelectItem>
                            <SelectItem value="science">{t('gameCards.domainScience', '科技')}</SelectItem>
                            <SelectItem value="society">{t('gameCards.domainSociety', '社会')}</SelectItem>
                            <SelectItem value="policy">{t('gameCards.domainPolicy', '政策')}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[110px] h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm">
                            <SelectValue>{typeFilter === 'all' ? t('gameCards.allTypes', '全部类型') : t(`gameCards.type${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`, typeFilter)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">{t('gameCards.allTypes', '全部类型')}</SelectItem>
                            <SelectItem value="core">{t('gameCards.typeCore', '核心卡')}</SelectItem>
                            <SelectItem value="policy">{t('gameCards.typePolicy', '政策卡')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <button onClick={openCreate} className="px-5 py-2.5 bg-[#30499B] text-white font-medium rounded-xl shadow-md hover:bg-opacity-90 transition-all">
                        {t('gameCards.create', '+ 新建卡牌')}
                    </button>
                </div>
            </div>

            {loading && gameCards.length === 0 && <div className="py-12 text-center text-slate-500">{t('loading')}</div>}
            {!loading && gameCards.length === 0 && <div className="py-16 text-center text-slate-500">{t('gameCards.empty')}</div>}
            {!loading && gameCards.length > 0 && filteredCards.length === 0 && (
                <div className="py-16 text-center text-slate-500">{t('gameCards.noMatchingCards')}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCards.map((card) => (
                    <div key={card.cardId} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#30499B]/30 dark:hover:border-[#56B949]/40 transition-all p-5 flex flex-col items-center text-center">
                        <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] uppercase font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{t(`gameCards.domain${card.domain.charAt(0).toUpperCase() + card.domain.slice(1)}`, card.domain)}</span>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(card.cardId)} className="p-1.5 bg-slate-100 hover:bg-[#30499B] hover:text-white rounded-lg" title={t('gameCards.edit')}>✏️</button>
                            <button onClick={() => deleteCard(card.cardId)} className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg" title={t('gameCards.delete')}>🗑️</button>
                        </div>

                        <div className="relative mt-6 mb-4">
                            <div className="w-24 h-24 rounded-2xl bg-slate-50 border flex items-center justify-center relative overflow-hidden">
                                {buildImageUrl(card.imageKey, storageBaseUrl) ? (
                                    <Image
                                        src={buildImageUrl(card.imageKey, storageBaseUrl)!}
                                        alt={card.chineseName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span className="text-4xl">{card.cardType === 'policy' ? '📜' : '⚙️'}</span>
                                )}
                            </div>
                            {card.star > 0 && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold ring-1 ring-yellow-200 z-10">{'⭐'.repeat(Math.min(card.star, 3))}</div>}
                        </div>

                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{card.chineseName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{card.englishName}</p>

                        <div className="mt-4 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                            <div className="grid grid-cols-4 gap-1 text-center text-xs text-slate-700 dark:text-slate-300">
                                <div><span className="text-[10px] opacity-70 block">IND</span>{card.unlockCost?.industry || 0}</div>
                                <div><span className="text-[10px] opacity-70 block">TEC</span>{card.unlockCost?.tech || 0}</div>
                                <div><span className="text-[10px] opacity-70 block">POP</span>{card.unlockCost?.population || 0}</div>
                                <div><span className="text-[10px] opacity-70 block">GRN</span>{card.unlockCost?.green || 0}</div>
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
                        className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lsaquo;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border ${p === page ? 'bg-[#30499B] text-white border-[#30499B]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &rsaquo;
                    </button>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 bg-white border-none shadow-2xl">
                    <div className="flex flex-col h-full">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingCardId ? t('gameCards.editCard') : t('gameCards.create')}
                                </DialogTitle>
                                <p className="text-slate-400 text-sm mt-1">{t('gameCards.dialogSubtitle')}</p>
                            </div>
                            <button
                                onClick={() => setRawMode((v) => !v)}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 text-sm transition-colors"
                            >
                                {rawMode ? t('gameCards.formMode', '表单模式') : t('gameCards.jsonMode', 'JSON 模式')}
                            </button>
                        </div>

                        <div className="p-10 space-y-12">
                            {rawMode ? (
                                <section className="space-y-3">
                                    <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wider">{t('gameCards.rawJson', '原始卡牌 JSON')}</h4>
                                    <textarea
                                        spellCheck={false}
                                        value={rawJson}
                                        onChange={(e) => setRawJson(e.target.value)}
                                        className="w-full min-h-[520px] rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs outline-none focus:ring-2 focus:ring-[#30499B]/20"
                                    />
                                </section>
                            ) : (
                                <>
                                    {/* Section 1: Basic Info & Assets */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                            <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wider">{t('gameCards.basicInfo')}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50/40 p-8 rounded-3xl border border-slate-100/50">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700 ml-1">{t('gameCards.cardId')}</Label>
                                                <input value={formState.cardId} onChange={e => setFormState(p => ({ ...p, cardId: e.target.value }))} disabled={!!editingCardId} placeholder="e.g. card_001" className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700 ml-1">{t('gameCards.cardNo')}</Label>
                                                <input type="number" value={formState.cardNo} onChange={e => setFormState(p => ({ ...p, cardNo: e.target.value }))} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700 ml-1">{t('gameCards.chineseName')}</Label>
                                                <input value={formState.chineseName} onChange={e => setFormState(p => ({ ...p, chineseName: e.target.value }))} placeholder={t('gameCards.chineseNamePlaceholder')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700 ml-1">{t('gameCards.englishName')}</Label>
                                                <input value={formState.englishName} onChange={e => setFormState(p => ({ ...p, englishName: e.target.value }))} placeholder={t('gameCards.englishNamePlaceholder')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700 ml-1">{t('gameCards.imageKeyLabel')}</Label>
                                                <input value={formState.imageKey} onChange={e => setFormState(p => ({ ...p, imageKey: e.target.value }))} placeholder="e.g. cards/card001.webp" className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700 ml-1">{t('gameCards.advancedImageKeyLabel')}</Label>
                                                <input value={formState.advancedImageKey} onChange={e => setFormState(p => ({ ...p, advancedImageKey: e.target.value }))} placeholder="e.g. cards/card001_adv.webp" className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-xs" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 2: Game Logic */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                            <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wider">{t('gameCards.gameLogic')}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50/40 p-8 rounded-3xl border border-slate-100/50">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('gameCards.cardType')}</Label>
                                                <Select value={formState.cardType} onValueChange={v => setFormState(p => ({ ...p, cardType: v as any }))}>
                                                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                                                        <SelectValue>{formState.cardType === 'policy' ? `📜 ${t('gameCards.typePolicy', '政策卡')}` : `⚙️ ${t('gameCards.typeCore', '核心卡')}`}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl">
                                                        <SelectItem value="core">⚙️ {t('gameCards.typeCore', '核心卡')}</SelectItem>
                                                        <SelectItem value="policy">📜 {t('gameCards.typePolicy', '政策卡')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('gameCards.domain')}</Label>
                                                <Select value={formState.domain} onValueChange={v => setFormState(p => ({ ...p, domain: v as any }))}>
                                                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                                                        <SelectValue>{t(`gameCards.domain${formState.domain.charAt(0).toUpperCase() + formState.domain.slice(1)}`, formState.domain)}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl">
                                                        <SelectItem value="industry">{t('gameCards.domainIndustry', '工业')}</SelectItem>
                                                        <SelectItem value="ecology">{t('gameCards.domainEcology', '生态')}</SelectItem>
                                                        <SelectItem value="science">{t('gameCards.domainScience', '科技')}</SelectItem>
                                                        <SelectItem value="society">{t('gameCards.domainSociety', '社会')}</SelectItem>
                                                        <SelectItem value="policy">{t('gameCards.domainPolicy', '政策')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('gameCards.phase')}</Label>
                                                <Select value={formState.phaseBucket} onValueChange={v => setFormState(p => ({ ...p, phaseBucket: v as any }))}>
                                                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                                                        <SelectValue>{t(`gameCards.phase${formState.phaseBucket.charAt(0).toUpperCase() + formState.phaseBucket.slice(1)}`, formState.phaseBucket)}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl">
                                                        <SelectItem value="early">{t('gameCards.phaseEarly', '早期')}</SelectItem>
                                                        <SelectItem value="mid">{t('gameCards.phaseMid', '中期')}</SelectItem>
                                                        <SelectItem value="late">{t('gameCards.phaseLate', '后期')}</SelectItem>
                                                        <SelectItem value="policy">{t('gameCards.phasePolicy', '政策')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('gameCards.star')}</Label>
                                                <Select value={formState.star.toString()} onValueChange={v => setFormState(p => ({ ...p, star: Number(v) }))}>
                                                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                                                        <SelectValue>
                                                            {formState.star === 1 ? `⭐ ${t('gameCards.star1', '1星 (早期)')}` : formState.star === 2 ? `⭐⭐ ${t('gameCards.star2', '2星 (中期)')}` : `⭐⭐⭐ ${t('gameCards.star3', '3星 (后期)')}`}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl">
                                                        <SelectItem value="1">⭐ {t('gameCards.star1', '1星 (早期)')}</SelectItem>
                                                        <SelectItem value="2">⭐⭐ {t('gameCards.star2', '2星 (中期)')}</SelectItem>
                                                        <SelectItem value="3">⭐⭐⭐ {t('gameCards.star3', '3星 (后期)')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 3: Unlock Cost */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                            <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wider">{t('gameCards.unlockCost')}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] p-1 bg-blue-100 text-blue-600 rounded-md font-black">IND</span>
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{t('gameCards.costIndustry')}</Label>
                                                </div>
                                                <input type="number" value={formState.unlockCostIndustry} onChange={e => setFormState(p => ({ ...p, unlockCostIndustry: e.target.value }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-blue-500 transition-all outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] p-1 bg-purple-100 text-purple-600 rounded-md font-black">TEC</span>
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{t('gameCards.costTech')}</Label>
                                                </div>
                                                <input type="number" value={formState.unlockCostTech} onChange={e => setFormState(p => ({ ...p, unlockCostTech: e.target.value }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-purple-500 transition-all outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] p-1 bg-amber-100 text-amber-600 rounded-md font-black">POP</span>
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{t('gameCards.costPopulation')}</Label>
                                                </div>
                                                <input type="number" value={formState.unlockCostPopulation} onChange={e => setFormState(p => ({ ...p, unlockCostPopulation: e.target.value }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-amber-500 transition-all outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] p-1 bg-green-100 text-green-600 rounded-md font-black">GRN</span>
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{t('gameCards.costGreen')}</Label>
                                                </div>
                                                <input type="number" value={formState.unlockCostGreen} onChange={e => setFormState(p => ({ ...p, unlockCostGreen: e.target.value }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-green-500 transition-all outline-none" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 4: Upgrade Config */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                                            <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wider">Upgrade Config</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Delta Industry</Label>
                                                <input type="number" value={formState.upgradeDeltaIndustry} onChange={e => setFormState(p => ({ ...p, upgradeDeltaIndustry: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Delta Tech</Label>
                                                <input type="number" value={formState.upgradeDeltaTech} onChange={e => setFormState(p => ({ ...p, upgradeDeltaTech: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Delta Population</Label>
                                                <input type="number" value={formState.upgradeDeltaPopulation} onChange={e => setFormState(p => ({ ...p, upgradeDeltaPopulation: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Delta Green</Label>
                                                <input type="number" value={formState.upgradeDeltaGreen} onChange={e => setFormState(p => ({ ...p, upgradeDeltaGreen: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Delta Carbon</Label>
                                                <input type="number" value={formState.upgradeDeltaCarbon} onChange={e => setFormState(p => ({ ...p, upgradeDeltaCarbon: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Delta Satisfaction</Label>
                                                <input type="number" value={formState.upgradeDeltaSatisfaction} onChange={e => setFormState(p => ({ ...p, upgradeDeltaSatisfaction: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/60 p-8 rounded-3xl border border-slate-200">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">From Star</Label>
                                                <input type="number" value={formState.upgradeReqFromStar} onChange={e => setFormState(p => ({ ...p, upgradeReqFromStar: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">To Star</Label>
                                                <input type="number" value={formState.upgradeReqToStar} onChange={e => setFormState(p => ({ ...p, upgradeReqToStar: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Domain 1</Label>
                                                <Select value={formState.upgradeReqDomain1} onValueChange={v => setFormState(p => ({ ...p, upgradeReqDomain1: v as GameCardFormState['upgradeReqDomain1'] }))}>
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white">
                                                        <SelectValue>{formState.upgradeReqDomain1}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="none">none</SelectItem>
                                                        <SelectItem value="industry">industry</SelectItem>
                                                        <SelectItem value="ecology">ecology</SelectItem>
                                                        <SelectItem value="science">science</SelectItem>
                                                        <SelectItem value="society">society</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Domain 1 Min %</Label>
                                                <input type="number" value={formState.upgradeReqDomain1MinPct} onChange={e => setFormState(p => ({ ...p, upgradeReqDomain1MinPct: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Domain 2</Label>
                                                <Select value={formState.upgradeReqDomain2} onValueChange={v => setFormState(p => ({ ...p, upgradeReqDomain2: v as GameCardFormState['upgradeReqDomain2'] }))}>
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white">
                                                        <SelectValue>{formState.upgradeReqDomain2}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="none">none</SelectItem>
                                                        <SelectItem value="industry">industry</SelectItem>
                                                        <SelectItem value="ecology">ecology</SelectItem>
                                                        <SelectItem value="science">science</SelectItem>
                                                        <SelectItem value="society">society</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Domain 2 Min %</Label>
                                                <input type="number" value={formState.upgradeReqDomain2MinPct} onChange={e => setFormState(p => ({ ...p, upgradeReqDomain2MinPct: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Cost Industry</Label>
                                                <input type="number" value={formState.upgradeReqCostIndustry} onChange={e => setFormState(p => ({ ...p, upgradeReqCostIndustry: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Cost Tech</Label>
                                                <input type="number" value={formState.upgradeReqCostTech} onChange={e => setFormState(p => ({ ...p, upgradeReqCostTech: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Cost Population</Label>
                                                <input type="number" value={formState.upgradeReqCostPopulation} onChange={e => setFormState(p => ({ ...p, upgradeReqCostPopulation: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Req Cost Green</Label>
                                                <input type="number" value={formState.upgradeReqCostGreen} onChange={e => setFormState(p => ({ ...p, upgradeReqCostGreen: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-amber-500" />
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50 transition-all">{t('cancel')}</button>
                            <button onClick={save} disabled={saving} className="px-10 py-3 rounded-2xl bg-[#30499B] text-white font-bold shadow-xl shadow-blue-900/20 hover:bg-opacity-90 transition-all flex items-center gap-2">
                                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : '💾'} {saving ? t('gameCards.saving') : t('save')}
                            </button>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >
        </div >
    );
}
