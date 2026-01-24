'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
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

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.password) {
            setError(t('errors.fillComplete', '请填写完整的登录信息'));
            return;
        }

        // 模拟登录验证
        if (formData.username === 'demo' && formData.password === '123456') {
            const userData = {
                id: '1',
                username: formData.username,
                nickname: '环保达人',
                contact: formData.username,
                points: Math.floor(Math.random() * 1000) + 100,
                level: Math.floor(Math.random() * 5) + 1,
                avatar: undefined
            };

            login(userData);
            router.push(`/${locale}`);
        } else {
            setError(t('errors.invalidCredentials', '用户名或密码错误'));
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
                                    placeholder={t('login.usernamePlaceholder', '账号/手机号')}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#30499B] transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t('login.passwordPlaceholder', '请输入密码')}
                                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#30499B]/10 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-slate-300 text-[#30499B] focus:ring-[#30499B]/20 cursor-pointer"
                                    />
                                    <label htmlFor="remember" className="text-sm text-slate-500 select-none cursor-pointer">
                                        {t('login.rememberMe', '记住我')}
                                    </label>
                                </div>
                                <a href="#" className="text-sm text-slate-400 hover:text-[#30499B] transition-colors">
                                    {t('login.forgotPassword', '忘记密码?')}
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#30499B] hover:bg-[#253a7a] text-white rounded-lg font-medium shadow-lg shadow-[#30499B]/20 hover:shadow-xl hover:shadow-[#30499B]/30 transition-all active:scale-[0.98] text-sm tracking-wide"
                            >
                                {t('login.loginButton', '立即登录')}
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

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                <Smartphone className="w-4 h-4" />
                                {t('login.phoneVerification', '手机验证码')}
                            </button>
                            <button
                                onClick={() => alert(t('login.qrCodeDevelopment', '扫码登录功能开发中'))}
                                className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <ScanLine className="w-4 h-4" />
                                {t('login.qrCodeLogin', '扫码登录')}
                            </button>
                        </div>

                        {/* Demo Account Info */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">演示账户</h3>
                                <p className="text-xs text-blue-600">
                                    用户名: demo<br />
                                    密码: 123456
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}