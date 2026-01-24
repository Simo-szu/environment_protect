'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { authApi, userApi } from '@/lib/api';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Smartphone,
    ScanLine
} from 'lucide-react';

export default function LoginPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('auth');

    const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        otpCode: '',
        remember: false
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { login } = useAuth();
    const router = useRouter();

    // 倒计时效果
    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // 发送验证码
    const handleSendOtp = async () => {
        if (!formData.username.trim()) {
            setError('请输入手机号或邮箱');
            return;
        }

        try {
            setSendingOtp(true);
            setError('');

            // 判断是手机号还是邮箱
            const isPhone = /^1[3-9]\d{9}$/.test(formData.username);
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username);

            if (!isPhone && !isEmail) {
                setError('请输入正确的手机号或邮箱');
                return;
            }

            if (isPhone) {
                await authApi.sendPhoneOtp(formData.username);
            } else {
                await authApi.sendEmailOtp(formData.username);
            }

            setOtpSent(true);
            setCountdown(60);
            alert('验证码已发送');
        } catch (error: any) {
            console.error('Failed to send OTP:', error);
            setError(error.message || '发送验证码失败');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username.trim()) {
            setError('请输入手机号或邮箱');
            return;
        }

        if (loginMode === 'password' && !formData.password.trim()) {
            setError('请输入密码');
            return;
        }

        if (loginMode === 'otp' && !formData.otpCode.trim()) {
            setError('请输入验证码');
            return;
        }

        try {
            setSubmitting(true);

            // 判断是手机号还是邮箱
            const isPhone = /^1[3-9]\d{9}$/.test(formData.username);
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username);

            if (!isPhone && !isEmail) {
                setError('请输入正确的手机号或邮箱');
                return;
            }

            // 调用登录 API
            if (loginMode === 'password') {
                await authApi.loginWithPassword({
                    email: isEmail ? formData.username : undefined,
                    phone: isPhone ? formData.username : undefined,
                    password: formData.password
                });
            } else {
                await authApi.loginWithOtp({
                    email: isEmail ? formData.username : undefined,
                    phone: isPhone ? formData.username : undefined,
                    otpCode: formData.otpCode
                });
            }

            // 获取用户信息
            const userProfile = await userApi.getMyProfile();
            login(userProfile);

            // 跳转到首页
            router.push(`/${locale}`);
        } catch (error: any) {
            console.error('Login failed:', error);
            setError(error.message || '登录失败，请检查账号密码');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <Layout showHeader={false} showFooter={false}>
            <div className="min-h-screen flex items-center justify-center p-4">
                {/* Back Button */}
                <Link
                    href={`/${locale}`}
                    className="absolute top-6 left-6 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-400 hover:text-[#30499B] hover:bg-white transition-all shadow-sm border border-white/60"
                >
                    ←
                </Link>

                {/* Login Card */}
                <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/40">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center shadow-lg shadow-[#56B949]/20 mb-4 ring-4 ring-white/50">
                            <span className="font-serif font-bold text-2xl text-white">YL</span>
                        </div>
                        <div className="text-[#30499B] font-bold text-xl tracking-wide">YouthLoop</div>
                        <p className="text-slate-500 text-sm mt-2">
                            {t('welcome', '欢迎回来，继续你的环保之旅')}
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-6">
                        <div className="flex items-baseline justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#30499B]">
                                {t('login.title', '登录')}
                            </h2>
                            <div className="text-sm text-slate-500 font-medium">
                                {t('login.noAccount', '没有账号？')}{' '}
                                <Link href={`/${locale}/register`} className="text-[#30499B] hover:text-[#56B949] transition-colors underline decoration-dotted underline-offset-2">
                                    {t('login.registerNow', '立即注册')}
                                </Link>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#30499B] transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="手机号/邮箱"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                    disabled={submitting}
                                />
                            </div>

                            {loginMode === 'password' ? (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#30499B] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="请输入密码"
                                        className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#30499B] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="otpCode"
                                        value={formData.otpCode}
                                        onChange={handleChange}
                                        placeholder="请输入验证码"
                                        className="w-full pl-10 pr-28 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || countdown > 0 || submitting}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#30499B] hover:text-[#56B949] disabled:text-slate-400 disabled:cursor-not-allowed"
                                    >
                                        {sendingOtp ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => setLoginMode(loginMode === 'password' ? 'otp' : 'password')}
                                    className="text-sm text-[#30499B] hover:text-[#56B949] transition-colors"
                                >
                                    {loginMode === 'password' ? '验证码登录' : '密码登录'}
                                </button>
                                <a href="#" className="text-sm text-slate-400 hover:text-[#30499B] transition-colors">忘记密码?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-[#30499B] hover:bg-[#253a7a] text-white rounded-lg font-medium shadow-lg shadow-[#30499B]/20 hover:shadow-xl hover:shadow-[#30499B]/30 transition-all active:scale-[0.98] text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? '登录中...' : '立即登录'}
                            </button>

                            {/* 用户协议提示 */}
                            <div className="text-center text-xs text-slate-500 leading-relaxed">
                                {t('login.agreeTerms', '登录即代表同意')}{' '}
                                <Link
                                    href={`/${locale}/terms`}
                                    className="text-[#30499B] hover:text-[#56B949] transition-colors underline decoration-dotted underline-offset-2"
                                >
                                    {t('login.userAgreement', '《用户服务协议》')}
                                </Link>
                                {' '}{t('login.and', '和')}{' '}
                                <Link
                                    href={`/${locale}/privacy`}
                                    className="text-[#30499B] hover:text-[#56B949] transition-colors underline decoration-dotted underline-offset-2"
                                >
                                    {t('login.privacyPolicy', '《隐私政策》')}
                                </Link>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-400">
                                    {t('login.or', '或者')}
                                </span>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </Layout>
    );
}