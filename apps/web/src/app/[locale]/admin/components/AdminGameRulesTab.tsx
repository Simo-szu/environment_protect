'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/lib/api';
import type {
    AdminBalanceRule,
    AdminCardTag,
    AdminComboRule,
    AdminCoreSpecialCondition,
    AdminEndingContent,
    AdminEventRule,
    AdminGameRulesConfig,
    AdminGameRuntimeParam,
    AdminPolicyUnlockRule,
} from '@/lib/api/admin';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Switch } from '@/components/ui/switch';


// ─── Runtime param types (merged from AdminGameRuntimeTab) ────────────────────

type RuntimeField = keyof Pick<
    AdminGameRuntimeParam,
    | 'coreHandLimit'
    | 'policyHandLimit'
    | 'maxComboPerTurn'
    | 'maxTurn'
    | 'handDiscardDecisionSeconds'
    | 'tradeWindowInterval'
    | 'tradeWindowSeconds'
    | 'baseCarbonPrice'
    | 'maxCarbonQuota'
    | 'domainProgressCardCap'
    | 'endingDisplaySeconds'
    | 'turnTransitionAnimationSeconds'
>;

type RuntimeFormState = Record<RuntimeField, string> & {
    turnTransitionAnimationEnabledDefault: boolean;
    freePlacementEnabled: boolean;
};

const DEFAULT_RUNTIME_FORM: RuntimeFormState = {
    coreHandLimit: '6',
    policyHandLimit: '2',
    maxComboPerTurn: '2',
    maxTurn: '30',
    handDiscardDecisionSeconds: '10',
    tradeWindowInterval: '2',
    tradeWindowSeconds: '3',
    baseCarbonPrice: '2',
    maxCarbonQuota: '200',
    domainProgressCardCap: '15',
    endingDisplaySeconds: '5',
    turnTransitionAnimationSeconds: '2',
    turnTransitionAnimationEnabledDefault: true,
    freePlacementEnabled: true,
};

interface RuntimeFieldConfig {
    key: RuntimeField;
    labelKey: string;
    min: number;
    step: number;
    integerOnly?: boolean;
}

const RUNTIME_FIELD_CONFIGS: RuntimeFieldConfig[] = [
    { key: 'coreHandLimit', labelKey: 'gameRuntime.fields.coreHandLimit', min: 1, step: 1, integerOnly: true },
    { key: 'policyHandLimit', labelKey: 'gameRuntime.fields.policyHandLimit', min: 1, step: 1, integerOnly: true },
    { key: 'maxComboPerTurn', labelKey: 'gameRuntime.fields.maxComboPerTurn', min: 1, step: 1, integerOnly: true },
    { key: 'maxTurn', labelKey: 'gameRuntime.fields.maxTurn', min: 1, step: 1, integerOnly: true },
    { key: 'handDiscardDecisionSeconds', labelKey: 'gameRuntime.fields.handDiscardDecisionSeconds', min: 1, step: 1, integerOnly: true },
    { key: 'tradeWindowInterval', labelKey: 'gameRuntime.fields.tradeWindowInterval', min: 1, step: 1, integerOnly: true },
    { key: 'tradeWindowSeconds', labelKey: 'gameRuntime.fields.tradeWindowSeconds', min: 1, step: 1, integerOnly: true },
    { key: 'baseCarbonPrice', labelKey: 'gameRuntime.fields.baseCarbonPrice', min: 0.1, step: 0.1 },
    { key: 'maxCarbonQuota', labelKey: 'gameRuntime.fields.maxCarbonQuota', min: 1, step: 1, integerOnly: true },
    { key: 'domainProgressCardCap', labelKey: 'gameRuntime.fields.domainProgressCardCap', min: 1, step: 1, integerOnly: true },
    { key: 'endingDisplaySeconds', labelKey: 'gameRuntime.fields.endingDisplaySeconds', min: 1, step: 1, integerOnly: true },
    { key: 'turnTransitionAnimationSeconds', labelKey: 'gameRuntime.fields.turnTransitionAnimationSeconds', min: 1, step: 1, integerOnly: true },
];

function normalizeRuntimeNumber(value: number, integerOnly: boolean): number {
    if (!Number.isFinite(value)) return 0;
    return integerOnly ? Math.floor(value) : value;
}

// ─── Section key ──────────────────────────────────────────────────────────────

type SectionKey =
    | 'runtimeParam'
    | 'balanceRule'
    | 'eventRules'
    | 'comboRules'
    | 'policyUnlockRules'
    | 'coreSpecialConditions'
    | 'cardTags'
    | 'endingContents';

const SECTION_KEYS: SectionKey[] = [
    'runtimeParam',
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
    min,
    placeholder,
}: {
    value: number | null | undefined;
    onChange: (v: number | null) => void;
    step?: number;
    min?: number;
    placeholder?: string;
}) {
    return (
        <input
            type="number"
            step={step}
            min={min}
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
        <div
            className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
            onClick={() => onChange(!checked)}
        >
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                {label}
            </span>
            <Switch
                checked={!!checked}
                onCheckedChange={onChange}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
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
    onRemove,
    defaultOpen = false,
    children,
}: {
    title: string;
    badge?: string;
    enabled?: boolean;
    onToggleEnabled?: (v: boolean) => void;
    onRemove?: () => void;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {title || <span className="text-slate-400 italic">New item</span>}
                    </span>
                    {badge && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {badge}
                        </span>
                    )}
                    <span className="shrink-0 ml-auto text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
                </button>
                {onToggleEnabled !== undefined && (
                    <Switch
                        checked={!!enabled}
                        onCheckedChange={onToggleEnabled}
                        title="Enabled"
                        className="shrink-0 scale-75 origin-right"
                    />
                )}
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Remove"
                        className="shrink-0 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-lg font-bold leading-none"
                    >
                        ×
                    </button>
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

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-[#30499B] dark:hover:border-[#56B949] hover:text-[#30499B] dark:hover:text-[#56B949] text-sm transition-colors"
        >
            + {label}
        </button>
    );
}

// ─── Runtime Param Section ────────────────────────────────────────────────────

function RuntimeParamSection({
    form,
    onChange,
    validationError,
}: {
    form: RuntimeFormState;
    onChange: (f: RuntimeFormState) => void;
    validationError: string;
}) {
    const { t } = useSafeTranslation('admin');
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {RUNTIME_FIELD_CONFIGS.map((field) => (
                    <label key={field.key} className="space-y-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t(field.labelKey, field.labelKey.split('.').pop() || field.labelKey)}
                        </div>
                        <input
                            type="number"
                            min={field.min}
                            step={field.step}
                            value={form[field.key]}
                            onChange={(e) => onChange({ ...form, [field.key]: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 transition-colors"
                        />
                    </label>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <CheckboxField
                    checked={form.turnTransitionAnimationEnabledDefault}
                    onChange={(v) => onChange({ ...form, turnTransitionAnimationEnabledDefault: v })}
                    label={t('gameRuntime.fields.turnTransitionAnimationEnabled', '默认启用回合切换动画')}
                />
                <CheckboxField
                    checked={form.freePlacementEnabled}
                    onChange={(v) => onChange({ ...form, freePlacementEnabled: v })}
                    label={t('gameRuntime.fields.freePlacementEnabled', '允许核心卡自由放置 (任意空白格)')}
                />
            </div>
            {validationError && (
                <div className="text-xs text-red-600 dark:text-red-400">{validationError}</div>
            )}
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
    const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
    const add = () => onChange([...data, {
        eventType: '', displayName: '', isEnabled: true,
        triggerProbabilityPct: 30, weight: 1, durationTurns: 1, requireEvenTurn: false,
        greenDelta: 0, carbonDelta: 0, satisfactionDelta: 0, greenPctDelta: 0, populationPctDelta: 0, quotaDelta: 0,
    }]);

    return (
        <div className="space-y-3">
            {data.map((ev, i) => (
                <CardPanel
                    key={i}
                    defaultOpen={!ev.eventType}
                    title={ev.displayName || ev.eventType}
                    badge={ev.eventType || undefined}
                    enabled={ev.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                    onRemove={() => remove(i)}
                >
                    <SubSection label={t('gameRules.events.triggerConditions', 'Trigger Conditions')} />
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('eventType')} />
                            <TextInput value={ev.eventType} onChange={(v) => update(i, { eventType: v })} mono placeholder="event_type_id" />
                        </div>
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
            <AddRowButton label={t('gameRules.eventRules.addItem', 'Add Event')} onClick={add} />
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
    const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
    const add = () => onChange([...data, { comboId: '', priorityOrder: 1, isEnabled: true }]);

    return (
        <div className="space-y-3">
            {data.map((combo, i) => (
                <CardPanel
                    key={i}
                    defaultOpen={!combo.comboId}
                    title={combo.comboId}
                    badge={combo.priorityOrder != null ? `#${combo.priorityOrder}` : undefined}
                    enabled={combo.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                    onRemove={() => remove(i)}
                >
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('comboId')} />
                            <TextInput value={combo.comboId} onChange={(v) => update(i, { comboId: v })} mono placeholder="combo_id" />
                        </div>
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
            <AddRowButton label={t('gameRules.comboRules.addItem', 'Add Combo')} onClick={add} />
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
    const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
    const add = () => onChange([...data, { policyId: '', priorityOrder: 1, isEnabled: true }]);

    return (
        <div className="space-y-3">
            {data.map((rule, i) => (
                <CardPanel
                    key={i}
                    defaultOpen={!rule.policyId}
                    title={rule.policyId}
                    badge={rule.priorityOrder != null ? `#${rule.priorityOrder}` : undefined}
                    enabled={rule.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                    onRemove={() => remove(i)}
                >
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('policyId')} />
                            <TextInput value={rule.policyId} onChange={(v) => update(i, { policyId: v })} mono placeholder="policy_id" />
                        </div>
                        <div>
                            <FieldLabel label={f('priorityOrder')} />
                            <NumberInput value={rule.priorityOrder} onChange={(v) => update(i, { priorityOrder: v ?? 1 })} />
                        </div>
                    </FieldGrid>

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
            <AddRowButton label={t('gameRules.policyUnlockRules.addItem', 'Add Policy Unlock')} onClick={add} />
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
    const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
    const add = () => onChange([...data, { cardId: '', isEnabled: true }]);

    return (
        <div className="space-y-3">
            {data.map((cond, i) => (
                <CardPanel
                    key={i}
                    defaultOpen={!cond.cardId}
                    title={cond.cardId}
                    enabled={cond.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                    onRemove={() => remove(i)}
                >
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('cardId')} />
                            <TextInput value={cond.cardId} onChange={(v) => update(i, { cardId: v })} mono placeholder="card_id" />
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
            <AddRowButton label={t('gameRules.coreSpecialConditions.addItem', 'Add Condition')} onClick={add} />
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
            <AddRowButton label={t('gameRules.cardTags.addRow', 'Add Tag')} onClick={add} />
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
    const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
    const add = () => onChange([...data, { endingId: '', endingName: '', isEnabled: true }]);

    return (
        <div className="space-y-3">
            {data.map((ending, i) => (
                <CardPanel
                    key={i}
                    defaultOpen={!ending.endingId}
                    title={ending.endingName || ending.endingId}
                    badge={ending.endingId || undefined}
                    enabled={ending.isEnabled}
                    onToggleEnabled={(v) => update(i, { isEnabled: v })}
                    onRemove={() => remove(i)}
                >
                    <FieldGrid>
                        <div>
                            <FieldLabel label={f('endingId')} />
                            <TextInput value={ending.endingId} onChange={(v) => update(i, { endingId: v })} mono placeholder="ending_id" />
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
            <AddRowButton label={t('gameRules.endingContents.addItem', 'Add Ending')} onClick={add} />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminGameRulesTab() {
    const { t } = useSafeTranslation('admin');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeSection, setActiveSection] = useState<SectionKey>('runtimeParam');

    // Runtime param state
    const [runtimeConfigId, setRuntimeConfigId] = useState<number>(1);
    const [runtimeForm, setRuntimeForm] = useState<RuntimeFormState>(DEFAULT_RUNTIME_FORM);

    // Rule sections state
    const [balanceRule, setBalanceRule] = useState<AdminBalanceRule | null>(null);
    const [eventRules, setEventRules] = useState<AdminEventRule[]>([]);
    const [comboRules, setComboRules] = useState<AdminComboRule[]>([]);
    const [policyUnlockRules, setPolicyUnlockRules] = useState<AdminPolicyUnlockRule[]>([]);
    const [coreSpecialConditions, setCoreSpecialConditions] = useState<AdminCoreSpecialCondition[]>([]);
    const [cardTags, setCardTags] = useState<AdminCardTag[]>([]);
    const [endingContents, setEndingContents] = useState<AdminEndingContent[]>([]);

    const runtimeValidationError = useMemo(() => {
        for (const field of RUNTIME_FIELD_CONFIGS) {
            const raw = runtimeForm[field.key].trim();
            const label = t(field.labelKey, field.labelKey.split('.').pop() || field.labelKey);
            if (!raw) return t('gameRuntime.errors.isRequired', '{field} 为必填项', { field: label });
            const parsed = Number(raw);
            if (!Number.isFinite(parsed)) return t('gameRuntime.errors.mustBeNumber', '{field} 必须是有效数字', { field: label });
            const normalized = normalizeRuntimeNumber(parsed, Boolean(field.integerOnly));
            if (normalized < field.min) {
                return t('gameRuntime.errors.mustBeMin', '{field} 必须 ≥ {min}', {
                    field: label,
                    min: field.min
                });
            }
        }
        return '';
    }, [runtimeForm, t]);

    const loadRules = async () => {
        setLoading(true);
        setMessage('');
        try {
            const rules = await adminApi.getAdminGameRules();
            const runtime = (rules.runtimeParam ?? {}) as AdminGameRuntimeParam;
            setRuntimeConfigId(Number((runtime as AdminGameRulesConfig['runtimeParam'] & { configId?: number })?.configId ?? 1));
            setRuntimeForm({
                coreHandLimit: String(runtime.coreHandLimit ?? DEFAULT_RUNTIME_FORM.coreHandLimit),
                policyHandLimit: String(runtime.policyHandLimit ?? DEFAULT_RUNTIME_FORM.policyHandLimit),
                maxComboPerTurn: String(runtime.maxComboPerTurn ?? DEFAULT_RUNTIME_FORM.maxComboPerTurn),
                maxTurn: String(runtime.maxTurn ?? DEFAULT_RUNTIME_FORM.maxTurn),
                handDiscardDecisionSeconds: String(runtime.handDiscardDecisionSeconds ?? DEFAULT_RUNTIME_FORM.handDiscardDecisionSeconds),
                tradeWindowInterval: String(runtime.tradeWindowInterval ?? DEFAULT_RUNTIME_FORM.tradeWindowInterval),
                tradeWindowSeconds: String(runtime.tradeWindowSeconds ?? DEFAULT_RUNTIME_FORM.tradeWindowSeconds),
                baseCarbonPrice: String(runtime.baseCarbonPrice ?? DEFAULT_RUNTIME_FORM.baseCarbonPrice),
                maxCarbonQuota: String(runtime.maxCarbonQuota ?? DEFAULT_RUNTIME_FORM.maxCarbonQuota),
                domainProgressCardCap: String(runtime.domainProgressCardCap ?? DEFAULT_RUNTIME_FORM.domainProgressCardCap),
                endingDisplaySeconds: String(runtime.endingDisplaySeconds ?? DEFAULT_RUNTIME_FORM.endingDisplaySeconds),
                turnTransitionAnimationSeconds: String(runtime.turnTransitionAnimationSeconds ?? DEFAULT_RUNTIME_FORM.turnTransitionAnimationSeconds),
                turnTransitionAnimationEnabledDefault: runtime.turnTransitionAnimationEnabledDefault ?? true,
                freePlacementEnabled: runtime.freePlacementEnabled ?? true,
            });
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

    const buildRuntimePayload = (): AdminGameRuntimeParam => {
        const payload: AdminGameRuntimeParam = {
            configId: runtimeConfigId,
            turnTransitionAnimationEnabledDefault: runtimeForm.turnTransitionAnimationEnabledDefault,
            freePlacementEnabled: runtimeForm.freePlacementEnabled,
        };
        for (const field of RUNTIME_FIELD_CONFIGS) {
            const parsed = Number(runtimeForm[field.key]);
            (payload as Record<string, number>)[field.key] = normalizeRuntimeNumber(parsed, Boolean(field.integerOnly));
        }
        return payload;
    };

    // 辅助函数：空数组传 undefined，避免触发后端 disableAll 清空数据
    const listOrUndefined = <T,>(arr: T[]): T[] | undefined =>
        arr.length > 0 ? arr : undefined;

    const saveRules = async () => {
        if (runtimeValidationError) {
            setMessage(runtimeValidationError);
            setActiveSection('runtimeParam');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            await adminApi.updateAdminGameRules({
                runtimeParam: buildRuntimePayload(),
                balanceRule,
                eventRules: listOrUndefined(eventRules),
                comboRules: listOrUndefined(comboRules),
                policyUnlockRules: listOrUndefined(policyUnlockRules),
                coreSpecialConditions: listOrUndefined(coreSpecialConditions),
                cardTags: listOrUndefined(cardTags),
                endingContents: listOrUndefined(endingContents),
            });
            setMessage(t('gameRules.saveSuccess', '保存成功，规则已热重载'));
        } catch {
            setMessage(t('gameRules.saveFailed', '保存失败'));
        } finally {
            setSaving(false);
        }
    };

    const renderSection = () => {
        if (loading) {
            return (
                <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                    {t('loading', '加载中...')}
                </div>
            );
        }
        switch (activeSection) {
            case 'runtimeParam':
                return (
                    <RuntimeParamSection
                        form={runtimeForm}
                        onChange={setRuntimeForm}
                        validationError={runtimeValidationError}
                    />
                );
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
                        {t('tabs.gameRules', '游戏配置')}
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
                <div className={`text-xs px-3 py-2 rounded-lg ${message.includes('失败') || message.includes('Failed') || runtimeValidationError
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
                            {t(`gameRules.sections.${key}`, key)}
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
