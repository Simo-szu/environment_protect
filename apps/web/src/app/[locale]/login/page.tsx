'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/components/GoogleProvider';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useTheme } from 'next-themes';
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
import { GoogleLogin } from '@react-oauth/google';


export default function LoginPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('auth');

    const [loginMode, setLoginMode] = useState<'password' | 'otp' | 'google'>('password');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otpCode: '',
        remember: false
    });
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { login } = useAuth();
    const config = useConfig();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const safeRedirect = redirect && redirect.startsWith('/') ? redirect : null;
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

        // 延迟执行以确保容器已经完成渲染并有了正确的宽度
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

    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(''), 3000);
        return () => clearTimeout(timer);
    }, [notice]);

    // 发送验证码
    const handleSendOtp = async () => {
        if (!formData.email.trim()) {
            setError(t('login.errors.emailRequired', '请输入邮箱'));
            return;
        }

        try {
            setSendingOtp(true);
            setError('');
            setNotice('');

            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

            if (!isEmail) {
                setError(t('login.errors.invalidEmail', '请输入正确的邮箱'));
                return;
            }

            await authApi.sendEmailOtp(formData.email, 'login');

            setOtpSent(true);
            setCountdown(60);
            setNotice(t('login.otpSent', '验证码已发送'));
        } catch (error: any) {
            console.error('Failed to send OTP:', error);
            setError(error.message || t('login.errors.otpSendFailed', '发送验证码失败'));
        } finally {
            setSendingOtp(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            if (!credentialResponse.credential) {
                throw new Error('No credential received');
            }

            await authApi.loginWithGoogle(credentialResponse.credential);

            const userProfile = await userApi.getMyProfile();
            login(userProfile);
            router.push(safeRedirect || `/${locale}`);
        } catch (error: any) {
            console.error('Google Login Error:', error);
            setError(error.message || t('login.errors.googleLoginFailed', 'Google 登录失败，请重试'));
        }
    };

    const handleGoogleError = () => {
        console.error('Google Login Error: User cancelled or error occurred');
        // 不显示错误信息，因为用户可能只是取消了登录
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email.trim()) {
            setError(t('login.errors.emailRequired', '请输入邮箱'));
            return;
        }

        if (loginMode === 'password' && !formData.password.trim()) {
            setError(t('login.errors.passwordRequired', '请输入密码'));
            return;
        }

        if (loginMode === 'otp' && !formData.otpCode.trim()) {
            setError(t('login.errors.otpRequired', '请输入验证码'));
            return;
        }

        try {
            setSubmitting(true);

            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

            if (!isEmail) {
                setError(t('login.errors.invalidEmail', '请输入正确的邮箱'));
                return;
            }

            // 调用登录 API
            if (loginMode === 'password') {
                await authApi.loginWithPassword({
                    email: formData.email,
                    password: formData.password
                });
            } else {
                await authApi.loginWithEmailOtp({
                    email: formData.email,
                    otpCode: formData.otpCode
                });
            }


            // 获取用户信息
            const userProfile = await userApi.getMyProfile();
            login(userProfile);

            // 跳转到首页
            router.push(safeRedirect || `/${locale}`);
        } catch (error: any) {
            console.error('Login failed:', error);

            // 优化错误提示
            if (loginMode === 'password' && (error.message?.includes('密码') || error.message?.includes('password'))) {
                setError(t('login.errors.wrongPassword', '密码错误。如果您是通过Google登录注册的,请使用Google登录或验证码登录。'));
            } else if (error.message?.includes('不存在') || error.message?.includes('not found')) {
                setError(t('login.errors.emailNotFound', '该邮箱尚未注册,请先注册账号。'));
            } else {
                setError(error.message || t('login.errors.loginFailed', '登录失败,请检查账号密码'));
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
                {/* Login Card */}
                <div className="w-full max-w-[440px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/40 dark:border-slate-800">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center shadow-lg shadow-[#56B949]/20 mb-4 ring-4 ring-white/50 dark:ring-slate-800/50">
                            <span className="font-serif font-bold text-2xl text-white">YL</span>
                        </div>
                        <div className="text-[#30499B] dark:text-white font-bold text-xl tracking-wide">YouthLoop</div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                            {t('welcome', '欢迎回来，继续你的环保之旅')}
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-6">
                        <div className="flex items-baseline justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#30499B] dark:text-white">
                                {t('login.title', '登录')}
                            </h2>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t('login.noAccount', '没有账号？')}{' '}
                                <Link href={`/${locale}/register`} className="text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] transition-colors underline decoration-dotted underline-offset-2">
                                    {t('login.registerNow', '立即注册')}
                                </Link>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {notice && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-lg text-sm">
                                    {notice}
                                </div>
                            )}

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('login.emailPlaceholder', '邮箱地址')}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/10 focus:border-[#30499B] dark:focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
                                    disabled={submitting}
                                />
                            </div>


                            {loginMode === 'password' ? (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={t('login.passwordPlaceholder', '请输入密码')}
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
                            ) : (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#30499B] dark:group-focus-within:text-[#56B949] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="otpCode"
                                        value={formData.otpCode}
                                        onChange={handleChange}
                                        placeholder={t('login.otpPlaceholder', '请输入验证码')}
                                        className="w-full pl-10 pr-28 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 dark:focus:ring-[#56B949]/10 focus:border-[#30499B] dark:focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || countdown > 0 || submitting}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed"
                                    >
                                        {sendingOtp
                                            ? t('login.sendingOtp', '发送中...')
                                            : countdown > 0
                                                ? t('login.retryAfter', '{seconds}秒后重试', { seconds: countdown })
                                                : t('login.getOtp', '获取验证码')}
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => setLoginMode(loginMode === 'password' ? 'otp' : 'password')}
                                    className="text-sm text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] transition-colors"
                                >
                                    {loginMode === 'password' ? t('login.otpLogin', '验证码登录') : t('login.passwordLogin', '密码登录')}
                                </button>
                                <Link href={`/${locale}/forgot-password`} className="text-sm text-slate-400 dark:text-slate-500 hover:text-[#30499B] dark:hover:text-[#56B949] transition-colors">{t('login.forgotPassword', 'Forgot password?')}</Link>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-[#30499B] hover:bg-[#253a7a] text-white rounded-lg font-medium shadow-lg shadow-[#30499B]/20 hover:shadow-xl hover:shadow-[#30499B]/30 transition-all active:scale-[0.98] text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? t('login.loggingIn', '登录中...') : t('login.loginButton', '立即登录')}
                            </button>

                            {/* Google Login 移动到 divider 下方 */}




                            {/* 用户协议提示 */}
                            <div className="text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {t('login.agreeTerms', '登录即代表同意')}{' '}
                                <Link
                                    href={`/${locale}/terms`}
                                    className="text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] transition-colors underline decoration-dotted underline-offset-2"
                                >
                                    {t('login.userAgreement', '《用户服务协议》')}
                                </Link>
                                {' '}{t('login.and', '和')}{' '}
                                <Link
                                    href={`/${locale}/privacy`}
                                    className="text-[#30499B] dark:text-[#56B949] hover:text-[#56B949] dark:hover:text-[#4aa840] transition-colors underline decoration-dotted underline-offset-2"
                                >
                                    {t('login.privacyPolicy', '《隐私政策》')}
                                </Link>
                            </div>
                        </form>

                        {/* Divider & Social Login */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                            <span className="px-4 text-sm text-slate-400 dark:text-slate-500">
                                {t('login.or', '或者使用 Google 登录')}
                            </span>
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                        </div>

                        <div className="w-full flex justify-center" ref={googleBtnContainerRef}>
                            {mounted && googleBtnWidth > 0 && config.googleClientId && (
                                <GoogleLogin
                                    key={`${resolvedTheme}-${googleBtnWidth}`}
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    width={googleBtnWidth.toString()}
                                    theme={resolvedTheme === 'dark' ? "filled_black" : "outline"}
                                    shape="rectangular"
                                    text="signin_with"
                                    auto_select={false}
                                    cancel_on_tap_outside={true}
                                />
                            )}
                        </div>

                        {/* Login Tips */}
                        <div className="text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
                            <p>{t('login.googleTip', '💡 提示:Google登录账号如需使用密码登录,请使用验证码登录或"忘记密码"功能设置密码')}</p>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
}
