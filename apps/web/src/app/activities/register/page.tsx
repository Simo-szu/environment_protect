'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  UserPlus,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

function RegisterActivityContent() {
  const { user, isLoggedIn, loading } = useAuth();
  const searchParams = useSearchParams();
  const activityId = searchParams.get('id');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  // 检查登录状态
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      alert('请先登录后再报名活动');
      window.location.href = '/login';
    }
  }, [isLoggedIn, loading]);

  // 预填用户信息
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.nickname || user.username || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-4">加载中...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-4">请先登录后再报名活动</div>
          <Link href="/login" className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.name || !formData.phone) {
      alert('请填写姓名和联系电话');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('请输入正确的手机号码');
      return;
    }

    // 验证邮箱格式（如果填写了）
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('请输入正确的邮箱地址');
        return;
      }
    }

    // 模拟提交
    setIsSubmitted(true);
  };

  // 模拟活动信息
  const activityInfo = {
    title: '城市绿洲：周末社区花园种植计划',
    date: '2024年5月20日 09:00-17:00',
    location: '市中心社区花园',
    organizer: '绿色生活志愿者协会'
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
              <div className="w-16 h-16 bg-[#56B949] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-4">报名成功！</h2>
              <p className="text-slate-600 mb-6">
                您已成功报名参加活动，我们会在活动开始前通过短信或邮件与您联系，请保持通讯畅通。
              </p>
              <div className="space-y-3 text-left bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">活动名称：</span>
                  <span className="text-slate-700 font-medium">{activityInfo.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">活动时间：</span>
                  <span className="text-slate-700">{activityInfo.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">报名姓名：</span>
                  <span className="text-slate-700">{formData.name}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/activities"
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium text-center"
                >
                  返回活动
                </Link>
                <Link
                  href="/my-activities"
                  className="flex-1 py-3 px-4 bg-[#56B949] text-white rounded-lg hover:bg-[#4aa840] transition-colors text-sm font-medium text-center"
                >
                  我的活动
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 form-section">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 text-[#30499B] rounded-full text-sm font-semibold mb-4 border border-[#56B949]/20">
              <CalendarCheck className="w-4 h-4" />
              活动报名
            </div>
            <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">填写报名信息</h2>
            <p className="text-slate-500">请填写您的联系信息，我们会在活动开始前与您联系。</p>
          </div>

          {/* Activity Info */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60 mb-8">
            <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-4">活动信息</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-slate-500 text-sm w-20 flex-shrink-0">活动名称：</span>
                <span className="text-slate-700 text-sm font-medium">{activityInfo.title}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-slate-500 text-sm w-20 flex-shrink-0">活动时间：</span>
                <span className="text-slate-700 text-sm">{activityInfo.date}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-slate-500 text-sm w-20 flex-shrink-0">活动地点：</span>
                <span className="text-slate-700 text-sm">{activityInfo.location}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-slate-500 text-sm w-20 flex-shrink-0">主办方：</span>
                <span className="text-slate-700 text-sm">{activityInfo.organizer}</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden form-section">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* 姓名 */}
              <div className="space-y-2">
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="w-4 h-4 text-[#56B949]" />
                  真实姓名
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="请输入您的真实姓名"
                  className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                />
              </div>

              {/* 联系电话 */}
              <div className="space-y-2">
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="w-4 h-4 text-[#F0A32F]" />
                  联系电话
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入您的手机号码"
                  className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F0A32F]/20 focus:border-[#F0A32F] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                />
              </div>

              {/* 邮箱地址 */}
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="w-4 h-4 text-[#30499B]" />
                  邮箱地址
                  <span className="text-xs text-slate-400">(选填)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="请输入您的邮箱地址"
                  className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                />
              </div>

              {/* 留言 */}
              <div className="space-y-2">
                <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MessageSquare className="w-4 h-4 text-[#EE4035]" />
                  留言
                  <span className="text-xs text-slate-400">(选填)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="您可以在这里留言，告诉我们您的期望或特殊需求..."
                  className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EE4035]/20 focus:border-[#EE4035] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm resize-none"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 py-3 px-6 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="submit-btn flex-1 py-3 px-6 text-white rounded-xl font-medium shadow-lg bg-gradient-to-r from-[#56B949] to-[#F0A32F] hover:shadow-xl transition-all"
                >
                  确认报名
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-section {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .form-input {
          transition: all 0.3s ease;
        }
        .form-input:focus {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -8px rgba(86, 185, 73, 0.3);
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .submit-btn:hover::before {
          left: 100%;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px -8px rgba(86, 185, 73, 0.4);
        }
      `}</style>
    </Layout>
  );
}

export default function RegisterActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-4">加载中...</div>
        </div>
      </div>
    }>
      <RegisterActivityContent />
    </Suspense>
  );
}