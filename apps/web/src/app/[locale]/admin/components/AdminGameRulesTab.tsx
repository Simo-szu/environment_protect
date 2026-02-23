'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { AdminGameRulesConfig, AdminUpdateGameRulesRequest } from '@/lib/api/admin';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

type RuleSectionKey =
    | 'runtimeParam'
    | 'balanceRule'
    | 'eventRules'
    | 'comboRules'
    | 'policyUnlockRules'
    | 'coreSpecialConditions'
    | 'cardTags'
    | 'endingContents';

const SECTION_LABELS: Record<RuleSectionKey, string> = {
    runtimeParam: 'Runtime Param',
    balanceRule: 'Balance Rule',
    eventRules: 'Event Rules',
    comboRules: 'Combo Rules',
    policyUnlockRules: 'Policy Unlock Rules',
    coreSpecialConditions: 'Core Special Conditions',
    cardTags: 'Card Tags',
    endingContents: 'Ending Contents',
};

export function AdminGameRulesTab() {
    const { t } = useSafeTranslation('admin');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<RuleSectionKey>('runtimeParam');
    const [rawRules, setRawRules] = useState<AdminGameRulesConfig | null>(null);
    const [sections, setSections] = useState<Record<RuleSectionKey, string>>({
        runtimeParam: '{}',
        balanceRule: '{}',
        eventRules: '[]',
        comboRules: '[]',
        policyUnlockRules: '[]',
        coreSpecialConditions: '[]',
        cardTags: '[]',
        endingContents: '[]',
    });

    const parseError = useMemo(() => {
        try {
            JSON.parse(sections[activeSection]);
            return '';
        } catch (e: any) {
            return e?.message || 'Invalid JSON';
        }
    }, [activeSection, sections]);

    const loadRules = async () => {
        setLoading(true);
        try {
            const rules = await adminApi.getAdminGameRules();
            setRawRules(rules);
            setSections({
                runtimeParam: JSON.stringify(rules.runtimeParam ?? {}, null, 2),
                balanceRule: JSON.stringify(rules.balanceRule ?? {}, null, 2),
                eventRules: JSON.stringify(rules.eventRules ?? [], null, 2),
                comboRules: JSON.stringify(rules.comboRules ?? [], null, 2),
                policyUnlockRules: JSON.stringify(rules.policyUnlockRules ?? [], null, 2),
                coreSpecialConditions: JSON.stringify(rules.coreSpecialConditions ?? [], null, 2),
                cardTags: JSON.stringify(rules.cardTags ?? [], null, 2),
                endingContents: JSON.stringify(rules.endingContents ?? [], null, 2),
            });
        } catch {
            alert(t('gameRules.loadFailed', '加载游戏规则失败'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRules();
    }, []);

    const saveRules = async () => {
        if (parseError) {
            alert(parseError);
            return;
        }
        let payload: AdminUpdateGameRulesRequest;
        try {
            payload = {
                runtimeParam: JSON.parse(sections.runtimeParam),
                balanceRule: JSON.parse(sections.balanceRule),
                eventRules: JSON.parse(sections.eventRules),
                comboRules: JSON.parse(sections.comboRules),
                policyUnlockRules: JSON.parse(sections.policyUnlockRules),
                coreSpecialConditions: JSON.parse(sections.coreSpecialConditions),
                cardTags: JSON.parse(sections.cardTags),
                endingContents: JSON.parse(sections.endingContents),
            };
        } catch (e: any) {
            alert(e?.message || 'Invalid JSON');
            return;
        }

        setSaving(true);
        try {
            await adminApi.updateAdminGameRules(payload);
            alert(t('gameRules.saveSuccess', '保存成功，规则已热重载'));
            await loadRules();
        } catch {
            alert(t('gameRules.saveFailed', '保存失败'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 tracking-tight">
                        {t('tabs.gameRules', '游戏规则')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('gameRules.subtitle', '可直接修改数据库中的规则配置，保存后立即生效于新回合计算')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadRules}
                        disabled={loading || saving}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
                    >
                        {t('refresh', '刷新')}
                    </button>
                    <button
                        onClick={saveRules}
                        disabled={loading || saving}
                        className="px-4 py-2 rounded-xl bg-[#30499B] dark:bg-[#56B949] text-white hover:bg-[#25397a] dark:hover:bg-[#4aa840] shadow-sm shadow-[#30499B]/20 dark:shadow-[#56B949]/20 disabled:opacity-60 transition-colors"
                    >
                        {saving ? t('saving', '保存中...') : t('save', '保存')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 space-y-2">
                    {(Object.keys(SECTION_LABELS) as RuleSectionKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${activeSection === key
                                ? 'bg-[#30499B] dark:bg-[#56B949] text-white shadow-sm shadow-[#30499B]/10 dark:shadow-[#56B949]/10'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {SECTION_LABELS[key]}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                    {loading && !rawRules ? (
                        <div className="py-10 text-center text-slate-500 dark:text-slate-400">{t('loading', '加载中...')}</div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{SECTION_LABELS[activeSection]}</h3>
                                {parseError ? <span className="text-xs text-red-600 dark:text-red-400">{parseError}</span> : <span className="text-xs text-slate-400 dark:text-slate-500">JSON</span>}
                            </div>
                            <textarea
                                value={sections[activeSection]}
                                onChange={(e) => setSections((prev) => ({ ...prev, [activeSection]: e.target.value }))}
                                spellCheck={false}
                                className="w-full min-h-[520px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 transition-all custom-scrollbar"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

