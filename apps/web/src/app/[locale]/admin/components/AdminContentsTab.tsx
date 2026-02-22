'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import type { AdminContentItem, AdminContentDetail, AdminDailyIngestionSummary, AdminIngestionSettings } from '@/lib/api/admin';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

type ContentFormState = {
    type: number; title: string; summary: string; coverUrl: string;
    body: string; sourceType: number; sourceUrl: string; status: number;
};

const defaultContentForm: ContentFormState = {
    type: 1, title: '', summary: '', coverUrl: '', body: '', sourceType: 2, sourceUrl: '', status: 1,
};

type IngestionSettingsFormState = {
    cron: string; zone: string; enabled: boolean; publishStatus: number;
    requestTimeoutMs: number; requestIntervalMs: number;
    earthEnabled: boolean; earthMaxPages: number; earthMaxArticles: number;
    ecoepnEnabled: boolean; ecoepnMaxPages: number; ecoepnMaxArticles: number;
};

const defaultIngestionSettingsForm: IngestionSettingsFormState = {
    cron: '', zone: '', enabled: true, publishStatus: 1, requestTimeoutMs: 10000, requestIntervalMs: 300,
    earthEnabled: true, earthMaxPages: 2, earthMaxArticles: 30,
    ecoepnEnabled: true, ecoepnMaxPages: 2, ecoepnMaxArticles: 30,
};

export function AdminContentsTab() {
    const { t } = useSafeTranslation('admin');

    const [contents, setContents] = useState<AdminContentItem[]>([]);
    const [contentTotal, setContentTotal] = useState(0);
    const [contentPage, setContentPage] = useState(1);
    const [contentTypeFilter, setContentTypeFilter] = useState<number | undefined>();
    const [contentStatusFilter, setContentStatusFilter] = useState<number | undefined>();
    const [contentKeywordInput, setContentKeywordInput] = useState('');
    const [contentKeyword, setContentKeyword] = useState('');

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [newContent, setNewContent] = useState<ContentFormState>(defaultContentForm);
    const [editingContentId, setEditingContentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<ContentFormState>(defaultContentForm);

    const [ingestionSummary, setIngestionSummary] = useState<AdminDailyIngestionSummary | null>(null);
    const [ingestionSettings, setIngestionSettings] = useState<IngestionSettingsFormState>(defaultIngestionSettingsForm);
    const [loadingContents, setLoadingContents] = useState(false);
    const [triggeringIngestion, setTriggeringIngestion] = useState(false);
    const [loadingIngestionSettings, setLoadingIngestionSettings] = useState(false);
    const [savingIngestionSettings, setSavingIngestionSettings] = useState(false);

    const [creatingContent, setCreatingContent] = useState(false);
    const [updatingContent, setUpdatingContent] = useState(false);

    const contentSize = 20;

    const loadContents = useCallback(async () => {
        try {
            setLoadingContents(true);
            const r = await adminApi.getAdminContents({
                page: contentPage, size: contentSize, type: contentTypeFilter,
                status: contentStatusFilter, keyword: contentKeyword || undefined,
            });
            setContents(r.items);
            setContentTotal(r.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingContents(false);
        }
    }, [contentKeyword, contentPage, contentStatusFilter, contentTypeFilter]);

    const loadIngestionSettings = useCallback(async () => {
        try {
            setLoadingIngestionSettings(true);
            const s = await adminApi.getAdminIngestionSettings();
            setIngestionSettings({
                cron: s.cron, zone: s.zone, enabled: s.enabled, publishStatus: s.publishStatus,
                requestTimeoutMs: s.requestTimeoutMs, requestIntervalMs: s.requestIntervalMs,
                earthEnabled: s.earth.enabled, earthMaxPages: s.earth.maxPages, earthMaxArticles: s.earth.maxArticles,
                ecoepnEnabled: s.ecoepn.enabled, ecoepnMaxPages: s.ecoepn.maxPages, ecoepnMaxArticles: s.ecoepn.maxArticles,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingIngestionSettings(false);
        }
    }, []);

    useEffect(() => {
        loadContents();
        loadIngestionSettings();
    }, [loadContents, loadIngestionSettings]);

    const saveSettings = async () => {
        try {
            setSavingIngestionSettings(true);
            const updated = await adminApi.updateAdminIngestionSettings({
                cron: ingestionSettings.cron, zone: ingestionSettings.zone, enabled: ingestionSettings.enabled,
                publishStatus: ingestionSettings.publishStatus, requestTimeoutMs: ingestionSettings.requestTimeoutMs,
                requestIntervalMs: ingestionSettings.requestIntervalMs,
                earth: { enabled: ingestionSettings.earthEnabled, maxPages: ingestionSettings.earthMaxPages, maxArticles: ingestionSettings.earthMaxArticles },
                ecoepn: { enabled: ingestionSettings.ecoepnEnabled, maxPages: ingestionSettings.ecoepnMaxPages, maxArticles: ingestionSettings.ecoepnMaxArticles },
            });
            alert(t('contents.ingestionSettingsSaved'));
        } catch (error) {
            alert(t('contents.ingestionSettingsSaveFailed'));
        } finally {
            setSavingIngestionSettings(false);
        }
    };

    const startEdit = async (id: string) => {
        try {
            const d = await adminApi.getAdminContentById(id);
            setEditingContentId(id);
            setEditContent({ type: d.type, title: d.title || '', summary: d.summary || '', coverUrl: d.coverUrl || '', body: d.body || '', sourceType: d.sourceType || 2, sourceUrl: d.sourceUrl || '', status: d.status });
            setIsEditorOpen(true);
        } catch (e) {
            alert(t('contents.loadDetailFailed'));
        }
    };

    const createContentRecord = async () => {
        if (!newContent.title.trim() || !newContent.body.trim()) return alert(t('contents.titleAndBodyRequired'));
        try {
            setCreatingContent(true);
            await adminApi.createAdminContent({
                ...newContent,
                summary: newContent.summary || undefined,
                coverUrl: newContent.coverUrl || undefined,
                sourceUrl: newContent.sourceUrl || undefined
            });
            setNewContent(defaultContentForm);
            setIsEditorOpen(false);
            setContentPage(1);
            await loadContents();
        } catch {
            alert(t('contents.createFailed'));
        } finally {
            setCreatingContent(false);
        }
    };

    const saveEditContentRecord = async () => {
        if (!editingContentId) return;
        try {
            setUpdatingContent(true);
            await adminApi.updateAdminContent(editingContentId, editContent as any);
            setEditingContentId(null);
            setIsEditorOpen(false);
            await loadContents();
        } catch {
            alert(t('contents.updateFailed'));
        } finally {
            setUpdatingContent(false);
        }
    };

    const deleteContent = async (id: string) => {
        if (!window.confirm(t('contents.confirmDelete'))) return;
        try {
            await adminApi.deleteAdminContent(id);
            await loadContents();
        } catch {
            alert(t('contents.deleteFailed'));
        }
    };

    const triggerIngestion = async () => {
        try {
            setTriggeringIngestion(true);
            const s = await adminApi.triggerAdminIngestion();
            setIngestionSummary(s);
            await loadContents();
        } catch {
            alert(t('contents.ingestionFailed'));
        } finally {
            setTriggeringIngestion(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 扁平化数据采集控制面板 */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl shadow-inner">⚡</div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">{t('contents.ingestionControl')}</h3>
                            <p className="text-slate-400 text-sm mt-0.5">{t('contents.ingestionControlHelp')}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button onClick={triggerIngestion} disabled={triggeringIngestion} className="flex-1 md:flex-none justify-center px-6 py-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold transition-all flex items-center gap-2 border border-slate-200">
                            {triggeringIngestion ? '⏳' : '✨'} {triggeringIngestion ? t('contents.triggering') : t('contents.triggerIngestion')}
                        </button>
                        <button onClick={saveSettings} disabled={savingIngestionSettings} className="flex-1 md:flex-none justify-center px-6 py-3 bg-[#30499B] text-white hover:bg-opacity-90 rounded-2xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
                            <span>💾</span> {t('contents.saveIngestionSettings')}
                        </button>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* 1. 自动调度配置 - 扁平化设计 */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            <h4 className="font-bold text-slate-800 text-lg">{t('contents.scheduleConfig')}</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/50">
                                <div className="max-w-md">
                                    <Label className="text-base font-bold text-slate-800">{t('contents.ingestionCron')}</Label>
                                    <p className="text-xs text-slate-400 mt-1">{t('contents.ingestionCronHelp')}</p>
                                </div>
                                <div className="flex flex-col items-end gap-3 min-w-[320px]">
                                    <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-center text-blue-600 font-bold" value={ingestionSettings.cron} onChange={e => setIngestionSettings(p => ({ ...p, cron: e.target.value }))} />
                                    <div className="flex gap-2">
                                        {[
                                            { label: t('contents.cronDaily'), val: '0 0 3 * * ?' },
                                            { label: t('contents.cron12h'), val: '0 0 0/12 * * ?' },
                                            { label: t('contents.cronHourly'), val: '0 0 0/1 * * ?' },
                                        ].map(p => (
                                            <button key={p.val} onClick={() => setIngestionSettings(p2 => ({ ...p2, cron: p.val }))} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all">
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="max-w-md">
                                    <Label className="text-base font-bold text-slate-800">{t('contents.ingestionEnabled')}</Label>
                                    <p className="text-xs text-slate-400 mt-1">{t('contents.ingestionEnabledHelp')}</p>
                                </div>
                                <Switch checked={ingestionSettings.enabled} onCheckedChange={v => setIngestionSettings(p => ({ ...p, enabled: v }))} />
                            </div>
                        </div>
                    </section>

                    {/* 2. 全局采集配置 - 扁平化设计 */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            <h4 className="font-bold text-slate-800 text-lg">{t('contents.globalConfig')}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700">{t('contents.publishStatus')}</Label>
                                <Select value={ingestionSettings.publishStatus.toString()} onValueChange={v => setIngestionSettings(p => ({ ...p, publishStatus: Number(v) }))}>
                                    <SelectTrigger className="w-full h-12 rounded-2xl border-slate-200 shadow-none">
                                        <SelectValue>
                                            {ingestionSettings.publishStatus === 1 ? t('contents.draft') : t('contents.published')}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="1">{t('contents.draft')}</SelectItem>
                                        <SelectItem value="2">{t('contents.published')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-400 px-1">{t('contents.publishStatusHelp')}</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700">{t('contents.requestTimeoutMs')}</Label>
                                <div className="relative">
                                    <input className="w-full h-12 px-5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-mono" type="number" value={ingestionSettings.requestTimeoutMs} onChange={e => setIngestionSettings(p => ({ ...p, requestTimeoutMs: Number(e.target.value) }))} />
                                    <span className="absolute right-5 top-3.5 text-[10px] font-bold text-slate-300 uppercase">ms</span>
                                </div>
                                <p className="text-[10px] text-slate-400 px-1">{t('contents.requestTimeoutMsHelp')}</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700">{t('contents.requestIntervalMs')}</Label>
                                <div className="relative">
                                    <input className="w-full h-12 px-5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-mono" type="number" value={ingestionSettings.requestIntervalMs} onChange={e => setIngestionSettings(p => ({ ...p, requestIntervalMs: Number(e.target.value) }))} />
                                    <span className="absolute right-5 top-3.5 text-[10px] font-bold text-slate-300 uppercase">ms</span>
                                </div>
                                <p className="text-[10px] text-slate-400 px-1">{t('contents.requestIntervalMsHelp')}</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. 数据源过滤 - 极简扁平化 */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                            <h4 className="font-bold text-slate-800 text-lg">{t('contents.sourceConfig')}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { id: 'earth', name: 'Earth Data', enabled: ingestionSettings.earthEnabled, maxP: ingestionSettings.earthMaxPages, maxA: ingestionSettings.earthMaxArticles },
                                { id: 'ecoepn', name: 'EcoEPN Data', enabled: ingestionSettings.ecoepnEnabled, maxP: ingestionSettings.ecoepnMaxPages, maxA: ingestionSettings.ecoepnMaxArticles },
                            ].map(src => (
                                <div key={src.id} className={`p-8 rounded-[2rem] border transition-all duration-300 ${src.enabled ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-50 border-transparent opacity-60 grayscale'}`}>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${src.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                            <span className="font-black text-slate-900 tracking-tight">{src.name}</span>
                                        </div>
                                        <Switch checked={src.enabled} onCheckedChange={v => setIngestionSettings(p => ({ ...p, [`${src.id}Enabled`]: v }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('contents.pageLimit')}</p>
                                            <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" type="number" value={src.maxP} onChange={e => setIngestionSettings(p => ({ ...p, [`${src.id}MaxPages`]: Number(e.target.value) }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('contents.totalLimit')}</p>
                                            <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" type="number" value={src.maxA} onChange={e => setIngestionSettings(p => ({ ...p, [`${src.id}MaxArticles`]: Number(e.target.value) }))} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Content List & Filters */}
            <div className="relative z-30 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Select className="w-[140px]" value={contentTypeFilter?.toString() ?? ''} onValueChange={v => setContentTypeFilter(v ? Number(v) : undefined)}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder={t('contents.allTypes')}>
                                    {contentTypeFilter === 1 ? t('contents.news') : contentTypeFilter === 2 ? t('contents.policy') : contentTypeFilter === 3 ? t('contents.encyclopedia') : null}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">{t('contents.allTypes')}</SelectItem>
                                <SelectItem value="1">{t('contents.news')}</SelectItem>
                                <SelectItem value="2">{t('contents.policy')}</SelectItem>
                                <SelectItem value="3">{t('contents.encyclopedia')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select className="w-[140px]" value={contentStatusFilter?.toString() ?? ''} onValueChange={v => setContentStatusFilter(v ? Number(v) : undefined)}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder={t('contents.allStatus')}>
                                    {contentStatusFilter === 1 ? t('contents.draft') : contentStatusFilter === 2 ? t('contents.published') : null}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">{t('contents.allStatus')}</SelectItem>
                                <SelectItem value="1">{t('contents.draft')}</SelectItem>
                                <SelectItem value="2">{t('contents.published')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex">
                            <input className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-l-xl text-sm border-r-0" placeholder={t('contents.searchPlaceholder')} value={contentKeywordInput} onChange={e => setContentKeywordInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setContentPage(1); setContentKeyword(contentKeywordInput); } }} />
                            <button className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-r-xl text-sm hover:bg-slate-200 font-medium" onClick={() => { setContentPage(1); setContentKeyword(contentKeywordInput); }}>{t('contents.filter')}</button>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-[#30499B] text-white hover:bg-[#25397a] rounded-xl font-medium" onClick={() => { setEditingContentId(null); setNewContent(defaultContentForm); setIsEditorOpen(true); }}>
                        + {t('contents.createContent')}
                    </button>
                </div>

                <div className="space-y-4">
                    {loadingContents ? <div className="py-8 text-center text-slate-500">{t('contents.loadingContents')}</div> : null}
                    {!loadingContents && contents.map(item => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 bg-blue-100 text-blue-700 rounded select-none">{item.type === 1 ? t('contents.news') : item.type === 2 ? t('contents.policy') : t('contents.encyclopedia')}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded select-none ${item.status === 2 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.status === 2 ? t('contents.published') : t('contents.draft')}</span>
                                    <span className="text-xs text-slate-400 ml-2">{item.publishedAt || t('contents.notPublished')}</span>
                                </div>
                                <h4 className="font-semibold text-slate-800 text-base">{item.title}</h4>
                                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{item.summary}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {item.status !== 2 && <button onClick={async () => { await adminApi.publishAdminContent(item.id); loadContents(); }} className="px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg">{t('contents.publish')}</button>}
                                <button onClick={() => startEdit(item.id)} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg">{t('contents.edit')}</button>
                                <button onClick={() => deleteContent(item.id)} className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">{t('contents.delete')}</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-between items-center text-sm text-slate-500 font-medium">
                    <span>{t('contents.totalRecords', undefined, { total: contentTotal })}</span>
                    <div className="flex gap-2">
                        <button disabled={contentPage <= 1} onClick={() => setContentPage(p => p - 1)} className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-50">{t('contents.prev')}</button>
                        <span className="px-3 py-1">{contentPage}</span>
                        <button onClick={() => setContentPage(p => p + 1)} className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-50">{t('contents.next')}</button>
                    </div>
                </div>
            </div>

            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-3xl">
                    <div className="px-6 py-4 border-b">
                        <DialogTitle className="text-xl font-bold">{editingContentId ? t('contents.editContent') : t('contents.createContent')}</DialogTitle>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="space-y-1"><div className="text-sm font-medium">{t('contents.type')}</div>
                                <Select
                                    value={(editingContentId ? editContent.type : newContent.type).toString()}
                                    onValueChange={v => { const val = Number(v); editingContentId ? setEditContent(p => ({ ...p, type: val })) : setNewContent(p => ({ ...p, type: val })) }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('contents.type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">{t('contents.news')}</SelectItem>
                                        <SelectItem value="2">{t('contents.policy')}</SelectItem>
                                        <SelectItem value="3">{t('contents.encyclopedia')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                            <label className="space-y-1"><div className="text-sm font-medium">{t('contents.status')}</div>
                                <Select
                                    value={(editingContentId ? editContent.status : newContent.status).toString()}
                                    onValueChange={v => { const val = Number(v); editingContentId ? setEditContent(p => ({ ...p, status: val })) : setNewContent(p => ({ ...p, status: val })) }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('contents.status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">{t('contents.draft')}</SelectItem>
                                        <SelectItem value="2">{t('contents.published')}</SelectItem>
                                        <SelectItem value="3">{t('contents.archived')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                        </div>
                        <label className="space-y-1 block"><div className="text-sm font-medium">{t('contents.fieldTitle')}</div>
                            <input value={editingContentId ? editContent.title : newContent.title} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, title: v })) : setNewContent(p => ({ ...p, title: v })) }} className="w-full px-3 py-2 border rounded-xl" />
                        </label>
                        <label className="space-y-1 block"><div className="text-sm font-medium">{t('contents.fieldCoverUrl')}</div>
                            <input value={editingContentId ? editContent.coverUrl : newContent.coverUrl} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, coverUrl: v })) : setNewContent(p => ({ ...p, coverUrl: v })) }} className="w-full px-3 py-2 border rounded-xl" />
                        </label>
                        <label className="space-y-1 block"><div className="text-sm font-medium">{t('contents.fieldSummary')}</div>
                            <textarea value={editingContentId ? editContent.summary : newContent.summary} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, summary: v })) : setNewContent(p => ({ ...p, summary: v })) }} className="w-full px-3 py-2 border rounded-xl h-20" />
                        </label>
                        <label className="space-y-1 block"><div className="text-sm font-medium">{t('contents.fieldBody')}</div>
                            <textarea value={editingContentId ? editContent.body : newContent.body} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, body: v })) : setNewContent(p => ({ ...p, body: v })) }} className="w-full px-3 py-2 border rounded-xl h-48 custom-scrollbar" />
                        </label>
                    </div>

                    <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                        <button onClick={() => setIsEditorOpen(false)} className="px-5 py-2.5 rounded-xl border font-medium">{t('cancel')}</button>
                        <button onClick={editingContentId ? saveEditContentRecord : createContentRecord} disabled={creatingContent || updatingContent} className="px-5 py-2.5 rounded-xl bg-[#30499B] text-white font-medium">{editingContentId ? t('contents.saveChanges') : t('contents.createContent')}</button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
