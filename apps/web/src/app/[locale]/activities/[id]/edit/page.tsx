'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { activityApi } from '@/lib/api';
import type { CreateOrUpdateActivitySessionRequest } from '@/lib/api/activity';

function toDateTimeLocalValue(value?: string): string {
    if (!value) return '';
    const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
    return normalized.slice(0, 16);
}

function toApiLocalDateTime(value: string): string | undefined {
    if (!value) return undefined;
    return `${value}:00`;
}

export default function EditActivityPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const activityId = params.id as string;
    const { t } = useSafeTranslation('activities');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sessionForms, setSessionForms] = useState<Array<{
        tempId: string;
        id?: string;
        title: string;
        startTime: string;
        endTime: string;
        capacity: string;
        status: number;
        currentParticipants: number;
    }>>([]);
    const [form, setForm] = useState({
        title: '',
        topic: '',
        category: 1,
        signupPolicy: 1,
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        posterUrlsText: '',
        status: 1,
    });

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [detail, hostActivities, sessions] = await Promise.all([
                    activityApi.getActivityDetail(activityId),
                    activityApi.getMyHostActivities({ page: 1, size: 100 }),
                    activityApi.getActivitySessions(activityId).catch(() => []),
                ]);
                const hostActivity = hostActivities.items.find((item) => item.id === activityId);
                setForm({
                    title: detail.title || '',
                    topic: detail.summary || '',
                    category: hostActivity?.category || 1,
                    signupPolicy: 1,
                    startTime: toDateTimeLocalValue(detail.startTime),
                    endTime: toDateTimeLocalValue(detail.endTime),
                    location: detail.location || '',
                    description: detail.description || '',
                    posterUrlsText: (detail.posterUrls || []).join('\n'),
                    status: hostActivity?.status || 1,
                });
                setSessionForms(sessions.map((session, index) => ({
                    tempId: `${session.id || index}`,
                    id: session.id,
                    title: session.sessionName || '',
                    startTime: toDateTimeLocalValue(session.startTime),
                    endTime: toDateTimeLocalValue(session.endTime),
                    capacity: session.maxParticipants != null ? String(session.maxParticipants) : '',
                    status: session.status || 1,
                    currentParticipants: session.currentParticipants || 0,
                })));
            } catch (error) {
                console.error('Failed to load activity for edit:', error);
                alert(t('edit.loadFailed', 'Failed to load activity'));
                router.push(`/${locale}/host/activities`);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [activityId, locale, router, t]);

    const isInvalid = useMemo(() => {
        return !form.title.trim() || !form.startTime || !form.endTime;
    }, [form]);

    const handleSubmit = async () => {
        if (isInvalid) {
            alert(t('edit.fillRequired', 'Please complete required fields'));
            return;
        }
        const sessionsToSubmit: CreateOrUpdateActivitySessionRequest[] = [];
        for (const session of sessionForms) {
            const hasContent = !!session.id || !!session.title.trim() || !!session.startTime || !!session.endTime || !!session.capacity;
            if (!hasContent) continue;
            if (!session.startTime) {
                alert(t('edit.sessionStartRequired', 'Session start time is required'));
                return;
            }
            sessionsToSubmit.push({
                id: session.id,
                title: session.title.trim() || undefined,
                startTime: toApiLocalDateTime(session.startTime)!,
                endTime: toApiLocalDateTime(session.endTime),
                capacity: session.capacity ? Number(session.capacity) : undefined,
                status: session.status,
            });
        }
        try {
            setSubmitting(true);
            await activityApi.updateHostActivity(activityId, {
                title: form.title.trim(),
                topic: form.topic.trim() || undefined,
                category: form.category,
                signupPolicy: form.signupPolicy,
                startTime: toApiLocalDateTime(form.startTime),
                endTime: toApiLocalDateTime(form.endTime),
                location: form.location.trim() || undefined,
                description: form.description.trim() || undefined,
                posterUrls: form.posterUrlsText
                    .split('\n')
                    .map((x) => x.trim())
                    .filter(Boolean),
                status: form.status,
            });
            if (sessionsToSubmit.length > 0) {
                await activityApi.createOrUpdateHostActivitySessions(activityId, sessionsToSubmit);
            }
            router.push(`/${locale}/host/activities`);
        } catch (error) {
            console.error('Failed to update activity:', error);
            alert(t('edit.saveFailed', 'Failed to save activity'));
        } finally {
            setSubmitting(false);
        }
    };

    const addSession = () => {
        setSessionForms((prev) => [
            ...prev,
            {
                tempId: `new-${Date.now()}`,
                title: '',
                startTime: '',
                endTime: '',
                capacity: '',
                status: 1,
                currentParticipants: 0,
            },
        ]);
    };

    const updateSessionField = (
        tempId: string,
        field: 'title' | 'startTime' | 'endTime' | 'capacity' | 'status',
        value: string | number
    ) => {
        setSessionForms((prev) =>
            prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
        );
    };

    const removeSession = (tempId: string) => {
        setSessionForms((prev) => prev.filter((item) => item.tempId !== tempId));
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-4 py-10 text-slate-600">{t('loading', 'Loading...')}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="text-2xl font-semibold text-slate-800 mb-6">{t('edit.title', 'Edit Activity')}</h1>

                <div className="space-y-5 bg-white border border-slate-200 rounded-xl p-6">
                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.title', 'Title')} *</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.category', 'Category')}</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.category}
                            onChange={(e) => setForm((prev) => ({ ...prev, category: Number(e.target.value) }))}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.topic', 'Topic')}</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.topic}
                            onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.signupPolicy', 'Signup Policy')}</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.signupPolicy}
                            onChange={(e) => setForm((prev) => ({ ...prev, signupPolicy: Number(e.target.value) }))}
                        >
                            <option value={1}>{t('edit.signupPolicy.auto', 'Auto approve')}</option>
                            <option value={2}>{t('edit.signupPolicy.review', 'Approval required')}</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.startTime', 'Start Time')} *</label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                value={form.startTime}
                                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.endTime', 'End Time')} *</label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                value={form.endTime}
                                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.location', 'Location')}</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.location}
                            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.description', 'Description')}</label>
                        <textarea
                            rows={5}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.posterUrls', 'Poster URLs (one per line)')}</label>
                        <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.posterUrlsText}
                            onChange={(e) => setForm((prev) => ({ ...prev, posterUrlsText: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-2">{t('edit.fields.status', 'Status')}</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={form.status}
                            onChange={(e) => setForm((prev) => ({ ...prev, status: Number(e.target.value) }))}
                        >
                            <option value={1}>{t('published', 'Published')}</option>
                            <option value={2}>{t('hidden', 'Hidden')}</option>
                            <option value={3}>{t('completed', 'Completed')}</option>
                        </select>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm text-slate-600">{t('edit.fields.sessions', 'Sessions')}</label>
                            <button
                                type="button"
                                onClick={addSession}
                                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                                {t('edit.addSession', 'Add Session')}
                            </button>
                        </div>

                        {sessionForms.length === 0 ? (
                            <p className="text-sm text-slate-500">{t('edit.noSessions', 'No sessions yet')}</p>
                        ) : (
                            <div className="space-y-4">
                                {sessionForms.map((session) => (
                                    <div key={session.tempId} className="p-4 border border-slate-200 rounded-lg space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">{t('edit.sessionTitle', 'Session Title')}</label>
                                                <input
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                    value={session.title}
                                                    onChange={(e) => updateSessionField(session.tempId, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">{t('edit.sessionCapacity', 'Capacity')}</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                    value={session.capacity}
                                                    onChange={(e) => updateSessionField(session.tempId, 'capacity', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">{t('edit.sessionStart', 'Session Start')} *</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                    value={session.startTime}
                                                    onChange={(e) => updateSessionField(session.tempId, 'startTime', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">{t('edit.sessionEnd', 'Session End')}</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                    value={session.endTime}
                                                    onChange={(e) => updateSessionField(session.tempId, 'endTime', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">{t('edit.sessionStatus', 'Session Status')}</label>
                                                <select
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                    value={session.status}
                                                    onChange={(e) => updateSessionField(session.tempId, 'status', Number(e.target.value))}
                                                >
                                                    <option value={1}>{t('edit.sessionEnabled', 'Enabled')}</option>
                                                    <option value={2}>{t('edit.sessionDisabled', 'Disabled')}</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <p className="text-xs text-slate-500">
                                                    {t('edit.currentParticipants', 'Current participants')}: {session.currentParticipants}
                                                </p>
                                                {!session.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSession(session.tempId)}
                                                        className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                                                    >
                                                        {t('remove', 'Remove')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-4 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60"
                        >
                            {submitting ? t('saving', 'Saving...') : t('save', 'Save')}
                        </button>
                        <button
                            onClick={() => router.push(`/${locale}/host/activities`)}
                            disabled={submitting}
                            className="px-4 py-2 border border-slate-200 rounded-lg"
                        >
                            {t('cancel', 'Cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
