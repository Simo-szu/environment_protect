'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { activityApi } from '@/lib/api';
import type { HostActivityItem, HostActivitySignupItem } from '@/lib/api/activity';
import {
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Edit,
    Trash2,
    ArrowLeft,
    Plus,
    MapPin,
    UserCheck
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

type ActivityTab = 'activities' | 'signups';
type ActivityUiStatus = 'published' | 'hidden' | 'completed';
type SignupUiStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface SignupViewItem extends HostActivitySignupItem {
    activityId: string;
    activityTitle: string;
}

function mapActivityStatus(status: number): ActivityUiStatus {
    if (status === 1) return 'published';
    if (status === 2) return 'hidden';
    return 'completed';
}

function mapSignupStatus(status: number): SignupUiStatus {
    if (status === 1) return 'pending';
    if (status === 2) return 'approved';
    if (status === 3) return 'rejected';
    return 'cancelled';
}

export default function HostActivitiesPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('host');

    const [activeTab, setActiveTab] = useState<ActivityTab>('activities');
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [signupStatusFilter, setSignupStatusFilter] = useState<number | undefined>(undefined);
    const [myActivities, setMyActivities] = useState<HostActivityItem[]>([]);
    const [signups, setSignups] = useState<SignupViewItem[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [loadingSignups, setLoadingSignups] = useState(false);
    const [processingSignupId, setProcessingSignupId] = useState<string | null>(null);

    const loadActivities = useCallback(async () => {
        setLoadingActivities(true);
        try {
            const result = await activityApi.getMyHostActivities({ page: 1, size: 100 });
            setMyActivities(result.items);
            if (!selectedActivity && result.items.length > 0) {
                setSelectedActivity(result.items[0].id);
            }
        } catch (error) {
            console.error('Failed to load host activities:', error);
            alert(t('loadActivitiesFailed', 'Failed to load your activities'));
        } finally {
            setLoadingActivities(false);
        }
    }, [selectedActivity, t]);

    const loadSignups = useCallback(async (activityId: string, status?: number) => {
        setLoadingSignups(true);
        try {
            const result = await activityApi.getHostActivitySignups(activityId, { status, page: 1, size: 100 });
            const activityTitle = myActivities.find((item) => item.id === activityId)?.title || '';
            setSignups(result.items.map((item) => ({
                ...item,
                activityId,
                activityTitle,
            })));
        } catch (error) {
            console.error('Failed to load host signups:', error);
            alert(t('loadSignupsFailed', 'Failed to load signup list'));
            setSignups([]);
        } finally {
            setLoadingSignups(false);
        }
    }, [myActivities, t]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    useEffect(() => {
        if (activeTab !== 'signups') return;
        if (!selectedActivity) {
            setSignups([]);
            return;
        }
        loadSignups(selectedActivity, signupStatusFilter);
    }, [activeTab, selectedActivity, signupStatusFilter, loadSignups]);

    const totalSignupCount = useMemo(
        () => myActivities.reduce((sum, activity) => sum + (activity.signupCount || 0), 0),
        [myActivities]
    );

    const pendingSignupCount = useMemo(
        () => signups.filter((signup) => mapSignupStatus(signup.status) === 'pending').length,
        [signups]
    );

    const getActivityStatusBadge = (status: number) => {
        const key = mapActivityStatus(status);
        const statusConfig = {
            published: { text: t('published', 'Published'), color: 'bg-green-50 text-green-600' },
            hidden: { text: t('hidden', 'Hidden'), color: 'bg-slate-100 text-slate-600' },
            completed: { text: t('completed', 'Completed'), color: 'bg-blue-50 text-blue-600' },
        };
        const config = statusConfig[key];
        return <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{config.text}</span>;
    };

    const getSignupStatusBadge = (status: number) => {
        const key = mapSignupStatus(status);
        const statusConfig = {
            pending: { text: t('pending', 'Pending'), color: 'bg-yellow-50 text-yellow-600' },
            approved: { text: t('approved', 'Approved'), color: 'bg-green-50 text-green-600' },
            rejected: { text: t('rejected', 'Rejected'), color: 'bg-red-50 text-red-600' },
            cancelled: { text: t('cancelled', 'Cancelled'), color: 'bg-slate-100 text-slate-600' },
        };
        const config = statusConfig[key];
        return <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{config.text}</span>;
    };

    const handleApproveSignup = async (signup: SignupViewItem) => {
        try {
            setProcessingSignupId(signup.id);
            const auditNote = window.prompt(t('approveNotePrompt', 'Optional approval note:'), '') || undefined;
            await activityApi.approveHostSignup(signup.activityId, signup.id, { auditNote });
            await loadSignups(signup.activityId, signupStatusFilter);
        } catch (error) {
            console.error('Failed to approve signup:', error);
            alert(t('approveFailed', 'Failed to approve signup'));
        } finally {
            setProcessingSignupId(null);
        }
    };

    const handleRejectSignup = async (signup: SignupViewItem) => {
        try {
            setProcessingSignupId(signup.id);
            const auditNote = window.prompt(t('rejectNotePrompt', 'Optional reject reason:'), '') || undefined;
            await activityApi.rejectHostSignup(signup.activityId, signup.id, { auditNote });
            await loadSignups(signup.activityId, signupStatusFilter);
        } catch (error) {
            console.error('Failed to reject signup:', error);
            alert(t('rejectFailed', 'Failed to reject signup'));
        } finally {
            setProcessingSignupId(null);
        }
    };

    const handleEditActivity = (activityId: string) => {
        router.push(`/${locale}/activities/${activityId}/edit`);
    };

    const handleDeleteActivity = () => {
        alert(t('deleteNotSupported', 'Delete activity is not supported by backend yet'));
    };

    const handleViewActivity = (activityId: string) => {
        router.push(`/${locale}/activities/${activityId}`);
    };

    return (
        <Layout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4 mb-8">
                    <div className="flex items-start sm:items-center gap-4">
                        <button
                            onClick={() => router.push(`/${locale}/profile`)}
                            className="p-2 sm:mt-0 mt-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 shrink-0" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-[#30499B] to-[#253a7a] dark:from-[#56B949] dark:to-[#4aa840] rounded-xl shrink-0">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#30499B] dark:text-[#56B949]">
                                    {t('title', 'Activity Management')}
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-0">
                                    {t('subtitle', 'Manage your hosted activities and signup reviews')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/${locale}/activities/create`)}
                        className="w-full sm:w-auto justify-center px-4 py-3 sm:py-2 bg-[#30499B] dark:bg-[#56B949] hover:bg-[#253a7a] dark:hover:bg-[#4aa840] text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {t('createActivity', 'Create Activity')}
                    </button>
                </div>

                <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <motion.div variants={staggerItem} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{myActivities.length}</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalActivities', 'Hosted Activities')}</h3>
                    </motion.div>

                    <motion.div variants={staggerItem} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalSignupCount}</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalSignups', 'Total Signups')}</h3>
                    </motion.div>

                    <motion.div variants={staggerItem} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingSignupCount}</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('pendingSignups', 'Pending Signups')}</h3>
                    </motion.div>
                </motion.div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex gap-2">
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'activities'
                            ? 'bg-[#30499B] dark:bg-[#56B949] text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {t('myActivities', 'My Activities')}
                    </button>
                    <button
                        onClick={() => setActiveTab('signups')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'signups'
                            ? 'bg-[#30499B] dark:bg-[#56B949] text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <UserCheck className="w-4 h-4 inline mr-2" />
                        {t('signupManagement', 'Signup Management')}
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    {activeTab === 'activities' && (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loadingActivities ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p>{t('loading', 'Loading...')}</p>
                                </div>
                            ) : myActivities.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('noActivities', 'No hosted activities yet')}</p>
                                    <button
                                        onClick={() => router.push(`/${locale}/activities/create`)}
                                        className="mt-4 px-4 py-2 bg-[#30499B] dark:bg-[#56B949] text-white rounded-lg hover:bg-[#253a7a] dark:hover:bg-[#4aa840] transition-colors"
                                    >
                                        {t('createFirst', 'Create your first activity')}
                                    </button>
                                </div>
                            ) : (
                                myActivities.map((activity) => (
                                    <div key={activity.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                            <div className="flex-1 w-full">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                                        {activity.title}
                                                    </h3>
                                                    {getActivityStatusBadge(activity.status)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {activity.startTime}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {activity.location || t('locationUnknown', 'No location')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {activity.signupCount}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 dark:border-slate-700">
                                                <button
                                                    onClick={() => handleViewActivity(activity.id)}
                                                    className="p-2 block text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                    title={t('view', 'View')}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditActivity(activity.id)}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                    title={t('edit', 'Edit')}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={handleDeleteActivity}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                                    title={t('delete', 'Delete')}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'signups' && (
                        <div>
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <select
                                        value={selectedActivity || ''}
                                        onChange={(e) => setSelectedActivity(e.target.value || null)}
                                        className="w-full md:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20"
                                    >
                                        <option value="" className="dark:bg-slate-800">{t('selectActivity', 'Select an activity')}</option>
                                        {myActivities.map((activity) => (
                                            <option key={activity.id} value={activity.id} className="dark:bg-slate-800">
                                                {activity.title}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={signupStatusFilter ?? ''}
                                        onChange={(e) => setSignupStatusFilter(e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full md:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20"
                                    >
                                        <option value="" className="dark:bg-slate-800">{t('allStatus', 'All status')}</option>
                                        <option value="1" className="dark:bg-slate-800">{t('pending', 'Pending')}</option>
                                        <option value="2" className="dark:bg-slate-800">{t('approved', 'Approved')}</option>
                                        <option value="3" className="dark:bg-slate-800">{t('rejected', 'Rejected')}</option>
                                        <option value="4" className="dark:bg-slate-800">{t('cancelled', 'Cancelled')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                {!selectedActivity ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>{t('selectActivityHint', 'Select one activity to view signups')}</p>
                                    </div>
                                ) : loadingSignups ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <p>{t('loading', 'Loading...')}</p>
                                    </div>
                                ) : signups.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>{t('noSignups', 'No signup records')}</p>
                                    </div>
                                ) : (
                                    signups.map((signup) => (
                                        <div key={signup.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                                <div className="flex-1 w-full">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {signup.realName || signup.nickname || t('anonymous', 'User')}
                                                        </h4>
                                                        {getSignupStatusBadge(signup.status)}
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-2">
                                                        <p>{t('activity', 'Activity')}: {signup.activityTitle}</p>
                                                        {signup.sessionTitle && <p>{t('session', 'Session')}: {signup.sessionTitle}</p>}
                                                        <p>{t('contact', 'Contact')}: {signup.phone || '-'} / {signup.email || '-'}</p>
                                                        <p>{t('appliedAt', 'Applied At')}: {signup.createdAt}</p>
                                                        {signup.auditNote && (
                                                            <p className="text-slate-500">{t('note', 'Note')}: {signup.auditNote}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {mapSignupStatus(signup.status) === 'pending' && (
                                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 dark:border-slate-700">
                                                        <button
                                                            onClick={() => handleApproveSignup(signup)}
                                                            disabled={processingSignupId === signup.id}
                                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                                                        >
                                                            <CheckCircle className="w-4 h-4 shrink-0" />
                                                            <span>{t('approve', 'Approve')}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectSignup(signup)}
                                                            disabled={processingSignupId === signup.id}
                                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                                                        >
                                                            <XCircle className="w-4 h-4 shrink-0" />
                                                            <span>{t('reject', 'Reject')}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </Layout>
    );
}
