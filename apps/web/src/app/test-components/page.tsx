import Layout from '@/components/Layout';

export default function TestComponentsPage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <section className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white via-[#56B949]/5 to-white rounded-2xl mb-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#30499B] mb-6 drop-shadow-sm leading-tight">
                        组件<span className="text-[#56B949]">测试</span>页面
                    </h1>
                    <p className="text-lg text-slate-600 mb-8">
                        这个页面用于测试 YouthLoop Next.js 统一UI组件系统的功能
                    </p>
                </section>

                {/* 测试内容区域 */}
                <div className="bg-white px-6 py-12 rounded-2xl shadow-sm border border-slate-100 space-y-8">

                    <div className="text-center">
                        <h2 className="text-2xl font-serif font-semibold text-[#30499B] mb-4">组件功能测试</h2>
                        <p className="text-slate-600 mb-8">滚动页面测试回到顶部按钮，检查Header和Footer是否正确显示</p>
                    </div>

                    {/* 测试卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-[#56B949]/10 flex items-center justify-center text-[#56B949] mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[#30499B] mb-2">回到顶部按钮</h3>
                            <p className="text-sm text-slate-500">滚动页面超过300px后，右下角会出现回到顶部按钮</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-[#30499B]/10 flex items-center justify-center text-[#30499B] mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[#30499B] mb-2">认证Header</h3>
                            <p className="text-sm text-slate-500">集成用户认证，自动检测页面类型，显示对应的导航栏样式</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-[#F0A32F]/10 flex items-center justify-center text-[#F0A32F] mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[#30499B] mb-2">统一Footer</h3>
                            <p className="text-sm text-slate-500">根据页面类型显示完整或简化的页脚</p>
                        </div>
                    </div>

                    {/* 长内容用于测试滚动 */}
                    <div className="space-y-6 pt-8">
                        <h3 className="text-xl font-serif font-semibold text-[#30499B]">Next.js 组件特性</h3>

                        <div className="space-y-4 text-slate-600">
                            <p>这些组件专为 Next.js 13+ App Router 设计，使用了最新的 React 18+ 特性和 TypeScript 类型安全。</p>

                            <p>所有组件都使用 'use client' 指令，确保在客户端正确渲染交互功能。同时集成了 Next.js 的路由系统，能够自动检测当前页面并应用相应的样式。</p>

                            <p>组件系统采用了模块化设计，每个组件都可以独立使用，也可以通过 Layout 组件统一管理。</p>

                            <div className="bg-gradient-to-r from-[#56B949]/10 to-[#30499B]/10 rounded-xl p-6 my-8">
                                <h4 className="text-lg font-semibold text-[#30499B] mb-2">技术栈</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#56B949] rounded-full"></span>
                                        React 18+ with Hooks
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#30499B] rounded-full"></span>
                                        Next.js 13+ App Router
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#F0A32F] rounded-full"></span>
                                        TypeScript 类型安全
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#EE4035] rounded-full"></span>
                                        Tailwind CSS 样式
                                    </li>
                                </ul>
                            </div>

                            {/* 更多内容用于测试滚动 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-[#30499B]">组件优势</h4>
                                    <p>统一的设计语言确保了整个应用的视觉一致性，提升了用户体验。</p>
                                    <p>TypeScript 接口定义提供了完整的类型检查，减少了运行时错误。</p>
                                    <p>响应式设计确保在各种设备上都有良好的显示效果。</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-[#30499B]">性能优化</h4>
                                    <p>使用 requestAnimationFrame 优化滚动监听性能。</p>
                                    <p>条件渲染减少不必要的DOM操作。</p>
                                    <p>组件懒加载和代码分割提升页面加载速度。</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 text-center">
                                <h4 className="text-lg font-semibold text-[#30499B] mb-2">测试完成</h4>
                                <p className="text-slate-600">如果您能看到统一的Header和Footer，并且回到顶部按钮正常工作，说明 Next.js 组件系统运行正常！</p>
                                <div className="mt-4 flex justify-center gap-4">
                                    <span className="px-3 py-1 bg-[#56B949]/10 text-[#56B949] rounded-full text-sm font-medium">✓ Header 正常</span>
                                    <span className="px-3 py-1 bg-[#30499B]/10 text-[#30499B] rounded-full text-sm font-medium">✓ Footer 正常</span>
                                    <span className="px-3 py-1 bg-[#F0A32F]/10 text-[#F0A32F] rounded-full text-sm font-medium">✓ 回到顶部正常</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}