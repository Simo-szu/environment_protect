'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { 
  User, 
  MapPin, 
  Settings, 
  LogOut, 
  ChevronRight,
  UserCircle,
  Award,
  Leaf
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isLoggedIn)) {
      window.location.href = '/login';
    }
  }, [user, isLoggedIn, loading]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

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

  if (!user || !isLoggedIn) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden animate-[fadeInUp_0.6s_ease-out_forwards]">
          {/* Cover/Header */}
          <div className="h-32 bg-gradient-to-r from-[#56B949]/20 to-[#F0A32F]/20 relative">
            <Link 
              href="/profile/edit"
              className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-sm rounded-full text-slate-600 hover:bg-white transition-all shadow-sm"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="px-8 pb-8 -mt-12 relative">
            <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.nickname || user.username} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 text-slate-400" />
                )}
              </div>
              
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-serif font-bold text-[#30499B]">
                    {user.nickname || user.username}
                  </h1>
                  <span className="px-3 py-1 bg-[#56B949]/10 text-[#56B949] text-xs font-bold rounded-full border border-[#56B949]/20 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    环保达人 {user.level || 1}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.hometown || '环保星球'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    UID: {user.id.substring(0, 8)}
                  </span>
                </div>
              </div>
              
              <div className="w-full md:w-auto pb-2">
                <Link 
                  href="/profile/edit"
                  className="block w-full text-center px-6 py-2.5 bg-[#30499B] text-white rounded-xl font-medium shadow-md hover:bg-[#30499B]/90 transition-all hover:-translate-y-0.5"
                >
                  编辑资料
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50/50 rounded-2xl p-4 text-center border border-slate-100">
                <div className="text-2xl font-bold text-[#30499B] mb-1">{user.points || 120}</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">环保积分</div>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-4 text-center border border-slate-100">
                <div className="text-2xl font-bold text-[#56B949] mb-1">15</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">减排行动</div>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-4 text-center border border-slate-100">
                <div className="text-2xl font-bold text-[#F0A32F] mb-1">3</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">获得勋章</div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-[#56B949]" />
                    个人简介
                  </h3>
                  <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 min-h-[120px]">
                    <p className="text-slate-600 leading-relaxed italic">
                      {user.bio || '这个环保达人很神秘，还没有写下简介...'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-4">最近动态</h3>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-[#56B949]/10 flex items-center justify-center text-[#56B949]">
                          <Leaf className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">完成了一次「低碳出行」挑战</div>
                          <div className="text-xs text-slate-400">2024-05-1{i} 14:30</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-[#30499B] mb-4">账户管理</h3>
                  <div className="bg-slate-50/50 rounded-2xl p-2 border border-slate-100 overflow-hidden text-slate-700">
                    <Link href="/profile/edit" className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4 text-[#30499B]" />
                      </div>
                      <span className="text-sm font-medium">账号信息</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">退出登录</span>
                      <ChevronRight className="w-4 h-4 text-red-200 ml-auto" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-[#56B949] to-[#30499B] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <h4 className="font-serif font-bold text-lg mb-2">加入社区</h4>
                    <p className="text-white/80 text-xs mb-4">与全球 1,000,000+ 环保参与者一起守护地球</p>
                    <button className="w-full py-2 bg-white text-[#56B949] rounded-xl text-sm font-bold shadow-md hover:bg-[#F0A32F] hover:text-white transition-all">
                      寻找组织
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
