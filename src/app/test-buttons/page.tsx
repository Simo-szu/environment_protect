'use client';

import Layout from '@/components/Layout';

export default function TestButtonsPage() {
    return (
        <Layout>
            <div className="min-h-screen p-8">
                <h1 className="text-3xl font-bold text-[#30499B] dark:text-[#56B949] mb-8 transition-colors duration-300">
                    测试按钮页面
                </h1>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                            右下角按钮测试
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            请查看页面右下角，应该能看到两个按钮：
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li>🌙 主题切换按钮（右下角）- 点击展开三个主题选项</li>
                            <li>⬆️ 回到顶部按钮（主题按钮左边）- 滚动页面后显示</li>
                        </ul>
                    </div>

                    {/* 添加一些内容让页面可以滚动 */}
                    {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">
                                测试内容 {i + 1}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                这是一些测试内容，用来让页面变长，这样你就可以测试回到顶部按钮的功能了。
                                滚动到页面下方，然后你应该能看到回到顶部按钮出现。
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}