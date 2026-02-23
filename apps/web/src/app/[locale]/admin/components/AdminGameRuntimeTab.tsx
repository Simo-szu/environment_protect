'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { AdminGameRuntimeParam } from '@/lib/api/admin';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

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
};

const DEFAULT_FORM: RuntimeFormState = {
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
};

interface NumberFieldConfig {
  key: RuntimeField;
  label: string;
  min: number;
  step: number;
  integerOnly?: boolean;
}

const FIELD_CONFIGS: NumberFieldConfig[] = [
  { key: 'coreHandLimit', label: 'Core Hand Limit', min: 1, step: 1, integerOnly: true },
  { key: 'policyHandLimit', label: 'Policy Hand Limit', min: 1, step: 1, integerOnly: true },
  { key: 'maxComboPerTurn', label: 'Max Combo Per Turn', min: 1, step: 1, integerOnly: true },
  { key: 'maxTurn', label: 'Max Turn', min: 1, step: 1, integerOnly: true },
  { key: 'handDiscardDecisionSeconds', label: 'Discard Decision Seconds', min: 1, step: 1, integerOnly: true },
  { key: 'tradeWindowInterval', label: 'Trade Window Interval', min: 1, step: 1, integerOnly: true },
  { key: 'tradeWindowSeconds', label: 'Trade Window Seconds', min: 1, step: 1, integerOnly: true },
  { key: 'baseCarbonPrice', label: 'Base Carbon Price', min: 0.1, step: 0.1 },
  { key: 'maxCarbonQuota', label: 'Max Carbon Quota', min: 1, step: 1, integerOnly: true },
  { key: 'domainProgressCardCap', label: 'Domain Progress Card Cap', min: 1, step: 1, integerOnly: true },
  { key: 'endingDisplaySeconds', label: 'Ending Display Seconds', min: 1, step: 1, integerOnly: true },
  { key: 'turnTransitionAnimationSeconds', label: 'Turn Animation Seconds', min: 1, step: 1, integerOnly: true },
];

function normalizeNumber(value: number, integerOnly: boolean): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return integerOnly ? Math.floor(value) : value;
}

export function AdminGameRuntimeTab() {
  const { t } = useSafeTranslation('admin');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState<number>(1);
  const [form, setForm] = useState<RuntimeFormState>(DEFAULT_FORM);
  const [message, setMessage] = useState('');

  const validationError = useMemo(() => {
    for (const field of FIELD_CONFIGS) {
      const raw = form[field.key].trim();
      if (!raw) {
        return `${field.label} is required`;
      }
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        return `${field.label} must be a number`;
      }
      const normalized = normalizeNumber(parsed, Boolean(field.integerOnly));
      if (normalized < field.min) {
        return `${field.label} must be >= ${field.min}`;
      }
    }
    return '';
  }, [form]);

  const loadRuntime = async () => {
    setLoading(true);
    setMessage('');
    try {
      const rules = await adminApi.getAdminGameRules();
      const runtime = rules.runtimeParam || {};
      setConfigId(Number(runtime.configId || 1));
      setForm({
        coreHandLimit: String(runtime.coreHandLimit ?? DEFAULT_FORM.coreHandLimit),
        policyHandLimit: String(runtime.policyHandLimit ?? DEFAULT_FORM.policyHandLimit),
        maxComboPerTurn: String(runtime.maxComboPerTurn ?? DEFAULT_FORM.maxComboPerTurn),
        maxTurn: String(runtime.maxTurn ?? DEFAULT_FORM.maxTurn),
        handDiscardDecisionSeconds: String(runtime.handDiscardDecisionSeconds ?? DEFAULT_FORM.handDiscardDecisionSeconds),
        tradeWindowInterval: String(runtime.tradeWindowInterval ?? DEFAULT_FORM.tradeWindowInterval),
        tradeWindowSeconds: String(runtime.tradeWindowSeconds ?? DEFAULT_FORM.tradeWindowSeconds),
        baseCarbonPrice: String(runtime.baseCarbonPrice ?? DEFAULT_FORM.baseCarbonPrice),
        maxCarbonQuota: String(runtime.maxCarbonQuota ?? DEFAULT_FORM.maxCarbonQuota),
        domainProgressCardCap: String(runtime.domainProgressCardCap ?? DEFAULT_FORM.domainProgressCardCap),
        endingDisplaySeconds: String(runtime.endingDisplaySeconds ?? DEFAULT_FORM.endingDisplaySeconds),
        turnTransitionAnimationSeconds: String(
          runtime.turnTransitionAnimationSeconds ?? DEFAULT_FORM.turnTransitionAnimationSeconds
        ),
        turnTransitionAnimationEnabledDefault: runtime.turnTransitionAnimationEnabledDefault ?? true,
      });
    } catch {
      setMessage(t('gameRuntime.loadFailed', '加载运行参数失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuntime();
  }, []);

  const saveRuntime = async () => {
    if (validationError) {
      setMessage(validationError);
      return;
    }
    const payload: AdminGameRuntimeParam = {
      configId,
      turnTransitionAnimationEnabledDefault: form.turnTransitionAnimationEnabledDefault,
    };
    for (const field of FIELD_CONFIGS) {
      const parsed = Number(form[field.key]);
      const normalized = normalizeNumber(parsed, Boolean(field.integerOnly));
      (payload as Record<string, number>)[field.key] = normalized;
    }

    setSaving(true);
    setMessage('');
    try {
      await adminApi.updateAdminGameRules({ runtimeParam: payload });
      setMessage(t('gameRuntime.saveSuccess', '运行参数已保存并热重载'));
      await loadRuntime();
    } catch {
      setMessage(t('gameRuntime.saveFailed', '运行参数保存失败'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium text-slate-800 tracking-tight">
            {t('tabs.gameRuntime', '游戏运行参数')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('gameRuntime.subtitle', '用于调整回合节奏、交易窗口与结局展示相关运行参数')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadRuntime}
            disabled={loading || saving}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {t('refresh', '刷新')}
          </button>
          <button
            onClick={saveRuntime}
            disabled={loading || saving}
            className="px-4 py-2 rounded-xl bg-[#30499B] text-white hover:bg-opacity-90 disabled:opacity-60"
          >
            {saving ? t('saving', '保存中...') : t('save', '保存')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? (
          <div className="py-10 text-center text-slate-500">{t('loading', '加载中...')}</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {FIELD_CONFIGS.map((field) => (
                <label key={field.key} className="space-y-1">
                  <div className="text-xs text-slate-500">{field.label}</div>
                  <input
                    type="number"
                    min={field.min}
                    step={field.step}
                    value={form[field.key]}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#30499B]/20"
                  />
                </label>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.turnTransitionAnimationEnabledDefault}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    turnTransitionAnimationEnabledDefault: event.target.checked,
                  }))
                }
              />
              Turn transition animation enabled by default
            </label>

            {(validationError || message) && (
              <div className={`text-xs ${validationError ? 'text-red-600' : 'text-slate-600'}`}>
                {validationError || message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

