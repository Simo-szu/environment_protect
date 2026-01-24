'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { authApi, userApi } from '@/lib/api';
import {
    Smartphone,
    Lock,
    Eye,
    EyeOff,
    Mail
} from 'lucide-react';

export default function RegisterPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('auth');

    const [registerMode, setRegisterMode] = useState<'password' | 'otp'>('password');
    const [formData, setFormData] = useState({
        contact: '',
        password: '',
        confirmPassword: '',
        otpCode: '',
        nickname: '',
        terms: false
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
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
        if (!formData.contact.trim()) {
            setError('请输入手机号或邮箱');
            return;
        }

        try {
            setSendingOtp(true);
            setError('');

            // 判断是手机号还是邮箱
            const isPhone = /^1[3-9]\d{9}$/.test(formData.contact);
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact);

            if (!isPhone && !isEmail) {
                setError('请输入正确的手机号或邮箱');
                return;
            }

            if (isPhone) {
                await authApi.sendPhoneOtp(formData.contact);
            } else {
                await authApi.sendEmailOtp(formData.contact);
            }

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

        if (!formData.contact.trim()) {
            setError('请输入手机号或邮箱');
            return;
        }

        if (registerMode === 'password') {
            if (!formData.password.trim() || !formData.confirmPassword.trim()) {
                setError('请填写完整的注册信息');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('两次输入的密码不一致');
                return;
            }

            if (formData.password.length < 8) {
                setError('密码长度至少8位');
                return;
            }
        } else {
            if (!formData.otpCode.trim()) {
                setError('请输入验证码');
                return;
            }
        }

        if (!formData.terms) {
            setError(t('errors.agreeToTerms', '请同意用户协议和隐私政策'));
            return;
        }

        try {
            setSubmitting(true);

            // 判断是手机号还是邮箱
            const isPhone = /^1[3-9]\d{9}$/.test(formData.contact);
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact);

            if (!isPhone && !isEmail) {
                setError('请输入正确的手机号或邮箱');
                return;
            }

            // 调用注册 API
            if (isPhone) {
                await authApi.registerWithPhone({
                    phone: formData.contact,
                    password: registerMode === 'password' ? formData.password : undefined,
                    otpCode: registerMode === 'otp' ? formData.otpCode : undefined,
                    nickname: formData.nickname || undefined,
                    agreedToTerms: formData.terms
                });
            } else {
                await authApi.registerWithEmail({
                    email: formData.contact,
                    password: registerMode === 'password' ? formData.password : undefined,
                    otpCode: registerMode === 'otp' ? formData.otpCode : undefined,
                    nickname: formData.nickname || undefined,
                    agreedToTerms: formData.terms
                });
            }

            // 获取用户信息
            const userProfile = await userApi.getMyProfile();
            login(userProfile);

            // 跳转到首页
            router.push(`/${locale}`);
        } catch (error: any) {
            console.error('Register failed:', error);
            setError(error.message || '注册失败，请重试');
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

                {/* Register Card */}
                <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/40">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center shadow-lg shadow-[#56B949]/20 mb-4 ring-4 ring-white/50">
                            <span className="font-serif font-bold text-2xl text-white">YL</span>
                        </div>
                        <div className="text-[#30499B] font-bold text-xl tracking-wide">YouthLoop</div>
                        <p className="text-slate-500 text-sm mt-2">
                            {t('register.subtitle', '加入我们，开启绿色生活新篇章')}
                        </p>
                    </div>

                    {/* Register Form */}
                    <div className="space-y-6">
                        <div className="flex items-baseline justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#30499B]">
                                {t('register.title', '注册')}
                            </h2>
                            <div className="text-sm text-slate-500 font-medium">
                                {t('register.hasAccount', '已有账号？')}{' '}
                                <Link href={`/${locale}/login`} className="text-[#30499B] hover:text-[#56B949] transition-colors underline decoration-dotted underline-offset-2">
                                    {t('register.loginNow', '马上登录')}
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
                                    <Smartphone className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    placeholder="手机号/邮箱"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#30499B] transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    placeholder="昵称（选填）"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                    disabled={submitting}
                                />
                            </div>

                            {registerMode === 'password' ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="text-xs text-slate-400 px-1">密码需在8位以上，由数字、字母组成</div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#30499B] transition-colors">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="请输入登录密码"
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
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#30499B] transition-colors">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="请确认登录密码"
                                            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                            disabled={submitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </>
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
                                    onClick={() => setRegisterMode(registerMode === 'password' ? 'otp' : 'password')}
                                    className="text-sm text-[#30499B] hover:text-[#56B949] transition-colors"
                                >
                                    {registerMode === 'password' ? '验证码注册' : '密码注册'}
                                </button>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-slate-300 text-[#30499B] focus:ring-[#30499B]/20 cursor-pointer mt-0.5"
                                />
                                <label htmlFor="terms" className="text-sm text-slate-500 select-none cursor-pointer leading-relaxed">
                                    我已阅读并同意
                                    <Link href={`/${locale}/terms`} className="text-[#30499B] hover:underline ml-1">
                                        《用户服务协议》
                                    </Link>
                                    和
                                    <Link href={`/${locale}/privacy`} className="text-[#30499B] hover:underline ml-1">
                                        《隐私政策》
                                    </Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-[#30499B] hover:bg-[#253a7a] text-white rounded-lg font-medium shadow-lg shadow-[#30499B]/20 hover:shadow-xl hover:shadow-[#30499B]/30 transition-all active:scale-[0.98] text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? '注册中...' : '提交注册'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-400">或者</span>
                            </div>
                        </div>

                        {/* Quick Register Tip */}
                        <div className="text-center text-sm text-slate-500">
                            <p>支持手机号或邮箱注册</p>
                            <p className="text-xs mt-1">选择验证码注册更快捷</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}