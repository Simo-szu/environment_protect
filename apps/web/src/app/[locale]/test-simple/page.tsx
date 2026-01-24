'use client';

import Layout from '@/components/Layout';

export default function TestSimplePage() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Simple Test Page</h1>
                <p>This is a simple test page without translations.</p>
            </div>
        </Layout>
    );
}