'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
    Coins,
    User,
    CheckCircle,
    XCircle,
    RefreshCw,
    BookOpen,
    Share2,
    Gift,
    Star,
    Sprout,
    Leaf
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { fadeUp, staggerContainer, staggerItem, pageEnter, cardEnter } from '@/lib/animations';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

function PointsPageContent() {
    const { user, isLoggedIn } = useAuth();
    const { t } = useSafeTranslation('points');
    const [quizStates, setQuizStates] = useState<{ [key: number]: { answered: boolean; correct: boolean } }>({
        1: { answered: false, correct: false },
        2: { answered: false, correct: false },
        3: { answered: false, correct: false }
    });

    // 签到状态管理
    const [checkedInDays, setCheckedInDays] = useState<number[]>([1, 2]); // 已签到的日期
    const [todayCheckedIn, setTodayCheckedIn] = useState(false); // 今日是否已签到
    const [showCheckInAnimation, setShowCheckInAnimation] = useState(false); // 签到动画
    const currentDay = 5; // 当前日期

    // 每日问答刷新状态管理
    const [refreshCount, setRefreshCount] = useState(0); // 今日已刷新次数
    const maxRefreshCount = 5; // 每日最大刷新次数
    const [currentQuizSet, setCurrentQuizSet] = useState(0); // 当前题目集

    // 题库 - 多套环保知识问答
    const getQuizSets = () => [
        // 第一套题目（默认）
        {
            quiz1: {
                question: t('quiz.set1.q1.question', '哪种垃圾属于可回收垃圾？'),
                options: [
                    { text: t('quiz.set1.q1.optionA', 'A. 废纸'), correct: true },
                    { text: t('quiz.set1.q1.optionB', 'B. 电池'), correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: t('quiz.set1.q2.question', '一个塑料瓶完全分解需要多少年？'),
                type: "fill",
                answer: "450",
                points: 10
            },
            quiz3: {
                question: t('quiz.set1.q3.question', '以下哪项不是节能减排的方法？'),
                options: [
                    { text: t('quiz.set1.q3.optionA', 'A. 使用LED灯泡'), correct: false },
                    { text: t('quiz.set1.q3.optionB', 'B. 长时间开空调'), correct: true }
                ],
                points: 15
            }
        },
        // 第二套题目
        {
            quiz1: {
                question: t('quiz.set2.q1.question', '微塑料污染主要来源于哪里？'),
                options: [
                    { text: t('quiz.set2.q1.optionA', 'A. 轮胎磨损颗粒'), correct: true },
                    { text: t('quiz.set2.q1.optionB', 'B. 天然橡胶'), correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: t('quiz.set2.q2.question', '生活垃圾可分为几大类？'),
                type: "fill",
                answer: "4",
                points: 10
            },
            quiz3: {
                question: t('quiz.set2.q3.question', '哪种能源属于可再生能源？'),
                options: [
                    { text: t('quiz.set2.q3.optionA', 'A. 煤炭'), correct: false },
                    { text: t('quiz.set2.q3.optionB', 'B. 太阳能'), correct: true }
                ],
                points: 15
            }
        },
        // 第三套题目
        {
            quiz1: {
                question: t('quiz.set3.q1.question', '以下哪项是造成温室效应的主要气体？'),
                options: [
                    { text: t('quiz.set3.q1.optionA', 'A. 二氧化碳'), correct: true },
                    { text: t('quiz.set3.q1.optionB', 'B. 氧气'), correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: t('quiz.set3.q2.question', '一棵成年树每年能吸收多少公斤二氧化碳？（约数）'),
                type: "fill",
                answer: "22",
                points: 10
            },
            quiz3: {
                question: t('quiz.set3.q3.question', '生物多样性保护最重要的措施是？'),
                options: [
                    { text: t('quiz.set3.q3.optionA', 'A. 建设更多城市'), correct: false },
                    { text: t('quiz.set3.q3.optionB', 'B. 保护自然栖息地'), correct: true }
                ],
                points: 15
            }
        },
        // 第四套题目
        {
            quiz1: {
                question: t('quiz.set4.q1.question', '海洋塑料垃圾的主要危害是？'),
                options: [
                    { text: t('quiz.set4.q1.optionA', 'A. 影响海洋生物生存'), correct: true },
                    { text: t('quiz.set4.q1.optionB', 'B. 增加海水盐分'), correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: t('quiz.set4.q2.question', '节约用水，每次刷牙时关闭水龙头可节约多少升水？'),
                type: "fill",
                answer: "6",
                points: 10
            },
            quiz3: {
                question: t('quiz.set4.q3.question', '以下哪种交通方式最环保？'),
                options: [
                    { text: t('quiz.set4.q3.optionA', 'A. 私家车'), correct: false },
                    { text: t('quiz.set4.q3.optionB', 'B. 自行车'), correct: true }
                ],
                points: 15
            }
        },
        // 第五套题目
        {
            quiz1: {
                question: t('quiz.set5.q1.question', '森林砍伐的主要环境影响是？'),
                options: [
                    { text: t('quiz.set5.q1.optionA', 'A. 加剧气候变化'), correct: true },
                    { text: t('quiz.set5.q1.optionB', 'B. 增加降雨量'), correct: false }
                ],
                points: 5
            },
            quiz2: {
                question: t('quiz.set5.q2.question', '全球每年产生多少亿吨塑料垃圾？（约数）'),
                type: "fill",
                answer: "3",
                points: 10
            },
            quiz3: {
                question: t('quiz.set5.q3.question', '哪种做法有助于减少碳足迹？'),
                options: [
                    { text: t('quiz.set5.q3.optionA', 'A. 增加肉类消费'), correct: false },
                    { text: t('quiz.set5.q3.optionB', 'B. 选择本地食材'), correct: true }
                ],
                points: 15
            }
        }
    ];

    const quizSets = getQuizSets();

    // 处理签到
    const handleCheckIn = () => {
        if (todayCheckedIn) return; // 已签到则不能重复签到

        setShowCheckInAnimation(true);
        setTodayCheckedIn(true);
        setCheckedInDays(prev => [...prev, currentDay]);

        // 动画结束后重置
        setTimeout(() => {
            setShowCheckInAnimation(false);
        }, 1000);
    };

    // 处理问答刷新
    const handleRefreshQuiz = () => {
        if (refreshCount >= maxRefreshCount) return; // 达到最大刷新次数

        setRefreshCount(prev => prev + 1);
        // 使用确定性的方式选择新的题目集，避免随机数导致hydration mismatch
        const newQuizSet = (currentQuizSet + 1) % quizSets.length;
        setCurrentQuizSet(newQuizSet);
        // 重置所有问答状态
        setQuizStates({
            1: { answered: false, correct: false },
            2: { answered: false, correct: false },
            3: { answered: false, correct: false }
        });

        console.log('问答已刷新，当前题目集：', newQuizSet + 1, '剩余次数：', maxRefreshCount - refreshCount - 1);
    };

    // 获取当前题目集
    const getCurrentQuiz = (quizId: number): any => {
        return quizSets[currentQuizSet][`quiz${quizId}` as keyof typeof quizSets[0]];
    };

    // 处理问答答案
    const handleQuizAnswer = (quizId: number, answerType: 'correct' | 'wrong') => {
        const isCorrect = answerType === 'correct';
        setQuizStates(prev => ({
            ...prev,
            [quizId]: { answered: true, correct: isCorrect }
        }));
    };

    // 处理填空题
    const handleFillBlank = (quizId: number, value: string) => {
        const currentQuiz = getCurrentQuiz(quizId);
        const isCorrect = value.trim() === currentQuiz.answer;
        setQuizStates(prev => ({
            ...prev,
            [quizId]: { answered: value.length > 0, correct: isCorrect }
        }));
    };

    // 提交问答
    const submitQuiz = (quizId: number) => {
        const state = quizStates[quizId];
        if (!state.answered) return;

        console.log(`Quiz ${quizId} submitted:`, state);
    };

    return (
        <Layout>
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={pageEnter}
                className="text-center py-12 sm:py-14 px-4 bg-gradient-to-b from-white via-[#F0A32F]/5 to-white"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-semibold mb-4 border border-[#F0A32F]/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A32F] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0A32F]"></span>
                    </span>
                    {t('badge', '积分奖励系统')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-[#30499B] mb-6 drop-shadow-sm leading-tight">
                    {t('title', '积分')}<span className="text-[#F0A32F]">{t('paradise', '乐园')}</span>
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base sm:text-lg text-[#30499B]/80 font-normal max-w-lg mx-auto leading-relaxed px-4">
                    <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-[#F0A32F]" />
                        <span>{t('subtitle.complete', '完成')}<span className="text-[#F0A32F] font-medium border-b-2 border-[#F0A32F]/30">{t('subtitle.tasks', '任务')}</span>{t('subtitle.earnPoints', '赚积分，')}</span>
                    </div>
                    <span>{t('subtitle.use', '用')}<span className="text-[#56B949] font-medium border-b-2 border-[#56B949]/30">{t('subtitle.action', '行动')}</span>{t('subtitle.getRewards', '换奖励')}</span>
                </div>
            </motion.section>

            {/* 积分中心主体内容 */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="bg-white px-4 sm:px-6 md:px-12 py-12 space-y-16 border-t border-slate-100"
            >

                {/* 1. 用户积分概览 User Overview */}
                <motion.section
                    variants={staggerItem}
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0A32F]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* 头像区 */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg shadow-slate-200 flex items-center justify-center overflow-hidden">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[#30499B] text-white text-xs font-bold shadow-md shadow-[#30499B]/20">
                                {t('level', 'Lv.3 绿色见习者')}
                            </span>
                        </div>

                        {/* 积分与进度 */}
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-serif font-bold text-[#30499B]">100</span>
                                <div className="px-2 py-0.5 rounded bg-[#F0A32F]/10 text-[#F0A32F] text-xs font-bold border border-[#F0A32F]/20 flex items-center gap-1">
                                    <Coins className="w-3 h-3" /> {t('points', '积分')}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-[#30499B]/70 font-medium">
                                    <span>{t('progress.current', '当前进度')}</span>
                                    <span>{t('progress.nextBadge', '距离下一个徽章还差')} <span className="text-[#EE4035]">50</span> {t('progress.points', '积分')}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-[#56B949] to-[#30499B] rounded-full relative w-2/3">
                                        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                                        {/* 闪光特效 */}
                                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] skew-x-12 translate-x-[-100%]"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Lv.3</span>
                                    <span>Lv.4</span>
                                </div>
                            </div>
                        </div>

                        {/* 右侧按钮 */}
                        <div className="flex-shrink-0 flex md:flex-col gap-3">
                            <button className="px-6 py-2.5 rounded-xl bg-[#56B949] text-white text-sm font-semibold shadow-lg shadow-[#56B949]/20 hover:bg-[#4aa840] transition-all hover:-translate-y-0.5">
                                {t('exchangeStore', '兑换商城')}
                            </button>
                            <button className="px-6 py-2.5 rounded-xl bg-white text-[#30499B] border border-slate-200 text-sm font-semibold hover:border-[#30499B]/30 transition-all hover:bg-slate-50">
                                {t('pointsHistory', '积分记录')}
                            </button>
                        </div>
                    </div>
                </motion.section>

                <motion.div
                    variants={staggerItem}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* 2. 签到日历 Check-in Calendar */}
                    <motion.section
                        variants={cardEnter}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#30499B] font-serif">
                                {t('signInCalendar', '签到日历')}
                            </h3>
                            <div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                {t('currentMonth', '2024年5月')}
                            </div>
                        </div>

                        {/* 日历可视区域 */}
                        <div className="bg-slate-50 rounded-xl p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden border border-slate-100">
                            {/* 装饰背景 */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#56B949]/20 via-[#F0A32F]/20 to-[#30499B]/20"></div>

                            <div className="grid grid-cols-7 gap-2 sm:gap-4 w-full text-center">
                                {/* 星期头 */}
                                <div className="text-xs text-slate-400 pb-2">Mon</div>
                                <div className="text-xs text-slate-400 pb-2">Tue</div>
                                <div className="text-xs text-slate-400 pb-2">Wed</div>
                                <div className="text-xs text-slate-400 pb-2">Thu</div>
                                <div className="text-xs text-slate-400 pb-2">Fri</div>
                                <div className="text-xs text-slate-400 pb-2">Sat</div>
                                <div className="text-xs text-slate-400 pb-2">Sun</div>

                                {/* 日期格子 */}
                                {/* 1号：已签到 (小树苗) */}
                                <div className="aspect-square rounded-lg bg-white border border-[#56B949]/30 flex flex-col items-center justify-center relative group hover:shadow-md transition-shadow">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">1</span>
                                    <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" />
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">已签到 +5</div>
                                </div>

                                {/* 2号：已签到 */}
                                <div className="aspect-square rounded-lg bg-white border border-[#56B949]/30 flex flex-col items-center justify-center relative group hover:shadow-md transition-shadow">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">2</span>
                                    <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" style={{ animationDelay: '0.5s' }} />
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">已签到 +5</div>
                                </div>

                                {/* 3号：漏签 (枯萎) */}
                                <div className="aspect-square rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center relative group grayscale">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">3</span>
                                    <Leaf className="w-5 h-5 text-[#8b5a2b] rotate-45 opacity-60" />
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">漏签</div>
                                </div>

                                {/* 4号：漏签 */}
                                <div className="aspect-square rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center relative group grayscale">
                                    <span className="text-[10px] text-slate-400 absolute top-1 left-1">4</span>
                                    <Leaf className="w-5 h-5 text-[#8b5a2b] rotate-45 opacity-60" />
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">漏签</div>
                                </div>

                                {/* 5号：今日 (可签到或已签到) */}
                                <div
                                    onClick={handleCheckIn}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative cursor-pointer transition-all duration-300 ${todayCheckedIn
                                        ? 'bg-white border border-[#56B949]/30 hover:shadow-md'
                                        : 'bg-[#56B949]/5 border-2 border-[#56B949] hover:bg-[#56B949]/10 hover:scale-105'
                                        }`}
                                >
                                    <span className={`text-[10px] font-bold absolute top-1 left-1 ${todayCheckedIn ? 'text-slate-400' : 'text-[#56B949]'
                                        }`}>5</span>

                                    {todayCheckedIn ? (
                                        <Sprout className="w-5 h-5 text-[#56B949] animate-bounce" />
                                    ) : (
                                        <div className="text-xs font-bold text-[#56B949]">{t('calendar.signIn', '签到')}</div>
                                    )}

                                    {/* 签到成功动画 */}
                                    {showCheckInAnimation && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-[#56B949]/20 animate-ping"></div>
                                            <Sprout className="w-6 h-6 text-[#56B949] absolute animate-bounce" />
                                        </div>
                                    )}

                                    {/* 提示文字 */}
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">
                                        {todayCheckedIn ? t('calendar.signedIn', '已签到 +5') : t('calendar.clickToSignIn', '点击签到')}
                                    </div>
                                </div>

                                {/* 6号：未来 */}
                                <div className="aspect-square rounded-lg bg-white border border-transparent flex flex-col items-center justify-center text-slate-300">6</div>
                                {/* 7号：未来 */}
                                <div className="aspect-square rounded-lg bg-white border border-transparent flex flex-col items-center justify-center text-slate-300">7</div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-xs sm:text-sm text-slate-500 font-medium px-2">
                            <span>{t('calendar.signedDays', '已签到')} <b className="text-[#30499B]">{todayCheckedIn ? checkedInDays.length : checkedInDays.length}</b> {t('calendar.days', '天')}</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>{t('calendar.consecutiveDays', '连续签到')} <b className="text-[#30499B]">{todayCheckedIn ? checkedInDays.length : checkedInDays.length}</b> {t('calendar.days', '天')}</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span>{t('calendar.missedDays', '已漏签')} <b className="text-[#EE4035]">2</b> {t('calendar.days', '天')}</span>
                        </div>
                    </motion.section>

                    {/* 3. 每日任务 Daily Tasks */}
                    <motion.section
                        variants={cardEnter}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#30499B] font-serif">
                                {t('dailyTasks', '每日任务')}
                            </h3>
                            <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">
                                {t('tasksRemaining', '今日剩余')} 2
                            </span>
                        </div>

                        <div className="space-y-3 flex-1">
                            {/* Task 1 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-[#30499B]/5 transition-colors group border border-transparent hover:border-[#30499B]/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#30499B] shadow-sm">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#30499B]">{t('tasks.readArticle', '浏览"保护动物"文章')}</div>
                                        <div className="text-xs text-[#F0A32F] font-medium">{t('tasks.points10', '+10 积分')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-[#30499B] transition-colors">1/3</span>
                                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-600 rounded-lg hover:border-[#30499B] hover:text-[#30499B] transition-all">{t('tasks.goComplete', '去完成')}</button>
                                </div>
                            </div>

                            {/* Task 2 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl border border-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#56B949]/10 flex items-center justify-center text-[#56B949] shadow-sm">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 line-through">{t('tasks.publishArticle', '发布"垃圾分类"文章')}</div>
                                        <div className="text-xs text-slate-400 font-medium">{t('tasks.completed', '已完成')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-[#56B949]">2/2</span>
                                    <button className="px-3 py-1.5 bg-slate-100 text-xs font-medium text-slate-400 rounded-lg cursor-not-allowed">{t('tasks.completed', '已完成')}</button>
                                </div>
                            </div>

                            {/* Task 3 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-[#F0A32F]/5 rounded-xl border border-[#F0A32F]/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-[#F0A32F] flex items-center justify-center text-white shadow-sm">
                                        <Gift className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#30499B]">{t('tasks.commentArticle', '评论精选文章')}</div>
                                        <div className="text-xs text-[#F0A32F] font-medium">{t('tasks.rewardPending', '奖励待领取')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className="text-xs font-medium text-[#F0A32F]">5/5</span>
                                    <button className="px-3 py-1.5 bg-[#F0A32F] text-xs font-medium text-white rounded-lg shadow-md shadow-[#F0A32F]/30 hover:bg-[#d9901e] transition-all animate-pulse">{t('tasks.claim', '领取')}</button>
                                </div>
                            </div>

                            {/* Task 4 */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-[#30499B]/5 transition-colors group border border-transparent hover:border-[#30499B]/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#30499B] shadow-sm">
                                        <Share2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#30499B]">{t('tasks.shareToFriends', '分享给好友')}</div>
                                        <div className="text-xs text-[#F0A32F] font-medium">{t('tasks.points50', '+50 积分')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-[#30499B] transition-colors">0/1</span>
                                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-600 rounded-lg hover:border-[#30499B] hover:text-[#30499B] transition-all">{t('tasks.goComplete', '去完成')}</button>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>

                {/* 4. 每日问答 Daily Quiz */}
                <motion.section
                    variants={staggerItem}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-xl font-bold text-[#30499B] font-serif">
                            {t('dailyQuiz', '每日问答')}
                        </h3>

                        {/* 刷新按钮 */}
                        <button
                            onClick={handleRefreshQuiz}
                            disabled={refreshCount >= maxRefreshCount}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${refreshCount >= maxRefreshCount
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-[#30499B]/10 text-[#30499B] hover:bg-[#30499B]/20 hover:scale-110'
                                }`}
                            title={refreshCount >= maxRefreshCount ? '今日刷新次数已用完' : `刷新问答 (剩余${maxRefreshCount - refreshCount}次)`}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshCount >= maxRefreshCount ? '' : 'hover:rotate-180 transition-transform duration-300'}`} />
                        </button>

                        <span className="text-xs text-[#56B949] bg-[#56B949]/10 px-2 py-1 rounded-full font-medium">
                            {t('answerForPoints', '答对得积分')}
                        </span>

                        {/* 刷新次数提示 */}
                        <span className="text-[10px] text-slate-400 ml-auto">
                            {t('refreshLimit', '每日可刷新')}5{t('times', '次')} ({maxRefreshCount - refreshCount}{t('remaining', '次剩余')})
                        </span>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Quiz 1 */}
                        <motion.div
                            variants={staggerItem}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#56B949]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#56B949] text-white text-xs font-bold flex items-center justify-center">1</div>
                                    <span className="text-xs text-[#56B949] font-medium">+{getCurrentQuiz(1).points} 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">{getCurrentQuiz(1).question}</h4>
                                <div className="space-y-2 mb-4">
                                    {getCurrentQuiz(1).options.map((option: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuizAnswer(1, option.correct ? 'correct' : 'wrong')}
                                            className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[1].answered
                                                ? (quizStates[1].correct && option.correct ? 'bg-[#56B949] text-white' : 'bg-slate-100 text-slate-400')
                                                : 'bg-slate-50 hover:bg-slate-100'
                                                }`}
                                            disabled={quizStates[1].answered}
                                        >
                                            {option.text}
                                        </button>
                                    ))}
                                </div>
                                {quizStates[1].answered && (
                                    <div className={`text-xs font-medium ${quizStates[1].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[1].correct ? t('quiz.correctAnswer', '✓ 回答正确！') : t('quiz.wrongAnswer', '✗ 回答错误')}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quiz 2 */}
                        <motion.div
                            variants={staggerItem}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F0A32F]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#F0A32F] text-white text-xs font-bold flex items-center justify-center">2</div>
                                    <span className="text-xs text-[#F0A32F] font-medium">+{getCurrentQuiz(2).points} 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">{getCurrentQuiz(2).question}</h4>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder={t('quiz.enterNumber', '请输入数字')}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-[#F0A32F] focus:outline-none"
                                        onChange={(e) => handleFillBlank(2, e.target.value)}
                                        disabled={quizStates[2].answered}
                                    />
                                </div>
                                {quizStates[2].answered && (
                                    <div className={`text-xs font-medium ${quizStates[2].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[2].correct ? t('quiz.correctAnswer', '✓ 回答正确！') : `${t('quiz.wrongAnswerWithCorrect', '✗ 回答错误，正确答案是')}${getCurrentQuiz(2).answer}`}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quiz 3 */}
                        <motion.div
                            variants={staggerItem}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#30499B]/5 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#30499B] text-white text-xs font-bold flex items-center justify-center">3</div>
                                    <span className="text-xs text-[#30499B] font-medium">+{getCurrentQuiz(3).points} 积分</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#30499B] mb-3">{getCurrentQuiz(3).question}</h4>
                                <div className="space-y-2 mb-4">
                                    {getCurrentQuiz(3).options.map((option: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuizAnswer(3, option.correct ? 'correct' : 'wrong')}
                                            className={`w-full text-left p-2 rounded-lg text-xs transition-all ${quizStates[3].answered
                                                ? (quizStates[3].correct && option.correct ? 'bg-[#56B949] text-white' : 'bg-slate-100 text-slate-400')
                                                : 'bg-slate-50 hover:bg-slate-100'
                                                }`}
                                            disabled={quizStates[3].answered}
                                        >
                                            {option.text}
                                        </button>
                                    ))}
                                </div>
                                {quizStates[3].answered && (
                                    <div className={`text-xs font-medium ${quizStates[3].correct ? 'text-[#56B949]' : 'text-[#EE4035]'}`}>
                                        {quizStates[3].correct ? t('quiz.correctAnswer', '✓ 回答正确！') : t('quiz.wrongAnswer', '✗ 回答错误')}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.section>
            </motion.div>

            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </Layout>
    );
}

export default function PointsPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={
                <Layout>
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0A32F] to-[#d9901e] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-2xl mx-auto mb-4 animate-pulse">
                                YL
                            </div>
                            <p className="text-slate-600">加载中...</p>
                        </div>
                    </div>
                </Layout>
            }>
                <PointsPageContent />
            </Suspense>
        </ProtectedRoute>
    );
}