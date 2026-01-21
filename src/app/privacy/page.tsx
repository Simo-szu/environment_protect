'use client';

import Layout from '@/components/Layout';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-[#30499B] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回登录
                    </Link>
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#56B949]/10 text-[#56B949] text-xs font-semibold mb-4 border border-[#56B949]/20">
                        <Shield className="w-3 h-3" />
                        隐私保护
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] mb-4">隐私政策</h1>
                    <p className="text-slate-600">最后更新时间：2024年1月</p>
                </div>

                {/* 隐私政策内容 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 shadow-lg">
                    <div className="prose prose-slate max-w-none">
                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">1. 引言</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            YouthLoop（以下简称"我们"）非常重视用户的隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策的条款。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">2. 我们收集的信息</h2>

                        <h3 className="text-lg font-medium text-[#30499B] mb-3">2.1 您主动提供的信息</h3>
                        <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                            <li>注册信息：用户名、密码、邮箱、手机号码</li>
                            <li>个人资料：昵称、头像、性别、年龄、地区</li>
                            <li>活动参与：报名信息、参与记录、反馈意见</li>
                            <li>用户生成内容：评论、分享、上传的图片和文本</li>
                        </ul>

                        <h3 className="text-lg font-medium text-[#30499B] mb-3">2.2 自动收集的信息</h3>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>设备信息：设备型号、操作系统、浏览器类型</li>
                            <li>使用数据：访问时间、页面浏览记录、功能使用情况</li>
                            <li>位置信息：IP地址、大致地理位置（仅在您同意的情况下）</li>
                            <li>Cookie和类似技术收集的信息</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">3. 信息使用目的</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            我们使用收集的信息用于以下目的：
                        </p>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>提供、维护和改进我们的服务</li>
                            <li>处理您的注册和账户管理</li>
                            <li>组织和管理环保活动</li>
                            <li>个性化内容推荐和用户体验</li>
                            <li>发送服务通知和重要更新</li>
                            <li>防止欺诈和确保平台安全</li>
                            <li>遵守法律法规要求</li>
                            <li>进行数据分析以改善服务质量</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">4. 信息共享和披露</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            我们不会出售、租赁或交易您的个人信息。我们仅在以下情况下共享您的信息：
                        </p>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>获得您的明确同意</li>
                            <li>与服务提供商共享以支持我们的服务运营</li>
                            <li>遵守法律法规、法院命令或政府要求</li>
                            <li>保护我们或他人的权利、财产或安全</li>
                            <li>在业务转让或合并情况下</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">5. 数据安全</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            我们采取多种安全措施保护您的个人信息：
                        </p>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>使用SSL加密传输敏感数据</li>
                            <li>实施访问控制和身份验证</li>
                            <li>定期进行安全审计和漏洞扫描</li>
                            <li>员工隐私培训和保密协议</li>
                            <li>数据备份和灾难恢复计划</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">6. 数据保留</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            我们仅在必要期间保留您的个人信息。具体保留期限取决于信息类型和使用目的。当信息不再需要时，我们会安全删除或匿名化处理。您可以随时要求删除您的账户和相关数据。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">7. 您的权利</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            根据适用的隐私法律，您享有以下权利：
                        </p>
                        <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                            <li>访问和查看您的个人信息</li>
                            <li>更正不准确或不完整的信息</li>
                            <li>删除您的个人信息</li>
                            <li>限制或反对信息处理</li>
                            <li>数据可携带权</li>
                            <li>撤回同意（在基于同意处理的情况下）</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">8. Cookie政策</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            我们使用Cookie和类似技术来改善用户体验、分析网站使用情况和提供个性化内容。您可以通过浏览器设置管理Cookie偏好，但这可能影响某些功能的正常使用。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">9. 儿童隐私</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            我们的服务主要面向13岁以上的用户。如果我们发现收集了13岁以下儿童的个人信息，我们会立即删除这些信息。如果您是家长或监护人，发现您的孩子向我们提供了个人信息，请联系我们。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">10. 政策更新</h2>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            我们可能会不时更新本隐私政策。重大变更会通过网站通知、邮件或其他适当方式告知您。继续使用我们的服务即表示您接受更新后的政策。
                        </p>

                        <h2 className="text-xl font-semibold text-[#30499B] mb-4">11. 联系我们</h2>
                        <p className="text-slate-700 mb-4 leading-relaxed">
                            如果您对本隐私政策有任何疑问或需要行使您的权利，请联系我们：
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                            <p>隐私保护专员邮箱：privacy@youthloop.org</p>
                            <p>客服电话：400-123-4567</p>
                            <p>邮寄地址：北京市朝阳区环保大厦 隐私保护部</p>
                            <p>在线客服：工作日 9:00-18:00</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}