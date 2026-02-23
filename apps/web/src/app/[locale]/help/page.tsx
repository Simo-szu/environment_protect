'use client';

import Layout from '@/components/Layout';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import { useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { searchApi } from '@/lib/api';
import { HelpCircle, Search, MessageCircle, Phone, Mail, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HelpPage() {
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('help');
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setSuggestions([]);
                return;
            }
            try {
                const words = await searchApi.suggestKeywords(query.trim());
                setSuggestions(words.slice(0, 6));
            } catch {
                setSuggestions([]);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    const faqData = [
        {
            category: t('faq.account.title'),
            questions: [
                {
                    q: t('faq.account.register.q'),
                    a: t('faq.account.register.a')
                },
                {
                    q: t('faq.account.password.q'),
                    a: t('faq.account.password.a')
                },
                {
                    q: t('faq.account.profile.q'),
                    a: t('faq.account.profile.a')
                }
            ]
        },
        {
            category: t('faq.activities.title'),
            questions: [
                {
                    q: t('faq.activities.register.q'),
                    a: t('faq.activities.register.a')
                },
                {
                    q: t('faq.activities.cancel.q'),
                    a: t('faq.activities.cancel.a')
                },
                {
                    q: t('faq.activities.cancelled.q'),
                    a: t('faq.activities.cancelled.a')
                }
            ]
        },
        {
            category: t('faq.points.title'),
            questions: [
                {
                    q: t('faq.points.earn.q'),
                    a: t('faq.points.earn.a')
                },
                {
                    q: t('faq.points.use.q'),
                    a: t('faq.points.use.a')
                },
                {
                    q: t('faq.points.expire.q'),
                    a: t('faq.points.expire.a')
                }
            ]
        }
    ];

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按钮 */}
                <div className="mb-6">
                    <BackButton fallbackUrl={`/${locale}`} />
                </div>

                {/* 页面标题 */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30499B]/10 text-[#30499B] text-xs font-semibold mb-4 border border-[#30499B]/20">
                        <HelpCircle className="w-3 h-3" />
                        {t('badge')}
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-[#30499B] dark:text-white mb-4">{t('title')}</h1>
                    <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 快速联系 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 dark:border-slate-800 shadow-lg sticky top-8">
                            <h3 className="text-lg font-semibold text-[#30499B] dark:text-blue-400 mb-4">{t('quickContact.title')}</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <Phone className="w-5 h-5 text-[#56B949]" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('quickContact.phone.title')}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('quickContact.phone.number')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <Mail className="w-5 h-5 text-[#30499B] dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('quickContact.email.title')}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('quickContact.email.address')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <MessageCircle className="w-5 h-5 text-[#F0A32F]" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('quickContact.chat.title')}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('quickContact.chat.hours')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <Clock className="w-5 h-5 text-[#EE4035]" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('quickContact.hours.title')}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('quickContact.hours.schedule')}</p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/${locale}/contact`}
                                className="w-full mt-6 py-2 px-4 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium text-center block hover:shadow-lg transition-all duration-300"
                            >
                                {t('quickContact.contactUs')}
                            </Link>
                        </div>
                    </div>

                    {/* FAQ内容 */}
                    <div className="lg:col-span-3">
                        {/* 搜索框 */}
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 dark:border-slate-800 shadow-lg mb-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && query.trim()) {
                                            window.location.href = `/${locale}/search?q=${encodeURIComponent(query.trim())}`;
                                        }
                                    }}
                                    placeholder={t('search.placeholder')}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:border-[#56B949] focus:outline-none transition-colors"
                                />
                            </div>
                            {suggestions.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {suggestions.map((item) => (
                                        <Link
                                            key={item}
                                            href={`/${locale}/search?q=${encodeURIComponent(item)}`}
                                            className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        >
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FAQ列表 */}
                        <div className="space-y-8">
                            {faqData.map((category, categoryIndex) => (
                                <div key={categoryIndex} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-8 border border-white/60 dark:border-slate-800 shadow-lg">
                                    <h2 className="text-xl font-semibold text-[#30499B] dark:text-blue-400 mb-6">{category.category}</h2>

                                    <div className="space-y-6">
                                        {category.questions.map((item, itemIndex) => (
                                            <div key={itemIndex} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 pb-6 last:pb-0">
                                                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">{item.q}</h3>
                                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 更多帮助 */}
                        <div className="bg-gradient-to-r from-[#56B949]/10 to-[#F0A32F]/10 dark:from-[#56B949]/5 dark:to-[#F0A32F]/5 rounded-xl p-8 border border-[#56B949]/20 dark:border-[#56B949]/10 mt-8">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-[#30499B] dark:text-white mb-4">{t('moreHelp.title')}</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {t('moreHelp.description')}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href={`/${locale}/contact`}
                                        className="px-6 py-3 bg-gradient-to-r from-[#56B949] to-[#F0A32F] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                                    >
                                        {t('moreHelp.contactService')}
                                    </Link>
                                    <Link
                                        href={`/${locale}/feedback`}
                                        className="px-6 py-3 border border-[#56B949] text-[#56B949] rounded-lg font-medium hover:bg-[#56B949] hover:text-white transition-all duration-300"
                                    >
                                        {t('moreHelp.feedback')}
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
