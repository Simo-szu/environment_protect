'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import type { AdminContentItem, AdminContentDetail, AdminDailyIngestionSummary, AdminIngestionSettings } from '@/lib/api/admin';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
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
    type: 1, title: '', summary: '', coverUrl: '', body: '', sourceType: 2, sourceUrl: '', status: 2,
};

type IngestionSettingsFormState = {
    cron: string; zone: string; enabled: boolean; publishStatus: number;
    requestTimeoutMs: number | string; requestIntervalMs: number | string;
    earthEnabled: boolean; earthMaxPages: number | string; earthMaxArticles: number | string;
    ecoepnEnabled: boolean; ecoepnMaxPages: number | string; ecoepnMaxArticles: number | string;
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
                publishStatus: ingestionSettings.publishStatus,
                requestTimeoutMs: Number(ingestionSettings.requestTimeoutMs) || 0,
                requestIntervalMs: Number(ingestionSettings.requestIntervalMs) || 0,
                earth: { enabled: ingestionSettings.earthEnabled, maxPages: Number(ingestionSettings.earthMaxPages) || 0, maxArticles: Number(ingestionSettings.earthMaxArticles) || 0 },
                ecoepn: { enabled: ingestionSettings.ecoepnEnabled, maxPages: Number(ingestionSettings.ecoepnMaxPages) || 0, maxArticles: Number(ingestionSettings.ecoepnMaxArticles) || 0 },
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
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 md:p-10 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl shadow-inner border border-blue-100 dark:border-blue-800/50">
                            <Search className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-2xl tracking-tight">{t('contents.ingestionControl')}</h3>
                            <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm mt-0.5">{t('contents.ingestionControlHelp')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:flex md:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button onClick={triggerIngestion} disabled={triggeringIngestion} className="justify-center px-4 md:px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-2xl font-bold transition-all text-sm border border-slate-200/50 dark:border-slate-600">
                            {triggeringIngestion ? t('contents.triggering') : t('contents.triggerIngestion')}
                        </button>
                        <button onClick={saveSettings} disabled={savingIngestionSettings} className="justify-center px-4 md:px-6 py-3 bg-[#30499B] dark:bg-[#56B949] text-white hover:bg-opacity-90 rounded-2xl font-bold shadow-lg shadow-blue-900/10 dark:shadow-green-900/10 transition-all text-sm">
                            {t('contents.saveIngestionSettings')}
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

                        <div className="grid grid-cols-1 gap-6 bg-slate-50/50 dark:bg-slate-900/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/50">
                                <div className="max-w-md">
                                    <Label className="text-base font-bold text-slate-800 dark:text-slate-200">{t('contents.ingestionCron')}</Label>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('contents.ingestionCronHelp')}</p>
                                </div>
                                <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[320px]">
                                    <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#30499B] dark:text-[#56B949] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 outline-none transition-all font-mono text-center font-bold" value={ingestionSettings.cron} onChange={e => setIngestionSettings(p => ({ ...p, cron: e.target.value }))} />
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: t('contents.cronDaily'), val: '0 0 3 * * ?' },
                                            { label: t('contents.cron12h'), val: '0 0 0/12 * * ?' },
                                            { label: t('contents.cronHourly'), val: '0 0 0/1 * * ?' },
                                        ].map(p => (
                                            <button key={p.val} onClick={() => setIngestionSettings(p2 => ({ ...p2, cron: p.val }))} className="px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-[#30499B] dark:hover:border-[#56B949] hover:text-[#30499B] dark:hover:text-[#56B949] transition-all whitespace-nowrap overflow-hidden text-ellipsis">
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="max-w-md">
                                    <Label className="text-base font-bold text-slate-800 dark:text-slate-200">{t('contents.ingestionEnabled')}</Label>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('contents.ingestionEnabledHelp')}</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 rounded-[2rem] shadow-sm">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('contents.publishStatus')}</Label>
                                <Select value={ingestionSettings.publishStatus.toString()} onValueChange={v => setIngestionSettings(p => ({ ...p, publishStatus: Number(v) }))}>
                                    <SelectTrigger className="w-full h-12 rounded-2xl border-slate-200 shadow-none">
                                        <SelectValue>
                                            {ingestionSettings.publishStatus === 1 ? t('contents.published') : t('contents.draft')}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="1">{t('contents.published')}</SelectItem>
                                        <SelectItem value="2">{t('contents.draft')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-400 px-1">{t('contents.publishStatusHelp')}</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('contents.requestTimeoutMs')}</Label>
                                <div className="relative">
                                    <input className="w-full h-12 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono" type="number" value={ingestionSettings.requestTimeoutMs} onChange={e => setIngestionSettings(p => ({ ...p, requestTimeoutMs: e.target.value }))} />
                                    <span className="absolute right-5 top-3.5 text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase">ms</span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 px-1">{t('contents.requestTimeoutMsHelp')}</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('contents.requestIntervalMs')}</Label>
                                <div className="relative">
                                    <input className="w-full h-12 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono" type="number" value={ingestionSettings.requestIntervalMs} onChange={e => setIngestionSettings(p => ({ ...p, requestIntervalMs: e.target.value }))} />
                                    <span className="absolute right-5 top-3.5 text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase">ms</span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 px-1">{t('contents.requestIntervalMsHelp')}</p>
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
                                <div key={src.id} className={`p-8 rounded-[2rem] border transition-all duration-300 ${src.enabled ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md' : 'bg-slate-50 dark:bg-slate-900/30 border-transparent opacity-60 grayscale'}`}>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${src.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                            <span className="font-black text-slate-900 dark:text-slate-100 tracking-tight">{src.name}</span>
                                        </div>
                                        <Switch checked={src.enabled} onCheckedChange={v => setIngestionSettings(p => ({ ...p, [`${src.id}Enabled`]: v }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('contents.pageLimit')}</p>
                                            <input className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-center font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all" type="number" value={src.maxP} onChange={e => setIngestionSettings(p => ({ ...p, [`${src.id}MaxPages`]: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('contents.totalLimit')}</p>
                                            <input className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-center font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all" type="number" value={src.maxA} onChange={e => setIngestionSettings(p => ({ ...p, [`${src.id}MaxArticles`]: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Content List & Filters */}
            <div className="relative z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
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
                                    {contentStatusFilter === 1 ? t('contents.published') : contentStatusFilter === 2 ? t('contents.draft') : null}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">{t('contents.allStatus')}</SelectItem>
                                <SelectItem value="1">{t('contents.published')}</SelectItem>
                                <SelectItem value="2">{t('contents.draft')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex">
                            <input className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-l-xl text-sm border-r-0" placeholder={t('contents.searchPlaceholder')} value={contentKeywordInput} onChange={e => setContentKeywordInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setContentPage(1); setContentKeyword(contentKeywordInput); } }} />
                            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-r-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 font-medium" onClick={() => { setContentPage(1); setContentKeyword(contentKeywordInput); }}>{t('contents.filter')}</button>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-[#30499B] text-white hover:bg-[#25397a] rounded-xl font-medium" onClick={() => { setEditingContentId(null); setNewContent(defaultContentForm); setIsEditorOpen(true); }}>
                        + {t('contents.createContent')}
                    </button>
                </div>

                <div className="space-y-4">
                    {loadingContents ? <div className="py-8 text-center text-slate-500">{t('contents.loadingContents')}</div> : null}
                    {!loadingContents && contents.map(item => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-900/30 p-4 border border-slate-100 dark:border-slate-700/60 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded select-none">{item.type === 1 ? t('contents.news') : item.type === 2 ? t('contents.policy') : t('contents.encyclopedia')}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded select-none ${item.status === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>{item.status === 1 ? t('contents.published') : t('contents.draft')}</span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{item.publishedAt || t('contents.notPublished')}</span>
                                </div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base">{item.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{item.summary}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {item.status !== 1 && <button onClick={async () => { await adminApi.publishAdminContent(item.id); loadContents(); }} className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 rounded-lg transition-colors">{t('contents.publish')}</button>}
                                <button onClick={() => startEdit(item.id)} className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">{t('contents.edit')}</button>
                                <button onClick={() => deleteContent(item.id)} className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition-colors">{t('contents.delete')}</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span>{t('contents.totalRecords', undefined, { total: contentTotal })}</span>
                    <div className="flex gap-2">
                        <button disabled={contentPage <= 1} onClick={() => setContentPage(p => p - 1)} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300">{t('contents.prev')}</button>
                        <span className="px-3 py-1 text-slate-600 dark:text-slate-300">{contentPage}</span>
                        <button onClick={() => setContentPage(p => p + 1)} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300">{t('contents.next')}</button>
                    </div>
                </div>
            </div>

            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-3xl">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">{editingContentId ? t('contents.editContent') : t('contents.createContent')}</DialogTitle>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="space-y-1"><div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contents.type')}</div>
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
                            <label className="space-y-1"><div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contents.status')}</div>
                                <Select
                                    value={(editingContentId ? editContent.status : newContent.status).toString()}
                                    onValueChange={v => { const val = Number(v); editingContentId ? setEditContent(p => ({ ...p, status: val })) : setNewContent(p => ({ ...p, status: val })) }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('contents.status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">{t('contents.published')}</SelectItem>
                                        <SelectItem value="2">{t('contents.draft')}</SelectItem>
                                        <SelectItem value="3">{t('contents.archived')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                        </div>
                        <label className="space-y-1 block"><div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contents.fieldTitle')}</div>
                            <input value={editingContentId ? editContent.title : newContent.title} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, title: v })) : setNewContent(p => ({ ...p, title: v })) }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20" />
                        </label>
                        <label className="space-y-1 block"><div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contents.fieldCoverUrl')}</div>
                            <input value={editingContentId ? editContent.coverUrl : newContent.coverUrl} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, coverUrl: v })) : setNewContent(p => ({ ...p, coverUrl: v })) }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20" />
                        </label>
                        <label className="space-y-1 block"><div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contents.fieldSummary')}</div>
                            <textarea value={editingContentId ? editContent.summary : newContent.summary} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, summary: v })) : setNewContent(p => ({ ...p, summary: v })) }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl h-20 outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20" />
                        </label>
                        <label className="space-y-1 block"><div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contents.fieldBody')}</div>
                            <textarea value={editingContentId ? editContent.body : newContent.body} onChange={e => { const v = e.target.value; editingContentId ? setEditContent(p => ({ ...p, body: v })) : setNewContent(p => ({ ...p, body: v })) }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl h-48 outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 custom-scrollbar" />
                        </label>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                        <button onClick={() => setIsEditorOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{t('cancel')}</button>
                        <button onClick={editingContentId ? saveEditContentRecord : createContentRecord} disabled={creatingContent || updatingContent} className="px-5 py-2.5 rounded-xl bg-[#30499B] dark:bg-[#56B949] text-white font-medium hover:opacity-90 transition-opacity">{editingContentId ? t('contents.saveChanges') : t('contents.createContent')}</button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
