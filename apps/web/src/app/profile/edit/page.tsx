'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
  Edit,
  Camera,
  User,
  Users,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';

export default function ProfileEditPage() {
  const { user, logout, isLoggedIn, loading, updateUser } = useAuth();
  const [selectedGender, setSelectedGender] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    gender: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    hometown: '',
    bio: ''
  });
  const [bioCount, setBioCount] = useState(0);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const goBack = () => {
    window.location.href = '/profile';
  };

  useEffect(() => {
    // 只有在不是loading状态且确实未登录时才跳转
    if (!loading && (!user || !isLoggedIn)) {
      window.location.href = '/login';
      return;
    }

    // 如果用户已登录，初始化表单数据
    if (user) {
      setFormData({
        nickname: user.nickname || user.username || '',
        gender: user.gender || '',
        birthYear: '',
        birthMonth: '',
        birthDay: '',
        hometown: '',
        bio: ''
      });
      setSelectedGender(user.gender || '');
    }
  }, [user, isLoggedIn, loading]);

  // 初始化年份选项
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  // 初始化月份选项
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // 初始化日期选项
  const generateDayOptions = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  const selectGender = (gender: string) => {
    setSelectedGender(gender);
    setFormData(prev => ({ ...prev, gender }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'bio') {
      setBioCount(value.length);
      if (value.length > 200) {
        setFormData(prev => ({ ...prev, bio: value.substring(0, 200) }));
        setBioCount(200);
      }
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('文件大小不能超过 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById('avatar-preview');
        if (preview && e.target?.result) {
          preview.innerHTML = `<img src="${e.target.result}" alt="头像预览" class="w-full h-full object-cover rounded-full">`;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // 验证必填字段
    if (!formData.nickname.trim()) {
      alert('请输入昵称');
      return;
    }

    // 更新用户信息
    if (user) {
      const updatedUser = {
        ...user,
        nickname: formData.nickname,
        username: formData.nickname, // 同时更新username
        gender: formData.gender,
        hometown: formData.hometown,
        bio: formData.bio
      };

      updateUser(updatedUser);
      alert('资料保存成功！');
      window.location.href = '/profile';
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
              YL
            </div>
            <p className="text-slate-600">加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 如果未登录，显示加载状态（即将跳转）
  if (!user || !isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
              YL
            </div>
            <p className="text-slate-600">跳转到登录页面...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-[fadeInUp_0.6s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 text-[#30499B] rounded-full text-sm font-semibold mb-4 border border-[#56B949]/20">
            <User className="w-4 h-4" />
            个人信息设置
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">完善您的个人资料</h2>
          <p className="text-slate-500">让其他环保伙伴更好地了解您</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden animate-[fadeInUp_0.6s_ease-out_forwards]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* 头像上传 */}
            <div className="text-center">
              <div className="inline-block relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 cursor-pointer mx-auto mb-4 overflow-hidden hover:scale-105 transition-transform duration-300 relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleAvatarChange}
                  />
                  <div id="avatar-preview" className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-medium">上传头像</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
              </div>
            </div>

            {/* 昵称 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="w-4 h-4 text-[#56B949]" />
                昵称
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="请输入您的昵称"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm hover:-translate-y-0.5 focus:-translate-y-0.5"
              />
            </div>

            {/* 性别 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Users className="w-4 h-4 text-[#F0A32F]" />
                性别
              </label>
              <div className="flex gap-4">
                <div
                  className={`flex-1 p-4 border rounded-xl text-center bg-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${selectedGender === 'male'
                      ? 'bg-gradient-to-br from-[#56B949] to-[#4aa840] text-white border-[#56B949] shadow-lg'
                      : 'border-slate-200 hover:border-[#56B949] hover:bg-[#56B949]/5'
                    }`}
                  onClick={() => selectGender('male')}
                >
                  <User className="w-6 h-6 mx-auto mb-2 text-[#30499B]" />
                  <div className="font-medium">男</div>
                </div>
                <div
                  className={`flex-1 p-4 border rounded-xl text-center bg-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${selectedGender === 'female'
                      ? 'bg-gradient-to-br from-[#EE4035] to-[#d63384] text-white border-[#EE4035] shadow-lg'
                      : 'border-slate-200 hover:border-[#EE4035] hover:bg-[#EE4035]/5'
                    }`}
                  onClick={() => selectGender('female')}
                >
                  <User className="w-6 h-6 mx-auto mb-2 text-[#EE4035]" />
                  <div className="font-medium">女</div>
                </div>
                <div
                  className={`flex-1 p-4 border rounded-xl text-center bg-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${selectedGender === 'other'
                      ? 'bg-gradient-to-br from-[#F0A32F] to-[#e09112] text-white border-[#F0A32F] shadow-lg'
                      : 'border-slate-200 hover:border-[#F0A32F] hover:bg-[#F0A32F]/5'
                    }`}
                  onClick={() => selectGender('other')}
                >
                  <User className="w-6 h-6 mx-auto mb-2 text-[#F0A32F]" />
                  <div className="font-medium">其他</div>
                </div>
              </div>
            </div>

            {/* 生日 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4 text-[#30499B]" />
                生日
              </label>
              <div className="grid grid-cols-3 gap-4">
                <select
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B] outline-none transition-all text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                >
                  <option value="">年份</option>
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                <select
                  value={formData.birthMonth}
                  onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B] outline-none transition-all text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                >
                  <option value="">月份</option>
                  {generateMonthOptions().map(month => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
                <select
                  value={formData.birthDay}
                  onChange={(e) => handleInputChange('birthDay', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B] outline-none transition-all text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                >
                  <option value="">日期</option>
                  {generateDayOptions().map(day => (
                    <option key={day} value={day}>{day}日</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 家乡 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-[#EE4035]" />
                家乡
              </label>
              <select
                value={formData.hometown}
                onChange={(e) => handleInputChange('hometown', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EE4035]/20 focus:border-[#EE4035] outline-none transition-all text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="">请选择您的家乡</option>
                <option value="北京市">北京市</option>
                <option value="天津市">天津市</option>
                <option value="上海市">上海市</option>
                <option value="重庆市">重庆市</option>
                <option value="河北省">河北省</option>
                <option value="山西省">山西省</option>
                <option value="辽宁省">辽宁省</option>
                <option value="吉林省">吉林省</option>
                <option value="黑龙江省">黑龙江省</option>
                <option value="江苏省">江苏省</option>
                <option value="浙江省">浙江省</option>
                <option value="安徽省">安徽省</option>
                <option value="福建省">福建省</option>
                <option value="江西省">江西省</option>
                <option value="山东省">山东省</option>
                <option value="河南省">河南省</option>
                <option value="湖北省">湖北省</option>
                <option value="湖南省">湖南省</option>
                <option value="广东省">广东省</option>
                <option value="海南省">海南省</option>
                <option value="四川省">四川省</option>
                <option value="贵州省">贵州省</option>
                <option value="云南省">云南省</option>
                <option value="陕西省">陕西省</option>
                <option value="甘肃省">甘肃省</option>
                <option value="青海省">青海省</option>
                <option value="台湾省">台湾省</option>
                <option value="内蒙古自治区">内蒙古自治区</option>
                <option value="广西壮族自治区">广西壮族自治区</option>
                <option value="西藏自治区">西藏自治区</option>
                <option value="宁夏回族自治区">宁夏回族自治区</option>
                <option value="新疆维吾尔自治区">新疆维吾尔自治区</option>
                <option value="香港特别行政区">香港特别行政区</option>
                <option value="澳门特别行政区">澳门特别行政区</option>
              </select>
            </div>

            {/* 个人简介 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText className="w-4 h-4 text-[#56B949]" />
                个人简介
                <span className="text-xs text-slate-400 ml-1">(选填)</span>
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="分享一下您的环保理念或兴趣爱好..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm resize-none hover:-translate-y-0.5 focus:-translate-y-0.5"
              />
              <div className="text-xs text-slate-400 text-right">
                <span>{bioCount}</span>/200 字
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 py-3 px-6 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 text-white rounded-xl font-medium shadow-lg bg-gradient-to-r from-[#56B949] to-[#F0A32F] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">保存资料</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}