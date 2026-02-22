'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import type { AdminHostVerificationItem } from '@/lib/api/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const PAGE_SIZE = 20;

export function AdminVerificationsTab() {
  const { t } = useSafeTranslation('admin');

  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<number | undefined>(1);
  const [verifications, setVerifications] = useState<AdminHostVerificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const [reviewUserId, setReviewUserId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<2 | 3 | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadVerifications = useCallback(async (p: number = page) => {
    try {
      setLoading(true);
      const r = await adminApi.getAdminHostVerifications({ status: verificationStatus, page: p, size: PAGE_SIZE });
      setVerifications(r.items);
      setTotal(r.total);
    } catch (error) {
      console.error('Failed to load verifications:', error);
    } finally {
      setLoading(false);
    }
  }, [verificationStatus, page]);

  useEffect(() => {
    loadVerifications(page);
  }, [page, verificationStatus]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleStatusChange = (v: string) => {
    setVerificationStatus(v ? Number(v) : undefined);
    setPage(1);
  };

  const openReviewDialog = (userId: string, status: 2 | 3) => {
    setReviewUserId(userId);
    setReviewStatus(status);
    setReviewNote('');
  };

  const submitReview = async () => {
    if (!reviewUserId || !reviewStatus) return;
    try {
      setSubmitting(true);
      await adminApi.reviewAdminHostVerification(reviewUserId, {
        status: reviewStatus,
        reviewNote: reviewNote || undefined
      });
      setReviewUserId(null);
      setReviewStatus(null);
      await loadVerifications(page);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(t('verifications.reviewFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Controls */}
      <div className="relative z-30 flex flex-col sm:flex-row items-center gap-4 bg-white/60 p-4 rounded-3xl border border-slate-200 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">{t('verifications.status')}</span>
          <Select
            value={verificationStatus?.toString() ?? ''}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('verifications.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('verifications.all')}</SelectItem>
              <SelectItem value="1">{t('verifications.pending')}</SelectItem>
              <SelectItem value="2">{t('verifications.approved')}</SelectItem>
              <SelectItem value="3">{t('verifications.rejected')}</SelectItem>
              <SelectItem value="4">{t('verifications.revoked')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => loadVerifications(page)}
          disabled={loading}
          className="px-4 py-2 ml-auto text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? t('loading') : t('refresh')}
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && verifications.length === 0 && (
          <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-500">{t('loading')}</div>
        )}

        {!loading && verifications.length === 0 && (
          <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-slate-500 bg-white/40 rounded-3xl border border-slate-100 border-dashed">
            <div className="text-4xl mb-3 opacity-50">📂</div>
            <p>{t('noRecords')}</p>
          </div>
        )}

        {verifications.map((item) => (
          <div
            key={item.userId}
            className="group flex flex-col p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent opacity-50 pointer-events-none rounded-tr-3xl" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-800 tracking-tight leading-tight">{item.orgName}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <span>🧑‍💼 {item.contactName}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span>📱 {item.contactPhone}</span>
                </div>
              </div>
              <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${item.status === 1 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                item.status === 2 ? 'bg-green-50 text-green-600 border-green-200' :
                  item.status === 3 ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                {item.status === 1 ? t('verifications.pending') :
                  item.status === 2 ? t('verifications.approved') :
                    item.status === 3 ? t('verifications.rejected') :
                      t('verifications.revoked')}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-medium">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'}
              </div>
              <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openReviewDialog(item.userId, 2)}
                  disabled={item.status !== 1}
                  className="px-4 py-1.5 text-sm font-medium bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-green-50 disabled:hover:text-green-600"
                >
                  {t('approve')}
                </button>
                <button
                  onClick={() => openReviewDialog(item.userId, 3)}
                  disabled={item.status !== 1}
                  className="px-4 py-1.5 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-red-50 disabled:hover:text-red-600"
                >
                  {t('reject')}
                </button>
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

      {/* Review Dialog */}
      <Dialog open={!!reviewUserId} onOpenChange={(open) => !open && setReviewUserId(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-6 border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {reviewStatus === 2 ? t('verifications.approvalNote') : t('verifications.rejectReason')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B]/30 transition-all min-h-32 text-slate-700 resize-none"
              placeholder={t('verifications.reviewNotePlaceholder', '填写备注或原因...')}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setReviewUserId(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              {t('cancel', '取消')}
            </button>
            <button
              onClick={submitReview}
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors ${reviewStatus === 2 ? 'bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-sm shadow-red-600/20'
                } disabled:opacity-60`}
            >
              {submitting ? t('loading', '提交中...') : t('save', '确认')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
