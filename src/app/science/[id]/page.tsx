'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  User,
  Clock,
  Tag
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ScienceArticlePage() {
  const { user, isLoggedIn } = useAuth();
  const params = useParams();
  const articleId = params.id as string;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(156);
  const [viewCount, setViewCount] = useState(1234);
  const [comments, setComments] = useState([
    {
      id: 1,
      user: '环保小达人',
      avatar: '环',
      content: '这篇文章写得很好，让我对绿色科技有了更深的了解！',
      time: '2小时前',
      likes: 12
    },
    {
      id: 2,
      user: '绿色生活者',
      avatar: '绿',
      content: '太阳能技术确实是未来的趋势，希望能在我们城市也推广起来。',
      time: '5小时前',
      likes: 8
    }
  ]);
  const [newComment, setNewComment] = useState('');

  // 模拟文章数据
  const getArticleData = (id: string) => {
    const articles = {
      'article-001': {
        title: '绿色科技：未来城市的可持续能源解决方案',
        category: '绿色科技',
        publishDate: '2026年1月6日',
        readTime: '8分钟阅读',
        author: 'YouthLoop科普团队',
        summary: '随着全球气候变暖的加剧，如何在城市发展中融入更多的绿色科技成为了关键议题。本文将探讨最新的太阳能板技术、风能利用以及智能电网在现代都市中的应用案例。',
        content: `
          <h2>引言</h2>
          <p>在全球气候变化日益严峻的今天，城市作为人类活动的主要聚集地，承担着巨大的环境责任。如何在保持经济发展的同时，实现城市的可持续发展，已成为全世界共同面临的挑战。绿色科技的发展为我们提供了新的解决方案。</p>
          
          <h2>太阳能技术的革新</h2>
          <p>近年来，太阳能技术取得了突破性进展。新一代钙钛矿太阳能电池的转换效率已经超过25%，而成本却大幅降低。在城市建筑中，建筑一体化太阳能系统（BIPV）正在成为新的趋势。</p>
          
          <p>以德国弗莱堡市为例，该市通过在建筑屋顶和立面安装太阳能板，实现了50%的电力自给自足。这种模式不仅减少了对传统能源的依赖，还为居民节省了大量电费。</p>
          
          <h2>智能电网的应用</h2>
          <p>智能电网技术使得可再生能源的并网和管理变得更加高效。通过实时监控和智能调度，电网可以根据供需情况自动调节电力分配，最大化利用清洁能源。</p>
          
          <h3>微电网系统</h3>
          <p>微电网作为智能电网的重要组成部分，可以在局部区域内实现能源的自给自足。当主电网出现故障时，微电网可以独立运行，保证关键设施的电力供应。</p>
          
          <h2>风能在城市中的应用</h2>
          <p>虽然城市环境对风能利用存在一定限制，但垂直轴风力发电机的发展为城市风能利用开辟了新的可能。这种风机噪音小、占地面积少，适合在城市建筑顶部安装。</p>
          
          <h2>未来展望</h2>
          <p>随着技术的不断进步和成本的持续下降，绿色科技将在城市发展中发挥越来越重要的作用。我们有理由相信，通过科技创新和政策支持，未来的城市将更加清洁、高效和可持续。</p>
          
          <p>每个人都可以为绿色城市的建设贡献力量，从选择清洁能源到支持环保政策，让我们共同努力，创造一个更美好的未来。</p>
        `
      },
      'article-002': {
        title: '海洋塑料污染：不仅仅是吸管的问题',
        category: '环境保护',
        publishDate: '2026年1月6日',
        readTime: '6分钟阅读',
        author: 'YouthLoop科普团队',
        summary: '每年有数百万吨塑料垃圾流入海洋，威胁着海洋生物的生存。这篇深度报道将带你了解微塑料的危害，以及各国正在采取的清理行动和减塑政策。',
        content: `
          <h2>海洋塑料污染的现状</h2>
          <p>据联合国环境规划署统计，每年约有800万吨塑料垃圾进入海洋，相当于每分钟向海洋倾倒一卡车的塑料垃圾。这些塑料垃圾不仅污染海洋环境，还对海洋生物造成严重威胁。</p>
          
          <h2>微塑料的隐形危害</h2>
          <p>塑料在海洋中会逐渐分解成微小的颗粒，称为微塑料。这些直径小于5毫米的颗粒很容易被海洋生物误食，进入食物链，最终可能影响人类健康。</p>
          
          <h3>对海洋生物的影响</h3>
          <p>海龟误食塑料袋，海鸟胃中发现大量塑料碎片，鲸鱼因塑料垃圾堵塞消化道而死亡——这些触目惊心的案例提醒我们塑料污染的严重性。</p>
          
          <h2>全球行动与解决方案</h2>
          <p>面对严峻的海洋塑料污染问题，世界各国正在采取积极行动。从限制一次性塑料制品的使用，到开发可降解替代材料，再到海洋清理项目，多管齐下治理塑料污染。</p>
          
          <h2>我们能做什么</h2>
          <p>作为个人，我们可以从日常生活做起：减少使用一次性塑料制品，选择可重复使用的购物袋，正确分类回收塑料垃圾，支持环保企业和产品。</p>
        `
      },
      'article-003': {
        title: '电动汽车：你需要知道的电池回收知识',
        category: '绿色出行',
        publishDate: '2026年1月6日',
        readTime: '5分钟阅读',
        author: 'YouthLoop科普团队',
        summary: '随着电动汽车的普及，废旧电池的处理成为了一个新的环保挑战。如果处理不当，电池中的重金属将造成严重污染。了解正确的回收渠道和再生技术。',
        content: `
          <h2>电动汽车电池的构成</h2>
          <p>电动汽车主要使用锂离子电池，其中含有锂、钴、镍、锰等金属元素。这些材料既珍贵又稀缺，同时如果处理不当也可能对环境造成污染。</p>
          
          <h2>电池回收的重要性</h2>
          <p>一块电动汽车电池的使用寿命通常为8-10年，之后需要进行回收处理。正确的回收不仅可以避免环境污染，还能回收利用其中的贵重金属。</p>
          
          <h3>环境保护</h3>
          <p>废旧电池如果随意丢弃，其中的重金属可能渗入土壤和地下水，造成长期的环境污染。一块电池可以污染数万升水源。</p>
          
          <h3>资源回收</h3>
          <p>通过专业的回收处理，可以回收电池中95%以上的金属材料，这些材料可以用于制造新的电池，形成循环经济。</p>
          
          <h2>回收技术与流程</h2>
          <p>现代电池回收技术主要包括物理拆解、化学提取和材料再生三个步骤。通过这些技术，可以安全高效地回收电池中的有用材料。</p>
          
          <h2>消费者的责任</h2>
          <p>作为电动汽车用户，我们应该选择正规的回收渠道，不要将废旧电池随意丢弃。同时，在购买电动汽车时，也要考虑厂商的回收政策和服务。</p>
        `
      },
      'article-004': {
        title: '节约用水小妙招：让每一滴水都发挥价值',
        category: '生活环保',
        publishDate: '2026年1月5日',
        readTime: '4分钟阅读',
        author: 'YouthLoop科普团队',
        summary: '水是生命之源，节约用水是每个人的责任。本文将介绍一些简单实用的节水小妙招，让你在日常生活中轻松做到节约用水。',
        content: `
          <h2>为什么要节约用水</h2>
          <p>虽然地球表面70%被水覆盖，但可供人类使用的淡水资源却非常有限，仅占全球水资源的2.5%。随着人口增长和工业发展，水资源短缺已成为全球性问题。</p>
          
          <h2>厨房节水妙招</h2>
          <p>洗菜时可以先用淘米水浸泡，既能去除农药残留，又能节约用水。洗菜水可以用来浇花，实现水资源的二次利用。</p>
          
          <h3>洗碗节水技巧</h3>
          <p>洗碗时先用纸巾擦去油污，再用少量洗洁精清洗，最后用清水冲洗。这样可以减少用水量，提高清洗效率。</p>
          
          <h2>卫生间节水方法</h2>
          <p>在马桶水箱中放置一个装满水的塑料瓶，可以减少每次冲水的用量。选择节水型马桶和花洒，长期来看能节约大量用水。</p>
          
          <h2>洗衣节水窍门</h2>
          <p>集中洗衣，避免少量衣物频繁洗涤。选择节水型洗衣机，合理使用洗衣程序。洗衣水可以用来拖地或冲厕所。</p>
          
          <h2>小行动，大影响</h2>
          <p>每个人的节水行动看似微小，但汇聚起来就是巨大的力量。让我们从今天开始，养成节约用水的好习惯，为保护地球水资源贡献自己的力量。</p>
        `
      },
      'article-005': {
        title: '垃圾分类指南：从源头减少环境污染',
        category: '环境保护',
        publishDate: '2026年1月4日',
        readTime: '6分钟阅读',
        author: 'YouthLoop科普团队',
        summary: '正确的垃圾分类不仅能减少环境污染，还能让资源得到有效回收利用。本文将详细介绍垃圾分类的方法和意义。',
        content: `
          <h2>垃圾分类的重要性</h2>
          <p>垃圾分类是实现垃圾减量化、资源化、无害化处理的重要手段。通过分类收集，可以提高资源回收利用率，减少环境污染，延长垃圾填埋场使用寿命。</p>
          
          <h2>四大分类标准</h2>
          <p>目前我国主要采用四分类法：可回收物、有害垃圾、湿垃圾（厨余垃圾）、干垃圾（其他垃圾）。</p>
          
          <h3>可回收物</h3>
          <p>包括废纸、废塑料、废金属、废玻璃、废织物等。这些物品经过处理后可以重新利用，是重要的再生资源。</p>
          
          <h3>有害垃圾</h3>
          <p>包括废电池、废灯管、废药品、废油漆等。这些垃圾含有有毒有害物质，需要特殊处理，不能随意丢弃。</p>
          
          <h3>湿垃圾</h3>
          <p>主要是厨余垃圾，如剩菜剩饭、瓜皮果核、花卉绿植等。这些垃圾可以通过堆肥等方式处理，转化为有机肥料。</p>
          
          <h3>干垃圾</h3>
          <p>除上述三类之外的其他垃圾，如烟蒂、尘土、一次性餐具等。这些垃圾通常采用焚烧或填埋方式处理。</p>
          
          <h2>分类小贴士</h2>
          <p>记住"能卖钱的是可回收物，有毒有害单独放，湿垃圾容易腐烂，干垃圾焚烧填埋"这个口诀，可以帮助你快速判断垃圾类别。</p>
        `
      },
      'article-006': {
        title: '节能减排妙招：小行动创造大改变',
        category: '节能减排',
        publishDate: '2026年1月3日',
        readTime: '5分钟阅读',
        author: 'YouthLoop科普团队',
        summary: '节能减排不仅能保护环境，还能节约生活成本。本文将介绍一些简单易行的节能减排方法，让你在日常生活中轻松实践绿色生活。',
        content: `
          <h2>家庭节能从细节做起</h2>
          <p>家庭是能源消耗的重要场所，通过改变一些生活习惯，我们可以显著减少能源消耗和碳排放。</p>
          
          <h2>照明节能</h2>
          <p>使用LED灯泡替代传统白炽灯，能耗可降低80%以上。养成随手关灯的习惯，充分利用自然光照明。</p>
          
          <h3>智能照明系统</h3>
          <p>安装感应开关和定时器，可以自动控制灯具开关，避免不必要的能源浪费。</p>
          
          <h2>空调节能技巧</h2>
          <p>夏季空调温度设置在26°C，冬季设置在20°C，每调高或调低1°C，能耗可变化6-8%。定期清洁空调滤网，保持良好的制冷制热效果。</p>
          
          <h2>家电使用优化</h2>
          <p>选择能效等级高的家电产品，合理使用各种电器。电视、电脑等设备不用时及时关闭，避免待机耗电。</p>
          
          <h2>绿色出行方式</h2>
          <p>短距离出行选择步行或骑自行车，中长距离优先选择公共交通。如需开车，可以选择拼车或使用新能源汽车。</p>
          
          <h2>办公室节能</h2>
          <p>推广无纸化办公，双面打印，合理使用办公设备。下班时关闭电脑、打印机等设备电源。</p>
          
          <h2>每个人都是环保英雄</h2>
          <p>节能减排需要每个人的参与。从今天开始，让我们用实际行动践行绿色生活理念，为地球环保贡献自己的力量。</p>
        `
      }
    };
    
    return articles[id as keyof typeof articles] || articles['article-001'];
  };

  const articleData = getArticleData(articleId);

  useEffect(() => {
    // 增加浏览量
    setViewCount(prev => prev + 1);
  }, []);

  const handleLike = () => {
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: articleData.title,
        text: articleData.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('请先登录后再评论');
      return;
    }
    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }
    
    const comment = {
      id: comments.length + 1,
      user: user?.nickname || user?.username || '匿名用户',
      avatar: (user?.nickname || user?.username || '匿').charAt(0).toUpperCase(),
      content: newComment,
      time: '刚刚',
      likes: 0
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div className="bg-[#FAFAF9] min-h-screen relative overflow-x-hidden text-slate-600">
      {/* 全局背景氛围 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="liquid-blob absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#56B949]/15 rounded-full blur-[120px]"></div>
        <div className="liquid-blob absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F0A32F]/10 rounded-full blur-[100px]" style={{animationDelay: '-5s'}}></div>
        <div className="liquid-blob absolute bottom-[-20%] left-[10%] w-[80%] h-[60%] bg-gradient-to-tr from-[#56B949]/20 to-[#30499B]/5 rounded-full blur-[130px]" style={{animationDelay: '-10s'}}></div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-4">
              <Link href="/science" className="p-2 rounded-full bg-white/80 text-slate-400 hover:text-[#30499B] hover:bg-white transition-all shadow-sm border border-white/60">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-[#56B949]/20">YL</div>
                <span className="text-[#30499B] font-bold text-xl tracking-tight">YouthLoop</span>
              </div>
            </div>

            {/* Page Title */}
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#F0A32F]" />
              <h1 className="text-lg font-semibold text-slate-800">科普文章</h1>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              {user && isLoggedIn ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold shadow-lg">
                  <span>{user.nickname ? user.nickname.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}</span>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-semibold text-[#30499B] hover:text-[#56B949] transition-colors">
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Article Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden mb-8">
            <div className="p-8">
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-[#F0A32F]/10 text-[#F0A32F] text-sm rounded-full font-medium">
                  {articleData.category}
                </span>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{articleData.publishDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{articleData.readTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount} 次阅读</span>
                </div>
              </div>

              {/* Article Title */}
              <h1 className="text-3xl font-serif font-bold text-[#30499B] mb-4 leading-tight">
                {articleData.title}
              </h1>

              {/* Author & Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{articleData.author}</div>
                    <div className="text-sm text-slate-500">科普作者</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isLiked 
                        ? 'bg-[#F0A32F] text-white' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-[#F0A32F] hover:border-[#F0A32F]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likeCount}</span>
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-[#30499B] hover:border-[#30499B] rounded-lg transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>分享</span>
                  </button>
                </div>
              </div>

              {/* Article Summary */}
              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#30499B] mb-3">文章摘要</h3>
                <p className="text-slate-700 leading-relaxed">{articleData.summary}</p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden mb-8">
            <div className="p-8">
              <div 
                className="article-content prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: articleData.content }}
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-5 h-5 text-[#30499B]" />
                <h3 className="text-xl font-serif font-semibold text-[#30499B]">评论 ({comments.length})</h3>
              </div>

              {/* Comment Form */}
              {isLoggedIn ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-semibold flex-shrink-0">
                      <span>{user?.nickname ? user.nickname.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="写下你的想法..."
                        className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-[#30499B]/20 focus:border-[#30499B] outline-none transition-all"
                        rows={3}
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors font-medium"
                        >
                          发表评论
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 border border-slate-200 rounded-lg mb-8">
                  <p className="text-slate-500 mb-4">登录后参与讨论</p>
                  <Link href="/login" className="px-6 py-2 bg-[#30499B] text-white rounded-lg hover:bg-[#253a7a] transition-colors font-medium">
                    立即登录
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item p-4 rounded-lg border border-slate-100 hover:bg-white/60 transition-all">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#EE4035] flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-slate-800">{comment.user}</span>
                          <span className="text-xs text-slate-400">{comment.time}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-3">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#F0A32F] transition-colors">
                            <Heart className="w-3 h-3" />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="text-xs text-slate-500 hover:text-[#30499B] transition-colors">
                            回复
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

        .article-content {
          line-height: 1.8;
        }
        .article-content p {
          margin-bottom: 1.5rem;
          color: #475569;
        }
        .article-content h2 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #30499B;
          font-family: 'Cormorant Garamond', serif;
        }
        .article-content h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #56B949;
          font-family: 'Cormorant Garamond', serif;
        }

        .comment-item {
          transition: all 0.3s ease;
        }
        .comment-item:hover {
          background-color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}