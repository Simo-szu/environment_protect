'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { searchApi } from '@/lib/api';
import type { SearchResultItem } from '@/lib/api/search';

export default function SearchPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const locale = params.locale as string;
    const initialKeyword = searchParams.get('q') || '';

    const [keyword, setKeyword] = useState(initialKeyword);
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);

    const canSearch = useMemo(() => keyword.trim().length > 0, [keyword]);

    const runSearch = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        try {
            setLoading(true);
            const response = await searchApi.searchAll({ keyword: query.trim(), page: 1, size: 20 });
            setResults(response.items);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialKeyword) {
            runSearch(initialKeyword);
        }
    }, [initialKeyword]);

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-semibold text-[#30499B] mb-4">Search</h1>

                <div className="flex gap-2 mb-6">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                runSearch(keyword);
                            }
                        }}
                        placeholder="Search content and activities"
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                    />
                    <button
                        onClick={() => runSearch(keyword)}
                        disabled={!canSearch || loading}
                        className="px-4 py-2 bg-[#30499B] text-white rounded-lg disabled:opacity-60"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <div className="space-y-3">
                    {results.map((item) => {
                        const targetPath = item.resultType === 2
                            ? `/${locale}/activities/${item.id}`
                            : `/${locale}/science/${item.id}`;
                        return (
                            <Link
                                key={item.id}
                                href={targetPath}
                                className="block p-4 border border-slate-200 rounded-xl hover:bg-slate-50"
                            >
                                <div className="text-sm text-slate-500 mb-1">
                                    {item.resultType === 2 ? 'Activity' : 'Content'}
                                </div>
                                <div className="text-base font-medium text-slate-800">{item.title}</div>
                                {item.summary && <div className="text-sm text-slate-600 mt-1">{item.summary}</div>}
                            </Link>
                        );
                    })}

                    {!loading && canSearch && results.length === 0 && (
                        <div className="text-slate-500">No results found.</div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

