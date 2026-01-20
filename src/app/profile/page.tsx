'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { 
  Heart, 
  Bookmark, 
  MessageCircle, 
  Camera, 
  Edit,
  Image,
  ArrowRight
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('likes');

  useEffect(() => {
    if (!loading && (!user || !isLoggedIn)) {
      window.location.href = '/login';
      return;
    }
  }, [user, isLoggedIn, loading]);

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
      <div className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-3xl shadow-2xl mx-auto">
                <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}</span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-[#30499B] transition-colors border-2 border-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">姓名:</span>
                  <span className="font-medium text-slate-800">{user.nickname || user.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">ID:</span>
                  <span className="font-medium text-slate-800">{user.id || '123456789'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">积分:</span>
                  <span className="font-medium text-[#F0A32F]">{user.points || 328}</span>
                </div>
              </div>

              <button 
                onClick={() => window.location.href = '/profile/edit'}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors font-medium shadow-lg"
              >
                <Edit className="w-4 h-4" />
                修改资料
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
          <button 
            onClick={() => setActiveTab('likes')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'likes' 
                ? 'bg-[#30499B] text-white' 
                : 'text-slate-600 hover:text-[#30499B]'
            }`}
          >
            <Heart className="w-4 h-4" />
            我的点赞
          </button>
          <button 
            onClick={() => setActiveTab('favorites')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'favorites' 
                ? 'bg-[#30499B] text-white' 
                : 'text-slate-600 hover:text-[#30499B]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            收藏
          </button>
        </div>

        <div>
          {activeTab === 'likes' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg">
                  <div className="aspect-video bg-gradient-to-br from-[#56B949]/10 to-[#30499B]/10 rounded-lg mb-4 flex items-center justify-center">
                    <Image className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">环保小贴士分享</h3>
                  <p className="text-sm text-slate-500 mb-3">分享一些日常生活中的环保小技巧...</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#F0A32F]">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">6</span>
                    </div>
                    <span className="text-xs text-slate-400">2天前</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div className="text-center py-12">
                <p className="text-slate-500">暂无收藏内容</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
