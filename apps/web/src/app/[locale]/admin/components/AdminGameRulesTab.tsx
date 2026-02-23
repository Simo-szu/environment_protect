'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type {
    AdminBalanceRule,
    AdminCardTag,
    AdminComboRule,
    AdminCoreSpecialCondition,
    AdminEndingContent,
    AdminEventRule,
    AdminGameRulesConfig,
    AdminPolicyUnlockRule,
} from '@/lib/api/admin';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionKey =
    | 'balanceRule'
    | 'eventRules'
    | 'comboRules'
    | 'policyUnlockRules'
    | 'coreSpecialConditions'
    | 'cardTags'
    | 'endingContents';

const SECTION_KEYS: SectionKey[] = [
    'balanceRule',
    'eventRules',
    'comboRules',
    'policyUnlockRules',
    'coreSpecialConditions',
    'cardTags',
    'endingContents',
];

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function FieldLabel({ label }: { label: string }) {
    return <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</div>;
}

function NumberInput({
    value,
    onChange,
    step = 1,
    placeholder,
}: {
    value: number | null | undefined;
    onChange: (v: number | null) => void;
    step?: number;
    placeholder?: string;
}) {
    return (
        <input
            type="number"
            step={step}
            placeholder={placeholder ?? ''}
            value={value == null ? '' : value}
            onChange={(e) => {
                const raw = e.target.value;
                onChange(raw === '' ? null : Number(raw));
            }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 transition-colors"
        />
    );
}

function TextInput({
    value,
    onChange,
    placeholder,
    readOnly,
    mono,
}: {
    value: string | null | undefined;
    onChange?: (v: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    mono?: boolean;
}) {
    return (
        <input
            type="text"
            readOnly={readOnly}
            placeholder={placeholder ?? ''}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm outline-none transition-colors
        ${readOnly
                ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20'
            }
        ${mono ? 'font-mono text-xs' : ''}`}
        />
    );
}

function TextArea({
    value,
    onChange,
    placeholder,
}: {
    value: string | null | undefined;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <textarea
            rows={2}
            placeholder={placeholder ?? ''}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 transition-colors resize-none"
        />
    );
}

function CheckboxField({
    checked,
    onChange,
    label,
}: {
    checked: boolean | null | undefined;
    onChange: (v: boolean) => void;
    label: string;
}) {
    return (
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
                type="checkbox"
                checked={!!checked}
                onChange={(e) => onChange(e.target.checked)}
                className="accent-[#30499B] dark:accent-[#56B949]"
            />
            {label}
        </label>
    );
}

function GroupPanel({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
                <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="p-5">{children}</div>}
        </div>
    );
}

function CardPanel({
    title,
    badge,
    enabled,
    onToggleEnabled,
    children,
}: {
    title: string;
    badge?: string;
    enabled?: boolean;
    onToggleEnabled?: (v: boolean) => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{title}</span>
                    {badge && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {badge}
                        </span>
                    )}
                    <span className="shrink-0 ml-auto text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
                </button>
                {onToggleEnabled !== undefined && (
                    <input
                        type="checkbox"
                        checked={!!enabled}
                        onChange={(e) => onToggleEnabled(e.target.checked)}
                        title="Enabled"
                        className="accent-[#30499B] dark:accent-[#56B949] shrink-0"
                    />
                )}
            </div>
            {open && <div className="p-5 space-y-4">{children}</div>}
        </div>
    );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>;
}

function SubSection({ label }: { label: string }) {
    return (
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pt-2">
            {label}
        </div>
    );
}

// ─── Balance Rule Section ─────────────────────────────────────────────────────

function BalanceRuleSection({
    data,
    onChange,
}: {
    data: AdminBalanceRule | null;
    onChange: (v: AdminBalanceRule) => void;
}) {
    const { t } = useSafeTranslation('admin');
    const b = data ?? {};
    const set = (patch: Partial<AdminBalanceRule>) => onChange({ ...b, ...patch });
    const f = (key: keyof AdminBalanceRule) =>
        t(`gameRules.balance.fields.${key}`, key as string);
    const g = (key: string) => t(`gameRules.balance.groups.${key}`, key);

    return (
        <div className="space-y-3">
            <GroupPanel title={g('initialState')}>
                <div className="space-y-2 mb-4">
                    <FieldLabel label={f('initialPhase')} />
                    <select
                        value={b.initialPhase ?? 'early'}
                        onChange={(e) => set({ initialPhase: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20"
                    >
                        <option value="early">early</option>
                        <option value="mid">mid</option>
                        <option value="late">late</option>
                    </select>
                </div>
                <FieldGrid>
                    {(['boardSize', 'initialEventCooldown', 'initialIndustry', 'initialTech', 'initialPopulation', 'initialGreen', 'initialCarbon', 'initialSatisfaction', 'initialLowCarbonScore', 'initialQuota'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('drawRules')}>
                <FieldGrid>
                    {(['initialDrawEarly', 'drawCountEarly', 'drawCountMid', 'drawCountLate', 'eventCooldownResetTurns'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('settlement')}>
                <FieldGrid>
                    {(['settlementBaseIndustryGain', 'settlementBaseTechGain', 'settlementBasePopulationGain', 'satisfactionMax'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('carbonEmission')}>
                <FieldGrid>
                    {(['carbonQuotaBaseLine', 'carbonQuotaPerNOver', 'carbonIndustryEmissionPerCard', 'carbonEcologyReductionPerCard', 'carbonScienceReductionPerCard'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('carbonTrade')}>
                <FieldGrid>
                    {(['tradeRandomBaseMin', 'tradeRandomSpan', 'tradeHighCarbonThreshold', 'tradeHighCarbonFactor', 'tradeLowCarbonThreshold', 'tradeLowCarbonFactor'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput
                                value={b[k]}
                                step={['tradeRandomBaseMin', 'tradeRandomSpan', 'tradeHighCarbonFactor', 'tradeLowCarbonFactor'].includes(k) ? 0.01 : 1}
                                onChange={(v) => set({ [k]: v })}
                            />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('failureConditions')}>
                <FieldGrid>
                    {(['failureHighCarbonThreshold', 'failureHighCarbonStreakLimit', 'tradeFailureQuotaExhaustedLimit', 'tradeFailureProfitThreshold'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} step={k === 'tradeFailureProfitThreshold' ? 0.01 : 1} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('lowCarbonScore')}>
                <FieldGrid>
                    {(['lowCarbonMinForPositiveEnding', 'lowCarbonDomainThreshold', 'lowCarbonDomainBonus', 'lowCarbonPolicyUnlockScore', 'lowCarbonPolicyUnlockAllCount', 'lowCarbonPolicyUnlockAllBonus', 'lowCarbonEventResolvedScore', 'lowCarbonEventTriggeredPenalty', 'lowCarbonOverLimitCarbonThreshold', 'lowCarbonOverLimitStreakThreshold', 'lowCarbonOverLimitStreakPenalty', 'lowCarbonTradeProfitDivisor', 'lowCarbonTradeProfitBonus', 'lowCarbonQuotaExhaustedPenalty', 'lowCarbonInvalidOperationPenalty'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} step={k === 'lowCarbonTradeProfitDivisor' ? 0.01 : 1} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('carbonTiers')}>
                <FieldGrid>
                    {(['carbonTier1Max', 'carbonTier1Score', 'carbonTier2Max', 'carbonTier2Score', 'carbonTier3Max', 'carbonTier3Score', 'carbonTier4Max', 'carbonTier4Score', 'carbonTier5Score'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('gamePhase')}>
                <FieldGrid>
                    {(['phaseEarlyMaxCards', 'phaseEarlyMaxScore', 'phaseMidMinCards', 'phaseMidMaxCards', 'phaseMidMinScore', 'phaseMidMaxScore', 'phaseLateMinCards', 'phaseLateMinScore', 'phaseLateRemainingCardsThreshold'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>

            <GroupPanel title={g('endingConditions')}>
                <FieldGrid>
                    <div>
                        <FieldLabel label={f('endingEventResolveRateRequired')} />
                        <NumberInput value={b.endingEventResolveRateRequired} step={0.01} onChange={(v) => set({ endingEventResolveRateRequired: v ?? undefined })} />
                    </div>
                </FieldGrid>
                <SubSection label="Innovation" />
                <FieldGrid>
                    {(['endingInnovationMinScience', 'endingInnovationMinTech', 'endingInnovationMinLowCarbon', 'endingInnovationMaxCarbon', 'endingInnovationMinProfit'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} step={k === 'endingInnovationMinProfit' ? 0.01 : 1} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
                <SubSection label="Ecology" />
                <FieldGrid>
                    {(['endingEcologyMinEcology', 'endingEcologyMinGreen', 'endingEcologyMinLowCarbon', 'endingEcologyMaxCarbon', 'endingEcologyMinQuota'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
                <SubSection label="Doughnut City" />
                <FieldGrid>
                    {(['endingDoughnutMinSociety', 'endingDoughnutMinSatisfaction', 'endingDoughnutMinPopulation', 'endingDoughnutMinDomain', 'endingDoughnutMinLowCarbon', 'endingDoughnutMaxCarbon', 'endingDoughnutMinPolicyUsage6768'] as const).map((k) => (
                        <div key={k}>
                            <FieldLabel label={f(k)} />
                            <NumberInput value={b[k]} onChange={(v) => set({ [k]: v })} />
                        </div>
                    ))}
                </FieldGrid>
            </GroupPanel>
        </div>
    );
}

// ─── Event Rules Section ──────────────────────────────────────────────────────

function EventRulesSection({
    data,
    onChange,
}: {
    data: AdminEventRule[];
    onChange: (v: AdminEventRule[]) => void;
}) {
    const { t } = useSafeTranslation('admin');
    const f = (k: string) => t(`gameRules.events.fields.${k}`, k);
    const update = (i: number, patch: Partial<AdminEventRule>) => {
        const next = [...data];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {data.map((ev, i) => (
                <CardPanel
                    key={ev.eventType}
                    title={ev.displayName || ev.eventType}
                    badge={ev.eventType}
                    enabled={ev.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                >
                    <SubSection label={t('gameRules.events.triggerConditions', 'Trigger Conditions')} />
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('triggerProbabilityPct')} />
                            <NumberInput value={ev.triggerProbabilityPct} onChange={(v) => update(i, { triggerProbabilityPct: v ?? 0 })} />
                        </div>
                        <div>
                            <FieldLabel label={f('weight')} />
                            <NumberInput value={ev.weight} onChange={(v) => update(i, { weight: v ?? 0 })} />
                        </div>
                        <div>
                            <FieldLabel label={f('durationTurns')} />
                            <NumberInput value={ev.durationTurns} onChange={(v) => update(i, { durationTurns: v ?? 1 })} />
                        </div>
                        <div>
                            <FieldLabel label={f('minGreen')} />
                            <NumberInput value={ev.minGreen} onChange={(v) => update(i, { minGreen: v })} placeholder="none" />
                        </div>
                        <div>
                            <FieldLabel label={f('minCarbon')} />
                            <NumberInput value={ev.minCarbon} onChange={(v) => update(i, { minCarbon: v })} placeholder="none" />
                        </div>
                        <div>
                            <FieldLabel label={f('maxSatisfaction')} />
                            <NumberInput value={ev.maxSatisfaction} onChange={(v) => update(i, { maxSatisfaction: v })} placeholder="none" />
                        </div>
                        <div>
                            <FieldLabel label={f('minPopulation')} />
                            <NumberInput value={ev.minPopulation} onChange={(v) => update(i, { minPopulation: v })} placeholder="none" />
                        </div>
                    </FieldGrid>
                    <CheckboxField
                        checked={ev.requireEvenTurn}
                        onChange={(v) => update(i, { requireEvenTurn: v })}
                        label={f('requireEvenTurn')}
                    />

                    <SubSection label={t('gameRules.events.effects', 'Effects')} />
                    <FieldGrid>
                        {(['greenDelta', 'carbonDelta', 'satisfactionDelta', 'greenPctDelta', 'populationPctDelta', 'quotaDelta'] as const).map((k) => (
                            <div key={k}>
                                <FieldLabel label={f(k)} />
                                <NumberInput value={ev[k]} onChange={(v) => update(i, { [k]: v ?? 0 })} />
                            </div>
                        ))}
                    </FieldGrid>

                    <SubSection label={t('gameRules.events.textContent', 'Text Content')} />
                    <div className="space-y-3">
                        <div>
                            <FieldLabel label={f('displayName')} />
                            <TextInput value={ev.displayName} onChange={(v) => update(i, { displayName: v })} />
                        </div>
                        <div>
                            <FieldLabel label={f('effectSummary')} />
                            <TextArea value={ev.effectSummary} onChange={(v) => update(i, { effectSummary: v })} />
                        </div>
                        <div>
                            <FieldLabel label={f('resolutionHint')} />
                            <TextArea value={ev.resolutionHint} onChange={(v) => update(i, { resolutionHint: v })} />
                        </div>
                        <div>
                            <FieldLabel label={f('resolvablePolicyIdsCsv')} />
                            <TextInput value={ev.resolvablePolicyIdsCsv} onChange={(v) => update(i, { resolvablePolicyIdsCsv: v })} mono />
                        </div>
                    </div>
                </CardPanel>
            ))}
        </div>
    );
}

// ─── Combo Rules Section ──────────────────────────────────────────────────────

function ComboRulesSection({
    data,
    onChange,
}: {
    data: AdminComboRule[];
    onChange: (v: AdminComboRule[]) => void;
}) {
    const { t } = useSafeTranslation('admin');
    const f = (k: string) => t(`gameRules.combos.fields.${k}`, k);
    const update = (i: number, patch: Partial<AdminComboRule>) => {
        const next = [...data];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {data.map((combo, i) => (
                <CardPanel
                    key={combo.comboId}
                    title={combo.comboId}
                    badge={`#${combo.priorityOrder}`}
                    enabled={combo.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                >
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('priorityOrder')} />
                            <NumberInput value={combo.priorityOrder} onChange={(v) => update(i, { priorityOrder: v ?? 1 })} />
                        </div>
                        <div>
                            <FieldLabel label={f('requiredPolicyId')} />
                            <TextInput value={combo.requiredPolicyId} onChange={(v) => update(i, { requiredPolicyId: v })} mono placeholder="(none)" />
                        </div>
                    </FieldGrid>

                    <SubSection label={t('gameRules.combos.triggerConditions', 'Trigger Conditions')} />
                    <FieldGrid>
                        {(['minIndustry', 'minEcology', 'minScience', 'minSociety', 'minLowCarbonIndustry', 'minShenzhenEcology', 'minLinkCards', 'minIndustryLowCarbonAdjacentPairs', 'minScienceScienceAdjacentPairs', 'minScienceIndustryAdjacentPairs', 'minIndustryEcologyAdjacentPairs', 'minSocietyEcologyAdjacentPairs'] as const).map((k) => (
                            <div key={k}>
                                <FieldLabel label={f(k)} />
                                <NumberInput value={combo[k]} onChange={(v) => update(i, { [k]: v ?? 0 })} />
                            </div>
                        ))}
                    </FieldGrid>

                    <SubSection label={t('gameRules.combos.effects', 'Effects')} />
                    <FieldGrid>
                        {(['effectIndustryDelta', 'effectTechDelta', 'effectPopulationDelta', 'effectGreenDelta', 'effectCarbonDelta', 'effectSatisfactionDelta', 'effectQuotaDelta', 'effectLowCarbonDelta', 'effectTechPct', 'effectPopulationPct', 'effectIndustryPct', 'effectLowCarbonPct', 'effectGreenPct', 'effectGlobalPct'] as const).map((k) => (
                            <div key={k}>
                                <FieldLabel label={f(k)} />
                                <NumberInput value={combo[k]} onChange={(v) => update(i, { [k]: v ?? 0 })} />
                            </div>
                        ))}
                    </FieldGrid>
                </CardPanel>
            ))}
        </div>
    );
}

// ─── Policy Unlock Rules Section ──────────────────────────────────────────────

function PolicyUnlockSection({
    data,
    onChange,
}: {
    data: AdminPolicyUnlockRule[];
    onChange: (v: AdminPolicyUnlockRule[]) => void;
}) {
    const { t } = useSafeTranslation('admin');
    const f = (k: string) => t(`gameRules.policyUnlock.fields.${k}`, k);
    const update = (i: number, patch: Partial<AdminPolicyUnlockRule>) => {
        const next = [...data];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {data.map((rule, i) => (
                <CardPanel
                    key={rule.policyId}
                    title={rule.policyId}
                    badge={`#${rule.priorityOrder}`}
                    enabled={rule.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                >
                    <div className="mb-3">
                        <FieldLabel label={f('priorityOrder')} />
                        <NumberInput value={rule.priorityOrder} onChange={(v) => update(i, { priorityOrder: v ?? 1 })} />
                    </div>

                    <SubSection label={t('gameRules.policyUnlock.domainMin', 'Domain Minimums')} />
                    <FieldGrid>
                        {(['minIndustry', 'minEcology', 'minScience', 'minSociety'] as const).map((k) => (
                            <div key={k}>
                                <FieldLabel label={f(k)} />
                                <NumberInput value={rule[k]} onChange={(v) => update(i, { [k]: v ?? 0 })} />
                            </div>
                        ))}
                    </FieldGrid>

                    <SubSection label={t('gameRules.policyUnlock.resourceMin', 'Resource Minimums')} />
                    <FieldGrid>
                        {(['minIndustryResource', 'minTechResource', 'minPopulationResource'] as const).map((k) => (
                            <div key={k}>
                                <FieldLabel label={f(k)} />
                                <NumberInput value={rule[k]} onChange={(v) => update(i, { [k]: v ?? 0 })} />
                            </div>
                        ))}
                    </FieldGrid>

                    <SubSection label={t('gameRules.policyUnlock.metricConditions', 'Metric Conditions')} />
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('minGreen')} />
                            <NumberInput value={rule.minGreen} onChange={(v) => update(i, { minGreen: v })} placeholder="none" />
                        </div>
                        <div>
                            <FieldLabel label={f('minCarbon')} />
                            <NumberInput value={rule.minCarbon} onChange={(v) => update(i, { minCarbon: v })} placeholder="none" />
                        </div>
                        <div>
                            <FieldLabel label={f('maxCarbon')} />
                            <NumberInput value={rule.maxCarbon} onChange={(v) => update(i, { maxCarbon: v })} placeholder="none" />
                        </div>
                        <div>
                            <FieldLabel label={f('minSatisfaction')} />
                            <NumberInput value={rule.minSatisfaction} onChange={(v) => update(i, { minSatisfaction: v })} placeholder="none" />
                        </div>
                    </FieldGrid>

                    <SubSection label={t('gameRules.policyUnlock.tagConditions', 'Tag Conditions')} />
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('minTaggedCards')} />
                            <NumberInput value={rule.minTaggedCards} onChange={(v) => update(i, { minTaggedCards: v ?? 0 })} />
                        </div>
                        <div>
                            <FieldLabel label={f('requiredTag')} />
                            <TextInput value={rule.requiredTag} onChange={(v) => update(i, { requiredTag: v })} mono placeholder="(none)" />
                        </div>
                    </FieldGrid>
                </CardPanel>
            ))}
        </div>
    );
}

// ─── Core Special Conditions Section ─────────────────────────────────────────

function CoreConditionsSection({
    data,
    onChange,
}: {
    data: AdminCoreSpecialCondition[];
    onChange: (v: AdminCoreSpecialCondition[]) => void;
}) {
    const { t } = useSafeTranslation('admin');
    const f = (k: string) => t(`gameRules.coreConditions.fields.${k}`, k);
    const update = (i: number, patch: Partial<AdminCoreSpecialCondition>) => {
        const next = [...data];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {data.map((cond, i) => (
                <CardPanel
                    key={cond.cardId}
                    title={cond.cardId}
                    enabled={cond.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                >
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('cardId')} />
                            <TextInput value={cond.cardId} readOnly mono />
                        </div>
                        <div>
                            <FieldLabel label={f('requiredEventType')} />
                            <TextInput value={cond.requiredEventType} onChange={(v) => update(i, { requiredEventType: v })} mono placeholder="(none)" />
                        </div>
                        {(['minIndustryCards', 'minEcologyCards', 'minScienceCards', 'minSocietyCards'] as const).map((k) => (
                            <div key={k}>
                                <FieldLabel label={f(k)} />
                                <NumberInput value={cond[k]} onChange={(v) => update(i, { [k]: v ?? 0 })} />
                            </div>
                        ))}
                    </FieldGrid>
                </CardPanel>
            ))}
        </div>
    );
}

// ─── Card Tags Section ────────────────────────────────────────────────────────

function CardTagsSection({
    data,
    onChange,
}: {
    data: AdminCardTag[];
    onChange: (v: AdminCardTag[]) => void;
}) {
    const { t } = useSafeTranslation('admin');

    const update = (i: number, patch: Partial<AdminCardTag>) => {
        const next = [...data];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };
    const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
    const add = () => onChange([...data, { cardId: '', tagCode: '', isEnabled: true }]);

    return (
        <div className="space-y-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_80px_40px] gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>{t('gameRules.cardTags.fields.cardId', 'Card ID')}</span>
                    <span>{t('gameRules.cardTags.fields.tagCode', 'Tag Code')}</span>
                    <span>{t('gameRules.cardTags.fields.isEnabled', 'Enabled')}</span>
                    <span />
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {data.map((tag, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1fr_80px_40px] gap-3 px-4 py-2 items-center">
                            <TextInput value={tag.cardId} onChange={(v) => update(i, { cardId: v })} mono />
                            <TextInput value={tag.tagCode} onChange={(v) => update(i, { tagCode: v })} mono />
                            <div className="flex justify-center">
                                <input
                                    type="checkbox"
                                    checked={!!tag.isEnabled}
                                    onChange={(e) => update(i, { isEnabled: e.target.checked })}
                                    className="accent-[#30499B] dark:accent-[#56B949]"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-base font-bold leading-none"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                            {t('noRecords', 'No records.')}
                        </div>
                    )}
                </div>
            </div>
            <button
                type="button"
                onClick={add}
                className="px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-[#30499B] dark:hover:border-[#56B949] hover:text-[#30499B] dark:hover:text-[#56B949] text-sm transition-colors"
            >
                + {t('gameRules.cardTags.addRow', 'Add Tag')}
            </button>
        </div>
    );
}

// ─── Ending Contents Section ──────────────────────────────────────────────────

function EndingContentsSection({
    data,
    onChange,
}: {
    data: AdminEndingContent[];
    onChange: (v: AdminEndingContent[]) => void;
}) {
    const { t } = useSafeTranslation('admin');
    const f = (k: string) => t(`gameRules.endings.fields.${k}`, k);
    const update = (i: number, patch: Partial<AdminEndingContent>) => {
        const next = [...data];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {data.map((ending, i) => (
                <CardPanel
                    key={ending.endingId}
                    title={ending.endingName || ending.endingId}
                    badge={ending.endingId}
                    enabled={ending.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                >
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('endingId')} />
                            <TextInput value={ending.endingId} readOnly mono />
                        </div>
                        <div>
                            <FieldLabel label={f('endingName')} />
                            <TextInput value={ending.endingName} onChange={(v) => update(i, { endingName: v })} />
                        </div>
                        <div>
                            <FieldLabel label={f('imageKey')} />
                            <TextInput value={ending.imageKey} onChange={(v) => update(i, { imageKey: v })} mono />
                        </div>
                    </FieldGrid>
                    <div className="space-y-3 mt-2">
                        {(['defaultReason', 'failureReasonHighCarbon', 'failureReasonTrade', 'failureReasonLowScore', 'failureReasonBoundaryDefault'] as const).map((k) => (
                            <div key={k}>
                                <FieldLabel label={f(k)} />
                                <TextArea value={ending[k]} onChange={(v) => update(i, { [k]: v })} />
                            </div>
                        ))}
                    </div>
                </CardPanel>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminGameRulesTab() {
    const { t } = useSafeTranslation('admin');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeSection, setActiveSection] = useState<SectionKey>('balanceRule');

    const [balanceRule, setBalanceRule] = useState<AdminBalanceRule | null>(null);
    const [eventRules, setEventRules] = useState<AdminEventRule[]>([]);
    const [comboRules, setComboRules] = useState<AdminComboRule[]>([]);
    const [policyUnlockRules, setPolicyUnlockRules] = useState<AdminPolicyUnlockRule[]>([]);
    const [coreSpecialConditions, setCoreSpecialConditions] = useState<AdminCoreSpecialCondition[]>([]);
    const [cardTags, setCardTags] = useState<AdminCardTag[]>([]);
    const [endingContents, setEndingContents] = useState<AdminEndingContent[]>([]);

    // Keep runtimeParam to avoid accidental reset via null in save payload
    // (backend null-checks each section before updating, so omitting is fine)
    const [_cachedRuntimeParam, setCachedRuntimeParam] = useState<AdminGameRulesConfig['runtimeParam']>(null);

    const loadRules = async () => {
        setLoading(true);
        setMessage('');
        try {
            const rules = await adminApi.getAdminGameRules();
            setCachedRuntimeParam(rules.runtimeParam);
            setBalanceRule(rules.balanceRule);
            setEventRules(rules.eventRules ?? []);
            setComboRules(rules.comboRules ?? []);
            setPolicyUnlockRules(rules.policyUnlockRules ?? []);
            setCoreSpecialConditions(rules.coreSpecialConditions ?? []);
            setCardTags(rules.cardTags ?? []);
            setEndingContents(rules.endingContents ?? []);
        } catch {
            setMessage(t('gameRules.loadFailed', '加载游戏规则失败'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadRules(); }, []);

    const saveRules = async () => {
        setSaving(true);
        setMessage('');
        try {
            await adminApi.updateAdminGameRules({
                balanceRule,
                eventRules,
                comboRules,
                policyUnlockRules,
                coreSpecialConditions,
                cardTags,
                endingContents,
            });
            setMessage(t('gameRules.saveSuccess', '保存成功，规则已热重载'));
        } catch {
            setMessage(t('gameRules.saveFailed', '保存失败'));
        } finally {
            setSaving(false);
        }
    };

    const getSectionLabel = (key: SectionKey) =>
        t(`gameRules.sections.${key}`, key);

    const renderSection = () => {
        if (loading) {
            return (
                <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                    {t('loading', '加载中...')}
                </div>
            );
        }
        switch (activeSection) {
            case 'balanceRule':
                return <BalanceRuleSection data={balanceRule} onChange={setBalanceRule} />;
            case 'eventRules':
                return <EventRulesSection data={eventRules} onChange={setEventRules} />;
            case 'comboRules':
                return <ComboRulesSection data={comboRules} onChange={setComboRules} />;
            case 'policyUnlockRules':
                return <PolicyUnlockSection data={policyUnlockRules} onChange={setPolicyUnlockRules} />;
            case 'coreSpecialConditions':
                return <CoreConditionsSection data={coreSpecialConditions} onChange={setCoreSpecialConditions} />;
            case 'cardTags':
                return <CardTagsSection data={cardTags} onChange={setCardTags} />;
            case 'endingContents':
                return <EndingContentsSection data={endingContents} onChange={setEndingContents} />;
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

            {message && (
                <div className={`text-xs px-3 py-2 rounded-lg ${message.includes('失败') || message.includes('Failed')
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                    }`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 space-y-1 h-fit">
                    {SECTION_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${activeSection === key
                                ? 'bg-[#30499B] dark:bg-[#56B949] text-white shadow-sm'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {getSectionLabel(key)}
                        </button>
                    ))}
                </div>

                <div className="min-w-0">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
}
