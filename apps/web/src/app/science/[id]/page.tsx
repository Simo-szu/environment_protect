'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
  ArrowLeft,
  Calendar,
  User,
  Heart,
  Share2,
  Bookmark,
  Eye,
  MessageCircle,
  TreePine,
  Recycle,
  Droplets,
  Sun
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem, pageEnter } from '@/lib/animations';

export default function ScienceArticleDetailPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 模拟文章数据
  const mockArticle = {
    id: articleId,
    title: '海洋塑料污染：我们能做什么来拯救海洋生态？',
    content: `海洋塑料污染已经成为当今世界面临的最严重环境问题之一。每年有超过800万吨的塑料垃圾进入海洋，相当于每分钟就有一卡车的塑料倾倒到海里。

## 塑料污染的严重性

塑料在海洋中不会自然分解，而是会分解成越来越小的微塑料颗粒。这些微塑料不仅污染了海水，还进入了食物链，最终可能回到我们的餐桌上。

### 对海洋生物的影响

- **海龟**：经常误食塑料袋，将其当作水母
- **海鸟**：胃中充满塑料碎片，无法正常进食
- **鱼类**：体内含有微塑料，影响繁殖能力

## 我们能做什么？

### 个人行动
1. **减少使用一次性塑料制品**
   - 使用可重复使用的购物袋
   - 选择玻璃或不锈钢水瓶
   - 避免使用塑料吸管

2. **正确处理塑料垃圾**
   - 做好垃圾分类
   - 参与海滩清洁活动
   - 支持塑料回收项目

3. **提高环保意识**
   - 教育身边的人
   - 支持环保组织
   - 选择环保产品

### 社会层面的解决方案

政府和企业也在采取行动：
- 制定限塑令
- 开发可降解材料
- 投资海洋清理技术

## 成功案例

荷兰的海洋清理基金会开发了海洋清理系统，已经成功从太平洋垃圾带中清理了数吨塑料垃圾。这证明了通过技术创新和国际合作，我们可以解决这个问题。

## 结语

保护海洋不是某个人或某个国家的责任，而是全人类的共同使命。每个人的小小行动汇聚起来，就能产生巨大的力量。让我们从今天开始，为了蓝色的地球家园而行动！`,
    author: '海洋保护专家 李博士',
    authorAvatar: 'L',
    publishDate: '2024年5月15日',
    readTime: '8分钟阅读',
    category: '海洋保护',
    tags: ['海洋污染', '塑料垃圾', '环保行动', '生态保护'],
    likes: 234,
    views: 1567,
    comments: 45,
    type: 'water'
  };

  const handleBack = () => {
    router.push('/science');
  };

  const handleLike = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockArticle.title,
        text: '分享一篇关于海洋保护的文章',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tree': return <TreePine className="w-5 h-5 text-[#56B949]" />;
      case 'recycle': return <Recycle className="w-5 h-5 text-[#F0A32F]" />;
      case 'water': return <Droplets className="w-5 h-5 text-[#30499B]" />;
      case 'sun': return <Sun className="w-5 h-5 text-[#EE4035]" />;
      default: return <TreePine className="w-5 h-5 text-[#56B949]" />;
    }
  };

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageEnter}
        className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(mockArticle.type)}
                <span className="text-sm text-[#30499B] font-medium">{mockArticle.category}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#30499B] leading-tight">
                {mockArticle.title}
              </h1>
            </div>
          </div>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold text-sm">
                {mockArticle.authorAvatar}
              </div>
              <span>{mockArticle.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{mockArticle.publishDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{mockArticle.views} 阅读</span>
            </div>
            <span>{mockArticle.readTime}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isLiked
                ? 'border-[#EE4035] bg-[#EE4035]/10 text-[#EE4035]'
                : 'border-slate-200 hover:border-[#EE4035] hover:text-[#EE4035]'
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{mockArticle.likes}</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isBookmarked
                ? 'border-[#56B949] bg-[#56B949]/10 text-[#56B949]'
                : 'border-slate-200 hover:border-[#56B949] hover:text-[#56B949]'
                }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>收藏</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-[#30499B] hover:text-[#30499B] transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Article Content */}
        <motion.div
          variants={staggerItem}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg mb-8"
        >
          {/* Featured Image */}
          <div className="aspect-video bg-gradient-to-br from-[#30499B]/20 to-[#56B949]/20 rounded-xl mb-8 flex items-center justify-center">
            <Droplets className="w-16 h-16 text-[#30499B]" />
          </div>

          {/* Article Body */}
          <div className="prose prose-slate max-w-none">
            {mockArticle.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-serif font-semibold text-[#30499B] mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              } else if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold text-[#30499B] mt-6 mb-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              } else if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="text-slate-600 leading-relaxed ml-4">
                    {paragraph.replace('- ', '')}
                  </li>
                );
              } else if (paragraph.match(/^\d+\. /)) {
                return (
                  <li key={index} className="text-slate-600 leading-relaxed ml-4">
                    {paragraph.replace(/^\d+\. /, '')}
                  </li>
                );
              } else if (paragraph.trim()) {
                return (
                  <p key={index} className="text-slate-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          variants={staggerItem}
          className="flex flex-wrap gap-2 mb-8"
        >
          {mockArticle.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-[#30499B]/10 text-[#30499B] rounded-full text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
        </motion.div>

        {/* Comments Section */}
        <motion.div
          variants={staggerItem}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-[#30499B]" />
            <h3 className="text-xl font-semibold text-[#30499B]">评论 ({mockArticle.comments})</h3>
          </div>

          {/* Comment Form */}
          {isLoggedIn ? (
            <div className="mb-6">
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#30499B] focus:outline-none transition-colors resize-none"
                rows={3}
                placeholder="写下你的想法..."
              />
              <div className="flex justify-end mt-3">
                <button className="px-6 py-2 bg-[#30499B] text-white rounded-lg font-medium hover:bg-[#253a7a] transition-colors">
                  发表评论
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-slate-600 mb-3">登录后可以发表评论</p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-[#30499B] text-white rounded-lg font-medium hover:bg-[#253a7a] transition-colors"
              >
                立即登录
              </button>
            </div>
          )}

          {/* Sample Comments */}
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold text-sm">
                张
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-slate-800">张小明</span>
                  <span className="text-xs text-slate-500">2天前</span>
                </div>
                <p className="text-slate-600 text-sm">
                  非常有意义的文章！我已经开始使用可重复使用的购物袋了，希望更多人能够关注海洋保护。
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#d9901e] flex items-center justify-center text-white font-semibold text-sm">
                李
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-slate-800">李环保</span>
                  <span className="text-xs text-slate-500">1天前</span>
                </div>
                <p className="text-slate-600 text-sm">
                  我们学校也在组织海滩清洁活动，每个人都应该为保护环境贡献自己的力量！
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}