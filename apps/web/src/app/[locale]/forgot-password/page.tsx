'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as string) || 'zh';

    const [account, setAccount] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');

    const handleSendOtp = async () => {
        if (!account.trim()) {
            setError('Please enter your email.');
            return;
        }
        try {
            setError('');
            setSendingOtp(true);
            await authApi.sendEmailOtp(account.trim(), 'reset_password');
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (e: any) {
            setError(e?.message || 'Failed to send verification code.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account.trim() || !otp.trim() || !newPassword.trim()) {
            setError('Please complete all fields.');
            return;
        }
        try {
            setError('');
            setSubmitting(true);
            await authApi.resetPassword({
                account: account.trim(),
                otp: otp.trim(),
                newPassword: newPassword.trim(),
            });
            alert('Password has been reset. Please log in again.');
            router.push(`/${locale}/login`);
        } catch (e: any) {
            setError(e?.message || 'Failed to reset password.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout showHeader showFooter>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <h1 className="text-2xl font-semibold text-[#30499B] mb-2">Reset Password</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Use email verification to set a new password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <input
                            type="email"
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                            placeholder="Email"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            disabled={submitting}
                        />

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="OTP code"
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={sendingOtp || countdown > 0 || submitting}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            >
                                {countdown > 0 ? `${countdown}s` : (sendingOtp ? 'Sending...' : 'Send OTP')}
                            </button>
                        </div>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            disabled={submitting}
                        />

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 bg-[#30499B] text-white rounded-lg disabled:opacity-60"
                        >
                            {submitting ? 'Submitting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-4 text-sm text-slate-500">
                        <Link href={`/${locale}/login`} className="text-[#30499B] hover:underline">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
