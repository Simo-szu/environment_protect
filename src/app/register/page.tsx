'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Mail
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    contact: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.contact || !formData.password || !formData.confirmPassword) {
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

    if (!formData.terms) {
      setError('请同意用户协议和隐私政策');
      return;
    }

    // 模拟注册成功
    const userData = {
      id: Date.now().toString(),
      username: formData.contact,
      contact: formData.contact,
      nickname: formData.contact,
      points: 0,
      level: 1,
      avatar: undefined
    };

    login(userData);
    router.push('/');
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
          href="/"
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
            <p className="text-slate-500 text-sm mt-2">加入我们，开启绿色生活新篇章</p>
          </div>

          {/* Register Form */}
          <div className="space-y-6">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#30499B]">注册</h2>
              <div className="text-sm text-slate-500 font-medium">
                已有账号？{' '}
                <Link href="/login" className="text-[#30499B] hover:text-[#56B949] transition-colors underline decoration-dotted underline-offset-2">
                  马上登录
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
                />
              </div>

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
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                <label htmlFor="terms" className="text-sm text-slate-500 select-none cursor-pointer leading-relaxed">
                  我已阅读并同意
                  <Link href="/terms" className="text-[#30499B] hover:underline ml-1">
                    《用户服务协议》
                  </Link>
                  和
                  <Link href="/privacy" className="text-[#30499B] hover:underline ml-1">
                    《隐私政策》
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#30499B] hover:bg-[#253a7a] text-white rounded-lg font-medium shadow-lg shadow-[#30499B]/20 hover:shadow-xl hover:shadow-[#30499B]/30 transition-all active:scale-[0.98] text-sm tracking-wide"
              >
                提交注册
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400">快速注册</span>
              </div>
            </div>

            {/* Quick Register */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Smartphone className="w-4 h-4" />
                手机注册
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Mail className="w-4 h-4" />
                邮箱注册
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}