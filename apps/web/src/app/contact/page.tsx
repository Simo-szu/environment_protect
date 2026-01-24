'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Clock,
    MessageCircle,
    Send,
    CheckCircle,
    Users,
    Globe,
    Heart
} from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 这里应该调用API提交联系信息
        console.log('提交联系信息:', formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white mx-auto mb-6">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-4">
                            消息发送成功！
                        </h2>
                        <p className="text-slate-600 mb-8">
                            感谢您的联系，我们会在24小时内回复您的消息。
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/"
                                className="px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                            >
                                返回首页
                            </Link>
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setFormData({
                                        name: '',
                                        email: '',
                                        phone: '',
                                        subject: '',
                                        message: ''
                                    });
                                }}
                                className="px-6 py-3 border border-[#56B949] text-[#56B949] rounded-lg font-medium hover:bg-[#56B949] hover:text-white transition-all duration-300"
                            >
                                继续联系
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <BackButton fallbackUrl="/" />
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
                        <MessageCircle className="w-3 h-3" />
                        联系我们
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">联系我们</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        有任何问题或建议？我们很乐意听到您的声音。选择最适合您的联系方式，我们会尽快回复。
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 联系信息 */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 联系方式卡片 */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg">
                            <h3 className="text-lg font-semibold text-[#30499B] mb-6">联系方式</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#56B949]/10 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-[#56B949]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">客服热线</p>
                                        <p className="text-slate-600">400-123-4567</p>
                                        <p className="text-xs text-slate-500">工作日 9:00-18:00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#30499B]/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-[#30499B]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">邮箱地址</p>
                                        <p className="text-slate-600">contact@youthloop.org</p>
                                        <p className="text-xs text-slate-500">24小时内回复</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#F0A32F]/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-[#F0A32F]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">办公地址</p>
                                        <p className="text-slate-600">北京市朝阳区环保大厦</p>
                                        <p className="text-xs text-slate-500">邮编：100020</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#EE4035]/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-[#EE4035]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">服务时间</p>
                                        <p className="text-slate-600">周一至周日</p>
                                        <p className="text-xs text-slate-500">7×24小时在线支持</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 关于我们 */}
                        <div className="bg-gradient-to-br from-[#56B949]/10 to-[#F0A32F]/10 rounded-xl p-6 border border-[#56B949]/20">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-serif font-bold text-xl mx-auto mb-4">
                                    YL
                                </div>
                                <h4 className="font-semibold text-[#30499B] mb-2">YouthLoop</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    让绿色循环，用行动改变未来
                                </p>
                                <div className="flex justify-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>10万+用户</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        <span>全国服务</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-3 h-3" />
                                        <span>环保使命</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 联系表单 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                            <h3 className="text-xl font-semibold text-[#30499B] mb-6">发送消息</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            姓名 *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder="请输入您的姓名"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            邮箱 *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder="请输入您的邮箱"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            电话
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            placeholder="请输入您的电话"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            主题 *
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                            required
                                        >
                                            <option value="">请选择主题</option>
                                            <option value="general">一般咨询</option>
                                            <option value="activity">活动相关</option>
                                            <option value="technical">技术支持</option>
                                            <option value="partnership">合作洽谈</option>
                                            <option value="feedback">意见反馈</option>
                                            <option value="other">其他</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        消息内容 *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors resize-none"
                                        placeholder="请详细描述您的问题或需求..."
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-slate-200">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <Send className="w-4 h-4" />
                                        发送消息
                                    </button>
                                    <Link
                                        href="/"
                                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        取消
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* 快速链接 */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link
                                href="/help"
                                className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:border-[#56B949] transition-colors text-center"
                            >
                                <div className="w-8 h-8 rounded-lg bg-[#56B949]/10 flex items-center justify-center mx-auto mb-2">
                                    <MessageCircle className="w-4 h-4 text-[#56B949]" />
                                </div>
                                <p className="font-medium text-slate-800 text-sm">帮助中心</p>
                                <p className="text-xs text-slate-600">常见问题解答</p>
                            </Link>

                            <Link
                                href="/feedback"
                                className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:border-[#F0A32F] transition-colors text-center"
                            >
                                <div className="w-8 h-8 rounded-lg bg-[#F0A32F]/10 flex items-center justify-center mx-auto mb-2">
                                    <Send className="w-4 h-4 text-[#F0A32F]" />
                                </div>
                                <p className="font-medium text-slate-800 text-sm">意见反馈</p>
                                <p className="text-xs text-slate-600">产品建议反馈</p>
                            </Link>

                            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 text-center">
                                <div className="w-8 h-8 rounded-lg bg-[#30499B]/10 flex items-center justify-center mx-auto mb-2">
                                    <Phone className="w-4 h-4 text-[#30499B]" />
                                </div>
                                <p className="font-medium text-slate-800 text-sm">紧急联系</p>
                                <p className="text-xs text-slate-600">400-123-4567</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}