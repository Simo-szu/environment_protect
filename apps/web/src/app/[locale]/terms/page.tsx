'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import BackButton from '@/components/ui/BackButton';
import { FileText } from 'lucide-react';

export default function TermsPage() {
    const params = useParams();
    const locale = params.locale as string;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <BackButton fallbackUrl={`/${locale}`} />
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
                        <FileText className="w-3 h-3" />
                        法律条款
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">用户服务协议</h1>
                    <p className="text-slate-600">最后更新时间：2024年1月</p>
                </div>

                {/* 协议内容 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                    <div className="prose prose-slate max-w-none">
                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">1. 服务条款的接受</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            欢迎使用YouthLoop环保平台！当您注册、访问或使用我们的服务时，即表示您同意遵守本用户服务协议（以下简称"协议"）的所有条款和条件。如果您不同意本协议的任何部分，请不要使用我们的服务。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">2. 服务描述</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            YouthLoop是一个致力于环保教育和行动的在线平台，我们提供以下服务：
                        </p>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>环保知识科普和教育内容</li>
                            <li>环保活动组织和参与平台</li>
                            <li>用户互动和社区功能</li>
                            <li>积分奖励和成就系统</li>
                            <li>环保游戏和模拟体验</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">3. 用户账户</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            为了使用我们的某些服务，您需要创建一个账户。您同意：
                        </p>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>提供准确、完整和最新的注册信息</li>
                            <li>维护账户信息的准确性</li>
                            <li>保护您的账户密码安全</li>
                            <li>对您账户下的所有活动负责</li>
                            <li>如发现未经授权使用，立即通知我们</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">4. 用户行为规范</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            在使用我们的服务时，您同意不会：
                        </p>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>发布违法、有害、威胁、辱骂或诽谤性内容</li>
                            <li>侵犯他人的知识产权或其他权利</li>
                            <li>传播垃圾信息或进行商业推广</li>
                            <li>干扰或破坏服务的正常运行</li>
                            <li>使用自动化工具访问服务</li>
                            <li>冒充他人或虚假陈述身份</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">5. 内容和知识产权</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            您在平台上发布的内容仍归您所有，但您授予我们使用、修改、展示和分发该内容的权利。我们平台上的所有内容，包括文本、图片、视频、软件等，均受知识产权法保护。未经许可，您不得复制、修改或分发这些内容。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">6. 隐私保护</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            我们重视您的隐私。我们收集、使用和保护您个人信息的方式详见我们的《隐私政策》。使用我们的服务即表示您同意我们按照隐私政策处理您的信息。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">7. 服务变更和终止</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            我们保留随时修改、暂停或终止服务的权利。我们会尽力提前通知重大变更。如果您违反本协议，我们有权暂停或终止您的账户。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">8. 免责声明</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            我们的服务按"现状"提供，不提供任何明示或暗示的保证。我们不对服务的可用性、准确性或可靠性承担责任。在法律允许的最大范围内，我们不承担任何间接、偶然或后果性损害的责任。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">9. 争议解决</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            本协议受中华人民共和国法律管辖。因本协议引起的任何争议，双方应首先通过友好协商解决；协商不成的，可向有管辖权的人民法院提起诉讼。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">10. 联系我们</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            如果您对本协议有任何疑问，请通过以下方式联系我们：
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                            <p>邮箱：legal@youthloop.org</p>
                            <p>电话：400-123-4567</p>
                            <p>地址：北京市朝阳区环保大厦</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}