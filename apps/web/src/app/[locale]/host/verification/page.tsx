'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { hostApi } from '@/lib/api';
import type { HostVerificationResponse } from '@/lib/api/host';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

function statusLabel(status: number, t: (key: string, fallback?: string) => string): string {
    if (status === 1) return t('verification.pending', 'Pending');
    if (status === 2) return t('verification.approved', 'Approved');
    if (status === 3) return t('verification.rejected', 'Rejected');
    return t('verification.revoked', 'Revoked');
}

export default function HostVerificationPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('host');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existing, setExisting] = useState<HostVerificationResponse | null>(null);
    const [form, setForm] = useState({
        orgName: '',
        contactName: '',
        contactPhone: '',
        docUrlsText: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await hostApi.getMyHostVerification();
                setExisting(data);
                setForm({
                    orgName: data.orgName || '',
                    contactName: data.contactName || '',
                    contactPhone: data.contactPhone || '',
                    docUrlsText: (data.docUrls || []).join('\n'),
                });
            } catch (error) {
                // Treat missing record as first-time submission.
                console.warn('Host verification not found or unavailable:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const isApproved = existing?.status === 2;
    const isInvalid = useMemo(() => {
        return !form.orgName.trim() || !form.contactName.trim() || !form.contactPhone.trim();
    }, [form]);

    const handleSubmit = async () => {
        if (isInvalid) {
            alert(t('verification.required', 'Please fill all required fields'));
            return;
        }
        try {
            setSubmitting(true);
            const docUrls = form.docUrlsText
                .split('\n')
                .map((x) => x.trim())
                .filter(Boolean);
            await hostApi.submitHostVerification({
                orgName: form.orgName.trim(),
                contactName: form.contactName.trim(),
                contactPhone: form.contactPhone.trim(),
                docUrls: docUrls.length > 0 ? docUrls : undefined,
            });
            alert(t('verification.submitted', 'Verification submitted'));
            const refreshed = await hostApi.getMyHostVerification();
            setExisting(refreshed);
        } catch (error) {
            console.error('Failed to submit host verification:', error);
            alert(t('verification.submitFailed', 'Failed to submit verification'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-4 py-10 text-slate-600 dark:text-slate-400">{t('loading', 'Loading...')}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
                    {t('verification.title', 'Host Verification')}
                </h1>

                {existing && (
                    <div className="mb-6 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t('verification.currentStatus', 'Current status')}: <span className="font-medium text-slate-800 dark:text-slate-100">{statusLabel(existing.status, t)}</span>
                        </p>
                        {existing.reviewNote && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {t('verification.reviewNote', 'Review note')}: {existing.reviewNote}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">{t('verification.orgName', 'Organization Name')} *</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#30499B]/20 outline-none transition-all"
                            value={form.orgName}
                            onChange={(e) => setForm((prev) => ({ ...prev, orgName: e.target.value }))}
                            disabled={isApproved || submitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">{t('verification.contactName', 'Contact Name')} *</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#30499B]/20 outline-none transition-all"
                            value={form.contactName}
                            onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
                            disabled={isApproved || submitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">{t('verification.contactPhone', 'Contact Phone')} *</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#30499B]/20 outline-none transition-all"
                            value={form.contactPhone}
                            onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                            disabled={isApproved || submitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">{t('verification.docUrls', 'Document URLs (one per line)')}</label>
                        <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#30499B]/20 outline-none transition-all"
                            value={form.docUrlsText}
                            onChange={(e) => setForm((prev) => ({ ...prev, docUrlsText: e.target.value }))}
                            disabled={isApproved || submitting}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isApproved || submitting}
                            className="px-4 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60"
                        >
                            {submitting ? t('saving', 'Saving...') : t('verification.submit', 'Submit Verification')}
                        </button>
                        <button
                            onClick={() => router.push(`/${locale}/host/activities`)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            {t('back', 'Back')}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

