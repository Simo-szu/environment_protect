'use client';

import Layout from '@/components/Layout';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Search, MessageCircle, Phone, Mail, Clock } from 'lucide-react';

export default function HelpPage() {
    const faqData = [
        {
            category: '账户相关',
            questions: [
                {
                    q: '如何注册YouthLoop账户？',
                    a: '点击首页右上角的"注册"按钮，填写必要信息即可完成注册。您也可以使用第三方账户快速登录。'
                },
                {
                    q: '忘记密码怎么办？',
                    a: '在登录页面点击"忘记密码"，输入注册邮箱，我们会发送重置密码的链接到您的邮箱。'
                },
                {
                    q: '如何修改个人资料？',
                    a: '登录后进入"个人中心"，点击"编辑资料"即可修改您的个人信息。'
                }
            ]
        },
        {
            category: '活动参与',
            questions: [
                {
                    q: '如何报名参加环保活动？',
                    a: '浏览活动广场，选择感兴趣的活动，点击"立即报名"并填写相关信息即可。'
                },
                {
                    q: '报名后可以取消吗？',
                    a: '可以的。在活动开始前24小时，您可以在"我的活动"中取消报名。'
                },
                {
                    q: '活动取消了怎么办？',
                    a: '如果活动因故取消，我们会及时通知所有报名用户，并提供替代活动选择。'
                }
            ]
        },
        {
            category: '积分系统',
            questions: [
                {
                    q: '如何获得积分？',
                    a: '参与环保活动、完成每日签到、分享环保知识、邀请好友等都可以获得积分奖励。'
                },
                {
                    q: '积分有什么用？',
                    a: '积分可以用来兑换环保礼品、参与特殊活动、提升用户等级等。'
                },
                {
                    q: '积分会过期吗？',
                    a: '积分有效期为2年，超过有效期的积分会自动清零。'
                }
            ]
        }
    ];

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-[#30499B] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回首页
                    </Link>
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
                        <HelpCircle className="w-3 h-3" />
                        帮助支持
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">帮助中心</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        欢迎来到YouthLoop帮助中心！这里有您需要的所有信息和支持。如果找不到答案，请随时联系我们的客服团队。
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 快速联系 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg sticky top-8">
                            <h3 className="text-lg font-semibold text-[#30499B] mb-4">快速联系</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-[#56B949]" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">客服热线</p>
                                        <p className="text-sm text-slate-600">400-123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-[#30499B]" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">邮箱支持</p>
                                        <p className="text-sm text-slate-600">help@youthloop.org</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <MessageCircle className="w-5 h-5 text-[#F0A32F]" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">在线客服</p>
                                        <p className="text-sm text-slate-600">工作日 9:00-18:00</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-[#EE4035]" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">服务时间</p>
                                        <p className="text-sm text-slate-600">7×24小时</p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/contact"
                                className="w-full mt-6 py-2 px-4 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium text-center block hover:shadow-lg transition-all duration-300"
                            >
                                联系我们
                            </Link>
                        </div>
                    </div>

                    {/* FAQ内容 */}
                    <div className="lg:col-span-3">
                        {/* 搜索框 */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-lg mb-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="搜索帮助内容..."
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* FAQ列表 */}
                        <div className="space-y-8">
                            {faqData.map((category, categoryIndex) => (
                                <div key={categoryIndex} className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                                    <h2 className="text-xl font-semibold text-[#30499B] mb-6">{category.category}</h2>

                                    <div className="space-y-6">
                                        {category.questions.map((item, itemIndex) => (
                                            <div key={itemIndex} className="border-b border-slate-200 last:border-b-0 pb-6 last:pb-0">
                                                <h3 className="text-lg font-medium text-slate-800 mb-3">{item.q}</h3>
                                                <p className="text-slate-600 leading-relaxed">{item.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 更多帮助 */}
                        <div className="bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 rounded-xl p-8 border border-[#56B949]/20 mt-8">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-[#30499B] mb-4">还有其他问题？</h3>
                                <p className="text-slate-600 mb-6">
                                    如果您没有找到需要的答案，我们的客服团队随时为您提供帮助。
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/contact"
                                        className="px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                                    >
                                        联系客服
                                    </Link>
                                    <Link
                                        href="/feedback"
                                        className="px-6 py-3 border border-[#56B949] text-[#56B949] rounded-lg font-medium hover:bg-[#56B949] hover:text-white transition-all duration-300"
                                    >
                                        意见反馈
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}