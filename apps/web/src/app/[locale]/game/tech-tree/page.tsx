'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import {
    ArrowLeft,
    Network,
    Lock,
    CheckCircle2,
    Zap,
    Building2,
    Users,
    Lightbulb,
    Leaf,
    Factory,
    Recycle,
    Wind,
    Sun,
    Droplet,
    TreePine,
    Home,
    Bus,
    Battery
} from 'lucide-react';

interface TechNode {
    id: string;
    name: string;
    category: 'industry' | 'social' | 'tech' | 'green';
    icon: React.ReactNode;
    description: string;
    cost: { industry?: number; population?: number; tech?: number };
    unlocked: boolean;
    prerequisites: string[];
    level: number;
}

export default function TechTreePage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useSafeTranslation('game');

    const [selectedNode, setSelectedNode] = useState<TechNode | null>(null);

    // 科技树数据
    const techTree: TechNode[] = [
        // 第一层（基础）
        {
            id: 'traditional-manufacturing',
            name: '传统制造业',
            category: 'industry',
            icon: <Factory className="w-6 h-6" />,
            description: '深圳龙华工厂区试点。基础产业发展。',
            cost: {},
            unlocked: true,
            prerequisites: [],
            level: 1
        },
        {
            id: 'community-covenant',
            name: '社区低碳公约',
            category: 'social',
            icon: <Home className="w-6 h-6" />,
            description: '深圳高桥社区版。建立基础减碳机制。',
            cost: { population: 2 },
            unlocked: true,
            prerequisites: [],
            level: 1
        },
        {
            id: 'mangrove-restoration',
            name: '红树林修复',
            category: 'green',
            icon: <TreePine className="w-6 h-6" />,
            description: '深圳湾生态修复。提升绿建度。',
            cost: { industry: 4 },
            unlocked: true,
            prerequisites: [],
            level: 1
        },

        // 第二层（进阶）
        {
            id: 'high-tech-industry',
            name: '高新产业集群',
            category: 'industry',
            icon: <Building2 className="w-6 h-6" />,
            description: '华为/腾讯低碳示范。低污染高产出。',
            cost: { industry: 8 },
            unlocked: false,
            prerequisites: ['traditional-manufacturing'],
            level: 2
        },
        {
            id: 'recycling-industry',
            name: '再生资源产业',
            category: 'industry',
            icon: <Recycle className="w-6 h-6" />,
            description: '平湖产业园。循环经济模式。',
            cost: { industry: 10, tech: 2 },
            unlocked: false,
            prerequisites: ['traditional-manufacturing'],
            level: 2
        },
        {
            id: 'shared-transport',
            name: '共享出行推广',
            category: 'social',
            icon: <Bus className="w-6 h-6" />,
            description: '减少碳排放，提升市民满意度。',
            cost: { population: 3, industry: 5 },
            unlocked: false,
            prerequisites: ['community-covenant'],
            level: 2
        },
        {
            id: 'green-roof',
            name: '天台绿化倡议',
            category: 'green',
            icon: <Leaf className="w-6 h-6" />,
            description: '城市绿化升级。降低建筑能耗。',
            cost: { industry: 5 },
            unlocked: false,
            prerequisites: ['mangrove-restoration'],
            level: 2
        },

        // 第三层（高级）
        {
            id: 'solar-power',
            name: '光伏电站',
            category: 'tech',
            icon: <Sun className="w-6 h-6" />,
            description: '深圳能源清洁能源项目。',
            cost: { industry: 12, tech: 4 },
            unlocked: false,
            prerequisites: ['high-tech-industry'],
            level: 3
        },
        {
            id: 'wind-power',
            name: '海上风电',
            category: 'tech',
            icon: <Wind className="w-6 h-6" />,
            description: '深圳湾海上风力发电。',
            cost: { industry: 15, tech: 5 },
            unlocked: false,
            prerequisites: ['high-tech-industry'],
            level: 3
        },
        {
            id: 'smart-grid',
            name: '智能电网',
            category: 'tech',
            icon: <Zap className="w-6 h-6" />,
            description: '华为技术。优化能源分配。',
            cost: { industry: 18, tech: 6 },
            unlocked: false,
            prerequisites: ['solar-power', 'wind-power'],
            level: 3
        },
        {
            id: 'carbon-capture',
            name: '碳捕捉技术',
            category: 'tech',
            icon: <Battery className="w-6 h-6" />,
            description: '南科大研发。强效减碳。',
            cost: { industry: 20, tech: 8 },
            unlocked: false,
            prerequisites: ['smart-grid'],
            level: 3
        },
        {
            id: 'sponge-city',
            name: '海绵城市',
            category: 'green',
            icon: <Droplet className="w-6 h-6" />,
            description: '城市水循环系统。抗灾能力提升。',
            cost: { industry: 15, tech: 3 },
            unlocked: false,
            prerequisites: ['green-roof', 'shared-transport'],
            level: 3
        }
    ];

    const handleBack = () => {
        router.push(`/${locale}/game/play`);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'industry': return '#30499b';
            case 'social': return '#f0a32f';
            case 'tech': return '#00C087';
            case 'green': return '#56b949';
            default: return '#64748b';
        }
    };

    const getCategoryBgColor = (category: string) => {
        switch (category) {
            case 'industry': return 'bg-[#30499b]/10';
            case 'social': return 'bg-[#f0a32f]/10';
            case 'tech': return 'bg-[#00C087]/10';
            case 'green': return 'bg-[#56b949]/10';
            default: return 'bg-slate-100';
        }
    };

    const getCategoryName = (category: string) => {
        switch (category) {
            case 'industry': return '产业类';
            case 'social': return '社会类';
            case 'tech': return '科创类';
            case 'green': return '绿建类';
            default: return '未知';
        }
    };

    // 按层级分组
    const nodesByLevel = techTree.reduce((acc, node) => {
        if (!acc[node.level]) acc[node.level] = [];
        acc[node.level].push(node);
        return acc;
    }, {} as Record<number, TechNode[]>);

    return (
        <div className="bg-[#FAFAF9] min-h-screen flex flex-col text-slate-600 font-sans">
            {/* 顶部导航栏 */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-slate-400 hover:text-[#30499b] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00C087]/10 rounded-lg">
                            <Network className="w-5 h-5 text-[#00C087]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                                科技树
                            </h1>
                            <p className="text-xs text-slate-500">技术发展路径图</p>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">TECH TREE v1.0</div>
            </header>

            {/* 主内容区 */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* 图例 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4">技术分类</h2>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-[#30499b]"></div>
                                <span className="text-xs text-slate-600">产业类</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-[#f0a32f]"></div>
                                <span className="text-xs text-slate-600">社会类</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-[#00C087]"></div>
                                <span className="text-xs text-slate-600">科创类</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-[#56b949]"></div>
                                <span className="text-xs text-slate-600">绿建类</span>
                            </div>
                        </div>
                    </div>

                    {/* 科技树 */}
                    <div className="space-y-8">
                        {Object.keys(nodesByLevel).sort().map((level) => (
                            <div key={level}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-sm font-semibold text-slate-800">
                                        第 {level} 层
                                    </div>
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {nodesByLevel[parseInt(level)].map((node) => (
                                        <TechNodeCard
                                            key={node.id}
                                            node={node}
                                            selected={selectedNode?.id === node.id}
                                            onClick={() => setSelectedNode(node)}
                                            categoryColor={getCategoryColor(node.category)}
                                            categoryBgColor={getCategoryBgColor(node.category)}
                                            categoryName={getCategoryName(node.category)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 详情面板 */}
                    {selectedNode && (
                        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-xl ${getCategoryBgColor(selectedNode.category)}`}
                                        style={{ color: getCategoryColor(selectedNode.category) }}
                                    >
                                        {selectedNode.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{selectedNode.name}</h3>
                                        <span className="text-xs text-slate-500">{getCategoryName(selectedNode.category)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">{selectedNode.description}</p>
                            {Object.keys(selectedNode.cost).length > 0 && (
                                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                    <div className="text-xs font-semibold text-slate-700 mb-2">解锁成本</div>
                                    <div className="flex gap-3 text-xs">
                                        {selectedNode.cost.industry && (
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3 text-[#30499b]" />
                                                <span>{selectedNode.cost.industry}</span>
                                            </div>
                                        )}
                                        {selectedNode.cost.population && (
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3 text-[#f0a32f]" />
                                                <span>{selectedNode.cost.population}</span>
                                            </div>
                                        )}
                                        {selectedNode.cost.tech && (
                                            <div className="flex items-center gap-1">
                                                <Lightbulb className="w-3 h-3 text-[#00C087]" />
                                                <span>{selectedNode.cost.tech}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className={`px-4 py-2 rounded-lg text-center text-sm font-semibold ${selectedNode.unlocked
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                {selectedNode.unlocked ? '已解锁' : '未解锁'}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// 科技节点卡片组件
function TechNodeCard({
    node,
    selected,
    onClick,
    categoryColor,
    categoryBgColor,
    categoryName
}: {
    node: TechNode;
    selected: boolean;
    onClick: () => void;
    categoryColor: string;
    categoryBgColor: string;
    categoryName: string;
}) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-4 border-2 shadow-sm cursor-pointer transition-all ${selected
                    ? 'border-[#30499b] ring-2 ring-[#30499b]/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                } ${!node.unlocked && 'opacity-60'}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className={`p-2 rounded-lg ${categoryBgColor}`}
                    style={{ color: categoryColor }}
                >
                    {node.icon}
                </div>
                <div>
                    {node.unlocked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                        <Lock className="w-5 h-5 text-slate-300" />
                    )}
                </div>
            </div>
            <h3 className="font-semibold text-sm text-slate-800 mb-1">{node.name}</h3>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{node.description}</p>
            <div className="flex items-center justify-between">
                <span
                    className="text-[10px] font-semibold px-2 py-1 rounded"
                    style={{
                        color: categoryColor,
                        backgroundColor: `${categoryColor}1a`
                    }}
                >
                    {categoryName}
                </span>
                {Object.keys(node.cost).length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                        {node.cost.industry && <span>💰{node.cost.industry}</span>}
                        {node.cost.population && <span>👥{node.cost.population}</span>}
                        {node.cost.tech && <span>💡{node.cost.tech}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
