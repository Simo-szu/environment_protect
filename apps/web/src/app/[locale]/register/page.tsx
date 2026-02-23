'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/components/GoogleProvider';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useTheme } from 'next-themes';
import Layout from '@/components/Layout';
import { authApi, userApi } from '@/lib/api';
import {
    Smartphone,
    Lock,
    Eye,
    EyeOff,
    Mail
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';


export default function RegisterPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('auth');


    const [formData, setFormData] = useState({
        email: '',
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
    const config = useConfig();
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const googleBtnContainerRef = useRef<HTMLDivElement>(null);
    const [googleBtnWidth, setGoogleBtnWidth] = useState<number>(0);

    // 倒计时效果
    useEffect(() => {
        setMounted(true);
        const updateWidth = () => {
            if (googleBtnContainerRef.current) {
                setGoogleBtnWidth(googleBtnContainerRef.current.clientWidth);
            }
        };

        const timer = setTimeout(updateWidth, 50);
        window.addEventListener('resize', updateWidth);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // 发送验证码
    const handleSendOtp = async () => {
        if (!formData.email.trim()) {
            setError(t('register.errors.emailRequired', '请输入邮箱'));
            return;
        }

        try {
            setSendingOtp(true);
            setError('');

            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

            if (!isEmail) {
                setError(t('register.errors.invalidEmail', '请输入正确的邮箱'));
                return;
            }

            await authApi.sendEmailOtp(formData.email, 'register');

            setCountdown(60);
            alert(t('register.otpSent', '验证码已发送'));
        } catch (error: any) {
            console.error('Failed to send OTP:', error);
            setError(error.message || t('register.errors.otpSendFailed', '发送验证码失败'));
        } finally {
            setSendingOtp(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            if (!credentialResponse.credential) {
                throw new Error('No credential received');
            }
            // 注册也走 unify login 接口逻辑，后端会自动创建
            await authApi.loginWithGoogle(credentialResponse.credential);

            const userProfile = await userApi.getMyProfile();
            login(userProfile);
            router.push(`/${locale}`);
        } catch (error: any) {
            console.error('Google Register Error:', error);
            setError(error.message || t('register.errors.googleRegisterFailed', 'Google 注册失败，请重试'));
        }
    };

    const handleGoogleError = () => {
        console.error('Google Register Error: User cancelled or error occurred');
        // 不显示错误信息，因为用户可能只是取消了注册
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email.trim()) {
            setError(t('register.errors.emailRequired', '请输入邮箱'));
            return;
        }

        // 验证验证码
        if (!formData.otpCode.trim()) {
            setError(t('register.errors.otpRequired', '请输入验证码'));
            return;
        }

        if (formData.otpCode.length !== 6) {
            setError(t('register.errors.invalidOtp', '验证码必须为6位'));
            return;
        }

        // 验证密码
        if (!formData.password.trim() || !formData.confirmPassword.trim()) {
            setError(t('register.errors.passwordRequired', '请填写完整的注册信息'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(t('register.errors.passwordMismatch', '两次输入的密码不一致'));
            return;
        }

        if (formData.password.length < 8) {
            setError(t('register.errors.passwordTooShort', '密码至少8位字符'));
            return;
        }

        if (formData.password.length > 32) {
            setError(t('register.errors.passwordTooLong', '密码不能超过32位字符'));
            return;
        }

        if (!formData.terms) {
            setError(t('register.errors.agreeToTerms', '请同意用户协议和隐私政策'));
            return;
        }

        try {
            setSubmitting(true);

            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

            if (!isEmail) {
                setError(t('register.errors.invalidEmail', '请输入正确的邮箱'));
                return;
            }

            // 调用注册 API (后端要求: email + otpCode + password + agreedToTerms)
            await authApi.registerWithEmail({
                email: formData.email,
                password: formData.password,
                otpCode: formData.otpCode,
                nickname: formData.nickname || undefined,
                agreedToTerms: formData.terms
            });


            // 获取用户信息
            const userProfile = await userApi.getMyProfile();
            login(userProfile);

            // 跳转到首页
            router.push(`/${locale}`);
        } catch (error: any) {
            console.error('Register failed:', error);

            // 优化错误提示
            if (error.message?.includes('已被注册') || error.message?.includes('already exists')) {
                setError('该邮箱已被注册。您可能已通过Google登录或邮箱注册过账号,请直接登录。');
            } else if (error.message?.includes('验证码')) {
                setError(error.message || '验证码错误或已过期,请重新获取');
            } else {
                setError(error.message || t('register.errors.registerFailed', '注册失败,请重试'));
            }
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
        <Layout showHeader={true} showFooter={true}>
            <div className="min-h-screen flex items-center justify-center p-4">
                {/* Register Card */}
                <div className="w-full max-w-[440px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/40 dark:border-slate-800">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center shadow-lg shadow-[#56B949]/20 mb-4 ring-4 ring-white/50 dark:ring-slate-800/50">
                            <span className="font-serif font-bold text-2xl text-white">YL</span>
                        </div>
                        <div className="text-[#30499B] dark:text-white font-bold text-xl tracking-wide">YouthLoop</div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                            {t('register.subtitle', '加入我们，开启绿色生活新篇章')}
                        </p>
                    </div>

                    {/* Register Form */}
                    <div className="space-y-6">
                        <div className="flex items-baseline justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#30499B] dark:text-white">
                                {t('register.title', '注册')}
                            </h2>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t('register.hasAccount', '已有账号？')}{' '}
                                <Link href={`/${locale}/login`} className="text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] transition-colors underline decoration-dotted underline-offset-2">
                                    {t('register.loginNow', '马上登录')}
                                </Link>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    <div>{error}</div>
                                    {(error.includes('已被注册') || error.includes('already exists')) && (
                                        <Link
                                            href={`/${locale}/login`}
                                            className="inline-block mt-2 text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] font-medium underline"
                                        >
                                            前往登录 →
                                        </Link>
                                    )}
                                </div>
                            )}

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('register.emailPlaceholder', '邮箱地址')}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/10 focus:border-[#30499B] dark:focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
                                    disabled={submitting}
                                />
                            </div>


                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    placeholder={t('register.nicknamePlaceholder', '昵称（选填）')}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/10 focus:border-[#30499B] dark:focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
                                    disabled={submitting}
                                />
                            </div>


                            {/* 验证码输入 */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="otpCode"
                                    value={formData.otpCode}
                                    onChange={handleChange}
                                    placeholder={t('register.otpPlaceholder', '请输入验证码')}
                                    className="w-full pl-10 pr-28 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/10 focus:border-[#30499B] dark:focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
                                    disabled={submitting}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || countdown > 0 || submitting}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed"
                                >
                                    {sendingOtp ? t('register.sendingOtp', '发送中...') : countdown > 0 ? t('register.retryAfter', '{seconds}秒后重试').replace('{seconds}', countdown.toString()) : t('register.getOtp', '获取验证码')}
                                </button>
                            </div>

                            {/* 密码输入 */}
                            <div className="space-y-2">
                                <div className="text-xs text-slate-400 dark:text-slate-500 px-1">{t('register.passwordHint', '密码需在8位以上,由数字、字母组成')}</div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={t('register.passwordPlaceholder', '设置密码(8-32位字符)')}
                                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/10 focus:border-[#30499B] dark:focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* 确认密码 */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder={t('register.confirmPasswordPlaceholder', '确认密码')}
                                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/10 focus:border-[#30499B] dark:focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
                                    disabled={submitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                <label htmlFor="terms" className="text-sm text-slate-500 dark:text-slate-400 select-none cursor-pointer leading-relaxed">
                                    {t('register.agreeTerms', '我已阅读并同意')}
                                    <Link href={`/${locale}/terms`} className="text-[#30499B] dark:text-[#56B949] hover:underline hover:text-[#56B949] dark:hover:text-[#4aa840] ml-1">
                                        {t('register.userAgreement', '《用户服务协议》')}
                                    </Link>
                                    {t('register.and', '和')}
                                    <Link href={`/${locale}/privacy`} className="text-[#30499B] dark:text-[#56B949] hover:underline hover:text-[#56B949] dark:hover:text-[#4aa840] ml-1">
                                        {t('register.privacyPolicy', '《隐私政策》')}
                                    </Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-[#30499B] hover:bg-[#253a7a] text-white rounded-lg font-medium shadow-lg shadow-[#30499B]/20 hover:shadow-xl hover:shadow-[#30499B]/30 transition-all active:scale-[0.98] text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? t('register.registering', '注册中...') : t('register.registerButton', '立即注册')}
                            </button>

                            {/* 原本在这里的 GoogleLogin 移除到 divider 下方 */}


                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                            <span className="px-4 text-sm text-slate-400 dark:text-slate-500">{t('register.orGoogleRegister', '或者使用 Google 注册')}</span>
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                        </div>

                        <div className="w-full flex justify-center -mt-2" ref={googleBtnContainerRef}>
                            {mounted && googleBtnWidth > 0 && (
                                <GoogleLogin
                                    key={`${resolvedTheme}-${googleBtnWidth}`}
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    text="signup_with"
                                    width={googleBtnWidth.toString()}
                                    theme={resolvedTheme === 'dark' ? "filled_black" : "outline"}
                                    shape="rectangular"
                                    auto_select={false}
                                    cancel_on_tap_outside={true}
                                />
                            )}
                        </div>

                        {/* Quick Register Tip */}
                        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                            <p>{t('register.registerTip', '注册需要邮箱验证码和密码')}</p>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
}