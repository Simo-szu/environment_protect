'use client';

export default function TestPaginationPage() {
    return (
        <div className="min-h-screen bg-white p-8">
            <h1 className="text-2xl font-bold mb-8">测试分页组件</h1>

            {/* 简单内容 */}
            <div className="mb-8">
                <p>这是一些测试内容...</p>
                <p>这是一些测试内容...</p>
                <p>这是一些测试内容...</p>
            </div>

            {/* 分页组件 - 红色背景 */}
            <div className="w-full bg-red-500 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center items-center gap-4">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded">上一页</button>
                        <button className="w-8 h-8 bg-blue-600 text-white rounded">1</button>
                        <button className="w-8 h-8 bg-gray-200 text-gray-700 rounded">2</button>
                        <button className="w-8 h-8 bg-gray-200 text-gray-700 rounded">3</button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded">下一页</button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <p>分页组件应该在上面显示为红色背景</p>
            </div>
        </div>
    );
}