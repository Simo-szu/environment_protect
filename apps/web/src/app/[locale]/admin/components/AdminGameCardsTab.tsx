'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { adminApi } from '@/lib/api';
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

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? '';

function buildImageUrl(imageKey: string | undefined): string | null {
    if (!imageKey || !STORAGE_BASE_URL) return null;
    return `${STORAGE_BASE_URL.replace(/\/$/, '')}/${imageKey}`;
}

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

const defaultGameCardForm: GameCardFormState = {
    cardId: '', cardNo: 1, chineseName: '', englishName: '',
    cardType: 'core', domain: 'industry', star: 1, phaseBucket: 'early',
    unlockCostIndustry: 0, unlockCostTech: 0, unlockCostPopulation: 0, unlockCostGreen: 0,
    imageKey: '', advancedImageKey: '', isEnabled: true,
};

const PAGE_SIZE = 20;

export function AdminGameCardsTab() {
    const { t } = useSafeTranslation('admin');
    const [loading, setLoading] = useState(false);
    const [gameCards, setGameCards] = useState<AdminGameCardItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
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
                    alert('ID和名称必填');
                    return;
                }
                payload = { ...formState };
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
            alert(e?.message || '保存失败');
        } finally {
            setSaving(false);
        }
    };

    const deleteCard = async (id: string) => {
        if (!window.confirm('确认删除?')) return;
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
                <h2 className="text-xl font-medium text-slate-800 tracking-tight">{t('tabs.gameCards', 'Game Cards')}</h2>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder={t('contents.searchPlaceholder', '搜索标题...')}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#30499B]/10 outline-none transition-all"
                        />
                    </div>

                    {/* Domain Filter */}
                    <Select value={domainFilter} onValueChange={setDomainFilter}>
                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200 bg-white text-sm">
                            <SelectValue>{domainFilter === 'all' ? t('gameCards.allDomains') : domainFilter.charAt(0).toUpperCase() + domainFilter.slice(1)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">{t('gameCards.allDomains')}</SelectItem>
                            <SelectItem value="industry">Industry</SelectItem>
                            <SelectItem value="ecology">Ecology</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="society">Society</SelectItem>
                            <SelectItem value="policy">Policy</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[110px] h-10 rounded-xl border-slate-200 bg-white text-sm">
                            <SelectValue>{typeFilter === 'all' ? t('gameCards.allTypes') : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">{t('gameCards.allTypes')}</SelectItem>
                            <SelectItem value="core">Core</SelectItem>
                            <SelectItem value="policy">Policy</SelectItem>
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
                    <div key={card.cardId} className="group relative bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#30499B]/30 transition-all p-5 flex flex-col items-center text-center">
                        <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] uppercase font-bold rounded-full bg-slate-100 text-slate-600">{card.domain}</span>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(card.cardId)} className="p-1.5 bg-slate-100 hover:bg-[#30499B] hover:text-white rounded-lg" title={t('gameCards.edit')}>✏️</button>
                            <button onClick={() => deleteCard(card.cardId)} className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg" title={t('gameCards.delete')}>🗑️</button>
                        </div>

                        <div className="relative mt-6 mb-4">
                            <div className="w-24 h-24 rounded-2xl bg-slate-50 border flex items-center justify-center relative overflow-hidden">
                                {buildImageUrl(card.imageKey) ? (
                                    <Image
                                        src={buildImageUrl(card.imageKey)!}
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

                        <h3 className="font-bold text-lg text-slate-800">{card.chineseName}</h3>
                        <p className="text-xs text-slate-500 uppercase">{card.englishName}</p>

                        <div className="mt-4 w-full bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="grid grid-cols-4 gap-1 text-center text-xs">
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
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm"
                            >
                                {rawMode ? 'Form Mode' : 'JSON Mode'}
                            </button>
                        </div>

                        <div className="p-10 space-y-12">
                            {rawMode ? (
                                <section className="space-y-3">
                                    <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wider">Raw Card JSON</h4>
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
                                        <input type="number" value={formState.cardNo} onChange={e => setFormState(p => ({ ...p, cardNo: Number(e.target.value) || 1 }))} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm" />
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
                                                <SelectValue>{formState.cardType === 'policy' ? '📜 Policy' : '⚙️ Core'}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="core">⚙️ Core</SelectItem>
                                                <SelectItem value="policy">📜 Policy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('gameCards.domain')}</Label>
                                        <Select value={formState.domain} onValueChange={v => setFormState(p => ({ ...p, domain: v as any }))}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                                                <SelectValue>{formState.domain.charAt(0).toUpperCase() + formState.domain.slice(1)}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="industry">Industry</SelectItem>
                                                <SelectItem value="ecology">Ecology</SelectItem>
                                                <SelectItem value="science">Science</SelectItem>
                                                <SelectItem value="society">Society</SelectItem>
                                                <SelectItem value="policy">Policy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('gameCards.phase')}</Label>
                                        <Select value={formState.phaseBucket} onValueChange={v => setFormState(p => ({ ...p, phaseBucket: v as any }))}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                                                <SelectValue>{formState.phaseBucket.charAt(0).toUpperCase() + formState.phaseBucket.slice(1)}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="early">Early</SelectItem>
                                                <SelectItem value="mid">Mid</SelectItem>
                                                <SelectItem value="late">Late</SelectItem>
                                                <SelectItem value="policy">Policy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('gameCards.star')}</Label>
                                        <div className="relative">
                                            <input type="number" value={formState.star} onChange={e => setFormState(p => ({ ...p, star: Number(e.target.value) || 1 }))} className="w-full h-12 px-5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-center" />
                                            <span className="absolute right-4 top-3 text-lg">⭐</span>
                                        </div>
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
                                        <input type="number" value={formState.unlockCostIndustry} onChange={e => setFormState(p => ({ ...p, unlockCostIndustry: Number(e.target.value) || 0 }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-blue-500 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[10px] p-1 bg-purple-100 text-purple-600 rounded-md font-black">TEC</span>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{t('gameCards.costTech')}</Label>
                                        </div>
                                        <input type="number" value={formState.unlockCostTech} onChange={e => setFormState(p => ({ ...p, unlockCostTech: Number(e.target.value) || 0 }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-purple-500 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[10px] p-1 bg-amber-100 text-amber-600 rounded-md font-black">POP</span>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{t('gameCards.costPopulation')}</Label>
                                        </div>
                                        <input type="number" value={formState.unlockCostPopulation} onChange={e => setFormState(p => ({ ...p, unlockCostPopulation: Number(e.target.value) || 0 }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-amber-500 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[10px] p-1 bg-green-100 text-green-600 rounded-md font-black">GRN</span>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{t('gameCards.costGreen')}</Label>
                                        </div>
                                        <input type="number" value={formState.unlockCostGreen} onChange={e => setFormState(p => ({ ...p, unlockCostGreen: Number(e.target.value) || 0 }))} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-center font-black text-xl text-slate-700 focus:bg-white focus:border-green-500 transition-all outline-none" />
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
                </DialogContent>
            </Dialog>
        </div>
    );
}
