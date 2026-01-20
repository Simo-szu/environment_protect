'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarPlus,
  Type,
  Tag,
  Calendar,
  CalendarX,
  MapPin,
  FileText,
  Image as ImageIcon,
  Plus,
  X,
  Megaphone
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

export default function CreateActivityPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    images: [] as File[]
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 检查登录状态
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      alert('请先登录后再发布活动');
      window.location.href = '/login';
    }
  }, [isLoggedIn, loading]);

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
          <div className="text-lg text-slate-600 mb-4">请先登录后再发布活动</div>
          <Link href="/login" className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreviews(prev => [...prev, event.target!.result as string]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, file]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    // 清空input以允许重复选择相同文件
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.title || !formData.type || !formData.startTime || !formData.endTime || !formData.location || !formData.description) {
      alert('请填写所有必填字段');
      return;
    }

    if (formData.title.length < 5 || formData.title.length > 20) {
      alert('活动标题应为5-20字');
      return;
    }

    if (formData.description.length < 20 || formData.description.length > 200) {
      alert('活动介绍应为20-200字');
      return;
    }

    // 验证时间
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    if (startTime >= endTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    if (startTime <= new Date()) {
      alert('开始时间必须晚于当前时间');
      return;
    }

    // 模拟提交
    alert('活动发布成功！');
    window.location.href = '/activities';
  };

  return (
    <div className="bg-[#FAFAF9] min-h-screen relative overflow-x-hidden text-slate-600">
      {/* 全局背景氛围 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="liquid-blob absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#56B949]/15 rounded-full blur-[120px]"></div>
        <div className="liquid-blob absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F0A32F]/10 rounded-full blur-[100px]" style={{ animationDelay: '-5s' }}></div>
        <div className="liquid-blob absolute bottom-[-20%] left-[10%] w-[80%] h-[60%] bg-gradient-to-tr from-[#56B949]/20 to-[#30499B]/5 rounded-full blur-[130px]" style={{ animationDelay: '-10s' }}></div>
        <div className="liquid-blob absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#EE4035]/8 rounded-full blur-[80px]" style={{ animationDelay: '-2s' }}></div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-4">
              <Link href="/activities" className="p-2 rounded-full bg-white/80 text-slate-400 hover:text-[#30499B] hover:bg-white transition-all shadow-sm border border-white/60">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-[#56B949]/20">YL</div>
                <span className="text-[#30499B] font-bold text-xl tracking-tight">YouthLoop</span>
              </div>
            </div>

            {/* Page Title */}
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-[#F0A32F]" />
              <h1 className="text-lg font-semibold text-slate-800">活动招募</h1>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold shadow-lg">
                  <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8 form-section">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 text-[#30499B] rounded-full text-sm font-semibold mb-4 border border-[#56B949]/20">
              <Megaphone className="w-4 h-4" />
              活动发布
            </div>
            <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-2">上传活动信息</h2>
            <p className="text-slate-500">如果你是组织者，欢迎在这里发布环保活动，寻找志同道合的伙伴。</p>
          </div>

          {/* Activity Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden form-section">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* 活动标题 */}
              <div className="space-y-2">
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Type className="w-4 h-4 text-[#56B949]" />
                  活动标题 <span className="text-xs text-slate-400">(5-20字)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="请输入活动标题"
                  maxLength={20}
                  className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                />
                <div className="text-xs text-slate-400 text-right">
                  {formData.title.length}/20 字
                </div>
              </div>

              {/* 活动类型和时间 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 活动类型 */}
                <div className="space-y-2">
                  <label htmlFor="type" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Tag className="w-4 h-4 text-[#F0A32F]" />
                    活动类型
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="custom-select form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F0A32F]/20 focus:border-[#F0A32F] outline-none transition-all text-slate-700 shadow-sm appearance-none"
                  >
                    <option value="">请选择类型</option>
                    <option value="环保市集">环保市集</option>
                    <option value="植树活动">植树活动</option>
                    <option value="垃圾分类">垃圾分类</option>
                    <option value="环保DIY">环保DIY</option>
                    <option value="净滩行动">净滩行动</option>
                    <option value="节能减排">节能减排</option>
                    <option value="生态保护">生态保护</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 开始时间 */}
                <div className="space-y-2">
                  <label htmlFor="startTime" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-[#30499B]" />
                    开始时间
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B] outline-none transition-all text-slate-700 shadow-sm"
                  />
                </div>

                {/* 结束时间 */}
                <div className="space-y-2">
                  <label htmlFor="endTime" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarX className="w-4 h-4 text-[#EE4035]" />
                    结束时间
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EE4035]/20 focus:border-[#EE4035] outline-none transition-all text-slate-700 shadow-sm"
                  />
                </div>
              </div>

              {/* 活动地点 */}
              <div className="space-y-2">
                <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MapPin className="w-4 h-4 text-[#EE4035]" />
                  活动地点
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="请输入活动地点"
                  className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EE4035]/20 focus:border-[#EE4035] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                />
              </div>

              {/* 活动介绍 */}
              <div className="space-y-2">
                <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileText className="w-4 h-4 text-[#56B949]" />
                  活动介绍 <span className="text-xs text-slate-400">(20-200字)</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="请详细描述活动内容、目标和意义..."
                  maxLength={200}
                  className="form-input w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56B949]/20 focus:border-[#56B949] outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm resize-none"
                />
                <div className="text-xs text-slate-400 text-right">
                  {formData.description.length}/200 字
                </div>
              </div>

              {/* 上传活动海报/图片 */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ImageIcon className="w-4 h-4 text-[#F0A32F]" />
                  上传活动海报/图片
                  <span className="text-xs text-slate-400">尺寸建议 3:4</span>
                </label>

                {/* 图片上传区域 */}
                {imagePreviews.length === 0 ? (
                  <div
                    className="image-upload-area rounded-xl p-8 text-center cursor-pointer border-2 border-dashed border-slate-200 hover:border-[#56B949] hover:bg-[#56B949]/5 transition-all"
                    onClick={() => document.getElementById('image-input')?.click()}
                  >
                    <input
                      type="file"
                      id="image-input"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">上传图片</p>
                        <p className="text-xs text-slate-400">支持 JPG、PNG 格式，单张不超过 5MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden relative group">
                          <img src={preview} alt="活动图片" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-input')?.click()}
                      className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-[#56B949] hover:text-[#56B949] transition-colors"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      继续添加图片
                    </button>
                    <input
                      type="file"
                      id="image-input"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
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
                  确定发布
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center border-t border-slate-200/50 pt-8 pb-4 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-[#30499B] text-white flex items-center justify-center text-[10px] font-serif font-bold">YL</div>
            <span className="text-[#30499B] font-bold tracking-tight text-sm">YouthLoop</span>
          </div>
          <p className="text-slate-400 text-[10px]">© 2024 YouthLoop. 让绿色循环，用行动改变未来</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes liquid-drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .liquid-blob {
          animation: liquid-drift 20s infinite ease-in-out alternate;
        }

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

        .custom-select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
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
    </div>
  );
}